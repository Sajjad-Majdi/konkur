/* components/rings: progress rings and per-course progress */
function ringSvg(frac,cls){var C=2*Math.PI*18;return '<svg viewBox="0 0 44 44" class="ring '+(cls||'')+'" aria-hidden="true"><circle cx="22" cy="22" r="18" class="rt"/><circle cx="22" cy="22" r="18" class="rv" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="'+(C*(1-frac)).toFixed(2)+'"/></svg>';}
function setRing(el,frac){var C=2*Math.PI*18;var v=$('.rv',el);if(v)v.setAttribute('stroke-dashoffset',(C*(1-frac)).toFixed(2));}
/* practice questions done in a course (the worked example is not counted, as in v1) */
function courseStats(c){var ids=[];PATTERNS.forEach(function(p){if(p.c===c)ids=ids.concat(p.pr);});var d=0;ids.forEach(function(id){var s=S.q[id];if(s&&s.done)d++;});return {n:ids.length,done:d};}
function frac(st){return st.n?st.done/st.n:0;}
function pct(x){return '<bdi>'+fa((Math.round(x*10)/10).toString().replace('-','−'))+'٪</bdi>';}
function refreshProgress(){
  LIVE.forEach(function(co){var c=co.id,st=courseStats(c);$$('.ring.'+c).forEach(function(r){setRing(r.parentNode,frac(st));});$$('.cst[data-c="'+c+'"]').forEach(function(x){x.textContent=fa(st.done)+' از '+fa(st.n)+(x.dataset.u?' '+x.dataset.u:'');});});
  $$('.tst').forEach(function(el){var t=S.test[el.dataset.c];el.innerHTML=t&&typeof t.best==='number'?'<span>بهترین <b>'+pct(t.best)+'</b></span><span>آخرین <b>'+pct(t.last)+'</b></span>':'';});
}
