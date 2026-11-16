/* ===== engine.js : questions, hints, learning from mistakes, adaptive choice, the quiz screen ===== */
'use strict';

/* "T × n" always means T groups of n. Every question belongs to one fact (T, n). */
function makeQuestion(T, n, type) {
  const p = T * n;
  const base = { T, n, p, type };
  switch (type) {
    case 'turn': return { ...base, a: n, b: T, parts: [n, '×', T, '=', '?'], answer: p, full: `${n} × ${T} = ${p}`,
      instr: `${n} groups of ${T}. How many in all?` };
    case 'missing': return { ...base, d: T, parts: [T, '×', '?', '=', p], answer: n, full: `${T} × ${n} = ${p}`,
      instr: 'What number is missing?' };
    case 'div': return { ...base, d: T, parts: [p, '÷', T, '=', '?'], answer: n, full: `${p} ÷ ${T} = ${n}`,
      instr: `Share ${p} into ${T} equal groups. How many in each group?` };
    case 'div2': return { ...base, d: n, parts: [p, '÷', n, '=', '?'], answer: T, full: `${p} ÷ ${n} = ${T}`,
      instr: `Share ${p} into ${n} equal group${n === 1 ? '' : 's'}. How many in each group?` };
    case 'family': return { ...base, d: n, parts: [p, '÷', n, '=', '?'], answer: T, full: `${p} ÷ ${n} = ${T}`,
      lead: `We know: ${T} × ${n} = ${p}`, instr: 'Use the fact family to help you.' };
    default: return { ...base, type: 'mul', a: T, b: n, parts: [T, '×', n, '=', '?'], answer: p, full: `${T} × ${n} = ${p}`,
      instr: `${T} groups of ${n}. How many in all?` };
  }
}
const isMul = q => q.type === 'mul' || q.type === 'turn';

function strategyHint(T, n) {
  if (n === 1) return 'Any number times 1 stays the same.';
  if (n === 10) return `Times 10: put a 0 at the end of ${T}.`;
  if (n === 2) return `Times 2 means double: ${T} + ${T}.`;
  if (n === 5) return `Think: ${T} × 10 = ${T * 10}. Half of that is the answer.`;
  switch (T) {
    case 4: return `Think: 2 × ${n} = ${2 * n}. Double it.`;
    case 6: return `Think: 5 × ${n} = ${5 * n}. Add one more group of ${n}.`;
    case 7: return `Think: 5 × ${n} = ${5 * n} and 2 × ${n} = ${2 * n}. Put them together.`;
    case 8: return `Think: 4 × ${n} = ${4 * n}. Double it.`;
    case 9: return `Think: 10 × ${n} = ${10 * n}. Take away one group of ${n}.`;
  }
  return '';
}
function countBy(d, upTo) { const a = range(1, upTo).map(i => i * d); return a.join(', '); }

function hintFor(q) {
  if (q.type === 'mul') return strategyHint(q.T, q.n);
  if (q.type === 'turn') return `${q.n} × ${q.T} is the same as ${q.T} × ${q.n}. ${strategyHint(q.T, q.n)}`;
  if (q.type === 'family') return `${q.T}, ${q.n} and ${q.p} are a family. Look at the fact we know.`;
  if (q.d === 1) return 'Sharing into 1 group: the group gets everything.';
  return `Think: ${q.d} × ? = ${q.p}. Count by ${q.d}s: ${countBy(q.d, 3)}…`;
}

