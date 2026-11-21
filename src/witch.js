// The witch sprite sheet: rows, directions, animations and the hat/cardigan recolouring.
// See the sprite table in CLAUDE.md. Recolouring is copied from legacy sheetFor(), but the
// cardigan only changes where witch_cardigan.png is red, and the hat never changes where it's
// green (the tote and its moon). The mask is built by tools/cardigan_mask.py.
import { HATS, OUTFITS } from './data/unlocks.js';

export const CELL = 96, FX = 48, FY = 79, SC = 1.5; // feet pivot in the cell, draw scale
export const DIRS = ['s', 'se', 'e', 'ne', 'n', 'nw', 'w', 'sw']; // row 0 order
// NE and NW sitting came out wrong in PixelLab, so they use the N row for now (see CLAUDE.md)
export const SIT = { s: 1, se: 2, e: 3, ne: 5, n: 5, nw: 5, w: 7, sw: 8 };
export const WALK = { s: 12, se: 13, e: 14, ne: 15, n: 16, nw: 17, w: 18, sw: 19 };
const COLS = 8; // frames per sheet row

// screen-space vector to one of the 8 directions (y points down)
export function dirFrom(vx, vy) {
  const a = (Math.atan2(vy, vx) * 180 / Math.PI + 360) % 360;
  return ['e', 'se', 's', 'sw', 'w', 'nw', 'n', 'ne'][Math.round(a / 45) % 8];
}

function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60 } return [h, s, l] }
function hsl2rgb(h, s, l) { h = ((h % 360) + 360) % 360 / 360; const f = (p, q, t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p }; if (!s) return [l, l, l].map(v => Math.round(v * 255)); const q = l < .5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3), f(p, q, h), f(p, q, h - 1 / 3)].map(v => Math.round(v * 255)) }

function pixels(img) {
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  return { c, x, d: x.getImageData(0, 0, c.width, c.height) };
}

// texture key for this hat + outfit, recoloured and added the first time it's asked for
export function witchTexture(scene, hat, outfit) {
  const t = HATS[hat], o = OUTFITS[outfit];
  const tintHat = t?.h !== undefined, tintCoat = o?.h !== undefined;
  if (!tintHat && !tintCoat) return 'witch';
  const key = `witch|${hat}|${outfit}`;
  if (scene.textures.exists(key)) return key;

  const { c, x, d } = pixels(scene.textures.get('witch').getSourceImage());
  const m = pixels(scene.textures.get('witch_cardigan').getSourceImage()).d.data;
  const a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    if (a[i + 3] < 20) continue;
    const [h, s, l] = rgb2hsl(a[i], a[i + 1], a[i + 2]);
    let r = null;
    if (tintHat && m[i + 1] < 128 && h >= 245 && h <= 288 && s >= .15 && l >= .24 && l <= .82)
      r = hsl2rgb(t.h + (h - 265) * .4, Math.min(1, s * t.s / .3), Math.max(0, Math.min(1, l + t.l)));
    else if (tintCoat && m[i] >= 128)
      r = hsl2rgb(o.h + (h - 33) * .3, Math.min(1, o.s * (.6 + s)), Math.min(.93, l * .98));
    if (r) { a[i] = r[0]; a[i + 1] = r[1]; a[i + 2] = r[2] }
  }
  x.putImageData(d, 0, 0);
  scene.textures.addSpriteSheet(key, c, { frameWidth: CELL, frameHeight: CELL });
  return key;
}

// walk_<dir> (looping), idle_<dir> (one frame) and sit_<dir> (plays once) for a texture,
// prefixed with the texture key so every look has its own set
export function witchAnims(scene, tex) {
  if (scene.anims.exists(`${tex}:idle_s`)) return;
  const row = (r, n) => scene.anims.generateFrameNumbers(tex, { start: r * COLS, end: r * COLS + n - 1 });
  DIRS.forEach((dir, i) => {
    scene.anims.create({ key: `${tex}:idle_${dir}`, frames: [{ key: tex, frame: i }] });
    scene.anims.create({ key: `${tex}:walk_${dir}`, frames: row(WALK[dir], 6), frameRate: 10, repeat: -1 });
    scene.anims.create({ key: `${tex}:sit_${dir}`, frames: row(SIT[dir], 7), frameRate: 10 });
  });
}
