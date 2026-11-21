// Phaser is loaded as a global from the CDN script in index.html.
import Intro from './scenes/Intro.js';
import Cafe from './scenes/Cafe.js';
import UI from './scenes/UI.js';

// load Fraunces and DM Sans first so Phaser text doesn't render in a fallback font
await Promise.all(['600 16px Fraunces', '400 16px DM Sans', '500 16px DM Sans'].map(f => document.fonts.load(f)));

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  pixelArt: true,
  transparent: true,
  scale: { mode: Phaser.Scale.RESIZE },
  physics: { default: 'arcade' },
  scene: [Intro, Cafe, UI],
});
