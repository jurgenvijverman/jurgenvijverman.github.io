/* ============================================================================
   AVYclima — Calculator Terugverdientijd Warmtepomp
   View-module (v1)
   ----------------------------------------------------------------------------
   Render-functies die output van de core-module naar HTML mappen. Idempotent:
   dezelfde input → dezelfde HTML. Geen state, geen event-listeners — de glue-
   module (terugverdientijd.js) roept deze functies aan na elke recalc.
   ============================================================================ */

/* ----------------------------------------------------------------------------
   Formatters
   ---------------------------------------------------------------------------- */

const eurFmt = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const eurFmt1 = new Intl.NumberFormat('nl-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 1 });
const numFmt = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 0 });
const num1Fmt = new Intl.NumberFormat('nl-BE', { maximumFractionDigits: 1 });

export const formatEuro = (n)  => Number.isFinite(n) ? eurFmt.format(n)  : '—';
export const formatEuro1 = (n) => Number.isFinite(n) ? eurFmt1.format(n) : '—';
export const formatNum  = (n)  => Number.isFinite(n) ? numFmt.format(n)  : '—';

/**
 * Formatteer een terugverdientijd in jaren — null wordt '∞' (niet terug te verdienen).
 */
export function formatYears(years) {
  if (years === null || !Number.isFinite(years)) return '∞';
  if (years > 100) return '∞';
  return `${num1Fmt.format(years)} jaar`;
}

/* ----------------------------------------------------------------------------
   HOOFD-KPI's — operationele kostenvergelijking
   ----------------------------------------------------------------------------
   De vier hero-cards: jaarkost-huidig, jaarkost-WP, jaarbesparing, CO₂-besparing.
   Toont scenario-band (voorzichtig..optimistisch) onder elke waarde. */

/**
 * Render de vier hero-KPI's voor de operationele vergelijking.
 *
 * @param {{voorzichtig:object, realistisch:object, optimistisch:object}} scenarios
 * @param {string} active   'voorzichtig' | 'realistisch' | 'optimistisch'
 * @returns {string}
 */
export function renderOperationalKPIs(scenarios, active = 'realistisch') {
  const r  = scenarios[active];
  const lo = scenarios.voorzichtig;
  const hi = scenarios.optimistisch;

  const card = (icon, title, value, band, tone, helpText) => `
    <div class="calc-kpi calc-kpi--hero ${tone ? `calc-kpi--${tone}` : ''}">
      <div class="calc-kpi-icon" aria-hidden="true">${icon}</div>
      <h4 class="calc-kpi-title">${title}</h4>
      <div class="calc-kpi-value">${value}</div>
      ${band ? `<div class="calc-kpi-band">${band}</div>` : ''}
      ${helpText ? `<small class="calc-kpi-help">${helpText}</small>` : ''}
    </div>
  `;

  // Jaarkost-huidig: voorzichtig (lagere gasprijs ×0.85) → LAGERE cOld; optimistisch (hogere gas ×1.15) → HOGERE cOld
  const oldBand = `${formatEuro(lo.cOld)} – ${formatEuro(hi.cOld)}`;
  // Jaarkost-WP: voorzichtig (hogere elek ×1.15, lagere SPF) → HOGERE cNew; optimistisch → LAGERE cNew
  const newBand = `${formatEuro(hi.cNew)} – ${formatEuro(lo.cNew)}`;
  // Jaarbesparing: voorzichtig → LAAG, optimistisch → HOOG
  const saveBand = `${formatEuro(lo.sYear)} – ${formatEuro(hi.sYear)}`;
  // CO₂-besparing: relatief stabiel; gebruik voorzichtig..optimistisch
  const co2Lo = Math.min(lo.co2SavingsKg ?? lo.co2Saved, hi.co2SavingsKg ?? hi.co2Saved);
  const co2Hi = Math.max(lo.co2SavingsKg ?? lo.co2Saved, hi.co2SavingsKg ?? hi.co2Saved);
  const co2Band = `${formatNum(co2Lo)} – ${formatNum(co2Hi)} kg/jaar`;

  return [
    card('🏠', 'Huidige jaarkost',  formatEuro(r.cOld),  oldBand,  '',
         'Brandstof + vaste kosten (abonnement, onderhoud).'),
    card('⚡', 'Met warmtepomp',     formatEuro(r.cNew),  newBand,  '',
         'Elektriciteit + capaciteitstarief + eventueel resterende brandstof.'),
    card('💰', 'Jaarbesparing',      formatEuro(r.sYear), saveBand, r.sYear > 0 ? 'positive' : 'negative',
         r.sYear > 0 ? 'Operationele winst per jaar.' : 'Operationeel: warmtepomp duurder met huidige tarieven.'),
    card('🌿', 'CO₂ minder',         `${formatNum(r.co2SavingsKg ?? r.co2Saved)} kg/jaar`, co2Band, 'positive',
         'Minder uitstoot t.o.v. uw huidige verwarming (officiële Belgische factoren).')
  ].join('');
}

