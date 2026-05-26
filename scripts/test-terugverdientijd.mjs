/* ============================================================================
   Tests voor js/terugverdientijd-core.js
   ----------------------------------------------------------------------------
   Uitvoeren: npm test  (of: node scripts/test-terugverdientijd.mjs)
   ============================================================================ */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  convertFuelToKwh, splitFuelByUse, normalizeForWeather, usefulHeat,
  splitUsefulHeatByShare, defaultHeatpumpShare,
  heatPumpElectricity, effectiveElectricityPrice, capacityCostDelta,
  annualCosts, annualCo2Emissions, resolveFuelEmissionKey,
  npv, deriveVatRate,
  calculate, calculateScenarios, applyMultipliers,
  validateTariff, SCENARIO_MULTIPLIERS
} from '../js/terugverdientijd-core.js';

// --- Tariefblad laden ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tariffPath = path.resolve(__dirname, '../data/vlaamse-tarieven-2026.json');
const tariff = validateTariff(JSON.parse(readFileSync(tariffPath, 'utf8')));

// --- Helper voor float-vergelijkingen ---
const near = (actual, expected, tol = 0.5) =>
  Math.abs(actual - expected) < tol;

/* ============================================================================
   UNIT TESTS — losse rekenfuncties
   ============================================================================ */

test('convertFuelToKwh — alle eenheden', () => {
  const conv = tariff.conversions;
  assert.equal(convertFuelToKwh(100, 'kWh', conv), 100);
  assert.equal(convertFuelToKwh(100, 'm3', conv), 100 * conv.gas_kwh_per_m3_H_gas);
  assert.equal(convertFuelToKwh(100, 'liter', conv), 100 * conv.oil_kwh_per_liter);
  assert.equal(convertFuelToKwh(100, 'kg', conv), 100 * conv.pellet_kwh_per_kg);
  assert.throws(() => convertFuelToKwh(100, 'foo', conv), /Onbekende brandstofeenheid/);
});

test('splitFuelByUse — verdeling met DHW en koken', () => {
  const r = splitFuelByUse(17000, 2500 / 17000, 0);
  assert.ok(near(r.eDhw, 2500, 0.01));
  assert.ok(near(r.eSpace, 14500, 0.01));
  assert.equal(r.eCooking, 0);
});

test('normalizeForWeather — schaalt naar referentie', () => {
  assert.equal(normalizeForWeather(14500, 1900, 2000), 14500 * 2000 / 1900);
  assert.equal(normalizeForWeather(14500, null, 2000), 14500); // geen actuele HDD → geen correctie
});

test('usefulHeat — eta toegepast', () => {
  assert.equal(usefulHeat(14500, 0.90), 13050);
});

test('heatPumpElectricity — Q / SPF, optionele aux', () => {
  assert.equal(heatPumpElectricity(13050, 3.8, 0), 13050 / 3.8);
  assert.ok(near(heatPumpElectricity(13050, 3.8, 0.03), (13050 / 3.8) * 1.03, 0.01));
  assert.throws(() => heatPumpElectricity(100, 0), /SPF moet > 0/);
});

test('effectiveElectricityPrice — PV-zelfverbruik', () => {
  // 30% zelfverbruik bij injectievergoeding 0,05 €/kWh, grid 0,33
  // P_eff = 0.7 × 0.33 + 0.3 × (0.33 - 0.05) = 0.231 + 0.084 = 0.315
  assert.ok(near(effectiveElectricityPrice(0.33, 0.30, 0.05), 0.315, 0.001));
  // Zonder PV
  assert.equal(effectiveElectricityPrice(0.33, 0, 0), 0.33);
});

test('capacityCostDelta — slimme sturing reduceert 40%', () => {
  assert.equal(capacityCostDelta(2.0, false, 50), 100);   // 2 kW × 50 €/kW
  assert.equal(capacityCostDelta(2.0, true, 50), 60);     // 2 × 0.6 × 50
  assert.equal(capacityCostDelta(0, false, 50), 0);
});

