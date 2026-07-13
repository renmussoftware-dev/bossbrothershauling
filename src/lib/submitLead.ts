import type { LeadFormParsed } from "./schema";
import { timeframeOptions } from "./schema";
import { SITE } from "./site";
import type { TripZoneMatch } from "./tripZones";

// ---------------------------------------------------------------------------
// LEAD SUBMISSION — static-host edition (GitHub Pages has no server).
//
// The form posts directly from the browser to a form-capture endpoint set at
// BUILD TIME via NEXT_PUBLIC_LEAD_ENDPOINT (see .env.example / README):
//   • Formspree  — https://formspree.io/f/<id>   (easiest; emails you each lead)
//   • Getform / Basin / Web3Forms — same multipart POST shape
//   • Zapier / Make webhook — catch hook URL
//
// Photos are appended as files; providers that support uploads will attach
// them, others ignore them (the lead text still arrives).
//
// FALLBACK: if no endpoint is configured, we open the visitor's email app with
// a pre-filled lead email to the business address (photos must be attached by
// hand — the copy tells them so). The site stays functional with zero keys.
// ---------------------------------------------------------------------------

export type SubmitOutcome = "sent" | "mailto";

export interface LeadPayload {
  lead: LeadFormParsed;
  estimateLow: number | null;
  estimateHigh: number | null;
  /** Matched trip zone (null when the address wasn't recognized). */
  tripZone: TripZoneMatch | null;
  photos: File[];
}

const ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;

export async function submitLead(payload: LeadPayload): Promise<SubmitOutcome> {
  if (ENDPOINT) {
    const fd = buildFormData(payload);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: fd,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Lead endpoint responded ${res.status}`);
    return "sent";
  }

  // No endpoint configured — fall back to a pre-filled email draft.
  const mailto = buildMailto(payload);
  window.location.href = mailto;
  return "mailto";
}

/** Flat, human-readable field names so provider emails read cleanly. */
function buildFormData({ lead, estimateLow, estimateHigh, tripZone, photos }: LeadPayload): FormData {
  const fd = new FormData();
  fd.append("Name", lead.name);
  fd.append("Phone", lead.phone);
  fd.append("Email", lead.email);
  fd.append("Pickup address", lead.address);
  fd.append("Timeframe", timeframeLabel(lead.timeframe));
  fd.append("Load categories", lead.categories.join(", ") || "—");
  fd.append("Load size", lead.loadSize);
  fd.append("Regular tires", String(lead.regularTires));
  fd.append("Large tires", String(lead.largeTires));
  fd.append("Mattresses", String(lead.mattresses));
  fd.append("Oversized item", lead.oversized ? "yes" : "no");
  fd.append("Notes", lead.otherText || "—");
  fd.append(
    "Estimate range",
    estimateLow != null && estimateHigh != null
      ? `$${estimateLow}–$${estimateHigh}`
      : "n/a",
  );
  fd.append(
    "Trip zone",
    tripZone
      ? `${tripZone.place} (${tripZone.zone}, +$${tripZone.fee} travel)`
      : "unrecognized — confirm on call",
  );
  // Formspree special fields (harmless elsewhere)
  fd.append("_subject", `New hauling lead — ${lead.name}`);
  fd.append("_replyto", lead.email);
  photos.forEach((f, i) => fd.append(`photo${i + 1}`, f, f.name));
  return fd;
}

function buildMailto({ lead, estimateLow, estimateHigh, tripZone, photos }: LeadPayload): string {
  const subject = `Hauling quote request — ${lead.name}`;
  const body = [
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Email: ${lead.email}`,
    `Pickup address: ${lead.address}`,
    `Timeframe: ${timeframeLabel(lead.timeframe)}`,
    ``,
    `Load: ${lead.categories.join(", ") || "—"}`,
    `Load size: ${lead.loadSize}`,
    `Regular tires: ${lead.regularTires} · Large tires: ${lead.largeTires}`,
    `Mattresses: ${lead.mattresses} · Oversized: ${lead.oversized ? "yes" : "no"}`,
    `Notes: ${lead.otherText || "—"}`,
    ``,
    `Site estimate: ${
      estimateLow != null && estimateHigh != null
        ? `$${estimateLow}–$${estimateHigh}`
        : "n/a"
    }`,
    `Trip zone: ${tripZone ? `${tripZone.place} (${tripZone.zone})` : "unrecognized"}`,
    photos.length > 0
      ? `\n(I have ${photos.length} photo${photos.length > 1 ? "s" : ""} of the load — attaching to this email.)`
      : "",
  ].join("\n");

  return `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function timeframeLabel(value: string): string {
  return timeframeOptions.find((t) => t.value === value)?.label ?? value;
}
