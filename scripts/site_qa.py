#!/usr/bin/env python3
"""
site_qa.py — site-wide QA for the avyclima.be static rebuild.

Runs all of the checks listed in IMPLEMENTATION_PLAN.md Phase 4.6:

  1. Typo blacklist            — known-bad words must not resurface
  2. Risky-claim blacklist     — chromatic sales claims (X-Y% besparing, gehalveerd, ...)
  3. Informal-pronoun blacklist — je / jij / jouw / jullie in customer-facing prose
  4. Single H1 per page        — every page exactly one <h1>
  5. <title> + meta description — present, non-empty
  6. theme-color meta          — present, equals the brand value
  7. Canonical drift           — every page's canonical matches its filename
  8. Broken internal links     — every relative href resolves
  9. Anchor target check       — every href="#id" has a matching id= on the same page
 10. JSON-LD validity          — every <script type="application/ld+json"> parses
 11. Sitemap drift             — every <loc> exists, every HTML file is in the sitemap
 12. Image alt-text presence   — every <img> has a non-empty alt= attribute
 13. Required <link rel="icon">/manifest tags

Exit code:
  0 = all checks passed
  1 = at least one check failed (CI-friendly)

Usage:
  python3 scripts/site_qa.py

All checks are pure-Python with stdlib only (re, json, glob, os, sys, html.parser).
No third-party deps so this runs anywhere with Python 3.8+.
"""

from __future__ import annotations

import glob
import html.parser
import json
import os
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

# ---------------------------------------------------------------------------
# Config — adjust as the site evolves
# ---------------------------------------------------------------------------

SITE_ROOT = Path(__file__).resolve().parent.parent
SITE_URL = "https://avyclima.be"
THEME_COLOR = "#3a3a3a"

TYPO_BLACKLIST = [
    "komfort", "komfortabel",
    "Laat ons u adviseert",
    "warmtepomp systemen",
    "vrijblijvende advies",
    "Onze werkgebied",
    "uitgebreeid",
    "geluiddoos",
    "slegers",
    "huidiige",
    "elektrarisch",
    "stille bedrijving",
    "geextraheerd",
    "daglijkse",
    "uit elkaar gaat praten",
]

RISKY_CLAIM_PATTERNS = [
    (r"\d+\s*[-–]\s*\d+\s*%\s*besparing", "X-Y% besparing"),
    (r"\bbespaar\b\s+\d+", "bespaar N"),
    (r"\bgehalveerd\b", "gehalveerd"),
    (r"\btot drie keer zuiniger\b", "tot drie keer zuiniger"),
    (r"-1[05]\s*°?\s*C", "absolute -10/-15 C claim"),
    (r"tot 50% lagere", "tot 50% lagere"),
]

# ---------------------------------------------------------------------------
# Phase 6 additions — quality-review safeguards
# ---------------------------------------------------------------------------

# Founding-date / fake-numbers / contradicts-2024-founding-story
# AVYclima was founded in 2024. Any of these patterns means a stale claim.
FOUNDING_DATE_BLACKLIST = [
    "Sinds 2013", "In 2013",
    '"foundingDate": "2013"',
    "3.500+", "3500+",
    "1.250+", "1250+",
    "vijf gekwalificeerde", "vijf HVAC-professionals", "vijf professionals",
    "100 jaren HVAC", "honderd jaren HVAC",
    "meer dan tien jaar", "meer dan 10 jaar",
    "honderden airco's", "honderden installaties",
]

# Unverified certification names — none are documented (per Phase 6 decision).
# Replace with generic "geschoolde HVAC-specialisten" wording.
UNVERIFIED_CERT_BLACKLIST = [
    "Daikin D1+ Installer",
    "Koeltechnisch Bekwaamheidscertificaat",
    "VEA Erkenning", "VEA erkenning", "VEA-erkenning",
]

