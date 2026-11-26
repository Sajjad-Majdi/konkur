/* views/test: timed self-test in focus mode (135 s per question, mark for a second pass) and its result with negative marking (3C − W) / 3N */
function testState(cid) {
  if (!UI.test[cid]) { const ids = SELFTEST[cid].slice(); UI.test[cid] = { ids, cur: 0, ans: {}, mark: {}, start: Date.now(), dur: ids.length * SEC_PER_Q }; }
  return UI.test[cid];
}
const tLeft = t => Math.max(0, Math.round(t.dur - (Date.now() - t.start) / 1000));
const mmss = s => fa(String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'));
function cellsHtml(t) { return t.ids.map((id, i) => `<button class="cell tap ${t.ans[i] ? 'ans' : ''} ${t.mark[i] ? 'mark' : ''} ${i === t.cur ? 'cur' : ''}" data-act="t-go" data-v="${i}" aria-label="سوال ${fa(i + 1)}">${fa(i + 1)}</button>`).join(''); }
function legendHtml(t) { const n = t.ids.length, na = Object.keys(t.ans).length, nm = Object.keys(t.mark).length; return `<div class="legend"><span><i class="a"></i>پاسخ‌داده<b>${fa(na)}</b></span><span><i class="m"></i>علامت برای دور دوم<b>${fa(nm)}</b></span><span><i></i>نزده<b>${fa(n - na)}</b></span></div>`; }
function vTest(r) {
  const c = COURSE[r.cid], t = testState(r.cid), n = t.ids.length, q = Q[t.ids[t.cur]], rem = tLeft(t);
  const opts = q.o.map((o, i) => `<li><button class="opt tap ${t.ans[t.cur] === i + 1 ? 'sel' : ''}" data-act="t-opt" data-v="${i + 1}" aria-pressed="${t.ans[t.cur] === i + 1}"><span class="on">${fa(i + 1)}</span><span class="ot">${rich(o)}</span></button></li>`).join('');
  const markBtn = `<button class="btn ghost s tap mark-btn ${t.mark[t.cur] ? 'on' : ''}" data-act="t-mark">${ic('mark', 's')}${t.mark[t.cur] ? 'علامت خورده' : 'علامت برای بعد'}</button>`;
  const isLast = t.cur === n - 1;
  return `<div class="view c-${c.id}">
    <div class="tbar"><div class="l"><button class="ibtn tap" data-act="t-exit" aria-label="خروج">${ic('x')}</button><span class="nm">آزمونک ${esc(cShort(c.id))}</span></div>
      <div class="c"><div class="timer ${rem < 120 ? 'low' : ''}" id="timer">${ic('clock')}<span>${mmss(rem)}</span></div></div>
      <div class="r"><button class="btn s ghost tap desk-only" data-act="t-finish">پایان آزمونک</button><button class="ibtn tap mob-only" data-act="t-nav" aria-label="فهرست سوال‌ها">${ic('grid')}</button></div>
      <div class="tprog"><i id="tprog" style="width:${(100 - rem / t.dur * 100).toFixed(1)}%"></i></div></div>
    <div class="tgrid">
      <div><section class="card qc">
        <div class="qmeta"><b>سوال ${fa(t.cur + 1)} از ${fa(n)}</b><span>·</span><span>${qref(q)}</span></div>
        <div class="qtext">${rich(q.t)}</div>
        ${qFig(q)}
        <ol class="opts">${opts}</ol>
        <div class="tnav desk"><button class="btn ghost s tap" data-act="t-prev" ${t.cur ? '' : 'disabled'}>${ic('arr', 's')}قبلی</button>${markBtn}${t.ans[t.cur] ? `<button class="btn ghost s tap" data-act="t-clear">پاک کردن پاسخ</button>` : ''}<span class="sp"></span>
          ${isLast ? `<button class="btn s tap" data-act="t-finish">پایان آزمونک</button>` : `<button class="btn s tap" data-act="t-next">بعدی${ic('arl', 's')}</button>`}</div>
      </section></div>
      <aside class="card navp side-only"><h3>${fa(n)} سوال</h3><div class="cells">${cellsHtml(t)}</div>${legendHtml(t)}</aside>
    </div>
    <div class="mob-bar"><button class="btn ghost tap" data-act="t-prev" ${t.cur ? '' : 'disabled'} style="flex:0 0 52px;padding:0" aria-label="قبلی">${ic('arr')}</button><button class="btn ghost tap mark-btn ${t.mark[t.cur] ? 'on' : ''}" data-act="t-mark" style="flex:0 0 auto">${ic('mark', 's')}${t.mark[t.cur] ? 'علامت خورده' : 'علامت'}</button>${isLast ? `<button class="btn tap" data-act="t-finish">پایان</button>` : `<button class="btn tap" data-act="t-next">بعدی${ic('arl', 's')}</button>`}</div></div>`;
}
function finishTest(cid) {
  const t = UI.test[cid]; if (!t) return;
  let c = 0, w = 0, b = 0;
  const a = t.ids.map((id, i) => { const x = t.ans[i] || 0; if (!x) b++; else if (x === Q[id].key) c++; else w++; return x; });
  const n = t.ids.length, used = Math.min(t.dur, Math.round((Date.now() - t.start) / 1000)), pct = (3 * c - w) / (3 * n) * 100;
  const rec = S.test[cid] && typeof S.test[cid] === 'object' ? S.test[cid] : (S.test[cid] = { h: [] });
  if (!Array.isArray(rec.h)) rec.h = [];
  const prev = lastTest(cid);
  rec.h.push({ c, w, b, n, t: isoOf(TODAY), u: used, a, ids: t.ids });
  if (rec.h.length > 30) rec.h = rec.h.slice(-30);
  t.ids.forEach((id, i) => { if (a[i] && a[i] !== Q[id].key) S.tw[id] = 1; else if (a[i] === Q[id].key) delete S.tw[id]; });
  rec.best = typeof rec.best === 'number' ? Math.max(rec.best, pct) : pct; rec.last = pct; rec.at = Date.now();
  save();
  UI.result[cid] = { prev };
  delete UI.test[cid];
  UI.rvf = 'all'; UI.rvOpen = null;
  location.hash = `#/t/${cid}/r`;
}
function vResult(r) {
  const c = COURSE[r.cid], R = lastTest(r.cid);
  if (!R || !R.a) return vCourse({ cid: r.cid });
  const ids = R.ids || SELFTEST[r.cid], prev = UI.result[r.cid] ? UI.result[r.cid].prev : null;
  const score = (3 * R.c - R.w) / (3 * R.n) * 100, raw = R.c / R.n * 100;
  const rc = 2 * Math.PI * 63, col = score >= 50 ? 'var(--ok)' : score >= 25 ? 'var(--amber-2)' : 'var(--bad)';
  const stat = (a, id) => !a ? 'e' : a === Q[id].key ? 'g' : 'r';
  const f = UI.rvf;
  const rows = ids.map((id, i) => ({ id, i, a: R.a[i], s: stat(R.a[i], id) })).filter(x => f === 'all' || (f === 'w' && x.s === 'r') || (f === 'b' && x.s === 'e')).map(x => {
    const q = Q[x.id], p = q.pat ? PAT[q.pat] : null, open = UI.rvOpen === x.id;
    return `<div><button class="rrow tap" data-act="rv-open" data-v="${x.id}" aria-expanded="${open}"><span class="qn ${x.s}">${fa(x.i + 1)}</span><span style="min-width:0"><div class="t1">${plain(q.t)}</div><div class="t2">${qref(q)}${p ? ' · ' + esc(p.t) : ''}</div></span>
      <span class="an">${x.a ? `جواب تو <b class="${x.s}">${fa(x.a)}</b> · ` : 'نزده · '}کلید <b class="g">${fa(q.key)}</b></span><span class="go">${open ? 'بستن' : 'راه‌حل'}${ic('chd', 's')}</span></button>
      ${open ? `<div class="rv-b"><div class="qtext">${rich(q.t)}</div>${qFig(q)}<ol class="opts">${q.o.map((o, k) => `<li><div class="opt ${k + 1 === q.key ? 'right' : k + 1 === x.a ? 'wrong' : 'dim'}"><span class="on">${fa(k + 1)}</span><span class="ot">${rich(o)}</span></div></li>`).join('')}</ol>${stepsHtml(q, q.s.length)}${p ? `<a class="btn s soft tap" href="#/p/${p.id}" style="margin-top:4px">تمرین الگوی ${esc(p.t)}</a>` : ''}</div>` : ''}</div>`;
  }).join('');
  const sg = (v, l) => `<button class="tap ${f === v ? 'on' : ''}" data-act="rv-f" data-v="${v}">${l}</button>`;
  return `<div class="view wrap c-${c.id}">${tb(`#/c/${c.id}`, 'نتیجه آزمونک ' + esc(cShort(c.id)))}
    <header class="ph"><div><nav class="crumb"><a href="#/c/${c.id}">${esc(c.name)}</a>${ic('chl')}<span>آزمونک</span></nav><h1>نتیجه آزمونک ${esc(cShort(c.id))}</h1></div>
      <div style="margin-inline-start:auto;display:flex;gap:10px"><a class="btn ghost tap" href="#/t/${c.id}">${ic('retry', 's')}آزمونک دوباره</a><a class="btn ghost tap" href="#/c/${c.id}">برگشت به درس${ic('arl', 's')}</a></div></header>
    <div class="res-top">
      <section class="card score"><div class="ringbig"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="63" stroke="var(--sunken)"/><circle cx="75" cy="75" r="63" stroke="${col}" stroke-linecap="round" stroke-dasharray="${rc.toFixed(1)}" stroke-dashoffset="${(rc * (1 - Math.max(0, score) / 100)).toFixed(1)}" style="transition:stroke-dashoffset 1s"/></svg><b>${pctFa(score)}</b></div>
        <div><h2>نمره با نمره منفی</h2><div class="fm">${rich(`$\\frac{3 \\times ${R.c} - ${R.w}}{3 \\times ${R.n}}$`)}</div>
          <div class="cmp"><span><b>${pctFa(raw)}</b>بدون نمره منفی</span><span><b>${fa(Math.round((R.u || 0) / 60))} از ${fa(Math.round(R.n * SEC_PER_Q / 6) / 10)}</b>دقیقه</span>${prev ? `<span><b>${pctFa(testPct(prev))}</b>دفعه قبل</span>` : ''}</div></div></section>
      <section class="card bkd"><div class="nums"><div class="g"><b>${fa(R.c)}</b><span>درست</span></div><div class="r"><b>${fa(R.w)}</b><span>غلط</span></div><div><b>${fa(R.b)}</b><span>نزده</span></div></div>
        <div class="qstrip">${ids.map((id, i) => `<i class="${stat(R.a[i], id)}">${fa(i + 1)}</i>`).join('')}</div>
        <div class="muted" style="font-size:13px">${R.w ? `${fa(R.w)} غلط ${pctFa(R.w / (3 * R.n) * 100)} از نمره را پاک کرد` : 'هیچ غلطی نمره کم نکرد'}</div></section>
    </div>
    <section class="panel rv"><div class="rv-h"><h2 class="h2">سوال به سوال</h2><div class="seg">${sg('all', 'همه')}${sg('w', `غلط‌ها ${fa(R.w)}`)}${sg('b', `نزده ${fa(R.b)}`)}</div></div>${rows || '<div class="muted" style="padding:16px">موردی نیست</div>'}</section>
  </div>`;
}
