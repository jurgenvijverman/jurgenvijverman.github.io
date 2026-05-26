/* ============================================================================
   AVYclima — Calculator Terugverdientijd Warmtepomp
   Rekenkern (v1)
   ----------------------------------------------------------------------------
   Pure rekenfuncties zonder DOM-afhankelijkheden. Direct unit-testbaar via
   Node. Implementatie volgt TERUGVERDIENTIJD_CALCULATOR_PLAN.md Deel 4.4
   (stappen 1-12) en Deel 4.5 (plausibiliteits-warnings).

   v1-scope: premies vallen BUITEN de berekening. Resultaten zijn 'excl. premies'.
   Zie premium_link in tariefblad voor footnote-deeplink naar simulator.

   Browser: laad als <script type="module" src="js/terugverdientijd-core.js">
   Node: importeer in een .mjs script of via een package.json met "type": "module".
   ============================================================================ */

/* ----------------------------------------------------------------------------
   CONSTANTEN
   ---------------------------------------------------------------------------- */

/** Scenario-multipliers — zie TERUGVERDIENTIJD_CALCULATOR_PLAN.md Deel 4.3 */
export const SCENARIO_MULTIPLIERS = {
  voorzichtig: {
    electricity_eur_per_kwh:      1.15,
    gas_eur_per_kwh:              0.85,
    spf_space:                    0.90,
    gross_cost_excl_vat:          1.10,
    capacity_tariff_kw_addition:  1.30,
    electricity_escalation_pct:   0.00,
    gas_escalation_pct:           0.02
  },
  realistisch: {
    electricity_eur_per_kwh:      1.00,
    gas_eur_per_kwh:              1.00,
    spf_space:                    1.00,
    gross_cost_excl_vat:          1.00,
    capacity_tariff_kw_addition:  1.00,
    electricity_escalation_pct:   0.01,
    gas_escalation_pct:           0.03
  },
  optimistisch: {
    electricity_eur_per_kwh:      0.90,
    gas_eur_per_kwh:              1.15,
    spf_space:                    1.10,
    gross_cost_excl_vat:          0.95,
    capacity_tariff_kw_addition:  0.60,
    electricity_escalation_pct:   0.01,
    gas_escalation_pct:           0.05
  }
};

/* ----------------------------------------------------------------------------
   STAP 1 — Brandstof-eenheden naar kWh
   ---------------------------------------------------------------------------- */

/**
 * Zet een brandstofverbruik om naar kWh.
 *
 * @param {number} quantity        Hoeveelheid in de eenheid die `unit` aangeeft.
 * @param {string} unit            'kWh' | 'm3' | 'liter' | 'kg'
 * @param {object} conversions     Conversion factors uit tariefblad
 * @returns {number}               Energie in kWh
 */
export function convertFuelToKwh(quantity, unit, conversions) {
  switch (unit) {
    case 'kWh':   return quantity;
    case 'm3':    return quantity * conversions.gas_kwh_per_m3_H_gas;
    case 'liter': return quantity * conversions.oil_kwh_per_liter;
    case 'kg':    return quantity * conversions.pellet_kwh_per_kg;
    default:      throw new Error(`Onbekende brandstofeenheid: ${unit}`);
  }
}

/* ----------------------------------------------------------------------------
   STAP 2 — Verbruik splitsen tussen ruimteverwarming / DHW / koken
   ---------------------------------------------------------------------------- */

/**
 * Splits het totale brandstofverbruik in ruimteverwarming, sanitair warm water
 * en koken op basis van de opgegeven aandelen.
 *
 * @param {number} eTotalKwh        Totaal brandstofverbruik in kWh
 * @param {number} dhwShareFuel     Aandeel sanitair warm water (0..1)
 * @param {number} cookingShareFuel Aandeel koken (0..1)
 * @returns {{ eSpace:number, eDhw:number, eCooking:number }}
 */
export function splitFuelByUse(eTotalKwh, dhwShareFuel = 0, cookingShareFuel = 0) {
  const eDhw     = eTotalKwh * dhwShareFuel;
  const eCooking = eTotalKwh * cookingShareFuel;
  const eSpace   = eTotalKwh - eDhw - eCooking;
  return { eSpace, eDhw, eCooking };
}

/* ----------------------------------------------------------------------------
   STAP 3 — Graaddagcorrectie
   ---------------------------------------------------------------------------- */

