// Photo manifest.
//
// Ads that use photographs read from here. A creative naming a photo that is
// missing or not cleared is reported as BLOCKED; the rest still render.
//
// ---------------------------------------------------------------------------
// RULES FOR WHAT GOES IN photos/ — read before adding anything
// ---------------------------------------------------------------------------
//  • Boss Brothers' own photos of Boss Brothers' own jobs. No stock, no
//    AI-generated "job" images. Both are deceptive in a service ad, and stock
//    junk piles are recognisable to anyone who has scrolled a marketplace.
//  • Anything shot on private property needs that customer's permission.
//    `consent` below records whether the owner has confirmed it.
//  • A before/after pair must be the SAME spot from a similar camera angle.
//    A wide "before" against a tight "after" reads as a trick.
//  • .heic will not load — Chrome can't render it here. Convert to JPEG first.

import * as fs from 'fs';
import * as path from 'path';
import { pathToFileURL } from 'url';

export const PHOTO_DIR = path.join(__dirname, 'photos');

export interface Photo {
  /** Filename inside marketing/ads/photos/. */
  file: string;
  /** What the picture actually shows. */
  alt: string;
  /** Which job it came from, for the handover audit. */
  job: string;
  /**
   * Customer permission for a shot on private property.
   *  'owned'    — Boss Brothers' own property or a public place; nothing needed.
   *  'given'    — the customer has confirmed it can be used in advertising.
   *  'pending'  — supplied for ad use but permission not yet confirmed in writing.
   */
  consent: 'owned' | 'given' | 'pending';
}

export const PHOTOS: Photo[] = [
  {
    file: 'truck-wrapped.jpg',
    alt: 'The wrapped Boss Brothers Hauling pickup truck',
    job: 'The business truck, shot in a parking lot. No readable plates in frame.',
    consent: 'owned',
  },
  {
    file: 'garage-before-wide.jpg',
    alt: 'A garage packed with boxes and bags before a Boss Brothers cleanout',
    job: 'Garage cleanout — BEFORE (wide, from the garage door).',
    consent: 'pending',
  },
  {
    file: 'garage-before-close.jpg',
    alt: 'The same garage pile, closer in',
    job: 'Garage cleanout — BEFORE (closer, from inside).',
    consent: 'pending',
  },
  {
    file: 'trailer-loaded.jpg',
    alt: 'The Boss Brothers trailer loaded and tarped at the curb',
    job: 'Garage cleanout — the loaded trailer. Shot on a residential street.',
    consent: 'pending',
  },
  {
    file: 'rig-loaded.jpg',
    alt: 'The Boss Brothers truck and trailer loaded at the curb',
    job: 'Garage cleanout — truck and trailer loaded. Shot on a residential street.',
    consent: 'pending',
  },
  // MISSING: 'garage-after.jpg' — the empty-garage AFTER shot. It arrived as
  // .heic, which cannot be rendered here. Re-export as JPEG to unblock the
  // before/after creative, the best performer for this trade.
];

export function photoPath(file: string): string {
  return path.join(PHOTO_DIR, file);
}

/** file:// URL, which is what headless Chrome needs. */
export function photoUrl(file: string): string {
  return pathToFileURL(photoPath(file)).href;
}

export function findPhoto(file: string): Photo | undefined {
  return PHOTOS.find(p => p.file === file);
}

/**
 * Why this photo can't be used yet, or undefined when it's fine.
 *
 * 'pending' consent does NOT block rendering: the owner supplied these for ad
 * use. It is surfaced in the claim audit instead, so the permission question
 * is answered before anything is actually published.
 */
export function photoReady(file: string): string | undefined {
  const p = findPhoto(file);
  if (!p) return `photos.ts has no entry for ${file}`;
  if (!fs.existsSync(photoPath(p.file))) return `missing file photos/${p.file}`;
  return undefined;
}

/** Photos that still need the customer's written permission before publishing. */
export function pendingConsent(): Photo[] {
  return PHOTOS.filter(p => p.consent === 'pending');
}
