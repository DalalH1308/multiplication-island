/* ===== screens.js : Main menu, Learn with Pictures, Practice, Play Adventure, My Progress ===== */
'use strict';

const back = (href, text) => `<div class="backbar"><a class="back" href="${href}">← ${text}</a></div>`;
const tableStyle = T => { const l = locForTable(T); return `--c:${l.color};--cs:${l.soft}`; };
const ADV_PLAN = ['mul', 'mul', 'turn', 'missing', 'mul', 'div', 'family', 'div2'];
const speakBtn = () => (Voice.ok ? '<button type="button" class="btn ghost sm speak">🔈 Read to me</button>' : '');

const Screens = {
  /* ---------- main menu ---------- */
  menu(app) {
    const items = [
      ['#/learn', '🎨', 'Learn with Pictures', 'See how times tables work.', '#ff8a3d'],
      ['#/practice', '✏️', 'Practice', 'Practice at your own pace.', '#2bb3a3'],
      ['#/adventure', '🗺️', 'Play Adventure', 'Build the island with your answers.', '#7b6cf6'],
      ['#/progress', '⭐', 'My Progress', 'See your stars and facts.', '#f0a500']
    ];
    app.appendChild(el(`<div>
      <div class="hero">
        ${Vis.scene('bridge', 8, true)}
        <h1>Multiplication Island Adventure</h1>
        <p>Learn the 4s, 6s, 7s, 8s and 9s. Take your time. Mistakes help us learn!</p>
      </div>
      <nav class="menu">${items.map(([h, ic, t, s, c]) => `
        <a class="menu-btn" href="${h}" style="--c:${c}"><span class="menu-ic" aria-hidden="true">${ic}</span>
        <span><b>${t}</b><small>${s}</small></span></a>`).join('')}
      </nav></div>`));
  },

  /* ---------- Learn with Pictures ---------- */
  learnIndex(app) {
    app.appendChild(el(`<div>${back('#/', 'Menu')}
      <h1 class="scr-title">🎨 Learn with Pictures</h1>
      <p class="scr-sub">Pick a times table. Go step by step.</p>
      <div class="grid">${TABLES.map(T => { const l = locForTable(T); return `
        <a class="tcard" href="#/learn/${T}" style="${tableStyle(T)}">
          <span class="tnum">×${T}</span><span><b>Times Table ${T}</b><small>${l.name}</small></span>
          ${Store.d.learned[T] ? '<span class="tdone" aria-label="explored">⭐</span>' : ''}</a>`; }).join('')}
      </div></div>`));
  },

  /* Five short steps. The number stays the same while moving between steps.
     Step buttons and "Back" let the child return to any earlier step. */
  learnTable(app, T, start) {
    const loc = locForTable(T), tr = TRICKS[T];
    const STEPS = ['See the groups', 'Use the trick', 'Turn it around', `Count by ${T}s`, 'The fact family'];
    let n = start || 6, step = 0;
    const view = el(`<div style="${tableStyle(T)}">${back('#/learn', 'All tables')}
      <h1 class="scr-title">The ${T}s <span class="loc-chip">${loc.name}</span></h1>
      <div class="card">
        <h2 class="h2">Pick a number</h2>
        <div class="npick" role="group" aria-label="Pick a number">${range(1, 10).map(i => `<button type="button" class="nbtn" data-n="${i}">${i}</button>`).join('')}</div>
      </div>
      <ol class="stepper" aria-label="Steps">${STEPS.map((s, i) => `<li><button type="button" class="step-dot" data-step="${i}"><span class="sd-n">${i + 1}</span><span class="sd-t">${s}</span></button></li>`).join('')}</ol>
      <div class="card step-card">
        <div class="step-head"><span class="chip step-num"></span>${speakBtn()}</div>
        <h2 class="h2 step-title"></h2>
        <div class="step-body"></div>
        <div class="step-nav">
          <button type="button" class="btn ghost big prev">← Back</button>
          <button type="button" class="btn primary big fwd">Next ➜</button>
        </div>
      </div></div>`);
    app.appendChild(view);
    const V = s => view.querySelector(s);

    const say = t => `<p class="rd">${t}</p>`;
    function body() {
      const p = T * n, b = el('<div></div>');
      const eq = (a, c) => `<div class="big-eq math rd">${a} × ${c} = ${p}</div><p class="words rd">${a} group${a === 1 ? '' : 's'} of ${c}</p>`;
      if (step === 0) {
        b.innerHTML = eq(T, n) + say('Each row is one group.') + say(`There are ${T} rows. Each row has ${n} dot${n === 1 ? '' : 's'}.`);
        b.appendChild(Vis.array([{ rows: T, cls: 'a', label: '' }], n, { countable: true }));
      } else if (step === 1) {
        const t = Vis.trick(T, n);
        b.innerHTML = eq(T, n) + `<p class="rd"><b>${tr.title}</b></p>` + tr.text.split('. ').map(s => say(s.replace(/\.?$/, '.'))).join('');
        b.appendChild(Vis.array(t.parts, n, { top: t.top, countable: true }));
        b.appendChild(el(`<div class="steps"><ol>${t.steps.map(s => `<li class="math rd">${s}</li>`).join('')}</ol></div>`));
      } else if (step === 2) {
        b.innerHTML = eq(n, T) + say('We turned the picture.') + say(`Now there are ${n} row${n === 1 ? '' : 's'} of ${T}.`);
        b.appendChild(Vis.array([{ rows: n, cls: 'a', label: '' }], T, { countable: true }));
        b.appendChild(el(`<p class="note rd">🔄 <span class="math">${n} × ${T}</span> and <span class="math">${T} × ${n}</span> have the same answer: <b>${p}</b>.</p>`));
      } else if (step === 3) {
        b.innerHTML = say(`Count by ${T}s. Tap a number to jump there.`);
        b.appendChild(Vis.skipStrip(T, n, i => { n = i; draw(false); }));
        b.appendChild(el(`<p class="skip-cap math rd">${n} jump${n === 1 ? '' : 's'} of ${T} = ${p}</p>`));
      } else {
        b.innerHTML = say('These three numbers are a family.') + say('Multiplication and division are a team!');
        b.appendChild(Vis.family(T, n));
        b.appendChild(el(`<p class="share rd">${p} ÷ ${T} = ${n} means: share ${p} into ${T} equal groups. Each group gets ${n}.</p>`));
        b.appendChild(el(`<p class="small rd">${tr.fun}</p>`));
        b.appendChild(el(`<div class="row-btns">
          <a class="btn primary big" href="#/practice/${T}">✏️ Practice the ${T}s</a>
          <a class="btn ghost big" href="#/adventure">🗺️ Play Adventure</a></div>`));
      }
      return b;
    }
    function draw(moveTo) {
      $$('.nbtn', view).forEach(b => { const on = +b.dataset.n === n; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $$('.step-dot', view).forEach(b => {
        const i = +b.dataset.step;
        b.classList.toggle('on', i === step); b.classList.toggle('seen', i < step);
        if (i === step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      V('.step-num').textContent = `Step ${step + 1} of ${STEPS.length}`;
      V('.step-title').textContent = STEPS[step];
      const sb = V('.step-body'); sb.innerHTML = ''; sb.appendChild(body());
      V('.prev').hidden = step === 0;
      V('.fwd').hidden = step === STEPS.length - 1;
      if (moveTo) V('.step-card').scrollIntoView({ block: 'start', behavior: 'smooth' });
      explored(n);
    }
    function explored(k) {
      const ex = Array.isArray(Store.d.explored[T]) ? Store.d.explored[T] : (Store.d.explored[T] = []);
      if (!ex.includes(k)) ex.push(k);
      if (!Store.d.learned[T] && ex.length >= 5) {
        Store.d.learned[T] = true; Store.addStars(1); Sound.star();
        toast('You earned a star! ⭐ You explored the ' + T + 's.');
      }
      Store.save();
    }
    view.addEventListener('click', e => {
      const nb = e.target.closest('.nbtn'), sd = e.target.closest('.step-dot');
      if (nb) { Sound.tap(); n = +nb.dataset.n; draw(false); }
      if (sd) { Sound.tap(); step = +sd.dataset.step; draw(true); }
      if (e.target.closest('.prev') && step > 0) { Sound.tap(); step--; draw(true); }
      if (e.target.closest('.fwd') && step < STEPS.length - 1) { Sound.tap(); step++; draw(true); }
      if (e.target.closest('.speak')) Voice.speak([STEPS[step], ...$$('.step-body .rd', view).map(x => x.textContent)].join('. '));
    });
    draw(false);
  },

  /* ---------- Practice ---------- */
  practiceIndex(app) {
    const tricky = trickyPairs();
    app.appendChild(el(`<div>${back('#/', 'Menu')}
      <h1 class="scr-title">✏️ Practice</h1>
      <p class="scr-sub">10 questions. No clock. Take your time!</p>
      <div class="grid">
        ${tricky.length ? `<a class="tcard" href="#/practice/tricky" style="--c:#e8487e;--cs:#ffe6ee"><span class="tnum">🎯</span><span><b>My tricky facts</b><small>${tricky.length} fact${tricky.length === 1 ? '' : 's'} to practice again</small></span></a>` : ''}
        ${TABLES.map(T => `<a class="tcard" href="#/practice/${T}" style="${tableStyle(T)}">
          <span class="tnum">×${T}</span><span><b>Times Table ${T}</b><small>I know: × ${knownCount(T, 'mul')}/10 · ÷ ${knownCount(T, 'div')}/10</small></span></a>`).join('')}
        <a class="tcard mix" href="#/practice/mix" style="--c:#2bb3a3;--cs:#e3f7f4"><span class="tnum">🎲</span><span><b>Mix them all</b><small>4s, 6s, 7s, 8s and 9s</small></span></a>
      </div></div>`));
  },

  practiceRun(app, which) {
    let pairs, title, focus = [];
    const allSkills = list => list.flatMap(f => SKILLS.map(s => ({ ...f, s })));
    const tablePairs = T => allSkills(range(1, 10).map(n => ({ T, n })));
    if (which === 'mix') { pairs = TABLES.flatMap(tablePairs); title = 'Mix them all'; }
    else if (which === 'tricky') {
      focus = trickyPairs(); title = 'My tricky facts';
      if (!focus.length) { location.hash = '#/practice'; return; }
      /* every tricky fact is asked; the rest of the round uses other facts from the same tables */
      pairs = [...new Set(focus.map(p => p.T))].flatMap(tablePairs);
    } else { pairs = tablePairs(+which); title = `Times Table ${which}`; }
    const T0 = TABLES.includes(+which) ? +which : null;
    const view = el(`<div${T0 ? ` style="${tableStyle(T0)}"` : ''}>${back('#/practice', 'Practice')}
      <h1 class="scr-title">✏️ ${title}</h1></div>`);
    app.appendChild(view);
    const next = makePicker(pairs, { focus });
    runQuiz(view, {
      total: 10,
      getQuestion: () => next(),
      onFinish: res => {
        Store.d.rounds++; Store.addStars(1); Sound.star();
        const known = res.filter(r => r.outcome === 'independent'), again = res.filter(r => r.outcome !== 'independent');
        const uniq = list => [...new Set(list.map(r => r.q.full))];
        view.innerHTML = '';
        view.appendChild(el(`<div>
          <div class="card celebrate"><div class="big-ic">⭐</div>
            <h1>Round complete!</h1><p class="lead">You earned a star!</p>
            <p>You answered 10 questions.</p></div>
          ${known.length ? `<div class="card"><h2 class="h2">✅ You knew these on your own</h2><div class="chips">${uniq(known).map(f => `<span class="fchip ok math">${f}</span>`).join('')}</div></div>` : ''}
          ${again.length ? `<div class="card"><h2 class="h2">💪 You learned from these</h2><p class="small">Say them out loud. We will practice them again soon.</p>
            <div class="chips">${uniq(again).map(f => `<span class="fchip math">${f}</span>`).join('')}</div></div>` : ''}
          <div class="row-btns"><button type="button" class="btn primary big again">🔁 Practice again</button><a class="btn ghost big" href="#/">🏠 Menu</a></div>
        </div>`));
        $('.again', view).addEventListener('click', () => render());
        window.scrollTo(0, 0);
      }
    });
  },

  /* ---------- Play Adventure ---------- */
  adventureMap(app) {
    const done = LOCATIONS.filter(l => Store.areaDone(l.id)).length;
    app.appendChild(el(`<div>${back('#/', 'Menu')}
      <h1 class="scr-title">🗺️ Play Adventure</h1>
      <p class="scr-sub">Answer questions to build each place. Finish a place to unlock the next one. (${done} of 5 done)</p>
      <ol class="map">${LOCATIONS.map((l, i) => {
        const open = Store.unlocked(i), fin = Store.areaDone(l.id), run = advRun(l.id);
        const shown = run ? run.built : fin ? 8 : 0;
        const status = run && run.built > 0 ? `▶ Continue (${run.built} of 8 built)` : fin ? '✅ Done! Play again' : open ? '▶ Start' : `🔒 Finish ${LOCATIONS[i - 1].name} first`;
        const inner = `<div class="map-pic${open ? '' : ' locked'}">${Vis.scene(l.id, shown, fin && !run)}${open ? '' : '<span class="lock" aria-hidden="true">🔒</span>'}</div>
          <div class="map-txt"><b>${i + 1}. ${l.name}</b><small>Times Table ${l.table}</small><span class="status">${status}</span></div>`;
        return `<li class="map-node${i % 2 ? ' right' : ''}" style="--c:${l.color};--cs:${l.soft}">
          ${open ? `<a href="#/adventure/${l.id}" class="map-card">${inner}</a>` : `<div class="map-card" aria-disabled="true">${inner}</div>`}</li>`;
      }).join('')}</ol></div>`));
  },

  /* Every built piece is saved at once. Leaving and coming back continues from the same place.
     Stars are given only once, when the place is finished for the first time. */
  adventurePlay(app, id) {
    const idx = LOCATIONS.findIndex(l => l.id === id);
    if (idx < 0 || !Store.unlocked(idx)) { location.hash = '#/adventure'; return; }
    const loc = LOCATIONS[idx], T = loc.table;
    let run = advRun(id);
    if (!run) { run = Store.d.adv[id] = { ns: shuffle(range(2, 10)).slice(0, 8), built: 0 }; Store.save(); }
    const view = el(`<div style="--c:${loc.color};--cs:${loc.soft}">${back('#/adventure', 'Map')}
      <h1 class="scr-title">${loc.name} <span class="loc-chip">Times Table ${T}</span></h1>
      <p class="scr-sub">${loc.goal} Every answer builds a part.</p>
      ${run.built > 0 && run.built < 8 ? `<p class="note">👋 Welcome back! You built ${run.built} of 8 parts. Let's keep going.</p>` : ''}
      <div class="card scene-card"><div class="scene-slot"></div>
        <div class="build-bar" aria-hidden="true">${range(1, 8).map(() => '<span></span>').join('')}</div></div></div>`);
    app.appendChild(view);
    const drawScene = fresh => {
      $('.scene-slot', view).innerHTML = Vis.scene(id, run.built, run.built >= 8, fresh ? run.built - 1 : -1);
      $$('.build-bar span', view).forEach((s, i) => s.classList.toggle('on', i < run.built));
    };
    function finish() {
      const first = !Store.areaDone(id);
      Store.d.areas[id] = { done: true };
      delete Store.d.adv[id];
      if (first) Store.d.stars += 3;
      Store.save(); updateStarCount(); Sound.star();
      const nextLoc = LOCATIONS[idx + 1];
      view.innerHTML = '';
      view.appendChild(el(`<div>
        <div class="card celebrate">${Vis.scene(id, 8, true)}
          <h1>${first ? loc.reward : 'You built it again!'}</h1>
          <p class="lead">${first ? 'You earned 3 stars! ⭐⭐⭐' : 'Great practice! You already have the stars for this place.'}</p>
          ${nextLoc && first ? `<p class="unlock">🔓 New area unlocked: <b>${nextLoc.name}</b>!</p>` : ''}
          ${!nextLoc && first ? '<p class="unlock">🏆 You finished the whole island!</p>' : ''}
        </div>
        <div class="row-btns">
          ${nextLoc ? `<a class="btn primary big" href="#/adventure/${nextLoc.id}">Go to ${nextLoc.name} ➜</a>` : '<a class="btn primary big" href="#/progress">⭐ See my progress</a>'}
          <a class="btn ghost big" href="#/adventure">🗺️ Back to the map</a>
        </div></div>`));
      window.scrollTo(0, 0);
    }
    drawScene(false);
    if (run.built >= 8) { finish(); return; }
    runQuiz(view, {
      total: 8,
      start: run.built,
      finishLabel: 'See what you built! 🎉',
      getQuestion: i => makeQuestion(T, run.ns[i], ADV_PLAN[i]),
      onCorrect: (q, outcome, i) => { run.built = i + 1; Store.save(); drawScene(true); Sound.build(); return `🔨 ${loc.piece}`; },
      onFinish: finish
    });
  },

  /* ---------- My Progress ---------- */
  progress(app) {
    const areas = LOCATIONS.filter(l => Store.areaDone(l.id)).length;
    const tricky = trickyPairs();
    let skill = 'mul';
    const total = s => TABLES.reduce((a, T) => a + knownCount(T, s), 0);
    const view = el(`<div>${back('#/', 'Menu')}
      <h1 class="scr-title">⭐ My Progress</h1>
      <div class="stats">
        <div class="stat"><span class="stat-n">${Store.d.stars}</span><span>stars</span></div>
        <div class="stat"><span class="stat-n">${areas} / 5</span><span>places built</span></div>
        <div class="stat"><span class="stat-n">${tricky.length}</span><span>facts to review</span></div>
      </div>
      <div class="card"><h2 class="h2">🏝️ My island</h2>
        <div class="mini-map">${LOCATIONS.map((l, i) => { const d = Store.areaDone(l.id), r = advRun(l.id); return `<div class="mini${d || r ? ' got' : ''}">${Vis.scene(l.id, r ? r.built : d ? 8 : 0, d && !r)}<small>${l.name}${d ? ' ✅' : r && r.built ? ` (${r.built}/8)` : Store.unlocked(i) ? '' : ' 🔒'}</small></div>`; }).join('')}</div></div>
      <div class="card"><h2 class="h2">📋 My facts</h2>
        <div class="tabs" role="group" aria-label="Kind of question">${SKILLS.map(s => `<button type="button" class="tab" data-s="${s}">${SKILL_NAME[s]}<small>${total(s)} / 50 known</small></button>`).join('')}</div>
        <p class="small">"I know it!" means: right many times, on your own, with no helpers. Tap a fact to see its picture.</p>
        <div class="legend">${['new', 'learning', 'almost', 'mastered'].map(s => `<span class="lg"><i class="sw st-${s}"></i>${STATUS_LABEL[s]}</span>`).join('')}</div>
        <div class="fgrid"></div>
      </div>
      ${tricky.length ? `<div class="card"><h2 class="h2">🎯 Facts to practice again</h2>
        <div class="chips">${tricky.slice(0, 8).map(p => `<span class="fchip math">${pairLabel(p)}</span>`).join('')}</div>
        <a class="btn primary big wide" href="#/practice/tricky">Practice my tricky facts</a></div>` : ''}
      <div class="reset-zone"><button type="button" class="btn ghost sm reset">↺ Start over</button></div>
    </div>`);
    app.appendChild(view);
    function grid() {
      $$('.tab', view).forEach(b => { const on = b.dataset.s === skill; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
      $('.fgrid', view).innerHTML = TABLES.map(T => `<div class="frow" style="${tableStyle(T)}"><span class="frow-t">×${T}</span><div class="fcells">
        ${range(1, 10).map(n => { const s = skillStatus(T, n, skill); return `<a class="fcell st-${s}" href="#/learn/${T}/${n}" aria-label="${pairLabel({ T, n, s: skill })}: ${STATUS_LABEL[s]}">${T}×${n}</a>`; }).join('')}
        </div></div>`).join('');
    }
    view.addEventListener('click', e => { const t = e.target.closest('.tab'); if (t) { Sound.tap(); skill = t.dataset.s; grid(); } });
    grid();
    $('.reset', view).addEventListener('click', async () => {
      const yes = await confirmBox('Start over?', 'All stars and progress on this device will be cleared.', 'Yes, start over', 'No, keep it');
      if (yes) { Store.reset(); render(); }
    });
  }
};

/* A saved, unfinished adventure (checked so that broken data can never crash the game). */
function advRun(id) {
  const r = Store.d.adv[id];
  const ok = r && Array.isArray(r.ns) && r.ns.length === 8 && r.ns.every(x => Number.isInteger(x) && x >= 2 && x <= 10)
    && Number.isInteger(r.built) && r.built >= 0 && r.built <= 8;
  if (!ok) { if (r) delete Store.d.adv[id]; return null; }
  return r;
}
function knownCount(T, s) { return range(1, 10).filter(n => skillStatus(T, n, s) === 'mastered').length; }
function pairLabel(p) {
  const v = p.T * p.n;
  return p.s === 'div' ? `${v} ÷ ${p.T}` : p.s === 'miss' ? `${p.T} × ? = ${v}` : `${p.T} × ${p.n}`;
}
/* Saved review items first (oldest first), then other skills the child found hard. */
function trickyPairs() {
  const seen = new Set(), out = [];
  const add = (T, n, s) => { const k = T + 'x' + n + s; if (!seen.has(k)) { seen.add(k); out.push({ T, n, s }); } };
  Store.d.review.slice().sort((a, b) => a.due - b.due).forEach(r => add(r.T, r.n, r.s));
  TABLES.flatMap(T => range(1, 10).flatMap(n => SKILLS.map(s => ({ T, n, s, r: Store.peek(T, n, s) }))))
    .filter(x => x.r && x.r.wrong > 0 && x.r.lvl < 4)
    .sort((a, b) => a.r.lvl - b.r.lvl || b.r.wrong - a.r.wrong)
    .forEach(x => add(x.T, x.n, x.s));
  return out.slice(0, 10);
}
