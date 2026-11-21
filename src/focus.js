// Focus sessions and breaks (legacy "seats" and "today" sections): the Settle in modal, the timer,
// leaving early, Session complete with the break offer, and Your day.
// No cheating: time only counts while the tab is visible, leaving early pays nothing, test mode pays nothing.
import { S, cup, hasDrink, session, FOCUS, BREAK, taskEntry, save, todayKey, streak, mins } from './state.js';
import { $, open, close, toast, hud, pomoUI, pop } from './ui.js';
import { LENS, RATE, money } from './data/drinks.js';
import { ACTS, ITEMS } from './data/unlocks.js';

const SEAT_NAMES = {
  armchair_l: 'the reading armchair', armchair_r: 'the window armchair',
  1: 'the window table', 2: 'the middle table', 3: 'the corner table',
};
const seatName = key => SEAT_NAMES[key] || SEAT_NAMES[key.split('_')[1]];

let lenSel = 20, onStart = null, onStandYes = null, standUp = null;

// the café passes in how to stand her up, for when a break starts
export function bindCafe(stand) { standUp = stand; }

// can she sit down now? Says why not
export function canSit() {
  if (!hasDrink()) { toast(cup.drink ? 'Your cup is empty. Get a refill at the counter' : 'Order a drink at the counter before you sit'); return false; }
  if (session.phase === 'break') { toast('Enjoy your break first. Sit down when it ends'); return false; }
  return true;
}

/* ---- Settle in ---- */
const packed = act => ACTS.find(a => a[0] === act)[2].some(i => S.char.items.includes(i));

function renderSit() {
  const act = session.activity;
  $('optAct').innerHTML = ACTS.map(([v, l]) => `<button class="btn ${v === act ? 'sel' : ''}" data-v="${v}">${l}</button>`).join('');
  const need = ACTS.find(a => a[0] === act)[2];
  $('sitNote').textContent = packed(act) ? '' : `You didn't pack a ${ITEMS.find(x => x.id === need[0]).n.toLowerCase()}, but you can still ${act}.`;
  const custom = !LENS.includes(lenSel);
  $('optLen').innerHTML = LENS.map(m => `<button class="btn ${lenSel === m ? 'sel' : ''}" data-m="${m}">${m === 60 ? '1 hour' : m + ' min'}</button>`).join('')
    + `<button class="btn ${custom ? 'sel' : ''}" data-m="c">Custom</button>`;
  $('customWrap').classList.toggle('on', custom);
  const m = custom ? +$('customMin').value : lenSel, valid = m >= 5 && m <= 180;
  $('customErr').textContent = custom && !valid ? 'Pick 5 to 180 minutes' : '';
  $('sitGo').disabled = !valid;
  $('sitGo').textContent = S.quick ? 'Start test (20 seconds)' : valid ? `Start ${m} min · earns ${money(m * RATE)}` : 'Start';
}
$('optAct').onclick = e => {
  const b = e.target.closest('button');
  if (b) { session.activity = b.dataset.v; renderSit(); }
};
$('optLen').onclick = e => {
  const b = e.target.closest('button');
  if (!b) return;
  lenSel = b.dataset.m === 'c' ? -1 : +b.dataset.m;
  if (lenSel === -1) setTimeout(() => $('customMin').focus(), 30);
  renderSit();
};
$('customMin').oninput = renderSit;
$('taskIn').addEventListener('keydown', e => { if (e.key === 'Enter' && !$('sitGo').disabled) $('sitGo').click(); });
$('sitCancel').onclick = () => close('mSit');

// she's at a chair: ask what and how long. `start` sits her down
export function openSit(key, start) {
  onStart = start;
  $('sitSub').textContent = `You're sitting at ${seatName(key)}.`;
  $('taskIn').value = session.task;
  lenSel = S.len;
  if (!LENS.includes(lenSel)) $('customMin').value = lenSel;
  // pick an activity she packed for, if the current one isn't
  const hint = ACTS.find(a => packed(a[0]));
  if (hint && !packed(session.activity)) session.activity = hint[0];
  renderSit();
  open('mSit');
}

$('sitGo').onclick = () => {
  const m = LENS.includes(lenSel) ? lenSel : +$('customMin').value;
  if (!(m >= 5 && m <= 180)) return;
  S.len = m; save();
  close('mSit');
  Object.assign(session, { len: m, task: $('taskIn').value.trim(), phase: 'focus', pt: 0 });
  toast(S.quick ? 'Test session started (earns nothing)' : `${m}-minute focus started. Stay in this tab`);
  onStart?.();
  hud();
};

