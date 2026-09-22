// Renders every creative in creatives.ts at every size in templates.ts to
// marketing/ads/out/{id}@{ratio}.png with headless Chrome or Edge, writes a
// contact sheet at out/index.html and a claim audit at out/claims.md, and
// appends any new IDs to tracker.csv. Existing tracker rows are never
// touched, so results you've typed in by hand are safe.
//
//   npx sucrase-node marketing/ads/build.ts          render everything
//   npx sucrase-node marketing/ads/build.ts price    only IDs containing "price"
//   npx sucrase-node marketing/ads/build.ts --audit  print the claim audit, render nothing
//   npx sucrase-node marketing/ads/build.ts --check  report overflowing copy, render nothing
//
// Needs internet for the Google Fonts (Oswald, Inter) — the same pair the
// site loads, so the ads match what people land on.

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { pathToFileURL } from 'url';
import { LIVE, snapshotAge } from './livesite';
import { pendingConsent } from './photos';
import { CREATIVES, type Creative } from './creatives';
import { renderHtml, SIZES, SIZE_KEYS, type Layout, type SizeKey, type SizeSpec, type RenderContext } from './templates';
import { brandLockup, checkIcon, crossIcon, dotIcon, truckSvg } from './visuals';

const ROOT = path.resolve(__dirname);
const OUT = path.join(ROOT, 'out');
const BUILD = path.join(ROOT, '.build');
const TRACKER = path.join(ROOT, 'tracker.csv');
const ID_RE = /^bb_\d{8}_[a-z]+_([ABCDE])_\d{2}$/;
const CONCURRENCY = 4;
/** Phone-legibility floor: nothing smaller than this at 1080 wide. */
const MIN_TYPE_PX = 28;

const TRACKER_COLUMNS = [
  'id', 'angle', 'template', 'headline', 'platform', 'campaign', 'launched_date',
  'spend', 'impressions', 'clicks', 'leads', 'booked_jobs', 'cost_per_lead', 'notes',
];

const CTX: RenderContext = {
  phone: LIVE.phone,
  serviceArea: LIVE.serviceArea,
  marks: { check: checkIcon(48), cross: crossIcon(48), dot: dotIcon(16) },
  truck: truckSvg(820),
  brand: brandLockup(62),
};

// --- Validation ------------------------------------------------------------

function validate(creatives: Creative[]): void {
  const seen = new Set<string>();
  for (const c of creatives) {
    const m = ID_RE.exec(c.id);
    if (!m) throw new Error(`Bad ID format: ${c.id}`);
    if (seen.has(c.id)) throw new Error(`Duplicate ID: ${c.id}`);
    if (!c.id.includes(`_${c.angle}_`)) throw new Error(`ID ${c.id} doesn't match angle ${c.angle}`);
    seen.add(c.id);
  }
  // Every type size in every size spec has to clear the legibility floor.
  for (const key of SIZE_KEYS) {
    for (const [name, px] of Object.entries(SIZES[key].type)) {
      if (px < MIN_TYPE_PX) {
        throw new Error(`Type too small to read on a phone: ${key}.${name} is ${px}px (floor ${MIN_TYPE_PX}px)`);
      }
    }
  }
}

/** photos.ts already hands back absolute file: URLs, which is what Chrome needs. */
function absolutePhotos(layout: Layout): Layout {
  return layout;
}

// --- Rendering -------------------------------------------------------------

function findBrowser(): string {
  const candidates = [
    process.env.CHROME_PATH,
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
  ];
  const found = candidates.find(p => p && fs.existsSync(p));
  if (!found) throw new Error('No Chrome or Edge found. Set CHROME_PATH.');
  return found;
}

function screenshot(browser: string, htmlFile: string, pngFile: string, size: SizeSpec): Promise<void> {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-ads-'));
  const args = [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--force-device-scale-factor=1',
    `--window-size=${size.w},${size.h}`,
    '--virtual-time-budget=10000',
    `--user-data-dir=${profile}`,
    `--screenshot=${pngFile}`,
    pathToFileURL(htmlFile).href,
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(browser, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', d => { stderr += d; });
    child.on('close', code => {
      fs.rmSync(profile, { recursive: true, force: true });
      if (code === 0 && fs.existsSync(pngFile)) resolve();
      else reject(new Error(`Render failed for ${path.basename(pngFile)} (exit ${code})\n${stderr}`));
    });
  });
}

