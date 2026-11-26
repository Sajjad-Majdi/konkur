/* tools/master: master theorem with the extended log case (tool "master") */
function fStr(k,p){
  var a=k===0?'':(k===1?'n':(k===0.5?'\\sqrt{n}':'n^{'+k+'}'));
  var b=p===0?'':(p===1?'\\log n':(p===-1?'\\frac{1}{\\log n}':(p<0?'\\frac{1}{\\log^{'+(-p)+'} n}':'\\log^{'+p+'} n')));
  if(!a&&!b)return '1';
  if(p<0)return a?'\\frac{'+a+'}{\\log'+(p===-1?'':'^{'+(-p)+'}')+' n}':b;
  return a+(a&&b?'\\,':'')+b;
}
regTool('master',function(el){
  var v={a:2,b:2,k:1,p:1};
  var P=[[16,4,1,0],[1,5,0,0],[3,4,1,1],[2,2,1,1]];
  el.innerHTML=wgHead('قضیه اصلی',seg(P.map(function(x,j){return [j,fa(j+1)];}),3,'pre'))+
    '<div class="mf"></div><div class="stps">'+stepper('a','$a$',v.a)+stepper('b','$b$',v.b)+stepper('k','توان $n$',v.k)+stepper('p','توان $\\log$',v.p)+'</div><div class="mres" aria-live="polite"></div>';
  $$('.stp-l',el).forEach(function(s){s.innerHTML=rich(s.innerHTML);});
  function run(){
    $$('.stp',el).forEach(function(s){$('output',s).textContent=fa(v[s.dataset.s]);});
    var c=Math.log(v.a)/Math.log(v.b),ci=Math.abs(c-Math.round(c))<1e-9;
    var cs=ci?String(Math.round(c)):c.toFixed(2),ncs=ci?(Math.round(c)===0?'1':(Math.round(c)===1?'n':'n^{'+Math.round(c)+'}')):'n^{'+cs+'}';
    var f=fStr(v.k,v.p);
    $('.mf',el).innerHTML=rich('$T(n)='+(v.a===1?'':v.a)+'T(n/'+v.b+')+'+f+'$');
    var r1='$n^{\\log_{'+v.b+'}'+v.a+'}='+ncs+'$'+(ci?'':' تقریبی'),cmp,res,note='';
    var eq=Math.abs(v.k-c)<1e-9;
    if(!eq&&v.k<c){cmp='$f(n)$ چندجمله‌ای کوچک‌تر است';res=ncs;note='حالت ۱';}
    else if(!eq&&v.k>c){cmp='$f(n)$ چندجمله‌ای بزرگ‌تر است';res=f;note='حالت ۳';}
    else{
      var base=ncs==='1'?'':ncs;
      if(v.p===0){cmp='$f(n)$ هم‌اندازه است';res=(base?base+'\\,':'')+'\\log n';note='حالت ۲';}
      else if(v.p>0){cmp='نسبت فقط $'+(v.p===1?'\\log n':'\\log^{'+v.p+'} n')+'$ است';res=(base?base+'\\,':'')+'\\log^{'+(v.p+1)+'} n';note='قضیه ساده جواب نمی‌دهد و نسخه گسترش‌یافته';}
      else if(v.p===-1){cmp='نسبت $\\frac{1}{\\log n}$ است';res=(base?base+'\\,':'')+'\\log\\log n';note='قضیه ساده جواب نمی‌دهد و نسخه گسترش‌یافته';}
      else{cmp='نسبت $\\frac{1}{\\log^{'+(-v.p)+'} n}$ است';res=base||'1';note='قضیه ساده جواب نمی‌دهد و نسخه گسترش‌یافته';}
    }
    $('.mres',el).innerHTML='<div class="mr">'+rich(r1)+'</div><div class="mr">'+rich(cmp)+'</div><div class="mr big"><span class="tag">'+note+'</span>'+rich('$T(n)=\\Theta('+res+')$')+'</div>';
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!el.contains(b))return;
    if(b.parentNode.classList.contains('pre')){segOn(b.parentNode,b.dataset.v);var x=P[+b.dataset.v];v={a:x[0],b:x[1],k:x[2],p:x[3]};run();return;}
    var s=b.closest('.stp');if(!s)return;var k=s.dataset.s,d=+b.dataset.d;
    if(k==='a')v.a=Math.max(1,Math.min(64,v.a+d));
    if(k==='b')v.b=Math.max(2,Math.min(10,v.b+d));
    if(k==='k')v.k=Math.max(0,Math.min(4,v.k+d*0.5));
    if(k==='p')v.p=Math.max(-2,Math.min(3,v.p+d));
    segOn($('.pre',el),'');run();
  });
  run();
});
