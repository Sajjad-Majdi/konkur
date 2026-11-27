/* components/map: the hand-drawn "where am I" map of the home page.
   The trail starts at «شروع»; each stretch is one plan phase and ends at that phase's stop, so reaching a stop means the
   course is finished ("conquered": the stretch is lit in the course colour and the stop carries a small flag). The stop we
   are heading to shows how far into it we are («۳۵٪») and its stretch is lit by that share, with the pin at that point.
   Stops not reached yet stay dim. The goal flag «کنکور» has no date on purpose: the dated timeline is the plan page's road,
   and the exam date lives only in the corner chip. Inline SVG; labels are HTML so they keep their size at every width. */
var MAPV = {
  /* wide: one winding trail from right (start) to left (goal) */
  d: { w: 1000, h: 210, side: (i, y) => y >= 100,
    pts(n) { const ys = [108, 136, 74, 132, 78, 140, 70, 130, 80, 138, 68]; return Array.from({ length: n }, (_, i) => [944 - i * (880 / (n - 1)), ys[i % ys.length]]); },
    bends: [[.45, 30], [.55, -44], [.42, 46], [.58, -44], [.42, 44], [.56, -46], [.44, 44], [.58, -42], [.44, 44], [.55, -40]] },
  /* phone: a snake in two rows, right to left, a U-turn, then back left to right */
  m: { w: 360, h: 222, side: (i, y) => y >= 120 ? y >= 158 : y >= 54,
    pts(n) {
      const a = Math.ceil(n / 2), out = [], y1 = [58, 60, 46, 60, 46, 60], y2 = [150, 164, 150, 164, 160];
      for (let i = 0; i < a; i++) out.push([322 - i * (286 / (a - 1)), y1[i % 6]]);
      for (let i = 0; i < n - a; i++) out.push([54 + i * (272 / Math.max(1, n - a - 1)), y2[i % 5]]);
      return out;
    },
    bends: [[.5, 10], [.5, -10], [.5, 10], [.5, -10], [.5, 10], null, [.5, -10], [.5, 10], [.5, -10], [.5, 10]] }
};
/* share of a plan day already worked: a done day 1, a pattern day by the stages of its patterns, a text day 0 */
function dayShare(d) {
  if (dayDone(d)) return 1;
  if (!d.pats.length) return 0;
  return d.pats.reduce((a, id) => { const s = pst(id); return a + (s.done ? 1 : ((s.read ? 1 : 0) + (s.ex ? 1 : 0) + (s.tot ? s.ans / s.tot : 0)) / 3); }, 0) / d.pats.length;
}
/* where the reader is: the first phase not finished and how much of it is done. A phase of a course without content
   cannot be worked on, so it counts by the calendar (passed once its days are over). */