/* ---- the timer, ticked by the café every frame ---- */
let shown = -1;
export function tick(dt) {
  if (session.phase === 'focus') {
    if (document.hidden) return;
    session.pt += dt;
    cup.level = Math.max(0, 1 - session.pt / FOCUS());
    if (session.pt >= FOCUS()) { finishFocus(); return; }
  } else if (session.phase === 'break') {
    session.pt += dt;
    if (session.pt >= BREAK()) {
      Object.assign(session, { phase: 'ready', pt: 0 });
      toast("Break over. Get a refill and pick a seat when you're ready");
      hud();
      return;
    }
  } else return;
  // redraw the card once a second, not every frame
  const sec = Math.floor(session.pt);
  if (sec !== shown) { shown = sec; hud(); }
}

document.addEventListener('visibilitychange', () => {
  $('paused').style.display = document.hidden && session.phase === 'focus' ? 'grid' : 'none';
});

/* ---- leaving early ---- */
// standing up during focus asks first; `yes` stands her up
export function confirmStand(yes) {
  onStandYes = yes;
  $('standTxt').textContent = `You're ${Math.floor(session.pt / 60)} min into this session. Standing up now ends it, and you won't get paid for it.`;
  open('mStand');
}
$('standNo').onclick = () => close('mStand');
$('standYes').onclick = () => {
  close('mStand');
  Object.assign(session, { phase: 'ready', pt: 0 });
  onStandYes?.();
  hud();
  toast('Session ended early. No pay this time');
};

/* ---- session complete and the break offer ---- */
function finishFocus() {
  const earned = S.quick ? 0 : session.len * RATE, k = todayKey(), task = session.task;
  S.money += earned;
  if (!S.quick) {
    S.days[k] = (S.days[k] || 0) + session.len;
    S.ses[k] = (S.ses[k] || 0) + 1;
  }
  if (task && !taskEntry(task)) S.tasks.push({ t: task, d: k, done: false });
  save();
  cup.level = 0;
  Object.assign(session, { phase: 'ready', pt: 0 });
  hud();
  pop(earned ? '+' + money(earned) : 'Done!', '#4f8a5a');
  $('doneTxt').textContent = earned ? `You focused for ${session.len} minutes and earned ${money(earned)}.` : "Test session done. Test mode doesn't pay.";
  $('doneTaskWrap').style.display = task ? 'flex' : 'none';
  $('doneTaskTxt').textContent = `I finished: ${task}`;
  $('doneTask').checked = !!taskEntry(task)?.done;
  open('mDone');
}

function closeDone() {
  const t = session.task && taskEntry(session.task);
  if (t) {
    t.done = $('doneTask').checked;
    if (t.done) session.task = '';
    save();
  }
  close('mDone');
}
$('doneSkip').onclick = () => { closeDone(); hud(); toast("Break skipped. Get a refill when you're ready for the next one"); };
$('doneBreak').onclick = () => {
  closeDone();
  Object.assign(session, { phase: 'break', pt: 0 });
  if (session.seated) standUp?.();
  hud();
  toast('Break started. Rest a little');
};

/* ---- tasks: the checkbox on the timer card and Your day ---- */
$('pTaskCb').onchange = e => {
  let t = taskEntry(session.task);
  if (!t) { t = { t: session.task, d: todayKey(), done: false }; S.tasks.push(t); }
  t.done = e.target.checked;
  save(); pomoUI();
};

function renderToday() {
  const k = todayKey();
  $('tdMin').textContent = mins(S.days[k] || 0);
  $('tdSes').textContent = S.ses[k] || 0;
  $('tdStreak').textContent = streak();
  const list = S.tasks.map((t, i) => [t, i]).filter(([t]) => t.d === k);
  $('taskList').innerHTML = list.length
    ? list.map(([t, i]) => `<label><input type="checkbox" data-i="${i}" ${t.done ? 'checked' : ''}><span class="${t.done ? 'done' : ''}"></span></label>`).join('')
    : '<p class="note">Tasks you add when you sit down show up here.</p>';
  // task text goes in with textContent, never as HTML
  [...$('taskList').querySelectorAll('span')].forEach((s, j) => { s.textContent = list[j][0].t; });
}
$('taskList').onchange = e => {
  S.tasks[+e.target.dataset.i].done = e.target.checked;
  save(); renderToday(); pomoUI();
};
$('todayBtn').onclick = () => { renderToday(); open('mToday'); };
$('todayClose').onclick = () => close('mToday');

/* ---- settings (test mode for now; the rest comes with the dock) ---- */
// test mode can't be switched mid-session
$('setBtn').onclick = () => {
  $('quick').checked = S.quick;
  $('quick').disabled = session.phase === 'focus';
  open('mSet');
};
$('quick').onchange = e => { S.quick = e.target.checked; save(); pomoUI(); };
$('setClose').onclick = () => close('mSet');
