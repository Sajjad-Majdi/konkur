/* tools/rv-ai: exact figures for the AI «یادآوری» refreshers (figRv*), plus the small SVG helpers the DS refresher figures share.
   Colours come from CSS classes (.rf, .rf-*) so every figure follows the site palette; labels are Latin (LTR) on purpose. */
function rfSvg(w,h,label,body,cls){return '<svg viewBox="0 0 '+w+' '+h+'" class="'+(cls||'rf')+'" role="img" aria-label="'+label+'">'+body+'</svg>';}
function rfL(x1,y1,x2,y2,c){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" class="rf-e'+(c?' '+c:'')+'"/>';}
function rfC(x,y,r,c){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" class="'+c+'"/>';}
function rfT(x,y,s,c,extra){return '<text x="'+x+'" y="'+y+'" class="'+(c||'rf-s')+'"'+(extra||'')+'>'+s+'</text>';}
function rfN(x,y,r,s,c){return rfC(x,y,r,'rf-n'+(c?' '+c:''))+rfT(x,y+4.5,s,'rf-l');}
function rfBox(x,y,w,h,s,c,tc){return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="7" class="rf-n'+(c?' '+c:'')+'"/>'+rfT(x,y+4.5,s,tc||'rf-l');}
/* straight edge from the rim of one node to the rim of the other (ra, rb = radii) */
function rfEdge(a,b,ra,rb,c,mk){
  var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy),ux=dx/L,uy=dy/L;
  return '<line x1="'+(a[0]+ux*ra).toFixed(1)+'" y1="'+(a[1]+uy*ra).toFixed(1)+'" x2="'+(b[0]-ux*rb).toFixed(1)+'" y2="'+(b[1]-uy*rb).toFixed(1)+'" class="rf-e'+(c?' '+c:'')+'"'+(mk?' marker-end="url(#'+mk+')"':'')+'/>';
}
/* label at the middle of edge a-b, pushed sideways by off (sign picks the side) */
function rfMid(a,b,off,s,c){
  var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy),nx=-dy/L,ny=dx/L;
  return rfT(((a[0]+b[0])/2+nx*off).toFixed(1),((a[1]+b[1])/2+ny*off+4).toFixed(1),s,c||'rf-w');
}

/* A1: expansion order of BFS (purple) and DFS (orange) on one small tree */
regFig('figRvBfsDfs',function(){
  var P={A:[180,40],B:[95,105],C:[265,105],D:[50,172],E:[140,172],F:[220,172],G:[310,172]};
  var bfs={A:1,B:2,C:3,D:4,E:5,F:6,G:7},dfs={A:1,B:2,D:3,E:4,C:5,F:6,G:7},s='';
  [['A','B'],['A','C'],['B','D'],['B','E'],['C','F'],['C','G']].forEach(function(e){s+=rfEdge(P[e[0]],P[e[1]],17,17);});
  Object.keys(P).forEach(function(k){
    var p=P[k];
    s+=rfN(p[0],p[1],17,k)+rfC(p[0]-28,p[1],10,'rf-b1')+rfT(p[0]-28,p[1]+3.5,bfs[k],'rf-bt')+rfC(p[0]+28,p[1],10,'rf-b2')+rfT(p[0]+28,p[1]+3.5,dfs[k],'rf-bt');
  });
  s+=rfC(14,14,7,'rf-b1')+rfT(26,18,'BFS','rf-s st')+rfC(74,14,7,'rf-b2')+rfT(86,18,'DFS','rf-s st');
  return rfSvg(360,196,'ترتیب بسط گره‌ها در BFS و DFS',s);
});

/* A2: equal-f contours. UCS spreads in circles; A* (h = straight-line distance) gives ellipses with foci S and G */
regFig('figRvContours',function(){
  var s=rfL(180,24,180,178,'dsh');
  [69,46,23].forEach(function(r){s+=rfC(90,100,r,'rf-ct');});
  var c0=57.5;
  [78,68,61].forEach(function(a){s+='<ellipse cx="262.5" cy="100" rx="'+a+'" ry="'+Math.sqrt(a*a-c0*c0).toFixed(1)+'" class="rf-ct"/>';});
  s+=rfN(90,100,10,'S')+rfN(160,100,10,'G','g')+rfN(205,100,10,'S')+rfN(320,100,10,'G','g');
  s+=rfT(90,16,'UCS:  f = g','rf-s b')+rfT(270,16,'A*:  f = g + h','rf-s b');
  return rfSvg(360,184,'خط‌های هم‌هزینه در UCS و A*',s);
});

/* A2: consistency is a triangle inequality */
regFig('figRvConsist',function(){
  var n=[60,112],m=[196,42],g=[304,120],s='';
  s+=rfEdge(n,m,17,17,'on')+rfEdge(m,g,17,17,'dsh')+rfEdge(n,g,17,17,'dsh');
  s+=rfN(n[0],n[1],17,'n')+rfN(m[0],m[1],17,'n′')+rfN(g[0],g[1],17,'G','g');
  s+=rfT(118,62,'c(n, n′)','rf-w')+rfT(264,68,'h(n′)','rf-w')+rfT(182,138,'h(n)','rf-w');
  s+=rfT(180,170,'h(n)  ≤  c(n, n′) + h(n′)','rf-a');
  return rfSvg(360,180,'نامساوی مثلث در تعریف سازگاری',s);
});

/* A3: the textbook alpha-beta example (Russell & Norvig): leaves 3 12 8 | 2 4 6 | 14 5 2 */
regFig('figRvAB',function(){
  var mins=[{x:64,v:'3',l:[3,12,8],n:'B'},{x:180,v:'≤2',l:[2,4,6],cut:1,n:'C'},{x:296,v:'2',l:[14,5,2],n:'D'}],e='',nd='',cut='';
  mins.forEach(function(m){
    e+='<line x1="180" y1="43" x2="'+m.x+'" y2="87" class="ab-e"/>';
    m.l.forEach(function(v,j){
      var x=m.x+(j-1)*36,pr=m.cut&&j>0;
      e+='<line x1="'+m.x+'" y1="118" x2="'+x+'" y2="155" class="ab-e'+(pr?' pr':'')+'"/>';
      if(pr){var mx=(m.x+x)/2,my=140;cut+='<path d="M'+(mx-6)+' '+(my-6)+'l12 12M'+(mx+6)+' '+(my-6)+'l-12 12" class="ab-cut"/>';}
      nd+='<g class="ab-n'+(pr?' pr':'')+'"><rect x="'+(x-15)+'" y="155" width="30" height="26" rx="8" class="ab-leaf"/><text x="'+x+'" y="173" class="ab-v">'+v+'</text></g>';
    });
    nd+='<polygon points="'+(m.x-19)+' 87 '+(m.x+19)+' 87 '+m.x+' 119" class="ab-tri mn"/><text x="'+m.x+'" y="101" class="ab-v in">'+m.v+'</text>'+rfT(m.x+27,96,m.n,'rf-a');
  });
  nd+='<polygon points="180 11 161 43 199 43" class="ab-tri mx"/><text x="180" y="38" class="ab-v in">3</text>';
  nd+=rfT(208,34,'α = 3','rf-a st');
  nd+=rfT(8,16,'▲ MAX   ▼ MIN','rf-s st');
  return rfSvg(360,190,'مثال هرس آلفا-بتا',e+cut+nd,'abs rf');
});

/* A4: constraint graph of the Australia map-colouring CSP, with one 3-colour solution */
regFig('figRvAus',function(){
  var P={WA:[52,104],NT:[146,42],SA:[166,124],Q:[264,52],NSW:[290,134],V:[222,194],T:[306,212]};
  var col={WA:'c1',NT:'c2',SA:'c3',Q:'c1',NSW:'c2',V:'c1',T:'c2'},s='';
  [['WA','NT'],['WA','SA'],['NT','SA'],['NT','Q'],['SA','Q'],['SA','NSW'],['SA','V'],['Q','NSW'],['NSW','V']].forEach(function(e){
    s+=rfEdge(P[e[0]],P[e[1]],21,21,(e[0]==='SA'||e[1]==='SA')?'on':'');
  });
  Object.keys(P).forEach(function(k){s+=rfN(P[k][0],P[k][1],21,k,col[k]);});
  s+=rfT(112,160,'degree 5','rf-a');
  return rfSvg(360,240,'گراف قیدهای رنگ‌آمیزی نقشه استرالیا',s);
});

/* A5: the three basic structures for conditional independence (B observed) */
regFig('figRvDsep',function(){
  var s='<defs><marker id="rfar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="rf-ar"/></marker></defs>';
  s+=rfL(120,8,120,186,'dsh')+rfL(240,8,240,186,'dsh');
  function pan(P,E,cx,t,ok){
    E.forEach(function(e){s+=rfEdge(P[e[0]],P[e[1]],15,17,'',"rfar");});
    Object.keys(P).forEach(function(k){s+=rfN(P[k][0],P[k][1],15,k,k==='B'?'on':'');});
    s+=rfT(cx,158,t,'rf-s b')+rfT(cx,176,ok?'given B: blocked':'given B: open',ok?'rf-ok':'rf-bad');
  }
  pan({A:[34,34],B:[62,82],C:[90,130]},[['A','B'],['B','C']],60,'chain',1);
  pan({B:[180,36],A:[146,110],C:[214,110]},[['B','A'],['B','C']],180,'fork',1);
  pan({A:[266,36],C:[334,36],B:[300,110]},[['A','B'],['C','B']],300,'collider',0);
  return rfSvg(360,186,'زنجیر، چنگال و ساختار هم‌گرا در شبکه بیزی',s);
});

/* A6: state-space landscape */
regFig('figRvLandscape',function(){
  var d='M10 160 C30 150 45 95 60 95 C75 95 85 140 98 140 C112 140 118 110 130 110 L165 110 C180 110 195 30 215 30 C235 30 245 120 262 120 C275 120 280 85 292 85 L320 85 C330 85 340 125 350 130';
  var s='<path d="'+d+' L350 172 L10 172Z" class="rf-area"/><path d="'+d+'" class="rf-curve"/>'+rfL(10,172,350,172);
  s+=rfT(60,84,'local max')+rfT(147,101,'shoulder')+rfT(215,20,'global max','rf-a')+rfT(306,75,'flat local max');
  s+=rfL(44,121,60,147)+rfC(41.7,115,5.5,'rf-dot')+rfT(74,162,'current state');
  s+=rfT(8,14,'objective ↑','rf-s st')+rfT(180,190,'state space →');
  return rfSvg(360,198,'چشم‌انداز فضای حالت در جستجوی محلی',s);
});

/* A7: maximum-margin separator; ringed points are the support vectors */
regFig('figRvSVM',function(){
  var s='<defs><marker id="rfar2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="rf-ar"/></marker></defs>';
  s+=rfL(40,200,240,0,'dsh')+rfL(120,200,320,0,'dsh')+rfL(80,200,280,0,'on');
  var pos=[[195,125,1],[265,55,1],[260,120],[300,80],[230,160],[290,150],[330,40],[320,180]];
  var neg=[[150,90,1],[110,130,1],[80,60],[130,40],[60,120],[40,170],[170,30],[30,30]];
  pos.forEach(function(p){s+=rfC(p[0],p[1],6,'rf-p1')+(p[2]?rfC(p[0],p[1],11,'rf-ring'):'');});
  neg.forEach(function(p){s+='<rect x="'+(p[0]-5.5)+'" y="'+(p[1]-5.5)+'" width="11" height="11" class="rf-p2"/>'+(p[2]?rfC(p[0],p[1],11,'rf-ring'):'');});
  s+='<line x1="177" y1="67" x2="213" y2="103" class="rf-e" marker-start="url(#rfar2)" marker-end="url(#rfar2)"/>'+rfT(236,86,'margin','rf-w');
  return rfSvg(360,200,'جداکننده با بیشترین حاشیه در SVM',s);
});
