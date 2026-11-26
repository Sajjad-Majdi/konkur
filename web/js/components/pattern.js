/* components/pattern: one collapsible pattern section (review, cue, method, table, traps, tool, worked example, practice) */
/* optional concept refresher ("review" blocks in the pattern JSON): text / img / svg.
   Open by default; once the reader closes it, it stays closed for that pattern (S.rv). */
function reviewHTML(p){
  if(!p.rv||!p.rv.length)return '';
  var closed=S.rv&&S.rv[p.id];
  return '<details class="rvw" data-p="'+p.id+'"'+(closed?'':' open')+'><summary>'+IC.book+'<b>یادآوری</b><span class="chev">'+IC.chev+'</span></summary><div class="rvw-b">'+
    p.rv.map(function(b){
      if(b.type==='text')return '<div class="rvw-t">'+rich(b.html)+'</div>';
      if(b.type==='img')return '<figure class="rvw-f"><img src="'+b.src+'" alt="'+esc(b.alt||'')+'" loading="lazy" decoding="async">'+(b.caption?'<figcaption>'+rich(b.caption)+'</figcaption>':'')+'</figure>';
      if(b.type==='svg')return '<figure class="rvw-f fig">'+FIG[b.name]()+(b.caption?'<figcaption>'+rich(b.caption)+'</figcaption>':'')+'</figure>';
      return '';
    }).join('')+'</div></details>';
}
function onReviewToggle(d){if(!S.rv||typeof S.rv!=='object')S.rv={};if(d.open)delete S.rv[d.dataset.p];else S.rv[d.dataset.p]=1;save();}
function patHTML(p){
  return '<article class="pat '+p.c+'" id="p-'+p.id+'"><button type="button" class="pat-h" aria-expanded="false"><span class="pid">'+p.id+'</span><span class="pt">'+p.t+'<small>'+p.en+'</small></span><span class="dots">'+p.pr.map(function(id){return '<i class="dot" data-q="'+id+'"></i>';}).join('')+'</span><span class="chev">'+IC.chev+'</span></button>'+
    '<div class="pat-b"><div class="pat-in"><div class="pat-pad">'+reviewHTML(p)+
    '<p class="freq">'+IC.rep+p.f+'</p>'+
    '<h3>'+IC.cue+'از کجا بفهمم این الگوست</h3><ul class="cue">'+p.cue.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ul>'+
    '<h3>'+IC.how+'روش سریع</h3><ol class="how">'+p.how.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ol>'+(p.tbl?TABLES[p.tbl]():'')+
    '<div class="traps"><h3>'+IC.trap+'تله‌ها</h3><ul class="trap">'+p.trap.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ul></div>'+
    (p.w?'<div class="wg" data-w="'+p.w+'"></div>':'')+
    '<h3>'+IC.book+'نمونه حل‌شده</h3>'+qCard(p.ex,'e')+
    '<h3>'+IC.pen+'حالا خودت حل کن</h3>'+p.pr.map(function(id){return qCard(id,'p');}).join('')+
    '</div></div></div></article>';
}
/* questions and tools inside a pattern are hydrated the first time it opens */
function togglePat(art,force){
  var o=force===true?true:!art.classList.contains('open');
  art.classList.toggle('open',o);$('.pat-h',art).setAttribute('aria-expanded',o?'true':'false');
  if(o&&!art.dataset.h){art.dataset.h='1';$$('.q',art).forEach(hydrateQ);$$('.wg[data-w]',art).forEach(mountTool);}
}