/* ----------------------------------------------------------------------------
   COMPARISON CHART — bar-vergelijking huidig vs nieuw
   ---------------------------------------------------------------------------- */

/**
 * Render een staafdiagram dat de jaarkost van huidige situatie naast die met
 * warmtepomp toont. Banden tonen voorzichtig..optimistisch via error-bars.
 *
 * @param {{voorzichtig:object, realistisch:object, optimistisch:object}} scenarios
 * @param {string} active
 * @returns {string} SVG
 */
export function renderCostComparison(scenarios, active = 'realistisch') {
  const r  = scenarios[active];
  const lo = scenarios.voorzichtig;
  const hi = scenarios.optimistisch;

  const W = 700, H = 320;
  const padL = 70, padR = 40, padT = 20, padB = 50;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Twee balken
  const labels = ['Huidige situatie', 'Met warmtepomp'];
  const values = [r.cOld, r.cNew];
  // Bands: voor cOld → lo.cOld .. hi.cOld; voor cNew → hi.cNew .. lo.cNew (omgekeerd want lo-scen heeft hogere cNew)
  const bandLo = [lo.cOld, hi.cNew];
  const bandHi = [hi.cOld, lo.cNew];

  const yMax = Math.max(...bandHi, ...values) * 1.15;
  const yOf = (v) => padT + innerH - (v / yMax) * innerH;
  const barWidth = (innerW / labels.length) * 0.45;
  const barCenter = (i) => padL + (innerW / labels.length) * (i + 0.5);

  // Y-ticks: 5 stappen
  const yStep = Math.ceil(yMax / 5 / 100) * 100;
  const yTicks = [];
  for (let v = 0; v <= yMax; v += yStep) yTicks.push(v);

  const tickLines = yTicks.map(v => `
    <line x1="${padL}" y1="${yOf(v).toFixed(1)}" x2="${W - padR}" y2="${yOf(v).toFixed(1)}"
          stroke="${v === 0 ? '#3a3a3a' : '#e9ecef'}" stroke-width="${v === 0 ? 1.5 : 1}"/>
    <text x="${padL - 8}" y="${(yOf(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5e5e5e">
      ${formatEuro(v)}
    </text>
  `).join('');

  const bars = values.map((val, i) => {
    const cx = barCenter(i);
    const x = cx - barWidth / 2;
    const y = yOf(val);
    const height = padT + innerH - y;
    const color = i === 0 ? '#dc3545' : '#28a745';   // huidig=rood, nieuw=groen
    return `
      <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barWidth.toFixed(1)}" height="${height.toFixed(1)}"
            fill="${color}" rx="3"/>
      <!-- error-bar (band) -->
      <line x1="${cx.toFixed(1)}" y1="${yOf(bandLo[i]).toFixed(1)}"
            x2="${cx.toFixed(1)}" y2="${yOf(bandHi[i]).toFixed(1)}"
            stroke="#3a3a3a" stroke-width="1.5"/>
      <line x1="${(cx-8).toFixed(1)}" y1="${yOf(bandLo[i]).toFixed(1)}"
            x2="${(cx+8).toFixed(1)}" y2="${yOf(bandLo[i]).toFixed(1)}"
            stroke="#3a3a3a" stroke-width="1.5"/>
      <line x1="${(cx-8).toFixed(1)}" y1="${yOf(bandHi[i]).toFixed(1)}"
            x2="${(cx+8).toFixed(1)}" y2="${yOf(bandHi[i]).toFixed(1)}"
            stroke="#3a3a3a" stroke-width="1.5"/>
      <!-- label boven balk -->
      <text x="${cx.toFixed(1)}" y="${(y - 8).toFixed(1)}" text-anchor="middle"
            font-size="14" font-weight="700" fill="#3a3a3a">${formatEuro(val)}</text>
      <!-- categorie-label onder balk -->
      <text x="${cx.toFixed(1)}" y="${(H - padB + 20).toFixed(1)}" text-anchor="middle"
            font-size="12" fill="#3a3a3a">${labels[i]}</text>
    `;
  }).join('');

  // Verschilpijl tussen de twee balken
  const arrowY = yOf(Math.min(...values)) - 25;
  const diffLabel = `Besparing: ${formatEuro(r.sYear)}/jaar`;
  const diffColor = r.sYear > 0 ? '#28a745' : '#dc3545';

  return `
<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="calc-svg">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#fff" rx="8"/>
  ${tickLines}
  ${bars}
  <!-- Besparingslabel midden tussen balken -->
  <text x="${(W / 2).toFixed(1)}" y="${arrowY.toFixed(1)}" text-anchor="middle"
        font-size="13" font-weight="700" fill="${diffColor}">${diffLabel}</text>
  <text x="${padL - 60}" y="${(padT - 4).toFixed(1)}" font-size="10" fill="#5e5e5e">€/jaar</text>
</svg>
  `.trim();
}

