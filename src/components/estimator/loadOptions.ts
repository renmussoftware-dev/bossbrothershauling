import type { LoadCategory, LoadSize } from "@/lib/types";
import type { JunkIcon } from "./DumpBed";

// Customer-side copy for each bulk category. Labels are written from the
// customer's point of view ("What's in your load?"), never as waste-codes.
export const CATEGORY_OPTIONS: {
  value: LoadCategory;
  icon: JunkIcon;
  label: string;
  hint: string;
}[] = [
  {
    value: "household",
    icon: "household",
    label: "Household junk & furniture",
    hint: "Couches, tables, boxes, storage unit contents, general clutter",
  },
  {
    value: "yard",
    icon: "yard",
    label: "Yard waste",
    hint: "Branches, leaves, clippings, land-clearing debris",
  },
  {
    value: "appliances",
    icon: "appliances",
    label: "Appliances, metal & scrap",
    hint: "Washer, dryer, fridge, grills, scrap metal",
  },
  {
    value: "construction",
    icon: "construction",
    label: "Construction & demo debris",
    hint: "Shingles, wood, drywall, remodel leftovers",
  },
];

export const LOAD_SIZE_OPTIONS: {
  value: LoadSize;
  label: string;
  blurb: string;
}[] = [
  {
    value: "quarter",
    label: "Quarter load",
    blurb: "A few items — think a small pickup bed corner.",
  },
  {
    value: "half",
    label: "Half load",
    blurb: "A room's worth, or half the truck bed.",
  },
  {
    value: "full",
    label: "Full truck load",
    blurb: "The whole bed, piled up. Big cleanouts.",
  },
];