test('npv — gecumuleerde besparingen verdisconteerd', () => {
  // 100 €/jaar gedurende 1 jaar bij 3% disconto + 0% escalatie → 100/1.03 = 97,087
  assert.ok(near(npv(100, 0, 0.03, 1), 97.087, 0.001));
});

test('deriveVatRate — afgeleid uit replaces_existing_heating', () => {
  assert.equal(deriveVatRate(true, tariff.vat), 0.06);
  assert.equal(deriveVatRate(false, tariff.vat), 0.21);
});

/* ============================================================================
   INTEGRATIE-TEST — Rekenvoorbeeld TERUGVERDIENTIJD_CALCULATOR_PLAN.md Deel 1.4
   ============================================================================ */

function brondocumentInput() {
  return {
    building: {
      heated_area_m2: 180,
      build_year: 2005,
      hdd_actual: null,          // geen graaddagcorrectie in dit voorbeeld
      hdd_reference: null,
      renovation_factor: 1.0
    },
    old_system: {
      fuel: 'gas',
      annual_consumption: 17000,
      unit: 'kWh',
      dhw_share_fuel: 2500 / 17000,
      cooking_share_fuel: 0,
      efficiency_space: 0.90,
      efficiency_dhw: 0.80,
      fixed_costs: 340,
      gas_for_cooking_dhw_after_switch: false
    },
    heat_pump: {
      type: 'lucht_water',
      spf_space: 3.8,
      spf_dhw: 2.5,
      share_space: 1.0,
      share_dhw: 1.0,
      aux_electricity_pct: 0,
      cooling_enabled: false,
      cooling_demand_kwh: 0,
      seer: 4.0,
      peak_power_increase_kw: 0,
      smart_steering: false
    },
    new_system: {
      fixed_costs: 300   // alleen jaarlijks wp-onderhoud
    },
    prices: {
      electricity_eur_per_kwh: 0.33,
      gas_eur_per_kwh: 0.10,
      self_consumption_share: 0,
      injection_compensation_eur_per_kwh: 0,
      gas_escalation_pct: 0.03,
      discount_rate_pct: 0.03,
      capacity_tariff_eur_per_kw_year: 50.12
    },
    investment: {
      gross_cost_excl_vat: 16000,
      vat_rate: 0.06,
      replaces_existing_heating: true,
      avoided_replacement_cost: 7000
    }
  };
}

test('Rekenvoorbeeld Deel 1.4 — lucht-water + 6% btw + verified defaults', () => {
  const out = calculate(brondocumentInput(), tariff);

  // Plan zegt: Q_space=13.050, Q_DHW=2.000, E_HP_total=4.234
  assert.ok(near(out.qSpace, 13050, 1), `Q_space verwacht 13050, kreeg ${out.qSpace}`);
  assert.ok(near(out.qDhw, 2000, 1), `Q_DHW verwacht 2000, kreeg ${out.qDhw}`);
  assert.ok(near(out.eHpHeat, 4234.21, 0.5), `E_HP_total verwacht 4234, kreeg ${out.eHpHeat}`);

  // C_old = 17000 × 0,10 + 340 = 2040 €/jaar
  assert.ok(near(out.cOld, 2040, 0.01), `C_old verwacht 2040, kreeg ${out.cOld}`);

  // C_new = 4234 × 0,33 + 300 = 1697,29 €/jaar
  assert.ok(near(out.cNew, 1697.29, 1), `C_new verwacht 1697, kreeg ${out.cNew}`);

  // S_year = 2040 − 1697,29 = 342,71 €/jaar
  assert.ok(near(out.sYear, 342.71, 1), `S_year verwacht 343, kreeg ${out.sYear}`);

  // Investering
  assert.ok(near(out.iCash, 16960, 0.01), `I_cash verwacht 16960, kreeg ${out.iCash}`);
  assert.ok(near(out.iIncremental, 9960, 0.01), `I_incremental verwacht 9960, kreeg ${out.iIncremental}`);

  // PB
  assert.ok(near(out.pbCash, 49.49, 0.1), `PB_cash verwacht 49,5 jaar, kreeg ${out.pbCash}`);
  assert.ok(near(out.pbIncr, 29.06, 0.1), `PB_incr verwacht 29 jaar, kreeg ${out.pbIncr}`);

  // CO₂-impact met geverifieerde Belgische factoren (VEKA-VMM + AIB 2024):
  //   oud  = 17000 × 0,202 = 3434 kg
  //   nieuw= 4234 × 0,132   = 558,9 kg (heatpump_share=1.0 → geen rest-brandstof)
  //   bespa= 2875 kg
  assert.ok(near(out.co2SavingsKg, 2875, 5), `CO2-besparing verwacht ~2875 kg/jaar, kreeg ${out.co2SavingsKg}`);
  // Legacy alias moet hetzelfde geven
  assert.equal(out.co2Saved, out.co2SavingsKg, 'co2Saved-alias moet overeenkomen met co2SavingsKg');

  // Geen W10-warning omdat S_year > 0
  assert.ok(!out.warnings.some(w => w.id === 'W10'), 'W10 mag NIET triggeren bij S_year > 0');
});

