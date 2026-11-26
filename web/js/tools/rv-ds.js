/* tools/rv-ds: exact figures for the data-structures «یادآوری» refreshers (figRv*). Helpers rf* live in rv-ai.js. */

/* D1: growth ladder, slowest at the bottom */
regFig('figRvLadder',function(){
  var R=['1','log log n','log n','log² n','√n','n','n log n','n²','n³','2ⁿ','3ⁿ','n!','nⁿ'],s='';
  function y(i){return 236-i*17.5;}
  s+=rfL(16,22,16,244)+rfL(42,22,42,244);
  R.forEach(function(r,i){s+=rfL(16,y(i),42,y(i),'rung')+rfT(54,y(i)+5,r,'rf-m st');});
  [[1,3,'logarithmic'],[4,8,'polynomial'],[9,10,'exponential'],[11,12,'factorial and up']].forEach(function(g){
    var a=y(g[1])-7,b=y(g[0])+7;
    s+='<path d="M136 '+a+'h7v'+(b-a)+'h-7" class="rf-e"/>'+rfT(152,(a+b)/2+4.5,g[2],'rf-s st');
  });
  s+=rfT(29,13,'faster ↑','rf-a');
  return rfSvg(270,250,'نردبان رشد توابع',s,'rf narrow');
});

/* D2: recursion tree of T(n) = 2T(n/2) + n */
regFig('figRvRecTree',function(){
  var L=[[[150,'n']],[[85,'n/2'],[215,'n/2']],[[50,'n/4'],[120,'n/4'],[180,'n/4'],[250,'n/4']]],s='';
  function y(d){return 26+d*48;}
  L.forEach(function(row,d){
    row.forEach(function(nd,j){
      if(d>0){var p=L[d-1][j>>1];s+=rfL(p[0],y(d-1)+11,nd[0],y(d)-11);}
    });
  });
  L.forEach(function(row,d){row.forEach(function(nd){s+=rfBox(nd[0],y(d),38,22,nd[1],'','rf-l sm');});s+=rfT(352,y(d)+4.5,'= n','rf-a en');});
  s+=rfT(150,y(3)-6,'⋮','rf-l');
  [40,72,104,200,232,264].forEach(function(x){s+=rfBox(x,196,22,20,'1','on','rf-l sm');});
  s+=rfT(152,200,'⋯','rf-l')+rfT(352,200,'= Θ(n)','rf-a en');
  s+='<path d="M14 22v178" class="rf-e"/>'+rfT(10,111,'log₂ n levels','rf-s',' transform="rotate(-90 10 111)"');
  s+=rfT(330,12,'level sum','rf-s');
  s+=rfT(180,232,'n per level × log₂ n levels = Θ(n log n)','rf-a');
  return rfSvg(360,240,'درخت بازگشت رابطه T(n)=2T(n/2)+n',s);
});

/* D3: a min-heap as a tree and as an array; leaves (indices ⌊n/2⌋+1..n) are tinted */
regFig('figRvHeap',function(){
  var A=[2,4,3,8,5,7,6,9,10,11],n=A.length,W=360,s='',nd='';
  function pos(i){var d=Math.floor(Math.log(i)/Math.LN2+1e-9),j=i-Math.pow(2,d);return [(j+0.5)*W/Math.pow(2,d),24+d*46];}
  for(var i=1;i<=n;i++){
    var p=pos(i),leaf=i>Math.floor(n/2);
    if(i>1)s+=rfEdge(pos(i>>1),p,15,15);
    nd+=rfN(p[0],p[1],15,A[i-1],leaf?'on':'')+rfT(p[0],p[1]+27,i,'rf-i');
  }
  var cw=32,x0=(W-cw*n)/2;
  for(i=1;i<=n;i++){
    var x=x0+(i-1)*cw;
    nd+='<rect x="'+x+'" y="204" width="'+cw+'" height="26" class="rf-cell'+(i>Math.floor(n/2)?' on':'')+'"/>'+rfT(x+cw/2,222,A[i-1],'rf-l sm')+rfT(x+cw/2,245,i,'rf-i');
  }
  return rfSvg(360,252,'هرم کمینه به شکل درخت و آرایه',s+nd);
});

