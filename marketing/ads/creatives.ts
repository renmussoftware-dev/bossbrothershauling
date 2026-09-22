// The creative library.
//
// IDs are permanent: they're how a row in tracker.csv maps back to an image,
// so never renumber or reuse one. Add new creatives with a new date or the
// next number.
//
//   ID format: bb_{YYYYMMDD}_{angle}_{template}_{nn}
//   Templates: A before/after photo · B offer card · C checklist
//              D service area · E review card
//
// ---------------------------------------------------------------------------
// WHERE THE FACTS COME FROM
// ---------------------------------------------------------------------------
// The DEPLOYED site, via livesite.ts — not this repo's src/, which is stale
// (old "Boss Bros" name, orange palette, a live-pricing estimator the deployed
// site no longer has). Every borrowed line is asserted against a snapshot of
// the deployed page, so a site rewrite fails this build instead of shipping an
// ad that contradicts the landing page.
//
// Dollar figures are the one exception, and they are labelled as such: the
// live site quotes NO prices at all, so the price line is an OWNER-CONFIRMED
// claim with no on-site counterpart. See PRICE_LINE below.
//
// Never in here: "cheapest", "guaranteed", job counts, years in business, fake
// urgency, countdowns, or a review that isn't real.

import type { Layout } from './templates';
import { LIVE, liveHas } from './livesite';
import { PHOTOS, photoReady, photoUrl } from './photos';

export interface Claim {
  /** The claim, as it appears in the ad. */
  text: string;
  /** Where it came from: the live page, or a dated owner confirmation. */
  source: string;
}

export interface Creative {
  id: string;
  angle: string;
  /** Suggested primary text for the post. Plain, no emoji, no exclamation marks. */
  caption: string;
  claims: Claim[];
  build: () => Layout;
  /** Set when the creative can't be rendered yet; the build reports it. */
  blocked?: string;
}

// --- Sources ---------------------------------------------------------------

const SRC_LIVE = 'live site (bossbrothershauling.com)';
const SRC_OWNER = 'OWNER CONFIRMATION 2026-09-20 — not on the live site';
const SRC_TRUCK = 'the business\'s own truck wrap, photo supplied by the owner 2026-09-20';
const SRC_PHOTO = 'owner-supplied job photo, 2026-09-20';

/**
 * The advertised price floors.
 *
 * IMPORTANT: these are the owner's numbers, confirmed 2026-09-20. They are NOT
 * on the live site and cannot be checked against it — the deployed page's whole
 * promise is "no online guesses", an exact price on a call. This repo's
 * src/lib/pricing.ts does compute $75 and $125, but nothing deployed uses that
 * file, so it is not a real source. Treat this line as the owner's word.
 */
const SINGLE_FROM = 75;
const LOAD_FROM = 125;
const PRICE_LINE = `Single items from $${SINGLE_FROM}. Loads from $${LOAD_FROM}.`;

const CTA = `Call ${LIVE.phone}`;
const AREA = LIVE.serviceArea;
const D = '20260920';

const phoneClaim: Claim = { text: LIVE.phone, source: SRC_LIVE };
const priceClaim: Claim = { text: PRICE_LINE, source: SRC_OWNER };

// --- Copy borrowed from the deployed page, each verified -------------------

liveHas('If you can pile it up, we can haul it off.');
liveHas('One local crew for the stuff you want gone.');
liveHas('No dumpster to rent, no trailer to borrow');
liveHas('we handle all the loading');
liveHas('Branches, leaves, storm mess, land-clearing debris.');
liveHas("Pile it up and we'll haul it off so your yard's ready to use again.");
liveHas('Washers, dryers, fridges, grills, metal and scrap.');
liveHas('Get it to the driveway or carport and the heavy, awkward part is on us.');
liveHas('Shingles, lumber, drywall, remodel leftovers.');
liveHas('Contractor or DIY, we clear the site so you can get back to work.');
liveHas('Furniture, old clutter, garage, estate, and storage unit cleanouts.');
liveHas('Three steps. No surprises.');
liveHas('Two brothers, one truck, zero runaround.');
liveHas('We do the lifting');
liveHas('Free quote from your photos');
liveHas("Show us the pile. We'll call with your price.");
liveHas('Send us a couple photos of what you need gone');
liveHas('We call you with an exact price');
liveHas('nothing to pay until you say yes');
liveHas('where the truck can reach it');
liveHas('Proudly hauling across Santa Rosa County.');
liveHas('minutes from NAS Whiting Field');
liveHas('storage unit cleanouts, move-out hauls, and beat-the-deadline pickups');

