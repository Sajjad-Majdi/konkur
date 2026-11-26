/* views/solve: one practice question in focus — tap an option then «ثبت پاسخ» (keys 1-4 and Enter),
   wrong: the right option is marked and the steps open one by one; also used to solve wrong answers again (#/q/<id>) */
function solveCtx(r) {
  if (r.qid) { const q = Q[r.qid], w = weak(); return { mode: 'weak', qid: r.qid, pid: q.pat, list: w, idx: w.indexOf(r.qid) }; }
  const p = PAT[r.pid], i = Math.min(r.idx, p.pr.length - 1); return { mode: 'pr', pid: r.pid, list: p.pr, idx: i, qid: p.pr[i] };
}
function vSolve(r) {
  const cx = solveCtx(r), q = Q[cx.qid], p = cx.pid ? PAT[cx.pid] : null, key = r.qid ? 'w' + r.qid : r.pid + '/' + cx.idx;
  const cc = p ? p.c : q.c, back = p ? `#/p/${p.id}` : `#/c/${q.c}`, backT = p ? p.t : 'آزمونک ' + cShort(q.c);
  if (!UI.solve || UI.solve.key !== key) UI.solve = { key, sel: 0, checked: false, res: '', shown: 0, hinted: false, from: 0, just: false };
  const st = UI.solve, n = q.s.length;
  const last = cx.mode === 'pr' ? cx.idx === cx.list.length - 1 : false;
  const opts = q.o.map((o, i) => {
    const k = i + 1; let cls = '', om = '';
    if (!st.checked) cls = st.sel === k ? 'sel' : '';
    else if (k === q.key) { cls = 'right'; om = ic('check'); }
    else if (k === st.sel) { cls = 'wrong' + (st.just ? ' shk' : ''); om = ic('x'); }
    else cls = 'dim';
    return `<li><button class="opt tap ${cls}" data-act="opt" data-v="${k}" ${st.checked ? 'disabled' : ''} aria-pressed="${st.sel === k}"><span class="on">${fa(k)}</span><span class="ot">${rich(o)}</span><span class="om">${om}</span></button></li>`;
  }).join('');
  let fb = '';
  if (st.checked) {
    const pop = st.just ? '' : 'style="animation:none"';
    if (st.res === 'ok') fb = `<div class="fb ok" ${pop}>${ic('check')}درست<span>${cx.mode === 'weak' ? 'از فهرست غلط‌ها برداشته شد' : 'گزینه ' + fa(q.key)}</span></div>`;
    else if (st.res === 'bad') fb = `<div class="fb bad" ${pop}>${ic('x')}غلط<span>جواب درست گزینه ${fa(q.key)}</span></div>`;
    else fb = `<div class="fb skip" ${pop}>${ic('help')}جواب گزینه ${fa(q.key)}<span>${cx.mode === 'weak' ? 'در فهرست غلط‌ها می‌ماند' : 'این سوال به فهرست غلط‌ها رفت'}</span></div>`;
  }
  const wl = weak().filter(x => x !== cx.qid).length;
  const prim = !st.checked ? { act: 'check', lbl: 'ثبت پاسخ', dis: !st.sel }
    : st.res !== 'ok' && st.shown < n ? { act: 'step', lbl: `قدم بعد · ${fa(st.shown + 1)} از ${fa(n)}` }
      : { act: 'next', lbl: cx.mode === 'weak' ? (wl ? 'غلط بعدی' : 'برگشت به امروز') : last ? 'پایان تمرین' : 'سوال بعد' };
  const sec = !st.checked ? `${!st.hinted && n > 1 ? `<button class="btn ghost s tap" data-act="hint">${ic('bulb', 's')}راهنما</button>` : ''}<button class="btn ghost s tap" data-act="skip">${ic('help', 's')}نمی‌دانم</button>`
    : st.res === 'ok' && st.shown < n ? `<button class="btn ghost s tap" data-act="allsteps">${ic('steps', 's')}دیدن راه‌حل</button>`
      : st.shown < n ? `<button class="btn ghost s tap" data-act="allsteps">همه قدم‌ها</button>` : '';
  const primBtn = cls => `<button class="btn ${cls} tap" data-act="${prim.act}" ${prim.dis ? 'disabled' : ''}>${prim.lbl}${prim.act !== 'check' ? ic('arl', 's') : ''}</button>`;
  const dots = cx.mode === 'pr' ? `<span class="pdots">${cx.list.map((qq, i) => { const m = ansMark(qq); return `<i class="${i === cx.idx ? 'cur' : m}"></i>`; }).join('')}</span>` : '';
  const posTxt = cx.mode === 'pr' ? `تمرین ${fa(cx.idx + 1)} از ${fa(cx.list.length)}` : 'حل دوباره';
  const hint = st.hinted && !st.checked ? `<div class="hintb">${ic('bulb')}<div class="sb">${rich(q.s[0])}</div></div>` : '';
  return `<div class="view c-${cc}">
    ${tb(back, posTxt + (dots ? ' ' + dots : ''), p ? `<button class="btn s soft tap" data-act="method-sheet">${ic('bolt', 's')}روش</button>` : '', '')}
    <div class="solve ${p ? '' : 'solo'}">
      <div>
        <div class="solve-top"><a class="lnk tap" href="${back}">${ic('arr', 's')}${esc(backT)}</a><span class="pos">${posTxt}${dots}</span></div>
        <section class="card qc">
          <div class="qmeta"><b>${qref(q)}</b><span class="src">${SRCN[q.src] || ''}</span>${fromTest(cx.qid) ? '<span class="src">از آزمونک</span>' : ''}</div>
          ${hint}
          <div class="qtext">${rich(q.t)}</div>
          ${qFig(q)}
          <ol class="opts">${opts}</ol>
          ${fb}
          ${st.checked && st.shown ? stepsHtml(q, st.shown, st.from) : ''}
          <div class="qbar desk">${primBtn('')}${sec}</div>
        </section>
      </div>
      ${p ? methodCard(p, 'side-only') : ''}
    </div>
    <div class="mob-bar">${sec ? `<div style="display:flex;gap:8px">${sec}</div>` : ''}${primBtn('l')}</div></div>`;
}
/* record an answer: the first answer counts; a later right answer to a wrong one clears it from the wrong list */
function answer(kind) {
  const cx = solveCtx(ROUTE), q = Q[cx.qid], st = UI.solve, prev = answered(cx.qid) ? S.q[cx.qid] : null;
  st.checked = true; st.just = true;
  /* a self-test mistake solved again right leaves the list; practice records are only touched by practice questions */
  if (cx.mode === 'weak' && kind !== 'skip' && st.sel === q.key && S.tw[cx.qid]) delete S.tw[cx.qid];
  if (cx.mode === 'weak' && !pracWeak(cx.qid)) {
    if (kind === 'skip') { st.res = 'skip'; st.sel = 0; st.from = st.shown; st.shown = q.s.length; }
    else { const ok = st.sel === q.key; st.res = ok ? 'ok' : 'bad'; if (!ok) { st.from = st.shown; st.shown = Math.max(st.shown, 1); } }
    save(); render(); return;
  }
  if (kind === 'skip') {
    st.res = 'skip'; st.sel = 0; st.from = st.shown; st.shown = q.s.length;
    if (!prev) S.q[cx.qid] = { t: [0], sk: 1, done: 1, r: q.s.length };
  } else {
    const ok = st.sel === q.key; st.res = ok ? 'ok' : 'bad';
    if (!prev) S.q[cx.qid] = { t: [st.sel], done: 1, r: ok ? 0 : 1 };
    else { if (!Array.isArray(prev.t)) prev.t = []; prev.t.push(st.sel); if (ok && !firstOk(cx.qid)) prev.fx = 1; }
    if (!ok) { st.from = st.shown; st.shown = Math.max(st.shown, 1); }
  }
  save(); render();
}
function nextQ() {
  const cx = solveCtx(ROUTE);
  if (cx.mode === 'weak') { const w = weak(); location.hash = w.length ? '#/q/' + w[0] : '#/'; return; }
  if (cx.idx < cx.list.length - 1) location.hash = `#/p/${cx.pid}/q/${cx.idx + 1}`;
  else { S.rd[cx.pid] = 1; S.exd[cx.pid] = 1; save(); location.hash = `#/p/${cx.pid}/done`; }
}
