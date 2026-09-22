// Five ad layouts, each rendered at three sizes.
//
// The size table below drives everything: it sets the viewport and a set of
// CSS custom properties, and the layouts adapt (headline size, how many rows
// fit, where the button sits). Content stays inside `.safe`, which on 9:16 is
// pulled ~14% in from top and bottom and clear of the right-hand action rail
// that Stories, Reels and TikTok all draw over.
//
// Anything that overflows its box gets a RED OUTLINE in the render, so copy
// that is too long is obvious in the contact sheet instead of shipping.
//
// Nothing smaller than 28px at 1080 wide — that is the phone-legibility floor.

import { TOKENS } from './livesite';

export type SizeKey = '4x5' | '9x16' | '1x1';

export interface SizeSpec {
  key: SizeKey;
  w: number;
  h: number;
  use: string;
  /** Safe-area insets, in px. */
  pad: { t: number; r: number; b: number; l: number };
  /** Type scale. Every value here must stay >= 28. */
  type: {
    eyebrow: number; headline: number; sub: number; price: number;
    priceNote: number; cta: number; rowTitle: number; rowDetail: number;
    chip: number; quote: number; phone: number;
  };
  /** How much list content this size can hold. */
  caps: { rows: number; bullets: number };
}

export const SIZES: Record<SizeKey, SizeSpec> = {
  // The primary. Facebook and Instagram feed.
  '4x5': {
    key: '4x5', w: 1080, h: 1350, use: 'Facebook / Instagram feed',
    pad: { t: 84, r: 80, b: 84, l: 80 },
    type: { eyebrow: 28, headline: 74, sub: 32, price: 132, priceNote: 30,
            cta: 34, rowTitle: 36, rowDetail: 28, chip: 34, quote: 44, phone: 34 },
    caps: { rows: 5, bullets: 4 },
  },
  // Stories, Reels and TikTok. The right inset clears the action rail; the
  // deep top/bottom insets clear the tabs, caption and sound bar.
  '9x16': {
    key: '9x16', w: 1080, h: 1920, use: 'Stories / Reels / TikTok',
    pad: { t: 272, r: 150, b: 330, l: 80 },
    type: { eyebrow: 30, headline: 84, sub: 34, price: 150, priceNote: 32,
            cta: 36, rowTitle: 38, rowDetail: 29, chip: 36, quote: 48, phone: 36 },
    caps: { rows: 6, bullets: 5 },
  },
  // Square placements and Google.
  '1x1': {
    key: '1x1', w: 1080, h: 1080, use: 'Square placements / Google',
    pad: { t: 72, r: 72, b: 72, l: 72 },
    type: { eyebrow: 28, headline: 60, sub: 29, price: 108, priceNote: 28,
            cta: 32, rowTitle: 32, rowDetail: 28, chip: 32, quote: 38, phone: 30 },
    caps: { rows: 4, bullets: 3 },
  },
};

export const SIZE_KEYS = Object.keys(SIZES) as SizeKey[];

// --- Layout shapes ---------------------------------------------------------

export interface Row {
  /** 'check' | 'cross' | raw HTML (a numeral, a service glyph). */
  mark?: string;
  title: string;
  detail?: string;
}

/** One half of a before/after pair. */
export interface Panel {
  label: string;
  /** file:// URL of the photo. */
  src: string;
  alt: string;
}

export type Layout =
  | { template: 'A'; eyebrow: string; headline: string; accent?: string;
      before: Panel; after: Panel; cta: string }
  | { template: 'B'; eyebrow: string; headline: string; accent?: string;
      price?: { big: string; note?: string }; sub?: string; bullets?: string[];
      truck?: boolean; photo?: { src: string; alt: string }; cta: string }
  | { template: 'C'; eyebrow: string; headline: string; accent?: string;
      sub?: string; rows: Row[]; cta: string }
  | { template: 'D'; eyebrow: string; headline: string; accent?: string;
      sub?: string; chips: string[]; cta: string }
  | { template: 'E'; eyebrow: string; quote: string; stars: string;
      attribution: string; cta: string };

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// --- CSS -------------------------------------------------------------------

