// The café room: the painted background, every furniture piece as its own depth-sorted sprite on top,
// a static physics body per piece sized to its floor footprint, and the witch walking around it.
// Coordinates are room.webp pixels (1054 x 851).
import EasyStar from 'easystarjs';
import { DOOR, FLOOR } from '../data/seats.js';
import { PIECES } from '../data/layout.js';
import { PROPS, boxes } from '../data/props.js';
import { HATS, OUTFITS } from '../data/unlocks.js';
import { FX, FY, SC, dirFrom, witchTexture, witchAnims } from '../witch.js';

const ROOM_W = 1054, ROOM_H = 851;
const GS = 8, GW = Math.ceil(ROOM_W / GS), GH = Math.ceil(ROOM_H / GS); // walk grid
const FEET_W = 14, FEET_H = 6; // the bit of floor she stands on
const SPEED = 130; // px per second, same as legacy
const ROSE = 0xf2a3b6, BUTTER = 0xf6d46e, SAGE = 0x8fc29a, LAVENDER = 0xb5a4f0;

function inPoly(x, y, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}

// hat and outfit from the legacy save until the makeover is ported (Phase 6)
function savedLook() {
  try {
    const c = JSON.parse(localStorage.getItem('lunaria-v1'))?.char || {};
    return { hat: HATS[c.hat] ? c.hat : 'purple', outfit: OUTFITS[c.outfit] ? c.outfit : 'cream' };
  } catch (e) {
    return { hat: 'purple', outfit: 'cream' };
  }
}

export default class Cafe extends Phaser.Scene {
  constructor() { super('Cafe'); }