/* D4: decision tree of a comparison sort on three keys a, b, c */
regFig('figRvDecTree',function(){
  var I={r:[172,22,'a : b'],L:[90,75,'b : c'],R:[255,75,'a : c'],LR:[140,130,'a : c'],RR:[292,130,'b : c']};
  var F={l1:[40,130,'a≤b≤c'],l2:[102,185,'a≤c&lt;b'],l3:[176,185,'c&lt;a≤b'],r1:[210,130,'b&lt;a≤c'],r2:[254,185,'b≤c&lt;a'],r3:[328,185,'c&lt;b&lt;a']};
  var E=[['r','L','≤'],['r','R','>'],['L','l1','≤'],['L','LR','>'],['LR','l2','≤'],['LR','l3','>'],['R','r1','≤'],['R','RR','>'],['RR','r2','≤'],['RR','r3','>']];
  var s='',P=function(k){return I[k]||F[k];};
  E.forEach(function(e){var a=P(e[0]),b=P(e[1]);s+=rfL(a[0],a[1]+12,b[0],b[1]-12);});
  E.forEach(function(e){var a=P(e[0]),b=P(e[1]),mx=(a[0]+b[0])/2+(e[2]==='>'?9:-9),my=(a[1]+b[1])/2+4;s+=rfT(mx,my,e[2],'rf-w');});
  Object.keys(I).forEach(function(k){s+=rfBox(I[k][0],I[k][1],48,24,I[k][2],'','rf-l sm');});
  Object.keys(F).forEach(function(k){s+=rfBox(F[k][0],F[k][1],50,24,F[k][2],'on','rf-l sm');});
  s+=rfT(180,218,'3! = 6 leaves  ⇒  height ≥ ⌈log₂ 6⌉ = 3','rf-a');
  return rfSvg(360,226,'درخت تصمیم مرتب‌سازی سه عنصر',s);
});

/* D5: a weighted graph with distinct weights and its (unique) MST */
regFig('figRvMST',function(){
  var P={A:[45,70],B:[185,35],C:[120,165],D:[265,120],E:[318,205]};
  var E=[['A','B',4,0,-12],['A','C',1,1,12],['B','C',3,1,-12],['B','D',2,1,12],['C','D',7,0,12],['C','E',9,0,12],['D','E',5,1,-12]],s='';
  E.forEach(function(e){s+=rfEdge(P[e[0]],P[e[1]],17,17,e[3]?'on':'dsh');});
  E.forEach(function(e){s+=rfMid(P[e[0]],P[e[1]],e[4],e[2]);});
  Object.keys(P).forEach(function(k){s+=rfN(P[k][0],P[k][1],17,k);});
  return rfSvg(360,230,'درخت پوشای کمینه در یک گراف وزن‌دار',s);
});

/* D6: Huffman tree for a:5 b:9 c:12 d:13 e:16 f:45 (CLRS); 0 = left, 1 = right */
regFig('figRvHuff',function(){
  var N={r:[190,24,'100'],m55:[252,80,'55'],m25:[172,136,'25'],m30:[304,136,'30'],m14:[268,192,'14']};
  var F={f:[60,80,'f:45','0'],c:[134,192,'c:12','100'],d:[208,192,'d:13','101'],e:[336,192,'e:16','111'],a:[238,248,'a:5','1100'],b:[298,248,'b:9','1101']};
  var E=[['r','f',0],['r','m55',1],['m55','m25',0],['m55','m30',1],['m25','c',0],['m25','d',1],['m30','m14',0],['m30','e',1],['m14','a',0],['m14','b',1]];
  var s='',P=function(k){return N[k]||F[k];};
  E.forEach(function(e){var a=P(e[0]),b=P(e[1]);s+=rfEdge(a,b,17,F[e[1]]?14:17);});
  E.forEach(function(e){var a=P(e[0]),b=P(e[1]);s+=rfT((a[0]+b[0])/2+(e[2]?10:-10),(a[1]+b[1])/2,e[2],'rf-w');});
  Object.keys(N).forEach(function(k){s+=rfN(N[k][0],N[k][1],17,N[k][2]);});
  Object.keys(F).forEach(function(k){var f=F[k];s+=rfBox(f[0],f[1],46,26,f[2],'on','rf-l sm')+rfT(f[0],f[1]+28,f[3],'rf-a');});
  return rfSvg(360,284,'درخت هافمن',s);
});
