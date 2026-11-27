/* views/exam: exam tips, advice for the exam session only (no dates, no registration, no countdown, so the corner
   countdown chip is left out here too, in the top bar and in the sidebar):
   the three passes, time per question, negative marking with the guess tool, the usual traps */
function vExam() {
  const E = SITE.exam, P = E.pace.cards, now = P[P.length - 1], prev = P.length > 1 ? P[0] : null;
  const mm = c => `<bdi dir="ltr">${fa(c.min)}:${fa(String(c.sec).padStart(2, '0'))}</bdi>`;
  const sub = c => c.text.split('<br>').map(x => esc(x)).join(' · ');
  const [legend, meaning] = E.negative.desc.split('<br>');
  return `<div class="view wrap exv">${tb('#/', esc(E.title), '')}
    <header class="ph"><h1>${esc(E.title)}</h1></header>
    <section class="card passes"><h2 class="h2">${esc(E.passes.title)}</h2>
      <ol class="track">${E.passes.items.map((x, i) => `<li><span class="pn">${fa(i + 1)}</span><b>${esc(x[0])}</b><span>${esc(x[1])}</span></li>`).join('')}</ol>
      <ul class="tips">${E.passes.facts.map(x => `<li>${rich(x)}</li>`).join('')}</ul></section>
    <div class="ex-cols">
      <section class="pace"><h2 class="h2">${esc(E.pace.title)}</h2>
        <div class="big">${mm(now)}<span>${sub(now)}</span></div>
        ${prev ? `<div class="was">${mm(prev)}<span>${sub(prev).split(' · ')[0]}</span></div>` : ''}
        <ul class="tips">${E.pace.facts.map(x => `<li>${rich(x)}</li>`).join('')}</ul></section>
      <section class="neg"><h2 class="h2">${esc(E.negative.title)}</h2>
        <div class="fm"><span class="f">${rich(E.negative.formula)}</span><span class="lg">${rich(legend)}</span></div>
        ${meaning ? `<p class="mean">${rich(meaning)}</p>` : ''}
        ${E.negative.tool ? `<div class="wg" data-w="${E.negative.tool}"></div>` : ''}</section>
    </div>
    <section class="traps"><h2 class="h2">${esc(E.traps.title)}</h2><ol>${E.traps.items.map((x, i) => `<li><span class="n">${fa(i + 1)}</span><span>${rich(x)}</span></li>`).join('')}</ol></section>
    <p class="ex-foot">${E.footer}</p>
  </div>`;
}
