/* views/exam: exam day — countdown and dates, three passes, pace, negative marking with the guess tool, traps, the 1406 structure */
function vExam() {
  const E = SITE.exam, ts = timeState();
  const regSt = ts.reg === 'before' ? `${fa(ts.toReg)} روز دیگر` : ts.reg === 'open' || ts.reg === 'last' ? 'باز است' : ts.reg === 'done' ? 'انجام شد' : 'تمام شد';
  const sp = GROUPS[0], ma = GROUPS[1], wS = sp.coef * sp.approxQuestions, wM = ma.coef * ma.approxQuestions;
  const exSt = ts.toExam > 0 ? `${fa(ts.toExam)} روز دیگر` : ts.toExam === 0 ? 'امروز' : 'برگزار شد';
  return `<div class="view wrap exv">${tb('', esc(E.title), themeBtn())}
    <header class="ph"><div><h1>${esc(E.title)}</h1><div class="muted" style="font-size:14px">${esc(E.subtitle)}</div></div></header>
    <div class="ex-top">
      <section class="card ex-cd"><div class="k">${ts.toExam === 0 ? 'امروز روز کنکور است' : `تا کنکور ${fa(EXAM.year)}`}</div><div class="n"><b>${fa(Math.max(0, ts.toExam))}</b><span>روز</span></div>
        <div class="dt">${esc(EXAM.days)} ${fa(EXAM.year)}</div><div class="nt">${esc(EXAM.dayNote)}</div>${timeline(ts)}</section>
      <section class="card dates">
        <div class="drow"><span>${ic('cal')}</span><span><div class="t1">${esc(E.dates.registration)}</div><div class="t2">${regRange()} ${fa(jp(REG_E)[0])}</div></span><span class="st ${ts.reg === 'after' || ts.reg === 'done' ? 'g' : ''}">${regSt}</span></div>
        <div class="drow"><span>${ic('flag')}</span><span><div class="t1">${esc(E.dates.exam)}</div><div class="t2">${esc(EXAM.days)} ${fa(EXAM.year)}</div></span><span class="st g">${exSt}</span></div>
        <div class="drow"><span>${ic('clock')}</span><span><div class="t1">${fa(EXAM.questions)} سوال در ${fa(EXAM.minutes)} دقیقه</div><div class="t2">${esc(EXAM.estimate)}</div></span><span></span></div>
        ${ts.reg === 'open' || ts.reg === 'last' ? `<a class="btn amber tap" style="margin:4px 0 12px" href="${esc(EXAM.registration.url)}" target="_blank" rel="noopener" data-act="reg-link">ثبت‌نام در سنجش ${ic('ext', 's')}</a>` : ''}
        <div class="src">${E.dates.note}</div></section>
    </div>
    <div class="ex-mid">
      <section class="card passes"><div class="sec-t"><h2 class="h2">${esc(E.passes.title)}</h2></div>
        ${E.passes.items.map((x, i) => `<div class="pass"><span class="pn">${fa(i + 1)}</span><span><b>${esc(x[0])}</b><span>${esc(x[1])}</span></span></div>`).join('')}
        <ul class="facts-l">${E.passes.facts.map(x => `<li>${rich(x)}</li>`).join('')}</ul></section>
      <section class="card pace"><div class="sec-t" style="margin:0"><h2 class="h2">${esc(E.pace.title)}</h2></div>
        <div class="pace-n">${E.pace.cards.slice().reverse().map((x, i) => `<div class="${i === 0 ? 'main' : ''}"><b>${fa(x.min)}<small>دقیقه</small> ${fa(x.sec)}<small>ثانیه</small></b><span>${x.text}</span></div>`).join('')}</div>
        <ul class="facts-l">${E.pace.facts.map(x => `<li>${rich(x)}</li>`).join('')}</ul></section>
    </div>
    <div class="ex-mid">
      <section class="card neg"><div class="sec-t" style="margin:0"><h2 class="h2">${esc(E.negative.title)}</h2></div>
        <div class="fm">${rich(E.negative.formula)}<div class="d">${rich(E.negative.desc)}</div></div>${E.negative.tool ? `<div class="wg" data-w="${E.negative.tool}"></div>` : ''}</section>
      <section class="card traps"><div class="sec-t"><h2 class="h2">${esc(E.traps.title)}</h2></div><ul>${E.traps.items.map(x => `<li>${ic('alert', 's')}<span>${rich(x)}</span></li>`).join('')}</ul></section>
    </div>
    <section class="card struct"><div class="sec-t"><h2 class="h2">${esc(E.structure.title)}</h2><span class="x">${esc(EXAM.sameForAllTracks)}</span></div>
      <div class="wbar"><div class="sp" style="flex:${wS}"><b>${esc(sp.name)} · ضریب ${fa(sp.coef)}</b><span>حدود ${fa(sp.approxQuestions)} سوال</span></div><div class="ma" style="flex:${wM}"><b>${esc(ma.name)} · ضریب ${fa(ma.coef)}</b><span>حدود ${fa(ma.approxQuestions)} سوال</span></div></div>
      <div class="sgrid" style="grid-template-columns:${wS}fr ${wM}fr">${GROUPS.map(g => `<ul>${COURSES.filter(c => c.group === g.id).map(c => `<li class="${c.hasContent ? 'has' : ''}">${c.hasContent ? `<i class="dot c-${c.id}"></i>` : ''}${esc(c.official || c.name)}</li>`).join('')}</ul>`).join('')}</div>
      <div class="foot"><span><b style="color:var(--ink-2)">${esc(E.structure.removedLabel)}</b> ${EXAM.removed.map(x => `<s>${esc(x)}</s>`).join(' · ')}</span><span>${esc(EXAM.estimate)}</span><span>منبع ${EXAM.source}</span></div></section>
  </div>`;
}
