// The intro: makeover, bag, packing (legacy "intro" section). Bag and item pictures are the PNGs in
// public/assets/icons/. The preview witch is drawn from the café scene's recoloured texture.
import { S, save, has } from './state.js';
import { $, ui, hud } from './ui.js';
import { HATS, OUTFITS, BAGS, ITEMS, SHOP } from './data/unlocks.js';
import { money } from './data/drinks.js';
import { CELL, witchTexture } from './witch.js';

const icon = id => `assets/icons/${id}.png`;
const LOCK = '<svg class="ico" viewBox="0 0 24 24"><use href="#lock"/></svg>';
const CHECK = '<svg class="ck" viewBox="0 0 24 24"><path d="M6 12.5l4 4 8-9"/></svg>';

let step = 0, scene = null, onDone = null, raf = 0;

function swatches(map, cur, kind) {
  return Object.entries(map).map(([k, v]) => {
    const locked = v.lock && !has(v.lock);
    return `<button class="sw ${k === cur ? 'sel' : ''}" data-k="${k}" data-kind="${kind}" style="background:${v.c}"
      aria-label="${v.n}${locked ? ' (locked)' : ''}" title="${v.n}${locked ? ' · unlock in the café' : ''}" ${locked ? 'disabled' : ''}></button>`;
  }).join('');
}

function render() {
  [...$('steps').children].forEach((s, i) => { s.className = i === step ? 'on' : i < step ? 'done' : ''; });
  const C = S.char, ctl = $('ctl');
  $('bigPrev').style.display = step === 0 ? 'block' : 'none';
  $('bagVis').style.display = step > 0 ? 'grid' : 'none';
  $('packedList').style.display = step === 2 ? 'flex' : 'none';
  $('letsgo').classList.remove('on');
  if (step > 0) $('bagVis').innerHTML = `<img class="bigbag" id="bigBag" src="${icon(C.bag)}" alt="${BAGS[C.bag].n}">`;

  if (step === 0) {
    ctl.innerHTML = `<h2>Your makeover</h2><p class="sub">Dress your witch for today.</p>
      <div class="lab" style="margin-top:0">Witch hat</div><div class="sws">${swatches(HATS, C.hat, 'hat')}</div><div class="swname">${HATS[C.hat].n}</div>
      <div class="lab">Cardigan</div><div class="sws">${swatches(OUTFITS, C.outfit, 'outfit')}</div><div class="swname">${OUTFITS[C.outfit].n}</div>
      <p class="note">More hairstyles, makeup and the witch boy are on their way.</p>
      <div class="ifoot"><span></span><button class="btn go" id="iNext">Next: pick a bag</button></div>`;
    ctl.onclick = e => {
      const b = e.target.closest('.sw');
      if (b && !b.disabled) { C[b.dataset.kind] = b.dataset.k; render(); }
    };
  } else if (step === 1) {
    ctl.innerHTML = `<h2>Pick your bag</h2><p class="sub">You start with the backpack. Earn more in the café.</p>
      <div class="bags">${Object.entries(BAGS).map(([k, b]) => {
        const locked = b.lock && !has(b.lock), price = locked ? SHOP[1][1].find(s => s.id === b.lock).c : 0;
        return `<button class="bagc ${k === C.bag ? 'sel' : ''}" data-k="${k}" ${locked ? 'disabled' : ''}>
          <img src="${icon(k)}" alt="">${b.n}<small>${locked ? `${LOCK}Unlock for ${money(price)}` : 'Ready to use'}</small></button>`;
      }).join('')}</div>
      <div class="ifoot"><button class="btn" id="iBack">Back</button><button class="btn go" id="iNext">Next: pack it</button></div>`;
    ctl.onclick = e => {
      const b = e.target.closest('.bagc');
      if (b && !b.disabled) { C.bag = b.dataset.k; render(); }
    };
  } else {
    ctl.innerHTML = `<h2>Pack your bag</h2><p class="sub">Tap what you're bringing. Tap again to take it out.</p>
      <div class="items">${ITEMS.map(it => {
        const inBag = C.items.includes(it.id);
        return `<button class="itm ${inBag ? 'in' : ''}" data-k="${it.id}" aria-pressed="${inBag}">${CHECK}<img src="${icon(it.id)}" alt="">${it.n}</button>`;
      }).join('')}</div>
      <div class="ifoot"><button class="btn" id="iBack">Back</button><button class="btn go" id="iGo">Let's go to the café</button></div>`;
    ctl.onclick = e => {
      const b = e.target.closest('.itm');
      if (!b) return;
      const id = b.dataset.k;
      if (C.items.includes(id)) { C.items = C.items.filter(x => x !== id); render(); } else flyIn(b, id);
    };
    renderPacked();
  }
  $('iNext') && ($('iNext').onclick = () => { step++; save(); render(); });
  $('iBack') && ($('iBack').onclick = () => { step--; render(); });
  $('iGo') && ($('iGo').onclick = letsGo);
}

