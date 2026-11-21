// The drinks menu at the counter and the Unlocks modal (legacy "order" and "shop" sections).
import { S, cup, hasDrink, save, has } from './state.js';
import { $, open, close, toast, hud, pop, drinkName } from './ui.js';
import { DRINKS, money } from './data/drinks.js';
import { SHOP } from './data/unlocks.js';

const LOCK = '<svg class="ico" viewBox="0 0 24 24"><use href="#lock"/></svg>';
const SPEND = '#c4546f', EARN = '#4f8a5a';

function renderMenu() {
  $('menu').innerHTML = DRINKS.map(d => {
    if (d.lock && !has(d.lock)) {
      return `<div class="mi lockd"><span>${d.n}<small>Unlock it in Unlocks</small></span><span class="p">${LOCK}${money(d.p)}</span></div>`;
    }
    const dis = S.money < d.p ? 'disabled' : '';
    const btn = (iced, label) => `<button class="btn sm" data-id="${d.id}" data-i="${iced}" ${dis}>${label}</button>`;
    return `<div class="mi"><span>${d.n}</span><span class="opts"><span class="p">${money(d.p)}</span>${d.iced ? btn(1, 'Iced') : btn(0, 'Hot') + btn(1, 'Iced')}</span></div>`;
  }).join('');
}

$('menu').onclick = e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  const d = DRINKS.find(x => x.id === b.dataset.id);
  S.money -= d.p;
  Object.assign(cup, { drink: d.id, iced: b.dataset.i === '1', level: 1 });
  save(); hud(); close('mOrder');
  pop('−' + money(d.p), SPEND);
  toast(`${drinkName()} in hand. Now find a seat`);
};
$('orderClose').onclick = () => close('mOrder');

// at the counter: the menu, or a free latte when she can't afford anything
export function doOrder() {
  if (hasDrink()) { toast('You still have a drink. Find a seat!'); return; }
  const cheapest = Math.min(...DRINKS.filter(d => !d.lock || has(d.lock)).map(d => d.p));
  if (S.money < cheapest) {
    Object.assign(cup, { drink: 'latte', iced: false, level: 1 });
    hud();
    pop('Free!', EARN);
    toast('Short on money? The barista slides you a free latte');
    return;
  }
  renderMenu();
  open('mOrder');
}

function renderShop() {
  $('shop').innerHTML = SHOP.map(([title, list]) => `<h3>${title}</h3><div class="menu">${list.map(s =>
    `<button class="mi" data-id="${s.id}" ${has(s.id) || S.money < s.c ? 'disabled' : ''}><span>${s.n}</span>
      <span class="p">${has(s.id) ? 'Unlocked' : LOCK + money(s.c)}</span></button>`).join('')}</div>`).join('');
}
$('shop').onclick = e => {
  const b = e.target.closest('button');
  if (!b || b.disabled) return;
  const s = SHOP.flatMap(x => x[1]).find(x => x.id === b.dataset.id);
  S.money -= s.c;
  S.unlocked.push(s.id);
  save(); hud(); renderShop();
  pop('−' + money(s.c), SPEND);
  toast(`${s.n} unlocked!`);
};
$('shopBtn').onclick = () => { renderShop(); open('mShop'); };
$('shopClose').onclick = () => close('mShop');
