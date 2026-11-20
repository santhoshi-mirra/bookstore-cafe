---
name: add-pixellab-sprites
description: Add a new PixelLab sprite sheet or animation (walking, sitting, sipping, new characters) to the Bookstore Café game. Use when Mirra drops a PixelLab zip or PNG into the project or asks to add an animation or character.
---

# Add PixelLab sprites to the Bookstore Café

PixelLab exports a zip with a PNG sprite sheet and a JSON file describing every row. Follow these steps.

## 1. Unpack and read the JSON

```bash
mkdir -p sprites/incoming && unzip -o <file>.zip -d sprites/incoming
cat sprites/incoming/*.json
```

From the JSON, note for each row: `type` (rotations or animation), `animation` (its description), `direction`, and `frame_count`. Also note `spritesheet.cell_size` (we expect 96 × 96) and the character `size`.

If the cell size isn't 96 × 96, don't guess. Tell Mirra and ask whether to resize in PixelLab or update `CELL` in the code.

## 2. Check the frames visually

Make an enlarged preview and look at it before wiring anything up:

```bash
python3 -c "from PIL import Image;im=Image.open('sprites/incoming/<sheet>.png');im.resize((im.width*2,im.height*2),Image.NEAREST).save('preview.png')"
```

Check that the colours, hat and outfit match `witch.png`. If a row looks glitchy (face changes, hat colour drifts), tell Mirra which one so she can regenerate it in PixelLab.

## 3. Find the feet pivot

The game places sprites by their feet at cell pixel (48, 79). Measure the lowest opaque pixel in a few frames of each new row:

```python
from PIL import Image
im=Image.open('sprites/incoming/<sheet>.png')
for c in range(n):
    cell=im.crop((c*96,row*96,c*96+96,row*96+96))
    print(cell.getchannel('A').point(lambda a:255 if a>40 else 0).getbbox())
```

If the feet bottom isn't at about 79, add a per-animation y offset rather than moving every sprite.

## 4. Merge into the game

- If the new export contains all the old rows plus new ones, replace `witch.png` with it and update `ROW` and `NF` in `index.html` to match the JSON row order.
- If it only has the new rows, append them to the bottom of `witch.png` with Pillow (same 96px cells), then add them to `ROW` and `NF`.
- Directions: only the generated directions exist. Mirror the others with `drawFrame(row, col, x, y, ctx, scale, true)`:
  - E → W, SE → SW, NE → NW
- Walking: in `drawPlayer()`, pick the walking row for `P.dir` (mirroring where needed) instead of the bobbing standing frame.
- Sitting: add a `dir` to each seat in `SEATS` (armchairs: left `se`, right `sw`; table chairs: left side `e`, right side `w`) and use the matching sitting and sip rows in `drawPlayer()`.
- New characters (barista, customers): give each its own sheet file and a small entity list, and draw them through the same depth-sorted `items` list in `render()` so occluders still work.

## 5. Test

Run `python -m http.server 8000`, then in the browser:

1. Walk in every direction (WASD) and watch the walk cycles
2. Order a drink, sit in an armchair and at a table, and check she faces the way the chair faces
3. Turn on test mode in Settings and let one session finish so the sip and session-end animations play
4. Try every hat colour (recolouring must still only touch the hat)

Show Mirra a screenshot of her sitting and walking before calling it done.