function renderPacked() {
  $('packedList').innerHTML = S.char.items.map(i => `<span>${ITEMS.find(x => x.id === i).n}</span>`).join('');
}

// the item's picture flies into the big bag, which gives a little wiggle
function flyIn(btn, id) {
  S.char.items.push(id);
  btn.classList.add('in');
  btn.setAttribute('aria-pressed', 'true');
  const from = btn.querySelector('img').getBoundingClientRect(), bag = $('bigBag').getBoundingClientRect();
  const f = document.createElement('img');
  f.className = 'fly';
  f.src = icon(id);
  f.style.left = from.left + 'px';
  f.style.top = from.top + 'px';
  document.body.appendChild(f);
  const tx = bag.left + bag.width / 2 - from.left - from.width / 2, ty = bag.top + bag.height * .32 - from.top - from.height / 2;
  const done = () => {
    f.remove();
    const bb = $('bigBag');
    if (bb) { bb.classList.remove('wig'); void bb.offsetWidth; bb.classList.add('wig'); }
    renderPacked();
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !f.animate) { done(); return; }
  f.animate([
    { transform: 'translate(0,0) scale(1)', opacity: 1 },
    { transform: `translate(${tx * .5}px,${ty * .5 - 60}px) scale(1.1)`, opacity: 1, offset: .5 },
    { transform: `translate(${tx}px,${ty}px) scale(.35)`, opacity: .2 },
  ], { duration: 650, easing: 'cubic-bezier(.4,0,.6,1)' }).onfinish = done;
}

function letsGo() {
  save();
  $('letsgo').classList.add('on');
  setTimeout(() => {
    $('intro').classList.add('hide');
    cancelAnimationFrame(raf);
    ui.inGame = true;
    ui.busy = document.querySelector('.modal.on') !== null;
    hud();
    onDone?.();
  }, 900);
}

// the witch turning on the spot, one direction every 0.8 s, in the chosen hat and cardigan
function preview() {
  let dir = 0, last = 0;
  const c = $('bigPrev'), x = c.getContext('2d');
  const draw = now => {
    raf = requestAnimationFrame(draw);
    if (step !== 0) return;
    if (now - last > 800) { last = now; dir = (dir + 1) % 8; }
    const img = scene.textures.get(witchTexture(scene, S.char.hat, S.char.outfit)).getSourceImage();
    x.imageSmoothingEnabled = false;
    x.clearRect(0, 0, CELL, CELL);
    x.drawImage(img, dir * CELL, 0, CELL, CELL, 0, 6, CELL, CELL);
  };
  raf = requestAnimationFrame(draw);
}

// show the intro over the café. `then` runs when the player clicks "Let's go"
export function openIntro(cafe, then) {
  scene = cafe; onDone = then; step = 0;
  ui.inGame = false; ui.busy = true;
  $('intro').classList.remove('hide', 'loading');
  render();
  preview();
}
