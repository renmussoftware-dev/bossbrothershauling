// ---------------------------------------------------------------------------
// Shared domain types for the estimator + lead intake.
// ---------------------------------------------------------------------------

/** The bulk material categories a customer can put in their load. */
export type LoadCategory =
  | "household" // general household junk / furniture
  | "yard" // branches, leaves, clippings, land-clearing
  | "appliances" // washer, dryer, fridge, metal, scrap
  | "construction"; // shingles, wood, drywall, demo debris

/** Truck-bed fill selection. */
export type LoadSize = "quarter" | "half" | "full";

/** Everything the calculator needs to produce an estimate. */
export interface EstimateInput {
  /** Bulk categories the customer selected. */
  categories: LoadCategory[];
  /** Number of regular residential car/truck tires. */
  regularTires: number;
  /** Number of large truck / racing tires. */
  largeTires: number;
  /** Count of mattresses (special-handling item). */
  mattresses: number;
  /** Customer flagged an oversized / special-handling item. */
  oversized: boolean;
  /** Truck-bed fill selection. */
  loadSize: LoadSize;
}

/**
 * Customer-facing estimate result.
 * IMPORTANT: this intentionally contains ONLY numbers the customer may see.
 * The markup multiplier and raw landfill/dump cost are never included here.
 */
export interface EstimateResult {
  low: number; // low end of the customer estimate range, in whole dollars
  high: number; // high end of the customer estimate range, in whole dollars
  loadSizeLabel: string; // "Quarter load", etc.
  /** True when the load has a special-handling item worth calling out in the UI. */
  hasSpecialHandling: boolean;
}
