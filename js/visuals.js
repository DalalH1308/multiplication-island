/* ===== visuals.js : dot pictures, count-by strip, fact family, island scenes ===== */
'use strict';

const Vis = {
  /* How the trick splits "T groups of n" into parts. */
  trick(T, n) {
    const m = k => k * n;
    switch (T) {
      case 4: return { parts: [{ rows: 2, cls: 'a', label: `2 × ${n} = ${m(2)}` }, { rows: 2, cls: 'b', label: `2 × ${n} = ${m(2)}` }],
        steps: [`2 × ${n} = ${m(2)}`, `Double it: ${m(2)} + ${m(2)} = ${m(4)}`] };
      case 6: return { parts: [{ rows: 5, cls: 'a', label: `5 × ${n} = ${m(5)}` }, { rows: 1, cls: 'b', label: `1 × ${n} = ${n}` }],
        steps: [`5 × ${n} = ${m(5)}`, `Add one more group: ${m(5)} + ${n} = ${m(6)}`] };
      case 7: return { parts: [{ rows: 5, cls: 'a', label: `5 × ${n} = ${m(5)}` }, { rows: 2, cls: 'b', label: `2 × ${n} = ${m(2)}` }],
        steps: [`5 × ${n} = ${m(5)}`, `2 × ${n} = ${m(2)}`, `Put them together: ${m(5)} + ${m(2)} = ${m(7)}`] };
      case 8: return { parts: [{ rows: 4, cls: 'a', label: `4 × ${n} = ${m(4)}` }, { rows: 4, cls: 'b', label: `4 × ${n} = ${m(4)}` }],
        steps: [`4 × ${n} = ${m(4)}`, `Double it: ${m(4)} + ${m(4)} = ${m(8)}`] };
      case 9: return { top: `10 × ${n} = ${m(10)}`,
        parts: [{ rows: 9, cls: 'a', label: '' }, { rows: 1, cls: 'x', label: `Take away ${n}` }],
        steps: [`10 × ${n} = ${m(10)}`, `Take away one group: ${m(10)} − ${n} = ${m(9)}`] };
    }
    return { parts: [{ rows: T, cls: 'a', label: '' }], steps: [] };
  },

  /* A dot picture: each row is one group. parts = [{rows, cls, label}] */
  array(parts, cols, opts = {}) {
    const total = parts.reduce((s, p) => s + p.rows, 0);
    const d = cols <= 4 ? 24 : cols <= 6 ? 21 : cols <= 8 ? 18 : 16;
    const dd = total > 8 ? Math.min(d, 17) : d;
    const wrap = el(`<div class="arr-wrap"></div>`);
    if (opts.top) wrap.appendChild(el(`<div class="arr-top">${opts.top}</div>`));
    const box = el(`<div class="arr" style="--d:${dd}px"></div>`);
    const countable = !!opts.countable;
    let readout = null;
    const update = () => {
      const k = $$('.arr-row.on', box).length;
      const all = $$('.arr-row[role="button"]', box).length;
      readout.textContent = k === 0 ? 'Tap a row to count the groups.'
        : `You counted ${k} group${k === 1 ? '' : 's'} of ${cols} = ${k * cols}` + (k === all ? '  🎉 All of them!' : '');
    };
    parts.forEach(p => {
      const part = el(`<div class="arr-part ${p.cls}"><div class="arr-rows"></div>${p.label ? `<div class="arr-lab">${p.label}</div>` : ''}</div>`);
      const rowsEl = part.firstElementChild;
      for (let r = 0; r < p.rows; r++) {
        const canTap = countable && p.cls !== 'x';
        const row = el(`<div class="arr-row"${canTap ? ' role="button" tabindex="0" aria-pressed="false"' : ''}></div>`);
        row.innerHTML = '<span class="dot"></span>'.repeat(cols);
        if (canTap) {
          const toggle = () => { row.classList.toggle('on'); row.setAttribute('aria-pressed', row.classList.contains('on')); Sound.tap(); update(); };
          row.addEventListener('click', toggle);
          row.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        }
        rowsEl.appendChild(row);
      }
      box.appendChild(part);
    });
    wrap.appendChild(box);
    if (countable) { readout = el(`<p class="count-read" aria-live="polite"></p>`); wrap.appendChild(readout); update(); }
    return wrap;
  },

  /* Count by T: tap a box to choose how many jumps. */
  skipStrip(T, n, onPick) {
    const s = el(`<div class="skip"></div>`);
    range(1, 10).forEach(i => {
      const b = el(`<button type="button" class="skip-cell${i <= n ? ' on' : ''}${i === n ? ' cur' : ''}" aria-label="${i} × ${T} = ${i * T}">${i * T}</button>`);
      b.addEventListener('click', () => { Sound.tap(); onPick(i); });
      s.appendChild(b);
    });
    return s;
  },

  /* Fact family triangle + its facts */
  family(T, n) {
    const p = T * n;
    const facts = T === n
      ? [`${T} × ${n} = ${p}`, `${p} ÷ ${T} = ${n}`]
      : [`${T} × ${n} = ${p}`, `${n} × ${T} = ${p}`, `${p} ÷ ${T} = ${n}`, `${p} ÷ ${n} = ${T}`];
    return el(`<div class="fam">
      <svg class="fam-tri" viewBox="0 0 200 160" role="img" aria-label="Fact family: ${T}, ${n} and ${p}">
        <path d="M100 18 L182 142 L18 142 Z" fill="#fff8dc" stroke="#f3b63f" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="100" cy="40" r="26" fill="#ffd23f"/><text x="100" y="49" text-anchor="middle" class="fam-big">${p}</text>
        <circle cx="48" cy="120" r="22" fill="#fff" stroke="#f3b63f" stroke-width="3"/><text x="48" y="128" text-anchor="middle" class="fam-sm">${T}</text>
        <circle cx="152" cy="120" r="22" fill="#fff" stroke="#f3b63f" stroke-width="3"/><text x="152" y="128" text-anchor="middle" class="fam-sm">${n}</text>
        <text x="100" y="128" text-anchor="middle" class="fam-op">× ÷</text>
      </svg>
      <ul class="fam-list">${facts.map(f => `<li class="math">${f}</li>`).join('')}</ul>
    </div>`);
  },

  /* ---------- island scenes: built = pieces done (0–8) ---------- */
  scene(id, built, done, fresh) {
    const S = {
      forest: () => {
        let s = `<rect width="320" height="160" fill="#dff4ff"/><circle cx="285" cy="30" r="16" fill="#ffd23f"/><rect y="126" width="320" height="34" fill="#8fd16a"/>`;
        for (let i = 0; i < 8; i++) {
          const x = 22 + i * 39.4, nw = i === fresh ? ' new' : '';
          s += i < built
            ? `<g class="pc${nw}"><rect x="${x - 4}" y="104" width="8" height="24" fill="#8a5a33"/><polygon points="${x},48 ${x - 17},92 ${x + 17},92" fill="#2fa45f"/><polygon points="${x},66 ${x - 20},110 ${x + 20},110" fill="#23a566"/></g>`
            : `<g><line x1="${x}" y1="127" x2="${x}" y2="116" stroke="#3d9b4a" stroke-width="3"/><ellipse cx="${x - 5}" cy="116" rx="5" ry="3" fill="#5cc26b"/><ellipse cx="${x + 5}" cy="114" rx="5" ry="3" fill="#5cc26b"/></g>`;
        }
        if (done) s += [[40, 30], [120, 22], [200, 34], [160, 60], [70, 64]].map(([x, y]) => `<path class="spark" d="M${x} ${y - 7} L${x + 2} ${y - 2} L${x + 7} ${y} L${x + 2} ${y + 2} L${x} ${y + 7} L${x - 2} ${y + 2} L${x - 7} ${y} L${x - 2} ${y - 2} Z" fill="#ffd23f"/>`).join('');
        return s;
      },
      bridge: () => {
        const cols = ['#ff5d5d', '#ff9f43', '#ffd23f', '#5cc26b', '#3fc1c9', '#3d7be0', '#7b6cf6', '#c56cf0'];
        let s = `<rect width="320" height="160" fill="#e6f6ff"/><rect y="112" width="320" height="48" fill="#5ec8f2"/>
          <path d="M60 135 q10 -6 20 0 t20 0 M180 145 q10 -6 20 0 t20 0" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>
          <path d="M0 82 H44 V160 H0 Z" fill="#b07a4f"/><rect y="76" width="44" height="8" fill="#5cc26b"/>
          <path d="M276 82 H320 V160 H276 Z" fill="#b07a4f"/><rect x="276" y="76" width="44" height="8" fill="#5cc26b"/>`;
        if (done) s += `<path d="M40 76 A120 70 0 0 1 280 76" fill="none" stroke="#ffd23f" stroke-width="5" opacity=".6"/><path d="M52 76 A108 60 0 0 1 268 76" fill="none" stroke="#ff9f43" stroke-width="5" opacity=".6"/>`;
        for (let i = 0; i < 8; i++) {
          const x = 44 + i * 29, nw = i === fresh ? ' new' : '';
          s += i < built
            ? `<rect class="pc${nw}" x="${x + 1}" y="80" width="27" height="14" rx="3" fill="${cols[i]}"/>`
            : `<rect x="${x + 2}" y="81" width="25" height="12" rx="3" fill="none" stroke="#9aa6b8" stroke-width="2" stroke-dasharray="4 3"/>`;
        }
        if (done) s += `<line x1="44" y1="66" x2="276" y2="66" stroke="#8a5a33" stroke-width="4"/>` + range(0, 8).map(i => `<line x1="${46 + i * 29}" y1="66" x2="${46 + i * 29}" y2="80" stroke="#8a5a33" stroke-width="3"/>`).join('');
        return s;
      },
      garden: () => {
        const cols = ['#ff5d8f', '#ffb703', '#c56cf0', '#ff7b3d', '#ff5d5d', '#3d7be0', '#ff8fc7', '#7b6cf6'];
        let s = `<rect width="320" height="160" fill="#effbe9"/><rect y="40" width="320" height="120" fill="#bfe9a6"/>
          <path d="M0 40 H320" stroke="#5cae4a" stroke-width="10"/>`;
        if (done) s += `<path d="M140 40 V20 A20 20 0 0 1 180 20 V40" fill="none" stroke="#5cae4a" stroke-width="8"/><circle cx="290" cy="20" r="12" fill="#ffd23f"/>`;
        for (let i = 0; i < 8; i++) {
          const x = 52 + (i % 4) * 72, y = i < 4 ? 74 : 124, nw = i === fresh ? ' new' : '';
          if (i < built) {
            const c = cols[i];
            s += `<g class="pc${nw}"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 24}" stroke="#3d9b4a" stroke-width="3"/>` +
              [0, 72, 144, 216, 288].map(a => { const r = a * Math.PI / 180; return `<circle cx="${(x + 9 * Math.cos(r)).toFixed(1)}" cy="${(y + 9 * Math.sin(r)).toFixed(1)}" r="7" fill="${c}"/>`; }).join('') +
              `<circle cx="${x}" cy="${y}" r="5" fill="#ffd23f"/></g>`;
          } else s += `<ellipse cx="${x}" cy="${y + 22}" rx="12" ry="5" fill="#a5784f"/><circle cx="${x}" cy="${y + 19}" r="2.5" fill="#6b4a2b"/>`;
        }
        return s;
      },
      lighthouse: () => {
        let s = `<rect width="320" height="160" fill="#e4f1ff"/><rect y="136" width="320" height="24" fill="#4aa8e0"/><ellipse cx="160" cy="140" rx="74" ry="11" fill="#8b7f73"/>`;
        if (done) s += `<polygon points="160,32 30,10 30,52" fill="#ffe066" opacity=".55"/><polygon points="160,32 290,10 290,52" fill="#ffe066" opacity=".55"/>`;
        for (let i = 0; i < 8; i++) {
          const yb = 136 - i * 12, yt = yb - 12, wb = 64 - i * 3.5, wt = 64 - (i + 1) * 3.5, nw = i === fresh ? ' new' : '';
          const pts = `${160 - wb / 2},${yb} ${160 + wb / 2},${yb} ${160 + wt / 2},${yt} ${160 - wt / 2},${yt}`;
          s += i < built
            ? `<polygon class="pc${nw}" points="${pts}" fill="${i % 2 ? '#ffffff' : '#ff5d5d'}" stroke="#c94848" stroke-width="1.5"/>`
            : `<polygon points="${pts}" fill="none" stroke="#9aa6b8" stroke-width="1.5" stroke-dasharray="4 3"/>`;
        }
        if (done) s += `<rect x="146" y="26" width="28" height="14" fill="#ffd23f" stroke="#c94848" stroke-width="2"/><polygon points="142,26 178,26 160,12" fill="#c94848"/>`;
        return s;
      },
      castle: () => {
        const B = [[100, 115], [130, 115], [160, 115], [190, 115], [100, 85], [190, 85], [100, 55], [190, 55]];
        let s = `<rect width="320" height="160" fill="#e6f0ff"/><rect y="145" width="320" height="15" fill="#8fd16a"/>`;
        B.forEach(([x, y], i) => {
          const nw = i === fresh ? ' new' : '';
          s += i < built
            ? `<rect class="pc${nw}" x="${x}" y="${y}" width="30" height="30" fill="#9fb4d6" stroke="#5b6f99" stroke-width="2"/>`
            : `<rect x="${x + 1}" y="${y + 1}" width="28" height="28" fill="none" stroke="#9aa6b8" stroke-width="2" stroke-dasharray="4 3"/>`;
        });
        if (done) {
          s += [100, 190].map(x => `<rect x="${x}" y="45" width="8" height="10" fill="#9fb4d6" stroke="#5b6f99" stroke-width="2"/><rect x="${x + 22}" y="45" width="8" height="10" fill="#9fb4d6" stroke="#5b6f99" stroke-width="2"/>
            <line x1="${x + 15}" y1="55" x2="${x + 15}" y2="22" stroke="#5b6f99" stroke-width="3"/><polygon points="${x + 15},22 ${x + 35},29 ${x + 15},36" fill="#ff5d5d"/>`).join('');
          s += `<path d="M148 145 V128 A12 12 0 0 1 172 128 V145 Z" fill="#5b6f99"/>`;
        }
        return s;
      }
    };
    return `<svg class="scene${done ? ' done' : ''}" viewBox="0 0 320 160" role="img" aria-label="${built} of 8 parts built">${S[id]()}</svg>`;
  }
};
