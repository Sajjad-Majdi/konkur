/* boot/app: views and nav built from the course registry, routing (#view/pattern), theme, boot */
var VIEWS=['home'].concat(LIVE.map(function(c){return c.id;})).concat(['exam']),cur=null;
function navInd(){
  var nav=$('#nav'),on=$('#nav button[data-v="'+cur+'"]'),ind=$('#nav .ind');
  $$('#nav button').forEach(function(b){var o=b===on;b.classList.toggle('on',o);if(o)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
  if(on&&nav.classList.contains('many')){var r0=nav.getBoundingClientRect(),b0=on.getBoundingClientRect();if(b0.left<r0.left+6)nav.scrollLeft-=r0.left+6-b0.left;else if(b0.right>r0.right-6)nav.scrollLeft+=b0.right-r0.right+6;}
  if(on&&ind){var nr=nav.getBoundingClientRect(),br=on.getBoundingClientRect();ind.style.width=br.width+'px';ind.style.transform='translateX('+(br.left-nr.left+nav.scrollLeft)+'px)';}
}
function show(v,sub){
  if(v!==cur){
    cur=v;
    $$('.view').forEach(function(el){var on=el.id==='v-'+v;el.hidden=!on;if(on){el.classList.remove('enter');void el.offsetWidth;el.classList.add('enter');}});
    D.documentElement.setAttribute('data-view',v);
    navInd();
    if(!sub)W.scrollTo(0,0);
    S.view=v;save();
  }
  if(sub){var p=$('#p-'+sub);if(p){togglePat(p,true);setTimeout(function(){p.scrollIntoView({behavior:'smooth',block:'start'});},80);}}
}
function route(){var h=(location.hash||'').replace(/^#/,'').split('/');var v=VIEWS.indexOf(h[0])>=0?h[0]:'home';show(v,h[1]);}
function isDark(){var t=S.theme;if(t==='dark')return true;if(t==='light')return false;try{return W.matchMedia('(prefers-color-scheme: dark)').matches;}catch(e){return false;}}
function applyTheme(){
  var r=D.documentElement;if(S.theme==='light'||S.theme==='dark')r.setAttribute('data-theme',S.theme);else r.removeAttribute('data-theme');
  var dk=isDark();$('#themeBtn').innerHTML=dk?IC.sun:IC.moon;$('#themeBtn').setAttribute('aria-label',dk?'پوسته روشن':'پوسته تیره');
  var m=$('meta[name="theme-color"]');if(m)m.setAttribute('content',dk?'#121624':'#f3efe6');
}
function buildShell(){
  var navItems=[['home','نقشه','map']].concat(LIVE.map(function(c){return [c.id,cShort(c.id),IC[c.icon]?c.icon:'book'];})).concat([['exam','روز آزمون','exam']]);
  var nav=$('#nav');
  nav.innerHTML='<span class="ind" aria-hidden="true"></span>'+navItems.map(function(n){return '<button type="button" data-v="'+n[0]+'">'+IC[n[2]]+'<span>'+n[1]+'</span></button>';}).join('');
  nav.classList.toggle('many',navItems.length>5);
  $('#app').innerHTML=VIEWS.map(function(v){return '<div class="view" id="v-'+v+'"'+(v==='home'?'':' hidden')+'></div>';}).join('');
  $('#v-home').innerHTML=homeHTML();
  LIVE.forEach(function(c){$('#v-'+c.id).innerHTML=courseHTML(c.id);});
  $('#v-exam').innerHTML=examHTML();
  $$('#v-exam .wg[data-w]').forEach(mountTool);
}
function boot(){
  buildShell();
  $$('.dot[data-q]').forEach(function(d){d.className='dot '+qState(d.dataset.q);});
  refreshProgress();applyTheme();
  D.addEventListener('click',function(e){
    var t=e.target,b;
    if(t.closest('.wg'))return;
    if((b=t.closest('[data-ts]'))){onTS(b);return;}
    if((b=t.closest('.pat-h'))){togglePat(b.parentNode);return;}
    if((b=t.closest('.opt'))){onOpt(b);return;}
    if((b=t.closest('[data-qa]'))){onQA(b);return;}
    if((b=t.closest('#nav button'))){var v=b.dataset.v;if(location.hash==='#'+v)W.scrollTo({top:0,behavior:'smooth'});else location.hash='#'+v;return;}
    if((b=t.closest('[data-go]'))){location.hash='#'+b.dataset.go;return;}
    if((b=t.closest('.prow'))){var id=b.dataset.p,on=!S.plan[id];if(on)S.plan[id]=1;else delete S.plan[id];b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');save();return;}
    if((b=t.closest('.weeks button'))){var w=+b.dataset.v;S.week=w;save();segOn(b.parentNode,w);$$('.pl').forEach(function(u){u.classList.toggle('on',+u.dataset.w===w);});return;}
    if((b=t.closest('[data-test]'))){startTest(b.dataset.test);return;}
    if((b=t.closest('#themeBtn'))){S.theme=isDark()?'light':'dark';save();D.documentElement.classList.add('tt');applyTheme();setTimeout(function(){D.documentElement.classList.remove('tt');},520);return;}
  });
  D.addEventListener('toggle',function(e){if(e.target.classList&&e.target.classList.contains('rvw'))onReviewToggle(e.target);},true);
  D.addEventListener('keydown',function(e){if(e.key==='Escape'&&T){if(T.done)closeSheet();}});
  D.addEventListener('visibilitychange',function(){if(!D.hidden)refreshDates();});
  setInterval(refreshDates,60000);
  W.addEventListener('hashchange',route);
  W.addEventListener('resize',function(){navInd();});
  try{W.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',applyTheme);}catch(e){}
  if(!location.hash&&S.view&&VIEWS.indexOf(S.view)>=0&&S.view!=='home'){try{history.replaceState(null,'','#'+S.view);}catch(e){}}
  route();
  setTimeout(navInd,60);
  if(D.fonts&&D.fonts.ready)D.fonts.ready.then(navInd);
  /* offline support: only the hosted build links a manifest and ships sw.js */
  if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)&&$('link[rel="manifest"]')){
    W.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
  }
}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',boot);else boot();