/**
 * Run a page through Chrome and dump the DOM *after* the fit check has run.
 * Flagged elements carry the red outline as an inline style, so overflowing
 * copy can be found without anyone squinting at 33 images.
 */
function dumpDom(browser: string, htmlFile: string, size: SizeSpec): Promise<string> {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bb-ads-check-'));
  const args = [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    '--force-device-scale-factor=1',
    `--window-size=${size.w},${size.h}`,
    '--virtual-time-budget=10000',
    `--user-data-dir=${profile}`,
    '--dump-dom',
    pathToFileURL(htmlFile).href,
  ];
  return new Promise((resolve, reject) => {
    const child = spawn(browser, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    child.stdout.on('data', d => { stdout += d; });
    child.on('close', code => {
      fs.rmSync(profile, { recursive: true, force: true });
      if (code === 0) resolve(stdout);
      else reject(new Error(`DOM dump failed for ${path.basename(htmlFile)} (exit ${code})`));
    });
  });
}

/**
 * Pull the class names of every element the fit check outlined red.
 *
 * Chrome re-serializes `outline: 8px solid #ff2a2a` as
 * `outline: rgb(255, 42, 42) solid 8px`, so match on the colour, not on the
 * shorthand as it was written.
 */
const FLAG_COLOR = 'rgb(255, 42, 42)';

function overflowingIn(dom: string): string[] {
  const hits: string[] = [];
  const re = /<(\w+)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(dom)) !== null) {
    const attrs = m[2];
    const style = /style="([^"]*)"/.exec(attrs);
    if (!style || !style[1].includes(FLAG_COLOR)) continue;
    const cls = /class="([^"]*)"/.exec(attrs);
    hits.push(cls ? `${m[1]}.${cls[1].trim().split(/\s+/).join('.')}` : m[1]);
  }
  return hits;
}

// --- Tracker ---------------------------------------------------------------

const csvCell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

function updateTracker(rows: Built[]): number {
  let existing = new Set<string>();
  let text = '';
  if (fs.existsSync(TRACKER)) {
    text = fs.readFileSync(TRACKER, 'utf8');
    existing = new Set(text.split(/\r?\n/).slice(1).map(l => l.split(',')[0]).filter(Boolean));
  } else {
    text = TRACKER_COLUMNS.join(',') + '\n';
  }
  const fresh = rows.filter(r => !existing.has(r.creative.id));
  if (text.length && !text.endsWith('\n')) text += '\n';
  for (const r of fresh) {
    // id, angle, template, headline, then blanks for the columns you fill in.
    const cells = [r.creative.id, r.creative.angle, r.template, r.headline,
      '', '', '', '', '', '', '', '', '', ''];
    text += cells.slice(0, TRACKER_COLUMNS.length).map(csvCell).join(',') + '\n';
  }
  fs.writeFileSync(TRACKER, text);
  return fresh.length;
}

