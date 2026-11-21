// Title screen. Loads the shared assets, then hands over to the café.
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
    const { width, height } = this.scale;
    const title = this.add.text(width / 2, height / 2 - 24, 'Lunaria', {
      fontFamily: 'Fraunces', fontSize: '56px', fontStyle: '600', color: '#3b302a',
    }).setOrigin(0.5);
    const hint = this.add.text(width / 2, height / 2 + 30, 'click to enter', {
      fontFamily: 'DM Sans', fontSize: '16px', color: '#8b7f76',
    }).setOrigin(0.5);

    this.scale.on('resize', ({ width, height }) => {
      title.setPosition(width / 2, height / 2 - 24);
      hint.setPosition(width / 2, height / 2 + 30);
    });

    this.input.once('pointerdown', () => {
      this.scene.start('Cafe');
      this.scene.launch('UI');
    });
  }
}