  create() {
    this.add.image(0, 0, 'room').setOrigin(0, 0);

    // each piece sits pixel-for-pixel on the same furniture in the background; depth = anchor y
    for (const p of PIECES) {
      this.add.image(p.x, p.y, p.key)
        .setOrigin((p.x - p.left) / p.w, (p.y - p.top) / p.h)
        .setDepth(p.y);
    }

    // floor footprints only (not full height), so she can walk behind tall things
    this.blocks = this.physics.add.staticGroup();
    for (const p of PIECES) {
      for (const b of boxes(p)) this.blocks.add(this.add.zone(b.x, b.y, b.w, b.h));
    }

    this.buildGrid();

    this.shadow = this.add.ellipse(DOOR[0], DOOR[1] - 1, 32, 10, 0x3c1e14, 0.2);
    this.witch = this.add.sprite(DOOR[0], DOOR[1], 'witch')
      .setOrigin(FX / 96, FY / 96)
      .setScale(SC);
    this.dir = 'n';
    this.path = null;
    this.posing = false;
    this.look = savedLook();
    this.setLook();

    this.setupInput();
    this.setupDebug();

    this.fit();
    this.scale.on('resize', this.fit, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fit, this));
  }

  // can her feet stand here? On the floor and not overlapping any furniture footprint
  free(x, y) {
    if (!inPoly(x, y, FLOOR)) return false;
    return this.physics.overlapRect(x - FEET_W / 2, y - FEET_H / 2, FEET_W, FEET_H, false, true).length === 0;
  }

  // every free() spot on an 8px grid, for EasyStar (0 = walkable, 1 = blocked)
  buildGrid() {
    this.grid = [];
    for (let j = 0; j < GH; j++) {
      const row = [];
      for (let i = 0; i < GW; i++) row.push(this.free(i * GS + GS / 2, j * GS + GS / 2) ? 0 : 1);
      this.grid.push(row);
    }
    this.star = new EasyStar.js();
    this.star.setGrid(this.grid);
    this.star.setAcceptableTiles([0]);
    this.star.enableDiagonals();
    this.star.disableCornerCutting();
    this.star.setIterationsPerCalculation(5000);
    this.pathId = 0;
  }

  // nearest walkable cell to a room point, or null
  nearestCell(x, y) {
    const i0 = Math.floor(x / GS), j0 = Math.floor(y / GS);
    let best = null, bd = Infinity;
    for (let dj = -6; dj <= 6; dj++) for (let di = -6; di <= 6; di++) {
      const i = i0 + di, j = j0 + dj;
      if (this.grid[j]?.[i] !== 0) continue;
      const d = di * di + dj * dj;
      if (d < bd) { bd = d; best = [i, j]; }
    }
    return best;
  }

  // straight walk from a to b stays on free ground
  clearLine(a, b) {
    const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4);
    for (let k = 1; k < n; k++) {
      if (!this.free(a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n)) return false;
    }
    return true;
  }

  goTo(x, y) {
    const from = this.nearestCell(this.witch.x, this.witch.y), to = this.nearestCell(x, y);
    if (!from || !to) return;
    const id = ++this.pathId;
    this.star.findPath(from[0], from[1], to[0], to[1], cells => {
      if (id !== this.pathId || !cells) return;
      const pts = cells.slice(1).map(c => [c.x * GS + GS / 2, c.y * GS + GS / 2]);
      if (this.free(x, y)) pts.push([x, y]);
      // skip grid points she can walk straight past, so she doesn't zigzag
      const out = [];
      let cur = [this.witch.x, this.witch.y], i = 0;
      while (i < pts.length) {
        let j = pts.length - 1;
        while (j > i && !this.clearLine(cur, pts[j])) j--;
        out.push(pts[j]); cur = pts[j]; i = j + 1;
      }
      this.path = out.length ? out : null;
      this.drawPath();
    });
  }

  setupInput() {
    this.keys = this.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,SHIFT');
    // clicks outside the floor (walls, shelves, outside the room) do nothing
    this.input.on('pointerdown', ptr => {
      if (!inPoly(ptr.worldX, ptr.worldY, FLOOR)) return;
      this.posing = false;
      this.goTo(ptr.worldX, ptr.worldY);
    });
  }

  setLook() {
    this.tex = witchTexture(this, this.look.hat, this.look.outfit);
    witchAnims(this, this.tex);
    const cur = this.witch.anims.currentAnim?.key.split(':')[1] || `idle_${this.dir}`;
    this.witch.play(`${this.tex}:${cur}`);
  }

  update(time, delta) {
    const dt = Math.min(delta, 50) / 1000, k = this.keys;
    this.star.calculate();

    let vx = 0, vy = 0;
    if (k.A.isDown || k.LEFT.isDown) vx -= 1;
    if ((k.D.isDown && !k.SHIFT.isDown) || k.RIGHT.isDown) vx += 1;
    if (k.W.isDown || k.UP.isDown) vy -= 1;
    if (k.S.isDown || k.DOWN.isDown) vy += 1;

    let moving = false;
    if (vx || vy) {
      this.path = null; this.pathId++; this.posing = false;
      const m = Math.hypot(vx, vy), sp = SPEED * dt, x = this.witch.x, y = this.witch.y;
      const nx = x + vx / m * sp, ny = y + vy / m * sp;
      // slide along furniture and the floor edge
      if (this.free(nx, ny)) this.witch.setPosition(nx, ny);
      else if (vx && this.free(nx, y)) this.witch.setPosition(nx, y);
      else if (vy && this.free(x, ny)) this.witch.setPosition(x, ny);
      this.dir = dirFrom(vx, vy);
      moving = true;
    } else if (this.path) {
      const [tx, ty] = this.path[0], dx = tx - this.witch.x, dy = ty - this.witch.y, d = Math.hypot(dx, dy);
      const sp = Math.min(SPEED * dt, d);
      if (d > 0.5) {
        this.witch.setPosition(this.witch.x + dx / d * sp, this.witch.y + dy / d * sp);
        this.dir = dirFrom(dx, dy);
      }
      if (d - sp < 0.5) {
        this.witch.setPosition(tx, ty);
        this.path.shift();
        if (!this.path.length) this.path = null;
        this.drawPath();
      }
      moving = true;
    }

    if (!this.posing) this.witch.play(`${this.tex}:${moving ? 'walk' : 'idle'}_${this.dir}`, true);
    this.witch.setDepth(this.witch.y);
    this.shadow.setPosition(this.witch.x, this.witch.y - 1).setDepth(this.witch.y - 0.5);
  }

  // F2 or Shift+D shows footprints, anchors, seats, the floor outline, blocked walk cells and her path.
  // While it's on: H cycles hat colours, O cycles outfit colours, X plays the sit animation.
  setupDebug() {
    const g = this.add.graphics().setDepth(10000).setVisible(false);
    g.fillStyle(ROSE, 0.12);
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      if (this.grid[j][i] && inPoly(i * GS + GS / 2, j * GS + GS / 2, FLOOR)) g.fillRect(i * GS, j * GS, GS, GS);
    }
    g.lineStyle(1.5, SAGE, 1).strokePoints(FLOOR.map(([x, y]) => ({ x, y })), true);
    for (const p of PIECES) {
      for (const b of boxes(p)) {
        g.fillStyle(LAVENDER, 0.25).fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
        g.lineStyle(1, LAVENDER, 1).strokeRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
      }
      g.fillStyle(ROSE, 1).fillCircle(p.x, p.y, 2.5);
      const s = PROPS[p.key];
      if (s?.seat) {
        g.lineStyle(1, BUTTER, 1).lineBetween(...s.approach, ...s.seat);
        g.fillStyle(BUTTER, 1).fillCircle(...s.approach, 3);
        g.fillStyle(SAGE, 1).fillCircle(...s.seat, 3.5);
      }
    }
    this.debug = g;
    this.pathG = this.add.graphics().setDepth(10001).setVisible(false);

    const toggle = () => { g.setVisible(!g.visible); this.pathG.setVisible(g.visible); };
    const kb = this.input.keyboard;
    kb.on('keydown-F2', toggle);
    kb.on('keydown-D', e => { if (e.shiftKey) toggle(); });
    const cycle = (list, cur) => list[(list.indexOf(cur) + 1) % list.length];
    kb.on('keydown-H', () => {
      if (!g.visible) return;
      this.look.hat = cycle(Object.keys(HATS), this.look.hat);
      this.setLook();
    });
    kb.on('keydown-O', () => {
      if (!g.visible) return;
      this.look.outfit = cycle(Object.keys(OUTFITS), this.look.outfit);
      this.setLook();
    });
    kb.on('keydown-X', () => {
      if (!g.visible) return;
      this.path = null; this.posing = true;
      this.witch.play(`${this.tex}:sit_${this.dir}`);
    });
  }

  drawPath() {
    const g = this.pathG;
    g.clear();
    if (!this.path) return;
    g.lineStyle(1.5, BUTTER, 1).beginPath().moveTo(this.witch.x, this.witch.y);
    for (const [x, y] of this.path) g.lineTo(x, y);
    g.strokePath();
    for (const [x, y] of this.path) g.fillStyle(BUTTER, 1).fillCircle(x, y, 2);
  }

  // zoom so the whole room fits with a margin, centred
  fit() {
    const cam = this.cameras.main;
    const { width, height } = this.scale;
    cam.setZoom(Math.min(width / ROOM_W, height / ROOM_H) * 0.92);
    cam.centerOn(ROOM_W / 2, ROOM_H / 2);
  }
}
