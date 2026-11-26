/* tools/os-gantt: CPU scheduling simulator with a Gantt chart and the per-process times (tool "gantt").
   Unit-step simulation. Ties: arrival, then index; preemptive kinds keep the running process on a tie.
   RR: a process arriving at the end of a quantum joins the queue before the preempted one. Priority: smaller number first. */
function osSched(ps,alg,q){
  var n=ps.length,rem=ps.map(function(p){return p.b;}),arr=[],first=[],fin=[],segs=[],queue=[],cur=-1,ql=0,t=0,done=0,i;
  for(i=0;i<n;i++){arr.push(0);first.push(-1);fin.push(0);}
  function best(key){var b=-1;for(var j=0;j<n;j++){if(!arr[j]||rem[j]<=0)continue;if(b<0||key(j)<key(b)||(key(j)===key(b)&&(ps[j].a<ps[b].a||(ps[j].a===ps[b].a&&j<b))))b=j;}return b;}
  while(done<n&&t<2000){
    for(i=0;i<n;i++)if(!arr[i]&&ps[i].a<=t){arr[i]=1;queue.push(i);}
    if(alg==='rr'){
      if(cur>=0&&ql<=0){queue.push(cur);cur=-1;}
      if(cur<0&&queue.length){cur=queue.shift();ql=q;}
    }else if(alg==='srtf'||alg==='pp'){
      var k=alg==='srtf'?function(j){return rem[j];}:function(j){return ps[j].p;},b=best(k);
      if(cur<0||(b>=0&&k(b)<k(cur)))cur=b;
    }else if(cur<0){
      cur=best(alg==='sjf'?function(j){return ps[j].b;}:(alg==='pnp'?function(j){return ps[j].p;}:function(j){return ps[j].a;}));
    }
    if(cur<0){t++;continue;}
    if(alg==='rr'){var qi=queue.indexOf(cur);if(qi>=0)queue.splice(qi,1);}
    if(first[cur]<0)first[cur]=t;
    var L=segs[segs.length-1];
    if(L&&L[0]===cur&&L[2]===t)L[2]=t+1;else segs.push([cur,t,t+1]);
    rem[cur]--;t++;ql--;
    if(rem[cur]===0){fin[cur]=t;done++;cur=-1;}
  }
  return {segs:segs,fin:fin,first:first,end:t};
}
regTool('gantt',function(el){
  var PRE=[[[0,8,1],[1,4,1],[2,9,1],[3,5,1]],[[0,10,3],[0,1,1],[0,2,4],[0,1,5],[0,5,2]]];
  var ps=[],alg='fcfs',q=4;
  function load(k){ps=PRE[k].map(function(r){return {a:r[0],b:r[1],p:r[2]};});}
  load(0);
  el.innerHTML=wgHead('شبیه‌ساز زمان‌بندی',seg([[0,'مثال یادآوری'],[1,'۱۴۰۰ سؤال ۱۰۷']],0,'pre'))+
    seg([['fcfs','FCFS'],['sjf','SJF'],['srtf','SRTF'],['rr','RR'],['pnp','اولویت'],['pp','اولویت قبضه‌ای']],alg,'alg full')+
    '<div class="stps">'+stepper('n','تعداد فرایند',ps.length)+stepper('q','کوانتوم $q$',q)+'</div>'+
    '<div class="tw"><table class="dt gin"></table></div><div class="fig gsv"></div><div class="tw gres"></div>'+
    '<p class="muted" style="font-size:12.5px">اولویت: عدد کوچک‌تر یعنی اولویت بیشتر. در RR کاری که سر پایان کوانتوم می‌رسد جلوتر از کار قبضه‌شده در صف می‌نشیند.</p>';
  $$('.stp-l',el).forEach(function(s){s.innerHTML=rich(s.innerHTML);});
  function table(){
    var h='<thead><tr><th></th><th>ورود</th><th>اجرا</th><th>اولویت</th></tr></thead><tbody>';
    ps.forEach(function(p,i){h+='<tr><th>'+rich('$P_'+(i+1)+'$')+'</th>'+['a','b','p'].map(function(f){return '<td><input class="in sm" inputmode="numeric" data-i="'+i+'" data-f="'+f+'" value="'+fa(p[f])+'"></td>';}).join('')+'</tr>';});
    $('.gin',el).innerHTML=h+'</tbody>';
  }
  function run(){
    $$('.stp',el).forEach(function(s){var k=s.dataset.s;$('output',s).textContent=fa(k==='n'?ps.length:q);s.classList.toggle('off',k==='q'&&alg!=='rr');});
    var r=osSched(ps,alg,q),end=Math.max(1,r.end),sc=Math.min(14,300/end);
    var g=r.segs.map(function(x){return ['P'+(x[0]+1),x[1],x[2]];});
    $('.gsv',el).innerHTML=rfSvg(Math.ceil(34+end*sc+14),48,'نمودار گانت',osGantt(g,20,8,sc,24));
    var sT=0,sW=0,sR=0,n=ps.length,h='<table class="dt"><thead><tr><th></th><th>پایان</th><th>برگشت</th><th>انتظار</th><th>پاسخ</th></tr></thead><tbody>';
    ps.forEach(function(p,i){var T=r.fin[i]-p.a,W=T-p.b,R=r.first[i]-p.a;sT+=T;sW+=W;sR+=R;
      h+='<tr><th>'+rich('$P_'+(i+1)+'$')+'</th><td>'+fa(r.fin[i])+'</td><td>'+fa(T)+'</td><td>'+fa(W)+'</td><td>'+fa(R)+'</td></tr>';});
    var av=function(x){return fa(+(x/n).toFixed(2));};
    h+='<tr><th>میانگین</th><td></td><td><b>'+av(sT)+'</b></td><td><b>'+av(sW)+'</b></td><td><b>'+av(sR)+'</b></td></tr></tbody></table>';
    $('.gres',el).innerHTML=h;
  }
  el.addEventListener('input',function(e){
    var t=e.target;if(!t.dataset||t.dataset.i===undefined)return;
    var v=parseInt(toLatin(t.value),10);if(isNaN(v)||v<0)return;
    var f=t.dataset.f;ps[+t.dataset.i][f]=Math.min(f==='a'?60:30,f==='b'?Math.max(1,v):v);segOn($('.pre',el),'');run();
  });
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!el.contains(b))return;
    var sg=b.parentNode;
    if(sg.classList.contains('pre')){segOn(sg,b.dataset.v);load(+b.dataset.v);table();run();return;}
    if(sg.classList.contains('alg')){segOn(sg,b.dataset.v);alg=b.dataset.v;run();return;}
    var s=b.closest('.stp');if(!s)return;var d=+b.dataset.d;
    if(s.dataset.s==='q')q=Math.max(1,Math.min(20,q+d));
    else{var m=Math.max(2,Math.min(5,ps.length+d));while(ps.length<m)ps.push({a:ps.length,b:3,p:ps.length+1});ps.length=m;segOn($('.pre',el),'');table();}
    run();
  });
  table();run();
});