function mapState() {
  const k = todayN();
  const info = PHASES.map((ph, i) => {
    if (ph.soon) { const share = Math.min(1, Math.max(0, (k - ph.from) / ph.len)); return { done: share >= 1, share }; }
    const ds = LP.filter(d => d.ph === i);
    return { done: ds.every(dayDone), share: ds.reduce((a, d) => a + dayShare(d), 0) / ph.len };
  });
  const cur = info.findIndex(x => !x.done);
  return { info, cur, share: cur < 0 ? 1 : info[cur].share };
}
/* Catmull-Rom through the points and the bend points -> cubic pieces; piece i runs from point i to point i+1 */
function mapGeo(v, n) {
  const S = v.pts(n), P = [];
  S.forEach((s, i) => {
    P.push(s);
    if (i < n - 1) {
      const b = v.bends[i % v.bends.length], t = S[i + 1];
      P.push(b ? [s[0] + (t[0] - s[0]) * b[0], s[1] + (t[1] - s[1]) * b[0] + b[1]] : [Math.min(s[0], t[0]) - 34, (s[1] + t[1]) / 2]);   /* null = the U-turn */
    }
  });
  const pt = i => P[Math.max(0, Math.min(P.length - 1, i))], cub = [];
  for (let i = 0; i < P.length - 1; i++) {
    const a = pt(i - 1), b = pt(i), c = pt(i + 1), d = pt(i + 2);
    cub.push([b, [b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6], [c[0] - (d[0] - b[0]) / 6, c[1] - (d[1] - b[1]) / 6], c]);
  }
  return { S, pieces: Array.from({ length: n - 1 }, (_, i) => [cub[2 * i], cub[2 * i + 1]]) };
}
const r1 = x => Math.round(x * 10) / 10;
const cubD = cs => 'M' + cs[0][0].map(r1).join(' ') + cs.map(c => 'C' + [c[1], c[2], c[3]].map(q => q.map(r1).join(' ')).join(' ')).join('');
function cubAt(c, t) { const u = 1 - t; return [0, 1].map(k => u * u * u * c[0][k] + 3 * u * u * t * c[1][k] + 3 * u * t * t * c[2][k] + t * t * t * c[3][k]); }
/* the point at fraction f of the length of a piece */
function pieceAt(cs, f) {
  const pts = [];
  cs.forEach(c => { for (let s = 0; s <= 30; s++) pts.push(cubAt(c, s / 30)); });
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const want = f * L[L.length - 1];
  for (let i = 1; i < pts.length; i++) if (L[i] >= want) { const q = (want - L[i - 1]) / ((L[i] - L[i - 1]) || 1); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * q, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * q]; }
  return pts[pts.length - 1];
}
/* faint drawn details: contour lines, hills, little trees, a compass */
function mapDeco(k) {
  if (k === 'm') return '<g class="mp-deco"><path d="M196 212l11-15 11 15M212 212l8-11 8 11"/><path d="M300 112c16-9 36-5 41 5s-7 19-27 18-27-16-14-23z"/></g>';
  const blob = (cx, cy, r) => [1, .72, .46].map(s => `<path d="M${cx - r * s} ${cy}c${r * s * .1}-${r * s * .62} ${r * s * 1.2}-${r * s * .7} ${r * s * 1.55}-${r * s * .32}s${r * s * .5} ${r * s * .7}-${r * s * .25} ${r * s * .86}-${r * s * 1.4} ${r * s * .12}-${r * s * 1.3}-${r * s * .54}z"/>`).join('');
  const tree = (x, y) => `<path d="M${x} ${y}v-7"/><circle cx="${x}" cy="${y - 11}" r="5"/>`;
  return `<g class="mp-deco">${blob(560, 186, 70)}${blob(262, 24, 56)}
    <path d="M100 206l17-24 17 24M124 206l13-18 13 18M112 188l5-6 5 6"/>
    ${tree(806, 200)}${tree(820, 204)}${tree(376, 204)}${tree(690, 30)}${tree(702, 26)}
    <g transform="translate(966 30)"><circle r="15"/><path d="M0-21 3.5-3.5 21 0 3.5 3.5 0 21-3.5 3.5-21 0-3.5-3.5z" class="mp-cmp"/></g></g>`;
}
function mapVariant(k, st) {
  const v = MAPV[k], n = PHASES.length + 2, { S, pieces } = mapGeo(v, n), m = k === 'm';
  const pc = (x, y) => `left:${(x / v.w * 100).toFixed(2)}%;top:${(y / v.h * 100).toFixed(2)}%`;
  const col = ph => ph.soon ? 'var(--ink-3)' : ph.fin ? 'var(--brand)' : `var(--c-${ph.courses[0]})`;
  const curI = st.cur < 0 ? PHASES.length : st.cur;
  let walked = '', rest = '', nodes = '', labels = '', delay = 0;
  /* the stretches: phase i ends at point i+1; the last stretch (buffer days) leads to the goal */
  pieces.forEach((cs, i) => {
    const ph = PHASES[i], d = cubD(cs);
    rest += `<path d="${d}"/>`;
    const f = i < curI ? 1 : i === curI ? st.share : 0;
    if (f > .004) { walked += `<path class="${ph && ph.soon ? 'sn' : ''}" d="${d}" pathLength="1" style="stroke:${ph ? col(ph) : 'var(--amber-2)'};color:${ph ? col(ph) : 'var(--amber-2)'};--f:${f.toFixed(3)};stroke-dasharray:${f.toFixed(3)} 1;animation-delay:${(delay * .12).toFixed(2)}s"/>`; delay++; }
  });
  S.forEach(([x, y], i) => {
    const below = v.side(i, y), off = m ? 12 : 16;
    if (i === 0) {
      nodes += `<circle class="mp-start" cx="${r1(x)}" cy="${r1(y)}" r="${m ? 4 : 5}"/>`;
      labels += `<span class="mp-l start ${below ? 'b' : 'a'}" style="${pc(x, below ? y + off - 4 : y - off + 4)}">شروع</span>`;
      return;
    }
    if (i === n - 1) {
      nodes += `<g class="mp-goal ${st.cur < 0 ? 'won' : ''}" transform="translate(${r1(x)} ${r1(y)}) scale(${m ? .8 : 1})"><path class="hill" d="M-26 8c8-9 18-12 26-12s18 3 26 12"/><path class="pole" d="M0 4V-34"/><path class="fl" d="M0-34c8-4 14 3 22-1v14c-8 4-14-3-22 1z"/><circle r="3.4"/></g>`;
      labels += `<span class="mp-l goal b" style="${pc(x, y + (m ? 10 : 14))}">کنکور</span>`;
      return;
    }
    const pi = i - 1, ph = PHASES[pi], inf = st.info[pi], won = inf.done && !ph.soon, passed = inf.done && ph.soon, cur = pi === st.cur;
    const cls = won ? 'won' : passed ? 'passed' : cur ? 'cur' : ph.soon ? 'soon' : 'ahead';
    const r = m ? 8 : 10;
    nodes += `<g class="mp-n ${cls}" transform="translate(${r1(x)} ${r1(y)})" style="--k:${col(ph)}">${won ? `<circle class="halo" r="${r + 7}"/>` : ''}<circle r="${won ? r + 2 : r}"/>${won ? `<g transform="scale(${m ? .8 : 1})"><path class="pole" d="M-4 6.4V-6.6"/><path class="pn" d="M-4-6.6c2.6-1.5 5.2 1.3 8.6-.2v6.2c-3.4 1.5-6-1.3-8.6.2z"/></g>` : ''}</g>`;
    const live = ph.courses.length === 1 && COURSE[ph.courses[0]] && COURSE[ph.courses[0]].hasContent, tag = live ? 'a' : 'span';
    const pct = cur ? `<small style="color:${col(ph)}">${fa(Math.round(st.share * 100))}٪</small>` : '';
    labels += `<${tag} class="mp-l ${cls} ${below ? 'b' : 'a'} ${live ? 'tap' : ''}" ${live ? `href="#/c/${ph.courses[0]}"` : ''} style="${pc(x, below ? y + off : y - off)}">${esc(ph.short)}${pct}</${tag}>`;
  });
  /* the pin: on the trail, at the share of the stretch we are on */
  const at = pieceAt(pieces[Math.min(curI, pieces.length - 1)], curI < pieces.length ? st.share : 1), sc = m ? .8 : 1, dl = (delay * .12 + .15).toFixed(2);
  const pin = `<g transform="translate(${r1(at[0])} ${r1(at[1])}) scale(${sc})"><circle class="mp-pulse" r="7"/><g class="mp-pin" style="animation-delay:${dl}s"><path class="pb" d="M0 0c-2-7-11-12-11-21a11 11 0 0 1 22 0c0 9-9 14-11 21z"/><circle class="pc" cy="-21" r="4.2"/></g></g>`;
  labels += `<span class="mp-here" style="${pc(at[0], at[1] - 35 * sc)};animation-delay:${dl}s">اینجا هستی</span>`;
  return `<div class="mp mp-${k}" style="aspect-ratio:${v.w}/${v.h}"><svg viewBox="0 0 ${v.w} ${v.h}" aria-hidden="true">${mapDeco(k)}
    <g class="mp-rest">${rest}</g><g class="mp-walk">${walked}</g>${nodes}${pin}</svg>${labels}</div>`;
}
function homeMap() {
  const st = mapState();
  return `<section class="map" aria-label="مسیر تا کنکور">${mapVariant('d', st)}${mapVariant('m', st)}</section>`;
}
