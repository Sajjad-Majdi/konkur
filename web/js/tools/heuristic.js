/* tools/heuristic: 1404 Q74 graph — figure "figHeur" and the admissible/consistent checker tool "heur" */
var HG={pos:{S:[180,36],A:[88,126],B:[272,126],C:[36,216],G:[180,216],D:[324,216]},e:[['S','A',4],['S','B',2],['A','C',3],['A','G',6],['B','D',2],['B','G',4]],nodes:['S','A','B','C','D','G'],h1:{S:5,A:3,B:3,C:1,D:1,G:0},h2:{S:5,A:6,B:3,C:3,D:6,G:0}};
function heurSvg(opt){
  opt=opt||{};var P=HG.pos,e='',n='',lab='';
  HG.e.forEach(function(ed){
    var a=P[ed[0]],b=P[ed[1]],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy),ux=dx/L,uy=dy/L,r=19;
    var x1=a[0]+ux*r,y1=a[1]+uy*r,x2=b[0]-ux*(opt.dir?r+3:r),y2=b[1]-uy*(opt.dir?r+3:r);
    var bad=opt.badE&&opt.badE[ed[0]+ed[1]];
    e+='<line x1="'+x1.toFixed(1)+'" y1="'+y1.toFixed(1)+'" x2="'+x2.toFixed(1)+'" y2="'+y2.toFixed(1)+'" class="hg-e'+(bad?' bad':'')+'"'+(opt.dir?' marker-end="url(#'+(bad?'arb':'ar')+')"':'')+'/>';
    var mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2,ox=-uy*13,oy=ux*13;
    if(ed[0]==='S'&&ed[1]==='A'){ox=-ox;oy=-oy;}
    if(ed[0]==='A'&&ed[1]==='C'){ox=-ox;oy=-oy;}
    if(ed[0]==='B'&&ed[1]==='G'){ox=-ox;oy=-oy;}
    lab+='<text x="'+(mx+ox).toFixed(1)+'" y="'+(my+oy+4).toFixed(1)+'" class="hg-w'+(bad?' bad':'')+'">'+ed[2]+'</text>';
  });
  HG.nodes.forEach(function(k){
    var p=P[k],bad=opt.badN&&opt.badN[k];
    n+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="18" class="hg-n'+(k==='G'?' goal':'')+(k==='S'?' start':'')+(bad?' bad':'')+'"/><text x="'+p[0]+'" y="'+(p[1]+5)+'" class="hg-l">'+k+'</text>';
    if(opt.h){
      var below=p[1]>200,tx=below?p[0]:(k==='A'?p[0]-34:(k==='B'?p[0]+34:p[0]+38)),ty=below?p[1]+36:p[1]+4;
      n+='<text x="'+tx+'" y="'+ty+'" class="hg-h'+(bad?' bad':'')+'">h '+opt.h[k]+'</text>';
      if(opt.hs)n+='<text x="'+tx+'" y="'+(ty+15)+'" class="hg-hs">h* '+(isFinite(opt.hs[k])?opt.hs[k]:'∞')+'</text>';
    }
  });
  var defs='<defs><marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="hg-ar"/></marker><marker id="arb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="hg-ar bad"/></marker></defs>';
  return '<svg viewBox="0 0 360 '+(opt.h?272:246)+'" class="hgs" role="img" aria-label="گراف">'+defs+e+lab+n+'</svg>';
}
regFig('figHeur',function(){
  var h='<div class="tw"><table class="dt ht" dir="ltr"><tr><th></th>'+HG.nodes.map(function(k){return '<th>'+k+'</th>';}).join('')+'</tr>';
  ['h1','h2'].forEach(function(r){h+='<tr><th>'+rich('$h_'+r.charAt(1)+'$')+'</th>'+HG.nodes.map(function(k){return '<td>'+HG[r][k]+'</td>';}).join('')+'</tr>';});
  return heurSvg({})+h+'</table></div>';
});
function hstar(dir){
  var dist={},adj={};HG.nodes.forEach(function(k){dist[k]=Infinity;adj[k]=[];});
  HG.e.forEach(function(e){adj[e[1]].push([e[0],e[2]]);if(!dir)adj[e[0]].push([e[1],e[2]]);});
  dist.G=0;var done={};
  for(var it=0;it<HG.nodes.length;it++){
    var u=null;HG.nodes.forEach(function(k){if(!done[k]&&(u===null||dist[k]<dist[u]))u=k;});
    if(u===null||!isFinite(dist[u]))break;done[u]=1;
    adj[u].forEach(function(p){if(dist[u]+p[1]<dist[p[0]])dist[p[0]]=dist[u]+p[1];});
  }
  return dist;
}
regTool('heur',function(el){
  var h=JSON.parse(JSON.stringify(HG.h2)),dir=false,pre='h2';
  el.innerHTML=wgHead('بررسی هیوریستیک ۱۴۰۴ سوال ۷۴',seg([['h1',rich('$h_1$')],['h2',rich('$h_2$')]],pre,'pre'))+
    '<div class="svgbox"></div>'+seg([['u','یال دوطرفه'],['d','یال یک‌طرفه رو به پایین']],'u','full dirs')+
    '<div class="hin" dir="ltr">'+HG.nodes.map(function(k){return '<label><span>'+k+'</span><input class="in sm" inputmode="numeric" data-k="'+k+'" value="'+h[k]+'"></label>';}).join('')+'</div>'+
    '<div class="hres" aria-live="polite"></div>';
  var box=$('.svgbox',el),res=$('.hres',el);
  function run(){
    var hs=hstar(dir),badN={},badE={},adm=[],con=[];
    HG.nodes.forEach(function(k){if(h[k]>hs[k]){badN[k]=1;adm.push('$h('+k+')='+h[k]+'>h^*('+k+')='+hs[k]+'$');}});
    HG.e.forEach(function(e){
      var pairs=dir?[[e[0],e[1]]]:[[e[0],e[1]],[e[1],e[0]]];
      pairs.forEach(function(p){if(h[p[0]]>e[2]+h[p[1]]){badE[e[0]+e[1]]=1;con.push('$h('+p[0]+')='+h[p[0]]+'>c('+p[0]+','+p[1]+')+h('+p[1]+')='+(e[2]+h[p[1]])+'$');}});
    });
    box.innerHTML=heurSvg({h:h,hs:hs,dir:dir,badN:badN,badE:badE});
    function line(t,okk,list){return '<div class="hr '+(okk?'good':'bad')+'"><span class="hr-i">'+(okk?IC.check:IC.x)+'</span><b>'+t+'</b><span class="hr-s">'+(okk?'برقرار است':'برقرار نیست')+'</span>'+(list.length?'<div class="hr-l">'+list.map(rich).join('<br>')+'</div>':'')+'</div>';}
    res.innerHTML=line('قابل قبول',!adm.length,adm)+line('سازگار',!con.length,con);
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!el.contains(b))return;var sg=b.parentNode;
    if(sg.classList.contains('pre')){segOn(sg,b.dataset.v);h=JSON.parse(JSON.stringify(HG[b.dataset.v]));$$('.hin input',el).forEach(function(inp){inp.value=h[inp.dataset.k];});run();}
    else if(sg.classList.contains('dirs')){segOn(sg,b.dataset.v);dir=b.dataset.v==='d';run();}
  });
  $('.hin',el).addEventListener('input',function(e){var v=parseInt(toLatin(e.target.value),10);if(isNaN(v)||v<0)return;h[e.target.dataset.k]=Math.min(99,v);segOn($('.pre',el),'');run();});
  run();
});
