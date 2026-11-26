/* views/home: "today" page — today's work card, exam countdown, registration reminder, this week, wrong answers, progress */
const phLbl = d => { if (!d || d.ph < 0) return '<span class="dayn">الگوی بعدی</span>'; const ph = PHASES[d.ph]; return `<span class="dayn">${esc(ph.short)}</span><span>روز ${fa(d.n - ph.from + 1)} از ${fa(ph.len)}</span>`; };
const whenLbl = n => n === todayN() + 1 ? 'فردا' : jdate(dateOf(n), { w: 1 });
const itemLbl = d => d.pats.length ? d.pats.map(id => PAT[id].t).join(' و ') : d.text;
function hero(m) {
  const w = weak();
  if (m.kind === 'plandone') {
    return `<section class="card hero fin">
      <div class="hero-k"><span class="hd">${jdate(TODAY, { w: 1 })}</span><span class="dayn">برنامه</span><span>${ic('check', 's')} همه مرحله‌ها تمام شد</span></div>
      <h2><span class="mk">هر ${fa(RANK.length)} الگو تمام شد</span></h2>
      <div class="hero-a">${LIVE.filter(c => SELFTEST[c.id]).map((c, i) => `<a class="btn l ${i ? 'ghost' : ''} tap c-${c.id}" href="#/t/${c.id}">${ic('play', 's')}آزمونک ${esc(cShort(c.id))}</a>`).join('')}</div></section>`;
  }
  if (m.kind === 'daydone') {
    const nx = m.next, np = nx.pats.length ? PAT[nx.pats.filter(id => !pst(id).done)[0] || nx.pats[0]] : null;
    const go = np ? `#/p/${np.id}` : '#/plan';
    return `<section class="card hero fin ${np ? 'c-' + np.c : ''}">
      <div class="hero-k"><span class="hd">${jdate(TODAY, { w: 1 })}</span>${phLbl(m.d)}</div>
      <h2><span class="mk">کار امروز تمام شد</span></h2>
      <div class="next-l">${whenLbl(nx.n)} · ${esc(itemLbl(nx))}</div>
      <div class="hero-a">${w.length ? `<a class="btn l tap" href="#/q/${w[0]}">${ic('retry', 's')}حل دوباره ${fa(w.length)} سوال غلط</a><a class="btn l ghost tap" href="${go}">جلوتر برو${ic('arl', 's')}</a>`
        : `<a class="btn l tap" href="${go}">جلوتر برو${ic('arl', 's')}</a>`}</div></section>`;
  }
  const lagTx = m.behind ? `<span class="lag">از ${jdate(dateOf(m.behind))} مانده</span>` : '';
  if (m.kind === 'text') {
    const d = m.d, link = testBtns(d) || (w.length ? `<a class="btn l ghost tap" href="#/q/${w[0]}">${ic('retry', 's')}${fa(w.length)} سوال غلط</a>` : '');
    return `<section class="card hero">
      <div class="hero-k"><span class="hd">${jdate(TODAY, { w: 1 })}</span>${phLbl(d)}${lagTx}</div>
      <h2><span class="mk">${esc(d.text)}</span></h2>
      <div class="hero-a"><button class="btn l tap" data-act="text-done" data-d="${d.id}">${ic('check', 's')}انجام شد</button>${link}</div></section>`;
  }
  const p = PAT[m.pid], s = m.st || pst(m.pid), d = m.d;
  const st = k => ({ read: s.read, ex: s.ex, pr: s.ans === s.tot && s.tot > 0 }[k]);
  const cur = s.stage;
  const stages = ['read', 'ex', 'pr'].map((k, i) => {
    const done = st(k), on = cur === k;
    const lbl = k === 'pr' ? `تمرین ${fa(s.ans)} از ${fa(s.tot)}` : STG[k];
    return `${i ? `<i class="stg-l ${done || on ? 'done' : ''}"></i>` : ''}<span class="stg ${done ? 'done' : on ? 'cur' : ''}"><span class="b">${done ? ic('check', 's') : fa(i + 1)}</span>${lbl}</span>`;
  }).join('');
  const target = cur === 'pr' ? `#/p/${p.id}/q/${Math.max(0, p.pr.findIndex(q => !answered(q)))}` : cur === 'done' ? `#/p/${p.id}` : `#/p/${p.id}/${cur}`;
  const label = m.kind === 'start' ? 'شروع با یادآوری' : `ادامه · ${STG[cur] || 'مرور'}`;
  const other = d.pats.filter(x => x !== p.id && !pst(x).done).map(x => PAT[x]);
  const also = other.length || d.extra ? `<div class="also">${other.length ? `${ic('list', 's')}بعد از این <a href="#/p/${other[0].id}">${esc(other[0].t)}</a>` : ''}${d.extra ? `${other.length ? ' · ' : ''}${esc(d.extra)}` : ''}</div>` : '';
  return `<section class="card hero c-${p.c}">
    <div class="hero-k"><span class="hd">${jdate(TODAY, { w: 1 })}</span>${phLbl(d)}${lagTx}<span class="tag"><i class="dot"></i>${esc(cShort(p.c))}</span></div>
    <h2><a href="#/p/${p.id}"><span class="mk">${esc(p.t)}</span></a></h2>
    <div class="en">${esc(p.en)}</div>
    ${also}
    <div class="stages">${stages}</div>
    <div class="hero-a"><a class="btn l tap" href="${target}">${label}${ic('arl', 's')}</a>
      <div class="meta"><span>${ic('clock', 's')}${hours(p.rank.hours)}</span><span>${freq(p, true)}</span></div></div></section>`;
}
function timeline(ts) {
  const total = ts.toExam; if (total <= 0) return '';
  const pct = i => (i / total * 100).toFixed(2);
  const bounds = [0];
  for (let i = 1; i < total; i++) if (jp(ts.t + i * DAY)[2] === 1) bounds.push(i);
  bounds.push(total);
  let ticks = '', mos = '';
  bounds.forEach((b, k) => {
    if (k && k < bounds.length - 1) ticks += `<i class="tick" style="inset-inline-start:${pct(b)}%"></i>`;
    if (k < bounds.length - 1 && (bounds[k + 1] - b) / total > .075) mos += `<span class="mo" style="inset-inline-start:${pct((b + bounds[k + 1]) / 2)}%">${JMON[jp(ts.t + b * DAY)[1] - 1]}</span>`;
  });
  let reg = '';
  if (['before', 'open', 'last', 'done'].includes(ts.reg)) {
    const a = Math.max(0, dd(ts.t, REG_S)), b = dd(ts.t, REG_E) + 1;
    reg = `<i class="reg" style="inset-inline-start:${pct(a)}%;width:${(Math.max(b - a, 1.6) / total * 100).toFixed(2)}%;${ts.reg === 'done' ? 'opacity:.35' : ''}" title="ثبت‌نام"></i>`;
  }
  return `<div class="tl" aria-hidden="true"><i class="bar"></i>${ticks}${reg}<i class="now" style="inset-inline-start:0"></i><span class="end">${ic('flag', 's')}</span>${mos}</div>`;
}
const regRange = () => { const a = jp(REG_S), b = jp(REG_E); return a[1] === b[1] ? `${fa(a[2])} تا ${fa(b[2])} ${JMON[b[1] - 1]}` : `${jdate(REG_S)} تا ${jdate(REG_E)}`; };
function timePanel(ts, o = {}) {
  if (ts.toExam < 0) return `<section class="card time"><div class="k">کنکور ${fa(EXAM.year)}</div><div class="n"><b style="font-size:34px">برگزار شد</b></div><div class="dt">${jdate(EXAMD, { w: 1, y: 1 })}</div></section>`;
  if (ts.toExam === 0) return `<section class="card time today-x"><div class="k">کنکور ${fa(EXAM.year)}</div><div class="n"><b style="font-size:34px">امروز روز کنکور است</b></div><div class="dt">سه دور حل و هر سه غلط یک درست را پاک می‌کند</div></section>`;
  let row = '';
  if (ts.reg === 'before') row = `<div class="reg-row"><i class="sq"></i><span><b>ثبت‌نام</b> ${regRange()}</span><span class="x">${ts.toReg === 1 ? 'فردا' : fa(ts.toReg) + ' روز دیگر'}</span></div>`;
  if (o.withReg && (ts.reg === 'open' || ts.reg === 'last')) row = `<a class="reg-row open tap" href="${esc(EXAM.registration.url)}" target="_blank" rel="noopener" data-act="reg-link"><i class="sq"></i><span><b>${ts.reg === 'last' ? 'امروز روز آخر ثبت‌نام' : 'ثبت‌نام باز است'}</b></span><span class="x">${ts.reg === 'last' ? ic('ext', 's') : fa(ts.regLeft) + ' روز مانده'}</span></a>`;
  if (ts.reg === 'done') row = `<div class="reg-row" style="color:var(--ink-3)">${ic('check', 's')}<span>ثبت‌نام انجام شد</span></div>`;
  return `<section class="card time">
    <div class="k">تا کنکور ${fa(EXAM.year)}</div>
    <div class="n"><b>${fa(ts.toExam)}</b><span>روز</span></div>
    <div class="dt">${jdate(EXAMD, { w: 1, y: 1 })}</div>
    ${timeline(ts)}${row}</section>`;
}
function regBanner(ts) {
  if (ts.reg !== 'open' && ts.reg !== 'last') return '';
  const last = ts.reg === 'last';
  return `<section class="reg-banner ${last ? 'last' : ''}" role="alert">
    <span class="big">${last ? ic('alert', 'l') : fa(ts.regLeft)}</span>
    <div class="tx"><b>${last ? `امروز آخرین روز ثبت‌نام کنکور ${fa(EXAM.year)} است` : `ثبت‌نام کنکور ${fa(EXAM.year)} باز است`}</b><span>${last ? 'تا پایان امروز ' + jdate(REG_E) : `روز مانده تا ${jdate(REG_E)}`}</span></div>
    <div class="acts"><a class="btn amber tap" href="${esc(EXAM.registration.url)}" target="_blank" rel="noopener" data-act="reg-link">ثبت‌نام در سنجش ${ic('ext', 's')}</a><button class="btn ghost tap" data-act="reg-done">ثبت‌نام کردم</button></div></section>`;
}
/* ---- plan pieces shared with the plan page: day cell, week strip ---- */
const WDS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
const WD1 = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const colOf = t => (new Date(t).getUTCDay() + 1) % 7;
function dayInfo(t) {
  const n = nOf(t), d = n >= 1 && n <= LP.length ? LP[n - 1] : null;
  const isT = t === TODAY, past = t < TODAY, done = d && dayDone(d);
  return { t, n, d, isT, past, done, miss: past && d && !d.soon && !done, buf: n > LP.length && t < EXAMD, exam: t === EXAMD, reg: t >= REG_S && t <= REG_E, pre: n < 1 };
}
function dayCell(t, mode) {
  const x = dayInfo(t), d = x.d, ph = d ? PHASES[d.ph] : null, jd = jp(t)[2];
  const cls = ['dc', x.isT ? 'today' : '', x.done ? 'done' : '', x.miss ? 'miss' : '', x.pre ? 'pre' : '', x.buf ? 'buf' : '', x.exam ? 'exam' : '', ph && ph.soon ? 'ph-soon' : '', d && d.soon ? 'soon' : ''].join(' ');
  const mark = x.done ? ic('check', 's') : x.isT ? '<em>امروز</em>' : x.miss ? '<i class="lagdot" title="عقب"></i>' : '';
  let body = '';
  if (d) {
    if (d.soon) body = `<div class="sn">${esc(ph.short)}</div>`;
    else body = d.pats.map(id => `<div class="pt c-${PAT[id].c} ${!x.done && pst(id).done ? 'pd' : ''}">${!x.done && pst(id).done ? ic('check', 's') : ''}${esc(PAT[id].t)}</div>`).join('') + (d.text ? `<div class="tx">${esc(d.text)}</div>` : '');
  } else if (x.exam) body = `<div class="tx ex-d">${ic('flag', 's')}کنکور</div>`;
  else if (x.buf) body = '<div class="sn">ذخیره</div>';
  if (x.reg) body += '<div class="rg">ثبت‌نام</div>';
  const dots = d && !d.soon ? (d.pats.length ? d.pats.map(id => `<i class="c-${PAT[id].c} ${pst(id).done ? 'pd' : ''}"></i>`).join('') : '<i class="nt"></i>') : x.reg ? '<i class="rgd"></i>' : '';
  const href = d && d.pats.length ? `#/p/${(d.pats.find(id => !pst(id).done) || d.pats[0])}` : d && d.tests ? `#/t/${d.tests[0]}` : '';
  const head = mode === 'week' ? `<span class="wd"><b class="lg">${WDS[colOf(t)]}</b><b class="sm">${WD1[colOf(t)]}</b> ${fa(jd)}</span>` : `<span class="wd"><b>${fa(jd)}</b></span>`;
  const tag = href ? 'a' : 'div';
  return `<${tag} class="${cls} ${href ? 'tap' : ''}" ${href ? `href="${href}"` : ''} style="--pc:${ph ? ph.bar : x.buf ? 'var(--amber-2)' : 'transparent'}"><div class="dn">${head}${mark}</div><div class="dots">${dots}</div><div class="bd">${body}</div></${tag}>`;
}
function weekStrip() {
  const sat = TODAY - colOf(TODAY) * DAY, k = todayN(), lag = missed().length;
  return `<section class="panel plan">
    <div class="plan-h"><h2 class="h2">این هفته</h2><span class="x">${k >= 1 && k <= LP.length ? `روز ${fa(k)} از ${fa(LP.length)}` : k < 1 ? 'برنامه هنوز شروع نشده' : 'روزهای ذخیره'}${lag ? ` · <b style="color:var(--amber)">${fa(lag)} روز عقب</b>` : ''}</span>
      <a class="lnk tap" href="#/plan" style="margin-inline-start:auto">برنامه کامل تا کنکور${ic('chl', 's')}</a></div>
    <div class="days wk">${Array.from({ length: 7 }, (_, i) => dayCell(sat + i * DAY, 'week')).join('')}</div></section>`;
}
function weakRow(qid) {
  const q = Q[qid];
  return `<a class="wrow tap c-${q.c}" href="#/q/${qid}"><span class="ix">${ic('x', 's')}</span><span class="bd"><span class="t1">${esc(wTitle(qid))}<small>${qref(q)}${fromTest(qid) && q.pat ? ' · از آزمونک' : ''}</small></span><span class="t2">${plain(q.t)}</span></span><span class="go">دوباره حل کن ${ic('arl', 's')}</span></a>`;
}
function weakPanel(w) {
  const pats = [...new Set(w.map(q => wTitle(q)))];
  return `<section class="panel weak">
    <div class="sec-t">${ic('retry')}<h2 class="h2">سوال‌های غلط</h2><span class="x">${fa(w.length)} سوال</span></div>
    <button class="wrow weak-m tap c-${Q[w[0]].c}" data-act="weak-sheet"><span class="ix">${ic('retry', 's')}</span><span class="bd"><span class="t1">${fa(w.length)} سوال غلط</span><span class="t2">${esc(pats[0])}${pats.length > 1 ? ` و ${fa(pats.length - 1)} مورد دیگر` : ''}</span></span><span class="go">دوباره حل کن ${ic('arl', 's')}</span></button>
    ${w.slice(0, 4).map(weakRow).join('')}
    ${w.length > 4 ? `<button class="lnk tap" data-act="weak-sheet" style="padding:8px 12px">همه ${fa(w.length)} سوال ${ic('chl', 's')}</button>` : ''}</section>`;
}
function progPanel() {
  const dn = RANK.filter(id => pst(id).done).length;
  const rows = LIVE.map(c => {
    const s = cst(c.id);
    return `<a class="prow tap c-${c.id}" href="#/c/${c.id}"><span class="nm"><i class="dot"></i>${esc(c.name)}</span><span class="ct">${fa(s.done)} از ${fa(s.n)} الگو</span>${segbar(c.id)}
      <div class="sub"><span>${s.ans ? `${fa(s.right)} از ${fa(s.ans)} درست در بار اول` : 'هنوز سوالی حل نشده'}</span><span>${s.left ? hours(s.left) + ' مانده' : 'تمام'}</span></div></a>`;
  }).join('');
  const soon = COURSES.filter(c => !c.hasContent).length;
  return `<section class="panel prog"><div class="sec-t"><h2 class="h2">پیشرفت</h2><span class="x">${fa(dn)} از ${fa(RANK.length)} الگو</span></div>${rows}
    ${soon ? `<a class="soon-l tap" href="#/courses">${fa(soon)} درس دیگر به‌زودی ${ic('chl', 's')}</a>` : ''}</section>`;
}
function vHome() {
  const ts = timeState(), w = weak();
  return `<div class="view wrap home">
    ${tb('', 'امروز', themeBtn(), jdate(TODAY, { w: 1 }))}
    ${regBanner(ts)}
    <div class="top">${hero(heroModel())}${timePanel(ts)}</div>
    ${weekStrip()}
    <div class="lower ${w.length ? '' : 'one'}">${w.length ? weakPanel(w) : ''}${progPanel()}</div>
  </div>`;
}