/**
 * Normaliseer het brandstofverbruik voor ruimteverwarming naar een 'standaard'
 * winter via graaddagen. Als geen HDD-data beschikbaar → geen correctie.
 *
 * @param {number} eSpace          Brandstofverbruik ruimteverwarming (kWh)
 * @param {number} hddActual       Werkelijke graaddagen jaar van de factuur
 * @param {number} hddReference    Referentie-graaddagen (calculator-default)
 * @returns {number}               Genormaliseerd verbruik (kWh)
 */
export function normalizeForWeather(eSpace, hddActual, hddReference) {
  if (!hddActual || !hddReference) return eSpace;
  return eSpace * (hddReference / hddActual);
}

/* ----------------------------------------------------------------------------
   STAP 4 — Nuttige warmte
   ---------------------------------------------------------------------------- */

/**
 * Bereken nuttige warmte uit brandstofverbruik via het rendement van de oude
 * installatie.
 *
 * @param {number} eFuelKwh        Brandstof in kWh
 * @param {number} efficiency      Rendement (bijv. 0.90 voor moderne gasketel)
 * @returns {number}               Nuttige warmte (kWh)
 */
export function usefulHeat(eFuelKwh, efficiency) {
  return eFuelKwh * efficiency;
}

/* ----------------------------------------------------------------------------
   Heatpump-share split — voor de operationele kostenvergelijking
   ---------------------------------------------------------------------------- */

/**
 * Splits totale nuttige warmte tussen warmtepomp en de bestaande installatie.
 * Gebruikt voor de operationele kostenvergelijking: bij lucht-lucht-bijverwarming
 * neemt de WP slechts een deel (typisch 40%) van de verwarmingsbehoefte over;
 * de bestaande gas/mazout/pellet-ketel blijft de rest leveren.
 *
 * @param {number} usefulHeatKwh   Totale nuttige warmte (kWh)
 * @param {number} share           Aandeel WP (0..1), default 1.0 (volledige overname)
 * @returns {{ byHeatPump:number, byExisting:number }}
 */
export function splitUsefulHeatByShare(usefulHeatKwh, share = 1.0) {
  // Clamp share naar [0, 1]
  const s = Math.max(0, Math.min(1, share));
  return {
    byHeatPump: usefulHeatKwh * s,
    byExisting: usefulHeatKwh * (1 - s),
  };
}

/**
 * Default heatpump_share per warmtepomp-type. Voor lucht-lucht typisch
 * bijverwarming naast bestaande installatie (40%). Lucht-water / hybride
 * vervangt typisch de volledige verwarmingsbron (100% / 85%).
 *
 * @param {string} hpType          'lucht_lucht' | 'lucht_water' | 'hybride_lucht_water'
 * @returns {number}               Default share 0..1
 */
export function defaultHeatpumpShare(hpType) {
  switch (hpType) {
    case 'lucht_lucht':         return 0.4;
    case 'lucht_water':         return 1.0;
    case 'hybride_lucht_water': return 0.85;
    default:                    return 1.0;
  }
}

/* ----------------------------------------------------------------------------
   STAP 7 — Elektriciteit warmtepomp
   ---------------------------------------------------------------------------- */

/**
 * Bereken elektriciteitsverbruik voor warmtepomp via SPF (seasonal performance
 * factor) en optionele aux-fractie voor circulatiepomp/regelaar.
 *
 * @param {number} qUsefulKwh      Te leveren nuttige warmte (kWh)
 * @param {number} spf             Jaarrendement warmtepomp
 * @param {number} auxPct          Extra aux-elek als fractie (default 0)
 * @returns {number}               Elektriciteitsverbruik (kWh)
 */
export function heatPumpElectricity(qUsefulKwh, spf, auxPct = 0) {
  if (spf <= 0) throw new Error(`SPF moet > 0 zijn, kreeg ${spf}`);
  const eBase = qUsefulKwh / spf;
  return eBase * (1 + auxPct);
}

/* ----------------------------------------------------------------------------
   Effectieve elektriciteitsprijs met PV-zelfverbruik
   ---------------------------------------------------------------------------- */

/**
 * Bereken effectieve elektriciteitsprijs rekening houdend met PV-zelfverbruik.
 * Voor v1: vereenvoudigde slider 0–50%. Volledige PV-koppeling = v3.
 *
 * @param {number} pGrid           Net-prijs €/kWh
 * @param {number} alpha           Zelfverbruiks-fractie (0..0.5)
 * @param {number} pInjection      Injectievergoeding €/kWh (default 0)
 * @returns {number}               Effectieve prijs €/kWh
 */