/**
 * Row padding and gap per size. The square is the tightest canvas, so its
 * checklist rows sit closer together to keep four services on the card.
 */
const ROW_METRICS: Record<SizeKey, { pad: string; gap: number }> = {
  '4x5': { pad: '18px 24px', gap: 14 },
  '9x16': { pad: '20px 26px', gap: 16 },
  '1x1': { pad: '12px 20px', gap: 10 },
};

function cssVars(s: SizeSpec): string {
  const t = s.type;
  const r = ROW_METRICS[s.key];
  return `
:root {
  --w: ${s.w}px; --h: ${s.h}px;
  --pad-t: ${s.pad.t}px; --pad-r: ${s.pad.r}px; --pad-b: ${s.pad.b}px; --pad-l: ${s.pad.l}px;
  --eyebrow: ${t.eyebrow}px; --headline: ${t.headline}px; --sub: ${t.sub}px;
  --price: ${t.price}px; --price-note: ${t.priceNote}px; --cta: ${t.cta}px;
  --row-title: ${t.rowTitle}px; --row-detail: ${t.rowDetail}px; --chip: ${t.chip}px;
  --quote: ${t.quote}px; --phone: ${t.phone}px;
  --row-pad: ${r.pad}; --row-gap: ${r.gap}px;
  --ink: ${TOKENS.ink}; --ink-panel: ${TOKENS.inkPanel};
  --bone: ${TOKENS.bone}; --muted: ${TOKENS.muted};
  --gold: ${TOKENS.gold}; --gold-soft: ${TOKENS.goldSoft};
  --panel-edge: ${TOKENS.panelEdge}; --radius: ${TOKENS.radius};
  --font-display: ${TOKENS.fontDisplay}; --font-label: ${TOKENS.fontLabel};
  --font-body: ${TOKENS.fontBody};
}`;
}

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body {
  width: var(--w); height: var(--h); overflow: hidden;
  background: var(--ink); color: var(--bone);
}
body {
  position: relative; font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
}
/* A single warm gold bloom — the same restraint the live page shows. */
body::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(900px 720px at 82% 4%, rgba(212,165,55,0.10), transparent 70%),
    linear-gradient(to top, #100F0E, transparent 45%);
}
.safe {
  position: absolute; top: var(--pad-t); left: var(--pad-l);
  right: var(--pad-r); bottom: var(--pad-b);
  display: flex; flex-direction: column; overflow: hidden;
}

