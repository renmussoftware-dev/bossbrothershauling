# Boss Bros Hauling — Website & Pricing Estimator

Marketing site with an embedded, multi-step pricing estimator + lead intake for
**Boss Bros Hauling**, a junk-removal & hauling service in Santa Rosa County, FL.

Built with **Next.js (App Router) + TypeScript + Tailwind CSS**, with
**Framer Motion** for the 3D-feel motion, **React Hook Form + Zod** for the form.
The estimator is a **deterministic calculator** (no AI, no fake instant quote) —
it produces an honest estimate *range*, never a guaranteed price.

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
    layout.tsx            # fonts (Oswald + Inter), metadata, <html>/<body>
    page.tsx              # section composition
    globals.css           # design tokens, focus states, reduced-motion
  components/
    Nav, Hero, Services, HowItWorks, ServiceArea, Footer
    EstimatorSection.tsx
    estimator/
      Estimator.tsx       # the multi-step tool (load → size → estimate → book)
      DumpBed.tsx         # signature 3D-feel dump bed that fills as you build
      loadOptions.ts      # customer-facing category/size copy
  lib/
    pricing.ts            # ★ PRICING ENGINE — all rates & margins live here
    schema.ts             # Zod validation for the intake form
    submitLead.ts         # client-side lead delivery (endpoint or mailto fallback)
    types.ts              # shared domain types
    site.ts               # ★ business details (phone, email, towns, hours)
scripts/
  export-to-docs.mjs      # copies the static build into /docs for GitHub Pages
docs/                     # ← the published site (GitHub Pages serves this)
```

---

## ★ How to update landfill rates & pricing

**All pricing lives in one place: [`src/lib/pricing.ts`](src/lib/pricing.ts).**
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

**Important — what the customer never sees:** the markup multiplier and the raw
landfill/dump cost are used only inside `calculateEstimate()` and are never
returned to the browser or rendered. The customer only ever sees the final
rounded **estimate range**. Keep it that way when editing.

The calculation is thoroughly commented in `pricing.ts` if you want to tune the
formula itself (rates → tonnage → fees → markup → rounded range).

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
- **Logo** — a placeholder SVG truck mark is in `src/components/Nav.tsx`
  (`<BossMark />`). Swap for the real logo.
- **Owner / job photos** — the design intentionally uses illustrated 3D elements
  instead of stock photos. Add real owner + before/after job photos where you
  like (e.g. a gallery section) rather than generic stock imagery.
- **Service-area map** — `src/components/ServiceArea.tsx` uses a stylized SVG
  map. Swap for a real Google Maps / Mapbox embed if desired.

---

## Design notes

- **Palette:** asphalt/steel base with safety-vest yellow + safety-orange
  accents — grounded in the work-truck world, not a generic SaaS look.
- **Signature element:** the dimensional **dump bed** (`DumpBed.tsx`) fills as
  the customer builds their load and item glyphs surface at the load line.
- **Performance:** the "3D feel" is layered SVG + Framer Motion (no heavy 3D
  library), so it stays fast on the phone-heavy ad traffic this site targets.
- **Accessibility:** visible keyboard focus states, `aria` labels on the
  interactive visual, and full `prefers-reduced-motion` support.

## What this does **not** do

- No payment processing — it estimates and captures leads only.
- No accounts / auth.
- No AI-generated quote — the estimate is deterministic from `pricing.ts`.