/* ============================================================================
   EDGE-CASE TESTS — Plausibiliteits-warnings
   ============================================================================ */

test('Edge case — S_year ≤ 0 triggert W10 en pbCash=null', () => {
  const input = brondocumentInput();
  // Maak gasprijs ZEER laag → gas wordt goedkoper dan warmtepomp-elek
  input.prices.gas_eur_per_kwh = 0.02;
  const out = calculate(input, tariff);
  assert.ok(out.sYear <= 0, `Verwacht S_year ≤ 0, kreeg ${out.sYear}`);
  assert.equal(out.pbCash, null, 'pbCash moet null zijn');
  assert.equal(out.pbIncr, null, 'pbIncr moet null zijn');
  assert.ok(out.warnings.some(w => w.id === 'W10'), 'W10 moet triggeren');
});

test('Edge case — Hybride wp triggert W08 met 35/65 forfait-tekst', () => {
  const input = brondocumentInput();
  input.heat_pump.type = 'hybride_lucht_water';
  const out = calculate(input, tariff);
  const w08 = out.warnings.find(w => w.id === 'W08');
  assert.ok(w08, 'W08 moet triggeren bij hybride wp');
  assert.match(w08.message, /35.*specifiek.*21.*btw/, 'W08 moet 35% forfait noemen');
  assert.match(w08.message, /65.*warmtepomp.*6.*btw/, 'W08 moet 65% forfait noemen');
  assert.match(w08.message, /Circulaire 2025\/C\/47/, 'W08 moet juridische basis vermelden');
});

test('Edge case — 6% btw + niet-vervanging triggert W11', () => {
  const input = brondocumentInput();
  input.investment.vat_rate = 0.06;
  input.investment.replaces_existing_heating = false;
  const out = calculate(input, tariff);
  assert.ok(out.warnings.some(w => w.id === 'W11'), 'W11 moet triggeren bij 6% zonder vervanging');
});

test('Edge case — W11 triggert NIET bij correcte 6% + vervanging', () => {
  const out = calculate(brondocumentInput(), tariff);  // default: replaces=true, vat=6%
  assert.ok(!out.warnings.some(w => w.id === 'W11'), 'W11 moet NIET triggeren bij 6% + vervanging');
});

/* ============================================================================
   SCENARIO-TESTS
   ============================================================================ */

test('Scenarios — voorzichtig < realistisch < optimistisch voor sYear', () => {
  const scenarios = calculateScenarios(brondocumentInput(), tariff);
  // Voorzichtig: hogere elek-prijs (×1,15), lagere gas-prijs (×0,85), lagere SPF (×0,90)
  //   → grotere kostverhoging op nieuw, kleinere kostdaling op oud → KLEINER sYear
  // Optimistisch: lagere elek (×0,90), hogere gas (×1,15), hogere SPF (×1,10)
  //   → kleinere kostverhoging op nieuw, grotere kostdaling op oud → GROTER sYear
  assert.ok(scenarios.voorzichtig.sYear < scenarios.realistisch.sYear,
    `voorzichtig (${scenarios.voorzichtig.sYear}) moet < realistisch (${scenarios.realistisch.sYear})`);
  assert.ok(scenarios.realistisch.sYear < scenarios.optimistisch.sYear,
    `realistisch (${scenarios.realistisch.sYear}) moet < optimistisch (${scenarios.optimistisch.sYear})`);
});