export function effectiveElectricityPrice(pGrid, alpha = 0, pInjection = 0) {
  const pSelfConsumed = pGrid - pInjection;  // wat je 'wint' per zelfverbruikte kWh
  return (1 - alpha) * pGrid + alpha * pSelfConsumed;
}

/* ----------------------------------------------------------------------------
   Capaciteitstarief-delta
   ---------------------------------------------------------------------------- */

/**
 * Bereken extra kost capaciteitstarief door de warmtepomp.
 * Slimme sturing kan de piek-toename met ~40% verminderen.
 *
 * @param {number} peakIncreaseKw    Verwachte piek-toename door wp (kW)
 * @param {boolean} smartSteering    Slimme sturing aanwezig?
 * @param {number} tariffEurPerKwYear Capaciteitstarief €/kW/jaar
 * @returns {number}                  Extra jaarlijkse kost (€)
 */
export function capacityCostDelta(peakIncreaseKw, smartSteering, tariffEurPerKwYear) {
  const reduction = smartSteering ? 0.4 : 0;
  const effectiveIncrease = peakIncreaseKw * (1 - reduction);
  return effectiveIncrease * tariffEurPerKwYear;
}

/* ----------------------------------------------------------------------------
   STAP 9 — Jaarlijkse kosten oud vs nieuw
   ---------------------------------------------------------------------------- */

/**
 * Vergelijk jaarlijkse kosten oud vs nieuw systeem.
 *
 * @param {object} args
 * @param {number} args.eFuelTotalKwh         Totaal brandstofverbruik oud (kWh)
 * @param {number} args.pFuel                 Prijs brandstof oud (€/kWh)
 * @param {number} args.eHpTotalKwh           Elek-verbruik warmtepomp (kWh)
 * @param {number} args.eCoolingKwh           Elek voor koeling (kWh)
 * @param {number} args.eBackupFuelKwh        Brandstof back-up bij hybride (kWh)
 * @param {number} args.pElectricityEff       Effectieve elek-prijs (€/kWh)
 * @param {number} args.cFixedOld             Vaste + onderhoud oud (€/jaar)
 * @param {number} args.cFixedNew             Vaste + onderhoud nieuw (€/jaar)
 * @param {number} args.cCapacityDelta        Extra capaciteitstarief (€/jaar)
 * @returns {{ cOld:number, cNew:number, sYear:number }}
 */
export function annualCosts({
  eFuelTotalKwh, pFuel,
  eHpTotalKwh, eCoolingKwh = 0, eBackupFuelKwh = 0,
  pElectricityEff,
  cFixedOld, cFixedNew = 0,
  cCapacityDelta = 0
}) {
  const cOld = eFuelTotalKwh * pFuel + cFixedOld;
  const cNew = (eHpTotalKwh + eCoolingKwh) * pElectricityEff
             + eBackupFuelKwh * pFuel
             + cFixedNew
             + cCapacityDelta;
  return { cOld, cNew, sYear: cOld - cNew };
}

/* ----------------------------------------------------------------------------
   CO₂-emissies — operationele kostenvergelijking
   ---------------------------------------------------------------------------- */

/**
 * Mapping van old_system.unit / fuel_type naar de sleutel in
 * tariff.emission_factors_kg_co2_per_kwh. Gebruik expliciete fuel_type wanneer
 * unit dubbelzinnig is (bv. 'kWh' kan zowel gas als propaan zijn).
 *
 * @param {string} unit            'm3' | 'liter' | 'kg' | 'kWh'
 * @param {string} [fuelType]      Optionele expliciete brandstof
 * @returns {string}               Sleutel in emission_factors object
 */
export function resolveFuelEmissionKey(unit, fuelType) {
  if (fuelType) {
    const allowed = ['natural_gas_h', 'fuel_oil', 'propane', 'pellets_lifecycle'];
    if (allowed.includes(fuelType)) return fuelType;
    throw new Error(`Onbekende fuel_type: ${fuelType}. Toegestaan: ${allowed.join(', ')}`);
  }
  switch (unit) {
    case 'm3':    return 'natural_gas_h';
    case 'liter': return 'fuel_oil';
    case 'kg':    return 'pellets_lifecycle';
    case 'kWh':   return 'natural_gas_h';  // legacy default; gebruiker kan fuel_type expliciet zetten
    default:      throw new Error(`Onbekende unit voor emissiefactor-resolutie: ${unit}`);
  }
}

