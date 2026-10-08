// DayPilot UI painter. Every interface surface in the film is drawn here with
// Canvas 2D in "slab units" (u) so the same drawing code bakes a card into the
// dashboard texture and renders it as its own floating 3D card.
export const C = {
  paper: '#F7F5EF', panel: '#EFECE4', card: '#FFFFFF', ink: '#202020',
  muted: '#77746C', faint: '#A9A59B', line: '#E4E0D6',
  yellow: '#FFD43B', yellowSoft: '#FFF1BF', green: '#36D675', greenSoft: '#DDF7E7',
  graphite: '#1A1C21',
};
const SANS = '"Inter", system-ui, sans-serif';
const DISPLAY = '"Inter Display", "Inter", system-ui, sans-serif';

// ---------------------------------------------------------------- content
export const TASKS = {
  q3:     { title: 'Finish Q3 report',      meta: 'Due 5:00 PM',        tag: 'P1' },
  sarah:  { title: 'Reply to Sarah',        meta: 'Email · 5 min',      tag: 'P1' },
  mock:   { title: 'Review mockups',        meta: 'Before client call', tag: 'P2' },
  inv:    { title: 'Pay invoices',          meta: 'Due today',          tag: 'P2' },
  vendor: { title: 'Call vendor',           meta: '10 min',             tag: 'P3' },
};
export const LANDING = ['mock', 'inv', 'q3', 'vendor', 'sarah'];   // order cards first land in
export const RANKED  = ['q3', 'sarah', 'mock', 'inv', 'vendor'];   // order after prioritising
export const DONE    = ['sarah', 'inv'];

export const EVENTS = {
  standup: { title: 'Team standup', time: '9:00 – 9:30 AM', from: 9, to: 9.5, kind: 'meeting', who: ['AK', 'ML', 'JS'] },
  client:  { title: 'Client call · Acme', time: '1:00 – 2:00 PM', from: 13, to: 14, kind: 'meeting', who: ['SR', 'LB'] },
  dentist: { title: 'Dentist appointment', time: '3:30 PM', from: 15.5, to: 16.25, kind: 'reminder' },
};
export const NOTE_LONG = {
  title: 'Launch sync notes', meta: '9:12 AM',
  lines: [
    'landing page copy still not final (Maya)',
    'need pricing sign-off before Friday??',
    'beta list ~240 people, email them Tue',
    'QA found 3 bugs in onboarding flow',
    'ask Leo about launch video timing',
    'press kit due next week',
  ],
};
export const NOTE_SUMMARY = [
  'Finalize copy and pricing by Friday',
  'Email 240 beta users on Tuesday',
  'Fix 3 onboarding bugs before launch',
];

// ---------------------------------------------------------------- layout (slab units)
export const SLAB = { w: 6.4, h: 3.6 };
export const COL = {
  pri:   { x: 0.22, w: 2.12 },
  notes: { x: 2.50, w: 1.82 },
  sched: { x: 4.48, w: 1.70 },
  top: 0.66, bottom: 3.46,
};
export const TASK_SIZE = { w: 1.96, h: 0.42 };
export const taskSlot = i => ({ x: COL.pri.x + 0.08, y: 0.97 + i * 0.49, ...TASK_SIZE });
export const NOTE_SLOT = { x: COL.notes.x + 0.08, y: 0.97, w: 1.66, h: 1.52 };
export const IDEA_SLOT = { x: COL.notes.x + 0.08, y: 2.6, w: 1.66, h: 0.62 };
export const hourY = h => 1.02 + (h - 9) * 0.3;
export const EVENT_X = COL.sched.x + 0.4, EVENT_W = 1.22;
export const eventSlot = e => ({ x: EVENT_X, y: hourY(e.from) + 0.012, w: EVENT_W, h: (e.to - e.from) * 0.3 - 0.024 });
export const TAG_SIZE = { w: 0.34, h: 0.19 };
export const tagSlot = i => { const s = taskSlot(i); return { x: s.x + s.w - TAG_SIZE.w - 0.1, y: s.y + (s.h - TAG_SIZE.h) / 2, ...TAG_SIZE }; };