/* ----------------------------------------------------------------------------
   CUMULATIVE SAVINGS CHART — 10 jaar operationeel (zonder investering)
   ---------------------------------------------------------------------------- */

/**
 * Render een lijngrafiek van cumulatieve operationele besparing over N jaar.
 * Drie scenario-lijnen (voorzichtig/realistisch/optimistisch). GEEN investering
 * afgetrokken — alleen jaarbesparing × jaren met escalatie.
 *
 * @param {{voorzichtig:object, realistisch:object, optimistisch:object}} scenarios
 * @param {number} years    Aantal jaren op de x-as (default 10)
 * @returns {string} SVG
 */
export function renderCumulativeSavings(scenarios, years = 10) {
  const W = 700, H = 280;
  const padL = 60, padR = 20, padT = 20, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Cumulatieve besparing (geen investering afgetrokken)
  const buildSeries = (scen) => {
    const series = [{ t: 0, value: 0 }];
    let cum = 0;
    for (let t = 1; t <= years; t++) {
      cum += scen.sYear * Math.pow(1.025, t - 1);
      series.push({ t, value: cum });
    }
    return series;
  };

  const sVoor = buildSeries(scenarios.voorzichtig);
  const sReal = buildSeries(scenarios.realistisch);
  const sOpt  = buildSeries(scenarios.optimistisch);

  const allVals = [...sVoor, ...sReal, ...sOpt].map(p => p.value);
  const yMaxAbs = Math.max(Math.abs(Math.min(...allVals)), Math.abs(Math.max(...allVals)), 1);
  const yMin = Math.min(0, Math.min(...allVals));
  const yMax = Math.max(yMaxAbs * 1.1, 1);

  const xOf = (t) => padL + (t / years) * innerW;
  const yOf = (v) => padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;

  const toPath = (series) =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.t).toFixed(1)} ${yOf(p.value).toFixed(1)}`).join(' ');

  const yStep = Math.ceil((yMax - yMin) / 5 / 1000) * 1000;
  const ticks = [];
  for (let v = Math.floor(yMin / yStep) * yStep; v <= yMax; v += yStep) ticks.push(v);

  const tickLines = ticks.map(v => `
    <line x1="${padL}" y1="${yOf(v).toFixed(1)}" x2="${W - padR}" y2="${yOf(v).toFixed(1)}"
          stroke="${v === 0 ? '#3a3a3a' : '#e9ecef'}" stroke-width="${v === 0 ? 1.5 : 1}"/>
    <text x="${padL - 6}" y="${(yOf(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5e5e5e">
      ${formatEuro(v)}
    </text>
  `).join('');

  const xTicks = [];
  for (let t = 0; t <= years; t += Math.max(1, Math.floor(years / 5))) xTicks.push(t);
  if (xTicks[xTicks.length - 1] !== years) xTicks.push(years);
  const xTickMarks = xTicks.map(t => `
    <text x="${xOf(t).toFixed(1)}" y="${H - padB + 18}" text-anchor="middle" font-size="11" fill="#5e5e5e">${t}j</text>
    <line x1="${xOf(t).toFixed(1)}" y1="${padT + innerH}" x2="${xOf(t).toFixed(1)}" y2="${padT + innerH + 4}" stroke="#5e5e5e"/>
  `).join('');

  // Eind-labels op rechterkant
  const endLabel = (series, color, name) => {
    const last = series[series.length - 1];
    return `<text x="${(xOf(last.t) + 4).toFixed(1)}" y="${(yOf(last.value) + 4).toFixed(1)}"
                  font-size="11" fill="${color}" font-weight="600">${formatEuro(last.value)}</text>`;
  };

  return `
