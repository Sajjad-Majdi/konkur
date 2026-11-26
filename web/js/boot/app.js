/* boot/app: sidebar + phone bar, hash router, render, actions, keys, sheet and toasts, theme, offline (service worker) */
var UI = { month: null, solve: null, test: {}, result: {}, rvf: 'all', rvOpen: null };
var ROUTE = null, timerId = 0, io = null;
const app = $('#app'), side = $('#side'), main = $('#main'), pill = $('#pill'), layer = $('#layer'), toasts = $('#toasts');

/* ---------- sidebar + phone pill ---------- */
function vSide(r) {
  const ts = timeState(), theme = D.documentElement.getAttribute('data-theme');
  const cur = r.cid || (r.pid && PAT[r.pid].c) || (r.qid && Q[r.qid].c);
  const crs = c => {
    if (!c.hasContent) return `<div class="crs soon">${ring(0, 18)}<span class="nm">${esc(c.name)}</span><small>به‌زودی</small></div>`;
    const s = cst(c.id);
    return `<a class="crs tap c-${c.id} ${cur === c.id ? 'on' : ''}" href="#/c/${c.id}">${ring(s.done / s.n, 18)}<span class="nm">${esc(c.name)}</span><small>${fa(s.done)} از ${fa(s.n)}</small></a>`;
  };
  let cd = '';
  if (r.name !== 'home' && r.name !== 'exam') {
    cd = ts.reg === 'open' || ts.reg === 'last'
      ? `<a class="side-cd reg tap" href="${esc(EXAM.registration.url)}" target="_blank" rel="noopener" data-act="reg-link"><span>ثبت‌نام باز است</span><b>${fa(ts.regLeft)} روز</b></a>`
      : ts.toExam > 0 ? `<a class="side-cd tap" href="#/exam"><span>تا کنکور</span><b>${fa(ts.toExam)} روز</b></a>` : '';
  }
  const lag = missed().length;
  return `<a class="brand" href="#/"><span class="logo">ک</span><b>${esc(SITE.brand)}</b></a>
    <a class="nav-i tap ${r.name === 'home' ? 'on' : ''}" href="#/">${ic('home')}امروز</a>
    <a class="nav-i tap ${r.name === 'plan' ? 'on' : ''}" href="#/plan">${ic('cal')}برنامه${lag ? `<small class="nav-b">${fa(lag)} روز عقب</small>` : ''}</a>
    <a class="nav-i tap ${r.name === 'exam' ? 'on' : ''}" href="#/exam">${ic('flag')}روز آزمون</a>
    <div class="side-h"><a href="#/courses" class="${r.name === 'courses' ? 'on' : ''}">درس‌ها</a></div>
    ${GROUPS.map(g => `<div class="side-g">${esc(g.name)} · ضریب ${fa(g.coef)}</div>${COURSES.filter(c => c.group === g.id).map(crs).join('')}`).join('')}
    <div class="side-foot">${cd}
      <div class="seg" role="group" aria-label="پوسته"><button class="tap ${theme === 'light' ? 'on' : ''}" data-act="theme" data-v="light">${ic('sun', 's')}روشن</button><button class="tap ${theme === 'dark' ? 'on' : ''}" data-act="theme" data-v="dark">${ic('moon', 's')}تیره</button></div>
    </div>`;
}
function vPill(r) {
  const crs = ['courses', 'course', 'pattern', 'solve', 'pdone', 'result'].includes(r.name);
  return `<a class="tap ${r.name === 'home' ? 'on' : ''}" href="#/">${ic('home')}امروز</a>
    <a class="tap ${r.name === 'plan' ? 'on' : ''}" href="#/plan">${ic('cal')}برنامه</a>
    <a class="tap ${crs ? 'on' : ''}" href="#/courses">${ic('book')}درس‌ها</a>
    <a class="tap ${r.name === 'exam' ? 'on' : ''}" href="#/exam">${ic('flag')}روز آزمون</a>`;
}