/* Kind words that point to the mistake, so the child can fix it. */
function diagnose(q, x) {
  if (isMul(q)) {
    const { a, b, p } = q;
    if (x === a + b && a + b !== p) return `That is ${a} + ${b}. We need ${a} groups of ${b}.`;
    if (a > 1 && x === p - b) return `So close! That is ${a - 1} × ${b}. Add one more group of ${b}.`;
    if (x === p + b) return `So close! That is ${a + 1} × ${b}. Take away one group of ${b}.`;
    if (b > 1 && x === p - a) return `So close! That is ${a} × ${b - 1}. Add ${a} more.`;
    if (x === p + a) return `So close! That is ${a} × ${b + 1}. Take away ${a}.`;
    return x < p ? 'Your number is too small. Try a bigger number.' : 'Your number is too big. Try a smaller number.';
  }
  const { d, p } = q;
  if (x > 20 || x === 0) return x === 0 ? 'Each group gets more than 0. Try a bigger number.' : 'That number is too big. Try a smaller number.';
  return `Let's check: ${d} × ${x} = ${d * x}. We need ${p}. ${d * x < p ? 'Try a bigger number.' : 'Try a smaller number.'}`;
}

function stepsFor(q) {
  if (isMul(q)) {
    const lines = q.type === 'turn' ? [`${q.n} × ${q.T} is the same as ${q.T} × ${q.n}.`] : [];
    return lines.concat(Vis.trick(q.T, q.n).steps, [`So ${q.full}.`]);
  }
  const ans = q.p / q.d;
  return [`Think: ${q.d} × ? = ${q.p}`, `Count by ${q.d}s: ${countBy(q.d, ans)}`, `${q.d} × ${ans} = ${q.p}`, `So ${q.full}.`];
}

function pictureFor(q) {
  const box = el(`<div class="pic"></div>`);
  if (isMul(q)) {
    const t = Vis.trick(q.T, q.n);
    box.appendChild(el(`<p class="pic-cap"><b>${q.T} groups of ${q.n}</b>. Each row is one group.</p>`));
    box.appendChild(Vis.array(t.parts, q.n, { top: t.top }));
    if (q.type === 'turn') box.appendChild(el(`<p class="small">Turn-around facts have the same answer: ${q.n} × ${q.T} = ${q.T} × ${q.n}.</p>`));
  } else {
    const per = q.p / q.d;
    box.appendChild(el(`<p class="pic-cap"><b>${q.p}</b> shared into <b>${q.d}</b> equal group${q.d === 1 ? '' : 's'}. Each row is one group. Count the dots in one row.</p>`));
    box.appendChild(Vis.array([{ rows: q.d, cls: 'a', label: '' }], per, {}));
  }
  return box;
}

/* ---------- adaptive choice ---------- */
const LVL_WEIGHT = [6, 4, 3, 2, 1];
/* Pick the question type for one skill of one fact. */
function typeFor(p) {
  const lvl = Store.peek(p.T, p.n, p.s) ? Store.peek(p.T, p.n, p.s).lvl : 0;
  if (p.s === 'miss') return 'missing';
  if (p.s === 'div') return lvl < 2 ? pick(['family', 'family', 'div']) : pick(['div', 'div2']);
  return lvl === 0 ? 'mul' : pick(['mul', 'turn']);
}
/* Division and missing-number questions start once the child has shown the multiplication fact. */
function skillOpen(p) {
  if (p.s === 'mul') return true;
  const m = Store.peek(p.T, p.n, 'mul'), own = Store.peek(p.T, p.n, p.s);
  return (m && m.lvl >= 1) || (own && own.seen > 0);
}
function weightedPick(c) {
  const w = c.map(p => LVL_WEIGHT[Store.peek(p.T, p.n, p.s) ? Store.peek(p.T, p.n, p.s).lvl : 0]);
  let r = Math.random() * w.reduce((s, v) => s + v, 0);
  for (let i = 0; i < c.length; i++) { r -= w[i]; if (r < 0) return c[i]; }
  return c[c.length - 1];
}
/* pairs = [{T, n, s}]. Saved review items that are due come first (also from earlier days).
   Otherwise weaker skills come up more often. The same fact never comes twice in a row.
   opts.focus = the "My tricky facts" list: each one is asked once in the round, even if its review time has not come. */
