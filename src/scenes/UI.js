// Overlay scene that runs on top of Cafe. The real UI (timer card, dock, modals)
// stays as HTML and gets ported in Phase 6; this just proves the scene stacking.
import { money } from '../data/drinks.js';

export default class UI extends Phaser.Scene {
  constructor() { super('UI'); }

  create() {
    this.add.text(16, 14, `Phase 4 · ${money(6)}`, {
      fontFamily: 'DM Sans', fontSize: '14px', color: '#8b7f76',
    });
  }
}