/* ---------- router ---------- */
const VIEWS = { plan: vPlan, home: vHome, courses: vCourses, course: vCourse, pattern: vPattern, solve: vSolve, pdone: vPdone, test: vTest, result: vResult, exam: vExam };
function parse() {
  const raw = location.hash.replace(/^#\/?/, '').split('?')[0], a = raw.split('/').filter(Boolean);
  if (!a.length) return { name: 'home' };
  if (a[0] === 'courses') return { name: 'courses' };
  if (a[0] === 'c' && COURSE[a[1]] && COURSE[a[1]].hasContent) return { name: 'course', cid: a[1] };
  if (a[0] === 'p' && PAT[a[1]]) {
    if (a[2] === 'q') return { name: 'solve', pid: a[1], idx: Math.max(0, +a[3] || 0) };
    if (a[2] === 'done') return { name: 'pdone', pid: a[1] };
    return { name: 'pattern', pid: a[1], sec: a[2] };
  }
  if (a[0] === 'q' && Q[a[1]]) return { name: 'solve', qid: a[1] };
  if (a[0] === 't' && SELFTEST[a[1]]) return { name: a[2] === 'r' ? 'result' : 'test', cid: a[1] };
  if (a[0] === 'exam') return { name: 'exam' };
  if (a[0] === 'plan') return { name: 'plan' };
  /* links of the old site: #ai, #ai/A1, #exam, #home */
  if (COURSE[a[0]] && COURSE[a[0]].hasContent) return a[1] && PAT[a[1]] ? { name: 'pattern', pid: a[1] } : { name: 'course', cid: a[0] };
  return { name: 'home' };
}
const rkey = r => JSON.stringify([r.name, r.cid, r.pid, r.idx, r.qid]);
function render() {
  TODAY = todayMs();
  const r = parse(), changed = !ROUTE || rkey(r) !== rkey(ROUTE);
  /* keep mounted tools (and their state) when the same page is drawn again */
  const keep = {};
  if (!changed) $$('.wg[data-m]', main).forEach(el => { keep[el.dataset.w] = el; });
  ROUTE = r;
  app.classList.toggle('focus', r.name === 'test');
  app.classList.toggle('nopill', r.name === 'solve' || r.name === 'pdone');
  side.innerHTML = vSide(r);
  pill.innerHTML = vPill(r);
  const y = scrollY;
  main.innerHTML = VIEWS[r.name](r);
  $$('.wg[data-w]', main).forEach(el => { const old = keep[el.dataset.w]; if (old) el.replaceWith(old); else mountTool(el); });
  if (!changed) { const v = main.firstElementChild; if (v) v.classList.add('still'); scrollTo(0, y); }
  after(r, changed);
}
function after(r, changed) {
  clearInterval(timerId); if (io) { io.disconnect(); io = null; }
  if (r.name === 'solve' && UI.solve && UI.solve.from !== UI.solve.lastFrom) {
    UI.solve.lastFrom = UI.solve.from;
    const st = $$('.step'), el = st[st.length - 1];
    if (el && el.getBoundingClientRect().bottom > innerHeight - 90) el.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'center' });
  }
  if (UI.solve) UI.solve.just = false;
  if (r.name === 'test') timerId = setInterval(tick, 1000);
  if (r.name === 'pattern') {
    if (changed) { if (r.sec && r.sec !== 'done') setTimeout(() => goto(r.sec, false), 30); else scrollTo(0, 0); }
    const tabs = $$('.stab');
    if ('IntersectionObserver' in W) {
      io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) tabs.forEach(t => t.classList.toggle('on', 's-' + t.dataset.sec === e.target.id)); }), { rootMargin: '-30% 0px -60% 0px' });
      ['s-read', 's-method', 's-ex', 's-pr'].forEach(id => { const el = D.getElementById(id); if (el && el.offsetParent) io.observe(el); });
    }
  } else if (changed) scrollTo(0, 0);
  $$('.pic img', main).forEach(im => { const ok = () => im.parentNode.classList.add('ld'); if (im.complete && im.naturalWidth) ok(); else im.addEventListener('load', ok, { once: true }); });
  if (changed) { const h = $('h1', main) || $('.tb .ttl', main); D.title = (r.name === 'home' ? '' : (h ? h.textContent.trim() + ' · ' : '')) + SITE.brand; }
}
const reduced = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function goto(sec, smooth = true) {
  const el = D.getElementById('s-' + sec);
  if (!el || !el.offsetParent) return;
  const top = el.getBoundingClientRect().top + scrollY - (innerWidth < 761 ? 108 : 64);
  scrollTo({ top, behavior: smooth && !reduced() ? 'smooth' : 'auto' });
}
function tick() {
  const r = ROUTE; if (!r || r.name !== 'test') return;
  const t = UI.test[r.cid]; if (!t) return;
  const rem = tLeft(t), el = $('#timer');
  if (el) { el.lastElementChild.textContent = mmss(rem); el.classList.toggle('low', rem < 120); }
  const sl = $('#sheetLeft'); if (sl) sl.textContent = mmss(rem);
  const pr = $('#tprog'); if (pr) pr.style.width = (100 - rem / t.dur * 100).toFixed(1) + '%';
  if (rem === 0) { closeSheet(); toast(`${ic('clock')}وقت تمام شد و پاسخ‌ها ثبت شد`); finishTest(r.cid); }
}

