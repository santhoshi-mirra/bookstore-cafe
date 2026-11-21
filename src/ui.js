// HTML UI helpers shared by the intro, the café and the modals (legacy "UI" section).
import { S, streak, todayKey, mins } from './state.js';
import { money } from './data/drinks.js';

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

// top bar pills
export function hud() {
  $('money').textContent = money(S.money);
  $('streak').textContent = `${streak()}-day streak`;
  $('today').textContent = `${mins(S.days[todayKey()] || 0)} today`;
}
