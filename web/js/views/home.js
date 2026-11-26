/* views/home: map page — progress rings, registration reminder, exam countdown, course map, weights, ranking, plan, sources */
function liveNames(key){return LIVE.map(function(c){return key==='short'?cShort(c.id):c.name;}).join(' و ');}
function planText(d){if(d.t)return d.t;return d.p.map(function(id){return PAT[id].t;}).join(' و ')+(d.x?' '+d.x:'');}
function regHTML(){
  var R=EXAM.registration,H=SITE.home.countdown;if(!R)return '';
  var now=nowDate().getTime(),end=tehranDayEnd(R.end),toStart=daysUntil(R.start);
  if(now>=end)return '';
  var link='<a class="btn reg-a" href="'+esc(R.url)+'" target="_blank" rel="noopener">'+H.regLink+' <bdi class="u">'+esc(R.urlLabel||R.url)+'</bdi></a>';
  if(toStart>0){
    return '<section class="card reg soon" aria-live="polite"><div class="reg-h">'+IC.clock+'<b>'+H.regSoonTitle+'</b></div>'+
      '<div class="reg-row"><div class="reg-n"><b>'+fa(toStart)+'</b><span>'+H.regSoonLeft+'</span></div><p class="reg-d">'+faRange(R.start,R.end)+'</p></div>'+link+'</section>';
  }
  var ms=end-now,dd=Math.floor(ms/864e5),hh=Math.floor((ms%864e5)/36e5);
  var left=dd?fa(dd)+' روز'+(hh?' و '+fa(hh)+' ساعت':''):(hh?fa(hh)+' ساعت':'کمتر از یک ساعت');
  var e=parseISO(R.end),je=g2j(e[0],e[1],e[2]);
  return '<section class="card reg open" aria-live="polite"><div class="reg-h">'+IC.clock+'<b>'+H.regOpenTitle.replace('{end}',fa(je[2])+' '+JMON[je[1]-1])+'</b></div>'+
    '<div class="reg-row"><div class="reg-n"><b>'+left+'</b><span>'+H.regOpenLeft+'</span></div><p class="reg-d">'+faRange(R.start,R.end)+'</p></div>'+link+'</section>';
}
function countdownHTML(){
  var H=SITE.home.countdown,n=daysUntil(EXAM.date),big,label;
  if(n>0){big='<b>'+fa(n)+'</b><span>'+H.days+'</span>';label=H.title;}
  else if(n===0){big='<b>'+fa(0)+'</b><span>'+H.days+'</span>';label=H.today;}
  else {big='';label=H.past;}
  return '<section class="card cdcard"><div class="cd">'+(big?'<div class="cd-n">'+big+'</div>':'')+'<div class="cd-t"><b>'+label+'</b><span>'+faDate(EXAM.date,true)+'</span><small>'+EXAM.dayNote+'</small></div></div></section>';
}
function refreshDates(){var r=$('#homeReg'),c=$('#homeCd');if(r)r.innerHTML=regHTML();if(c)c.innerHTML=countdownHTML();}
function courseMapHTML(){
  var H=SITE.home.courses,h='<section class="card"><h2>'+H.title+'</h2><p class="lead">'+H.lead+'</p>';
  GROUPS.forEach(function(g){
    var cs=COURSES.filter(function(c){return c.group===g.id;});
    h+='<div class="cg"><div class="cg-h"><b>'+g.name+'</b><span>ضریب '+fa(g.coef)+'</span></div><div class="cgrid">'+cs.map(function(c){
      if(c.hasContent){var st=courseStats(c.id);return '<button type="button" class="cc live '+c.id+'" data-go="'+c.id+'"><span class="cc-i">'+(IC[c.icon]||IC.book)+'</span><span class="cc-t"><b>'+c.name+'</b><small class="cst" data-c="'+c.id+'" data-u="تمرین">'+fa(st.done)+' از '+fa(st.n)+' تمرین</small></span></button>';}
      return '<div class="cc soon" aria-disabled="true"><span class="cc-i">'+IC.lock+'</span><span class="cc-t"><b>'+c.name+'</b><small>'+H.soon+'</small></span></div>';
    }).join('')+'</div></div>';
  });
  return h+'</section>';
}
function weightsHTML(){
  var Wt=SITE.home.weights,gs=GROUPS.slice().sort(function(a,b){return a.coef-b.coef;});
  var focusG=null;gs.forEach(function(g){if(LIVE.some(function(c){return c.group===g.id;}))focusG=g;});
  var h='<section class="card wcard"><h2>'+Wt.title+'</h2><div class="wbar" aria-hidden="true">';
  gs.forEach(function(g){h+='<span class="'+(g===focusG?'ws':'wm')+'" style="flex:'+g.coef+'">'+(g===focusG?'<i style="width:'+(Wt.focus.questions/g.approxQuestions*100).toFixed(1)+'%"></i>':'')+'</span>';});
  h+='</div><div class="wrows">';
  gs.forEach(function(g){
    h+='<div class="wr"><span class="sw '+(g===focusG?'ws':'wm')+'"></span><b>'+g.name+'</b><span>ضریب '+fa(g.coef)+'</span><span class="muted">حدود '+fa(g.approxQuestions)+' سوال</span></div>';
    if(g===focusG)h+='<div class="wr sub"><span class="sw wgr"></span><b>'+Wt.focus.name+'</b><span>'+Wt.focus.label+'</span><span class="muted">حدود '+fa(Wt.focus.questions)+' سوال</span></div>';
  });
  h+='</div><div class="focus"><b class="big">'+Wt.big+'</b><span>'+Wt.bigText+'<br><small>'+Wt.bigSmall+'</small></span></div>'+
    '<ul class="facts">'+Wt.facts.map(function(f){return '<li>'+f+'</li>';}).join('')+'</ul><p class="src">'+Wt.source+'</p></section>';
  return h;
}
function rankHTML(){
  var Rk=SITE.home.rank,ps=PATTERNS.filter(function(p){return p.rank;}).sort(function(a,b){return a.rank.order-b.rank.order;});
  return '<section class="card"><h2>'+Rk.title+'</h2><p class="lead">'+Rk.lead+'</p><ol class="rank">'+
    ps.map(function(p,j){var r=p.rank;return '<li><button type="button" class="rk '+p.c+'" data-go="'+p.c+'/'+p.id+'"><span class="rn">'+fa(j+1)+'</span><span class="rt">'+p.t+'<small>'+cShort(p.c)+'</small></span><span class="rf"><span>'+(r.repeat.indexOf(' از ')>0?'تکرار '+r.repeat:r.repeat)+'</span><span>'+fa(r.hours)+' ساعت</span></span></button></li>';}).join('')+'</ol></section>';
}
function planHTML(){
  var Pl=SITE.home.plan,wk=[],h;
  for(var w=1;w<=Pl.weeks;w++)wk.push(w);
  h='<section class="card"><div class="ch2"><h2>'+Pl.title+'</h2>'+seg(wk.map(function(w){return [w,'هفته '+fa(w)];}),S.week||1,'weeks')+'</div><div class="plan">';
  wk.forEach(function(w){h+='<ul class="pl'+((S.week||1)===w?' on':'')+'" data-w="'+w+'">'+PLAN.filter(function(d){return d.w===w;}).map(function(d){var on=!!S.plan[d.id];return '<li><button type="button" class="prow'+(on?' on':'')+'" data-p="'+d.id+'" aria-pressed="'+on+'"><span class="pcb">'+IC.check+'</span><span class="pd">روز '+fa(d.id.slice(1))+'</span><span class="ptx">'+planText(d)+'</span></button></li>';}).join('')+'</ul>';});
  return h+'</div></section>';
}
function homeHTML(){
  var H=SITE.home;
  var h='<section class="hero"><h1>'+H.title+'</h1><p class="sub">'+liveNames()+'<br><span>'+H.subtitle+'</span></p>'+
    '<div class="hrings">'+LIVE.map(function(c){var st=courseStats(c.id);return '<button type="button" class="hrc '+c.id+'" data-go="'+c.id+'">'+ringSvg(frac(st),c.id)+'<span><b>'+cShort(c.id)+'</b><small class="cst" data-c="'+c.id+'" data-u="تمرین">'+fa(st.done)+' از '+fa(st.n)+' تمرین</small></span></button>';}).join('')+'</div></section>';
  h+='<div id="homeReg">'+regHTML()+'</div><div id="homeCd">'+countdownHTML()+'</div>';
  h+=courseMapHTML()+weightsHTML()+rankHTML()+planHTML();
  h+='<section class="card"><h2>'+H.sources.title+'</h2><ul class="srcs">'+H.sources.items.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul><p class="src">'+H.sources.note+'</p></section>';
  return h;
}