/* ---------- layer: sheet + toast ---------- */
function openSheet(html) {
  layer.innerHTML = `<div class="scrim" data-act="close-sheet"></div><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  requestAnimationFrame(() => requestAnimationFrame(() => { const a = $('.scrim', layer), b = $('.sheet', layer); if (a) a.classList.add('on'); if (b) { b.classList.add('on'); const f = $('button,a', b); if (f) f.focus({ preventScroll: true }); } }));
}
function closeSheet() {
  const s = $('.sheet', layer); if (!s) return;
  s.classList.remove('on'); $('.scrim', layer).classList.remove('on');
  setTimeout(() => { if (!$('.sheet.on', layer)) layer.innerHTML = ''; }, 300);
}
function toast(html, ms = 3400) {
  const t = D.createElement('div'); t.className = 'toast'; t.innerHTML = html; toasts.appendChild(t);
  if (ms) setTimeout(() => { t.style.transition = 'opacity .3s, transform .3s'; t.style.opacity = 0; t.style.transform = 'translateY(8px)'; setTimeout(() => t.remove(), 320); }, ms);
  return t;
}

/* ---------- theme ---------- */
function systemDark() { try { return matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; } }
function applyTheme() {
  const t = S.theme === 'light' || S.theme === 'dark' ? S.theme : (systemDark() ? 'dark' : 'light');
  D.documentElement.setAttribute('data-theme', t);
  const m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', t === 'dark' ? '#13151d' : '#f1ece1');
}
function setTheme(t) {
  const go = () => { S.theme = t; save(); applyTheme(); render(); };
  if (D.startViewTransition && !reduced()) D.startViewTransition(go); else go();
}

/* ---------- actions ---------- */
function weakSheet() {
  const w = weak(); if (!w.length) return;
  openSheet(`<h3>سوال‌های غلط</h3><div class="weak in-sheet">${w.map(weakRow).join('')}</div>`);
}
function testSheetNav(t) {
  openSheet(`<h3>${fa(t.ids.length)} سوال</h3><div class="cells">${cellsHtml(t)}</div>${legendHtml(t)}<div class="acts"><button class="btn tap" data-act="t-finish">پایان آزمونک</button></div>`);
}
D.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const act = a.dataset.act, v = a.dataset.v, r = ROUTE;
  if (act === 'reg-link') { if (!navigator.onLine) { e.preventDefault(); toast(`${ic('wifioff')}اینترنت وصل نیست و سایت سنجش باز نمی‌شود`); } return; }
  e.preventDefault();
  const T = r && r.cid ? UI.test[r.cid] : null;
  switch (act) {
    case 'theme': setTheme(v); break;
    case 'theme-toggle': setTheme(D.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); break;
    case 'reg-done': S.reg = 1; save(); render(); toast(`${ic('check')}یادآور ثبت‌نام بسته شد`); break;
    case 'text-done': S.plan[a.dataset.d] = 1; save(); render(); break;
    case 'weak-sheet': weakSheet(); break;
    case 'close-sheet': closeSheet(); break;
    case 'method-sheet': { const pid = solveCtx(r).pid; if (pid) openSheet(methodCard(PAT[pid], 'in-sheet')); break; }
    case 'goto': goto(a.dataset.sec); try { history.replaceState(null, '', `#/p/${r.pid}/${a.dataset.sec}`); } catch (x) { } break;
    case 'collapse': if (S.rv[r.pid]) delete S.rv[r.pid]; else S.rv[r.pid] = 1; save(); render(); break;
    case 'read-done': S.rd[r.pid] = 1; save(); render(); goto('ex'); break;
    case 'ex-done': S.exd[r.pid] = 1; S.rd[r.pid] = 1; save(); render(); goto('pr'); break;
    case 'opt': UI.solve.sel = +v; render(); break;
    case 'check': if (UI.solve.sel) answer('ok'); break;
    case 'skip': answer('skip'); break;
    case 'hint': UI.solve.hinted = true; render(); break;
    case 'step': UI.solve.from = UI.solve.shown; UI.solve.shown++; render(); break;
    case 'allsteps': UI.solve.from = UI.solve.shown; UI.solve.shown = Q[solveCtx(r).qid].s.length; render(); break;
    case 'next': nextQ(); break;
    case 't-opt': if (T) { if (T.ans[T.cur] === +v) delete T.ans[T.cur]; else T.ans[T.cur] = +v; render(); } break;
    case 't-go': if (T) { T.cur = +v; closeSheet(); render(); } break;
    case 't-prev': if (T && T.cur) { T.cur--; render(); } break;
    case 't-next': if (T && T.cur < T.ids.length - 1) { T.cur++; render(); } break;
    case 't-mark': if (T) { if (T.mark[T.cur]) delete T.mark[T.cur]; else T.mark[T.cur] = 1; render(); } break;
    case 't-clear': if (T) { delete T.ans[T.cur]; render(); } break;
    case 't-nav': if (T) testSheetNav(T); break;
    case 't-finish': if (T) { const n = T.ids.length, na = Object.keys(T.ans).length, nm = Object.keys(T.mark).length;
      openSheet(`<h3>پایان آزمونک</h3><p>${fa(na)} پاسخ · ${fa(n - na)} نزده${nm ? ` · ${fa(nm)} علامت‌دار` : ''}<br><span id="sheetLeft">${mmss(tLeft(T))}</span> وقت مانده</p>
        <div class="acts"><button class="btn tap" data-act="t-done" data-enter>پایان و دیدن نمره</button><button class="btn ghost tap" data-act="close-sheet">ادامه آزمونک</button></div>`); } break;
    case 't-done': closeSheet(); finishTest(r.cid); break;
    case 't-exit': openSheet(`<h3>خروج از آزمونک</h3><p>پاسخ‌های این دور ثبت نمی‌شود</p><div class="acts"><button class="btn tap" style="--c:var(--bad)" data-act="t-quit">خروج</button><button class="btn ghost tap" data-act="close-sheet">ادامه آزمونک</button></div>`); break;
    case 't-quit': closeSheet(); delete UI.test[r.cid]; location.hash = '#/c/' + r.cid; break;
    case 'rv-f': UI.rvf = v; UI.rvOpen = null; render(); break;
    case 'rv-open': UI.rvOpen = UI.rvOpen === v ? null : v; render(); break;
    case 'month': UI.month = +v; render(); break;
    case 'shift': { const m = shiftPlan(+v); if (!m.move) break; S.sh = (+S.sh || 0) + m.move; S.cut = (+S.cut || 0) + m.fromRev; buildPlan(); save(); render();
      toast(`${ic('cal')}برنامه ${fa(m.move)} روز جلو رفت${m.fromRev ? ` و ${fa(m.fromRev)} روز از جمع‌بندی کم شد` : ` و ذخیره ${fa(Math.max(0, buffer()))} روز شد`}${m.left && missed().length ? ` و هنوز ${fa(missed().length)} روز عقبی` : ''}`, 4600); break; }
    case 'reload': location.reload(); break;
  }
});
D.addEventListener('keydown', e => {
  if (e.target.closest && e.target.closest('input,textarea,select,[contenteditable]')) return;
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const r = ROUTE, k = toLatin(e.key);
  if (e.key === 'Escape') { closeSheet(); return; }
  if (layer.innerHTML) { if (e.key === 'Enter') { const b = $('.sheet.on [data-enter]', layer); if (b) { e.preventDefault(); b.click(); } } return; }
  if (!r) return;
  if (r.name === 'solve') {
    const st = UI.solve;
    if (/^[1-4]$/.test(k) && !st.checked) { st.sel = +k; render(); }
    else if (e.key === 'Enter') { if (e.target.closest && e.target.closest('a,button') && !e.target.closest('.opt')) return; const b = $('.qbar [data-act]'); if (b && !b.disabled) { e.preventDefault(); b.click(); } }
  } else if (r.name === 'test') {
    const t = UI.test[r.cid]; if (!t) return;
    if (/^[1-4]$/.test(k)) { t.ans[t.cur] = +k; render(); }
    else if (e.key === 'ArrowLeft') { if (t.cur < t.ids.length - 1) { t.cur++; render(); } }
    else if (e.key === 'ArrowRight') { if (t.cur) { t.cur--; render(); } }
    else if (k === 'm' || k === 'M' || e.key === 'پ') { if (t.mark[t.cur]) delete t.mark[t.cur]; else t.mark[t.cur] = 1; render(); }
    else if (e.key === 'Backspace' || e.key === 'Delete') { delete t.ans[t.cur]; render(); }
    else if (e.key === 'Enter') { if (e.target.closest && e.target.closest('a,button') && !e.target.closest('.opt')) return; e.preventDefault(); const b = $(t.cur < t.ids.length - 1 ? '[data-act="t-next"]' : '[data-act="t-finish"]'); if (b) b.click(); }
  }
});
let lastY = 0;
addEventListener('scroll', () => { const y = scrollY; pill.classList.toggle('hide', y > lastY + 4 && y > 120); if (y < lastY - 4) pill.classList.remove('hide'); lastY = y; }, { passive: true });
addEventListener('hashchange', () => { closeSheet(); render(); });
/* a new day (or a long pause) redraws the dates */
D.addEventListener('visibilitychange', () => { if (!D.hidden && todayMs() !== TODAY && ROUTE && ROUTE.name !== 'test') render(); });
setInterval(() => { if (todayMs() !== TODAY && ROUTE && ROUTE.name !== 'test' && !layer.innerHTML) render(); }, 60000);
try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (S.theme !== 'light' && S.theme !== 'dark') { applyTheme(); render(); } }); } catch (e) { }
applyTheme();
render();

/* ---------- offline: only the hosted build links a manifest and ships sw.js ---------- */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && $('link[rel="manifest"]')) {
  const hadCtl = !!navigator.serviceWorker.controller;
  let shown = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (shown) return; shown = true;
    if (hadCtl) toast(`${ic('retry')}نسخه تازه آماده است<button data-act="reload">بارگذاری</button>`, 0);
    else toast(`${ic('down')}همه درس‌ها برای کار بدون اینترنت ذخیره شد`, 4200);
  });
  W.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { }); });
}