/* --- shared type ------------------------------------------------------- */
.eyebrow {
  font-family: var(--font-label); font-weight: 500; font-size: var(--eyebrow);
  line-height: 1.2; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--gold-soft); margin-bottom: 24px;
}
/* Cinzel is a caps face; the site sets no text-transform and lets it read. */
.headline {
  font-family: var(--font-display); font-weight: 700; font-size: var(--headline);
  line-height: 1.04; letter-spacing: 0.005em; color: var(--bone);
}
/* The hero's gold sheen, painted through the glyphs. */
.headline .accent {
  display: block;
  background: ${TOKENS.goldSheen};
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.sub {
  font-size: var(--sub); line-height: 1.45; color: var(--muted);
  margin-top: 26px; max-width: 25em;
}
.copy { flex: none; }

/* --- hazard rule ------------------------------------------------------- */
/* The live page's section divider: an 8px gold stripe at 20% opacity. */
.haz-rule {
  flex: none; height: 8px; background: ${TOKENS.stripe};
  opacity: 0.2; margin: 26px 0;
}

/* --- body area --------------------------------------------------------- */
.visual {
  flex: 0 1 auto; min-height: 0; display: flex; flex-direction: column;
  align-items: flex-start; justify-content: flex-start; gap: 30px;
  width: 100%;
}
.visual.has-photo { flex: 1 1 auto; }
.visual svg { max-width: 100%; height: auto; }
.photo-fill {
  align-self: stretch; flex: 1 1 auto; min-height: 0; overflow: hidden;
  border-radius: var(--radius); border: 1px solid var(--panel-edge);
  background: var(--ink-panel);
}
.photo-fill img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* --- price ------------------------------------------------------------- */
/* The site's card treatment: charcoal ramp, hairline gold edge. */
.price-panel {
  align-self: stretch; background: ${TOKENS.panel};
  border: 1px solid var(--panel-edge); border-radius: var(--radius);
  padding: 32px 36px;
}
.price {
  font-family: var(--font-display); font-weight: 700; font-size: var(--price);
  line-height: 0.95;
  background: ${TOKENS.goldSheen};
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.price-note {
  font-size: var(--price-note); line-height: 1.4;
  color: var(--muted); margin-top: 16px;
}

/* --- bullets ----------------------------------------------------------- */
.bullets { display: flex; flex-direction: column; gap: 22px; width: 100%; }
.bullet {
  display: flex; align-items: center; gap: 18px;
  font-size: var(--row-title); font-weight: 500; color: var(--bone);
}

/* --- rows (checklist / process) ---------------------------------------- */
.rows {
  flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;
  justify-content: center; gap: var(--row-gap); margin-top: 26px; width: 100%;
}
.row {
  display: flex; align-items: center; gap: 22px; background: ${TOKENS.panel};
  border: 1px solid var(--panel-edge); border-radius: var(--radius);
  padding: var(--row-pad);
}
.row .mark {
  flex: none; display: flex; align-items: center;
  justify-content: center; width: 64px;
}
.row .mark .num {
  font-family: var(--font-display); font-weight: 700;
  font-size: calc(var(--row-title) * 1.3); color: var(--gold); line-height: 1;
}
.row .main { flex: 1 1 auto; min-width: 0; }
.row .title {
  font-family: var(--font-label); font-weight: 500; font-size: var(--row-title);
  line-height: 1.1; text-transform: uppercase; letter-spacing: 0.06em;
  color: var(--bone); white-space: nowrap;
}
.row .detail {
  font-size: var(--row-detail); line-height: 1.35;
  color: var(--muted); margin-top: 6px;
}
.row.off { background: transparent; border-style: dashed; }
.row.off .title { color: var(--muted); }

/* --- town chips -------------------------------------------------------- */
.chips { display: flex; flex-wrap: wrap; gap: 16px; align-content: center; }
.chip {
  font-family: var(--font-label); font-weight: 500; font-size: var(--chip);
  text-transform: uppercase; letter-spacing: 0.14em; color: var(--bone);
  background: ${TOKENS.panel}; border: 1px solid var(--panel-edge);
  border-radius: 999px; padding: 15px 30px; white-space: nowrap;
}

/* --- before / after ---------------------------------------------------- */
.compare { flex: 1 1 auto; min-height: 0; display: flex; gap: 20px; margin-top: 26px; }
.compare.stack { flex-direction: column; }
.pane { flex: 1 1 0; min-width: 0; min-height: 0; display: flex; flex-direction: column; }
.pane .pane-label {
  font-family: var(--font-label); font-weight: 500; font-size: var(--eyebrow);
  letter-spacing: 0.16em; text-transform: uppercase;
  letter-spacing: 0.22em; color: var(--muted); margin-bottom: 12px;
}
.pane.after .pane-label { color: var(--gold-soft); }
.pane .shot {
  flex: 1 1 auto; min-height: 0; border-radius: 20px; overflow: hidden;
  border: 1px solid var(--panel-edge); background: var(--ink-panel);
}
.pane .shot img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* --- quote card -------------------------------------------------------- */
.quote-card {
  flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column;
  justify-content: center; gap: 26px; background: ${TOKENS.panel};
  border: 1px solid var(--panel-edge); border-radius: var(--radius); padding: 44px;
}
.stars { display: flex; gap: 8px; }
.quote { font-family: var(--font-display); font-size: var(--quote); line-height: 1.32; color: var(--bone); }
.attribution { font-family: var(--font-label); letter-spacing: 0.1em; text-transform: uppercase;
  font-size: var(--price-note); color: var(--muted); }

/* --- footer: phone + one call to action -------------------------------- */
.foot {
  flex: none; display: flex; flex-direction: column;
  align-items: flex-start; gap: 16px; margin-top: auto; padding-top: 28px;
}
.cta {
  display: inline-flex; align-items: center; background: var(--gold);
  color: var(--ink); font-family: var(--font-label); font-weight: 600; font-size: var(--cta);
  text-transform: uppercase; letter-spacing: 0.1em; padding: 20px 38px;
  border-radius: 12px; white-space: nowrap;
}
/* The site's stacked lockup: crest, then BOSS / BROTHERS / - HAULING - */
.lockup { display: flex; align-items: center; gap: 18px; }
.lockup-mark { width: auto; display: block; }
.wordmark { display: flex; flex-direction: column; align-items: flex-start; line-height: 1; }
.wordmark > span { font-family: var(--font-display); text-transform: uppercase; white-space: nowrap; }
.wm-boss { font-weight: 700; font-size: var(--phone); letter-spacing: 0.14em;
  margin-right: -0.14em; color: var(--bone); }
.wm-brothers { font-weight: 600; font-size: calc(var(--phone) * 0.56); letter-spacing: 0.22em;
  margin-right: -0.22em; margin-top: 4px;
  background: ${TOKENS.goldSheen}; -webkit-background-clip: text; background-clip: text; color: transparent; }
.wm-hauling { display: flex; align-items: center; gap: 8px; margin-top: 6px;
  font-size: calc(var(--phone) * 0.5); letter-spacing: 0.3em; color: rgba(246,243,236,0.9); }
.wm-hauling i { display: block; height: 1px; width: 14px; background: var(--gold); flex: none; }
.wm-hauling > span { margin-right: -0.3em; }
.brand { display: flex; align-items: baseline; gap: 16px; }
.brand .where { font-family: var(--font-label); font-size: var(--eyebrow);
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); }
`;

// Overflow check. Sideways overflow on text, either direction on containers.
const FIT_CHECK = `
const flag = el => { el.style.outline = '8px solid #ff2a2a'; el.style.outlineOffset = '-8px'; };
const done = () => {
  for (const el of document.querySelectorAll('.fit')) {
    if (el.scrollWidth > el.clientWidth + 4) flag(el);
  }
  for (const el of document.querySelectorAll('.safe, .visual, .rows, .compare, .chips, .quote-card')) {
    if (el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4) flag(el);
  }
};
if (document.fonts && document.fonts.ready) document.fonts.ready.then(done); else done();
`;

// --- Layout bodies ---------------------------------------------------------

export interface RenderContext {
  phone: string;
  serviceArea: string;
  /** Mark HTML ('check', 'cross', 'dot'), injected so templates stay free of drawing code. */
  marks: Record<string, string>;
  truck: string;
  /** Logo + wordmark lockup, so every ad carries the brand. */
  brand: string;
}

function foot(cta: string, ctx: RenderContext): string {
  return `<div class="foot">
    <div class="cta fit">${esc(cta)}</div>
    ${ctx.brand}
    <div class="brand"><span class="where fit">${esc(ctx.serviceArea)}</span></div>
  </div>`;
}

function head(eyebrow: string, headline: string, accent?: string, sub?: string): string {
  return `<div class="copy">
    <div class="eyebrow fit">${esc(eyebrow)}</div>
    <h1 class="headline">${esc(headline)}${accent ? `<span class="accent">${esc(accent)}</span>` : ''}</h1>
    ${sub ? `<p class="sub">${esc(sub)}</p>` : ''}
  </div>`;
}

function rowHtml(r: Row, marks: Record<string, string>): string {
  const mark = r.mark ? (marks[r.mark] ?? r.mark) : '';
  const off = r.mark === 'cross' ? ' off' : '';
  return `<div class="row${off}">
    ${mark ? `<div class="mark">${mark}</div>` : ''}
    <div class="main"><div class="title fit">${esc(r.title)}</div>
      ${r.detail ? `<div class="detail">${esc(r.detail)}</div>` : ''}</div>
  </div>`;
}

function body(layout: Layout, size: SizeSpec, ctx: RenderContext): string {
  const F = foot(layout.cta, ctx);

  switch (layout.template) {
    case 'A': {
      // 9:16 has the height for a stacked pair; the wider ratios go side by side.
      const stack = size.key === '9x16' ? ' stack' : '';
      const pane = (p: Panel, cls: string) => `<div class="pane ${cls}">
        <div class="pane-label fit">${esc(p.label)}</div>
        <div class="shot"><img src="${p.src}" alt="${esc(p.alt)}"></div>
      </div>`;
      return `<main class="safe">
        ${head(layout.eyebrow, layout.headline, layout.accent)}
        <div class="compare${stack}">${pane(layout.before, 'before')}${pane(layout.after, 'after')}</div>
        ${F}
      </main>`;
    }
    case 'B': {
      const bullets = layout.bullets?.slice(0, size.caps.bullets);
      return `<main class="safe">
        ${head(layout.eyebrow, layout.headline, layout.accent, layout.sub)}
        <div class="haz-rule"></div>
        <div class="visual${layout.photo ? ' has-photo' : ''}">
          ${layout.price ? `<div class="price-panel"><div class="price fit">${esc(layout.price.big)}</div>
            ${layout.price.note ? `<div class="price-note">${esc(layout.price.note)}</div>` : ''}</div>` : ''}
          ${bullets && bullets.length ? `<div class="bullets">${bullets
            .map(b => `<div class="bullet fit">${ctx.marks.dot}<span>${esc(b)}</span></div>`)
            .join('')}</div>` : ''}
          ${layout.photo ? `<div class="shot photo-fill"><img src="${layout.photo.src}" alt="${esc(layout.photo.alt)}"></div>` : ''}
          ${layout.truck ? ctx.truck : ''}
        </div>
        ${F}
      </main>`;
    }
    case 'C':
      return `<main class="safe">
        ${head(layout.eyebrow, layout.headline, layout.accent, layout.sub)}
        <div class="rows">${layout.rows.slice(0, size.caps.rows)
          .map(r => rowHtml(r, ctx.marks)).join('')}</div>
        ${F}
      </main>`;
    case 'D':
      return `<main class="safe">
        ${head(layout.eyebrow, layout.headline, layout.accent, layout.sub)}
        <div class="haz-rule"></div>
        <div class="visual"><div class="chips">${layout.chips
          .map(c => `<span class="chip fit">${esc(c)}</span>`).join('')}</div></div>
        ${F}
      </main>`;
    case 'E':
      return `<main class="safe">
        <div class="copy"><div class="eyebrow fit">${esc(layout.eyebrow)}</div></div>
        <div class="quote-card">
          ${layout.stars}
          <div class="quote">${esc(layout.quote)}</div>
          <div class="attribution fit">${esc(layout.attribution)}</div>
        </div>
        ${F}
      </main>`;
  }
}

export function renderHtml(layout: Layout, size: SizeSpec, ctx: RenderContext): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Oswald:wght@400;500;600&family=Inter:wght@400;500;600&display=block" rel="stylesheet">
<style>${cssVars(size)}${CSS}</style>
</head>
<body>
${body(layout, size, ctx)}
<script>${FIT_CHECK}</script>
</body>
</html>`;
}
