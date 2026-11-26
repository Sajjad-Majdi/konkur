/* components/question: options, solution steps, review blocks and the method card */
function optsStatic(q){
  return '<ol class="opts">'+q.o.map(function(o,i){var k=i+1===q.key;return '<li><div class="opt '+(k?'right':'dim')+'"><span class="on">'+fa(i+1)+'</span><span class="ot">'+rich(o)+'</span><span class="om">'+(k?ic('check'):'')+'</span></div></li>';}).join('')+'</ol>';
}
function stepsHtml(q,n,from){
  if(from===undefined)from=99;
  return '<div class="steps"><div class="steps-h">'+ic('steps','s')+'راه‌حل<span class="x">'+(n<q.s.length?'قدم '+fa(n)+' از '+fa(q.s.length):'')+'</span></div>'+
    q.s.slice(0,n).map(function(x,i){var fin=i===q.s.length-1;return '<div class="step '+(fin?'fin':'')+'"'+(i<from?' style="animation:none"':'')+'><span class="sn">'+(fin?ic('check','s'):fa(i+1))+'</span><div class="sb">'+rich(x)+'</div></div>';}).join('')+'</div>';
}
function qFig(q){return q.fig&&FIG[q.fig]?'<div class="fig qfig"><div class="fb">'+FIG[q.fig]()+'</div></div>':'';}
function block(b){
  if(b.type==='text')return '<div class="blk">'+rich(b.html)+'</div>';
  var cap=b.caption?'<figcaption>'+rich(b.caption)+'</figcaption>':'';
  if(b.type==='img')return '<figure class="fig"><div class="pic"><img src="'+b.src+'" alt="'+esc(b.alt||'')+'" loading="lazy" decoding="async"></div>'+cap+'</figure>';
  if(b.type==='svg')return '<figure class="fig"><div class="fb">'+FIG[b.name]()+'</div>'+cap+'</figure>';
  return '';
}
function methodCard(p,cls,id){
  return '<aside class="card method '+cls+' c-'+p.c+'" '+(id||'')+'><h3>'+ic('bolt')+'روش حل این الگو</h3>'+
    '<div class="mb cue"><h4>'+ic('eye','s')+'نشانه‌ها</h4><ul>'+p.cue.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ul></div>'+
    '<div class="mb how"><h4>'+ic('steps','s')+'روش سریع</h4><ol>'+p.how.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ol></div>'+
    '<div class="mb trap"><h4>'+ic('alert','s')+'تله‌ها</h4><ul>'+p.trap.map(function(x){return '<li>'+rich(x)+'</li>';}).join('')+'</ul></div></aside>';
}
