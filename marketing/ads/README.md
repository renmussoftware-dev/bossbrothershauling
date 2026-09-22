# Ad creatives — Boss Brothers Hauling

A library of ad images rendered from code. Every creative is built at three
sizes, and every factual claim is checked against the **deployed site** before
anything renders.

## Render

```bash
npx sucrase-node marketing/ads/build.ts
```

- Images go to `out/{id}@{ratio}.png`. Open `out/index.html` for a contact
  sheet with the caption for each one.
- Render a subset with a filter: `npx sucrase-node marketing/ads/build.ts price`
- `--audit` prints the claim audit and renders nothing.
- `--check` renders nothing and reports any copy that doesn't fit.

Needs Chrome or Edge (or set `CHROME_PATH`) and internet for the Google Fonts
(Cinzel, Oswald, Inter) — the same three the live site loads.

## Sizes

| Ratio | Pixels | Use |
|---|---|---|
| 4:5 | 1080×1350 | Facebook and Instagram feed — the primary |
| 9:16 | 1080×1920 | Stories, Reels, TikTok |
| 1:1 | 1080×1080 | Square placements, Google |

The 9:16 safe area is inset ~14% top and bottom and 150px from the right, so
nothing lands under the caption, the sound bar or the action rail.

## Templates

| Letter | Layout | Use for |
|---|---|---|
| A | Before / after photo | The best performer for this trade |
| B | Offer card — price, bullets, a photo or the truck | Most creatives |
| C | Checklist rows | What we haul, how it works |
| D | Town chips | Service area |
| E | Review card | Real reviews only |

## The source of truth is the live site, not this repo

`src/` in this repository is **stale**. It still has the old "Boss Bros" name,
the orange/yellow palette and a live-pricing estimator. The deployed site at
bossbrothershauling.com is gold-on-black, named "Boss Brothers Hauling", and
quotes no prices at all.

So `livesite.ts` holds the facts and the design tokens, read off the deployed
page, and checks every borrowed line against `brand/site-snapshot.html`.
**After any site deploy, refresh the snapshot:**

```bash
curl -sS -o marketing/ads/brand/site-snapshot.html https://bossbrothershauling.com/
```

Then re-run the build. If the site's wording changed, the build fails and names
the line that moved, instead of shipping an ad that no longer matches.

### Prices are the exception

The live site deliberately quotes nothing — its promise is "no online guesses",
an exact price on a call. The `$75` / `$125` figures are the **owner's**, and
they have no counterpart on the site. They're labelled `OWNER CONFIRMATION` in
the claim audit. If they change, edit `SINGLE_FROM` / `LOAD_FROM` in
`creatives.ts`.

## Photos

Real job photos live in `photos/` and are registered in `photos.ts`. Rules:

- Boss Brothers' own photos of Boss Brothers' own jobs. No stock, no
  AI-generated "job" images.
- Anything on a customer's property needs that customer's permission. Each
  entry records `consent`; anything still `pending` is listed in the claim
  audit under **Photo permission**.
- A before/after pair must be the same spot from a similar angle.
- `.heic` will not render. Convert to JPEG first.

## Adding a creative

Append to `creatives.ts` with today's date or the next number:

```ts
{
  id: `bb_${D}_price_B_03`,
  angle: 'price',
  caption: 'The text that goes above the image.',
  claims: [{ text: 'what it asserts', source: 'where that came from' }],
  build: () => ({ template: 'B', eyebrow: '...', headline: '...', cta: CTA }),
}
```

Borrowing a line from the site? Add a `liveHas('...')` for it at the top of the
file. Then run the build. Copy that doesn't fit gets a **red outline** in the
render and is listed by `--check`.

## IDs and tracking

`bb_{YYYYMMDD}_{angle}_{template}_{nn}`, e.g. `bb_20260920_price_B_02`.

IDs are permanent — they're how a row in `tracker.csv` maps back to an image,
so never renumber or reuse one. The build rejects bad or duplicate IDs, appends
rows for new IDs only, and never touches existing rows, so hand-entered results
survive a rebuild.

Fill in `platform`, `campaign`, `launched_date` and `spend` when you launch, and
`impressions`, `clicks`, `leads`, `booked_jobs` as they come in. After a few
weeks, compare by `angle` and `template`: make more of whatever produces booked
jobs at a sensible cost per lead, and drop the rest.

`out/` is gitignored — it regenerates. `tracker.csv` is committed.

## Before publishing anything

1. Look at every image, not just the build output.
2. Read `out/claims.md` end to end — especially the OWNER CONFIRMATION lines
   and the photo-permission section.
3. Check the phone number in the images matches the real line.