/**
 * Bereken jaarlijkse CO₂-emissies in huidige en nieuwe situatie + besparing.
 * Gebruikt finale-energie-emissiefactoren uit het tariefblad (VEKA-VMM/AIB).
 *
 * @param {object} args
 * @param {number} args.eFuelTotalKwh        Totaal brandstofverbruik OUD (kWh)
 * @param {number} args.eFuelRemainingKwh    Resterend brandstofverbruik NIEUW (kWh) — bij partial-share
 * @param {number} args.eElectricityNewKwh   Elektriciteit voor WP + koeling NIEUW (kWh)
 * @param {string} args.fuelEmissionKey      Sleutel in emissionFactors (bv. 'natural_gas_h')
 * @param {object} args.emissionFactors      Het emission_factors_kg_co2_per_kwh blok
 * @returns {{ co2OldKg:number, co2NewKg:number, co2SavingsKg:number }}
 */
export function annualCo2Emissions({
  eFuelTotalKwh,
  eFuelRemainingKwh = 0,
  eElectricityNewKwh = 0,
  fuelEmissionKey,
  emissionFactors,
}) {
  if (!emissionFactors) {
    throw new Error('annualCo2Emissions: emissionFactors is verplicht');
  }
  const fFuel = emissionFactors[fuelEmissionKey];
  const fElec = emissionFactors.electricity_be_residual_mix;
  if (typeof fFuel !== 'number') {
    throw new Error(`annualCo2Emissions: emissiefactor ontbreekt voor '${fuelEmissionKey}'`);
  }
  if (typeof fElec !== 'number') {
    throw new Error('annualCo2Emissions: emissiefactor ontbreekt voor electricity_be_residual_mix');
  }
  const co2OldKg = eFuelTotalKwh * fFuel;
  const co2NewKg = (eFuelRemainingKwh * fFuel) + (eElectricityNewKwh * fElec);
  return {
    co2OldKg,
    co2NewKg,
    co2SavingsKg: co2OldKg - co2NewKg,
  };
}

/* ----------------------------------------------------------------------------
   NPV — Netto contante waarde
   ---------------------------------------------------------------------------- */

/**
 * Bereken NPV met jaarlijkse escalatie van de besparing.
 *
 * @param {number} sYearInitial    Besparing jaar 1 (€)
 * @param {number} escalation      Jaarlijkse stijging besparing (bijv. 0.025)
 * @param {number} discount        Discontovoet (bijv. 0.03)
 * @param {number} years           Aantal jaren (default 15)
 * @returns {number}               NPV van toekomstige cashflows (€)
 */
export function npv(sYearInitial, escalation = 0, discount = 0.03, years = 15) {
  let total = 0;
  for (let t = 1; t <= years; t++) {
    const cashflow = sYearInitial * Math.pow(1 + escalation, t - 1);
    total += cashflow / Math.pow(1 + discount, t);
  }
  return total;
}

/* ----------------------------------------------------------------------------
   STAP 10 — BTW-tarief afleiden uit input
   ---------------------------------------------------------------------------- */

/**
 * Bepaal het btw-tarief op basis van: vervangt de wp de bestaande verwarming?
 * - Ja → 6% (renovatie ≥10j óf nieuwe 2026-regeling)
 * - Nee → 21% (standaard)
 * Geldt voor alle warmtepomp-types (lucht-lucht incl., KB 18-12-2025).
 *
 * @param {boolean} replacesExistingHeating
 * @param {object} tariffVat       Het 'vat'-blok uit het tariefblad
 * @returns {number}               0.06 of 0.21
 */
export function deriveVatRate(replacesExistingHeating, tariffVat) {
  return replacesExistingHeating
    ? (tariffVat?.reduced_rate_when_replacing_heating ?? 0.06)
    : (tariffVat?.default_rate ?? 0.21);
}

/* ----------------------------------------------------------------------------
   Plausibiliteits-warnings
   ---------------------------------------------------------------------------- */

/**
 * Genereer warning-messages op basis van input + uitkomsten.
 * Zie TERUGVERDIENTIJD_CALCULATOR_PLAN.md Deel 4.5 voor de regels.
 * W05 is verschoven naar v2 (premie-integratie).
 *
 * @param {object} input        Volledige input
 * @param {object} output       Uitkomst uit calculate()
 * @param {object} tariff       Tariefblad
 * @returns {Array<{id:string, severity:string, message:string}>}
 */