// ---------------------------------------------------------------------------

export const CREATIVES: Creative[] = [
  // ── The quote promise — the live site's own strongest angle ──────────────
  {
    id: `bb_${D}_quote_B_01`,
    angle: 'quote',
    caption: `Show us the pile and we'll call with your price. Send a few photos, one of the brothers looks them over, and you get an exact number before we haul anything. ${CTA}.`,
    claims: [
      { text: "Show us the pile. We'll call with your price.", source: SRC_LIVE },
      { text: 'Free quote from your photos', source: SRC_LIVE },
      { text: 'Nothing to pay until you say yes.', source: SRC_LIVE },
      { text: 'Photo: a real Boss Brothers cleanout pile', source: SRC_PHOTO },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: 'Free quote',
      headline: 'Show us the pile.',
      accent: "We'll call with your price.",
      sub: 'Send a couple of photos of what you need gone. One of the brothers looks them over and calls you back with an exact price. Nothing to pay until you say yes.',
      photo: { src: photoUrl('garage-before-close.jpg'), alt: 'A garage pile of boxes, bags and furniture waiting for pickup' },
      cta: CTA,
    }),
    blocked: photoReady('garage-before-close.jpg'),
  },
  {
    id: `bb_${D}_quote_B_02`,
    angle: 'quote',
    caption: `No online guesses. Send a few photos and one of the brothers calls you with an exact price before we haul anything. ${AREA}. ${CTA}.`,
    claims: [
      { text: 'We call you with an exact price.', source: SRC_LIVE },
      { text: 'Send us a couple photos of what you need gone.', source: SRC_LIVE },
      { text: AREA, source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: `Junk removal · ${AREA}`,
      headline: 'An exact price.',
      accent: 'Before we haul a thing.',
      sub: 'Send a couple of photos of what you need gone and we call you back with your number. No online guesses, no surprise charges when we show up.',
      truck: true,
      cta: CTA,
    }),
  },

  // ── Price — the owner's numbers, no on-site counterpart ──────────────────
  {
    id: `bb_${D}_price_B_01`,
    angle: 'price',
    caption: `${PRICE_LINE} Send a few photos and we'll call you with an exact number. ${CTA}.`,
    claims: [priceClaim, phoneClaim, { text: AREA, source: SRC_LIVE }],
    build: () => ({
      template: 'B',
      eyebrow: `Junk removal · ${AREA}`,
      headline: 'Straight pricing.',
      accent: 'No runaround.',
      price: { big: `From $${SINGLE_FROM}`, note: PRICE_LINE },
      cta: CTA,
    }),
  },
  {
    id: `bb_${D}_price_B_02`,
    angle: 'price',
    caption: `${PRICE_LINE} You get the exact number on a call before anything goes on the trailer. ${CTA}.`,
    claims: [
      priceClaim,
      { text: 'We call you with an exact price.', source: SRC_LIVE },
      { text: 'We do the lifting', source: SRC_LIVE },
      { text: 'No dumpster to rent', source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: 'What it costs',
      headline: 'Single items',
      accent: `from $${SINGLE_FROM}.`,
      sub: `Loads from $${LOAD_FROM}. You get the exact number on a call before anything goes on the trailer.`,
      bullets: ['Price before we load', 'We do the lifting', 'No dumpster to rent'],
      cta: CTA,
    }),
  },

  // ── The truck — real photo, real wrap ────────────────────────────────────
  {
    id: `bb_${D}_truck_B_01`,
    angle: 'truck',
    caption: `Two brothers, one truck, zero runaround. That's the truck that shows up. ${AREA}. ${CTA}.`,
    claims: [
      { text: 'Two brothers, one truck, zero runaround.', source: SRC_LIVE },
      { text: 'Photo: the wrapped Boss Brothers truck', source: SRC_TRUCK },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: AREA,
      headline: 'Two brothers.',
      accent: 'One truck.',
      sub: 'Zero runaround. This is the truck that shows up.',
      photo: { src: photoUrl('truck-wrapped.jpg'), alt: 'The wrapped Boss Brothers Hauling pickup truck' },
      cta: CTA,
    }),
    blocked: photoReady('truck-wrapped.jpg'),
  },

  // ── Military / PCSing — a genuinely local hook ───────────────────────────
  {
    id: `bb_${D}_military_B_01`,
    angle: 'military',
    caption: `PCSing out of Whiting Field? Storage unit cleanouts, move-out hauls and beat-the-deadline pickups are our bread and butter. ${CTA}.`,
    claims: [
      { text: "We're minutes from NAS Whiting Field.", source: SRC_LIVE },
      { text: 'Storage unit cleanouts, move-out hauls, and beat-the-deadline pickups.', source: SRC_LIVE },
      { text: 'Photo: the loaded Boss Brothers trailer', source: SRC_PHOTO },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: 'Military families',
      headline: 'PCS move?',
      accent: 'We know the deadline.',
      sub: "We're minutes from NAS Whiting Field. Storage unit cleanouts, move-out hauls and beat-the-deadline pickups are our bread and butter.",
      photo: { src: photoUrl('trailer-loaded.jpg'), alt: 'The Boss Brothers trailer loaded and tarped after a move-out haul' },
      cta: CTA,
    }),
    blocked: photoReady('trailer-loaded.jpg'),
  },

  // ── Cleanouts — real job photo ───────────────────────────────────────────
  {
    id: `bb_${D}_usecase_B_01`,
    angle: 'usecase',
    caption: `Garage, estate or storage unit cleanout. Pull it out where the truck can reach it and we handle all the loading. ${CTA}.`,
    claims: [
      { text: 'Furniture, old clutter, garage, estate, and storage unit cleanouts.', source: SRC_LIVE },
      { text: 'We handle all the loading.', source: SRC_LIVE },
      { text: 'Photo: a real Boss Brothers garage cleanout', source: SRC_PHOTO },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: 'Cleanouts',
      headline: 'Garage, estate,',
      accent: 'storage unit.',
      sub: 'Pull it out where the truck can reach it. We handle all the loading.',
      photo: { src: photoUrl('garage-before-wide.jpg'), alt: 'A garage packed with boxes and bags before a Boss Brothers cleanout' },
      cta: CTA,
    }),
    blocked: photoReady('garage-before-wide.jpg'),
  },
  {
    id: `bb_${D}_usecase_B_02`,
    angle: 'usecase',
    caption: `Branches, leaves, storm mess, land-clearing debris. Pile it up and we'll haul it off so your yard's ready to use again. ${CTA}.`,
    claims: [
      { text: 'Branches, leaves, storm mess, land-clearing debris.', source: SRC_LIVE },
      { text: "Pile it up and we'll haul it off so your yard's ready to use again.", source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: 'Yard & storm debris',
      headline: 'Branches, leaves,',
      accent: 'storm mess.',
      sub: "Pile it up and we'll haul it off so your yard's ready to use again.",
      truck: true,
      cta: CTA,
    }),
  },
  {
    id: `bb_${D}_usecase_B_03`,
    angle: 'usecase',
    caption: `Washers, dryers, fridges, grills, metal and scrap. Get it to the driveway or carport and the heavy, awkward part is on us. ${CTA}.`,
    claims: [
      { text: 'Washers, dryers, fridges, grills, metal and scrap.', source: SRC_LIVE },
      { text: 'Get it to the driveway or carport and the heavy, awkward part is on us.', source: SRC_LIVE },
      { text: 'Photo: the loaded Boss Brothers rig on a real job', source: SRC_PHOTO },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: 'Appliance & scrap removal',
      headline: 'Washers. Dryers.',
      accent: 'Fridges. Grills.',
      sub: 'Get it to the driveway or carport and the heavy, awkward part is on us.',
      photo: { src: photoUrl('rig-loaded.jpg'), alt: 'The Boss Brothers truck and trailer loaded at the curb' },
      cta: CTA,
    }),
    blocked: photoReady('rig-loaded.jpg'),
  },
  {
    id: `bb_${D}_usecase_B_04`,
    angle: 'usecase',
    caption: `Shingles, lumber, drywall, remodel leftovers. Contractor or DIY, we clear the site so you can get back to work. ${CTA}.`,
    claims: [
      { text: 'Shingles, lumber, drywall, remodel leftovers.', source: SRC_LIVE },
      { text: 'Contractor or DIY, we clear the site so you can get back to work.', source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'B',
      eyebrow: 'Construction & demo',
      headline: 'Shingles, lumber,',
      accent: 'drywall, demo.',
      sub: 'Contractor or DIY, we clear the site so you can get back to work.',
      truck: true,
      cta: CTA,
    }),
  },

  // ── What we haul ─────────────────────────────────────────────────────────
  {
    id: `bb_${D}_whatwetake_C_01`,
    angle: 'whatwetake',
    caption: `If you can pile it up, we can haul it off. Furniture, yard debris, appliances, construction leftovers. ${CTA}.`,
    claims: [
      { text: 'If you can pile it up, we can haul it off.', source: SRC_LIVE },
      { text: 'Junk & cleanouts / Yard debris / Appliances & scrap / Construction debris', source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'C',
      eyebrow: 'What we haul',
      headline: 'If you can pile it up,',
      accent: 'we can haul it off.',
      rows: [
        { mark: 'check', title: 'Junk & cleanouts', detail: 'Furniture, garage, estate, storage units' },
        { mark: 'check', title: 'Yard debris', detail: 'Branches, leaves, storm mess, land clearing' },
        { mark: 'check', title: 'Appliances & scrap', detail: 'Washers, dryers, fridges, grills, metal' },
        { mark: 'check', title: 'Construction debris', detail: 'Shingles, lumber, drywall, remodel leftovers' },
      ],
      cta: CTA,
    }),
  },

  // ── Process ──────────────────────────────────────────────────────────────
  {
    id: `bb_${D}_process_C_01`,
    angle: 'process',
    caption: `Three steps. No surprises. Send your list and a few photos, one of the brothers calls you with an exact price, then we haul it away. ${CTA}.`,
    claims: [
      { text: 'Three steps. No surprises.', source: SRC_LIVE },
      { text: 'Send us your list and a few photos.', source: SRC_LIVE },
      { text: 'We call you with an exact price — before we haul anything.', source: SRC_LIVE },
      { text: 'Pull it out where the truck can reach it.', source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'C',
      eyebrow: 'How it works',
      headline: 'Three steps.',
      accent: 'No surprises.',
      rows: [
        { mark: '<span class="num">1</span>', title: 'Send your photos', detail: 'Your list and a few pictures of the pile' },
        { mark: '<span class="num">2</span>', title: 'We call with a price', detail: 'An exact number, before we haul anything' },
        { mark: '<span class="num">3</span>', title: 'We haul it away', detail: 'Pull it out where the truck can reach it. We do the rest' },
      ],
      cta: CTA,
    }),
  },

  // ── Service area ─────────────────────────────────────────────────────────
  {
    id: `bb_${D}_area_D_01`,
    angle: 'area',
    caption: `${LIVE.towns.join('. ')}. Proudly hauling across ${AREA}. ${CTA}.`,
    claims: [
      { text: LIVE.towns.join(', '), source: SRC_LIVE },
      { text: 'Proudly hauling across Santa Rosa County.', source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'D',
      eyebrow: 'Where we work',
      headline: 'Proudly hauling',
      accent: 'across the county.',
      chips: [...LIVE.towns],
      cta: CTA,
    }),
  },
  {
    id: `bb_${D}_area_D_02`,
    angle: 'area',
    caption: `One local crew for the stuff you want gone, across ${AREA}. ${CTA}.`,
    claims: [
      { text: LIVE.towns.join(', '), source: SRC_LIVE },
      { text: 'One local crew for the stuff you want gone.', source: SRC_LIVE },
      phoneClaim,
    ],
    build: () => ({
      template: 'D',
      eyebrow: AREA,
      headline: 'Local truck.',
      accent: 'Local number.',
      sub: 'One local crew for the stuff you want gone.',
      chips: [...LIVE.towns],
      cta: CTA,
    }),
  },

  // ── Blocked on material from the owner ───────────────────────────────────
  {
    id: `bb_${D}_beforeafter_A_01`,
    angle: 'beforeafter',
    caption: `Gone in an afternoon. ${CTA}.`,
    claims: [
      { text: 'Photo: a real Boss Brothers garage cleanout, before and after', source: SRC_PHOTO },
      phoneClaim,
    ],
    blocked: photoReady('garage-after.jpg')
      ? 'Have the BEFORE but not the AFTER. The empty-garage shot arrived as .heic, ' +
        'which cannot be rendered here. Re-export it as JPEG to ' +
        'marketing/ads/photos/garage-after.jpg and this renders — before/after is the ' +
        'single best performer for this trade.'
      : undefined,
    build: () => ({
      template: 'A',
      eyebrow: 'Real job',
      headline: 'Gone in',
      accent: 'an afternoon.',
      before: { label: 'Before', src: photoUrl('garage-before-wide.jpg'), alt: 'A garage packed with boxes and bags' },
      after: { label: 'After', src: photoUrl('garage-after.jpg'), alt: 'The same garage, empty and swept' },
      cta: CTA,
    }),
  },
  {
    id: `bb_${D}_whatwetake_C_02`,
    angle: 'whatwetake',
    caption: '',
    claims: [],
    blocked:
      'Needs the owner\'s "what we can\'t take" list (hazmat, paint, chemicals, tires ' +
      'above some count, concrete, asbestos?). A two-column take/can\'t-take creative ' +
      'needs both lists, and exclusions cannot be guessed.',
    build: () => { throw new Error('blocked'); },
  },
  {
    id: `bb_${D}_proof_E_01`,
    angle: 'proof',
    caption: '',
    claims: [],
    blocked:
      'Needs a real Google or Facebook review: the text, the reviewer\'s first name and ' +
      'town, the star rating, and their permission to quote it. No invented testimonials.',
    build: () => { throw new Error('blocked'); },
  },
  {
    id: `bb_${D}_sameday_B_01`,
    angle: 'sameday',
    caption: '',
    claims: [],
    blocked:
      'Needs the owner\'s confirmed same-day conditions (booked by what hour, which load ' +
      'sizes, which towns). The live site says "Same-day & next-day pickup", but an ad ' +
      'has to carry the condition — an unconditioned same-day promise is one the ' +
      'business has to keep on every single call.',
    build: () => { throw new Error('blocked'); },
  },
];

// Every photo an unblocked creative names must be registered in photos.ts.
for (const c of CREATIVES) {
  if (c.blocked) continue;
  const layout = c.build();
  const named: string[] = [];
  if (layout.template === 'B' && layout.photo) named.push(layout.photo.src);
  if (layout.template === 'A') named.push(layout.before.src, layout.after.src);
  for (const src of named) {
    if (!PHOTOS.some(p => src.endsWith(p.file))) {
      throw new Error(`${c.id} names a photo not registered in photos.ts: ${src}`);
    }
  }
}