# Style / hyphenation / language-quality patterns from review section 3.
# Catch sloppy Dutch the moment it slips back in.
STYLE_BLACKLIST = [
    (r"\bHQ\b",                   "HQ → thuisbasis"),
    (r"\bwarranty\b",             "warranty → garantie"),
    (r"state-of-the-art",         "state-of-the-art → actuele/moderne"),
    (r"\bKMO['']?s\b",            "KMO's → kmo's"),
    (r"\bDaikin Specialist\b",    "Daikin Specialist → Daikin-specialist"),
    (r"\bDaikin airco\b",         "Daikin airco → Daikin-airco (hyphen)"),
    (r"\bDaikin warmtepomp\b",    "Daikin warmtepomp → Daikin-warmtepomp (hyphen)"),
    (r"\bairco installatie\b",    "airco installatie → airco-installatie"),
    (r"\bwarmtepomp installatie\b", "warmtepomp installatie → warmtepompinstallatie"),
    (r"\bsplit airco\b",          "split airco → split-airco"),
    (r"\bmultisplit airco\b",     "multisplit airco → multisplit-airco"),
    (r"\blucht/lucht\b",          "lucht/lucht → lucht-lucht"),
    (r"\blucht/water\b",          "lucht/water → lucht-water"),
    (r"\bOpeningstijden\b",       "Openingstijden → Openingsuren (NL-BE)"),
]

# Named-testimonial guard: any <cite> containing a "Name X." attribution
# (where X is a single capital letter followed by a period). Real future
# testimonials with full attribution should add a documented waiver.
NAMED_TESTIMONIAL_RE = re.compile(
    r'<cite[^>]*>[^<]*\b[A-Z][a-zëéè]+\s+[A-Z]\.[^<]*</cite>'
)

# Informal pronouns are checked outside <script> blocks only
INFORMAL_PRONOUN_RE = re.compile(r"\b(je|jij|jouw|jullie)\b")

# Files to ignore for sitemap-presence (e.g. error pages, drafts)
SITEMAP_EXCLUDE = set()  # empty for now

