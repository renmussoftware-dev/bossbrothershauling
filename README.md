# Boss Brothers Hauling — Website & Quote Request

Marketing site with an embedded, multi-step quote-request form for
**Boss Brothers Hauling**, a junk-removal & hauling service in Santa Rosa County, FL.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, with
**Framer Motion** for the 3D-feel motion, **React Hook Form + Zod** for the form.

**The site shows the customer no dollar figures — anywhere.** They tell us what
they've got, send photos of the pile, and one of the brothers calls back with an
exact price. There is no online estimate, no price range, and no load-size guess
for the customer to make.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:3000
```

Requires Node 18.18+ (Node 20+ recommended).

## Deploying (GitHub Pages from /docs)

This repo follows the same pattern as the other Renmus Software sites:
GitHub Pages serves the static site from the **`/docs` folder on `main`**,
with the custom domain in `docs/CNAME` (`bossbrothershauling.com`).

```bash
npm run deploy:docs   # next build (static export) + copy ./out → ./docs
git add -A && git commit -m "Publish site" && git push
```

Notes:
- The site is a full **static export** (`output: 'export'` in
  `next.config.mjs`) — no server, no API routes.
- `docs/.nojekyll` is required (Next puts assets under `_next/`, which
  Jekyll would otherwise ignore). The deploy script always re-creates it
  and the CNAME.
- Env vars are baked in at **build time** — after changing `.env.local`,
  re-run `npm run deploy:docs` and commit the refreshed `/docs`.

**One-time GitHub setup:** repo → Settings → Pages → Source: *Deploy from a
branch* → Branch `main`, folder `/docs`. Custom domain: `bossbrothershauling.com`
(+ enforce HTTPS once the cert issues).

**DNS (at your registrar):** apex `A` records → `185.199.108.153`,
`185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `www` CNAME →
`renmussoftware-dev.github.io`.

---

## Project structure

```
src/
  app/
    layout.tsx            # fonts (Cinzel + Oswald + Inter), metadata, <html>/<body>
    page.tsx              # section composition
    globals.css           # design tokens, focus states, reduced-motion
  components/
    Nav, Hero, Services, HowItWorks, ServiceArea, Footer
    Logo.tsx              # crowned-shield mark + BOSS/BROTHERS/HAULING lockup
    EstimatorSection.tsx
    estimator/
      Estimator.tsx       # the quote request (load → photos → contact)
      DumpBed.tsx         # signature 3D-feel bed, fills as items are listed
      loadOptions.ts      # customer-facing category copy
  lib/
    pricing.ts            # ★ internal rate card — NOT used by the site
    schema.ts             # Zod validation for the intake form
    submitLead.ts         # client-side lead delivery (endpoint or mailto fallback)
    types.ts              # shared domain types
    site.ts               # ★ business details (phone, email, towns, hours)
scripts/
  export-to-docs.mjs      # copies the static build into /docs for GitHub Pages
docs/                     # ← the published site (GitHub Pages serves this)
```

---

## ★ Internal rate card (not shown on the site)

**All pricing lives in one place: [`src/lib/pricing.ts`](src/lib/pricing.ts).**
Nothing on the website reads it — it's the crew's reference for working out a
price before calling a customer back.
When the Santa Rosa County Central Landfill publishes a new rate sheet, or you
want to change your margins, edit the `PRICING` constant — nothing else needs to
change.

Key values:

| Constant | What it is |
|---|---|
| `landfill.householdPerTon`, `classIIIPerTon`, `yardWastePerTon` | What you pay per ton at the dump |
| `landfill.tireRegular`, `tireLarge` | Per-tire disposal fees |
| `landfill.specialWasteMinimum` | Per-load minimum for mattresses / oversized items |
| `tonnage.*` | Estimated tonnage per load size (full load is a 2–3 ton range) |
| **`markup`** | **Your margin multiplier (2.5×–3.5×)** — covers labor, fuel, drive time, truck wear |
| `serviceMinimumLow` | Smallest low-end price you'll ever advertise |
| `roundTo` | Rounds the displayed range to the nearest $5 |

**Important — the customer sees none of this.** Since the photo-quote redesign
the website imports nothing from `pricing.ts`: no rate, no markup, no range, no
figure of any kind reaches the browser. The file remains as the crew's own rate
card for working out a price before the call-back. If you ever wire it into the
customer-facing site again, that decision reverses the "no prices online" rule
the rest of the site is built on — make it deliberately.

