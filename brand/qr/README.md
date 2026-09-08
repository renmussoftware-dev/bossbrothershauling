# Truck QR code

All files encode exactly one thing: **https://bossbrothershauling.com**

Every file here was decoded back after generation to confirm it resolves to
that URL — including the branded ones with the shield over the middle.

## Which file to send the wrap shop

| File | Use |
|---|---|
| `bossbrothershauling-qr-truck-panel.svg` | **The truck.** Finished panel — QR, shield, "Scan for a free quote", domain, phone. |
| `bossbrothershauling-qr-shield.svg` | QR + shield only, no caption. For when the wrap already has the wording. |
| `bossbrothershauling-qr.svg` | Plain black-and-white QR. The safest option anywhere, and what to use on invoices, flyers or door hangers. |
| `*-3000.png`, `*-4000.png` | Raster backups for anyone who can't take SVG. Text is already rasterized, so no font substitution. |

Send the **SVG** whenever the shop will take it — it scales to any decal size
with no quality loss. The PNGs are fallbacks.

## Rules that keep it scannable

- **Minimum size: scan distance ÷ 10.** Someone reading it from 5 feet away
  needs the code itself (not the whole panel) to be about **6 inches** square.
  On a truck door, bigger is free — go 8–10 in if there's room.
- **Keep the white border.** That empty margin around the code is the "quiet
  zone" and is part of the spec. Cropping it tight is the most common reason a
  printed QR stops scanning.
- **Don't recolor it.** The code must stay dark-on-light. Gold modules on black
  would match the wrap but light-on-dark inverts the contrast the spec assumes,
  and a good share of scanners refuse it. That's why the panel puts a white
  tile behind the code instead — brand on the outside, spec on the inside.
- **Ask for matte laminate.** Gloss over a QR throws glare and kills scans in
  daylight, which is exactly when people will use it.
- **Put it where someone can stand.** Rear door or lower rear quarter beats a
  front fender — people scan a parked truck, and they need to get close.
- **Don't stretch it.** Scale proportionally; a squashed code won't read.

## Test before the whole fleet gets wrapped

Print one at final size, tape it to the truck, and scan it with both an iPhone
and an Android phone, in daylight, from the distance a customer would actually
stand. It survives ~30% damage (error correction level H), but road grime over
the middle is still worth wiping.

## Regenerating

If the domain ever changes, rebuild rather than editing these files by hand —
the pattern is not editable art. `pip install segno`, then see the generator
committed alongside this README (`make-qr.py`).
