# Regenerates every QR asset in this folder. Run from the repo root:
#   pip install segno && python3 brand/qr/make-qr.py
import base64
import segno

URL = "https://bossbrothershauling.com"
qr = segno.make(URL, error='h')
matrix = [list(row) for row in qr.matrix]
n = len(matrix)            # 33
BORDER = 4                 # quiet zone, in modules — required, never trim it
M = 10                     # px per module in user units
side = (n + BORDER * 2) * M

GOLD_DEFS = '''  <linearGradient id="g" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="#FBF0C9"/>
    <stop offset="0.34" stop-color="#E5BC55"/>
    <stop offset="0.52" stop-color="#B8862A"/>
    <stop offset="0.74" stop-color="#F0DA9B"/>
    <stop offset="1" stop-color="#C9992E"/>
  </linearGradient>'''

# The owners' shield, embedded as a data URI so each SVG is a single portable
# file a print shop can open with nothing else attached.
_LOGO = base64.b64encode(open("public/logo-mark.png", "rb").read()).decode()
LOGO_W, LOGO_H = 233, 320


def shield(x, y, box):
    """The real mark, fitted into a `box`-wide square, centred."""
    h = box
    w = h * LOGO_W / LOGO_H
    return (f'  <image href="data:image/png;base64,{_LOGO}" '
            f'x="{x + (box - w) / 2:.2f}" y="{y:.2f}" width="{w:.2f}" height="{h:.2f}" '
            f'preserveAspectRatio="xMidYMid meet"/>')


def modules(skip=None):
    """QR modules as rects; `skip` is a module-space box left empty for the logo."""
    out = []
    for r, row in enumerate(matrix):
        for c, on in enumerate(row):
            if not on:
                continue
            if skip and skip[0] <= c <= skip[1] and skip[2] <= r <= skip[3]:
                continue
            out.append(f'<rect x="{(c+BORDER)*M}" y="{(r+BORDER)*M}" width="{M}" height="{M}"/>')
    return "\n    ".join(out)

# --- 1. Shield in the middle, still black-on-white ------------------------
KN = 9                                     # knockout, in modules (~7% of area)
lo, hi = (n - KN)//2, (n - KN)//2 + KN - 1
kx = (lo + BORDER) * M
ksz = KN * M
sh_box = ksz * 0.92
sh_x = kx + (ksz - sh_box) / 2
sh_y = kx + (ksz - sh_box) / 2

open("brand/qr/bossbrothershauling-qr-shield.svg", "w").write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}" width="{side}" height="{side}" role="img" aria-label="QR code for bossbrothershauling.com">
  <defs>
{GOLD_DEFS}
  </defs>
  <rect width="{side}" height="{side}" fill="#FFFFFF"/>
  <g fill="#000000" shape-rendering="crispEdges">
    {modules(skip=(lo, hi, lo, hi))}
  </g>
{shield(sh_x, sh_y, sh_box)}
</svg>
''')

# --- 2. Truck panel: black ground, gold frame, white QR tile --------------
# Panel width is driven by the caption, not the QR, so nothing overflows.
# textLength + lengthAdjust="spacing" pins each line to an exact width, so the
# layout holds even if the print shop's renderer substitutes the font.
TILE_PAD = 26
tile = side + TILE_PAD * 2
W = 820
CONTENT = 700
tile_x = (W - tile) / 2
top = 70
H = top + tile + 250

open("brand/qr/bossbrothershauling-qr-truck-panel.svg", "w").write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" role="img" aria-label="Scan for a free quote — bossbrothershauling.com">
  <defs>
{GOLD_DEFS}
  </defs>
  <rect width="{W}" height="{H}" fill="#0B0B0C"/>
  <rect x="14" y="14" width="{W-28}" height="{H-28}" rx="28" fill="none" stroke="url(#g)" stroke-width="7"/>
  <rect x="{tile_x}" y="{top}" width="{tile}" height="{tile}" rx="18" fill="#FFFFFF"/>
  <g transform="translate({tile_x + TILE_PAD} {top + TILE_PAD})">
    <g fill="#000000" shape-rendering="crispEdges">
      {modules(skip=(lo, hi, lo, hi))}
    </g>
{shield(sh_x, sh_y, sh_box)}
  </g>
  <g text-anchor="middle" font-family="Cinzel, Georgia, 'Times New Roman', serif">
    <text x="{W/2}" y="{top + tile + 88}" fill="#FFFFFF" font-size="50" font-weight="700"
          textLength="{CONTENT}" lengthAdjust="spacing">SCAN FOR A FREE QUOTE</text>
    <text x="{W/2}" y="{top + tile + 152}" fill="url(#g)" font-size="38" font-weight="600"
          textLength="{CONTENT}" lengthAdjust="spacing">BOSSBROTHERSHAULING.COM</text>
    <text x="{W/2}" y="{top + tile + 216}" fill="#FFFFFF" font-size="42" font-weight="600"
          textLength="{CONTENT*0.55:.0f}" lengthAdjust="spacing">(850) 281-5184</text>
  </g>
</svg>
''')
print("wrote shield + truck panel")