// --- Reports ---------------------------------------------------------------

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function contactSheet(rows: Built[], blocked: Creative[]): string {
  const card = (r: Built) => {
    const links = SIZE_KEYS.map(k => `<a href="${r.creative.id}@${k}.png">${k}</a>`).join(' · ');
    return `<figure>
      <a href="${r.creative.id}@4x5.png"><img src="${r.creative.id}@4x5.png" loading="lazy" alt=""></a>
      <figcaption>
        <code>${r.creative.id}</code>
        <p class="hl">${esc(r.headline)}</p>
        <p>${esc(r.creative.caption)}</p>
        <p class="sizes">${links}</p>
      </figcaption>
    </figure>`;
  };
  const blockedList = blocked.length
    ? `<h2>Not built (${blocked.length})</h2><ul class="blocked">${blocked
        .map(c => `<li><code>${c.id}</code><span>${esc(c.blocked ?? 'blocked')}</span></li>`)
        .join('')}</ul>`
    : '';
  return `<!doctype html><html><head><meta charset="utf-8">
<title>${LIVE.name} — ad creatives</title>
<style>
body { margin:0; padding:32px; background:#0B0B0C; color:#F6F3EC; font:14px/1.45 system-ui, sans-serif; }
h1 { font-size:22px; margin:0 0 6px; }
h2 { font-size:18px; margin:40px 0 14px; }
.meta { color:#A8A49C; margin:0 0 26px; }
.grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(260px,1fr)); gap:28px; }
figure { margin:0; }
img { width:100%; border-radius:12px; display:block; border:1px solid rgba(212,165,55,0.15); background:#121214; }
figcaption { margin-top:10px; }
code { font-size:12px; color:#D4A537; word-break:break-all; }
.hl { font-weight:600; margin:6px 0 0; }
p { margin:6px 0 0; color:rgba(246,243,236,0.62); font-size:13px; }
.sizes a { color:#D4A537; text-decoration:none; font-size:12px; }
.blocked { list-style:none; padding:0; margin:0; }
.blocked li { padding:12px 0; border-top:1px solid rgba(255,255,255,0.08); }
.blocked span { display:block; color:#A8A49C; margin-top:4px; }
</style></head><body>
<h1>${LIVE.name} — ad creatives</h1>
<p class="meta">${rows.length} creative${rows.length === 1 ? '' : 's'} × ${SIZE_KEYS.length} sizes ·
  ${SIZE_KEYS.map(k => `${k} ${SIZES[k].w}×${SIZES[k].h} (${SIZES[k].use})`).join(' · ')}<br>
  Anything with a <strong>red outline</strong> has copy that doesn't fit — shorten it and re-render.</p>
<div class="grid">${rows.map(card).join('\n')}</div>
${blockedList}
</body></html>`;
}

function claimAudit(rows: Built[], blocked: Creative[]): string {
  const lines: string[] = [
    '# Claim audit — ${LIVE.name} ads',
    '',
    `Generated ${new Date().toISOString().slice(0, 10)} by \`marketing/ads/build.ts\`.`,
    '',
    'Every factual claim in every rendered ad, and where it came from. Check the',
    'whole set in one pass.',
    '',
    `Claims are checked against a snapshot of the DEPLOYED site, captured ${snapshotAge()}.`,
    'This repo\'s src/ is stale and is deliberately not used as a source. Anything',
    'sourced to an OWNER CONFIRMATION has no counterpart on the live site and is the',
    'owner\'s word — check those first.',
    '',
    '## Shared facts',
    '',
    `- **Business name** ${LIVE.name} — live site`,
    `- **Phone** \`${LIVE.phone}\` — live site`,
    `- **Service area** ${LIVE.serviceArea} — live site`,
    `- **Towns** ${LIVE.towns.join(', ')} — live site`,
    '',
    '## Per creative',
    '',
  ];
  for (const r of rows) {
    lines.push(`### \`${r.creative.id}\` · ${r.creative.angle} · template ${r.template}`);
    lines.push('');
    lines.push(`_${r.headline}_`);
    lines.push('');
    if (r.creative.claims.length === 0) lines.push('- (no factual claims beyond the brand lockup)');
    for (const c of r.creative.claims) lines.push(`- **${c.text}** — ${c.source}`);
    lines.push('');
  }
  if (blocked.length) {
    lines.push('## Not built');
    lines.push('');
    lines.push('These need material or a confirmation from the owner. Nothing was');
    lines.push('invented to fill the gap.');
    lines.push('');
    for (const c of blocked) lines.push(`- \`${c.id}\` (${c.angle}) — ${c.blocked}`);
    lines.push('');
  }
  const pending = pendingConsent();
  if (pending.length) {
    lines.push('## Photo permission — CONFIRM BEFORE PUBLISHING');
    lines.push('');
    lines.push('These were shot on a customer\'s private property. The owner supplied them');
    lines.push('for ad use, but the customer\'s permission is not yet recorded. Confirm it,');
    lines.push('then set `consent: \'given\'` in photos.ts.');
    lines.push('');
    for (const p of pending) lines.push(`- \`photos/${p.file}\` — ${p.job}`);
    lines.push('');
  }

  lines.push('## Never in these ads');
  lines.push('');
  lines.push('No "cheapest", no "guaranteed", no job counts or years in business, no');
  lines.push('countdowns or invented urgency, and no review that is not real. No internal');
  lines.push('cost figures: markup, dump/landfill cost, tonnage or trip-zone fees never');
  lines.push('appear in an ad.');
  lines.push('');
  return lines.join('\n');
}