test('applyMultipliers — pure functie (input wordt niet gemuteerd)', () => {
  const input = brondocumentInput();
  const before = JSON.stringify(input);
  applyMultipliers(input, SCENARIO_MULTIPLIERS.voorzichtig);
  const after = JSON.stringify(input);
  assert.equal(before, after, 'applyMultipliers mag de oorspronkelijke input niet wijzigen');
});

/* ============================================================================
   TARIEFBLAD-CONSISTENTIE
   ============================================================================ */

test('Tariefblad — alle verplichte v1-defaults aanwezig en plausibel', () => {
  assert.equal(tariff.energy.electricity_typical_eur_per_kwh, 0.33);
  assert.equal(tariff.energy.gas_typical_eur_per_kwh, 0.10);
  assert.equal(tariff.conversions.gas_kwh_per_m3_H_gas, 11.5);
  assert.equal(tariff.weather.default, 1960);
  assert.equal(tariff.weather.hdd_reference_30y_norm, 2187);
  assert.equal(tariff.capacity_tariff.average_flanders_eur_per_kw_year_excl_vat, 53.39);
  assert.ok(near(tariff.capacity_tariff.fluvius_midden_vlaanderen_eur_per_kw_year_excl_vat, 50.12, 0.01));
  assert.equal(tariff.vat.default_rate, 0.21);
  assert.equal(tariff.vat.reduced_rate_when_replacing_heating, 0.06);
  assert.equal(tariff.vat.hybrid_forfait_specific_pct, 0.35);
  assert.equal(tariff.vat.hybrid_forfait_non_specific_pct, 0.65);
});

test('validateTariff — gooit fout bij ontbrekende velden', () => {
  assert.throws(() => validateTariff({}), /mist verplicht veld/);
  // Tariefblad zonder emission_factors_kg_co2_per_kwh → faalt op die check
  assert.throws(() => validateTariff({
    _meta:{}, premium_link:{}, vat:{}, capacity_tariff:{}, energy:{}, conversions:{}, weather:{}
  }), /emission_factors_kg_co2_per_kwh/);
  // Tariefblad met alle top-level velden maar missing emission factor numbers
  assert.throws(() => validateTariff({
    _meta:{}, premium_link:{}, vat:{}, capacity_tariff:{},
    energy:{ electricity_typical_eur_per_kwh: 0.33, gas_typical_eur_per_kwh: 0.10 },
    conversions:{}, weather:{},
    emission_factors_kg_co2_per_kwh: {}
  }), /emission_factors_kg_co2_per_kwh\.natural_gas_h/);
});

/* ============================================================================
   NIEUWE TESTS — Fase 1 pivot naar kostenvergelijking-calculator
   ============================================================================ */

test('splitUsefulHeatByShare — basis verdeling 60/40', () => {
  const r = splitUsefulHeatByShare(10000, 0.4);
  assert.equal(r.byHeatPump, 4000);
  assert.equal(r.byExisting, 6000);
});

test('splitUsefulHeatByShare — edge cases (0, 1, out-of-range)', () => {
  // share = 0 → niets via WP, alles via bestaand
  const r0 = splitUsefulHeatByShare(10000, 0);
  assert.equal(r0.byHeatPump, 0);
  assert.equal(r0.byExisting, 10000);

  // share = 1 → alles via WP
  const r1 = splitUsefulHeatByShare(10000, 1);
  assert.equal(r1.byHeatPump, 10000);
  assert.equal(r1.byExisting, 0);

  // share > 1 → clamped naar 1
  const rOver = splitUsefulHeatByShare(10000, 1.5);
  assert.equal(rOver.byHeatPump, 10000);
  assert.equal(rOver.byExisting, 0);

  // share < 0 → clamped naar 0
  const rNeg = splitUsefulHeatByShare(10000, -0.5);
  assert.equal(rNeg.byHeatPump, 0);
  assert.equal(rNeg.byExisting, 10000);

  // default share = 1.0 (geen argument)
  const rDefault = splitUsefulHeatByShare(10000);
  assert.equal(rDefault.byHeatPump, 10000);
});