<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="calc-svg">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#fff" rx="8"/>
  ${tickLines}
  ${xTickMarks}
  <path d="${toPath(sVoor)}" fill="none" stroke="#dc3545" stroke-width="2" stroke-dasharray="4 3"/>
  <path d="${toPath(sReal)}" fill="none" stroke="#3a3a3a" stroke-width="2.5"/>
  <path d="${toPath(sOpt)}"  fill="none" stroke="#28a745" stroke-width="2" stroke-dasharray="4 3"/>
  ${endLabel(sVoor, '#dc3545', 'voorzichtig')}
  ${endLabel(sReal, '#3a3a3a', 'realistisch')}
  ${endLabel(sOpt, '#28a745', 'optimistisch')}
  <!-- Legenda -->
  <g transform="translate(${padL + 8}, ${padT + 8})">
    <rect x="0" y="0" width="180" height="58" rx="4" fill="#fff" fill-opacity="0.85" stroke="#dee2e6"/>
    <line x1="8"  y1="14" x2="24" y2="14" stroke="#dc3545" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="30" y="18" font-size="11" fill="#3a3a3a">Voorzichtig</text>
    <line x1="8"  y1="30" x2="24" y2="30" stroke="#3a3a3a" stroke-width="2.5"/>
    <text x="30" y="34" font-size="11" fill="#3a3a3a">Realistisch</text>
    <line x1="8"  y1="46" x2="24" y2="46" stroke="#28a745" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="30" y="50" font-size="11" fill="#3a3a3a">Optimistisch</text>
  </g>
  <text x="${padL - 36}" y="${padT - 6}" font-size="10" fill="#5e5e5e">€</text>
  <text x="${W - padR}" y="${H - 6}" text-anchor="end" font-size="11" fill="#5e5e5e">jaar →</text>
