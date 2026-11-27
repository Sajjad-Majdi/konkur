/* views/home: "today" page — the map of the road to the exam, today's work card, registration reminder (only while it is open),
   wrong answers; on phone and tablet also the row to the exam tips */
/* the context line of the card: «هوش مصنوعی · روز ۲ از ۸» */
const phLbl = d => { if (!d || d.ph < 0) return '<span class="ctx"><i class="dot"></i>الگوی بعدی</span>'; const ph = PHASES[d.ph]; return `<span class="ctx"><i class="dot"></i>${esc(ph.short)} · روز ${fa(d.n - ph.from + 1)} از ${fa(ph.len)}</span>`; };
const whenLbl = n => n === todayN() + 1 ? 'فردا' : jdate(dateOf(n), { w: 1 });
const itemLbl = d => d.pats.length ? d.pats.map(id => PAT[id].t).join(' و ') : d.text;
function hero(m) {
  const w = weak();
  if (m.kind === 'plandone') {
    return `<section class="card hero fin">
      <div class="hero-k"><span class="ctx">${ic('check', 's')}همه مرحله‌ها تمام شد</span></div>
      <h2><span class="mk">هر ${fa(RANK.length)} الگو تمام شد</span></h2>
      <div class="hero-a">${LIVE.filter(c => SELFTEST[c.id]).map((c, i) => `<a class="btn l ${i ? 'ghost' : ''} tap c-${c.id}" href="#/t/${c.id}">${ic('play', 's')}آزمونک ${esc(cShort(c.id))}</a>`).join('')}</div></section>`;
  }
  if (m.kind === 'daydone') {
    const nx = m.next, np = nx.pats.length ? PAT[nx.pats.filter(id => !pst(id).done)[0] || nx.pats[0]] : null;
    const go = np ? `#/p/${np.id}` : '#/plan';
    const dc = m.d && m.d.ph >= 0 && PHASES[m.d.ph].courses.length === 1 ? 'c-' + PHASES[m.d.ph].courses[0] : '';
    return `<section class="card hero fin ${dc}">
      <div class="hero-k">${phLbl(m.d)}</div>
      <h2><span class="mk">کار امروز تمام شد</span></h2>
      <div class="next-l">${whenLbl(nx.n)} · ${esc(itemLbl(nx))}</div>
      <div class="hero-a">${w.length ? `<a class="btn l tap" href="#/q/${w[0]}">${ic('retry', 's')}حل دوباره ${fa(w.length)} سوال غلط</a><a class="btn l ghost tap" href="${go}">جلوتر برو${ic('arl', 's')}</a>`
        : `<a class="btn l tap" href="${go}">جلوتر برو${ic('arl', 's')}</a>`}</div></section>`;
  }
  const lagTx = m.behind ? `<span class="lag">از ${jdate(dateOf(m.behind))} مانده</span>` : '';
  if (m.kind === 'text') {
    const d = m.d, link = testBtns(d) || (w.length ? `<a class="btn l ghost tap" href="#/q/${w[0]}">${ic('retry', 's')}${fa(w.length)} سوال غلط</a>` : '');
    const tc = PHASES[d.ph] && PHASES[d.ph].courses.length === 1 ? 'c-' + PHASES[d.ph].courses[0] : '';
    return `<section class="card hero ${tc}">
      <div class="hero-k">${phLbl(d)}${lagTx}</div>
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
    <div class="hero-k">${phLbl(d)}${lagTx}</div>
    <h2><a href="#/p/${p.id}"><span class="mk">${esc(p.t)}</span></a></h2>
    <div class="en">${esc(p.en)}</div>
    ${also}
    <div class="stages">${stages}</div>
    <div class="hero-a"><a class="btn l tap" href="${target}">${label}${ic('arl', 's')}</a>
      <div class="meta"><span>${ic('clock', 's')}${hours(p.rank.hours)}</span><span>${freq(p, true)}</span></div></div></section>`;
}
function regBanner(ts) {
  if (ts.reg !== 'open' && ts.reg !== 'last') return '';
  const last = ts.reg === 'last';
  return `<section class="reg-banner ${last ? 'last' : ''}" role="alert">
    <span class="big">${last ? ic('alert', 'l') : fa(ts.regLeft)}</span>
    <div class="tx"><b>${last ? `امروز آخرین روز ثبت‌نام کنکور ${fa(EXAM.year)} است` : `ثبت‌نام کنکور ${fa(EXAM.year)} باز است`}</b><span>${last ? 'تا پایان امروز ' + jdate(REG_E) : `روز مانده تا ${jdate(REG_E)}`}</span></div>
    <div class="acts"><a class="btn amber tap" href="${esc(EXAM.registration.url)}" target="_blank" rel="noopener" data-act="reg-link">ثبت‌نام در سنجش ${ic('ext', 's')}</a><button class="btn ghost tap" data-act="reg-done">ثبت‌نام کردم</button></div></section>`;
}
function weakRow(qid) {
  const q = Q[qid];
  return `<a class="wrow tap c-${q.c}" href="#/q/${qid}"><span class="ix">${ic('x', 's')}</span><span class="bd"><span class="t1">${esc(wTitle(qid))}</span><span class="t2"><small>${qref(q)}${fromTest(qid) && q.pat ? ' · از آزمونک' : ''}</small> · ${plain(q.t)}</span></span><span class="go">${ic('arl', 's')}</span></a>`;
}
/* wrong answers: header with the count and «حل همه», then up to four rows */
function weakPanel(w) {
  return `<section class="card weak">
    <div class="sec-t">${ic('retry')}<h2 class="h2">سوال‌های غلط</h2><span class="x">${fa(w.length)}</span><a class="lnk tap" href="#/q/${w[0]}">حل همه${ic('arl', 's')}</a></div>
    ${w.slice(0, 4).map(weakRow).join('')}
    ${w.length > 4 ? `<button class="lnk more tap" data-act="weak-sheet">${fa(w.length - 4)} سوال دیگر${ic('chl', 's')}</button>` : ''}</section>`;
}
function vHome() {
  const ts = timeState(), w = weak();
  return `<div class="view wrap home">
    ${tb('', 'امروز', undefined, jdate(TODAY, { w: 1 }))}
    <header class="ph"><h1>امروز</h1><span class="when">${jdate(TODAY, { w: 1 })}</span></header>
    ${regBanner(ts)}
    ${homeMap()}
    <div class="today ${w.length ? '' : 'one'}">${hero(heroModel())}${w.length ? weakPanel(w) : ''}</div>
    <a class="tips-row tap" href="#/exam">${ic('flag')}<span>راهکارهای جلسه کنکور</span>${ic('chl', 's')}</a>
  </div>`;
}