export function generateWarnings(input, output, tariff) {
  const warnings = [];

  // W01 — warmtevraag per m² out of range
  if (input.building?.heated_area_m2 > 0) {
    const qPerM2 = (output.qSpace ?? 0) / input.building.heated_area_m2;
    if (qPerM2 < 30 || qPerM2 > 200) {
      warnings.push({
        id: 'W01', severity: 'warning',
        message: `De warmtevraag per m² (${qPerM2.toFixed(0)} kWh/m²) ligt buiten een gebruikelijke band (30-200). Controleer uw verbruiks- of oppervlakte­invoer.`
      });
    }
  }

  // W02 — SPF te hoog bij hoge afgiftetemperatuur
  if (input.heat_pump?.spf_space > 4.3 && input.building?.afgifte_temp > 45) {
    warnings.push({
      id: 'W02', severity: 'warning',
      message: `Een SPF van ${input.heat_pump.spf_space} is optimistisch bij hoge afgiftetemperatuur (${input.building.afgifte_temp}°C). Een installateur kan dit valideren met een dimensionerings­berekening.`
    });
  }

  // W03 — gas-vaste kost weg terwijl gas blijft voor DHW/koken
  if (input.old_system?.gas_for_cooking_dhw_after_switch === false
      && (input.old_system?.dhw_share_fuel > 0 || input.old_system?.cooking_share_fuel > 0)
      && (input.new_system?.fixed_costs ?? 0) === 0) {
    warnings.push({
      id: 'W03', severity: 'warning',
      message: 'U heeft de vaste gaskosten op nul gezet, terwijl er nog gasverbruik voor sanitair warm water of koken is. De gasaansluiting blijft dan typisch behouden.'
    });
  }

  // W04 — koeling aan zonder vraag
  if (input.heat_pump?.cooling_enabled && (input.heat_pump?.cooling_demand_kwh ?? 0) === 0) {
    warnings.push({
      id: 'W04', severity: 'info',
      message: 'Koeling is ingeschakeld zonder een geschatte koudevraag. Voor een eerlijke vergelijking moeten extra elektriciteitskosten opgenomen worden.'
    });
  }

  // W05 — VERSCHOVEN NAAR V2 (premie-integratie)

  // W06 — geen graaddagcorrectie
  if (!input.building?.hdd_actual) {
    warnings.push({
      id: 'W06', severity: 'info',
      message: 'Geen graaddagcorrectie toegepast. Het resultaat kan ±10% afwijken bij een uitzonderlijke winter.'
    });
  }

  // W07 — btw 6% maar woning < 10 jaar (geen warmtepomp-regeling 2026)
  if (input.investment?.vat_rate === 0.06
      && input.building?.build_year
      && (new Date().getFullYear() - input.building.build_year) < (tariff?.vat?.renovation_min_age_years ?? 10)
      && !input.investment?.replaces_existing_heating) {
    warnings.push({
      id: 'W07', severity: 'warning',
      message: 'BTW 6% bij renovatie geldt voor woningen ouder dan 10 jaar. Verifieer of de aparte warmtepompregeling van 1 januari 2026 in uw geval van toepassing is.'
    });
  }

  // W08 — hybride warmtepomp
  if (input.heat_pump?.type === 'hybride_lucht_water') {
    const f1 = (tariff?.vat?.hybrid_forfait_non_specific_pct ?? 0.65) * 100;
    const f2 = (tariff?.vat?.hybrid_forfait_specific_pct ?? 0.35) * 100;
    warnings.push({
      id: 'W08', severity: 'warning',
      message: `Voor een hybride installatie moet de factuur de uitsplitsing tussen 6%- en 21%-delen vermelden — anders wordt het volledige bedrag aan 21% belast. Bij globale prijs aanvaardt de fiscus een forfaitaire verdeling van ${f2}% (specifiek deel ketel) aan 21% btw + ${f1}% (warmtepomp en niet-specifiek deel) aan 6% btw. Bron: FOD Financiën, Circulaire 2025/C/47.`
    });
  }

  // W09 — default prijzen gebruikt (geen user override)
  const defaultElec = tariff?.energy?.electricity_typical_eur_per_kwh;
  const defaultGas  = tariff?.energy?.gas_typical_eur_per_kwh;
  if ((input.prices?.electricity_eur_per_kwh === defaultElec
       || input.prices?.gas_eur_per_kwh === defaultGas)) {
    warnings.push({
      id: 'W09', severity: 'info',
      message: 'Standaard prijzen toegepast — voor een precieze berekening, voer uw eigen kWh-prijs in (zie V-test of uw jaarafrekening).'
    });
  }

  // W10 — S_year ≤ 0
  if (output.sYear !== null && output.sYear <= 0) {
    warnings.push({
      id: 'W10', severity: 'warning',
      message: 'De jaarlijkse financiële besparing is nul of negatief. Een warmtepomp kan nog steeds zinvol zijn (comfort, koeling, CO₂, toekomstige fossiele heffingen), maar dat is geen klassieke terugverdientijd.'
    });
  }

  // W11 — btw 6% maar geen volledige vervanging
  if (input.investment?.vat_rate === 0.06
      && input.investment?.replaces_existing_heating === false) {
    warnings.push({
      id: 'W11', severity: 'warning',
      message: 'U heeft 6% btw geselecteerd maar aangegeven dat de bestaande verwarming niet volledig wordt vervangen. Voor 6% btw moet de warmtepomp de bestaande hoofdverwarming vervangen (woning wordt fossielvrij). Anders geldt 21%. Bij twijfel — uw installateur bevestigt het tarief op de offerte.'
    });
  }

  return warnings;
}

