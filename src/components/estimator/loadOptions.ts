import type { LoadCategory } from "@/lib/types";
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
