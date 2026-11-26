/* views/pattern: one pattern — refresher, method (pinned on desktop, inline on phone), table, tool, worked example, practice list */
function vPattern(r) {
  const p = PAT[r.pid], s = pst(p.id), c = COURSE[p.c], list = byRank(p.c), pos = list.indexOf(p.id);
  const exq = Q[p.ex], col = !!S.rv[p.id], rv = p.rv || [];
  const nextId = RANK[RANK.indexOf(p.id) + 1], np = nextId ? PAT[nextId] : null;
  const prRows = p.pr.map((qid, i) => {
    const q = Q[qid], m = ansMark(qid);
    return `<a class="pr-row tap" href="#/p/${p.id}/q/${i}"><span class="si ${m}">${m ? ic(m === 'ok' ? 'check' : 'x', 's') : fa(i + 1)}</span><span class="bd"><span class="t1">${qref(q)}</span><div class="t2">${plain(q.t)}</div></span><span class="go">${m ? (m === 'ok' ? 'دیدن دوباره' : 'دوباره حل کن') : 'حل کن'}</span></a>`;
  }).join('');
  const firstOpen = p.pr.findIndex(q => !answered(q));
  const wrongIdx = p.pr.findIndex(q => ansMark(q) === 'bad');
  const cta = firstOpen >= 0 ? `<a class="btn l tap" href="#/p/${p.id}/q/${firstOpen}">${s.ans ? 'ادامه تمرین' : 'شروع تمرین'} · ${fa(p.pr.length)} سوال${ic('arl', 's')}</a>`
    : wrongIdx >= 0 ? `<a class="btn l tap" href="#/q/${p.pr[wrongIdx]}">${ic('retry', 's')}دوباره حل کردن سوال غلط</a>` : '';
  const tab = (k, n, lbl, done, extra = '') => `<button class="stab tap ${done ? 'done' : ''} ${extra}" data-act="goto" data-sec="${k}"><span class="b">${done ? ic('check', 's') : n}</span>${lbl}</button>`;
  const prDone = s.ans === s.tot;
  const nTxt = rv.filter(b => b.type === 'text').length, nFig = rv.length - nTxt;
  return `<div class="view c-${p.c}">${tb('#/c/' + p.c, esc(p.t))}
    <div class="pgrid">
      <div>
        <nav class="crumb"><a href="#/c/${p.c}">${esc(c.name)}</a>${ic('chl')}<span>الگوی ${fa(pos + 1)} از ${fa(list.length)}</span></nav>
        <header class="p-head"><h1>${esc(p.t)}</h1><div class="en">${esc(p.en)}</div>
          <div class="meta"><span>${freq(p)}${esc(p.f)}</span><span>${ic('clock', 's')}${hours(p.rank.hours)}</span><span>${ic('list', 's')}${fa(1 + p.pr.length)} سوال واقعی</span></div></header>
        <nav class="stabs" aria-label="بخش‌ها">${tab('read', '۱', 'یادآوری', s.read)}${tab('method', ic('bolt', 's'), 'روش', false, 'mob')}${tab('ex', '۲', 'مثال حل‌شده', s.ex)}${tab('pr', '۳', `تمرین ${fa(s.ans)} از ${fa(s.tot)}`, prDone)}</nav>

        <section class="sec ${col ? 'collapsed' : ''}" id="s-read">
          <div class="sec-hd"><span class="n ${s.read ? '' : 'todo'}">${s.read ? ic('check', 's') : '۱'}</span><h2>یادآوری</h2><span class="x">${s.read ? 'خوانده شد' : ''}${rv.length ? `<button class="lnk tap" data-act="collapse">${col ? 'باز کردن' : 'بستن'}${ic('chd', 's')}</button>` : ''}</span></div>
          ${rv.length ? `<div class="collapsed-bar">${ic('book', 's')}${fa(nTxt)} بخش${nFig ? ` و ${fa(nFig)} شکل` : ''}<button class="lnk tap" data-act="collapse" style="margin-inline-start:auto">باز کردن</button></div>
          <div class="paper">${rv.map(block).join('')}</div>` : ''}
          <div class="read-f">${s.read ? `<button class="btn ghost tap" data-act="goto" data-sec="ex">برو به مثال حل‌شده${ic('arl', 's')}</button>` : `<button class="btn tap" data-act="read-done">${ic('check', 's')}خواندم · برو به مثال</button>`}</div>
        </section>

        ${methodCard(p, 'inline', 'id="s-method"')}
        ${p.tbl && TABLES[p.tbl] ? `<section class="sec"><div class="sec-hd"><span class="n" style="background:var(--sunken);color:var(--ink-2)">${ic('grid', 's')}</span><h2>جدول مقایسه</h2></div>${TABLES[p.tbl]()}</section>` : ''}
        ${p.w ? `<section class="sec"><div class="card tool"><div class="wg" data-w="${p.w}"></div></div></section>` : ''}

        <section class="sec" id="s-ex">
          <div class="sec-hd"><span class="n ${s.ex ? '' : 'todo'}">${s.ex ? ic('check', 's') : '۲'}</span><h2>مثال حل‌شده</h2><span class="x">${qref(exq)}</span></div>
          <div class="card qc"><div class="qmeta"><span class="src">${SRCN[exq.src] || ''}</span></div><div class="qtext">${rich(exq.t)}</div>${qFig(exq)}${optsStatic(exq)}${stepsHtml(exq, exq.s.length)}</div>
          <div class="read-f">${s.ex ? '' : `<button class="btn tap" data-act="ex-done">${ic('check', 's')}فهمیدم · برو به تمرین</button>`}</div>
        </section>

        <section class="sec" id="s-pr">
          <div class="sec-hd"><span class="n ${prDone ? '' : 'todo'}">${prDone ? ic('check', 's') : '۳'}</span><h2>تمرین</h2><span class="x">${s.ans ? `${fa(s.right)} از ${fa(s.ans)} درست در بار اول` : `${fa(s.tot)} سوال برای حل خودت`}</span></div>
          <div class="panel pr-list">${prRows}</div>
          ${cta ? `<div class="read-f">${cta}</div>` : ''}
        </section>
        ${np ? `<a class="card nextp tap c-${np.c}" href="#/p/${np.id}"><span><span class="k">الگوی بعدی در برنامه · ${esc(cShort(np.c))}</span><b>${esc(np.t)}</b></span>${ic('arl', 'l')}</a>` : ''}
      </div>
      ${methodCard(p, 'side-only')}
    </div></div>`;
}
function vPdone(r) {
  const p = PAT[r.pid], s = pst(p.id), m = heroModel();
  const nextToday = (m.kind === 'go' || m.kind === 'start') && m.pid !== p.id ? PAT[m.pid] : null;
  const wrong = p.pr.filter(q => ansMark(q) === 'bad');
  const cs = cst(p.c);
  return `<div class="view c-${p.c}">${tb(`#/p/${p.id}`, esc(p.t))}
    <div style="max-width:600px;margin:9vh auto 0"><section class="card done-card">
      <div class="big">${ic('check', 'l')}</div>
      <div class="muted" style="font-size:13px;font-weight:700">${s.done ? 'الگو تمام شد' : 'تمرین تمام شد'}</div>
      <h2>${esc(p.t)}</h2>
      <div class="muted">${fa(s.right)} از ${fa(s.tot)} سوال درست در بار اول${m.kind === 'daydone' ? ' · کار امروز تمام شد' : ''}</div>
      <a class="prow tap c-${p.c}" href="#/c/${p.c}" style="width:100%;margin-top:8px;border-bottom:0"><span class="nm"><i class="dot"></i>${esc(COURSE[p.c].name)}</span><span class="ct">${fa(cs.done)} از ${fa(cs.n)} الگو</span>${segbar(p.c)}</a>
      <div class="acts">${nextToday ? `<a class="btn l tap c-${nextToday.c}" href="#/p/${nextToday.id}">بعدی ${esc(nextToday.t)}${ic('arl', 's')}</a>` : `<a class="btn l tap" href="#/">برگشت به امروز${ic('arl', 's')}</a>`}
        ${wrong.length ? `<a class="btn l ghost tap" href="#/q/${wrong[0]}">${ic('retry', 's')}دوباره حل کردن غلط</a>` : ''}</div>
    </section></div></div>`;
}
