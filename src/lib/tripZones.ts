// ===========================================================================
// TRIP ZONES — zone-based travel fee from a simple zip/city lookup table.
//
// No live distance API, no per-request cost: the customer's address text is
// matched against the tables below (zip code first, then city name) and the
// zone's flat fee is folded into the estimate range. The customer never sees
// the fee itemized — they just see "✓ <their town> — in our service area" and
// a range that already includes travel.
//
// HOW TO TUNE (owners):
//   • Change the fees in TRIP_ZONES below.
//   • Add/move zips in ZIP_TO_ZONE and towns in CITY_TO_ZONE as you learn
//     which runs actually cost you time. Zips win over city names when both
//     match. Unrecognized addresses get NO fee — you confirm price on the
//     call anyway, so unknowns stay conservative rather than scaring leads.
//
// Fees are flat dollars added AFTER the markup multiplier (drive time is a
// fixed cost per trip — it shouldn't get multiplied like dump costs are).
// ===========================================================================

export type TripZoneKey = "home" | "county" | "extended";

export const TRIP_ZONES: Record<TripZoneKey, { fee: number }> = {
  home: { fee: 0 }, // Milton / Pace / Bagdad — our backyard
  county: { fee: 25 }, // rest of Santa Rosa County (Navarre, Gulf Breeze, Jay)
  extended: { fee: 50 }, // neighboring-county runs (Pensacola side, FWB side)
};

// --- Zip → zone (checked first; most reliable signal in an address) --------
const ZIP_TO_ZONE: Record<string, { zone: TripZoneKey; place: string }> = {
  // home — Milton / Pace / Bagdad
  "32570": { zone: "home", place: "Milton" },
  "32571": { zone: "home", place: "Pace" },
  "32572": { zone: "home", place: "Milton" },
  "32583": { zone: "home", place: "Milton" },
  "32530": { zone: "home", place: "Bagdad" },

  // county — south & north ends of Santa Rosa
  "32566": { zone: "county", place: "Navarre" },
  "32561": { zone: "county", place: "Gulf Breeze" },
  "32563": { zone: "county", place: "Gulf Breeze" },
  "32565": { zone: "county", place: "Jay" },

  // extended — Pensacola side (Escambia Co.)
  "32501": { zone: "extended", place: "Pensacola" },
  "32502": { zone: "extended", place: "Pensacola" },
  "32503": { zone: "extended", place: "Pensacola" },
  "32504": { zone: "extended", place: "Pensacola" },
  "32505": { zone: "extended", place: "Pensacola" },
  "32506": { zone: "extended", place: "Pensacola" },
  "32507": { zone: "extended", place: "Pensacola" },
  "32514": { zone: "extended", place: "Pensacola" },
  "32526": { zone: "extended", place: "Pensacola" },
  "32533": { zone: "extended", place: "Cantonment" },
  "32534": { zone: "extended", place: "Pensacola" },

  // extended — Fort Walton side (Okaloosa Co.)
  "32569": { zone: "extended", place: "Mary Esther" },
  "32547": { zone: "extended", place: "Fort Walton Beach" },
  "32548": { zone: "extended", place: "Fort Walton Beach" },
};

// --- City name → zone (fallback when no zip typed) --------------------------
// Keys are matched as whole words, case-insensitive, in the address text.
const CITY_TO_ZONE: Record<string, { zone: TripZoneKey; place: string }> = {
  milton: { zone: "home", place: "Milton" },
  pace: { zone: "home", place: "Pace" },
  bagdad: { zone: "home", place: "Bagdad" },

  navarre: { zone: "county", place: "Navarre" },
  "gulf breeze": { zone: "county", place: "Gulf Breeze" },
  holley: { zone: "county", place: "Holley" },
  jay: { zone: "county", place: "Jay" },

  pensacola: { zone: "extended", place: "Pensacola" },
  cantonment: { zone: "extended", place: "Cantonment" },
  "ferry pass": { zone: "extended", place: "Ferry Pass" },
  "mary esther": { zone: "extended", place: "Mary Esther" },
  "fort walton": { zone: "extended", place: "Fort Walton Beach" },
};

export interface TripZoneMatch {
  zone: TripZoneKey;
  fee: number;
  /** Pretty place name to echo back to the customer ("Navarre"). */
  place: string;
}

/**
 * Match an address string to a trip zone. Zip beats city name ("Navarre" in
 * a Milton mailing address won't override a 32570 zip). Returns null when
 * nothing recognizable is found — treated as no fee upstream.
 */
export function matchTripZone(address: string): TripZoneMatch | null {
  if (!address || address.trim().length < 3) return null;

  // 1) Zip: any 5-digit run starting with 3 (FL panhandle zips are 32xxx).
  const zipMatches = address.match(/\b3\d{4}\b/g) ?? [];
  for (const zip of zipMatches) {
    const hit = ZIP_TO_ZONE[zip];
    if (hit) return { zone: hit.zone, fee: TRIP_ZONES[hit.zone].fee, place: hit.place };
  }

  // 2) City name, whole-word, case-insensitive. Longer names first so
  //    "gulf breeze" wins over a hypothetical shorter overlap.
  const lower = address.toLowerCase();
  const names = Object.keys(CITY_TO_ZONE).sort((a, b) => b.length - a.length);
  for (const name of names) {
    const re = new RegExp(`\\b${name.replace(/ /g, "\\s+")}\\b`, "i");
    if (re.test(lower)) {
      const hit = CITY_TO_ZONE[name];
      return { zone: hit.zone, fee: TRIP_ZONES[hit.zone].fee, place: hit.place };
    }
  }

  return null;
}
