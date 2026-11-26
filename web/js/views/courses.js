/* views/courses: list of all exam courses (grouped by coefficient) and the page of one course */
function vCourses() {
  const grp = g => {
    const cs = COURSES.filter(c => c.group === g.id), act = cs.filter(c => c.hasContent), soon = cs.filter(c => !c.hasContent);
    return `<section class="cl-grp"><div class="gh"><b>${esc(g.name)}</b><span>ضریب ${fa(g.coef)} · حدود ${fa(g.approxQuestions)} سوال</span></div>
      ${act.length ? `<div class="clist">${act.map(c => {
        const s = cst(c.id), nx = s.next ? PAT[s.next] : null;
        return `<a class="card cbig tap c-${c.id}" href="#/c/${c.id}"><div class="r1">${ring(s.done / s.n, 34, 4)}<b>${esc(c.name)}</b><span class="ct">${fa(s.done)} از ${fa(s.n)} الگو</span></div>${segbar(c.id)}
          <div class="r3"><span>${nx ? 'بعدی ' + esc(nx.t) : 'همه الگوها تمام شد'}</span><span>${s.left ? hours(s.left) + ' مانده' : 'تمام'}</span></div></a>`;
      }).join('')}</div>` : ''}
      ${soon.length ? `<div class="csoon" style="margin-top:${act.length ? 14 : 0}px">${soon.map(c => `<div><span class="o">${fa(COURSES.indexOf(c) + 1)}</span>${esc(c.name)}<small>به‌زودی</small></div>`).join('')}</div>` : ''}</section>`;
  };
  return `<div class="view wrap">${tb('', 'درس‌ها', themeBtn())}
    <header class="ph"><div><h1>درس‌ها</h1><div class="muted" style="font-size:14px">${esc(EXAM.field)} · کنکور ${fa(EXAM.year)}</div></div></header>
    ${GROUPS.map(grp).join('')}
    <div class="removed"><b style="color:var(--ink-2)">${esc(SITE.exam.structure.removedLabel)}</b>${EXAM.removed.map(x => `<s>${esc(x)}</s>`).join('')}</div></div>`;
}
function lastTest(c) { const t = S.test[c]; return t && Array.isArray(t.h) && t.h.length ? t.h[t.h.length - 1] : (t && typeof t.last === 'number' ? { pct: t.last, t: t.at ? isoOf(t.at) : null } : null); }
const testPct = r => r.pct != null ? r.pct : (3 * r.c - r.w) / (3 * r.n) * 100;
function vCourse(r) {
  const c = COURSE[r.cid], s = cst(c.id), list = byRank(c.id), g = GROUPS.find(x => x.id === c.group);
  const ids = SELFTEST[c.id] || [], n = ids.length, last = lastTest(c.id);
  const nx = s.next ? PAT[s.next] : null, nxs = nx ? pst(nx.id) : null;
  const rows = list.map((id, i) => {
    const p = PAT[id], ps = pst(id), cur = id === s.next;
    const wrong = p.pr.filter(q => answered(q) && !firstOk(q) && !fixedQ(q)).length;
    const stt = ps.done ? (wrong ? `<span class="st bad">${ic('x', 's')}${fa(wrong)} غلط</span>` : `<span class="st ok">${ic('check', 's')}${fa(ps.right)} از ${fa(ps.tot)} درست</span>`)
      : cur ? `<span class="st cur">${ps.started ? 'ادامه' : 'شروع'} ${ic('arl', 's')}</span>` : ps.started ? `<span class="st">${STG[ps.stage]}</span>` : '<span class="st"></span>';
    return `<a class="prow2 tap ${ps.done ? 'done' : ''} ${cur ? 'cur' : ''}" href="#/p/${id}">
      <span class="o">${ps.done ? ic('check', 's') : fa(i + 1)}</span>
      <span><span class="tt">${esc(p.t)}</span><div class="en">${esc(p.en)}</div>${p.w && TOOLNAME[p.w] ? `<div class="meta" style="font-size:12.5px;margin-top:2px"><span>${ic('tool', 's')}${TOOLNAME[p.w]}</span></div>` : ''}</span>
      <span class="fq">${freq(p)}${p.rank.repeat.includes('از') ? `<span>${esc(p.rank.repeat)} کنکور</span>` : ''}</span>
      <span class="hr">${hours(p.rank.hours)}</span>${stt}</a>`;
  }).join('');
  const cw = weak().filter(q => Q[q].c === c.id);
  const tday = LP.find(d => d.tests && d.tests.includes(c.id));
  return `<div class="view wrap c-${c.id}">${tb('#/courses', esc(c.name))}
    <section class="card c-head">
      <div class="rn">${ring(s.done / s.n, 76, 7).replace('class="ring"', 'class="ring big-ring"')}<b>${fa(s.done)}<small style="font-size:12px;color:var(--ink-3);font-weight:500">&nbsp;از ${fa(s.n)}</small></b></div>
      <div><nav class="crumb"><a href="#/courses">درس‌ها</a>${ic('chl')}<span>${esc(g.name)}</span></nav><h1 style="font-size:28px;font-weight:800;line-height:1.3">${esc(c.name)}</h1><div class="en muted" style="font-size:13.5px;text-align:right">${esc(c.en || '')}</div></div>
      <div class="facts"><div class="fact"><b>ضریب ${fa(g.coef)}</b><span>${esc(g.name)}</span></div>${c.approxQ ? `<div class="fact"><b>حدود ${fa(c.approxQ)}</b><span>سوال در کنکور</span></div>` : `<div class="fact"><b>${fa(s.n)} الگو</b><span>${fa(s.done)} انجام شده</span></div>`}<div class="fact"><b>${s.left ? hours(s.left) : 'تمام'}</b><span>${s.left ? 'مانده از ' + hours(s.hrs) : 'همه الگوها'}</span></div></div>
      ${nx ? `<a class="btn l tap" href="#/p/${nx.id}${nxs.started ? '/' + nxs.stage : ''}">${nxs.started ? 'ادامه' : 'شروع'} · ${esc(nx.t)}${ic('arl', 's')}</a>` : ''}
    </section>
    <div class="cgrid">
      <section class="panel plist">${rows}</section>
      <aside class="cside">
        ${n ? `<section class="card tcard"><h3>آزمونک ${esc(cShort(c.id))}</h3>
          <div class="tm"><span>${ic('list', 's')}${fa(n)} سوال</span><span>${ic('clock', 's')}${fa(Math.round(n * SEC_PER_Q / 6) / 10)} دقیقه</span><span>نمره منفی</span></div>
          <a class="btn soft tap" href="#/t/${c.id}">${ic('play', 's')}${last ? 'آزمونک دوباره' : 'شروع آزمونک'}</a>
          <div class="last">${last ? `آخرین نمره ${pctFa(testPct(last))}${last.t ? ' · ' + jdate(ymd(last.t)) : ''}${last.a ? ` · <a href="#/t/${c.id}/r" style="text-decoration:underline">نتیجه</a>` : ''}` : tday ? `در برنامه ${jdate(dateOf(tday.n), { w: 1 })}` : ''}</div></section>` : ''}
        ${cw.length ? `<section class="panel weak" style="padding:14px 6px 6px"><div class="sec-t" style="padding:0 12px">${ic('retry')}<h2 class="h2" style="font-size:15px">سوال‌های غلط این درس</h2></div>${cw.map(q => { const qq = Q[q]; return `<a class="wrow tap" href="#/q/${q}"><span class="ix">${ic('x', 's')}</span><span class="bd"><span class="t1" style="font-size:13.5px">${esc(wTitle(q))}</span><span class="t2">${qref(qq)}</span></span></a>`; }).join('')}</section>` : ''}
      </aside>
    </div></div>`;
}
