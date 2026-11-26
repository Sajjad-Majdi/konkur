/* views/plan: the plan to the exam — today's list with catch-up, plan health, the road of phases, the month calendar */
function monthGrid(mi) {
  const MS = planMonths(), [y, m] = MS[mi], days = [];
  for (let t = Math.min(ymd(S.ps), planStart(), TODAY) - 40 * DAY; t <= EXAMD + 40 * DAY; t += DAY) { const j = jp(t); if (j[0] === y && j[1] === m) days.push(t); }
  const lead = colOf(days[0]);
  return `<div class="cal"><div class="cal-h">${WDS.map((w, i) => `<span><b class="lg">${w}</b><b class="sm">${WD1[i]}</b></span>`).join('')}</div>
    <div class="cal-g">${'<div class="dc void"></div>'.repeat(lead)}${days.map(t => dayCell(t, 'month')).join('')}${'<div class="dc void"></div>'.repeat((7 - (lead + days.length) % 7) % 7)}</div></div>`;
}
function road() {
  const a = Math.min(ymd(S.ps), planStart(), TODAY), total = dd(a, EXAMD) + 1, pct = t => (dd(a, t) / total * 100).toFixed(2);
  const k = todayN();
  const segs = PHASES.map((ph, pi) => {
    const ds = LP.filter(d => d.ph === pi), dn = ds.filter(dayDone).length, cur = k >= ph.from && k <= ph.to;
    return `<div class="rs ${ph.soon ? 'ph-soon' : ''} ${cur ? 'cur' : ''}" style="--pc:${ph.bar};inset-inline-start:${pct(dateOf(ph.from))}%;width:${(ph.len / total * 100).toFixed(2)}%" title="${esc(ph.name)} · ${jdate(dateOf(ph.from))} تا ${jdate(dateOf(ph.to))}">${!ph.soon ? `<i class="fill" style="width:${(dn / ph.len * 100).toFixed(1)}%"></i>` : ''}<span>${esc(ph.short)}</span></div>`;
  }).join('');
  const bS = lastDate() + DAY, buf = buffer();
  const bufSeg = buf > 0 ? `<div class="rs ph-buf" style="inset-inline-start:${pct(bS)}%;width:${(buf / total * 100).toFixed(2)}%" title="${fa(buf)} روز ذخیره"><span>ذخیره</span></div>` : '';
  let mos = '';
  for (let t = a; t <= EXAMD; t += DAY) { const j = jp(t); if (j[2] === 1) mos += `<span class="rm" style="inset-inline-start:${pct(t)}%">${JMON[j[1] - 1]}</span>`; }
  const now = TODAY >= a && TODAY <= EXAMD ? `<i class="rnow" style="inset-inline-start:${pct(TODAY)}%"><b>امروز</b></i>` : '';
  return `<div class="road"><div class="rtrack">${segs}${bufSeg}
      <i class="rreg" style="inset-inline-start:${pct(REG_S)}%;width:${((dd(REG_S, REG_E) + 1) / total * 100).toFixed(2)}%" title="ثبت‌نام"></i>
      ${now}<span class="rend">${ic('flag', 's')}</span></div>
    <div class="rmo">${mos}</div></div>
    <div class="plist2">${PHASES.map((ph, pi) => { const dn = LP.filter(d => d.ph === pi && dayDone(d)).length, cur = k >= ph.from && k <= ph.to;
      return `<div class="pl ${cur ? 'cur' : ''} ${ph.soon ? 'soon' : ''}"><i style="--pc:${ph.bar}"></i><span><b>${esc(ph.short)}</b><small>${jdate(dateOf(ph.from))} تا ${jdate(dateOf(ph.to))}</small></span><em>${ph.soon ? 'به‌زودی' : dn === ph.len ? ic('check', 's') : `${fa(dn)} از ${fa(ph.len)}`}</em></div>`; }).join('')}</div>`;
}
function todayList() {
  const k = todayN(), today = k >= 1 && k <= LP.length ? LP[k - 1] : null, miss = missed();
  let first = true;
  const prim = () => { const f = first; first = false; return f; };
  const row = (d, late) => {
    if (d.soon) return `<div class="tl-row"><span class="ix soonx">${ic('book', 's')}</span><span class="bd"><b>${esc(PHASES[d.ph].name)}</b><small>محتوای این درس به‌زودی</small></span></div>`;
    if (!d.pats.length) return `<div class="tl-row ${dayDone(d) ? 'ok' : ''}"><span class="ix">${dayDone(d) ? ic('check', 's') : ic('list', 's')}</span><span class="bd"><b>${esc(d.text)}</b>${late ? `<small class="late">${jdate(dateOf(d.n), { w: 1 })}</small>` : ''}</span>${dayDone(d) ? '' : `<span class="acts">${testBtns(d, 'btn s ghost tap')}<button class="btn s ${prim() ? '' : 'ghost'} tap" data-act="text-done" data-d="${d.id}">انجام شد</button></span>`}</div>`;
    return d.pats.map(id => {
      const p = PAT[id], s = pst(id);
      return `<a class="tl-row tap c-${p.c} ${s.done ? 'ok' : ''}" href="#/p/${id}${s.started && !s.done ? '/' + s.stage : ''}"><span class="ix">${s.done ? ic('check', 's') : '<i class="dot"></i>'}</span><span class="bd"><b>${esc(p.t)}</b><small>${late ? `<span class="late">${jdate(dateOf(d.n), { w: 1 })}</span> · ` : ''}${esc(cShort(p.c))} · ${s.done ? 'تمام' : s.started ? STG[s.stage] : hours(p.rank.hours)}</small></span>${s.done ? '' : `<span class="go ${prim() ? 'btn s' : ''}">${s.started ? 'ادامه' : 'شروع'}${ic('arl', 's')}</span>`}</a>`;
    }).join('');
  };
  const lateRows = miss.filter(d => d.n < k).map(d => row(d, true)).join('');
  return `${lateRows ? `<div class="tl-sec late">عقب‌مانده</div>${lateRows}<div class="tl-sec">امروز</div>` : ''}${today ? row(today, false) : `<div class="tl-row"><span class="bd"><b>${k > LP.length ? 'روزهای ذخیره پیش از کنکور' : 'برنامه هنوز شروع نشده'}</b>${k < 1 ? `<small>شروع ${jdate(planStart(), { w: 1 })}</small>` : ''}</span></div>`}`;
}
function vPlan() {
  const k = todayN(), lag = missed().length, buf = buffer();
  const pi = phaseOf(k), ph = PHASES[pi], nxp = PHASES[pi + 1];
  const doneDays = LP.filter(dayDone).length, pd = RANK.filter(id => pst(id).done).length;
  const MS = planMonths();
  if (UI.month == null || UI.month >= MS.length) { const j = jp(TODAY); UI.month = Math.max(0, MS.findIndex(x => x[0] === j[0] && x[1] === j[1])); }
  /* calendar days from the first undone day to today: moving the plan this far makes today that day again */
  const need = lag ? Math.min(LP.length + 1, k) - missed()[0].n : 0;
  const sp = lag ? shiftPlan(need) : null, fin = finPhase();
  let how = '';
  if (sp) {
    const parts = [];
    if (sp.fromBuf) parts.push(sp.fromBuf === sp.buf ? `همه ${fa(sp.buf)} روز ذخیره خرج می‌شود` : `ذخیره از ${fa(sp.buf)} به ${fa(sp.buf - sp.fromBuf)} روز می‌رسد`);
    if (sp.fromRev) parts.push(`${fa(sp.fromRev)} روز از جمع‌بندی کم می‌شود`);
    const leftW = LP.filter(d => d.n < Math.min(LP.length + 1, k) - sp.move && !d.soon && !dayDone(d)).length;
    if (sp.left) parts.push(sp.move ? `باز ${fa(leftW)} روز عقب می‌مانی و باید کنار کار هر روز جبرانش کنی` : 'ذخیره و جمع‌بندی جای بیشتری ندارند و این روزها را باید کنار کار هر روز جبران کنی');
    how = parts.join(' و ');
  }
  const catchup = lag ? `<div class="catch"><span class="cx">${ic('alert')}</span><span class="bd"><b>${fa(lag)} روز از برنامه عقبی</b><small>${sp.move ? `جلو بردن برنامه ${how}` : how}</small></span>${sp.move ? `<button class="btn s ghost tap" data-act="shift" data-v="${need}">${fa(sp.move)} روز جلو ببر</button>` : ''}</div>` : '';
  const over = Math.max(0, -buf), stCls = lag || over ? 'lag' : 'ok';
  const stTxt = lag ? `${fa(lag)} روز عقب` : over ? `${fa(over)} روز کمبود تا کنکور` : 'طبق برنامه';
  return `<div class="view wrap planv">${tb('', 'برنامه تا کنکور', themeBtn())}
    <header class="ph"><div><h1>برنامه تا کنکور</h1><div class="muted" style="font-size:14px">${jdate(planStart(), { y: 1 })} تا ${jdate(EXAMD, { y: 1 })} · ${fa(PHASES.length)} مرحله و همه درس‌ها</div></div></header>
    <div class="plan-top">
      <section class="card today-c">
        <div class="tc-h"><span class="k">امروز</span><b>${jdate(TODAY, { w: 1 })}</b><span class="x">${k >= 1 && k <= LP.length ? `روز ${fa(k)} از ${fa(LP.length)}` : ''}</span></div>
        ${catchup}
        <div class="tl-list">${todayList()}</div>
      </section>
      <section class="panel health">
        <div class="hs ${stCls}"><i></i><b>${stTxt}</b></div>
        <div class="hmx"><div><b>${fa(Math.max(0, buf))}</b><span>روز ذخیره</span></div><div><b>${fa(doneDays)}<small> از ${fa(LP.filter(d => !d.soon).length)}</small></b><span>روز انجام شده</span></div><div><b>${fa(pd)}<small> از ${fa(RANK.length)}</small></b><span>الگو تمام شده</span></div></div>
        <div class="hnx">پایان برنامه ${jdate(lastDate(), { w: 1 })}${fin && fin.len < fin.full ? ` · جمع‌بندی ${fa(fin.len)} روز به جای ${fa(fin.full)} روز` : ''}</div>
      </section>
    </div>
    <section class="card roadc">
      <div class="sec-t"><h2 class="h2">مسیر تا کنکور</h2><span class="x">مرحله ${fa(pi + 1)} از ${fa(PHASES.length)} · ${esc(ph.short)}${nxp ? ` · بعدی ${esc(nxp.short)} از ${jdate(dateOf(nxp.from))}` : ''}</span></div>
      ${road()}
    </section>
    <section class="panel calp">
      <div class="plan-h"><h2 class="h2">تقویم</h2><div class="seg mseg">${MS.map((x, i) => `<button class="tap ${i === UI.month ? 'on' : ''}" data-act="month" data-v="${i}">${JMON[x[1] - 1]}</button>`).join('')}</div></div>
      ${monthGrid(UI.month)}
    </section></div>`;
}