/* ----------------------------------------------------------------------------
   HOOFDFUNCTIE — calculate
   ---------------------------------------------------------------------------- */

/**
 * Voer de volledige terugverdientijd-berekening uit voor één scenario.
 * v1: GEEN premie afgetrokken. I_cash = gross × (1 + vat_rate).
 *
 * @param {object} input      Volledige input-structuur (zie TERUGVERDIENTIJD_CALCULATOR_PLAN.md Deel 4.1)
 * @param {object} tariff     Tariefblad uit vlaamse-tarieven-2026.json
 * @returns {object}          Output met sYear, pbCash, pbIncr, npv15, breakdowns, warnings
 */
export function calculate(input, tariff) {
  // STAP 1 — Brandstof naar kWh
  const eFuelTotal = convertFuelToKwh(
    input.old_system.annual_consumption,
    input.old_system.unit,
    tariff.conversions
  );

  // STAP 2 — Splitsen ruimteverwarming/DHW/koken
  const { eSpace, eDhw } = splitFuelByUse(
    eFuelTotal,
    input.old_system.dhw_share_fuel,
    input.old_system.cooking_share_fuel
  );

  // STAP 3 — Graaddagcorrectie
  const eSpaceNorm = normalizeForWeather(
    eSpace,
    input.building.hdd_actual,
    input.building.hdd_reference ?? tariff.weather.default
  );

  // STAP 4 — Nuttige warmte (DHW apart rendement!)
  const qSpace = usefulHeat(eSpaceNorm, input.old_system.efficiency_space);
  const qDhw   = usefulHeat(eDhw,       input.old_system.efficiency_dhw);

  // STAP 5/6 — Renovatie-factor + warmtepomp-aandeel
  //
  // heatpump_share = fractie van de ruimteverwarmingsbehoefte die de WP overneemt.
  // - 1.0 (default lucht/water): WP doet alles, oud systeem weg
  // - 0.4 (default lucht/lucht): WP doet bv. de woonkamer, oud systeem rest
  // - 0.85 (default hybride): WP-overheersend met backup-ketel op koude dagen
  // Backwards compat: input.heat_pump.share_space blijft accepteerbaar (legacy alias).
  const heatpumpShare = input.heat_pump.heatpump_share
                     ?? input.heat_pump.share_space
                     ?? defaultHeatpumpShare(input.heat_pump.type);
  const qSpaceFuture = qSpace * (input.building.renovation_factor ?? 1.0);
  const qHpSpace     = qSpaceFuture * heatpumpShare;
  const qBackup      = qSpaceFuture - qHpSpace;
  const qHpDhw       = qDhw * (input.heat_pump.share_dhw ?? 1.0);

  // STAP 7 — Elektriciteit warmtepomp
  const eHpSpace = heatPumpElectricity(qHpSpace, input.heat_pump.spf_space, input.heat_pump.aux_electricity_pct ?? 0);
  const eHpDhw   = heatPumpElectricity(qHpDhw,   input.heat_pump.spf_dhw,   0);
  const eHpHeat  = eHpSpace + eHpDhw;

  // STAP 8 — Resterend brandstofverbruik (back-up / bij-verwarming).
  //
  // Bij hybride: input.heat_pump.backup_efficiency is gezet → gebruik die.
  // Bij lucht-lucht naast bestaande verwarming (heatpump_share < 1, geen
  // hybride backup_efficiency): de oude installatie blijft het rest leveren
  // aan zijn oorspronkelijke rendement. We vallen dan terug op
  // old_system.efficiency_space.
  const remainingHeatEfficiency = input.heat_pump.backup_efficiency
                               ?? (heatpumpShare < 1 ? input.old_system.efficiency_space : 0);
  const eBackupFuel = (qBackup > 0 && remainingHeatEfficiency > 0)
    ? qBackup / remainingHeatEfficiency
    : 0;

  // Koeling
  const eCooling = (input.heat_pump.cooling_enabled && input.heat_pump.seer > 0)
    ? (input.heat_pump.cooling_demand_kwh ?? 0) / input.heat_pump.seer
    : 0;

  // STAP 9 — Jaarlijkse kosten
  const pElecEff = effectiveElectricityPrice(
    input.prices.electricity_eur_per_kwh,
    input.prices.self_consumption_share ?? 0,
    input.prices.injection_compensation_eur_per_kwh ?? 0
  );
  const cCapacityDelta = capacityCostDelta(
    input.heat_pump.peak_power_increase_kw ?? 0,
    input.heat_pump.smart_steering ?? false,
    input.prices.capacity_tariff_eur_per_kw_year ?? tariff.capacity_tariff.fluvius_midden_vlaanderen_eur_per_kw_year_excl_vat
  );
  const { cOld, cNew, sYear } = annualCosts({
    eFuelTotalKwh: eFuelTotal,
    pFuel: input.prices.gas_eur_per_kwh,           // simplified — v1 gebruikt gas-prijs voor brandstof
    eHpTotalKwh: eHpHeat,
    eCoolingKwh: eCooling,
    eBackupFuelKwh: eBackupFuel,
    pElectricityEff: pElecEff,
    cFixedOld: input.old_system.fixed_costs,
    cFixedNew: input.new_system?.fixed_costs ?? 0,
    cCapacityDelta
  });

  // STAP 10 — Netto investering (v1: GEEN premie afgetrokken)
  const vatRate = input.investment.vat_rate
    ?? deriveVatRate(input.investment.replaces_existing_heating ?? false, tariff.vat);
  const iCash = input.investment.gross_cost_excl_vat * (1 + vatRate);
  const iIncremental = iCash - (input.investment.avoided_replacement_cost ?? 0);

  // STAP 11 — Eenvoudige terugverdientijd
  const pbCash = sYear > 0 ? iCash / sYear : null;
  const pbIncr = sYear > 0 ? iIncremental / sYear : null;

  // STAP 12 — NPV over 15 jaar
  const npv15 = npv(
    sYear,
    input.prices.gas_escalation_pct ?? tariff.energy.gas_escalation_pct_per_year ?? 0.03,
    input.prices.discount_rate_pct ?? 0.03,
    15
  ) - iIncremental;

  // CO₂-impact — gebruikt geverifieerde Belgische emissiefactoren
  // (VEKA-VMM januari 2022 voor brandstoffen; AIB residuele mix via VREG voor elek)
  const fuelEmissionKey = resolveFuelEmissionKey(
    input.old_system.unit,
    input.old_system.fuel_type
  );
  const { co2OldKg, co2NewKg, co2SavingsKg } = annualCo2Emissions({
    eFuelTotalKwh:      eFuelTotal,
    eFuelRemainingKwh:  eBackupFuel,
    eElectricityNewKwh: eHpHeat + eCooling,
    fuelEmissionKey,
    emissionFactors:    tariff.emission_factors_kg_co2_per_kwh,
  });

  const output = {
    // Tussenresultaten (voor warnings en transparantie)
    eFuelTotal, eSpace, eSpaceNorm, eDhw,
    qSpace, qDhw, qSpaceFuture, qHpSpace, qHpDhw, qBackup,
    eHpSpace, eHpDhw, eHpHeat, eBackupFuel, eCooling,
    heatpumpShare,
    // KPIs (alle EXCL. PREMIES — zie premie-footnote in UI)
    cOld, cNew, sYear,
    iCash, iIncremental, vatRate,
    pbCash, pbIncr, npv15,
    // CO₂ (kg/jaar)
    co2OldKg, co2NewKg, co2SavingsKg,
    // Legacy aliases voor backwards compat met view-laag (kunnen later weg)
    co2Old: co2OldKg, co2New: co2NewKg, co2Saved: co2SavingsKg,
  };

  output.warnings = generateWarnings(input, output, tariff);

  return output;
}

