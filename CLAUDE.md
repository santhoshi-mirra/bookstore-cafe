# Lunaria

A cozy pixel-art focus café in the browser. The player does a makeover, picks a bag, packs it, then walks a witch into Lunaria (an isometric café and bookstore), buys a drink at the counter, sits down and focuses (20, 35, 45, 60 min or custom) to earn money that unlocks drinks, bags and hat colours.

Owner: Mirra. This is a fun side project, built mostly with Claude Code.

## Run it

```bash
npm install
npm run dev
# open the URL Vite prints (http://localhost:5173)
```

The new Phaser game is at `/`, the old one at `/legacy.html`. Always use the dev server, not file://. Hat recolouring reads pixels from the sprite sheet, and browsers block that on file://.

## Files

- `index.html`: the Phaser page. Phaser 3.90.0 comes from the jsDelivr CDN as a global; `src/main.js` starts the game
- `src/scenes/`: `Intro.js` (loads assets, title), `Cafe.js` (the room), `UI.js` (overlay)
- `src/data/`: `drinks.js`, `unlocks.js`, `sounds.js`, `seats.js` (data moved out of the legacy game)
- `public/legacy.html`: the old one-file game, kept as reference until the rebuild matches it. The section notes below describe this file
- `public/assets/images/room.webp`: the café room cut out on a transparent background (1054 × 851). All game coordinates are in this image's pixels
- `public/assets/sprites/witch.png`: PixelLab sprite sheet, 96 × 96 cells
- `public/assets/sounds/`: looping ambience files (`cafe.mp3`, `cups.mp3`, `rain.mp3`, `waves.mp3`, `fire.mp3`). Missing files show an Add button in the Sounds panel
- `public/assets/sprites/cat.png` (optional): PixelLab cat sheet, see `CAT_SHEET` in the code
- `.claude/skills/`: project skills (see below)

## How the legacy code is organised (inside the script of `public/legacy.html`)

Sections are marked with `/* ---- name ---- */` comments, in this order:

1. **data**: `HATS`, `BAGS`, `ITEMS`, `DRINKS` (prices in dollars), `SHOP`, `ACTS`, `PAY` (earned per session)
2. **map data** (image coordinates):
   - `OUT`: outline polygon of the room cut-out (the floating diorama shape)
   - `FLOOR`: polygon where the witch can walk
   - `OBST`: ellipses she can't walk through (tables, plants) as `[x, y, rx, ry]`
   - `SEATS`: `f` = where her feet go when seated, `a` = the walkable spot she walks to first
   - `OCC`: occluders. Polygons of furniture that get redrawn on top of her when her `y` is smaller than the occluder's `y`, so she can sit or walk behind tables
   - `COUNTER`, `CAT`, `LAMPS` (night-mode glows)
3. **save**: everything persists in `localStorage` under `lunaria-v1`. Wrap storage in try/catch
4. **sprites**: `ROW` and `NF` map animation names to sheet rows and frame counts. `DIRS` is the rotation order in row 0. `sheetFor(hat)` recolours the purple hat pixels by hue
5. **geometry + paths**: `free(x, y)` checks walkability, `plan()` is A* on a 16px grid, `goTo()` walks there
6. **UI**: `hud()`, `pomoUI()`, modals use `open(id)` / `close(id)`
7. **view**: zoom (1 to 1.6) and drag-to-pan. `toWorld()` turns screen points into image coordinates
8. **sound**: generated with Web Audio (chatter, rain, clinks, piano chords) plus the player's own music files
9. **input**, **update** (`step`), **render**

## Sprite sheet (witch.png)

| Rows | Animation | Frames |
|---|---|---|
| 0 | standing rotations S, SE, E, NE, N, NW, W, SW | 8 |
| 1–8 | sitting down, one row per direction in the same order (S, SE, E, NE, N, NW, W, SW) | 7 |
| 9–11 | standing sip (unused) | 7 |
| 12–19 | walking, one row per direction in the same order | 6 |

`SIT` and `WALK` in the code map directions to rows. NE and NW sitting came out wrong in PixelLab, so back-facing table chairs use the N sitting row and the chair back is redrawn over her (`chair` on the seat). The pivot is the feet at cell pixel (48, 79), drawn at `SC` = 1.5.

## Game rules (don't break these)