test('defaultHeatpumpShare — defaults per WP-type', () => {
  assert.equal(defaultHeatpumpShare('lucht_lucht'), 0.4);
  assert.equal(defaultHeatpumpShare('lucht_water'), 1.0);
  assert.equal(defaultHeatpumpShare('hybride_lucht_water'), 0.85);
  assert.equal(defaultHeatpumpShare('onbekend'), 1.0);
});

test('annualCo2Emissions — gas→elek vergelijking met VEKA/AIB factoren', () => {
  // Volledige overname: 17000 kWh gas (0.202) → 4234 kWh elek (0.132), geen rest
  const r = annualCo2Emissions({
    eFuelTotalKwh: 17000,
    eFuelRemainingKwh: 0,
    eElectricityNewKwh: 4234,
    fuelEmissionKey: 'natural_gas_h',
    emissionFactors: tariff.emission_factors_kg_co2_per_kwh,
  });
  // 17000 × 0.202 = 3434
  // 4234 × 0.132 = 558.888
  // besparing ≈ 2875.1
  assert.ok(near(r.co2OldKg, 3434, 0.5), `co2Old verwacht 3434, kreeg ${r.co2OldKg}`);
  assert.ok(near(r.co2NewKg, 558.9, 0.5), `co2New verwacht 558.9, kreeg ${r.co2NewKg}`);
  assert.ok(near(r.co2SavingsKg, 2875, 1), `co2Savings verwacht 2875, kreeg ${r.co2SavingsKg}`);

  // Foutgevallen
  assert.throws(() => annualCo2Emissions({
    eFuelTotalKwh: 17000, fuelEmissionKey: 'natural_gas_h'
  }), /emissionFactors is verplicht/);
  assert.throws(() => annualCo2Emissions({
    eFuelTotalKwh: 17000, fuelEmissionKey: 'onbestaand',
    emissionFactors: tariff.emission_factors_kg_co2_per_kwh
  }), /emissiefactor ontbreekt voor 'onbestaand'/);
});

test('annualCo2Emissions — partial-share met resterend gas', () => {
  // Lucht-lucht @ 40% share: 17000 kWh gas oud
  // Nieuw: 60% van warmte blijft op gas (≈ 10200 kWh fuel) + 40% via WP (≈ 1400 kWh elek)
  const r = annualCo2Emissions({
    eFuelTotalKwh: 17000,
    eFuelRemainingKwh: 10200,
    eElectricityNewKwh: 1400,
    fuelEmissionKey: 'natural_gas_h',
    emissionFactors: tariff.emission_factors_kg_co2_per_kwh,
  });
  // co2Old = 17000 × 0.202 = 3434
  // co2New = 10200 × 0.202 + 1400 × 0.132 = 2060.4 + 184.8 = 2245.2
  // besparing = 3434 - 2245.2 = 1188.8 kg/jaar
  assert.ok(near(r.co2NewKg, 2245.2, 0.5), `co2New (partial) verwacht 2245, kreeg ${r.co2NewKg}`);
  assert.ok(near(r.co2SavingsKg, 1188.8, 1), `co2Savings (partial) verwacht 1189, kreeg ${r.co2SavingsKg}`);
  assert.ok(r.co2SavingsKg > 0, 'Zelfs bij 40% overname moet er CO2-besparing zijn');
});

