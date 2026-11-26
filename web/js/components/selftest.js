/* components/selftest: timed self-test sheet with negative marking (3C-W)/3N, 135 s per question */
var T=null;
function sheetEl(){return $('#sheet');}
function startTest(c){
  T={c:c,ids:SELFTEST[c].slice(),ans:{},i:0,total:SELFTEST[c].length*135,t0:Date.now(),done:false};
  var sh=sheetEl();
  sh.innerHTML='<div class="sh-h"><div class="sh-t"><b>آزمونک '+COURSE[c].name+'</b><span class="sh-n"></span></div><div class="timer" aria-live="off"><b class="tm"></b><i></i><span class="ts2"></span></div><button type="button" class="icon-btn" data-ts="end" aria-label="پایان">'+IC.x+'</button></div>'+
    '<div class="sh-dots">'+T.ids.map(function(id,j){return '<button type="button" data-ts="go" data-j="'+j+'">'+fa(j+1)+'</button>';}).join('')+'</div><div class="sh-b"></div>'+
    '<div class="sh-f"><button type="button" class="btn ghost" data-ts="prev">قبلی</button><button type="button" class="btn" data-ts="next">بعدی</button></div>';
  sh.className='sheet '+c;sh.hidden=false;D.body.classList.add('lock');
  showTQ();tick();T.iv=setInterval(tick,250);
}
function tick(){
  if(!T||T.done)return;
  var left=Math.max(0,T.total-Math.floor((Date.now()-T.t0)/1000)),m=Math.floor(left/60),s=left%60;
  var sh=sheetEl();$('.tm',sh).textContent=fa(m<10?'0'+m:m);$('.ts2',sh).textContent=fa(s<10?'0'+s:s);
  $('.timer',sh).classList.toggle('warn',left<=120);
  if(left===0)finishTest();
}
function showTQ(){
  var sh=sheetEl(),id=T.ids[T.i],b=$('.sh-b',sh);
  b.innerHTML=qCard(id,'t');b.firstChild.classList.add('enter');
  var a=T.ans[id];if(a)$('.opt[data-k="'+a+'"]',b).classList.add('sel');
  $('.sh-n',sh).textContent='سوال '+fa(T.i+1)+' از '+fa(T.ids.length);
  $$('.sh-dots button',sh).forEach(function(x,j){x.classList.toggle('cur',j===T.i);x.classList.toggle('ans',!!T.ans[T.ids[j]]);});
  $('[data-ts="prev"]',sh).disabled=T.i===0;
  var nx=$('[data-ts="next"]',sh);nx.textContent=T.i===T.ids.length-1?'پایان و نمره':'بعدی';
  sh.scrollTop=0;b.scrollTop=0;
}
function testPick(qe,b){
  if(!T||T.done)return;var id=qe.dataset.q,k=+b.dataset.k;
  if(T.ans[id]===k){delete T.ans[id];b.classList.remove('sel');}
  else{T.ans[id]=k;$$('.opt',qe).forEach(function(o){o.classList.toggle('sel',o===b);});}
  var j=T.ids.indexOf(id);$$('.sh-dots button',sheetEl())[j].classList.toggle('ans',!!T.ans[id]);
}
function finishTest(){
  if(!T||T.done)return;T.done=true;clearInterval(T.iv);
  var C=0,Wr=0,B=0,N=T.ids.length;
  T.ids.forEach(function(id){var a=T.ans[id];if(!a)B++;else if(a===Q[id].key)C++;else Wr++;});
  var p=(3*C-Wr)/(3*N)*100,used=Math.min(T.total,Math.round((Date.now()-T.t0)/1000));
  var prev=S.test[T.c];var best=prev&&typeof prev.best==='number'?Math.max(prev.best,p):p;
  S.test[T.c]={best:best,last:p,at:Date.now()};save();refreshProgress();
  var sh=sheetEl();
  $('.timer',sh).classList.add('stop');$('.sh-dots',sh).hidden=true;$('.sh-n',sh).textContent='نتیجه';
  var h='<div class="res enter"><div class="score"><b>'+pct(p)+'</b><span>نمره با احتساب نمره منفی</span></div>'+
    '<div class="rc"><div class="g"><b>'+fa(C)+'</b><span>درست</span></div><div class="b"><b>'+fa(Wr)+'</b><span>غلط</span></div><div><b>'+fa(B)+'</b><span>نزده</span></div><div><b>'+fa(Math.floor(used/60))+'<small>دقیقه</small>'+fa(used%60)+'<small>ثانیه</small></b><span>زمان</span></div></div>'+
    '<p class="best">بهترین نمره تا حالا '+pct(best)+'</p><h3>مرور</h3>';
  T.ids.forEach(function(id,j){
    var q=Q[id],a=T.ans[id],cls=!a?'blank':(a===q.key?'good':'bad'),pt=patOf(id);
    h+='<details class="rv '+cls+'"><summary><span class="rv-n">'+fa(j+1)+'</span><span class="rv-t">کنکور '+fa(q.y)+' سوال '+fa(q.n)+(pt?'<small>'+pt.t+'</small>':'')+'</span><span class="rv-a">'+(a?'جواب تو '+fa(a):'نزده')+'<b>کلید '+fa(q.key)+'</b></span></summary><div class="rv-b"><div class="qt">'+rich(q.t)+'</div><ol class="opts-r">'+q.o.map(function(o,k){return '<li class="'+(k+1===q.key?'k':'')+(k+1===a&&a!==q.key?' w':'')+'"><span class="onum">'+fa(k+1)+'</span><span>'+rich(o)+'</span></li>';}).join('')+'</ol><ol class="steps">'+q.s.map(function(s){return '<li style="animation:none">'+rich(s)+'</li>';}).join('')+'</ol></div></details>';
  });
  h+='</div>';
  $('.sh-b',sh).innerHTML=h;
  $('.sh-f',sh).innerHTML='<button type="button" class="btn ghost" data-ts="again">دوباره</button><button type="button" class="btn" data-ts="close">بستن</button>';
  $('.sh-b',sh).scrollTop=0;
}
function closeSheet(){var sh=sheetEl();if(T&&T.iv)clearInterval(T.iv);T=null;sh.classList.add('out');setTimeout(function(){sh.hidden=true;sh.classList.remove('out');sh.innerHTML='';D.body.classList.remove('lock');},260);}
function onTS(b){
  var a=b.dataset.ts;if(!T&&a!=='close')return;
  if(a==='end'){if(T.done)closeSheet();else finishTest();}
  else if(a==='next'){if(T.i===T.ids.length-1)finishTest();else{T.i++;showTQ();}}
  else if(a==='prev'){if(T.i>0){T.i--;showTQ();}}
  else if(a==='go'){T.i=+b.dataset.j;showTQ();}
  else if(a==='again'){var c=T.c;clearInterval(T.iv);startTest(c);}
  else if(a==='close')closeSheet();
}