# ---------------------------------------------------------------------------
# Content-debt waivers — known issues we are NOT failing CI on.
# Each entry must include a reason so we don't lose track of why.
#
# To clear a waiver: rewrite the file so the check passes, then remove it here.
# ---------------------------------------------------------------------------
INFORMAL_PRONOUN_WAIVERS = {
    # Entire blog post is written in informal "je"/"jouw" voice. Needs a full
    # rewrite (out of scope for the Phase 4 tooling work — content debt).
    "blog/airco-als-verwarming.html": "blog post written entirely in 'je' voice; full rewrite needed",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def all_html_files() -> list[Path]:
    """Return every .html file in the site root, blog/, portfolio/."""
    paths = []
    for pat in ["*.html", "blog/*.html", "portfolio/*.html"]:
        paths.extend(SITE_ROOT.glob(pat))
    return sorted(paths)


def relative_html_path(p: Path) -> str:
    """Return the relative path used in the sitemap, e.g. 'blog/foo.html'."""
    return str(p.relative_to(SITE_ROOT)).replace(os.sep, "/")


def strip_scripts_and_styles(html: str) -> str:
    """Remove <script>…</script> and <style>…</style> blocks; useful when
    auditing prose without false positives from JSON-LD or CSS."""
    html = re.sub(r"<script[^>]*>.*?</script>", " ", html, flags=re.S | re.I)
    html = re.sub(r"<style[^>]*>.*?</style>", " ", html, flags=re.S | re.I)
    return html


def text_only(html: str) -> str:
    """Return visible text content from an HTML fragment (best-effort)."""
    html = strip_scripts_and_styles(html)
    html = re.sub(r"<[^>]+>", " ", html)
    return html


# ---------------------------------------------------------------------------
# Check classes
# ---------------------------------------------------------------------------

class Result:
    def __init__(self):
        self.failures: list[str] = []
        self.passed: list[str] = []

    def fail(self, msg: str) -> None:
        self.failures.append(msg)

    def ok(self, msg: str) -> None:
        self.passed.append(msg)

    @property
    def has_failures(self) -> bool:
        return bool(self.failures)


def check_founding_date_claims(files: list[Path], r: Result) -> None:
    hits: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        for term in FOUNDING_DATE_BLACKLIST:
            if term in s:
                hits.append(f"{relative_html_path(f)}: '{term}'")
    if hits:
        r.fail(f"Stale founding-date / fake-numbers claims ({len(hits)}):")
        for h in hits:
            r.fail(f"  {h}")
    else:
        r.ok(f"Founding-date / fake-numbers blacklist clean ({len(FOUNDING_DATE_BLACKLIST)} terms).")


def check_unverified_certs(files: list[Path], r: Result) -> None:
    hits: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        for term in UNVERIFIED_CERT_BLACKLIST:
            if term in s:
                hits.append(f"{relative_html_path(f)}: '{term}'")
    if hits:
        r.fail(f"Unverified certification names ({len(hits)}):")
        for h in hits:
            r.fail(f"  {h}")
    else:
        r.ok("No unverified certification names (D1+ / KVB / VEA).")


def check_style(files: list[Path], r: Result) -> None:
    hits: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        for pattern, label in STYLE_BLACKLIST:
            for m in re.finditer(pattern, s):
                hits.append(f"{relative_html_path(f)}: [{label}] at offset {m.start()}")
    if hits:
        r.fail(f"Dutch style / hyphenation violations ({len(hits)}):")
        for h in hits[:40]:
            r.fail(f"  {h}")
        if len(hits) > 40:
            r.fail(f"  … and {len(hits)-40} more")
    else:
        r.ok(f"Dutch style + hyphenation clean ({len(STYLE_BLACKLIST)} patterns).")


def check_dark_footer_links(files: list[Path], r: Result) -> None:
    """Detect <a> tags inside .footer-about <p> blocks. Without an explicit
    color override, those links inherit the global link color (#3a3a3a), which
    matches the footer background and makes the link text invisible.

    css/style.css now has a `.footer-about p a` rule overriding to --accent;
    this check is a belt-and-braces defense in case that rule gets removed.
    """
    hits: list[str] = []
    footer_about_re = re.compile(r'<div class="footer-about">.*?</div>', re.S)
    link_in_p_re = re.compile(r'<p\b[^>]*>.*?<a\b.*?</a>.*?</p>', re.S)
    for f in files:
        s = f.read_text(encoding="utf-8")
        for fb in footer_about_re.finditer(s):
            for lp in link_in_p_re.finditer(fb.group(0)):
                hits.append(f"{relative_html_path(f)}: <a> inside footer-about <p>")
                break  # one report per file is enough
            else:
                continue
            break
    if hits:
        r.fail(
            f"Links inside footer-about <p> ({len(hits)} files) — these inherit the global "
            f"link color and become invisible against the dark footer. "
            f"Either unwrap them or rely on the .footer-about p a CSS rule:"
        )
        for h in hits:
            r.fail(f"  {h}")
    else:
        r.ok("No bare <a> inside footer-about <p> (no dark-on-dark link risk).")


def check_named_testimonials(files: list[Path], r: Result) -> None:
    hits: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        for m in NAMED_TESTIMONIAL_RE.finditer(s):
            hits.append(f"{relative_html_path(f)}: {m.group(0)[:120]}")
    if hits:
        r.fail(f"Named-testimonial pattern (Name X. attribution) found ({len(hits)}):")
        for h in hits:
            r.fail(f"  {h}")
    else:
        r.ok("No named-testimonial attributions.")


def check_typos(files: list[Path], r: Result) -> None:
    hits: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        for term in TYPO_BLACKLIST:
            if term in s:
                hits.append(f"{relative_html_path(f)}: '{term}'")
    if hits:
        r.fail(f"Typos resurfaced ({len(hits)}):")
        for h in hits:
            r.fail(f"  {h}")
    else:
        r.ok(f"Typo blacklist clean ({len(TYPO_BLACKLIST)} terms checked).")


def check_risky_claims(files: list[Path], r: Result) -> None:
    hits: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        text = text_only(s)
        for pattern, label in RISKY_CLAIM_PATTERNS:
            for m in re.finditer(pattern, text, re.I):
                ctx = text[max(0, m.start()-40):m.end()+40].strip()
                ctx = " ".join(ctx.split())
                hits.append(f"{relative_html_path(f)} [{label}] …{ctx}…")
    if hits:
        r.fail(f"Risky chromatic claims found ({len(hits)}):")
        for h in hits:
            r.fail(f"  {h}")
    else:
        r.ok("No risky sales claims (X-Y% besparing, gehalveerd, etc.).")


def check_informal_pronouns(files: list[Path], r: Result) -> None:
    hits: dict[str, list[str]] = defaultdict(list)
    waived: dict[str, int] = {}
    for f in files:
        s = f.read_text(encoding="utf-8")
        text = text_only(s)
        rel = relative_html_path(f)
        matches = list(INFORMAL_PRONOUN_RE.finditer(text))
        if not matches:
            continue
        if rel in INFORMAL_PRONOUN_WAIVERS:
            waived[rel] = len(matches)
            continue
        for m in matches:
            ctx = text[max(0, m.start()-40):m.end()+40].strip()
            ctx = " ".join(ctx.split())
            hits[rel].append(f"'{m.group(0)}' in: …{ctx}…")
    if waived:
        for f, n in waived.items():
            reason = INFORMAL_PRONOUN_WAIVERS[f]
            r.ok(f"WAIVED informal pronouns in {f} ({n}× — {reason})")
    if hits:
        total = sum(len(v) for v in hits.values())
        r.fail(f"Informal pronouns in customer-facing prose ({total}):")
        for f, instances in hits.items():
            for inst in instances:
                r.fail(f"  {f}: {inst}")
    elif not waived:
        r.ok("No informal pronouns (je / jij / jouw / jullie) in prose.")


def check_single_h1(files: list[Path], r: Result) -> None:
    bad: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        n = len(re.findall(r"<h1[\s>]", s))
        if n != 1:
            bad.append(f"{relative_html_path(f)}: {n} <h1> tags")
    if bad:
        r.fail(f"Pages with H1-count != 1 ({len(bad)}):")
        for b in bad:
            r.fail(f"  {b}")
    else:
        r.ok(f"All {len(files)} pages have exactly one <h1>.")


def check_titles_and_descriptions(files: list[Path], r: Result) -> None:
    no_title, no_desc, dupe_titles = [], [], []
    titles: dict[str, list[str]] = defaultdict(list)
    for f in files:
        s = f.read_text(encoding="utf-8")
        tm = re.search(r"<title>([^<]*)</title>", s)
        if not tm or not tm.group(1).strip():
            no_title.append(relative_html_path(f))
        else:
            titles[tm.group(1).strip()].append(relative_html_path(f))
        dm = re.search(r'<meta\s+name="description"\s+content="([^"]*)"', s)
        if not dm or not dm.group(1).strip():
            no_desc.append(relative_html_path(f))
    for t, paths in titles.items():
        if len(paths) > 1:
            dupe_titles.append((t, paths))
    if no_title:
        r.fail(f"Missing <title>: {no_title}")
    if no_desc:
        r.fail(f"Missing meta description: {no_desc}")
    if dupe_titles:
        r.fail(f"Duplicate <title> across pages ({len(dupe_titles)}):")
        for t, ps in dupe_titles:
            r.fail(f"  '{t}' shared by: {ps}")
    if not (no_title or no_desc or dupe_titles):
        r.ok(f"All {len(files)} pages have unique <title> + meta description.")


def check_theme_color(files: list[Path], r: Result) -> None:
    bad: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        m = re.search(r'<meta\s+name="theme-color"\s+content="([^"]+)"', s)
        if not m:
            bad.append(f"{relative_html_path(f)}: missing theme-color")
        elif m.group(1).lower() != THEME_COLOR.lower():
            bad.append(f"{relative_html_path(f)}: theme-color={m.group(1)} (expected {THEME_COLOR})")
    if bad:
        r.fail(f"theme-color drift ({len(bad)}):")
        for b in bad:
            r.fail(f"  {b}")
    else:
        r.ok(f"All {len(files)} pages have theme-color={THEME_COLOR}.")


def check_canonicals(files: list[Path], r: Result) -> None:
    bad: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        m = re.search(r'<link\s+rel="canonical"\s+href="([^"]+)"', s)
        rel = relative_html_path(f)
        expected = f"{SITE_URL}/{rel}" if rel != "index.html" else f"{SITE_URL}/"
        if not m:
            bad.append(f"{rel}: missing canonical")
        elif m.group(1) != expected:
            bad.append(f"{rel}: canonical={m.group(1)} (expected {expected})")
    if bad:
        r.fail(f"Canonical drift ({len(bad)}):")
        for b in bad:
            r.fail(f"  {b}")
    else:
        r.ok(f"All {len(files)} canonicals match their filename.")


def check_broken_links(files: list[Path], r: Result) -> None:
    """Check that every relative href= resolves to a real file."""
    bad: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        for m in re.finditer(r'href="([^"#?]+)(?:[?#][^"]*)?"', s):
            href = m.group(1)
            if href.startswith(("http://", "https://", "mailto:", "tel:", "#", "/")):
                continue  # external, fragment, or root-absolute (handled separately)
            target = (f.parent / href).resolve()
            if not target.exists():
                bad.append(f"{relative_html_path(f)} -> {href} (resolves to {target})")
    if bad:
        r.fail(f"Broken internal links ({len(bad)}):")
        for b in bad[:30]:
            r.fail(f"  {b}")
        if len(bad) > 30:
            r.fail(f"  … and {len(bad)-30} more")
    else:
        r.ok("All relative internal links resolve.")


def check_anchor_targets(files: list[Path], r: Result) -> None:
    """Every href="#id" must have a matching id= on the same page."""
    bad: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        ids = set(re.findall(r'\bid="([^"]+)"', s))
        for m in re.finditer(r'href="#([^"]+)"', s):
            anchor = m.group(1)
            if anchor not in ids:
                bad.append(f"{relative_html_path(f)} -> #{anchor} (no matching id=)")
    if bad:
        r.fail(f"Broken anchor targets ({len(bad)}):")
        for b in bad[:30]:
            r.fail(f"  {b}")
    else:
        r.ok("All on-page anchors resolve to existing IDs.")


def check_jsonld(files: list[Path], r: Result) -> None:
    bad: list[str] = []
    total = 0
    for f in files:
        s = f.read_text(encoding="utf-8")
        for i, blk in enumerate(re.findall(r'<script\s+type="application/ld\+json"\s*>(.*?)</script>',
                                            s, re.S)):
            total += 1
            try:
                json.loads(blk)
            except json.JSONDecodeError as e:
                bad.append(f"{relative_html_path(f)} block#{i}: {e}")
    if bad:
        r.fail(f"Invalid JSON-LD ({len(bad)}/{total}):")
        for b in bad:
            r.fail(f"  {b}")
    else:
        r.ok(f"All {total} JSON-LD blocks parse cleanly.")


def check_sitemap(files: list[Path], r: Result) -> None:
    sm = SITE_ROOT / "sitemap.xml"
    if not sm.exists():
        r.fail("sitemap.xml missing!")
        return
    s = sm.read_text(encoding="utf-8")
    locs = re.findall(r"<loc>([^<]+)</loc>", s)
    sitemap_files: set[str] = set()
    for loc in locs:
        if not loc.startswith(SITE_URL):
            continue
        rel = loc[len(SITE_URL) + 1:] or "index.html"
        sitemap_files.add(rel)
    real_files = {relative_html_path(p) for p in files} - SITEMAP_EXCLUDE
    missing = sitemap_files - real_files
    not_listed = real_files - sitemap_files
    if missing:
        r.fail(f"Sitemap points to non-existent files ({len(missing)}):")
        for m in sorted(missing):
            r.fail(f"  {m}")
    if not_listed:
        r.fail(f"HTML files NOT in sitemap ({len(not_listed)}):")
        for m in sorted(not_listed):
            r.fail(f"  {m}")
    if not (missing or not_listed):
        r.ok(f"sitemap.xml in sync with {len(real_files)} HTML files.")


def check_img_alt(files: list[Path], r: Result) -> None:
    missing, empty = [], []
    total = 0
    for f in files:
        s = f.read_text(encoding="utf-8")
        for m in re.finditer(r"<img\s+([^>]+?)>", s):
            total += 1
            attrs = m.group(1)
            am = re.search(r'\balt\s*=\s*"([^"]*)"', attrs)
            if not am:
                missing.append(f"{relative_html_path(f)}: <img {attrs[:80]}…>")
            elif not am.group(1).strip():
                empty.append(f"{relative_html_path(f)}: <img {attrs[:80]}…>")
    if missing:
        r.fail(f"<img> tags missing alt= ({len(missing)}):")
        for x in missing:
            r.fail(f"  {x}")
    if empty:
        r.fail(f"<img> tags with empty alt= ({len(empty)}):")
        for x in empty:
            r.fail(f"  {x}")
    if not (missing or empty):
        r.ok(f"All {total} <img> tags have non-empty alt text.")


def check_favicon_block(files: list[Path], r: Result) -> None:
    expected = ['rel="icon" type="image/x-icon" href="/favicon.ico"',
                'sizes="32x32" href="/images/favicon-32x32.png"',
                'sizes="180x180" href="/images/apple-touch-icon.png"',
                'rel="manifest" href="/site.webmanifest"']
    bad: list[str] = []
    for f in files:
        s = f.read_text(encoding="utf-8")
        for needle in expected:
            if needle not in s:
                bad.append(f"{relative_html_path(f)}: missing `{needle}`")
                break
    if bad:
        r.fail(f"Favicon/manifest block incomplete ({len(bad)}):")
        for b in bad[:20]:
            r.fail(f"  {b}")
    else:
        r.ok(f"Favicon + manifest tags present on all {len(files)} pages.")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> int:
    files = all_html_files()
    if not files:
        print("ERROR: no HTML files found. Are you running from the repo root?")
        return 2

    r = Result()
    print(f"Running site QA on {len(files)} HTML files…\n")

    check_typos(files, r)
    check_risky_claims(files, r)
    check_founding_date_claims(files, r)
    check_unverified_certs(files, r)
    check_style(files, r)
    check_named_testimonials(files, r)
    check_dark_footer_links(files, r)
    check_informal_pronouns(files, r)
    check_single_h1(files, r)
    check_titles_and_descriptions(files, r)
    check_theme_color(files, r)
    check_canonicals(files, r)
    check_broken_links(files, r)
    check_anchor_targets(files, r)
    check_jsonld(files, r)
    check_sitemap(files, r)
    check_img_alt(files, r)
    check_favicon_block(files, r)

    print("=" * 60)
    if r.passed:
        print("PASS:")
        for p in r.passed:
            print(f"  ✓ {p}")
    if r.has_failures:
        print("\nFAIL:")
        for fmsg in r.failures:
            print(f"  {fmsg}")
        print(f"\n→ {len(r.failures)} failure line(s).")
        return 1
    print(f"\nAll {len(r.passed)} checks passed on {len(files)} files.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
