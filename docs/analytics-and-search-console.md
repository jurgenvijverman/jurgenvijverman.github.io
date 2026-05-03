# Analytics & Google Search Console — setup guide

This is the user-side setup for Phase 5.4 (Plausible analytics) and Phase 5.5 (Google Search Console). Both require steps you have to do in browser dashboards — they can't be wired up purely from the repo. This doc walks through both, in the order you should do them.

---

## 1 — Plausible Analytics (already wired in code)

The `<script>` tag for `plausible.io/js/script.outbound-links.tagged-events.js` is already present in `<head>` on all 36 HTML pages. Custom events for `Lead`, `Phone Click`, and `Email Click` are wired in `js/main.js`.

What's left is the account side:

### 1.1 — Create the Plausible account

1. Go to <https://plausible.io/>.
2. **Sign up** (the lowest plan, "Growth", is ~€9/month for up to 10k pageviews — more than enough for AVYclima).
3. After signup you'll be prompted to **add your first site**. Use the domain exactly as it appears in the script tag:

       avyclima.be

   (No `https://`, no `www.`, no trailing slash.)
4. Plausible will show you a snippet to paste in your `<head>`. **Skip that step** — it's already in place. Click "Next".
5. Plausible should detect events within ~30 minutes of the first real visitor.

### 1.2 — Set up custom event goals

In the Plausible dashboard for `avyclima.be`, go to **Site Settings → Goals** and add three custom event goals:

| Goal name | Trigger |
|---|---|
| `Lead` | Confirmed contact-form submission (fires when visitor lands on `?verzonden=1`) |
| `Phone Click` | Click on any `tel:` link (header, footer, contact page) |
| `Email Click` | Click on any `mailto:info@avyclima.be` link |

These will appear in the dashboard under "Goal Conversions" once they start firing.

### 1.3 — Optional: Outbound link tracking

The script we use already tracks outbound link clicks automatically (anything that links to a different domain than `avyclima.be`). Useful for spotting which external resources visitors click — e.g. if you ever link out to Daikin product pages, Mijn Verbouwpremie, etc.

### 1.4 — Optional: invite Jurgen as the only user

In **Site Settings → Visibility**, the dashboard is private by default. Invite anyone who needs read access.

---

## 2 — Google Search Console (manual user setup)

GSC is the read-only counterpart to Plausible — it tells you what queries Google is showing your site for, how often you're appearing in results, and whether there are crawl errors.

### 2.1 — Verify the property

1. Go to <https://search.google.com/search-console/>.
2. Sign in with the Google account you want to own this property (use a long-lived account — ideally not a personal Gmail you might lose access to).
3. Click **Add property** → choose **URL prefix** (not Domain) → enter:

       https://avyclima.be/

4. GSC will give you several verification methods. The easiest **for our static-HTML site** is the **HTML tag method** (Method: "HTML tag"):
   - GSC shows you a `<meta name="google-site-verification" content="…" />` tag.
   - Add it to **`index.html` only**, in the `<head>`, ideally just after `<meta name="theme-color">`.
   - Save and deploy. Within a few minutes, click **Verify** in GSC.

   Alternative: the DNS TXT-record method works too if you have access to the domain's DNS settings, and it survives any future move off this hosting setup.

### 2.2 — Submit the sitemap

1. In the verified GSC property, go to **Sitemaps** in the left sidebar.
2. Enter `sitemap.xml` (just the filename — GSC prepends the domain).
3. Submit. Within a few hours, GSC should report **Status: Success** and start counting indexed URLs.

Our sitemap currently lists 36 URLs. The rebuild's full set of pages will all be discoverable from there.

### 2.3 — Set international targeting

1. In GSC, go to **Settings → International targeting** (older UI) or just rely on the `<html lang="nl-BE">` and `<link rel="alternate" hreflang="nl-BE">` tags that are already on every page. GSC reads those automatically.

If you want to be explicit, the Settings UI lets you set "Country: Belgium". Optional but harmless.

### 2.4 — Verify rich results

In GSC's **Enhancements** section, check that the structured data we ship is being read:
- **FAQ** snippets (FAQPage schema)
- **Breadcrumbs**
- **Local business** info (HVACBusiness / LocalBusiness)
- **Organization**

Each of these gets a per-page report. Fix any errors GSC flags.

For ad-hoc validation of a single page, use Google's [Rich Results Test](https://search.google.com/test/rich-results) — paste a URL, see what schema Google reads.

### 2.5 — Track queries that matter

After GSC has been collecting data for a week or two, the **Performance → Search results** view will show what queries are showing your site in Google. Filter by query and look specifically for:

- `warmtepomp installateur Aalst`
- `warmtepomp Denderleeuw`
- `warmtepomp Ninove`
- `airco installateur Aalst`
- `airco Denderleeuw`
- `Daikin installateur Aalst`
- `Daikin warmtepomp Vlaanderen`
- `HVAC Denderleeuw`

These are the keywords from the implementation plan. If you're appearing for them, ranking is what matters next; if not, you may need more local content / link building.

---

## 3 — Doing both right after launch

Order:
1. Push the current site to production with the Plausible script in place.
2. Sign up for Plausible, add the `avyclima.be` site, configure the 3 goal events.
3. Verify GSC via meta tag.
4. Submit the sitemap.
5. Wait ~1 week for both tools to start collecting useful data.
6. Then look at: which pages get traffic (Plausible), what queries land them (GSC), and which CTAs/forms convert (Plausible goals).

If you decide later that Plausible isn't worth the €9/month, the script can be removed in one site-wide edit and replaced with anything else (or nothing). The custom events in `js/main.js` are gracefully no-op if `plausible` isn't defined.