/* ----------------------------------------------------------------------------
   Scenario-multipliers toepassen
   ---------------------------------------------------------------------------- */

/**
 * Pas een set multipliers toe op een input-structuur.
 *
 * @param {object} input        Basis-input
 * @param {object} multipliers  Object uit SCENARIO_MULTIPLIERS
 * @returns {object}            Nieuwe input (deep clone met multipliers toegepast)
 */
export function applyMultipliers(input, multipliers) {
  // Diep clonen via JSON-roundtrip — input is een data-object zonder methoden
  const out = JSON.parse(JSON.stringify(input));
  if (out.prices) {
    if (typeof multipliers.electricity_eur_per_kwh === 'number') {
      out.prices.electricity_eur_per_kwh *= multipliers.electricity_eur_per_kwh;
    }
    if (typeof multipliers.gas_eur_per_kwh === 'number') {
      out.prices.gas_eur_per_kwh *= multipliers.gas_eur_per_kwh;
    }
    if (typeof multipliers.electricity_escalation_pct === 'number') {
      out.prices.electricity_escalation_pct = multipliers.electricity_escalation_pct;
    }
    if (typeof multipliers.gas_escalation_pct === 'number') {
      out.prices.gas_escalation_pct = multipliers.gas_escalation_pct;
    }
  }
  if (out.heat_pump && typeof multipliers.spf_space === 'number') {
    out.heat_pump.spf_space *= multipliers.spf_space;
  }
  if (out.investment && typeof multipliers.gross_cost_excl_vat === 'number') {
    out.investment.gross_cost_excl_vat *= multipliers.gross_cost_excl_vat;
  }
  if (out.heat_pump && typeof multipliers.capacity_tariff_kw_addition === 'number') {
    out.heat_pump.peak_power_increase_kw =
      (out.heat_pump.peak_power_increase_kw ?? 0) * multipliers.capacity_tariff_kw_addition;
  }
  return out;
}

