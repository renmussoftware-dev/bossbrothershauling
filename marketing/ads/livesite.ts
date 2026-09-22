// ===========================================================================
// THE LIVE SITE IS THE SOURCE OF TRUTH — not this repo.
// ===========================================================================
//
// The deployed site at bossbrothershauling.com is AHEAD of this repository.
// As of 2026-09-20 the repo's src/ still has the old "Boss Bros" name, the
// orange/yellow palette and a live-pricing estimator; the deployed site has a
// gold-on-black identity, the name "Boss Brothers Hauling", and a photo-based
// quote flow with no prices anywhere.
//
// So ads are checked against a snapshot of the DEPLOYED page, not against
// src/lib/*.ts. Importing the stale modules would have produced ads that are
// "derived from code" while still being wrong on the customer's screen.
//
//   Refresh the snapshot after any site deploy:
//     curl -sS -o marketing/ads/brand/site-snapshot.html https://bossbrothershauling.com/
//
// Every phrase an ad borrows is asserted against that snapshot, so a site
// rewrite fails this build instead of shipping an ad that no longer matches.

import * as fs from 'fs';
import * as path from 'path';

const SNAPSHOT = path.join(__dirname, 'brand', 'site-snapshot.html');

/** Visible text of the deployed page, normalised for phrase matching. */
function pageText(): string {
  const html = fs.readFileSync(SNAPSHOT, 'utf8');
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;|&#39;|&rsquo;|’/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&amp;|&#38;/g, '&')
    .replace(/&mdash;|—/g, '—')
    .replace(/&nbsp;|\s+/g, ' ')
    .trim();
}

let cached: string | null = null;
function text(): string {
  if (cached === null) cached = pageText();
  return cached;
}

export function snapshotAge(): string {
  return fs.statSync(SNAPSHOT).mtime.toISOString().slice(0, 10);
}

/** Assert a phrase still appears on the deployed page. */
export function liveHas(phrase: string): void {
  const needle = phrase.replace(/’/g, "'").replace(/\s+/g, ' ').trim();
  if (!text().includes(needle)) {
    throw new Error(
      `Live-site check failed: the deployed page no longer contains "${phrase}".\n` +
      `  Snapshot: ${SNAPSHOT} (captured ${snapshotAge()})\n` +
      `  Re-capture it, then update the ad copy that borrowed this line.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Facts, each verified against the snapshot below.
// ---------------------------------------------------------------------------

export const LIVE = {
  name: 'Boss Brothers Hauling',
  phone: '(850) 281-5184',
  domain: 'bossbrothershauling.com',
  serviceArea: 'Santa Rosa County, FL',
  towns: ['Milton', 'Pace', 'Navarre', 'Gulf Breeze', 'Bagdad', 'Holley'],
} as const;

/**
 * Design tokens read off the deployed page's computed styles on 2026-09-20.
 * Gold on near-black; Cinzel for display, Oswald for labels and buttons,
 * Inter for body copy — the three families the site actually loads.
 */
export const TOKENS = {
  ink: '#0B0B0C',          // page background
  inkPanel: '#121214',     // panel floor
  bone: '#F6F3EC',         // headline text
  muted: '#A8A49C',        // body text
  gold: '#D4A537',         // primary / CTA
  goldSoft: '#EFD27A',     // kickers and small accents
  goldDeep: '#8F661D',     // gradient shadow end
  /** The hero's gold-sheen gradient, used with background-clip: text. */
  goldSheen:
    'linear-gradient(#FBF0C9, #E5BC55 38%, #B8862A 52%, #F0DA9B 74%, #C9992E)',
  /** Card surface: the site's 160deg charcoal ramp with a hairline gold edge. */
  panel: 'linear-gradient(160deg, #26262A, #1B1B1E 45%, #121214)',
  panelEdge: 'rgba(212, 165, 55, 0.15)',
  /** Section divider: gold hazard stripe at 8px, 20% opacity. */
  stripe:
    'repeating-linear-gradient(45deg, #D4A537 0 14px, #0B0B0C 14px 28px)',
  radius: '16px',
  fontDisplay: "'Cinzel', Georgia, serif",
  fontLabel: "'Oswald', system-ui, sans-serif",
  fontBody: "'Inter', system-ui, sans-serif",
} as const;

// --- Verify the facts above are really on the page -------------------------

liveHas(LIVE.name);
liveHas(LIVE.phone);
liveHas(LIVE.serviceArea);
for (const t of LIVE.towns) liveHas(t);

/**
 * The deployed site quotes NO prices. It promises the opposite: a real person
 * calling back with an exact price. Assert that, because it is the single
 * most important constraint on what these ads may say.
 */
liveHas('No online guesses and no surprise charges');
liveHas("We'll call with your price");
