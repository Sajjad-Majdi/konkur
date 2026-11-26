/* views/exam: exam-day page — 1406 structure (from courses.json), pace, negative marking, three passes, traps, dates */
function structureHTML(){
  var X=SITE.exam.structure;
  var h='<section class="card"><h2>'+X.title+'</h2><p class="lead">رشته '+EXAM.field+' — کد '+fa(EXAM.code)+' — '+EXAM.sameForAllTracks+'</p><div class="sgrid">';
  GROUPS.forEach(function(g){
    h+='<div class="sg"><div class="sg-h"><b>'+g.name+'</b><span>ضریب '+fa(g.coef)+'</span></div><ul>'+COURSES.filter(function(c){return c.group===g.id;}).map(function(c){return '<li'+(c.hasContent?' class="on"':'')+'>'+(c.official||c.name)+'</li>';}).join('')+'</ul></div>';
  });
  h+='</div><p class="sx"><b>'+X.removedLabel+'</b> '+EXAM.removed.join('، ')+'</p>'+
    '<p class="sx"><b>حدود '+fa(EXAM.questions)+' سوال</b> در <b>حدود '+fa(EXAM.minutes)+' دقیقه</b></p><p class="src">'+EXAM.estimate+'<br>منبع — '+EXAM.source+'</p></section>';
  return h;
}
function examHTML(){
  var X=SITE.exam,R=EXAM.registration;
  var h='<section class="chead"><div><h1>'+X.title+'</h1><p class="sub">'+X.subtitle+'</p></div></section>';
  h+=structureHTML();
  h+='<section class="card"><h2>'+X.pace.title+'</h2><div class="pace">'+X.pace.cards.map(function(c){return '<div><b>'+fa(c.min)+'<small>دقیقه</small>'+fa(c.sec)+'<small>ثانیه</small></b><span>'+c.text+'</span></div>';}).join('')+'</div>'+
    '<ul class="facts">'+X.pace.facts.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul></section>';
  h+='<section class="card"><h2>'+X.negative.title+'</h2><div class="formula">'+rich(X.negative.formula)+'</div><p class="fdesc">'+rich(X.negative.desc)+'</p>'+(X.negative.tool?'<div class="wg" data-w="'+X.negative.tool+'"></div>':'')+'</section>';
  h+='<section class="card"><h2>'+X.passes.title+'</h2><ol class="passes">'+X.passes.items.map(function(p){return '<li><b>'+p[0]+'</b><span>'+p[1]+'</span></li>';}).join('')+'</ol>'+
    '<ul class="facts">'+X.passes.facts.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul></section>';
  h+='<section class="card"><h2>'+X.traps.title+'</h2><ul class="trap big">'+X.traps.items.map(function(t){return '<li>'+rich(t)+'</li>';}).join('')+'</ul></section>';
  h+='<section class="card"><h2>'+X.dates.title+'</h2><div class="dates"><div><span>'+X.dates.registration+'</span><b>'+faRange(R.start,R.end)+'</b></div><div><span>'+X.dates.exam+'</span><b>'+faDate(EXAM.date,true)+'</b></div></div><p class="src">'+X.dates.note+'<br>روزهای آزمون '+EXAM.days+' — '+EXAM.dayNote+'</p></section>';
  return h;
}