</svg>
  `.trim();
}

/* ----------------------------------------------------------------------------
   INVESTERINGS-KPI's — 3 cards voor het collapsed investeringsperspectief
   ---------------------------------------------------------------------------- */

/**
 * Render de investerings-KPI's: cash TVT, incrementele TVT, NPV15.
 * Bedoeld voor de collapsed sectie "Investeringsperspectief".
 *
 * @param {{voorzichtig:object, realistisch:object, optimistisch:object}} scenarios
 * @param {string} active   'voorzichtig' | 'realistisch' | 'optimistisch'
 * @returns {string}        HTML
 */
export function renderInvestmentKPIs(scenarios, active = 'realistisch') {
  const r  = scenarios[active];
  const lo = scenarios.voorzichtig;
  const hi = scenarios.optimistisch;

  const card = (title, value, band, tag, helpText) => `
    <div class="calc-kpi">
      ${tag ? `<div class="calc-kpi-tag">${tag}</div>` : ''}
      <h4 class="calc-kpi-title">${title}</h4>
      <div class="calc-kpi-value">${value}</div>
      ${band ? `<div class="calc-kpi-band">${band}</div>` : ''}
      ${helpText ? `<small class="calc-kpi-help">${helpText}</small>` : ''}
    </div>
  `;

  const pbCashBand = `${formatYears(hi.pbCash)} – ${formatYears(lo.pbCash)}`;
  const pbIncrBand = `${formatYears(hi.pbIncr)} – ${formatYears(lo.pbIncr)}`;
  const npvBand    = `${formatEuro(lo.npv15)} – ${formatEuro(hi.npv15)}`;

  return [
    card('Terugverdientijd — cash',         formatYears(r.pbCash), pbCashBand, 'excl. premies',
         'Volledige factuur teruggevergde via energiebesparing.'),
    card('Terugverdientijd — incrementeel', formatYears(r.pbIncr), pbIncrBand, 'excl. premies',
         'Meerkost vs. vervangen van uw oude ketel.'),
    card('NPV over 15 jaar',                formatEuro(r.npv15),   npvBand,    'excl. premies',
         'Netto contante waarde — toekomstige besparingen verdisconteerd.')
  ].join('');
}

/* ----------------------------------------------------------------------------
   KPI-cards (legacy — 4 cards incl. sYear, niet meer gebruikt in de huidige
   pagina maar gehouden voor backwards-compat)
   ---------------------------------------------------------------------------- */

/**
 * @deprecated Vervangen door renderOperationalKPIs (4 hero-cards) +
 * renderInvestmentKPIs (3 investeringskaarten).
 *
 * @param {{voorzichtig:object, realistisch:object, optimistisch:object}} scenarios
 * @param {string} active
 * @returns {string}
 */
export function renderKPIs(scenarios, active = 'realistisch') {
  const r = scenarios[active];
  const lo = scenarios.voorzichtig;
  const hi = scenarios.optimistisch;

  const card = (title, value, band, tag, helpText) => `
    <div class="calc-kpi">
      <div class="calc-kpi-tag">${tag}</div>
      <h4 class="calc-kpi-title">${title}</h4>
      <div class="calc-kpi-value">${value}</div>
      ${band ? `<div class="calc-kpi-band">${band}</div>` : ''}
      ${helpText ? `<small class="calc-kpi-help">${helpText}</small>` : ''}
    </div>
  `;

  // PB cash band — hoge waarde van voorzichtig, lage van optimistisch
  const pbCashBand = `${formatYears(hi.pbCash)} – ${formatYears(lo.pbCash)}`;
  const pbIncrBand = `${formatYears(hi.pbIncr)} – ${formatYears(lo.pbIncr)}`;
  const sYearBand  = `${formatEuro(lo.sYear)} – ${formatEuro(hi.sYear)}`;
  const npvBand    = `${formatEuro(lo.npv15)} – ${formatEuro(hi.npv15)}`;

  return [
    card('Terugverdientijd — cash',         formatYears(r.pbCash), pbCashBand, 'excl. premies',
         'Hele factuur teruggevergde via energiebesparing.'),
    card('Terugverdientijd — incrementeel', formatYears(r.pbIncr), pbIncrBand, 'excl. premies',
         'Meerkost vs. vervangen van uw oude ketel.'),
    card('Netto besparing jaar 1',          formatEuro(r.sYear),   sYearBand,  '',
         'Verschil oude vs. nieuwe jaarlijkse kost.'),
    card('NPV over 15 jaar',                formatEuro(r.npv15),   npvBand,    'excl. premies',
         'Netto contante waarde — toekomstige besparingen verdisconteerd.')
  ].join('');
}

/* ----------------------------------------------------------------------------
   Grafiek: gecumuleerde besparing 0–20 jaar
   ---------------------------------------------------------------------------- */

/**
 * Bouw een eenvoudige inline SVG-grafiek van gecumuleerde besparing.
 * Drie lijnen (voorzichtig / realistisch / optimistisch). Snijpunt met x-as ≈ TVT.
 *
 * @param {{voorzichtig:object, realistisch:object, optimistisch:object}} scenarios
 * @param {number} years    Aantal jaren op de x-as (default 20)
 * @returns {string}        SVG-markup
 */
export function renderGraph(scenarios, years = 20) {
  const W = 700, H = 320;
  const padL = 60, padR = 20, padT = 20, padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  // Bouw cumulatieve cashflow-series per scenario
  const buildSeries = (scen) => {
    const series = [{ t: 0, value: -scen.iIncremental }];
    let cum = -scen.iIncremental;
    for (let t = 1; t <= years; t++) {
      cum += scen.sYear * Math.pow(1.025, t - 1);  // ~2,5% gemiddelde escalatie
      series.push({ t, value: cum });
    }
    return series;
  };

  const sVoor = buildSeries(scenarios.voorzichtig);
  const sReal = buildSeries(scenarios.realistisch);
  const sOpt  = buildSeries(scenarios.optimistisch);

  // y-bereik
  const allVals = [...sVoor, ...sReal, ...sOpt].map(p => p.value);
  const yMin = Math.min(...allVals);
  const yMax = Math.max(...allVals);
  const yRange = Math.max(Math.abs(yMin), Math.abs(yMax)) * 1.1;
  const ySpan = yRange * 2;

  const xOf = (t) => padL + (t / years) * innerW;
  const yOf = (v) => padT + innerH / 2 - (v / yRange) * (innerH / 2);

  const toPath = (series) =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${xOf(p.t).toFixed(1)} ${yOf(p.value).toFixed(1)}`).join(' ');

  // y-as ticks: 5 stappen rond 0
  const tickStep = Math.ceil(yRange / 5 / 1000) * 1000;
  const ticks = [];
  for (let v = -Math.ceil(yRange / tickStep) * tickStep; v <= yRange; v += tickStep) {
    ticks.push(v);
  }

  const tickLines = ticks.map(v => `
    <line x1="${padL}" y1="${yOf(v).toFixed(1)}" x2="${W - padR}" y2="${yOf(v).toFixed(1)}"
          stroke="${v === 0 ? '#3a3a3a' : '#e9ecef'}" stroke-width="${v === 0 ? 1.5 : 1}"/>
    <text x="${padL - 6}" y="${(yOf(v) + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#5e5e5e">
      ${formatEuro(v)}
    </text>
  `).join('');

  // x-as ticks: elke 5 jaar
  const xTicks = [];
  for (let t = 0; t <= years; t += 5) xTicks.push(t);
  const xTickMarks = xTicks.map(t => `
    <text x="${xOf(t)}" y="${H - padB + 18}" text-anchor="middle" font-size="11" fill="#5e5e5e">${t}j</text>
    <line x1="${xOf(t)}" y1="${padT + innerH}" x2="${xOf(t)}" y2="${padT + innerH + 4}" stroke="#5e5e5e"/>
  `).join('');

  return `
<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" class="calc-svg">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#fff" rx="8"/>
  ${tickLines}
  ${xTickMarks}
  <path d="${toPath(sVoor)}" fill="none" stroke="#dc3545" stroke-width="2" stroke-dasharray="4 3" />
  <path d="${toPath(sReal)}" fill="none" stroke="#3a3a3a" stroke-width="2.5" />
  <path d="${toPath(sOpt)}"  fill="none" stroke="#28a745" stroke-width="2" stroke-dasharray="4 3" />

  <!-- Legenda -->
  <g transform="translate(${padL + 8}, ${padT + 8})">
    <rect x="0" y="0" width="180" height="58" rx="4" fill="#fff" fill-opacity="0.85" stroke="#dee2e6"/>
    <line x1="8"  y1="14" x2="24" y2="14" stroke="#dc3545" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="30" y="18" font-size="11" fill="#3a3a3a">Voorzichtig</text>
    <line x1="8"  y1="30" x2="24" y2="30" stroke="#3a3a3a" stroke-width="2.5"/>
    <text x="30" y="34" font-size="11" fill="#3a3a3a">Realistisch</text>
    <line x1="8"  y1="46" x2="24" y2="46" stroke="#28a745" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="30" y="50" font-size="11" fill="#3a3a3a">Optimistisch</text>
  </g>

  <!-- Assen -->
  <text x="${padL - 36}" y="${padT - 6}" font-size="10" fill="#5e5e5e">€</text>
  <text x="${W - padR}" y="${H - 6}" text-anchor="end" font-size="11" fill="#5e5e5e">jaar →</text>
</svg>
  `.trim();
}