/* ----------------------------------------------------------------------------
   calculateScenarios — drie scenario's in één call
   ---------------------------------------------------------------------------- */

/**
 * Bereken voorzichtig / realistisch / optimistisch scenario op één set inputs.
 *
 * @param {object} input
 * @param {object} tariff
 * @returns {{ voorzichtig:object, realistisch:object, optimistisch:object }}
 */
export function calculateScenarios(input, tariff) {
  return {
    voorzichtig:  calculate(applyMultipliers(input, SCENARIO_MULTIPLIERS.voorzichtig), tariff),
    realistisch:  calculate(input, tariff),
    optimistisch: calculate(applyMultipliers(input, SCENARIO_MULTIPLIERS.optimistisch), tariff)
  };
}

/* ----------------------------------------------------------------------------
   Tariefblad-loader
   ---------------------------------------------------------------------------- */

/**
 * Valideer een tariefblad-object minimaal (zonder volledig JSON-schema).
 * Gooi een fout als verplichte velden ontbreken.
 *
 * @param {object} tariff
 */
export function validateTariff(tariff) {
  const required = ['_meta', 'premium_link', 'vat', 'capacity_tariff', 'energy', 'conversions', 'weather', 'emission_factors_kg_co2_per_kwh'];
  for (const key of required) {
    if (!tariff[key]) throw new Error(`Tariefblad mist verplicht veld: ${key}`);
  }
  if (typeof tariff.energy.electricity_typical_eur_per_kwh !== 'number') {
    throw new Error('Tariefblad: energy.electricity_typical_eur_per_kwh ontbreekt of is geen getal');
  }
  if (typeof tariff.energy.gas_typical_eur_per_kwh !== 'number') {
    throw new Error('Tariefblad: energy.gas_typical_eur_per_kwh ontbreekt of is geen getal');
  }
  const requiredEmissions = [
    'natural_gas_h', 'electricity_be_residual_mix', 'fuel_oil', 'propane', 'pellets_lifecycle'
  ];
  for (const key of requiredEmissions) {
    if (typeof tariff.emission_factors_kg_co2_per_kwh[key] !== 'number') {
      throw new Error(`Tariefblad: emission_factors_kg_co2_per_kwh.${key} ontbreekt of is geen getal`);
    }
  }
  return tariff;
}

/**
 * Browser-loader: fetch het tariefblad via HTTP.
 * Voor Node-tests: importeer JSON direct met `import fs` en geef het door aan calculate().
 *
 * @param {string} url
 * @returns {Promise<object>}
 */
export async function loadTariffFromUrl(url = '/data/vlaamse-tarieven-2026.json') {
  const response = await fetch(url, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Kon tariefblad niet laden: ${response.status} ${response.statusText}`);
  const tariff = await response.json();
  return validateTariff(tariff);
}
