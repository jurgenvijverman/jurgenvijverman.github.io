/* ============================================================================
   AVYclima — Calculator Terugverdientijd Warmtepomp
   Glue-module (v1)
   ----------------------------------------------------------------------------
   - Laadt het tariefblad
   - Leest input uit het formulier (Snel-modus, 5 velden + scenario-slider)
   - Roept de rekenkern aan via calculateScenarios()
   - Rendert de resultaten via de view-module
   - Debounced recalc bij elke wijziging

   Verwijst naar de Snel-modus inputs op kostenvergelijking-warmtepomp.html.
   ============================================================================ */

import {
  calculateScenarios, validateTariff, loadTariffFromUrl, defaultHeatpumpShare
} from './terugverdientijd-core.js';
import {
  renderOperationalKPIs, renderCostComparison, renderCumulativeSavings,
  renderInvestmentKPIs, renderGraph, renderCostTable, renderInfoCards,
  renderWarnings, scenarioHelpText
} from './terugverdientijd-view.js';

/* ----------------------------------------------------------------------------
   Defaults voor velden die NIET in Snel-modus worden gevraagd
   (Uitgebreide modus zal deze later kunnen overschrijven — Fase 3)
   ---------------------------------------------------------------------------- */

/** Typische opwarmde oppervlakte per woningtype (m²) — heuristisch */
const AREA_BY_TYPE = {
  open:        180,
  halfopen:    140,
  rij:         110,
  appartement:  85
};

/** Bruto investering (excl. btw) per warmtepomp-type — orde van grootte */
const COST_BY_HP_TYPE = {
  lucht_lucht:           7000,
  lucht_water:          16000,
  hybride_lucht_water:  10000,
  geothermisch:         28000
};

/** Realistische SPF per warmtepomp-type (ruimteverwarming) */
const SPF_BY_HP_TYPE = {
  lucht_lucht:          3.5,
  lucht_water:          3.8,
  hybride_lucht_water:  3.5,
  geothermisch:         4.2
};

/** Vermeden vervangingsinvestering als de oude verwarming sowieso vervangen moet worden */
const AVOIDED_BY_FUEL = {
  gas:        5000,   // nieuwe gasketel + plaatsing
  mazout:     6500,   // nieuwe mazoutketel + tankcontrole
  elektrisch: 2000,   // weerstand-CV vervanging
  pellets:    8000    // nieuwe pelletketel
};

/** DHW-aandeel van het brandstofverbruik per fuel-type — heuristisch */
const DHW_SHARE_BY_FUEL = {
  gas:        0.15,
  mazout:     0.10,
  elektrisch: 0.00,   // typisch via aparte boiler — niet in dit verbruik
  pellets:    0.10
};

/** Rendement bestaande verwarming voor ruimteverwarming */
const ETA_SPACE_BY_FUEL = {
  gas:        0.90,   // moderne condensatieketel
  mazout:     0.85,
  elektrisch: 1.00,   // weerstand-CV
  pellets:    0.80
};

const ETA_DHW_BY_FUEL = {
  gas:        0.80,
  mazout:     0.75,
  elektrisch: 1.00,
  pellets:    0.70
};

const FIXED_COSTS_OLD_BY_FUEL = {
  gas:        340,
  mazout:     220,   // geen aansluiting, wel onderhoud + tankcontrole
  elektrisch: 0,
  pellets:    180
};

const SCENARIO_KEYS = ['voorzichtig', 'realistisch', 'optimistisch'];

/* ----------------------------------------------------------------------------
   State
   ---------------------------------------------------------------------------- */

let tariff = null;
let recalcTimeout = null;
let plausibleCalcStartedFired = false;

/* ----------------------------------------------------------------------------
   Input lezen uit het form
   ---------------------------------------------------------------------------- */

/**
 * Lees een nummeriek veld; geef null terug als het leeg is of geen geldig getal.
 * Gebruikt als signaal voor "use default value".
 */