/* ----------------------------------------------------------------------------
   Kostentabel: jaarlijkse kost oud vs nieuw
   ---------------------------------------------------------------------------- */

/**
 * Render een eenvoudige vergelijking van de jaarlijkse kost: huidige situatie
 * versus warmtepomp. Toont C_old / C_new / S_year voor het realistische scenario.
 */
export function renderCostTable(realistic) {
  return `
<table class="calc-table">
  <thead>
    <tr><th>Item</th><th>Huidige situatie</th><th>Met warmtepomp</th><th>Verschil</th></tr>
  </thead>
  <tbody>
    <tr>
      <th>Jaarlijkse totaalkost</th>
      <td>${formatEuro(realistic.cOld)}</td>
      <td>${formatEuro(realistic.cNew)}</td>
      <td class="${realistic.sYear >= 0 ? 'calc-pos' : 'calc-neg'}">${formatEuro(realistic.sYear)}</td>
    </tr>
    <tr>
      <th>Brandstof / elektriciteit voor verwarming</th>
      <td>${formatNum(realistic.eFuelTotal)} kWh brandstof</td>
      <td>${formatNum(realistic.eHpHeat)} kWh elektriciteit</td>
      <td>—</td>
    </tr>
    <tr>
      <th>CO₂-uitstoot</th>
      <td>${formatNum(realistic.co2Old)} kg/jaar</td>
      <td>${formatNum(realistic.co2New)} kg/jaar</td>
      <td class="calc-pos">−${formatNum(realistic.co2Saved)} kg/jaar</td>
    </tr>
  </tbody>
</table>
<small class="calc-help">Voor het realistische scenario (Vlaams gemiddelde mei 2026), exclusief premies.</small>
  `.trim();
}

