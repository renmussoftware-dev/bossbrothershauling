import { z } from "zod";

// ---------------------------------------------------------------------------
// Validation for the full estimator + intake form (React Hook Form + Zod).
// Photos are handled as File objects in component state (not here) because the
// browser File type doesn't round-trip through Zod cleanly.
// ---------------------------------------------------------------------------

const loadCategory = z.enum(["household", "yard", "appliances", "construction"]);

const loadSize = z.enum(["quarter", "half", "full"]);

export const timeframeOptions = [
  { value: "asap", label: "As soon as possible" },
  { value: "this-week", label: "This week" },
  { value: "this-weekend", label: "This weekend" },
  { value: "flexible", label: "I'm flexible" },
  { value: "just-pricing", label: "Just getting a price for now" },
] as const;

const timeframe = z.enum([
  "asap",
  "this-week",
  "this-weekend",
  "flexible",
  "just-pricing",
]);

// Loose US phone check — accepts (850) 555-0199, 850-555-0199, 8505550199, etc.
const phoneRegex = /^[\d\s().+-]{7,20}$/;

export const leadSchema = z
  .object({
    // --- Step 1: what's in the load ---
    categories: z.array(loadCategory).default([]),
    regularTires: z.coerce.number().int().min(0).max(200).default(0),
    largeTires: z.coerce.number().int().min(0).max(200).default(0),
    mattresses: z.coerce.number().int().min(0).max(50).default(0),
    oversized: z.boolean().default(false),
    otherText: z.string().max(500).optional().default(""),

    // --- Step 2: how big ---
    loadSize: loadSize,

    // --- Step 4: contact ---
    name: z.string().min(2, "Please enter your name"),
    phone: z.string().regex(phoneRegex, "Please enter a valid phone number"),
    email: z.string().email("Please enter a valid email"),
    address: z.string().min(5, "Please enter the pickup address"),
    timeframe: timeframe,
    // Staging policy: crew loads from a reachable pile (driveway/curb/carport),
    // never from inside garages or interior spaces. Must be acknowledged.
    stagedReady: z.boolean().refine((v) => v === true, {
      message:
        "Please confirm your items will be pulled out and ready for pickup.",
    }),
  })
  .superRefine((data, ctx) => {
    // The load must contain SOMETHING — a category, tires, a mattress,
    // an oversized flag, or a free-text description.
    const hasSomething =
      data.categories.length > 0 ||
      data.regularTires > 0 ||
      data.largeTires > 0 ||
      data.mattresses > 0 ||
      data.oversized ||
      (data.otherText?.trim().length ?? 0) > 0;

    if (!hasSomething) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Add at least one item to your load so we can price it.",
        path: ["categories"],
      });
    }
  });

export type LeadFormValues = z.input<typeof leadSchema>;
export type LeadFormParsed = z.output<typeof leadSchema>;
