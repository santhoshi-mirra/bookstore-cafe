"""Build the cardigan/bag mask for witch.png, so recolouring the cardigan leaves the tote alone.

    python3 tools/cardigan_mask.py                # writes public/assets/sprites/witch_cardigan.png
    python3 tools/cardigan_mask.py --check DIR    # also writes an enlarged check sheet into DIR

The tote is painted in exactly the same cream colours as the cardigan, so a colour range can't tell
them apart. Instead each frame has a hand-set bag box (cell pixels, inclusive). Cream pixels below
the hat that are outside the box are cardigan, plus the darker cardigan shading (SHADES) where it
touches them; everything inside the box is bag.

Mask, same size as witch.png, fully opaque: red = cardigan (recolour with the outfit),
green = bag (never recolour; this also keeps the lavender moon on the tote out of the hat recolour).
In the check sheet, cardigan is rose, bag is sage, the box is outlined.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SHEET = ROOT / 'public/assets/sprites/witch.png'
OUT = ROOT / 'public/assets/sprites/witch_cardigan.png'
CELL = 96
NF = [8] + [7] * 11 + [6] * 8   # frames per row (see the sprite table in CLAUDE.md)
COLLAR = 42                     # cream above this line is the hat band, not the cardigan
HEM = 64                        # shading below this line is on her legs, not the cardigan
SHADES = [(180, 143, 123), (169, 130, 113), (153, 112, 98)]  # cardigan shading, darker than the cream range

# bag box per frame as (x0, y0, x1, y1), or None where the tote is hidden behind her
# (facing E, NE, N-ish the tote hangs on the far side, so most of those rows have no box)
S_BAG = (51, 55, 62, 67)
N_BAG = (31, 54, 37, 66)
BAGS = {
    0:  [S_BAG, (56, 55, 63, 64), None, None, N_BAG, (32, 53, 41, 66), (37, 54, 50, 66), (44, 54, 56, 66)],
    1:  [S_BAG, (54, 56, 62, 67), (58, 56, 64, 67), (56, 58, 64, 72), (54, 60, 62, 72), (53, 60, 62, 72), (53, 60, 62, 72)],
    2:  [(56, 55, 63, 64), (58, 55, 63, 64), (60, 54, 66, 64), (59, 57, 67, 66), (56, 62, 63, 70), (54, 62, 62, 70), (52, 62, 61, 72)],
    3:  [None] * 7,
    4:  [None] * 7,
    5:  [N_BAG, (31, 57, 37, 67), (31, 58, 38, 69), (33, 57, 39, 70), (34, 59, 40, 71), (34, 59, 40, 71), (34, 59, 40, 71)],
    # 9-11 standing sip (unused): same bag spot as standing S for the first frame only
    9:  [S_BAG] + [None] * 6,
    10: [(56, 55, 63, 64)] + [None] * 6,
    12: [(53, 55, 62, 67)] * 6,
    13: [(56, 60, 62, 66), None, None, (57, 55, 62, 64), None, (56, 60, 62, 66)],
    14: [None] * 6,
    15: [(55, 44, 65, 67), (54, 44, 63, 67), (54, 44, 63, 67), (55, 44, 65, 67), (55, 44, 65, 67), (55, 44, 65, 67)],
    16: [(31, 54, 37, 67)] * 6,
}
# these rows are exact left-right mirrors of another row, so their boxes are mirrored too
MIRROR = {6: 4, 7: 3, 8: 2, 11: 10, 17: 15, 18: 14, 19: 13}
for row, src in MIRROR.items():
    BAGS[row] = [b and (CELL - 1 - b[2], b[1], CELL - 1 - b[0], b[3]) for b in BAGS[src]]


def cream(px):
    """The legacy cardigan colour range (hue 26-42, sat 0.18-0.72, light > 0.58)."""
    rgb = px[..., :3] / 255
    mx, mn = rgb.max(2), rgb.min(2)
    l, d = (mx + mn) / 2, mx - mn
    s = np.where(d == 0, 0, d / np.maximum(np.where(l > .5, 2 - mx - mn, mx + mn), 1e-6))
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    dd = np.where(d == 0, 1, d)
    h = np.where(mx == r, ((g - b) / dd) % 6, np.where(mx == g, (b - r) / dd + 2, (r - g) / dd + 4)) * 60
    return (px[..., 3] >= 20) & (h >= 26) & (h <= 42) & (s > .18) & (s < .72) & (l > .58)


def build(px):
    card = cream(px.astype(float))
    bag = np.zeros_like(card)
    for row, n in enumerate(NF):
        card[row * CELL:row * CELL + COLLAR, :] = False
        for col, box in enumerate(BAGS.get(row, [None] * n)):
            if box:
                x0, y0, x1, y1 = box
                bag[row * CELL + y0:row * CELL + y1 + 1, col * CELL + x0:col * CELL + x1 + 1] = True
    card &= ~bag
    # grow into the shading pixels that touch the cardigan (8-connected), so stray ones elsewhere stay
    shade = np.zeros_like(card)
    for c in SHADES:
        shade |= (px[..., 0] == c[0]) & (px[..., 1] == c[1]) & (px[..., 2] == c[2]) & (px[..., 3] >= 20)
    shade &= ~bag
    shade &= (np.arange(px.shape[0]) % CELL < HEM)[:, None]
    while True:
        grown = card.copy()
        for dy in (-1, 0, 1):
            for dx in (-1, 0, 1):
                grown |= np.roll(np.roll(card, dy, 0), dx, 1) & shade
        if (grown == card).all():
            break
        card = grown
    mask = np.zeros(px.shape, np.uint8)
    mask[..., 0] = card * 255
    mask[..., 1] = bag * 255
    mask[..., 3] = 255
    return mask, card, bag


def check(px, card, bag, out_dir):
    out = px.copy()
    out[px[..., 3] < 20] = [255, 255, 255, 255]
    grey = (out[..., :3].mean(2) * .35 + 150).astype(np.uint8)
    for i in range(3):
        out[..., i] = np.where(px[..., 3] >= 20, grey, 255)
    out[..., 3] = 255
    out[card] = [242, 163, 182, 255]
    out[bag & (px[..., 3] >= 20)] = [143, 194, 154, 255]
    img = Image.fromarray(out).convert('RGB').resize((px.shape[1] * 3, px.shape[0] * 3), Image.NEAREST)
    dr = ImageDraw.Draw(img)
    for row, boxes in BAGS.items():
        for col, b in enumerate(boxes):
            if b:
                dr.rectangle([(col * CELL + b[0]) * 3, (row * CELL + b[1]) * 3,
                              (col * CELL + b[2] + 1) * 3 - 1, (row * CELL + b[3] + 1) * 3 - 1], outline=(80, 120, 90))
    for row in range(len(NF)):
        dr.text((4, row * CELL * 3 + 4), f'row {row}', fill=(0, 0, 0))
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    img.save(Path(out_dir) / 'cardigan_check.png')


if __name__ == '__main__':
    px = np.array(Image.open(SHEET).convert('RGBA'))
    mask, card, bag = build(px)
    Image.fromarray(mask).save(OUT)
    print(f'wrote {OUT.relative_to(ROOT)}')
    if '--check' in sys.argv:
        check(px, card, bag, sys.argv[sys.argv.index('--check') + 1])