/* ----------------------------------------------------------------------------
   Niet-financiële indicatoren
   ---------------------------------------------------------------------------- */

export function renderInfoCards(realistic, input) {
  const cards = [];

  // CO₂
  cards.push(`
    <div class="calc-info-card">
      <div class="calc-info-icon" aria-hidden="true">🌿</div>
      <h4>CO₂-besparing</h4>
      <p><strong>${formatNum(realistic.co2Saved)} kg/jaar</strong> minder uitstoot, of <strong>${formatNum(realistic.co2Saved * 15)} kg</strong> over 15 jaar.</p>
    </div>
  `);

  // Koeling
  if (input?.heat_pump?.type === 'lucht_lucht' || input?.heat_pump?.cooling_enabled) {
    cards.push(`
      <div class="calc-info-card">
        <div class="calc-info-icon" aria-hidden="true">❄️</div>
        <h4>Koeling inbegrepen</h4>
        <p>Eén toestel voor verwarming én koeling. Comfort waarde die niet in een TVT-getal past.</p>
      </div>
    `);
  } else {
    cards.push(`
      <div class="calc-info-card">
        <div class="calc-info-icon" aria-hidden="true">🔥</div>
        <h4>Alleen verwarming</h4>
        <p>Geen koeling in dit scenario. Voor een combinatietoestel zie lucht-lucht of bekijk de uitgebreide modus.</p>
      </div>
    `);
  }

  // Toekomstbestendigheid
  cards.push(`
    <div class="calc-info-card">
      <div class="calc-info-icon" aria-hidden="true">📈</div>
      <h4>Toekomstbestendigheid</h4>
      <p>Gas-accijnzen stijgen jaarlijks vanaf 2026 en EU ETS-2 vanaf 2027 maakt fossiele verwarming verder duurder. Elektriciteit volgt de omgekeerde trend.</p>
    </div>
  `);

  return cards.join('');
}

/* ----------------------------------------------------------------------------
   Waarschuwingen
   ---------------------------------------------------------------------------- */

/**
 * Render plausibiliteits-waarschuwingen als een banner. Verschillende
 * severities krijgen verschillende kleur.
 */
export function renderWarnings(warnings) {
  if (!warnings || warnings.length === 0) return '';
  const items = warnings.map(w => `
    <li class="calc-warning calc-warning--${w.severity || 'info'}" data-id="${w.id}">
      <span class="calc-warning-id">${w.id}</span>
      <span class="calc-warning-msg">${w.message}</span>
    </li>
  `).join('');
  return `
<div class="calc-warnings-inner">
  <h4 class="calc-h4">Aandachtspunten bij deze berekening</h4>
  <ul class="calc-warning-list">${items}</ul>
</div>
  `.trim();
}

/* ----------------------------------------------------------------------------
   Scenario-help-tekst
   ---------------------------------------------------------------------------- */

export function scenarioHelpText(active) {
  switch (active) {
    case 'voorzichtig':
      return 'Voorzichtig — hogere elektriciteitsprijs, lagere SPF, geen slimme sturing. Geeft de pessimistische schatting.';
    case 'optimistisch':
      return 'Optimistisch — lagere effectieve elektriciteitsprijs (zelfverbruik PV), hogere SPF, slimme sturing. Geeft de positieve schatting.';
    case 'realistisch':
    default:
      return 'Realistisch — Vlaamse gemiddeldes 2026 (VREG/Fluvius).';
  }
}