function makePicker(pairs, opts = {}) {
  const recent = [], asked = new Set();
  const fk = p => p.T + 'x' + p.n, sk = p => fk(p) + p.s;
  const focus = (opts.focus || []).map(sk);
  const inPool = r => pairs.some(p => sk(p) === sk(r));
  const entry = p => Store.d.review.find(r => sk(r) === sk(p));
  const open = p => focus.includes(sk(p)) || skillOpen(p);
  const facts = new Set(pairs.map(fk)).size;
  let reviews = 0;
  return () => {
    Store.d.qCount++;
    const now = Store.d.qCount;
    /* at most 6 review questions in one normal round, so there is always room for new practice */
    let p = (focus.length || reviews < 6) ? Store.d.review
      .filter(r => r.due <= now && inPool(r) && !recent.includes(fk(r)))
      .sort((a, b) => a.due - b.due)[0] : null;
    if (!p) {
      p = pairs.find(x => focus.includes(sk(x)) && !asked.has(sk(x)) && !recent.includes(fk(x)));
      const r = p && entry(p);
      if (r && r.due > now) r.due = now;   /* the child chose to review: it counts now */
    }
    const review = !!(p && entry(p));
    if (review) reviews++;
    if (!p) {
      /* a fact waiting for its review time is kept back, so the spacing works */
      const waiting = x => { const r = entry(x); return !!r && r.due > now; };
      let c = pairs.filter(x => open(x) && !recent.includes(fk(x)) && !waiting(x));
      if (!c.length) c = pairs.filter(x => open(x) && !waiting(x));
      if (!c.length) c = pairs;
      p = weightedPick(c);
    }
    asked.add(sk(p));
    recent.push(fk(p));
    while (recent.length > Math.min(2, facts - 1)) recent.shift();
    Store.save();
    const q = makeQuestion(p.T, p.n, typeFor(p));
    q.review = review;
    return q;
  };
}

