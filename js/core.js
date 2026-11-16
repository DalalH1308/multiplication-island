/* ===== core.js : saving progress, sounds, read-aloud, small helpers ===== */
'use strict';

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
function el(html) { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
const pick = a => a[Math.floor(Math.random() * a.length)];
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);

/* ---------- skills: every fact (T, n) has 3 separate skills ---------- */
const SKILLS = ['mul', 'div', 'miss'];
const SKILL_NAME = { mul: 'Times ×', div: 'Divide ÷', miss: 'Missing number ?' };
const skillOf = type => type === 'missing' ? 'miss' : (type === 'div' || type === 'div2' || type === 'family') ? 'div' : 'mul';
/* "family" questions show the multiplication fact first, so they can never prove mastery alone. */
const TYPE_MAX_LVL = { family: 2 };
const blankSkill = () => ({ lvl: 0, seen: 0, right: 0, helped: 0, wrong: 0 });
const num = (v, d = 0) => (typeof v === 'number' && isFinite(v) ? v : d);

/* ---------- progress (saved in this browser) ---------- */
const Store = {
  key: 'multIsland.v1',
  d: null,
  load() {
    try { this.d = JSON.parse(localStorage.getItem(this.key)); } catch (e) { this.d = null; }
    if (!this.d || typeof this.d !== 'object') this.d = {};
    ['facts', 'areas', 'learned', 'explored', 'adv'].forEach(k => { if (!this.d[k] || typeof this.d[k] !== 'object' || Array.isArray(this.d[k])) this.d[k] = {}; });
    if (!Array.isArray(this.d.review)) this.d.review = [];
    this.d.stars = num(this.d.stars); this.d.rounds = num(this.d.rounds); this.d.qCount = num(this.d.qCount);
    if (typeof this.d.sound !== 'boolean') this.d.sound = true;
    /* version 1 kept one record per fact: it was multiplication only, so move it to the "mul" skill */
    Object.keys(this.d.facts).forEach(k => {
      const f = this.d.facts[k];
      if (!f || typeof f !== 'object') { delete this.d.facts[k]; return; }
      if ('lvl' in f) this.d.facts[k] = { mul: { ...blankSkill(), lvl: num(f.lvl), seen: num(f.seen), right: num(f.right), wrong: num(f.wrong) } };
    });
    this.d.review = this.d.review.filter(r => r && TABLES.includes(r.T) && r.n >= 1 && r.n <= 10 && SKILLS.includes(r.s));
    this.d.v = 2;
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.d)); } catch (e) { /* private mode: keep playing without saving */ } },
  peek(T, n, s) { const f = this.d.facts[T + 'x' + n]; return f && f[s] ? f[s] : null; },
  skill(T, n, s) {
    const k = T + 'x' + n;
    const f = this.d.facts[k] || (this.d.facts[k] = {});
    return f[s] || (f[s] = blankSkill());
  },
  /* outcome: 'independent' = right on the first try with no hint, picture or steps (level +1)
              'helped'      = right on the first try, but a helper was opened (level stays)
              'missed'      = at least one wrong answer (level −1, never below 0) */
  record(q, outcome) {
    const s = skillOf(q.type), r = this.skill(q.T, q.n, s);
    r.seen++;
    if (outcome === 'independent') { r.right++; const cap = TYPE_MAX_LVL[q.type] || 4; if (r.lvl < cap) r.lvl++; }
    else if (outcome === 'helped') r.helped++;
    else { r.wrong++; r.lvl = Math.max(0, r.lvl - 1); }
    this.updateReview(q.T, q.n, s, outcome);
    this.save();
  },
  /* Saved review list. A missed fact comes back 3 questions later (in the next round if the round ends first).
     It needs 2 independent answers to leave the list; the second one is checked 10 questions later (a later round). */
  updateReview(T, n, s, outcome) {
    const R = this.d.review, i = R.findIndex(r => r.T === T && r.n === n && r.s === s);
    if (outcome === 'independent') {
      if (i < 0 || R[i].due > this.d.qCount) return;   /* only a review at its planned time counts */
      R[i].need--;
      if (R[i].need <= 0) R.splice(i, 1); else R[i].due = this.d.qCount + 10;
    } else if (i >= 0) {
      R[i].due = this.d.qCount + 3;
      if (outcome === 'missed') R[i].need = 2;
    } else R.push({ T, n, s, need: outcome === 'missed' ? 2 : 1, due: this.d.qCount + 3 });
  },
  addStars(k) { this.d.stars += k; this.save(); updateStarCount(); },
  areaDone(id) { return !!(this.d.areas[id] && this.d.areas[id].done); },
  unlocked(i) { return i === 0 || this.areaDone(LOCATIONS[i - 1].id); },
  reset() { try { localStorage.removeItem(this.key); } catch (e) {} this.d = null; this.load(); updateStarCount(); }
};

