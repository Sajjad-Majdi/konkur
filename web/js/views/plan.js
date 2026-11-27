/* views/plan: the plan to the exam — one status line (with the catch-up button when behind), the road (a dated vertical
   timeline of the phases with registration, buffer and the goal) and the month calendar of the days */
const WDS = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'];
const WD1 = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
const colOf = t => (new Date(t).getUTCDay() + 1) % 7;
function dayInfo(t) {
  const n = nOf(t), d = n >= 1 && n <= LP.length ? LP[n - 1] : null;
  const isT = t === TODAY, past = t < TODAY, done = d && dayDone(d);
  return { t, n, d, isT, past, done, miss: past && d && !d.soon && !done, buf: n > LP.length && t < EXAMD, exam: t === EXAMD, reg: t >= REG_S && t <= REG_E, pre: n < 1 };
}
/* one calendar day; `first` = the first day of its kind in this month (phase of a course without content, buffer,
   registration): only that day carries the label, the others just keep the tint */
function dayCell(t, first) {
  const x = dayInfo(t), d = x.d, ph = d ? PHASES[d.ph] : null, jd = jp(t)[2];
  const cls = ['dc', x.isT ? 'today' : '', x.done ? 'done' : '', x.miss ? 'miss' : '', x.pre ? 'pre' : '', x.buf ? 'buf' : '', x.exam ? 'exam' : '', d && d.soon ? 'soon' : '', x.reg ? 'reg' : ''].join(' ');
  const mark = x.done ? ic('check', 's') : x.isT ? '<em>امروز</em>' : x.miss ? '<i class="lagdot" title="عقب"></i>' : '';
  let body = '';
  if (d) {
    if (d.soon) body = first.soon ? `<div class="sn">${esc(ph.short)}<small>به‌زودی</small></div>` : '';
    else body = d.pats.map(id => `<div class="pt c-${PAT[id].c} ${!x.done && pst(id).done ? 'pd' : ''}">${!x.done && pst(id).done ? ic('check', 's') : ''}${esc(PAT[id].t)}</div>`).join('') + (d.text ? `<div class="tx">${esc(d.text)}</div>` : '');
  } else if (x.exam) body = `<div class="tx ex-d">${ic('flag', 's')}کنکور</div>`;
  else if (x.buf && first.buf) body = '<div class="sn">ذخیره</div>';
  if (x.reg && first.reg) body += '<div class="rg">ثبت‌نام</div>';
  const dots = d && !d.soon ? (d.pats.length ? d.pats.map(id => `<i class="c-${PAT[id].c} ${pst(id).done ? 'pd' : ''}"></i>`).join('') : '<i class="nt"></i>') : x.exam ? '<i class="exd"></i>' : '';
  const href = d && d.pats.length ? `#/p/${(d.pats.find(id => !pst(id).done) || d.pats[0])}` : d && d.tests ? `#/t/${d.tests[0]}` : '';
  const tag = href ? 'a' : 'div';
  return `<${tag} class="${cls} ${href ? 'tap' : ''}" ${href ? `href="${href}"` : ''} style="--pc:${ph && !ph.soon ? ph.bar : 'transparent'}"><div class="dn"><b>${fa(jd)}</b>${mark}</div><div class="dots">${dots}</div><div class="bd">${body}</div></${tag}>`;
}
function monthGrid(mi) {
  const MS = planMonths(), [y, m] = MS[mi], days = [];
  for (let t = Math.min(ymd(S.ps), planStart(), TODAY) - 40 * DAY; t <= EXAMD + 40 * DAY; t += DAY) { const j = jp(t); if (j[0] === y && j[1] === m) days.push(t); }
  const lead = colOf(days[0]), seen = {};
  const cells = days.map(t => {
    const x = dayInfo(t), f = {};
    if (x.d && x.d.soon) { const k = 'ph' + x.d.ph; f.soon = !seen[k]; seen[k] = 1; }
    if (x.buf) { f.buf = !seen.buf; seen.buf = 1; }
    if (x.reg) { f.reg = !seen.reg; seen.reg = 1; }
    return dayCell(t, f);
  }).join('');
  return `<div class="cal"><div class="cal-h">${WDS.map((w, i) => `<span><b class="lg">${w}</b><b class="sm">${WD1[i]}</b></span>`).join('')}</div>
    <div class="cal-g">${'<div class="dc void"></div>'.repeat(lead)}${cells}${'<div class="dc void"></div>'.repeat((7 - (lead + days.length) % 7) % 7)}</div></div>`;
}
/* the month index of a day in planMonths() */
function monthIdx(t) { const j = jp(t), MS = planMonths(); return Math.max(0, MS.findIndex(x => x[0] === j[0] && x[1] === j[1])); }
/* the road: a vertical timeline in date order, row height grows with the length of the phase */
function road(k) {
  const items = PHASES.map((ph, pi) => {
    const ds = LP.filter(d => d.ph === pi), dn = ds.filter(dayDone).length, cur = k >= ph.from && k <= ph.to;
    const done = !ph.soon && dn === ph.len, c1 = ph.courses.length === 1 ? 'c-' + ph.courses[0] : '';
    const prog = ph.soon ? 'به‌زودی' : done ? ic('check', 's') : `${fa(dn)} از ${fa(ph.len)} روز`;
    const f = cur ? (k - ph.from + .5) / ph.len : done ? 1 : 0, now = cur ? `<i class="now" style="--f:${f.toFixed(3)}"></i>` : '';
    return { t: dateOf(ph.from), html: `<button class="rd-i tap ${c1} ${ph.soon ? 'soon' : ''} ${ph.fin ? 'fin' : ''} ${done ? 'done' : ''} ${cur ? 'cur' : ''}" data-act="month" data-v="${monthIdx(dateOf(ph.from))}" style="--h:${Math.round(40 + ph.len * 1.7)}px;--f:${f.toFixed(3)}">
      <i class="nd">${done ? ic('check', 's') : ''}</i><span class="nm"><b>${esc(ph.name)}${cur ? '<i class="tdy">امروز</i>' : ''}</b><small>${spanFa(dateOf(ph.from), dateOf(ph.to))}</small></span><em>${prog}</em>${now}</button>` };
  });
  const ts = timeState();
  if (['before', 'open', 'last'].includes(ts.reg)) items.push({ t: REG_S + .5, html: `<button class="rd-x reg tap" data-act="month" data-v="${monthIdx(REG_S)}"><i class="nd"></i><span>ثبت‌نام ${spanFa(REG_S, REG_E)}</span></button>` });
  const buf = buffer();
  if (buf > 0) items.push({ t: lastDate() + DAY, html: `<button class="rd-x buf tap" data-act="month" data-v="${monthIdx(lastDate() + DAY)}"><i class="nd"></i><span>ذخیره ${fa(buf)} روز</span></button>` });
  items.sort((a, b) => a.t - b.t);
  return `<div class="road">${items.map(x => x.html).join('')}<div class="rd-x goal"><i class="nd">${ic('flag', 's')}</i><span>کنکور</span></div></div>`;
}
/* one status line: on track with the buffer, or behind with the catch-up button and what it does */
function planStatus(k) {
  const lag = missed().length, buf = buffer(), fin = finPhase();
  const cut = fin && fin.len < fin.full ? ` · جمع‌بندی ${fa(fin.len)} روز به جای ${fa(fin.full)} روز` : '';
  if (!lag) {
    const over = Math.max(0, -buf);
    return over ? `<div class="pstat lag"><span class="st"><i></i>${fa(over)} روز کمبود تا کنکور${cut}</span></div>`
      : `<div class="pstat ok"><span class="st"><i></i>طبق برنامه${buf > 0 ? ` · ${fa(buf)} روز ذخیره` : ''}${cut}</span></div>`;
  }
  /* calendar days from the first undone day to today: moving the plan this far makes today that day again */
  const need = Math.min(LP.length + 1, k) - missed()[0].n, sp = shiftPlan(need), parts = [];
  if (sp.fromBuf) parts.push(sp.fromBuf === sp.buf ? `همه ${fa(sp.buf)} روز ذخیره خرج می‌شود` : `ذخیره از ${fa(sp.buf)} به ${fa(sp.buf - sp.fromBuf)} روز می‌رسد`);
  if (sp.fromRev) parts.push(`${fa(sp.fromRev)} روز از جمع‌بندی کم می‌شود`);
  const leftW = LP.filter(d => d.n < Math.min(LP.length + 1, k) - sp.move && !d.soon && !dayDone(d)).length;
  if (sp.left) parts.push(sp.move ? `باز ${fa(leftW)} روز عقب می‌مانی و باید کنار کار هر روز جبرانش کنی` : 'ذخیره و جمع‌بندی جای بیشتری ندارند و این روزها را باید کنار کار هر روز جبران کنی');
  return `<div class="pstat lag"><span class="st"><i></i>${fa(lag)} روز عقبی</span>${sp.move ? `<button class="btn s ghost tap" data-act="shift" data-v="${need}">${fa(sp.move)} روز جلو ببر</button>` : ''}<small>${sp.move ? 'جلو بردن برنامه ' : ''}${parts.join(' و ')}</small></div>`;
}
function vPlan() {
  const k = todayN(), MS = planMonths();
  if (UI.month == null || UI.month >= MS.length) UI.month = monthIdx(TODAY);
  const mi = Math.max(0, Math.min(MS.length - 1, UI.month)), [y, m] = MS[mi];
  return `<div class="view wrap planv">${tb('', 'برنامه')}
    <header class="ph"><h1>برنامه</h1>${planStatus(k)}</header>
    <div class="pgrid2">
      <section class="rdc"><h2 class="h2">مسیر</h2>${road(k)}</section>
      <section class="calp">
        <div class="cal-nav"><button class="ibtn tap" data-act="month" data-v="${mi - 1}" ${mi ? '' : 'disabled'} aria-label="ماه قبل">${ic('chr')}</button><h2 class="h2">${JMON[m - 1]} ${fa(y)}</h2><button class="ibtn tap" data-act="month" data-v="${mi + 1}" ${mi < MS.length - 1 ? '' : 'disabled'} aria-label="ماه بعد">${ic('chl')}</button></div>
        ${monthGrid(mi)}
      </section>
    </div></div>`;
}
