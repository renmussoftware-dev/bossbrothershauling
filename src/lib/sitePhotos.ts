// ---------------------------------------------------------------------------
// Photographs used on the website.
//
// Same house rules as the ad pipeline's `marketing/ads/photos.ts`:
//   • Boss Brothers' own photos of Boss Brothers' own jobs. No stock, no
//     AI-generated "job" images.
//   • Anything shot on private property needs that customer's permission;
//     `consent` records it.
//   • Never imply a before/after unless it is genuinely the same spot from a
//     similar angle. Captions here describe only what is actually in frame.
//
// Files live in `public/photos/` and are pre-resized to two widths for srcset.
// `next.config.mjs` sets images.unoptimized (a static export has no image
// server), so these bytes are exactly what a phone downloads — resize at
// build-prep time, never ship a 2000px original.
// ---------------------------------------------------------------------------

export interface SitePhoto {
  /** Basename in /public/photos; files are `${base}-${w}.webp` per width. */
  base: string;
  /** [large, small] — largest first, both emitted into srcset. */
  widths: [number, number];
  /** Intrinsic size of the LARGE variant, so the browser can reserve space. */
  width: number;
  height: number;
  /** What the picture actually shows (screen readers + honesty check). */
  alt: string;
  /** Shown under the photo. Describes the frame, claims nothing extra. */
  caption?: string;
  /** Which job it came from, for the handover audit. */
  job: string;
  /**
   *  'owned' — Boss Brothers' own people/property or a public place.
   *  'given' — the property owner confirmed it can be used.
   */
  consent: "owned" | "given";
}

export const PHOTOS = {
  brothersTruck: {
    base: "brothers-truck",
    widths: [1600, 800],
    width: 1600,
    height: 922,
    alt: "The two Boss Brothers standing either side of their wrapped hauling truck",
    job: "The owners with the business truck, shot in a driveway.",
    consent: "owned",
  },
  brothersHandshake: {
    base: "brothers-handshake",
    widths: [900, 600],
    width: 900,
    height: 675,
    alt: "The two Boss Brothers shaking hands in front of the wrapped truck",
    job: "The owners with the business truck, same session.",
    consent: "owned",
  },
  debrisPile: {
    base: "newbuild-debris-pile",
    widths: [1000, 600],
    width: 1000,
    height: 750,
    alt: "A pile of framing lumber, pallets and tree stumps in front of a new brick house",
    caption: "Construction debris stacked out front of a new build.",
    job: "New-construction site cleanout — the pile, before loading.",
    consent: "given",
  },
  loadedRig: {
    base: "newbuild-loaded-rig",
    widths: [1000, 600],
    width: 1000,
    height: 750,
    alt: "The Boss Brothers truck and trailer loaded with lumber outside the same house",
    caption: "Same job, loaded on the trailer and headed for the landfill.",
    job: "New-construction site cleanout — the loaded rig at the curb.",
    consent: "given",
  },
  sideYard: {
    base: "newbuild-side-yard",
    widths: [1000, 600],
    width: 1000,
    height: 750,
    alt: "The side yard of the same new build, looking toward the neighbouring house",
    caption: "The same lot, looking down the side yard.",
    job: "New-construction site cleanout — side yard, same visit.",
    consent: "given",
  },
  truckDriveway: {
    base: "truck-driveway",
    widths: [800, 400],
    width: 800,
    height: 1067,
    alt: "The wrapped Boss Brothers Hauling pickup parked in a driveway",
    caption: "What pulls up: one truck, one trailer, two brothers.",
    job: "The business truck, shot in a residential driveway.",
    consent: "given",
  },
} satisfies Record<string, SitePhoto>;

/** `srcset` value for a photo: every width it was generated at. */
export function srcSet(photo: SitePhoto): string {
  return photo.widths
    .map((w) => `/photos/${photo.base}-${w}.webp ${w}w`)
    .join(", ");
}

/** Fallback `src` — the largest variant, for anything ignoring srcset. */
export function src(photo: SitePhoto): string {
  return `/photos/${photo.base}-${photo.widths[0]}.webp`;
}
