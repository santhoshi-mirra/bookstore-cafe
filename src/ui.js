// HTML UI helpers shared by the intro, the café and the modals (legacy "UI" section).
import { S, cup, hasDrink, streak, todayKey, mins, fmt } from './state.js';
import { DRINKS, money } from './data/drinks.js';
import { BAGS, ITEMS } from './data/unlocks.js';

export const $ = id => document.getElementById(id);

// ui.busy is true while the intro or a modal is open, so the café ignores clicks and keys
export const ui = { busy: true, inGame: false };

let toastT;
export function toast(msg, ms = 2800) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), ms);
}

export function open(id) { ui.busy = true; $(id).classList.add('on'); }
export function close(id) {
  $(id).classList.remove('on');
  ui.busy = !ui.inGame || document.querySelector('.modal.on') !== null;
}

// "Iced latte", "Hot chocolate", "Iced chocolate"
export function drinkName() {
  const d = DRINKS.find(x => x.id === cup.drink);
  if (!d) return '';
  if (cup.iced && !d.iced) return 'Iced ' + d.n.replace(/^Hot /, '').toLowerCase();
  return d.n;
}

// top bar pills, and the drink and bag lines on the timer card
export function hud() {
  $('money').textContent = money(S.money);
  $('streak').textContent = `${streak()}-day streak`;
  $('today').textContent = `${mins(S.days[todayKey()] || 0)} today`;
  const d = DRINKS.find(x => x.id === cup.drink), f = $('cupFill');
  f.style.height = (d ? Math.round(cup.level * 100) : 0) + '%';
  f.style.background = d ? d.c : 'var(--sage)';
  $('dName').textContent = d ? drinkName() : 'No drink yet';
  $('dSub').textContent = !d ? 'Visit the counter to order' : !hasDrink() ? 'Empty. Grab a refill' : 'Full · pick a seat to start';
  const items = S.char.items.map(i => ITEMS.find(x => x.id === i).n.toLowerCase()).join(', ');
  $('bagLine').innerHTML = `<img src="assets/icons/${S.char.bag}.png" alt=""><span>${BAGS[S.char.bag].n} · ${items || 'empty'}</span>`;
  pomoUI();
}

// the top half of the timer card. Sessions and breaks arrive in step 3
export function pomoUI() {
  $('pTime').textContent = fmt(S.quick ? 20 : S.len * 60);
  $('pTask').textContent = hasDrink() ? 'Pick a seat to start focusing' : 'Order a drink, then pick a seat';
}

// −$3.00 / +$10.00 pops that float up above her head for 2 s. The café moves them every frame
const pops = [];
export function pop(txt, col) {
  const el = document.createElement('div');
  el.className = 'pop';
  el.innerHTML = `<i>$</i><span style="color:${col}"></span>`;
  el.querySelector('span').textContent = txt;
  document.body.appendChild(el);
  pops.push({ el, t: 0 });
}
// (sx, sy) = her head on screen
export function updatePops(dt, sx, sy) {
  for (let i = pops.length - 1; i >= 0; i--) {
    const p = pops[i];
    p.t += dt;
    if (p.t >= 2) { p.el.remove(); pops.splice(i, 1); continue; }
    p.el.style.opacity = p.t < .15 ? p.t / .15 : p.t > 1.6 ? Math.max(0, 1 - (p.t - 1.6) / .4) : 1;
    p.el.style.transform = `translate(${sx}px,${sy - p.t * 16}px) translate(-50%,-50%)`;
  }
}