test('resolveFuelEmissionKey — unit→key mapping + expliciete override', () => {
  assert.equal(resolveFuelEmissionKey('m3'), 'natural_gas_h');
  assert.equal(resolveFuelEmissionKey('liter'), 'fuel_oil');
  assert.equal(resolveFuelEmissionKey('kg'), 'pellets_lifecycle');
  assert.equal(resolveFuelEmissionKey('kWh'), 'natural_gas_h');
  // Expliciete override
  assert.equal(resolveFuelEmissionKey('kWh', 'propane'), 'propane');
  assert.equal(resolveFuelEmissionKey('m3', 'propane'), 'propane');
  // Onbekende
  assert.throws(() => resolveFuelEmissionKey('foo'), /Onbekende unit/);
  assert.throws(() => resolveFuelEmissionKey('m3', 'onbestaand'), /Onbekende fuel_type/);
});

test('calculate — lucht-lucht partial-share gebruikt oude ketel-rendement voor rest', () => {
  // Lucht-lucht naast bestaande gasketel, share=0.4, geen hybride backup_efficiency
  const input = brondocumentInput();
  input.heat_pump.type = 'lucht_lucht';
  input.heat_pump.heatpump_share = 0.4;
  input.heat_pump.spf_space = 4.0;
  input.heat_pump.spf_dhw = 4.0;     // niet gebruikt (share_dhw=0 effectief)
  input.heat_pump.share_dhw = 0;     // lucht-lucht doet typisch geen DHW
  input.investment.replaces_existing_heating = false;
  input.investment.vat_rate = 0.21;

  const out = calculate(input, tariff);

  // qSpaceFuture = 13050 (qSpace × renovation 1.0)
  // qHpSpace = 13050 × 0.4 = 5220
  // qBackup  = 13050 × 0.6 = 7830
  // eBackupFuel = 7830 / 0.90 (oude ketel-rendement) = 8700 kWh
  assert.ok(near(out.qHpSpace, 5220, 1), `qHpSpace verwacht 5220, kreeg ${out.qHpSpace}`);
  assert.ok(near(out.qBackup, 7830, 1), `qBackup verwacht 7830, kreeg ${out.qBackup}`);
  assert.ok(near(out.eBackupFuel, 8700, 1), `eBackupFuel verwacht 8700, kreeg ${out.eBackupFuel}`);

  // Bevestig dat heatpumpShare in output zit
  assert.equal(out.heatpumpShare, 0.4);
});

test('calculate — heatpump_share default = defaultHeatpumpShare(type) als niet expliciet', () => {
  const input = brondocumentInput();
  // Schoon de share-velden
  delete input.heat_pump.share_space;
  delete input.heat_pump.heatpump_share;

  // lucht_water → default 1.0
  input.heat_pump.type = 'lucht_water';
  let out = calculate(input, tariff);
  assert.equal(out.heatpumpShare, 1.0, 'lucht_water default = 1.0');

  // lucht_lucht → default 0.4
  input.heat_pump.type = 'lucht_lucht';
  input.investment.replaces_existing_heating = false;
  input.investment.vat_rate = 0.21;
  out = calculate(input, tariff);
  assert.equal(out.heatpumpShare, 0.4, 'lucht_lucht default = 0.4');

  // hybride → default 0.85
  input.heat_pump.type = 'hybride_lucht_water';
  out = calculate(input, tariff);
  assert.equal(out.heatpumpShare, 0.85, 'hybride default = 0.85');

  // Legacy share_space blijft werken
  input.heat_pump.type = 'lucht_water';
  input.heat_pump.share_space = 0.7;
  out = calculate(input, tariff);
  assert.equal(out.heatpumpShare, 0.7, 'legacy share_space wordt overgenomen');
});

test('Tariefblad — CO₂-factoren VEKA/AIB-cijfers consistent', () => {
  const ef = tariff.emission_factors_kg_co2_per_kwh;
  assert.equal(ef.natural_gas_h, 0.202);
  assert.equal(ef.electricity_be_residual_mix, 0.132);
  assert.equal(ef.fuel_oil, 0.267);
  assert.equal(ef.propane, 0.230);
  assert.equal(ef.pellets_lifecycle, 0.040);
  // Bron-URLs aanwezig
  assert.ok(ef.natural_gas_h_source.startsWith('https://'));
  assert.ok(ef.electricity_be_residual_mix_source.startsWith('https://'));
});
