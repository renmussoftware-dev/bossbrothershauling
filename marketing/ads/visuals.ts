// Brand marks and drawings for the ad creatives.
//
// Everything here comes from the DEPLOYED site (see livesite.ts), not from
// this repo's stale src/. The truck is the exact SVG the live hero renders;
// the logo is the site's own /logo-mark.png, downloaded to brand/.

import * as path from 'path';
import { pathToFileURL } from 'url';
import { TOKENS } from './livesite';

export const LOGO_MARK = pathToFileURL(
  path.join(__dirname, 'brand', 'logo-mark.png'),
).href;

/**
 * The live site's pickup + loaded utility trailer, in the gold-on-black
 * identity. Lifted verbatim from the deployed hero so the ads and the landing
 * page show the same rig. viewBox 0 0 520 360.
 *
 * `uid` keeps gradient ids unique if two copies ever land on one page.
 */
export function truckSvg(width = 880, uid = 't1'): string {
  const wheel = (cx: number, cy: number) => `
    <g>
      <circle cx="${cx}" cy="${cy}" r="26" fill="#0B0B0C"/>
      <circle cx="${cx}" cy="${cy}" r="26" fill="none" stroke="url(#gold${uid})" stroke-width="2" opacity="0.75"/>
      <circle cx="${cx}" cy="${cy}" r="10" fill="#4E4E56"/>
      <circle cx="${cx}" cy="${cy}" r="10" fill="none" stroke="url(#gold${uid})" stroke-width="1.5"/>
    </g>`;
  return `<svg viewBox="0 0 520 360" width="${width}" role="img"
    aria-label="Boss Brothers Hauling pickup truck pulling a loaded utility trailer">
  <defs>
    <linearGradient id="wrap${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#2B2B30"/><stop offset="0.55" stop-color="#151517"/>
      <stop offset="1" stop-color="#0A0A0B"/>
    </linearGradient>
    <linearGradient id="bed${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#232327"/><stop offset="1" stop-color="#101012"/>
    </linearGradient>
    <linearGradient id="gold${uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FBF0C9"/><stop offset="0.45" stop-color="#D4A537"/>
      <stop offset="1" stop-color="#8F661D"/>
    </linearGradient>
  </defs>
  <ellipse cx="260" cy="330" rx="230" ry="20" fill="#000" opacity="0.45"/>
  <rect x="60" y="240" width="220" height="14" rx="3" fill="#0F0F11"/>
  <rect x="62" y="206" width="212" height="7" rx="2" fill="url(#bed${uid})"/>
  <rect x="62" y="204" width="212" height="2" rx="1" fill="url(#gold${uid})" opacity="0.8"/>
  ${[70, 118, 166, 214, 262].map(x => `<rect x="${x}" y="210" width="7" height="32" fill="#232327"/>`).join('')}
  <path d="M68,210 Q95,172 125,200 Q150,168 185,196 Q215,170 250,198 L272,210 L272,240 L68,240 Z" fill="#5E5B56"/>
  <rect x="60" y="228" width="10" height="26" fill="url(#gold${uid})"/>
  <rect x="278" y="244" width="46" height="7" rx="3" fill="#0F0F11"/>
  <circle cx="322" cy="248" r="5" fill="#232327" stroke="#050506" stroke-width="2"/>
  <path d="M316 250 L316 204 L410 204 L410 250 Z" fill="url(#wrap${uid})" stroke="#4A4A52" stroke-width="1.5"/>
  <rect x="316" y="200" width="94" height="8" rx="2" fill="#3A3A42"/>
  <path d="M410 250 L410 204 L418 204 L430 172 L472 172 L484 204 L502 210 L502 250 Z"
    fill="url(#wrap${uid})" stroke="#4A4A52" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M434 178 L468 178 L477 202 L426 202 Z" fill="#3A4A55" opacity="0.85"/>
  <path d="M318 240 L404 232 L416 216 L500 214" fill="none" stroke="url(#gold${uid})"
    stroke-width="3.5" stroke-linecap="round"/>
  <path d="M318 246 L402 239 L414 224 L500 222" fill="none" stroke="url(#gold${uid})"
    stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>
  <rect x="409" y="204" width="2" height="46" fill="#3A3A40" opacity="0.8"/>
  <rect x="497" y="216" width="6" height="9" rx="2" fill="#FBF0C9"/>
  <image href="${LOGO_MARK}" x="336" y="206" width="31" height="42" preserveAspectRatio="xMidYMid meet"/>
  ${wheel(168, 286)}${wheel(355, 286)}${wheel(462, 286)}
</svg>`;
}

/**
 * The site's stacked wordmark: the BB crest, then BOSS / BROTHERS / HAULING,
 * with BROTHERS carrying the gold sheen and HAULING flanked by gold rules.
 */
export function brandLockup(markHeight = 64): string {
  return `<div class="lockup">
    <img class="lockup-mark" src="${LOGO_MARK}" alt="" style="height:${markHeight}px">
    <span class="wordmark">
      <span class="wm-boss">Boss</span>
      <span class="wm-brothers">Brothers</span>
      <span class="wm-hauling"><i></i><span>Hauling</span><i></i></span>
    </span>
  </div>`;
}

/** Small gold dot, the site's list bullet. */
export function dotIcon(size = 16): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 8 8" aria-hidden style="flex:none">
    <circle cx="4" cy="4" r="4" fill="${TOKENS.gold}"/></svg>`;
}

/** Outlined gold check for "what we take" rows. */
export function checkIcon(size = 50): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden style="flex:none">
    <circle cx="28" cy="28" r="25" fill="none" stroke="${TOKENS.gold}" stroke-width="2.5" opacity="0.6"/>
    <path d="M16 29l8 8 16-17" fill="none" stroke="${TOKENS.gold}" stroke-width="4.5"
      stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** Muted cross for a "we can't take this" row. */
export function crossIcon(size = 50): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 56 56" aria-hidden style="flex:none">
    <circle cx="28" cy="28" r="25" fill="none" stroke="${TOKENS.muted}" stroke-width="2.5" opacity="0.5"/>
    <path d="M19 19l18 18M37 19L19 37" fill="none" stroke="${TOKENS.muted}"
      stroke-width="4.5" stroke-linecap="round"/></svg>`;
}

/** Gold stars for a review card. Only ever rendered from a real rating. */
export function starsSvg(count: number, size = 44): string {
  const star = `<path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21.1 7 14.2 2 9.3l6.9-1z"
    fill="${TOKENS.gold}"/>`;
  return `<div class="stars" aria-label="${count} out of 5 stars">${Array.from(
    { length: count },
    () => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden>${star}</svg>`,
  ).join('')}</div>`;
}