The calculation is thoroughly commented in `pricing.ts` if you want to tune the
formula itself (rates → tonnage → fees → markup → trip fee → rounded range).

### Trip-zone travel fees

[`src/lib/tripZones.ts`](src/lib/tripZones.ts) maps the customer's address to a
travel-fee tier using a **static zip/city lookup table** — no distance API, no
per-request cost. When the customer types their pickup address, the site
matches the zip (or city name) and shows a "✓ Navarre — in our service area"
confirmation. The zone's flat fee is **not** shown to the customer; it rides
along in the lead so whoever calls back knows the travel cost.

- Fees per zone: `TRIP_ZONES` (`home` $0 / `county` $25 / `extended` $50)
- Which zips/towns land in which zone: `ZIP_TO_ZONE` and `CITY_TO_ZONE`
- Unrecognized addresses get **no fee** (stay conservative; you quote on the
  call anyway — the lead email flags these as "unrecognized")
- The fee appears only in the lead sent to the business, never in the browser.

---

## ★ Plug in real lead capture

GitHub Pages is static — there's no server to receive the form. Instead the
form posts **directly from the browser** to a form-capture endpoint
(`src/lib/submitLead.ts`). Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_LEAD_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
```

**Recommended: [Formspree](https://formspree.io)** — free tier emails you every
lead; paid tiers also attach the customer's photos. Getform, Basin, Web3Forms,
or a Zapier/Make webhook URL work the same way (multipart POST).

**Zero-config fallback:** with no endpoint set, submitting opens the visitor's
email app with a pre-filled quote request to the business email, and the
confirmation screen tells them to hit send (and attach their photos). It works,
but a real endpoint converts much better — set one before running ads.

> Because this is a static build, the endpoint is **baked in at build time** —
> after setting it, re-run `npm run deploy:docs` and commit `/docs`. The
> endpoint URL is visible in the shipped JS; that's normal for these services
> (they use per-form spam protection, not secrecy).

---

## ★ Placeholder content to replace before launch

Search the codebase for `PLACEHOLDER` and update these:

- **Business phone & email** — `src/lib/site.ts` (or override via
  `NEXT_PUBLIC_BUSINESS_PHONE` / `NEXT_PUBLIC_BUSINESS_EMAIL`). Currently a
  `(850) 555-0199` placeholder.
- **Social links** — `src/lib/site.ts` (`social.facebook / instagram / google`).
- **Business hours & town list** — `src/lib/site.ts`.
- **Logo** — the crowned-shield mark from the truck wrap is drawn as SVG in
  `src/components/Logo.tsx` (`<BossShield />` / `<BossLogo />`), with static
  copies in `public/logo.svg`, `public/logo-mark.svg` and `public/icon.svg`
  (favicon). Swap those out if a vector file of the original art turns up.
- **Owner / job photos** — the design intentionally uses illustrated 3D elements
  instead of stock photos. Add real owner + before/after job photos where you
  like (e.g. a gallery section) rather than generic stock imagery.
- **Service-area map** — `src/components/ServiceArea.tsx` uses a stylized SVG
  map. Swap for a real Google Maps / Mapbox embed if desired.

---

## Design notes

- **Palette:** the truck wrap — true black (`onyx`) and charcoal (`char`)
  panels under polished gold (`gold.100`–`gold.700`), with bone-white
  headlines. Gold carries every accent; form errors use `alert` red so they
  never read as brand accent. Tokens live in `tailwind.config.ts`.
- **Type:** Cinzel (engraved serif) for the wordmark and top-level headings,
  Oswald for working headings and UI labels, Inter for body copy.
- **Signature element:** the dimensional **dump bed** (`DumpBed.tsx`) fills as
  the customer names what they've got and item glyphs surface at the load line.
  It is decorative acknowledgement, not a measurement — nothing it shows feeds
  a price.
- **Performance:** the "3D feel" is layered SVG + Framer Motion (no heavy 3D
  library), so it stays fast on the phone-heavy ad traffic this site targets.
- **Accessibility:** visible keyboard focus states, `aria` labels on the
  interactive visual, and full `prefers-reduced-motion` support.

## What this does **not** do

- No payment processing — it captures leads only.
- No accounts / auth.
- **No prices shown to the customer** — quoting happens on the phone, after a
  human looks at the photos.
