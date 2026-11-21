// Loads the shared assets, then hands over to the café, which opens the HTML intro (src/intro.js) on top.
import { PIECES } from '../data/layout.js';

export default class Intro extends Phaser.Scene {
  constructor() { super('Intro'); }

  preload() {
    this.load.image('room', 'assets/images/room.webp');
    PIECES.forEach(p => this.load.image(p.key, `assets/furniture/${p.key}.png`));
    this.load.spritesheet('witch', 'assets/sprites/witch.png', { frameWidth: 96, frameHeight: 96 });
    this.load.image('witch_cardigan', 'assets/sprites/witch_cardigan.png');
  }

  create() {
    this.scene.start('Cafe');
  }
}
