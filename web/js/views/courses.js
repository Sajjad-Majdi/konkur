/* views/courses: every exam course under the 1406 weight bar (coefficient and questions per group), and one course */
/* plan dates of a course, «۶ تا ۱۳ آذر» ('' without plan days) */
function courseWhen(c) { const s = courseSpan(c); return s ? spanFa(dateOf(s.from), dateOf(s.to)) : ''; }
function vCourses() {
  const byPlan = coursesByPlan();
  const col = g => {
    const cs = byPlan.filter(c => c.group === g.id), act = cs.filter(c => c.hasContent), soon = cs.filter(c => !c.hasContent), w = g.coef * g.approxQuestions;
    return `<section class="cg ${g.id}" style="--w:${w}">
      <div class="wseg"><i style="--p:${(w / GROUPS.reduce((a, x) => a + x.coef * x.approxQuestions, 0) * 100).toFixed(1)}%"></i></div>
      <div class="glbl"><b>${esc(g.name)}</b> · ضریب ${fa(g.coef)} · حدود ${fa(g.approxQuestions)} سوال</div>
      ${act.length ? `<div class="clist">${act.map(c => {
        const s = cst(c.id), nx = s.next ? PAT[s.next] : null;
        return `<a class="card cbig tap c-${c.id}" href="#/c/${c.id}"><div class="r1"><i class="dot"></i><b>${esc(c.name)}</b><span class="ct">${fa(s.done)} از ${fa(s.n)} الگو</span></div>${segbar(c.id)}
          <div class="r3"><span class="nx">${nx ? 'بعدی ' + esc(nx.t) : 'همه الگوها تمام شد'}</span><span>${s.left ? hours(s.left) + ' مانده' : 'تمام'}</span></div><div class="when">${ic('cal', 's')}${courseWhen(c.id)}</div></a>`;
      }).join('')}</div>` : ''}
      ${soon.length ? `<div class="chips"><span class="k">به‌زودی</span>${soon.map(c => `<span class="chip">${esc(c.name)}<small class="when">${courseWhen(c.id)}</small></span>`).join('')}</div>` : ''}</section>`;
  };
  return `<div class="view wrap crsv">${tb('', 'درس‌ها')}
    <header class="ph"><h1>درس‌ها</h1></header>
    <div class="cgrid2" style="grid-template-columns:${GROUPS.map((g, i) => i ? `minmax(210px,${g.coef * g.approxQuestions}fr)` : `minmax(0,${g.coef * g.approxQuestions}fr)`).join(' ')}">${GROUPS.map(col).join('')}</div>
    <p class="removed"><span><b>${esc(SITE.exam.structure.removedLabel)}</b> ${EXAM.removed.map(x => `<s>${esc(x)}</s>`).join(' · ')}</span><span>${esc(EXAM.sameForAllTracks)} · منبع ${EXAM.source}</span></p></div>`;
}
function lastTest(c) { const t = S.test[c]; return t && Array.isArray(t.h) && t.h.length ? t.h[t.h.length - 1] : (t && typeof t.last === 'number' ? { pct: t.last, t: t.at ? isoOf(t.at) : null } : null); }
const testPct = r => r.pct != null ? r.pct : (3 * r.c - r.w) / (3 * r.n) * 100;
function vCourse(r) {
  const c = COURSE[r.cid], s = cst(c.id), list = byRank(c.id);
  const ids = SELFTEST[c.id] || [], n = ids.length, last = lastTest(c.id);
  const nx = s.next ? PAT[s.next] : null, nxs = nx ? pst(nx.id) : null;
  const rows = list.map((id, i) => {
    const p = PAT[id], ps = pst(id), cur = id === s.next;
    const wrong = p.pr.filter(q => answered(q) && !firstOk(q) && !fixedQ(q)).length;
    const stt = ps.done ? (wrong ? `<span class="st bad">${ic('x', 's')}${fa(wrong)} غلط</span>` : `<span class="st ok">${ic('check', 's')}${fa(ps.right)} از ${fa(ps.tot)} درست</span>`)
      : ps.started ? `<span class="st ${cur ? 'cur' : ''}">${STG[ps.stage]}</span>` : '<span class="st"></span>';
    return `<a class="prow2 tap ${ps.done ? 'done' : ''} ${cur ? 'cur' : ''}" href="#/p/${id}${cur && ps.started ? '/' + ps.stage : ''}">
      <span class="o">${ps.done ? ic('check', 's') : fa(i + 1)}</span>
      <span class="tt-w"><span class="tt">${esc(p.t)}</span><span class="en">${esc(p.en)}</span>${p.w && TOOLNAME[p.w] ? `<span class="tl">${ic('tool', 's')}${TOOLNAME[p.w]}</span>` : ''}</span>
      <span class="fq">${freq(p)}</span><span class="hrs">${hours(p.rank.hours)}</span>${stt}</a>`;
  }).join('');
  const cw = weak().filter(q => Q[q].c === c.id);
  const tday = LP.find(d => d.tests && d.tests.includes(c.id));
  /* phone top bar names where back goes, the course name is the h1 of the header card right below */
  return `<div class="view wrap c-${c.id}">${tb('#/courses', 'درس‌ها')}
    <section class="card c-head">
      <div class="rn">${ring(s.done / s.n, 76, 7).replace('class="ring"', 'class="ring big-ring"')}<b>${fa(s.done)}<small>از ${fa(s.n)}</small></b></div>
      <div class="nm"><nav class="crumb"><a href="#/courses">درس‌ها</a>${ic('chl')}</nav><h1>${esc(c.name)}</h1><div class="en">${esc(c.en || '')}</div>
        <div class="left">${ic('clock', 's')}${s.left ? `${hours(s.left)} مانده از ${fa(s.hrs)}` : 'همه الگوها تمام شد'}</div></div>
      ${nx ? `<a class="btn l tap" href="#/p/${nx.id}${nxs.started ? '/' + nxs.stage : ''}">${nxs.started ? 'ادامه' : 'شروع'} · ${esc(nx.t)}${ic('arl', 's')}</a>` : ''}
    </section>
    <div class="cgrid">
      <section class="plist">${rows}</section>
      <aside class="cside">
        ${n ? `<section class="card tcard"><h3>آزمونک ${esc(cShort(c.id))}</h3>
          <div class="tm"><span>${ic('list', 's')}${fa(n)} سوال</span><span>${ic('clock', 's')}${fa(Math.round(n * SEC_PER_Q / 6) / 10)} دقیقه</span><span>نمره منفی</span></div>
          <a class="btn soft tap" href="#/t/${c.id}">${ic('play', 's')}${last ? 'آزمونک دوباره' : 'شروع آزمونک'}</a>
          <div class="last">${last ? `آخرین نمره ${pctFa(testPct(last))}${last.t ? ' · ' + jdate(ymd(last.t)) : ''}${last.a ? ` · <a href="#/t/${c.id}/r">نتیجه</a>` : ''}` : tday ? `در برنامه ${jdate(dateOf(tday.n), { w: 1 })}` : ''}</div></section>` : ''}
        ${cw.length ? `<section class="card weak sm"><div class="sec-t">${ic('retry')}<h2 class="h2">سوال‌های غلط این درس</h2><span class="x">${fa(cw.length)}</span></div>${cw.map(q => { const qq = Q[q]; return `<a class="wrow tap" href="#/q/${q}"><span class="ix">${ic('x', 's')}</span><span class="bd"><span class="t1">${esc(wTitle(q))}</span><span class="t2">${qref(qq)}</span></span></a>`; }).join('')}</section>` : ''}
      </aside>
    </div></div>`;
}