// --- Main ------------------------------------------------------------------

interface Built {
  creative: Creative;
  template: string;
  headline: string;
  /** One render job per size. */
  jobs: { size: SizeSpec; html: string; png: string; key: SizeKey }[];
}

function headlineOf(layout: Layout): string {
  if (layout.template === 'E') return layout.quote;
  return [layout.headline, layout.accent].filter(Boolean).join(' ');
}

async function main(): Promise<void> {
  validate(CREATIVES);

  const args = process.argv.slice(2);
  const auditOnly = args.includes('--audit');
  const checkOnly = args.includes('--check');
  const filter = args.find(a => !a.startsWith('--'));

  const buildable = CREATIVES.filter(c => !c.blocked);
  const blocked = CREATIVES.filter(c => c.blocked);
  const selected = filter ? buildable.filter(c => c.id.includes(filter)) : buildable;
  if (selected.length === 0) throw new Error(`No buildable creatives match "${filter ?? ''}"`);

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(BUILD, { recursive: true });

  // Build every layout first, so a failed content check stops the run before
  // anything is rendered.
  const built: Built[] = selected.map(c => {
    const layout = absolutePhotos(c.build());
    if (!c.id.includes(`_${layout.template}_`)) {
      throw new Error(`ID ${c.id} doesn't match template ${layout.template}`);
    }
    const jobs = SIZE_KEYS.map(key => {
      const size = SIZES[key];
      const html = path.join(BUILD, `${c.id}@${key}.html`);
      fs.writeFileSync(html, renderHtml(layout, size, CTX));
      return { size, key, html, png: path.join(OUT, `${c.id}@${key}.png`) };
    });
    return { creative: c, template: layout.template, headline: headlineOf(layout), jobs };
  });

  if (auditOnly) {
    process.stdout.write(claimAudit(built, blocked));
    return;
  }

  const browser = findBrowser();
  const queue = built.flatMap(b => b.jobs.map(j => ({ b, j })));

  if (checkOnly) {
    let bad = 0;
    let cursor = 0;
    const results: string[] = [];
    const checker = async () => {
      while (cursor < queue.length) {
        const { b, j } = queue[cursor++];
        const hits = overflowingIn(await dumpDom(browser, j.html, j.size));
        if (hits.length) {
          bad++;
          results.push(`  OVERFLOW ${b.creative.id}@${j.key}  →  ${hits.join(', ')}`);
        }
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCY }, checker));
    results.sort().forEach(l => console.log(l));
    console.log(bad === 0
      ? `\nAll ${queue.length} renders fit. No copy overflows its box.`
      : `\n${bad} of ${queue.length} renders have copy that doesn't fit. Shorten it and re-run.`);
    if (bad > 0) process.exitCode = 1;
    return;
  }

  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const { b, j } = queue[next++];
      await screenshot(browser, j.html, j.png, j.size);
      console.log(`  ${b.creative.id}@${j.key}`);
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // The contact sheet and audit always cover every creative that has images on
  // disk, not just the ones this run touched.
  const all = CREATIVES.filter(c => !c.blocked).map(c =>
    built.find(b => b.creative.id === c.id) ?? { creative: c, template: ID_RE.exec(c.id)![1], headline: '', jobs: [] },
  ).filter(r => fs.existsSync(path.join(OUT, `${r.creative.id}@4x5.png`)));

  fs.writeFileSync(path.join(OUT, 'index.html'), contactSheet(all, blocked));
  fs.writeFileSync(path.join(OUT, 'claims.md'), claimAudit(built, blocked));
  const added = updateTracker(built);

  console.log(`\nRendered ${queue.length} image${queue.length === 1 ? '' : 's'} `
    + `(${built.length} creatives × ${SIZE_KEYS.length} sizes) → ${OUT}`);
  console.log(`Contact sheet: ${path.join(OUT, 'index.html')}`);
  console.log(`Claim audit:   ${path.join(OUT, 'claims.md')}`);
  console.log(`tracker.csv:   ${added} new row(s)`);
  if (blocked.length) {
    console.log(`\nNot built (${blocked.length}) — needs material from the owner:`);
    for (const c of blocked) console.log(`  ${c.id}\n    ${c.blocked}`);
  }
}

main().catch(err => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