// ---------------------------------------------------------------- canvas helpers
export function canvas(wU, hU, ppu) {
  const c = document.createElement('canvas');
  c.width = Math.round(wU * ppu); c.height = Math.round(hU * ppu);
  const ctx = c.getContext('2d');
  ctx.scale(ppu, ppu);           // draw in slab units
  return { c, ctx };
}
export function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function txt(ctx, s, x, y, size, { weight = 500, color = C.ink, family = SANS, align = 'left', base = 'alphabetic', spacing = 0 } = {}) {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing * size}px`;
  ctx.fillText(s, x, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  return ctx.measureText(s).width;
}
function check(ctx, cx, cy, s, color, width) {
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.45, cy + s * 0.02); ctx.lineTo(cx - s * 0.1, cy + s * 0.35); ctx.lineTo(cx + s * 0.5, cy - s * 0.35);
  ctx.strokeStyle = color; ctx.lineWidth = width; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.stroke();
}
function sparkle(ctx, cx, cy, s, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.quadraticCurveTo(cx + s * 0.12, cy - s * 0.12, cx + s, cy);
  ctx.quadraticCurveTo(cx + s * 0.12, cy + s * 0.12, cx, cy + s);
  ctx.quadraticCurveTo(cx - s * 0.12, cy + s * 0.12, cx - s, cy);
  ctx.quadraticCurveTo(cx - s * 0.12, cy - s * 0.12, cx, cy - s);
  ctx.fillStyle = color; ctx.fill();
}
export function navMark(ctx, x, y, s, { bg = C.yellow, fg = C.ink } = {}) {
  rr(ctx, x, y, s, s, s * 0.26); ctx.fillStyle = bg; ctx.fill();
  // navigation pointer: the "pilot"
  const cx = x + s / 2, cy = y + s / 2;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.3); ctx.lineTo(s * 0.21, s * 0.25); ctx.lineTo(0, s * 0.13); ctx.lineTo(-s * 0.21, s * 0.25); ctx.closePath();
  ctx.fillStyle = fg; ctx.lineJoin = 'round'; ctx.lineWidth = s * 0.05; ctx.strokeStyle = fg; ctx.fill(); ctx.stroke();
  ctx.restore();
}
function avatar(ctx, cx, cy, r, initials, i) {
  const fills = ['#2E3138', '#FFD43B', '#C9C4B8'];
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = fills[i % 3]; ctx.fill();
  ctx.lineWidth = r * 0.18; ctx.strokeStyle = C.card; ctx.stroke();
  txt(ctx, initials, cx, cy + r * 0.36, r * 0.95, { weight: 600, color: i % 3 === 0 ? '#fff' : C.ink, align: 'center' });
}
function cardBase(ctx, x, y, w, h, { fill = C.card, border = C.line, r = 0.07 } = {}) {
  rr(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = 0.006; ctx.strokeStyle = border; ctx.stroke();
}

// ---------------------------------------------------------------- components
export function drawTask(ctx, x, y, w, h, key, { done = false, tag = null } = {}) {
  const d = TASKS[key];
  cardBase(ctx, x, y, w, h);
  const cx = x + 0.2, cy = y + h / 2;
  ctx.beginPath(); ctx.arc(cx, cy, 0.075, 0, Math.PI * 2);
  if (done) { ctx.fillStyle = C.green; ctx.fill(); check(ctx, cx, cy, 0.08, '#fff', 0.018); }
  else { ctx.lineWidth = 0.012; ctx.strokeStyle = '#BDB8AC'; ctx.stroke(); }
  const tx = x + 0.36;
  const tw = txt(ctx, d.title, tx, y + h * 0.5 - 0.005, 0.128, { weight: 600, color: done ? C.faint : C.ink });
  if (done) { ctx.fillStyle = C.faint; ctx.fillRect(tx, y + h * 0.5 - 0.045, tw, 0.009); }
  txt(ctx, d.meta, tx, y + h * 0.5 + 0.118, 0.088, { weight: 500, color: done ? C.faint : C.muted });
  if (tag) drawTag(ctx, x + w - TAG_SIZE.w - 0.1, y + (h - TAG_SIZE.h) / 2, tag);
}
export function drawTag(ctx, x, y, tag) {
  const { w, h } = TAG_SIZE;
  const style = { P1: [C.yellow, C.ink], P2: [C.yellowSoft, C.ink], P3: ['#ECE9E1', '#55524B'] }[tag];
  rr(ctx, x, y, w, h, h / 2); ctx.fillStyle = style[0]; ctx.fill();
  txt(ctx, tag, x + w / 2, y + h * 0.7, 0.105, { weight: 700, color: style[1], align: 'center' });
}
export function drawEvent(ctx, x, y, w, h, key) {
  const e = EVENTS[key];
  const fill = e.kind === 'reminder' ? '#F3EFE4' : '#EAE6DC';
  rr(ctx, x, y, w, h, Math.min(0.05, h / 3)); ctx.fillStyle = fill; ctx.fill();
  rr(ctx, x, y, 0.035, h, 0.017); ctx.fillStyle = e.kind === 'reminder' ? '#B8B2A4' : C.ink; ctx.fill();
  if (h < 0.2) {
    const tw = txt(ctx, e.title, x + 0.08, y + h / 2 + 0.03, 0.082, { weight: 600 });
    txt(ctx, e.time.replace(' AM', '').replace(' PM', ''), x + 0.08 + tw + 0.05, y + h / 2 + 0.03, 0.072, { weight: 500, color: C.muted });
  } else {
    txt(ctx, e.title, x + 0.08, y + 0.11, 0.085, { weight: 600 });
    txt(ctx, e.time, x + 0.08, y + 0.205, 0.07, { weight: 500, color: C.muted });
  }
}
// floating card versions of calendar items (the "scattered" look)
export function drawEventCard(ctx, x, y, w, h, key) {
  const e = EVENTS[key];
  cardBase(ctx, x, y, w, h);
  const ix = x + 0.1, iy = y + 0.1, is = h - 0.2;
  rr(ctx, ix, iy, is, is, 0.06); ctx.fillStyle = e.kind === 'reminder' ? C.yellowSoft : '#ECE9E1'; ctx.fill();
  if (e.kind === 'reminder') bell(ctx, ix + is / 2, iy + is / 2, is * 0.5);
  else calIcon(ctx, ix + is / 2, iy + is / 2, is * 0.5, e.from);
  const tx = ix + is + 0.1;
  txt(ctx, e.kind === 'reminder' ? 'REMINDER' : 'MEETING', tx, y + 0.14, 0.058, { weight: 700, color: C.muted, spacing: 0.08 });
  txt(ctx, e.title, tx, y + 0.28, 0.105, { weight: 600 });
  txt(ctx, e.time, tx, y + 0.41, 0.08, { weight: 500, color: C.muted });
  if (e.who) e.who.forEach((n, i) => avatar(ctx, x + w - 0.16 - (e.who.length - 1 - i) * 0.1, y + h - 0.15, 0.065, n, i));
}
function bell(ctx, cx, cy, s) {
  ctx.fillStyle = C.ink;
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy + s * 0.28);
  ctx.quadraticCurveTo(cx - s * 0.3, cy + s * 0.1, cx - s * 0.3, cy - s * 0.1);
  ctx.arc(cx, cy - s * 0.1, s * 0.3, Math.PI, 0);
  ctx.quadraticCurveTo(cx + s * 0.3, cy + s * 0.1, cx + s * 0.42, cy + s * 0.28);
  ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx, cy + s * 0.38, s * 0.1, 0, Math.PI * 2); ctx.fill();
}
function calIcon(ctx, cx, cy, s, hour) {
  rr(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.15); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.save(); rr(ctx, cx - s / 2, cy - s / 2, s, s, s * 0.15); ctx.clip();
  ctx.fillStyle = C.ink; ctx.fillRect(cx - s / 2, cy - s / 2, s, s * 0.28); ctx.restore();
  txt(ctx, String(hour > 12 ? hour - 12 : hour), cx, cy + s * 0.36, s * 0.5, { weight: 700, align: 'center' });
}
export function drawNoteLong(ctx, x, y, w, h, { chipHot = 0 } = {}) {
  cardBase(ctx, x, y, w, h);
  txt(ctx, NOTE_LONG.title, x + 0.12, y + 0.2, 0.115, { weight: 600 });
  txt(ctx, NOTE_LONG.meta, x + w - 0.12, y + 0.2, 0.072, { weight: 500, color: C.faint, align: 'right' });
  ctx.fillStyle = C.line; ctx.fillRect(x + 0.12, y + 0.28, w - 0.24, 0.005);
  NOTE_LONG.lines.forEach((l, i) => {
    txt(ctx, '–', x + 0.12, y + 0.42 + i * 0.145, 0.078, { color: C.faint });
    txt(ctx, l, x + 0.2, y + 0.42 + i * 0.145, 0.078, { weight: 450, color: '#4A4842' });
  });
  // assistant action chip
  const cw = 0.62, ch = 0.17, cx = x + w - cw - 0.12, cy = y + h - ch - 0.08;
  rr(ctx, cx, cy, cw, ch, ch / 2);
  ctx.fillStyle = chipHot ? C.yellow : C.yellowSoft; ctx.fill();
  sparkle(ctx, cx + 0.1, cy + ch / 2, 0.045, C.ink);
  txt(ctx, 'Summarize', cx + 0.17, cy + ch * 0.68, 0.078, { weight: 600 });
}
export function drawNoteSummary(ctx, x, y, w, h) {
  cardBase(ctx, x, y, w, h, { border: '#F0D873' });
  rr(ctx, x + 0.12, y + 0.1, 0.17, 0.17, 0.05); ctx.fillStyle = C.yellow; ctx.fill();
  sparkle(ctx, x + 0.205, y + 0.185, 0.055, C.ink);
  txt(ctx, 'Summary', x + 0.36, y + 0.21, 0.115, { weight: 600 });
  txt(ctx, 'Launch sync', x + w - 0.12, y + 0.21, 0.072, { weight: 500, color: C.faint, align: 'right' });
  ctx.fillStyle = C.line; ctx.fillRect(x + 0.12, y + 0.32, w - 0.24, 0.005);
  NOTE_SUMMARY.forEach((l, i) => {
    const ly = y + 0.5 + i * 0.235;
    ctx.beginPath(); ctx.arc(x + 0.17, ly - 0.03, 0.03, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
    txt(ctx, l, x + 0.25, ly, 0.092, { weight: 550 });
  });
  const cw = 0.94, ch = 0.17, cx = x + 0.12, cy = y + h - ch - 0.08;
  rr(ctx, cx, cy, cw, ch, ch / 2); ctx.fillStyle = C.greenSoft; ctx.fill();
  ctx.beginPath(); ctx.arc(cx + 0.09, cy + ch / 2, 0.048, 0, Math.PI * 2); ctx.fillStyle = C.green; ctx.fill();
  check(ctx, cx + 0.09, cy + ch / 2, 0.05, '#fff', 0.012);
  txt(ctx, '6 notes → 3 actions', cx + 0.17, cy + ch * 0.68, 0.075, { weight: 600, color: '#1E7A45' });
}
export function drawIdeaNote(ctx, x, y, w, h) {
  cardBase(ctx, x, y, w, h);
  txt(ctx, 'Ideas for onboarding', x + 0.12, y + 0.2, 0.1, { weight: 600 });
  txt(ctx, 'Checklist, welcome video,', x + 0.12, y + 0.36, 0.078, { weight: 450, color: C.muted });
  txt(ctx, 'tips inside the empty state…', x + 0.12, y + 0.49, 0.078, { weight: 450, color: C.muted });
}
export function drawFocus(ctx, x, y, w, h, { time = '10:00 AM – 12:00 PM', conflict = false, protectedOk = false } = {}) {
  rr(ctx, x, y, w, h, 0.06); ctx.fillStyle = C.yellow; ctx.fill();
  if (conflict) { ctx.setLineDash([0.04, 0.03]); ctx.lineWidth = 0.012; ctx.strokeStyle = C.ink; rr(ctx, x + 0.012, y + 0.012, w - 0.024, h - 0.024, 0.05); ctx.stroke(); ctx.setLineDash([]); }
  txt(ctx, 'FOCUS', x + 0.1, y + 0.13, 0.058, { weight: 700, spacing: 0.1 });
  txt(ctx, 'Q3 report', x + 0.1, y + 0.27, 0.11, { weight: 700 });
  txt(ctx, time, x + 0.1, y + 0.39, 0.074, { weight: 550, color: '#4A3F14' });
  if (conflict) txt(ctx, 'Overlaps Dentist 3:30', x + 0.1, y + h - 0.08, 0.066, { weight: 600, color: '#4A3F14' });
  if (protectedOk) {
    const cw = 0.56, ch = 0.15, cx = x + 0.1, cy = y + h - ch - 0.06;
    rr(ctx, cx, cy, cw, ch, ch / 2); ctx.fillStyle = C.ink; ctx.fill();
    ctx.beginPath(); ctx.arc(cx + 0.08, cy + ch / 2, 0.042, 0, Math.PI * 2); ctx.fillStyle = C.green; ctx.fill();
    check(ctx, cx + 0.08, cy + ch / 2, 0.045, C.ink, 0.011);
    txt(ctx, 'Protected', cx + 0.15, cy + ch * 0.69, 0.07, { weight: 600, color: '#fff' });
  }
}
export function drawNoise(ctx, x, y, w, h, kind) {
  cardBase(ctx, x, y, w, h);
  if (kind === 'tabs') {
    ctx.fillStyle = '#ECE9E1'; rr(ctx, x, y, w, 0.2, 0.07); ctx.fill(); ctx.fillRect(x, y + 0.12, w, 0.08);
    for (let i = 0; i < 7; i++) { rr(ctx, x + 0.1 + i * 0.2, y + 0.06, 0.18, 0.14, 0.03); ctx.fillStyle = i === 2 ? '#fff' : '#DCD8CE'; ctx.fill(); }
    txt(ctx, '14 tabs open', x + 0.12, y + 0.42, 0.115, { weight: 600 });
    txt(ctx, 'Docs, sheets, inbox, calendar…', x + 0.12, y + 0.56, 0.075, { color: C.muted });
  } else {
    const d = {
      email:    ['Inbox', '23 unread emails', 'Re: Q3 numbers · Invoice #482'],
      messages: ['Messages', '9 new messages', '“Can you review this today?”'],
      invite:   ['New invite', 'Budget review', 'Friday · 2:00 PM · Accept?'],
    }[kind];
    txt(ctx, d[0].toUpperCase(), x + 0.12, y + 0.15, 0.058, { weight: 700, color: C.muted, spacing: 0.08 });
    txt(ctx, d[1], x + 0.12, y + 0.3, 0.105, { weight: 600 });
    txt(ctx, d[2], x + 0.12, y + 0.43, 0.075, { color: C.muted });
  }
}
export function drawBadge(ctx, s, label) {
  ctx.beginPath(); ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2); ctx.fillStyle = C.yellow; ctx.fill();
  txt(ctx, label, s / 2, s * 0.66, s * (label.length > 1 ? 0.42 : 0.52), { weight: 700, align: 'center' });
}

// ---------------------------------------------------------------- command bar
export const BAR = { w: 3.3, h: 0.42 };
export function drawBar(ctx, { typed = '', caret = false, thinking = -1 } = {}) {
  const { w, h } = BAR;
  rr(ctx, 0.01, 0.01, w - 0.02, h - 0.02, (h - 0.02) / 2); ctx.fillStyle = C.card; ctx.fill();
  rr(ctx, 0.08, 0.08, h - 0.16, h - 0.16, (h - 0.16) / 2); ctx.fillStyle = C.yellow; ctx.fill();
  sparkle(ctx, 0.08 + (h - 0.16) / 2, h / 2, 0.075, C.ink);
  const tx = h + 0.02, ty = h / 2 + 0.048;
  if (thinking >= 0) {
    ctx.save();
    const g = ctx.createLinearGradient(tx + (thinking * 3 - 1), 0, tx + (thinking * 3 - 1) + 1.2, 0);
    g.addColorStop(0, C.muted); g.addColorStop(0.5, C.ink); g.addColorStop(1, C.muted);
    txt(ctx, 'Planning your day…', tx, ty, 0.14, { weight: 550, color: g });
    ctx.restore();
  } else if (typed) {
    const tw = txt(ctx, typed, tx, ty, 0.14, { weight: 550 });
    if (caret) { ctx.fillStyle = C.ink; ctx.fillRect(tx + tw + 0.012, h / 2 - 0.085, 0.012, 0.17); }
  } else {
    txt(ctx, 'Ask DayPilot…', tx, ty, 0.14, { weight: 450, color: C.faint });
    if (caret) { ctx.fillStyle = C.ink; ctx.fillRect(tx - 0.02, h / 2 - 0.085, 0.012, 0.17); }
  }
  // return key hint
  const kx = w - 0.42, ky = h / 2 - 0.1;
  rr(ctx, kx, ky, 0.3, 0.2, 0.05); ctx.fillStyle = thinking >= 0 ? C.ink : '#F0EDE6'; ctx.fill();
  txt(ctx, '↵', kx + 0.15, ky + 0.15, 0.13, { weight: 600, align: 'center', color: thinking >= 0 ? C.yellow : C.muted });
}

// ---------------------------------------------------------------- the dashboard slab
// state: 'intro' (unsorted day), 'board' (empty frame, items are 3D), 'plan' (board while the
// assistant works), 'final' (planned day)
export function drawSlab(ctx, state) {
  const { w, h } = SLAB, m = 0.03;
  rr(ctx, m, m, w - 2 * m, h - 2 * m, 0.16); ctx.fillStyle = C.paper; ctx.fill();
  // header
  navMark(ctx, 0.24, 0.2, 0.3);
  txt(ctx, 'DayPilot', 0.62, 0.42, 0.16, { weight: 700, family: DISPLAY });
  ctx.fillStyle = C.line; ctx.fillRect(1.52, 0.24, 0.006, 0.22);
  txt(ctx, state === 'final' || state === 'plan' ? 'Today' : 'Good morning, Alex', 1.68, 0.3, 0.085, { weight: 600, color: C.muted });
  txt(ctx, 'Thursday, October 8', 1.68, 0.44, 0.105, { weight: 600 });
  const chips = {
    intro: [['14 items', '#ECE9E1', C.ink], ['Nothing planned', '#ECE9E1', C.muted]],
    board: [['14 items', '#ECE9E1', C.ink], ['Nothing planned', '#ECE9E1', C.muted]],
    plan:  [['Planning your day…', C.yellow, C.ink]],
    final: [['Day planned', C.greenSoft, '#1E7A45', true], ['2h focus', C.yellowSoft, C.ink], ['2 of 5 done', '#ECE9E1', C.ink]],
  }[state];
  let cx = w - 0.24;
  for (const [label, bg, fg, ok] of [...chips].reverse()) {
    ctx.font = `600 0.085px ${SANS}`;
    const cw = ctx.measureText(label).width + (ok ? 0.34 : state === 'plan' ? 0.3 : 0.24);
    cx -= cw;
    rr(ctx, cx, 0.22, cw, 0.24, 0.12); ctx.fillStyle = bg; ctx.fill();
    if (ok) { ctx.beginPath(); ctx.arc(cx + 0.14, 0.34, 0.055, 0, Math.PI * 2); ctx.fillStyle = C.green; ctx.fill(); check(ctx, cx + 0.14, 0.34, 0.06, '#fff', 0.014); }
    if (state === 'plan') sparkle(ctx, cx + 0.12, 0.34, 0.04, C.ink);
    txt(ctx, label, cx + (ok ? 0.24 : state === 'plan' ? 0.2 : 0.12), 0.37, 0.085, { weight: 600, color: fg });
    cx -= 0.08;
  }
  ctx.fillStyle = C.line; ctx.fillRect(0.22, 0.6, w - 0.44, 0.006);
  // columns
  const heads = [[COL.pri, 'Priorities', state === 'final' ? 'Ranked by AI' : '5 tasks'],
                 [COL.notes, 'Notes', state === 'final' ? 'Summarized' : '2 notes'],
                 [COL.sched, 'Schedule', state === 'final' ? '2h focus booked' : '3 events']];
  for (const [col, title, sub] of heads) {
    rr(ctx, col.x, COL.top + 0.08, col.w, COL.bottom - COL.top - 0.08, 0.1); ctx.fillStyle = C.panel; ctx.fill();
    txt(ctx, title, col.x + 0.1, 0.9, 0.092, { weight: 700 });
    txt(ctx, sub, col.x + col.w - 0.1, 0.9, 0.07, { weight: 550, color: state === 'final' ? '#1E7A45' : C.muted, align: 'right' });
  }
  // schedule rail
  for (let hr = 9; hr <= 17; hr++) {
    const y = hourY(hr);
    txt(ctx, `${hr > 12 ? hr - 12 : hr} ${hr >= 12 ? 'PM' : 'AM'}`, COL.sched.x + 0.08, y + 0.025, 0.062, { weight: 500, color: C.faint });
    ctx.fillStyle = '#E2DED3'; ctx.fillRect(EVENT_X, y, EVENT_W, 0.004);
  }
  if (state === 'board' || state === 'plan') return;
  if (state === 'intro') {
    LANDING.forEach((k, i) => { const s = taskSlot(i); drawTask(ctx, s.x, s.y, s.w, s.h, k); });
    drawNoteLong(ctx, NOTE_SLOT.x, NOTE_SLOT.y, NOTE_SLOT.w, NOTE_SLOT.h);
  } else {
    RANKED.forEach((k, i) => { const s = taskSlot(i); drawTask(ctx, s.x, s.y, s.w, s.h, k, { done: DONE.includes(k), tag: TASKS[k].tag }); });
    drawNoteSummary(ctx, NOTE_SLOT.x, NOTE_SLOT.y, NOTE_SLOT.w, NOTE_SLOT.h);
    const f = { x: EVENT_X, y: hourY(10) + 0.012, w: EVENT_W, h: 0.6 - 0.024 };
    drawFocus(ctx, f.x, f.y, f.w, f.h, { protectedOk: true });
  }
  drawIdeaNote(ctx, IDEA_SLOT.x, IDEA_SLOT.y, IDEA_SLOT.w, IDEA_SLOT.h);
  for (const k of Object.keys(EVENTS)) { const s = eventSlot(EVENTS[k]); drawEvent(ctx, s.x, s.y, s.w, s.h, k); }
}

// ---------------------------------------------------------------- typography
export function textCanvas(str, { size = 120, weight = 700, color = '#fff', family = DISPLAY, pad = 0.25, spacing = -0.02 } = {}) {
  const probe = document.createElement('canvas').getContext('2d');
  probe.font = `${weight} ${size}px ${family}`;
  if ('letterSpacing' in probe) probe.letterSpacing = `${spacing * size}px`;
  const tw = Math.ceil(probe.measureText(str).width);
  const p = Math.round(size * pad);
  const c = document.createElement('canvas');
  c.width = tw + p * 2; c.height = Math.round(size * 1.3) + p * 2;
  const ctx = c.getContext('2d');
  ctx.font = probe.font; ctx.fillStyle = color; ctx.textBaseline = 'alphabetic';
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${spacing * size}px`;
  ctx.fillText(str, p, p + size * 1.0);
  return { c, textW: tw, pad: p, size };
}
