// The café room: the painted background, every furniture piece as its own depth-sorted sprite on top,
// and a static physics body per piece sized to its floor footprint.
// Coordinates are room.webp pixels (1054 x 851).
import { DOOR } from '../data/seats.js';
import { PIECES } from '../data/layout.js';
import { PROPS, boxes } from '../data/props.js';

const ROOM_W = 1054, ROOM_H = 851;
const FX = 48, FY = 79, SC = 1.5; // feet pivot in the 96px cell, sprite scale
const ROSE = 0xf2a3b6, BUTTER = 0xf6d46e, SAGE = 0x8fc29a, LAVENDER = 0xb5a4f0;

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

    // row 0, frame 4 = standing, facing N (into the room)
    this.witch = this.add.sprite(DOOR[0], DOOR[1], 'witch', 4)
      .setOrigin(FX / 96, FY / 96)
      .setScale(SC);

    this.setupDebug();

    this.fit();
    this.scale.on('resize', this.fit, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fit, this));
  }

  update() {
    this.witch.setDepth(this.witch.y);
  }

  // F2 shows footprints, anchors and seats. While it's on, clicking moves the witch there
  // (a stand-in until click-to-move in Phase 4) to check she goes behind and in front of things.
  setupDebug() {
    const g = this.add.graphics().setDepth(10000).setVisible(false);
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

    this.input.keyboard.addKey('F2').on('down', () => g.setVisible(!g.visible));
    this.input.on('pointerdown', ptr => {
      if (!g.visible) return;
      this.witch.setPosition(Math.round(ptr.worldX), Math.round(ptr.worldY));
    });
  }

  // zoom so the whole room fits with a margin, centred
  fit() {
    const cam = this.cameras.main;
    const { width, height } = this.scale;
    cam.setZoom(Math.min(width / ROOM_W, height / ROOM_H) * 0.92);
    cam.centerOn(ROOM_W / 2, ROOM_H / 2);
  }
}