/* ---------- the quiz screen (used by Practice and Adventure). No timers. ---------- */
function runQuiz(root, cfg) {
  let i = cfg.start || 0, q, tries, input, solved, helped;
  const results = [];
  const ui = el(`<section class="quiz">
    <div class="qtop"><span class="chip q-num"></span>
      ${Voice.ok ? '<button type="button" class="btn ghost sm speak">🔈 Read to me</button>' : ''}</div>
    <div class="card qcard">
      <p class="q-instr"></p>
      <p class="q-lead math"></p>
      <div class="eq math" aria-live="polite"></div>
      <div class="fb" aria-live="polite"></div>
      <div class="helpbar">
        <button type="button" class="btn ghost sm hint-btn">💡 Need a hint?</button>
        <button type="button" class="btn ghost sm pic-btn">🖼️ Show me a picture</button>
      </div>
      <div class="help-area"></div>
    </div>
    <div class="pad" role="group" aria-label="Number buttons">
      ${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(k => `<button type="button" class="key" data-k="${k}">${k}</button>`).join('')}
      <button type="button" class="key del" data-k="del" aria-label="Delete">⌫</button>
      <button type="button" class="key" data-k="0">0</button>
      <button type="button" class="key ok" data-k="ok">Check ✓</button>
    </div>
    <button type="button" class="btn primary big wide next hidden"></button>
  </section>`);
  root.appendChild(ui);
  const R = s => ui.querySelector(s);

  function renderEq() {
    R('.eq').innerHTML = q.parts.map(t => t === '?'
      ? `<span class="box${input ? ' filled' : ''}" aria-label="your answer">${input || '?'}</span>`
      : (typeof t === 'number' ? `<span class="num">${t}</span>` : `<span class="op">${t}</span>`)).join('');
  }
  function say(html, kind) { R('.fb').className = 'fb ' + (kind || ''); R('.fb').innerHTML = html; }
  function addHelp(cls, node) {
    if (solved) return;
    helped = true;
    const area = R('.help-area');
    if (area.querySelector('.' + cls)) return;
    node.classList.add(cls); area.appendChild(node);
  }
  const showHint = () => addHelp('h-hint', el(`<div class="hint">💡 ${hintFor(q)}</div>`));
  const showPic = () => addHelp('h-pic', pictureFor(q));
  const showSteps = () => addHelp('h-steps', el(`<div class="steps"><b>Step by step:</b><ol>${stepsFor(q).map(s => `<li class="math">${s}</li>`).join('')}</ol><p>Now type the answer.</p></div>`));

  function load() {
    q = cfg.getQuestion(i); tries = 0; input = ''; solved = false; helped = false;
    R('.q-num').textContent = `Question ${i + 1} of ${cfg.total}` + (q.review ? ' · 🔁 Review' : '');
    R('.q-instr').textContent = q.instr;
    R('.q-lead').textContent = q.lead || '';
    R('.q-lead').hidden = !q.lead;
    R('.help-area').innerHTML = '';
    R('.helpbar').hidden = false;
    R('.pad').hidden = false;
    R('.next').classList.add('hidden');
    say('', '');
    renderEq();
  }
  function press(k) {
    if (solved) return;
    if (k === 'ok') return check();
    if (k === 'del') input = input.slice(0, -1);
    else if (input.length < 3) input = (input === '0' ? '' : input) + k;
    Sound.tap(); renderEq();
  }
  function check() {
    if (!input) { say('Type your answer first. Use the number buttons.', 'info'); return; }
    const x = parseInt(input, 10);
    if (x === q.answer) {
      const outcome = tries > 0 ? 'missed' : helped ? 'helped' : 'independent';
      solved = true;
      Store.record(q, outcome);
      results.push({ q, outcome });
      const extra = cfg.onCorrect ? cfg.onCorrect(q, outcome, i) : '';
      const note = outcome === 'missed' ? MSG.learned : outcome === 'helped' ? MSG.helped : '';
      say(`<b>${pick(MSG.correct)}</b> <span class="math">${q.full}</span>${note ? `<br>${note}` : ''}${extra ? `<br>${extra}` : ''}`, 'ok');
      Sound.ok();
      R('.pad').hidden = true; R('.helpbar').hidden = true;
      const nb = R('.next');
      nb.textContent = i + 1 >= cfg.total ? (cfg.finishLabel || 'Finish ⭐') : 'Next ➜';
      nb.classList.remove('hidden'); nb.focus();
      return;
    }
    tries++;
    Sound.soft();
    input = ''; renderEq();
    if (tries === 1) say(`<b>${MSG.tryAgain}</b><br>${diagnose(q, x)}<br>${MSG.needHint} Tap 💡.`, 'try');
    else if (tries === 2) { say(`<b>${MSG.another}</b><br>${diagnose(q, x)}<br>Look at the hint and the picture.`, 'try'); showHint(); showPic(); }
    else { say(`<b>${MSG.together}</b>`, 'try'); showHint(); showPic(); showSteps(); }
  }

  R('.pad').addEventListener('click', e => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
  R('.hint-btn').addEventListener('click', () => { Sound.tap(); showHint(); });
  R('.pic-btn').addEventListener('click', () => { Sound.tap(); showPic(); });
  if (R('.speak')) R('.speak').addEventListener('click', () => {
    const eqText = q.parts.map(t => t === '?' ? 'what number' : t).join(' ');
    Voice.speak([q.lead, q.instr, eqText, R('.fb').textContent, ...$$('.help-area .hint, .help-area .steps li', ui).map(n => n.textContent)].filter(Boolean).join('. '));
  });
  R('.next').addEventListener('click', () => {
    Voice.stop();
    i++;
    if (i >= cfg.total) { keyHandler = null; cfg.onFinish(results); return; }
    load();
    ui.scrollIntoView({ block: 'start', behavior: 'smooth' });
  });
  keyHandler = e => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (solved) { if (e.key === 'Enter' && document.activeElement !== R('.next')) { e.preventDefault(); R('.next').click(); } return; }
    if (/^[0-9]$/.test(e.key)) { e.preventDefault(); press(e.key); }
    else if (e.key === 'Backspace') { e.preventDefault(); press('del'); }
    else if (e.key === 'Enter' && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) { e.preventDefault(); press('ok'); }
  };
  load();
  return { results };
}
