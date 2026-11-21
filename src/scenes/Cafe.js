// The café room. Phase 1 placeholder: the old painted room plus the witch at the door.
// Coordinates are room.webp pixels (1054 x 851).
import { DOOR } from '../data/seats.js';

const ROOM_W = 1054, ROOM_H = 851;
const FX = 48, FY = 79, SC = 1.5; // feet pivot in the 96px cell, sprite scale

export default class Cafe extends Phaser.Scene {
  constructor() { super('Cafe'); }

  create() {
    this.add.image(0, 0, 'room').setOrigin(0, 0);

    // row 0, frame 4 = standing, facing N (into the room)
    this.witch = this.add.sprite(DOOR[0], DOOR[1], 'witch', 4)
      .setOrigin(FX / 96, FY / 96)
      .setScale(SC)
      .setDepth(DOOR[1]);

    this.fit();
    this.scale.on('resize', this.fit, this);
    this.events.once('shutdown', () => this.scale.off('resize', this.fit, this));
  }

  // zoom so the whole room fits with a margin, centred
  fit() {
    const cam = this.cameras.main;
    const { width, height } = this.scale;
    cam.setZoom(Math.min(width / ROOM_W, height / ROOM_H) * 0.92);
    cam.centerOn(ROOM_W / 2, ROOM_H / 2);
  }
}