function skillStatus(T, n, s) {
  const r = Store.peek(T, n, s);
  if (!r || !r.seen) return 'new';
  if (r.lvl >= 4) return 'mastered';
  if (r.lvl >= 2) return 'almost';
  return 'learning';
}
const STATUS_LABEL = { new: 'Not tried yet', learning: 'Practicing', almost: 'Almost there', mastered: 'I know it!' };

function updateStarCount() { const s = $('#starCount'); if (s) s.textContent = Store.d.stars; }

/* ---------- soft sounds made in code ---------- */
const Sound = {
  ctx: null,
  tone(freqs, dur = 0.12, type = 'sine', vol = 0.05, gap = 0.09) {
    if (!Store.d.sound) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const now = this.ctx.currentTime;
      freqs.forEach((f, i) => {
        const o = this.ctx.createOscillator(), g = this.ctx.createGain();
        o.type = type; o.frequency.value = f;
        const t0 = now + i * gap;
        g.gain.setValueAtTime(0, t0);
        g.gain.linearRampToValueAtTime(vol, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        o.connect(g).connect(this.ctx.destination);
        o.start(t0); o.stop(t0 + dur + 0.05);
      });
    } catch (e) {}
  },
  ok() { this.tone([660, 880], 0.16); },
  soft() { this.tone([440, 392], 0.16, 'triangle', 0.03, 0.12); },
  tap() { this.tone([520], 0.05, 'sine', 0.025); },
  star() { this.tone([523, 659, 784, 1046], 0.2, 'sine', 0.045, 0.11); },
  build() { this.tone([392, 523], 0.12, 'triangle', 0.04, 0.08); }
};

/* ---------- read aloud in English (helps children who are still learning English) ---------- */
const Voice = {
  v: null,
  init() {
    if (!('speechSynthesis' in window)) return;
    const choose = () => {
      const vs = speechSynthesis.getVoices();
      this.v = vs.find(v => /^en[-_](US|GB)/i.test(v.lang)) || vs.find(v => /^en/i.test(v.lang)) || null;
    };
    choose();
    speechSynthesis.onvoiceschanged = choose;
  },
  get ok() { return 'speechSynthesis' in window; },
  /* Never read English with a non-English voice: tell the child instead. */
  speak(text) {
    if (!this.ok) return;
    if (!this.v) { toast('Read aloud needs an English voice on this device.'); return; }
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(mathToWords(text));
      if (this.v) u.voice = this.v;
      u.lang = this.v ? this.v.lang : 'en-US';
      u.rate = 0.85;
      speechSynthesis.speak(u);
    } catch (e) {}
  },
  stop() { try { if (this.ok) speechSynthesis.cancel(); } catch (e) {} }
};
function mathToWords(t) {
  return String(t)
    .replace(/×/g, ' times ').replace(/÷/g, ' divided by ').replace(/−/g, ' minus ')
    .replace(/\+/g, ' plus ').replace(/=/g, ' equals ').replace(/→/g, ', ').replace(/…/g, ', and so on.');
}

/* ---------- toast + dialog ---------- */
let toastT = null;
function toast(text) {
  const t = $('#toast');
  t.textContent = text; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
function confirmBox(title, text, yes, no) {
  return new Promise(res => {
    const m = el(`<div class="modal" role="dialog" aria-modal="true" aria-labelledby="mTitle">
      <div class="modal-card">
        <h2 id="mTitle">${title}</h2><p>${text}</p>
        <div class="row-btns"><button class="btn ghost" data-a="no">${no}</button><button class="btn warm" data-a="yes">${yes}</button></div>
      </div></div>`);
    document.body.appendChild(m);
    $('[data-a="no"]', m).focus();
    m.addEventListener('click', e => {
      const a = e.target.closest('[data-a]');
      if (!a && e.target !== m) return;
      m.remove(); res(!!a && a.dataset.a === 'yes');
    });
  });
}

/* one keyboard handler at a time (the active screen sets it) */
let keyHandler = null;
document.addEventListener('keydown', e => { if (keyHandler && !document.querySelector('.modal')) keyHandler(e); });