- A drink is required to sit. The drink empties over the focus session, so each session needs a new drink
- Focus length: 20, 35, 45, 60 min or custom (5 to 180). Pay = $0.50 per minute (`RATE`)
- After each session a pop-up offers a 10-minute break (skippable). Breaks never auto-start a session
- Start money is $6. Cappuccino and latte ($3, hot or iced) are free to buy; other drinks, bags (backpack is the free one) and two hats are locked in Unlocks (lock icon)
- **No cheating:** there is no "complete" button. Time only counts while the tab is visible (switching tabs pauses it). Standing up during focus ends the session with no pay. Test mode (20 s) pays nothing
- Money shows as dollars with two decimals (`money(n)`). Paying shows a `−$x.00` pop above her head; finishing shows `+$x.00`
- No sipping animation: a hot drink shows rising steam from the mug on the table; iced shows ice
- Clicking outside the floor does nothing (no message)

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

- Bag sprites: a PixelLab version of the witch for each bag (backpack, crossbody, satchel, tote), then pick the sheet by `S.char.bag`
- Hairstyles, makeup and the witch boy as PixelLab variants
- PixelLab cat with idle and roll rows (`cat.png`, see `CAT_SHEET`)
- Barista and customer sprites
- Google Calendar: sign in with Google, read today's events, and offer them as tasks when sitting down
- Deploy (Vercel or GitHub Pages)

## Rebuild plan: Phaser 3 + separate furniture

The current version uses one painted room image and hand-traced polygons for walking and depth. That keeps causing glitches (walking through furniture, floating on chairs). Rebuild it so every piece of furniture is its own sprite. Work through these phases in order, one at a time. Show Mirra a screenshot at the end of each phase before moving on, and commit after each one.

### Phase 1: set up Phaser
- Add Phaser 3 from a CDN (pinned version) and Vite for a dev server (`npm create vite@latest`, vanilla JS)
- Folder layout: `src/scenes/` (Intro, Cafe, UI), `src/data/` (drinks, unlocks, seats), `public/assets/` (images, sprites, sounds)
- Keep the current `index.html` as `legacy.html` for reference until the rebuild matches it

### Phase 2: split the room into pieces
- `bg_room.png`: floor and walls only, with no movable furniture. Make it by asking ChatGPT for "the same room, empty: only the floor, walls, windows, wall shelves and counter", or by painting the furniture out
- One PNG per piece with a transparent background: `armchair_l`, `armchair_r`, `coffee_table`, `table_round`, `chair_se`, `chair_sw`, `chair_ne`, `chair_nw`, `counter`, `display_case`, `plant_*`, `lamp_*`, `planter_*`, `chalkboard`. Cut them out of `room.webp` where possible (Python + Pillow), or make them in PixelLab's Objects tab at the same scale
- Every piece gets an anchor at its floor contact point (bottom centre), so it can be placed and depth-sorted by that point

### Phase 3: place the furniture with data
- `src/data/layout.js`: a list of pieces `{ key, x, y, collide: {w, h} }` in room pixels
- Each piece is a Phaser image with `setOrigin(0.5, 1)` and `setDepth(y)`. The witch also uses `setDepth(y)` every frame, so depth is automatic
- Collisions: an Arcade Physics static body per piece, sized to its floor footprint only (not its full height)
- Add a debug key (F2) that draws every footprint and seat point so the layout can be checked visually

### Phase 4: the witch
- Load `witch.png` as a spritesheet (96 × 96 frames) and create animations from the rows in the sprite table above: walk in 8 directions, idle from the rotation row, sit in each direction
- Movement: click-to-move with pathfinding over a walk grid built from the collision bodies (use `easystarjs`), plus WASD
- Hat and cardigan recolouring: keep the hue-swap code, run it once on a canvas and add the result as a new texture

### Phase 5: seats
- Each chair piece has a `seat` (where her feet go when seated), an `approach` point and a `face` direction
- When seated, set her depth just above the chair for chairs facing away from the viewer (se, sw, s), and just below the chair for chairs facing the table from the near side (ne, nw), so the chair back hides her legs
- NE and NW sitting need regenerated PixelLab rows (the first try faced the viewer)

### Phase 6: port the game features
Port everything listed under Game rules and Design rules: intro (makeover, bag, packing animation), menu with hot/iced, money pops above her head, timers (20/35/45/60/custom), break pop-up, steam on the mug, unlocks with lock icon, night mode, sounds mixer, cat petting, streaks and tasks, drag and zoom camera (Phaser camera with bounds and zoom 1 to 1.7). The HTML UI (timer card, dock, modals) can stay as HTML on top of the Phaser canvas.

### Phase 7: later
- Bag sprite variants, the witch boy, barista and customers, PixelLab cat
- Google Calendar sign-in to pull today's events as tasks
- Deploy to Vercel
