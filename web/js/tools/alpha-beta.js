/* tools/alpha-beta: game trees of 1403 Q68 and 1404 Q69 — figures "figAB1403"/"figAB1404" and the step simulator tool "ab" */
var AB_TREES={
  '1403':{t:'max',nm:'ریشه',ch:[
    {t:'min',nm:'MIN چپ',ch:[{t:'max',nm:'MAX چپ',ch:[{v:8},{v:2}]},{t:'max',nm:'گره A',lb:'A',ch:[{v:5,lb:'B'},{v:3,lb:'C'}]}]},
    {t:'min',nm:'گره D',lb:'D',ch:[{v:15},{t:'max',nm:'گره E',lb:'E',ch:[{v:4,lb:'F'},{v:7,lb:'G'}]}]}]},
  '1404':{t:'max',nm:'ریشه',ch:[{v:10},
    {t:'min',nm:'MIN وسط',ch:[{t:'max',nm:'MAX اول وسط',ch:[{v:4},{v:3},{v:2}]},{t:'max',nm:'MAX دوم وسط',ch:[{v:7},{v:1}]}]},
    {t:'min',nm:'MIN راست',ch:[{t:'max',nm:'MAX اول راست',ch:[{v:15},{v:6}]},{t:'max',nm:'MAX دوم راست',ch:[{v:20},{v:23}]}]}]}
};
function prepTree(src){var t=JSON.parse(JSON.stringify(src)),k=0,leaves=[];(function w(n,d){n.id='n'+(k++);n.d=d;if(n.ch)n.ch.forEach(function(c){w(c,d+1);});else leaves.push(n);})(t,0);return {t:t,leaves:leaves};}
function sv(x){return x===Infinity?'∞':(x===-Infinity?'−∞':String(x).replace('-','−'));}
function drawAB(T,fr){
  var GX=46,GY=82,PX=26,PY=30,t=T.t,leaves=T.leaves,maxd=0;
  leaves.forEach(function(l,i){l.x=PX+i*GX;});
  (function sx(n){if(n.ch){n.ch.forEach(sx);n.x=(n.ch[0].x+n.ch[n.ch.length-1].x)/2;}n.y=PY+n.d*GY;if(n.d>maxd)maxd=n.d;})(t);
  var Wd=PX*2+(leaves.length-1)*GX,H=PY+maxd*GY+30;
  var st=fr?fr.st:{},pr=fr?fr.pr:{},cur=fr?fr.cur:null,e='',cut='',nd='';
  walk(t,function(n){
    if(!n.ch)return;
    n.ch.forEach(function(c){
      var p=pr[c.id];
      e+='<line x1="'+n.x+'" y1="'+(n.y+(n.t==='max'?13:18))+'" x2="'+c.x+'" y2="'+(c.y-(c.ch?(c.t==='max'?18:13):13))+'" class="ab-e'+(p?' pr':'')+'"/>';
      if(p&&!pr[n.id]){var mx=(n.x+c.x)/2,my=(n.y+c.y)/2+4;cut+='<path d="M'+(mx-6)+' '+(my-6)+'l12 12M'+(mx+6)+' '+(my-6)+'l-12 12" class="ab-cut"/>';}
    });
  });
  walk(t,function(n){
    var s=st[n.id],p=pr[n.id];
    var g='<g class="ab-n'+(p?' pr':'')+(n.id===cur?' cur':'')+(s?' vis':'')+(s&&s.done?' dn':'')+'">';
    if(n.id===cur)g+='<circle cx="'+n.x+'" cy="'+n.y+'" r="25" class="ab-halo"/>';
    if(!n.ch){
      g+='<rect x="'+(n.x-16)+'" y="'+(n.y-13)+'" width="32" height="26" rx="8" class="ab-leaf"/><text x="'+n.x+'" y="'+(n.y+5)+'" class="ab-v">'+sv(n.v)+'</text>';
    }else{
      var up=n.t==='max',pts=up?[n.x,n.y-19,n.x-19,n.y+13,n.x+19,n.y+13]:[n.x-19,n.y-13,n.x+19,n.y-13,n.x,n.y+19];
      g+='<polygon points="'+pts.join(' ')+'" class="ab-tri '+(up?'mx':'mn')+'"/>';
      if(s&&s.v!==null&&s.v!==undefined&&isFinite(s.v))g+='<text x="'+n.x+'" y="'+(n.y+(up?8:1))+'" class="ab-v in">'+sv(s.v)+'</text>';
      if(s&&s.a!==undefined)g+='<text x="'+n.x+'" y="'+(n.y+(up?29:34))+'" class="ab-ab">['+sv(s.a)+' , '+sv(s.b)+']</text>';
    }
    if(n.lb)g+='<text x="'+(n.x+(n.ch?23:21))+'" y="'+(n.y-11)+'" class="ab-lb">'+n.lb+'</text>';
    nd+=g+'</g>';
  });
  return '<svg viewBox="0 0 '+Wd+' '+H+'" class="abs" role="img" aria-label="درخت بازی">'+e+cut+nd+'</svg>';
}
regFig('figAB1403',function(){return drawAB(prepTree(AB_TREES['1403']),null);});
regFig('figAB1404',function(){return drawAB(prepTree(AB_TREES['1404']),null);});
function simAB(T){
  var F=[],st={},pr={};
  function nm(n){return n.ch?n.nm:(n.lb?'برگ '+n.lb:'برگ $'+n.v+'$');}
  function snap(n,msg){F.push({cur:n.id,st:JSON.parse(JSON.stringify(st,function(k,v){return v===Infinity?'+I':(v===-Infinity?'-I':v);}),function(k,v){return v==='+I'?Infinity:(v==='-I'?-Infinity:v);}),pr:Object.assign({},pr),msg:msg});}
  function mp(n){walk(n,function(x){pr[x.id]=1;});}
  function fm(x){return x===Infinity?'+\\infty':(x===-Infinity?'-\\infty':String(x));}
  function rec(n,a,b){
    if(!n.ch){st[n.id]={v:n.v,done:1};snap(n,nm(n)+' با مقدار $'+n.v+'$');return n.v;}
    var mx=n.t==='max',v=mx?-Infinity:Infinity;
    st[n.id]={a:a,b:b,v:null};
    snap(n,'ورود به '+nm(n)+' با $\\alpha='+fm(a)+'$ و $\\beta='+fm(b)+'$');
    for(var i=0;i<n.ch.length;i++){
      var cv=rec(n.ch[i],a,b);
      if(mx){
        v=Math.max(v,cv);st[n.id].v=v;
        if(v>=b){var rest=n.ch.slice(i+1);rest.forEach(mp);st[n.id].done=1;snap(n,rest.length?'در '+nm(n)+' داریم $v='+fm(v)+'\\ge\\beta='+fm(b)+'$ پس '+fa(rest.length)+' فرزند بعدی هرس شد':'در '+nm(n)+' داریم $v='+fm(v)+'\\ge\\beta$ و برمی‌گردد');return v;}
        a=Math.max(a,v);st[n.id].a=a;
        snap(n,'در '+nm(n)+' حالا $v='+fm(v)+'$ و $\\alpha='+fm(a)+'$');
      }else{
        v=Math.min(v,cv);st[n.id].v=v;
        if(v<=a){var rest2=n.ch.slice(i+1);rest2.forEach(mp);st[n.id].done=1;snap(n,rest2.length?'در '+nm(n)+' داریم $v='+fm(v)+'\\le\\alpha='+fm(a)+'$ پس '+fa(rest2.length)+' فرزند بعدی هرس شد':'در '+nm(n)+' داریم $v='+fm(v)+'\\le\\alpha$ و برمی‌گردد');return v;}
        b=Math.min(b,v);st[n.id].b=b;
        snap(n,'در '+nm(n)+' حالا $v='+fm(v)+'$ و $\\beta='+fm(b)+'$');
      }
    }
    st[n.id].done=1;snap(n,'مقدار نهایی '+nm(n)+' برابر $'+fm(v)+'$');return v;
  }
  var val=rec(T.t,-Infinity,Infinity);
  var cut=T.leaves.filter(function(l){return pr[l.id];});
  var last=F[F.length-1];
  F.push({cur:T.t.id,st:last.st,pr:last.pr,msg:'مقدار ریشه $'+val+'$ و '+(cut.length?fa(cut.length)+' برگ هرس شد ('+cut.map(function(l){return l.lb?l.lb:'$'+l.v+'$';}).join(' و ')+')':'هیچ گره‌ای هرس نشد'),end:1});
  return F;
}
regTool('ab',function(el){
  var key='1403',T,F,i=0;
  el.innerHTML=wgHead('شبیه‌ساز آلفا-بتا',seg([['1403','۱۴۰۳ سوال ۶۸'],['1404','۱۴۰۴ سوال ۶۹']],key))+
    '<div class="svgbox"></div><div class="abmsg" aria-live="polite"></div>'+
    '<div class="ctl"><button type="button" class="cb" data-a="first" aria-label="از اول">'+IC.first+'</button><button type="button" class="cb" data-a="prev" aria-label="قبلی">'+IC.prev+'</button><span class="cnt"></span><button type="button" class="cb pri" data-a="next" aria-label="بعدی">'+IC.next+'</button><button type="button" class="cb" data-a="last" aria-label="تا آخر">'+IC.last+'</button></div>'+
    '<div class="leafed"><span class="lbl">برگ‌ها</span><div class="leafin" dir="ltr"></div></div>';
  var box=$('.svgbox',el),msg=$('.abmsg',el),cnt=$('.cnt',el),li=$('.leafin',el);
  function load(k){key=k;T=prepTree(AB_TREES[k]);li.innerHTML=T.leaves.map(function(l,j){return '<input class="in sm" inputmode="numeric" data-j="'+j+'" value="'+l.v+'" aria-label="برگ '+(j+1)+'">';}).join('');F=simAB(T);i=0;draw();}
  function draw(){var f=F[i];box.innerHTML=drawAB(T,f);msg.innerHTML=rich(f.msg);msg.classList.toggle('end',!!f.end);cnt.textContent=fa(i+1)+' از '+fa(F.length);$('[data-a="prev"]',el).disabled=i===0;$('[data-a="first"]',el).disabled=i===0;$('[data-a="next"]',el).disabled=i===F.length-1;$('[data-a="last"]',el).disabled=i===F.length-1;}
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!el.contains(b))return;
    if(b.parentNode.classList.contains('seg')){segOn(b.parentNode,b.dataset.v);load(b.dataset.v);return;}
    var a=b.dataset.a;if(!a)return;
    if(a==='first')i=0;else if(a==='prev')i=Math.max(0,i-1);else if(a==='next')i=Math.min(F.length-1,i+1);else if(a==='last')i=F.length-1;
    draw();
  });
  li.addEventListener('input',function(e){var inp=e.target;var v=parseInt(toLatin(inp.value).replace(/[−–]/g,'-'),10);if(isNaN(v))return;T.leaves[+inp.dataset.j].v=Math.max(-99,Math.min(99,v));F=simAB(T);i=F.length-1;draw();});
  load(key);
});