function numOrNull(el) {
  if (!el) return null;
  const v = el.value?.trim();
  if (v === '' || v === undefined || v === null) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Lees alle velden uit het formulier en bouw de input voor calculate().
 * Snel-modus geeft afgeleide defaults; uitgebreide modus kan elk veld overschrijven.
 */
function readInputs(form) {
  // ── SNEL-MODUS VELDEN ─────────────────────────────────────────────
  const buildingType = form.elements['building_type'].value;
  const buildYear    = parseInt(form.elements['build_year'].value, 10) || 1990;
  const fuel         = form.elements['current_fuel'].value;
  const consumption  = Math.max(0, parseFloat(form.elements['current_consumption'].value) || 0);
  const hpType       = form.elements['hp_type'].value;
  const replaces     = form.elements['replaces_heating'].value === 'yes';
  const scenarioIdx  = parseInt(form.elements['scenario'].value, 10) || 1;
  // Aandeel-slider (kostenvergelijking-pivot): 0-100% → 0..1 fractie
  const hpShareRaw   = form.elements['hp_share']?.value;
  const hpShare      = hpShareRaw !== undefined && hpShareRaw !== ''
    ? Math.max(0, Math.min(1, parseFloat(hpShareRaw) / 100))
    : defaultHeatpumpShare(hpType);

  // ── UITGEBREIDE MODUS OVERRIDES ───────────────────────────────────
  const ovHeatedArea    = numOrNull(form.elements['heated_area']);
  const ovHddActual     = numOrNull(form.elements['hdd_actual']);
  const insulationLevel = form.elements['insulation']?.value || 'onbekend';
  const ovDhwSharePct   = numOrNull(form.elements['dhw_share']);
  const ovEtaSpacePct   = numOrNull(form.elements['eta_space']);
  const ovFixedOld      = numOrNull(form.elements['fixed_costs_old']);
  const ovSpfSpace      = numOrNull(form.elements['spf_space']);
  const smartSteering   = !!form.elements['smart_steering']?.checked;
  const coolingEnabled  = !!form.elements['cooling_enabled']?.checked;
  const ovCoolingDemand = numOrNull(form.elements['cooling_demand']);
  const ovElecPrice     = numOrNull(form.elements['elec_price']);
  const ovGasPrice      = numOrNull(form.elements['gas_price']);
  const ovCapTariff     = numOrNull(form.elements['capacity_tariff']);
  const pvSharePct      = numOrNull(form.elements['pv_share']) ?? 0;
  const ovGrossCost     = numOrNull(form.elements['gross_cost']);
  const ovAvoidedCost   = numOrNull(form.elements['avoided_cost']);

  // ── DEFAULTS afgeleid uit Snel-modus + overrides ──────────────────
  const area      = ovHeatedArea      ?? AREA_BY_TYPE[buildingType] ?? 140;
  const grossCost = ovGrossCost       ?? COST_BY_HP_TYPE[hpType] ?? 16000;
  const spfSpace  = ovSpfSpace        ?? SPF_BY_HP_TYPE[hpType] ?? 3.8;
  const avoided   = ovAvoidedCost ?? (replaces ? (AVOIDED_BY_FUEL[fuel] ?? 0) : 0);
  const dhwShare  = (ovDhwSharePct != null ? ovDhwSharePct / 100 : null)
                  ?? DHW_SHARE_BY_FUEL[fuel] ?? 0;
  const etaSpace  = (ovEtaSpacePct != null ? ovEtaSpacePct / 100 : null)
                  ?? ETA_SPACE_BY_FUEL[fuel] ?? 0.90;
  const etaDhw    = ETA_DHW_BY_FUEL[fuel] ?? 0.80;
  const fixedOld  = ovFixedOld        ?? FIXED_COSTS_OLD_BY_FUEL[fuel] ?? 340;
  const fixedNew  = replaces ? 0 : fixedOld;
  const newMaint  = 300;
  const vatRate   = replaces ? 0.06 : 0.21;
  const elecPrice = ovElecPrice ?? tariff.energy.electricity_typical_eur_per_kwh;
  const gasPrice  = ovGasPrice  ?? tariff.energy.gas_typical_eur_per_kwh;
  const capTariff = ovCapTariff ?? tariff.capacity_tariff.fluvius_midden_vlaanderen_eur_per_kw_year_excl_vat;

  // Koeling: als ingeschakeld zonder demand → kies een woningtype-afgeleide schatting
  const COOLING_DEMAND_BY_TYPE = { open: 2500, halfopen: 1500, rij: 800, appartement: 600 };
  const coolingDemand = coolingEnabled
    ? (ovCoolingDemand ?? COOLING_DEMAND_BY_TYPE[buildingType] ?? 1500)
    : 0;

  const input = {
    building: {
      type: buildingType,
      heated_area_m2: area,
      build_year: buildYear,
      insulation_level: insulationLevel,
      hdd_actual: ovHddActual,                  // null = geen graaddagcorrectie
      hdd_reference: tariff.weather.default,
      renovation_factor: 1.0
    },
    old_system: {
      fuel,
      annual_consumption: consumption,
      unit: 'kWh',
      dhw_share_fuel: dhwShare,
      cooking_share_fuel: 0,
      efficiency_space: etaSpace,
      efficiency_dhw: etaDhw,
      fixed_costs: fixedOld,
      gas_for_cooking_dhw_after_switch: false
    },
    heat_pump: {
      type: hpType,
      spf_space: spfSpace,
      spf_dhw: 2.5,
      heatpump_share: hpShare,
      // share_dhw: bij lucht-lucht doet de WP geen DHW; bij lucht-water+vervanging wel
      share_dhw: (hpType === 'lucht_lucht') ? 0 : (replaces ? 1.0 : 0),
      aux_electricity_pct: 0,
      cooling_enabled: coolingEnabled,
      cooling_demand_kwh: coolingDemand,
      seer: 4.0,
      // Peak-toename schaalt met hpShare: bij 40% overname is de extra piek ook proportioneel lager
      peak_power_increase_kw: 1.5 * hpShare,
      smart_steering: smartSteering,
      backup_efficiency: 0
    },
    new_system: {
      fixed_costs: fixedNew + newMaint
    },
    prices: {
      electricity_eur_per_kwh: elecPrice,
      gas_eur_per_kwh: gasPrice,
      self_consumption_share: pvSharePct / 100,
      injection_compensation_eur_per_kwh: 0,
      gas_escalation_pct: tariff.energy.gas_escalation_pct_per_year ?? 0.03,
      electricity_escalation_pct: tariff.energy.electricity_escalation_pct_per_year ?? 0.01,
      discount_rate_pct: 0.03,
      capacity_tariff_eur_per_kw_year: capTariff
    },
    investment: {
      gross_cost_excl_vat: grossCost,
      vat_rate: vatRate,
      replaces_existing_heating: replaces,
      avoided_replacement_cost: avoided
    }
  };

  const activeScenario = SCENARIO_KEYS[scenarioIdx] ?? 'realistisch';
  return { input, activeScenario };
}

/* ----------------------------------------------------------------------------
   Recalc + render
   ---------------------------------------------------------------------------- */

/**
 * Helper: render een element alleen als het in de DOM aanwezig is.
 * Voor backwards compat met de oude pagina (die andere element-IDs gebruikt).
 */
function renderIfPresent(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function computeAndRender() {
  if (!tariff) return;
  const form = document.getElementById('calc-form');
  if (!form) return;

  const { input, activeScenario } = readInputs(form);

  try {
    const scenarios = calculateScenarios(input, tariff);
    const realistic = scenarios[activeScenario];

    // HERO — operationele KPI's (4 cards: jaarkost-huidig, jaarkost-WP, jaarbesparing, CO₂)
    renderIfPresent('calc-kpis-hero', renderOperationalKPIs(scenarios, activeScenario));

    // HERO — comparison bar chart
    renderIfPresent('calc-comparison-chart', renderCostComparison(scenarios, activeScenario));

    // SECUNDAIR — cumulatieve besparing 10 jaar (operationeel, geen investering)
    renderIfPresent('calc-cumulative-chart', renderCumulativeSavings(scenarios, 10));

    // INVESTERINGSPERSPECTIEF (collapsed) — TVT cash + TVT incrementeel + NPV15
    renderIfPresent('calc-kpis-investment', renderInvestmentKPIs(scenarios, activeScenario));

    // INVESTERINGSPERSPECTIEF — cashflow grafiek 20j met investering
    renderIfPresent('calc-cashflow-chart', renderGraph(scenarios, 20));

    // INVESTERINGSPERSPECTIEF — kostentabel
    renderIfPresent('calc-costs', renderCostTable(realistic));

    // Info cards (CO₂, koeling, toekomst)
    renderIfPresent('calc-cards', renderInfoCards(realistic, input));

    // Waarschuwingen — uit het ACTIEVE scenario
    renderIfPresent('calc-warnings', renderWarnings(realistic.warnings));

    // Scenario help text
    const help = document.getElementById('scenario-help');
    if (help) help.textContent = scenarioHelpText(activeScenario);

    // Plausible: één event per sessie bij eerste berekening
    if (!plausibleCalcStartedFired && typeof window.plausible === 'function') {
      window.plausible('Vergelijking Started');
      plausibleCalcStartedFired = true;
    }
  } catch (err) {
    console.error('[calculator] berekening faalde:', err);
    renderIfPresent('calc-warnings', `
      <div class="calc-warnings-inner">
        <h4 class="calc-h4">Berekening kon niet uitgevoerd worden</h4>
        <p>${err.message ?? err}</p>
      </div>
    `);
  }
}

function debouncedRecalc(delay = 120) {
  clearTimeout(recalcTimeout);
  recalcTimeout = setTimeout(computeAndRender, delay);
}

/* ----------------------------------------------------------------------------
   Eenheid-label volgen op fuel-type
   ---------------------------------------------------------------------------- */

function updateConsumptionUnit() {
  const fuel = document.getElementById('current-fuel').value;
  const unitLabel = document.getElementById('consumption-unit');
  if (!unitLabel) return;
  const labels = {
    gas:        '(kWh)',
    mazout:     '(kWh — omgerekend uit liter)',
    elektrisch: '(kWh)',
    pellets:    '(kWh — omgerekend uit kg)'
  };
  unitLabel.textContent = labels[fuel] ?? '(kWh)';
}

/* ----------------------------------------------------------------------------
   Aandeel-slider (kostenvergelijking-pivot): default per WP-type + live display
   ---------------------------------------------------------------------------- */

const SHARE_HELP_BY_TYPE = {
  lucht_lucht:          'Default voor lucht-lucht: ~40% (woonkamer + slaapkamers, badkamer en keuken blijven op gas).',
  lucht_water:          'Default voor lucht-water: 100% (vervangt uw centrale verwarmingsketel volledig).',
  hybride_lucht_water:  'Default voor hybride: ~85% (WP doet alle normale dagen, ketel springt bij op koudste dagen).',
  geothermisch:         'Default voor geothermisch: 100% (vervangt uw centrale verwarmingsketel volledig).',
};

let shareSliderUserAdjusted = false;

function updateShareSliderDisplay() {
  const slider = document.getElementById('hp-share');
  const valEl  = document.getElementById('hp-share-value');
  const restEl = document.getElementById('hp-share-rest-value');
  if (!slider) return;
  const v = parseInt(slider.value, 10) || 0;
  if (valEl)  valEl.textContent  = String(v);
  if (restEl) restEl.textContent = String(100 - v);
}

function updateShareHelp() {
  const hpType = document.getElementById('hp-type')?.value || 'lucht_lucht';
  const helpEl = document.getElementById('hp-share-help');
  if (helpEl) helpEl.textContent = SHARE_HELP_BY_TYPE[hpType] || SHARE_HELP_BY_TYPE.lucht_water;
}

/**
 * Wanneer het hp-type wijzigt: stel de slider in op de default voor dat type
 * (alleen als de gebruiker hem nog niet zelf heeft aangepast).
 */
function onHpTypeChange() {
  const hpType = document.getElementById('hp-type')?.value;
  const slider = document.getElementById('hp-share');
  if (!hpType || !slider) return;

  updateShareHelp();

  if (!shareSliderUserAdjusted) {
    const defaultPct = Math.round(defaultHeatpumpShare(hpType) * 100);
    slider.value = String(defaultPct);
    updateShareSliderDisplay();
  }

  // Logica: lucht-water + 100% share suggereert 'volledige vervanging' → toggle automatisch op "ja"
  // Lucht-lucht + <100% share suggereert 'bij-verwarming' → toggle op "nee".
  // We laten de user dit zelf uitvinden — geen automatische override van de toggle.
}

function onHpShareChange() {
  shareSliderUserAdjusted = true;
  updateShareSliderDisplay();
  if (typeof window.plausible === 'function') {
    if (!shareSliderUserAdjusted._fired) {
      window.plausible('Aandeel Slider Gebruikt');
      shareSliderUserAdjusted._fired = true;
    }
  }
}

/* ----------------------------------------------------------------------------
   CTA: pre-fill de contact-link met basis-info
   ---------------------------------------------------------------------------- */

function updateCtaPrefill() {
  const form = document.getElementById('calc-form');
  if (!form) return;
  const cta = document.getElementById('cta-offerte');
  if (!cta) return;

  const params = new URLSearchParams({
    bron:        'calculator',
    woning:      form.elements['building_type'].value,
    bouwjaar:    form.elements['build_year'].value,
    verbruik:    form.elements['current_consumption'].value,
    brandstof:   form.elements['current_fuel'].value,
    type:        form.elements['hp_type'].value,
    vervangt:    form.elements['replaces_heating'].value,
    aandeel:     form.elements['hp_share']?.value ?? ''
  });
  cta.href = `contact.html?${params.toString()}`;
}

/* ----------------------------------------------------------------------------
   Premie-link tracking
   ---------------------------------------------------------------------------- */

function bindPremieTracking() {
  const links = document.querySelectorAll('a[href*="mijn-verbouwpremie"]');
  links.forEach(link => {
    link.addEventListener('click', () => {
      if (typeof window.plausible === 'function') {
        window.plausible('Premie Simulator Click');
      }
    });
  });
}

/* ----------------------------------------------------------------------------
   Modus-toggle (Snel ↔ Uitgebreid)
   ---------------------------------------------------------------------------- */

const MODE_STORAGE_KEY = 'avy_calc_mode';

function setModus(mode) {
  const form = document.getElementById('calc-form');
  const btn  = document.getElementById('modus-toggle');
  if (!form || !btn) return;

  const isExpanded = mode === 'uitgebreid';
  form.dataset.modus = mode;
  btn.setAttribute('aria-expanded', String(isExpanded));
  btn.querySelector('.calc-modus-label').textContent = isExpanded
    ? 'Verberg uitgebreide opties'
    : 'Toon uitgebreide opties';

  // Reveal/hide all .calc-extra blocks
  form.querySelectorAll('.calc-extra').forEach(el => {
    el.hidden = !isExpanded;
  });
  // Reveal/hide fieldsets die alleen voor uitgebreide modus zijn
  form.querySelectorAll('.calc-fieldset--extras-only').forEach(el => {
    el.hidden = !isExpanded;
  });

  // Persist preference voor deze sessie
  try { sessionStorage.setItem(MODE_STORAGE_KEY, mode); } catch (e) { /* private mode */ }

  if (isExpanded && typeof window.plausible === 'function') {
    window.plausible('Uitgebreide Modus Geopend');
  }
}

function initModusToggle() {
  const btn = document.getElementById('modus-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const form = document.getElementById('calc-form');
    const cur = form?.dataset.modus === 'uitgebreid' ? 'uitgebreid' : 'snel';
    setModus(cur === 'uitgebreid' ? 'snel' : 'uitgebreid');
  });

  // Restore previously chosen modus (deze sessie)
  let initial = 'snel';
  try { initial = sessionStorage.getItem(MODE_STORAGE_KEY) || 'snel'; } catch (e) { /* */ }
  setModus(initial);
}

/* ----------------------------------------------------------------------------
   Validatie — per-veld inline errors
   ---------------------------------------------------------------------------- */

/** Validatieregels: id → { min, max, errorMsg, optional? } */
const VALIDATION_RULES = {
  'build-year':            { min: 1800, max: 2030, msg: 'Voer een bouwjaar tussen 1800 en 2030 in.' },
  'current-consumption':   { min: 0,    max: 200000, msg: 'Verbruik moet een positief getal zijn (≤200.000 kWh).' },
  'heated-area':           { min: 20,   max: 1000, msg: 'Verwarmde oppervlakte moet tussen 20 en 1000 m² liggen.', optional: true },
  'hdd-actual':            { min: 800,  max: 3500, msg: 'Graaddagen moeten tussen 800 en 3.500 liggen.', optional: true },
  'dhw-share':             { min: 0,    max: 50,   msg: 'Aandeel sanitair warm water tussen 0 en 50%.', optional: true },
  'eta-space':             { min: 50,   max: 100,  msg: 'Rendement tussen 50 en 100%.', optional: true },
  'fixed-costs-old':       { min: 0,    max: 2000, msg: 'Vaste kosten tussen €0 en €2.000.', optional: true },
  'spf-space':             { min: 1.5,  max: 6.0,  msg: 'SPF tussen 1,5 en 6,0.', optional: true },
  'cooling-demand':        { min: 0,    max: 20000, msg: 'Koudevraag tussen 0 en 20.000 kWh.', optional: true },
  'elec-price':            { min: 0.05, max: 1.0,  msg: 'Elektriciteitsprijs tussen 0,05 en 1,00 €/kWh.', optional: true },
  'gas-price':             { min: 0.02, max: 0.50, msg: 'Brandstofprijs tussen 0,02 en 0,50 €/kWh.', optional: true },
  'capacity-tariff':       { min: 20,   max: 100,  msg: 'Capaciteitstarief tussen 20 en 100 €/kW/jaar.', optional: true },
  'gross-cost':            { min: 2000, max: 80000, msg: 'Bruto kost tussen €2.000 en €80.000.', optional: true },
  'avoided-cost':          { min: 0,    max: 20000, msg: 'Vermeden kost tussen €0 en €20.000.', optional: true }
};

function validateField(id) {
  const el  = document.getElementById(id);
  const err = document.getElementById('err-' + id);
  const rule = VALIDATION_RULES[id];
  if (!el || !rule) return true;

  const raw = el.value?.trim();
  if (raw === '' || raw === null || raw === undefined) {
    // Leeg: alleen invalid als verplicht
    if (rule.optional) {
      el.classList.remove('calc-field-invalid');
      if (err) { err.hidden = true; err.textContent = ''; }
      return true;
    }
    el.classList.add('calc-field-invalid');
    if (err) { err.textContent = 'Dit veld is verplicht.'; err.hidden = false; }
    return false;
  }

  const n = parseFloat(raw);
  const isValid = Number.isFinite(n) && n >= rule.min && n <= rule.max;
  if (isValid) {
    el.classList.remove('calc-field-invalid');
    if (err) { err.hidden = true; err.textContent = ''; }
  } else {
    el.classList.add('calc-field-invalid');
    if (err) { err.textContent = rule.msg; err.hidden = false; }
  }
  return isValid;
}

function validateAll() {
  let allOk = true;
  Object.keys(VALIDATION_RULES).forEach(id => {
    if (!validateField(id)) allOk = false;
  });
  return allOk;
}

/* ----------------------------------------------------------------------------
   Side-effects in form: koeling-rij, PV-slider waarde, eenheid-label
   ---------------------------------------------------------------------------- */

function updateCoolingRow() {
  const enabled = document.getElementById('cooling-enabled')?.checked;
  const row = document.getElementById('cooling-demand-row');
  if (row) row.hidden = !enabled;
}

function updatePvShareDisplay() {
  const slider = document.getElementById('pv-share');
  const label  = document.getElementById('pv-share-value');
  if (slider && label) label.textContent = slider.value;
}

/* ----------------------------------------------------------------------------
   Info-buttons + uitleg-panels (Fase 4 — leerplatform)
   ---------------------------------------------------------------------------- */

function initInfoToggles() {
  const buttons = document.querySelectorAll('[data-info-toggle]');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => toggleInfoPanel(btn));
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        toggleInfoPanel(btn);
      }
    });
  });

  // ESC sluit het open paneel + focus terug naar zijn button
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    const openBtn = document.querySelector('[data-info-toggle][aria-expanded="true"]');
    if (openBtn) {
      const panel = document.getElementById(openBtn.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      openBtn.focus();
    }
  });
}

