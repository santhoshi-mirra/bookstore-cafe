// The save. Everything persists in localStorage under lunaria-v1, in the same shape as legacy.html,
// so an old save carries over.
import { HATS, OUTFITS, BAGS } from './data/unlocks.js';

const KEY = 'lunaria-v1';

export const S = {
  money: 6, unlocked: [],
  char: { hat: 'purple', outfit: 'cream', bag: 'backpack', items: ['notebook', 'headphones'] },
  len: 20, quick: false, night: null, days: {}, ses: {}, tasks: [],
  vol: { cafe: 50, cups: 40, rain: 30, waves: 0, fire: 25, music: 60 },
};
try {
  const t = JSON.parse(localStorage.getItem(KEY));
  if (t) Object.assign(S, t, { vol: { ...S.vol, ...t.vol }, char: { ...S.char, ...t.char } });
} catch (e) {}
// drop anything a stale save points at that no longer exists
if (!HATS[S.char.hat]) S.char.hat = 'purple';
if (!OUTFITS[S.char.outfit]) S.char.outfit = 'cream';
if (!BAGS[S.char.bag]) S.char.bag = 'backpack';

export const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
export const has = id => S.unlocked.includes(id);

export const todayKey = () => new Date().toLocaleDateString('en-CA');
// days in a row with any focus, counting yesterday back if nothing yet today
export function streak() {
  let n = 0;
  const d = new Date();
  if (!(S.days[todayKey()] > 0)) d.setDate(d.getDate() - 1);
  while (S.days[d.toLocaleDateString('en-CA')] > 0) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

// 1:05:09 or 5:09
export function fmt(s) {
  s = Math.max(0, Math.ceil(s));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
}
export const mins = m => m >= 60 ? `${Math.floor(m / 60)}h ${Math.round(m % 60)}m` : `${Math.round(m)}m`;

// the drink in her hand: not saved, so each visit starts with an empty hand (same as legacy).
// level goes from 1 (full) to 0 over a focus session
export const cup = { drink: null, iced: false, level: 0 };
export const hasDrink = () => cup.drink !== null && cup.level > 0.02;

// the focus timer (not saved). phase: 'ready' | 'focus' | 'break'. pt = seconds into the phase.
// seated = she's sitting on a chair (set by the café)
export const session = { phase: 'ready', pt: 0, len: 20, activity: 'study', task: '', seated: false };
export const FOCUS = () => S.quick ? 20 : session.len * 60;
export const BREAK = () => S.quick ? 10 : 600;
// today's entry for a task, if there is one
export const taskEntry = t => S.tasks.filter(x => x.t === t && x.d === todayKey()).pop();
