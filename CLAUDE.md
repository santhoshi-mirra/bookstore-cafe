# The Bookstore Café

A cozy pixel-art focus game in the browser. The player walks a witch around an isometric bookstore café, buys a drink at the counter, sits down and focuses for a 20-minute session (pomodoro style) to earn money that unlocks drinks and hat colours.

Owner: Mirra. This is a fun side project, built mostly with Claude Code.

## Run it

```bash
python -m http.server 8000
# open http://localhost:8000
```

Always use a local server, not file://. Hat recolouring reads pixels from the sprite sheet, and browsers block that on file://.

## Files

- `index.html`: the whole game in one file (HTML, CSS, then one `<script>` block at the end)
- `room.jpg`: the café background (1671 × 941). All game coordinates are in this image's pixels
- `witch.png`: PixelLab sprite sheet, 96 × 96 cells
- `.claude/skills/`: project skills (see below)

## How the code is organised (inside the script)

Sections are marked with `/* ---- name ---- */` comments, in this order:

1. **data**: `HATS`, `BAGS`, `ITEMS`, `DRINKS` (prices in dollars), `SHOP`, `ACTS`, `PAY` (earned per session)
2. **map data** (image coordinates):
   - `OUT`: outline polygon of the room cut-out (the floating diorama shape)
   - `FLOOR`: polygon where the witch can walk
   - `OBST`: ellipses she can't walk through (tables, plants) as `[x, y, rx, ry]`
   - `SEATS`: `f` = where her feet go when seated, `a` = the walkable spot she walks to first
   - `OCC`: occluders. Polygons of furniture that get redrawn on top of her when her `y` is smaller than the occluder's `y`, so she can sit or walk behind tables
   - `COUNTER`, `CAT`, `LAMPS` (night-mode glows)
3. **save**: everything persists in `localStorage` under `bookcafe-v3`. Wrap storage in try/catch
4. **sprites**: `ROW` and `NF` map animation names to sheet rows and frame counts. `DIRS` is the rotation order in row 0. `sheetFor(hat)` recolours the purple hat pixels by hue
5. **geometry + paths**: `free(x, y)` checks walkability, `plan()` is A* on a 16px grid, `goTo()` walks there
6. **UI**: `hud()`, `pomoUI()`, modals use `open(id)` / `close(id)`
7. **view**: zoom (1 to 1.6) and drag-to-pan. `toWorld()` turns screen points into image coordinates
8. **sound**: generated with Web Audio (chatter, rain, clinks, piano chords) plus the player's own music files
9. **input**, **update** (`step`), **render**

## Sprite sheet (witch.png)

| Row | Animation | Frames | Direction |
|---|---|---|---|
| 0 | standing rotations | 8 | S, SE, E, NE, N, NW, W, SW |
| 1 | sitting down | 7 | S |
| 2 | walking | 6 | S |
| 3 | seated sip | 7 | S |
| 4 | standing drink | 6 | S |
| 5 | breathing idle | 4 | S |

The pivot is the feet at cell pixel (48, 79). Characters are drawn at 2× scale (`SC`). Mirror a direction with `drawFrame(..., flip=true)` instead of generating it (E → W, SE → SW, NE → NW).

## Game rules (don't break these)

- A drink is required to sit. The drink empties over the focus session, so each session needs a new drink
- Focus = 20 min, break = 5 min. After a break, focus restarts automatically only if she's still seated with a drink
- **No cheating:** there is no "complete" button. Time only counts while the tab is visible (switching tabs pauses it). Standing up during focus ends the session with no pay. Test mode (20 s) pays nothing
- Money shows as dollars with two decimals (`money(n)`). Paying shows a `−$x.00` pop above her head; finishing shows `+$10.00`

## Design rules

- Minimal and cozy: cream-white page (`--bg #fbf7f1`), white cards, thin `#ece4d8` borders, soft shadows
- Pastel pops: rose `#f2a3b6`, butter `#f6d46e`, sage `#8fc29a`, lavender `#b5a4f0`. Don't make things brown
- Fonts: Fraunces (title, timer, headings), DM Sans (everything else). No pixel fonts in the UI
- Buttons: slim pills and round icon buttons with thin line icons. No chunky 3D buttons
- Night mode uses the `data-night` attribute on `<html>`; every colour must work in both modes
- The pixel art stays crisp: `imageSmoothingEnabled = false` when drawing sprites

## Working style

- Mirra is a visual learner: when proposing a UI change, show a mockup or screenshot before building
- Keep replies short and friendly
- After changes, open the game in a browser and test: order a drink, sit, run a session in test mode, try night mode and zoom
- Keep everything in `index.html` unless it grows past about 1500 lines; then split the script into modules

## To do

- Walking animations for N, E, NE, SE (mirror for the rest)
- Sitting SE (armchairs) and E (side chairs); mirror for SW and W
- Barista and customer sprites, boy witch
- Bag and makeup variants shown on the character
- Replace the placeholder cat with a PixelLab cat
- Deploy (Vercel or GitHub Pages)
