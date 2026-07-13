// ===========================================================================
// PRICING ENGINE — Boss Bros Hauling
// ===========================================================================
//
// This is the single source of truth for the customer-facing estimate.
// It is a DETERMINISTIC calculator (no AI, no randomness) so the same load
// always produces the same range.
//
// ---------------------------------------------------------------------------
// HOW TO UPDATE PRICES (read this first)
// ---------------------------------------------------------------------------
// Everything the business pays or charges lives in the `PRICING` object below.
// When the Santa Rosa County Central Landfill publishes a new rate sheet, or
// when the owners want to change their margins, edit those constants ONLY —
// no other file needs to change. Each value is commented with what it is.
//
// The two levers the owners will touch most often:
//   • PRICING.markup       -> your margin (labor, fuel, drive time, truck wear)
//   • PRICING.serviceMinimumLow -> the smallest job price you'll advertise
//
// ---------------------------------------------------------------------------
// WHAT THE CUSTOMER SEES vs WHAT THEY DON'T
// ---------------------------------------------------------------------------
// The customer NEVER sees: the markup multiplier, the raw landfill/dump cost,
// or the tonnage math. `calculateEstimate()` returns only a rounded dollar
// RANGE plus a couple of display labels. Keep it that way.
// ===========================================================================

import type { EstimateInput, EstimateResult, LoadSize } from "./types";

export const PRICING = {
  // --- Landfill disposal rates ------------------------------------------
  // Source: Santa Rosa County Central Landfill rate sheet, effective 2026-01-01.
  // These are what Boss Bros PAYS at the dump — never shown to the customer.
  landfill: {
    householdPerTon: 50, // Class I household waste, $/ton
    classIIIPerTon: 50, // Class III construction/demo waste, $/ton
    yardWastePerTon: 25, // PURE yard-waste load only (no mixing), $/ton
    tireRegular: 5, // residential car/truck tire, $ each
    tireLarge: 15, // large truck / racing tire, $ each
    specialWastePerTon: 158, // mattresses / oversized / hard-to-handle, $/ton
    specialWasteMinimum: 100, // per-LOAD minimum for any special-waste item
    transactionMinimum: 10, // $10 minimum charge on any landfill transaction
  },

  // --- Estimated tonnage per load size ----------------------------------
  // A quarter/half load is treated as a single tonnage; a full load is a
  // genuine range because weight varies a lot at 2–3 tons.
  tonnage: {
    quarter: { low: 0.5, high: 0.5 },
    half: { low: 1, high: 1 },
    full: { low: 2, high: 3 },
  },

  // --- Customer markup multiplier ---------------------------------------
  // Covers labor, fuel, drive time, and truck wear. This is the business's
  // margin. NEVER expose these numbers or the pre-markup total to the customer.
  markup: { low: 2.5, high: 3.5 },

  // --- Display tuning ----------------------------------------------------
  serviceMinimumLow: 75, // smallest low-end price we'll ever show a customer
  roundTo: 5, // round the displayed range to the nearest $5

  // Human-readable labels for each load size.
  loadSizeLabels: {
    quarter: "Quarter load",
    half: "Half load",
    full: "Full truck load",
  } as Record<LoadSize, string>,
} as const;

/**
 * A load is charged the lower yard-waste rate ONLY when it is pure yard waste:
 * yard waste is the sole bulk category and nothing else bulky is mixed in.
 * Any mixing with household/appliance/construction material bumps the whole
 * load to the higher $50/ton rate (mixed loads are never charged the low rate).
 * Tires and mattresses are separate line-item fees and don't affect this.
 */
export function isPureYardWaste(input: EstimateInput): boolean {
  const bulky = input.categories;
  return bulky.length === 1 && bulky[0] === "yard";
}

/**
 * Produce the customer-facing estimate RANGE.
 *
 * Steps (mirrors the documented pricing logic):
 *  1. Estimate tonnage from the load-size selection.
 *  2. Pick the disposal rate ($25 pure yard waste, else $50).
 *  3. dump cost = tonnage × rate, floored at the $10 transaction minimum.
 *  4. Add flat per-item landfill fees (tires; special-waste minimum).
 *  5. Multiply the (dump cost + fees) total by the markup range.
 *  6. Floor the low end at the advertised service minimum, round to $5.
 *
 * Returns ONLY customer-safe fields.
 */
export function calculateEstimate(input: EstimateInput): EstimateResult {
  const { landfill, tonnage, markup, serviceMinimumLow, roundTo, loadSizeLabels } =
    PRICING;

  // 1. Tonnage for the selected load size.
  const tons = tonnage[input.loadSize];

  // 2. Disposal rate: pure yard waste gets the discount, everything else $50/ton.
  const ratePerTon = isPureYardWaste(input)
    ? landfill.yardWastePerTon
    : landfill.householdPerTon;

  // 3. Dump cost from tonnage, floored at the transaction minimum.
  const dumpLow = Math.max(tons.low * ratePerTon, landfill.transactionMinimum);
  const dumpHigh = Math.max(tons.high * ratePerTon, landfill.transactionMinimum);

  // 4. Flat per-item landfill fees.
  const tireFees =
    input.regularTires * landfill.tireRegular +
    input.largeTires * landfill.tireLarge;
  const hasSpecial = input.mattresses > 0 || input.oversized;
  const specialFees = hasSpecial ? landfill.specialWasteMinimum : 0;
  const fees = tireFees + specialFees;

  // 5. Apply the markup range to the (dump cost + fees) total.
  const rawLow = (dumpLow + fees) * markup.low;
  const rawHigh = (dumpHigh + fees) * markup.high;

  // 6. Floor the low end, round the range outward to the nearest $5.
  let low = Math.floor(Math.max(rawLow, serviceMinimumLow) / roundTo) * roundTo;
  let high = Math.ceil(rawHigh / roundTo) * roundTo;

  // Safety: keep a sensible spread if flooring collapsed the two ends together.
  if (high <= low) high = low + roundTo * 3;

  return {
    low,
    high,
    loadSizeLabel: loadSizeLabels[input.loadSize],
    hasSpecialHandling: hasSpecial,
  };
}

/** Format a range as a display string, e.g. "$150–$225". */
export function formatEstimateRange(result: EstimateResult): string {
  const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;
  return `${fmt(result.low)}–${fmt(result.high)}`;
}