function toggleInfoPanel(btn) {
  const panelId = btn.getAttribute('aria-controls');
  const panel = panelId ? document.getElementById(panelId) : null;
  if (!panel) return;
  const isOpen = btn.getAttribute('aria-expanded') === 'true';
  panel.hidden = isOpen;
  btn.setAttribute('aria-expanded', String(!isOpen));

  if (!isOpen && typeof window.plausible === 'function') {
    window.plausible('Info Panel Geopend', { props: { veld: panelId } });
  }
}

/* ----------------------------------------------------------------------------
   Print-knop
   ---------------------------------------------------------------------------- */

function initPrintButton() {
  const btn = document.getElementById('print-results');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (typeof window.plausible === 'function') {
      window.plausible('Calculator Printed');
    }
    window.print();
  });
}

/* ----------------------------------------------------------------------------
   Init
   ---------------------------------------------------------------------------- */

async function init() {
  try {
    tariff = validateTariff(await loadTariffFromUrl('data/vlaamse-tarieven-2026.json'));
  } catch (err) {
    console.error('[calculator] tariefblad kon niet geladen worden:', err);
    const warningsEl = document.getElementById('calc-warnings');
    if (warningsEl) {
      warningsEl.innerHTML = `
        <div class="calc-warnings-inner">
          <h4 class="calc-h4">Tariefblad niet bereikbaar</h4>
          <p>De rekenmodule kon de actuele tarieven niet laden. Probeer de pagina te verversen, of <a href="contact.html">neem direct contact op</a>.</p>
        </div>
      `;
    }
    return;
  }

  // Wire modus-toggle voor eerste render
  initModusToggle();
  initInfoToggles();
  initPrintButton();
  initInvestmentDetailsTracking();

  // Eerste render
  computeAndRender();
  updateConsumptionUnit();
  updateCoolingRow();
  updatePvShareDisplay();
  updateShareSliderDisplay();
  updateShareHelp();
  updateCtaPrefill();
  bindPremieTracking();

  // Form-bindings
  const form = document.getElementById('calc-form');
  if (form) {
    form.addEventListener('input', (ev) => {
      updateConsumptionUnit();
      updateCoolingRow();
      updatePvShareDisplay();
      // Aandeel-slider: live display + mark als user-adjusted
      if (ev.target?.id === 'hp-share') onHpShareChange();
      updateCtaPrefill();
      // Per-veld validatie wanneer dit veld een regel heeft
      if (ev.target?.id && VALIDATION_RULES[ev.target.id]) {
        validateField(ev.target.id);
      }
      debouncedRecalc();
    });
    form.addEventListener('change', (ev) => {
      updateConsumptionUnit();
      updateCoolingRow();
      updatePvShareDisplay();
      updateShareSliderDisplay();
      // Bij hp-type wissel: pas slider-default + help-tekst aan
      if (ev.target?.id === 'hp-type') onHpTypeChange();
      updateCtaPrefill();
      if (ev.target?.id && VALIDATION_RULES[ev.target.id]) {
        validateField(ev.target.id);
      }
      debouncedRecalc();
    });
  }

  // Track "completed" — éénmalig wanneer scenario expliciet bewogen is
  const scenarioInput = document.getElementById('scenario');
  if (scenarioInput) {
    scenarioInput.addEventListener('change', () => {
      if (typeof window.plausible === 'function') {
        window.plausible('Vergelijking Completed', {
          props: { scenario: SCENARIO_KEYS[parseInt(scenarioInput.value, 10)] }
        });
      }
    }, { once: true });
  }
}

/* ----------------------------------------------------------------------------
   Investeringsperspectief — open-event tracken
   ---------------------------------------------------------------------------- */

function initInvestmentDetailsTracking() {
  const details = document.getElementById('calc-investment-details');
  if (!details) return;
  let firedOnce = false;
  details.addEventListener('toggle', () => {
    if (details.open && !firedOnce && typeof window.plausible === 'function') {
      window.plausible('Investeringsperspectief Geopend');
      firedOnce = true;
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
