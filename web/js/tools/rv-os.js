/* tools/rv-os: exact figures for the operating-systems course: «یادآوری» figures (figRvO*) and past-question figures (figOs*).
   Uses the shared rf* helpers (rv-ai.js) and the tc* arrow helpers (rv-toc.js). Labels are Latin (LTR) on purpose;
   "_x" in a label becomes a subscript (tcS). Every figure has its own arrow-marker id. */
var OS_PC={P1:'c1',P2:'c2',P3:'c3',P4:'on',P5:'g'};
/* Gantt row: segs = [[name, start, end], ...]; time labels under the bars, a label is skipped when it would touch the previous one */
function osGantt(segs,x0,y,sc,h){
  var s='',t={},last=-99;
  segs.forEach(function(g){
    var x=x0+g[1]*sc,w=(g[2]-g[1])*sc;
    s+='<rect x="'+tcF(x)+'" y="'+y+'" width="'+tcF(w)+'" height="'+h+'" rx="3" class="rf-n '+(OS_PC[g[0]]||'')+'"/>';
    if(w>=17)s+=rfT(tcF(x+w/2),y+h/2+4.5,tcS(g[0].replace(/^P(\d)$/,'P_$1')),'rf-l sm');
    t[g[1]]=1;t[g[2]]=1;
  });
  Object.keys(t).map(Number).sort(function(a,b){return a-b;}).forEach(function(v){
    var x=x0+v*sc;if(x-last<12)return;last=x;
    s+=rfT(tcF(x),y+h+11,v,'rf-i');
  });
  return s;
}
/* straight arrow between two points */
function osA(x1,y1,x2,y2,id,cls){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" class="rf-e tc'+(cls?' '+cls:'')+'" marker-end="url(#'+id+')"/>';}
function osBox(x,y,w,h,s,c,tc){return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="7" class="rf-n'+(c?' '+c:'')+'"/>'+rfT(x,y+4.5,s,tc||'rf-s b');}

/* ---------- past-question figures ---------- */

/* 1405 Q101: multilevel feedback queue 8 -> 16 -> FCFS */
regFig('figOs1405q101',function(){
  var id='osm1',s=tcDefs(id),Y=[32,92,152];
  s+=osA(8,Y[0],68,Y[0],id);
  ['quantum = 8','quantum = 16','FCFS'].forEach(function(t,i){
    s+='<rect x="70" y="'+(Y[i]-15)+'" width="140" height="30" rx="5" class="rf-n"/>'+rfT(140,Y[i]+4.5,t,'rf-s b');
    s+=osA(210,Y[i],268,Y[i],id);
    if(i<2)s+='<path d="M226 '+Y[i]+' V'+(Y[i]+30)+' H40 V'+Y[i+1]+' H66" class="rf-e tc" marker-end="url(#'+id+')"/>';
  });
  return rfSvg(280,175,'صف چندسطحی با بازخورد سوال ۱۰۱ کنکور ۱۴۰۵',s);
});

/* 1399 Q103: 16 frames of main memory, the gray ones (3, 5, 9, 10, 12, 15) belong to the process */
regFig('figOs1399q103',function(){
  var s='',G={3:1,5:1,9:1,10:1,12:1,15:1};
  for(var i=1;i<=16;i++)s+='<rect x="'+(20+(i-1)*20)+'" y="12" width="20" height="34" class="rf-cell"'+(G[i]?' style="fill:var(--ink3);fill-opacity:.5"':'')+'/>';
  return rfSvg(360,58,'شانزده قاب حافظه که شش قاب خاکستری به پردازه داده شده',s);
});

/* ---------- «یادآوری» figures ---------- */

/* O1: Gantt charts of one process set under FCFS, SJF, SRTF and RR (q = 4) */
regFig('figRvOGantt',function(){
  var R=[['FCFS',[['P1',0,8],['P2',8,12],['P3',12,21],['P4',21,26]]],
         ['SJF',[['P1',0,8],['P2',8,12],['P4',12,17],['P3',17,26]]],
         ['SRTF',[['P1',0,1],['P2',1,5],['P4',5,10],['P1',10,17],['P3',17,26]]],
         ['RR q=4',[['P1',0,4],['P2',4,8],['P3',8,12],['P4',12,16],['P1',16,20],['P3',20,24],['P4',24,25],['P3',25,26]]]],s='';
  R.forEach(function(r,i){var y=12+i*46;s+=rfT(6,y+15,r[0],'rf-s b st')+osGantt(r[1],72,y,10.6,22);});
  return rfSvg(360,196,'نمودار گانت چهار الگوریتم زمان‌بندی',s);
});

/* O1: Rate Monotonic, P1 (T 50, C 25) above P2 (T 80, C 30) */
regFig('figRvORM',function(){
  var x0=40,sc=3.6,s='';
  s+=rfL(x0+50*sc,8,x0+50*sc,104,'dsh')+rfL(x0+80*sc,8,x0+80*sc,104,'dsh');
  s+=rfT(8,30,tcS('P_1'),'rf-s b st')+osGantt([['P1',0,25],['P1',50,75]],x0,16,sc,22);
  s+=rfT(8,80,tcS('P_2'),'rf-s b st')+osGantt([['P2',25,50],['P2',75,80]],x0,66,sc,22);
  s+=rfT(x0+80*sc,118,'deadline P2','rf-i en');
  return rfSvg(360,124,'زمان‌بندی نرخ یکنواخت دو کار متناوب',s);
});

/* O2: precedence graph S1 -> S2, S3 -> S4 with one semaphore per edge */
regFig('figRvOPrec',function(){
  var id='osm2',A=[180,26],B=[95,92],C=[265,92],D=[180,158],s=tcDefs(id);
  s+=tcLine(A,B,id,'a',-11)+tcLine(A,C,id,'b',11)+tcLine(B,D,id,'c',-11)+tcLine(C,D,id,'d',11);
  [[A,'S_1'],[B,'S_2'],[C,'S_3'],[D,'S_4']].forEach(function(n){s+=rfC(n[0][0],n[0][1],17,'rf-n')+rfT(n[0][0],n[0][1]+4.5,tcS(n[1]),'rf-l sm');});
  return rfSvg(360,180,'گراف تقدم چهار دستور با سمافور',s);
});

/* O3: process state diagram */
regFig('figRvOStates',function(){
  var id='osm3',s=tcDefs(id);
  s+=osA(58,49,99,90,id)+osA(155,99,204,99,id)+osA(204,113,155,113,id)+osA(258,91,300,50,id)+osA(232,120,197,160,id)+osA(163,160,128,120,id);
  s+=rfT(46,82,'admitted','rf-i')+rfT(180,93,'dispatch','rf-i')+rfT(180,128,'interrupt','rf-i')+rfT(300,82,'exit','rf-i')+rfT(224,152,'I/O wait','rf-i st')+rfT(137,152,'I/O done','rf-i en');
  s+=osBox(50,35,74,28,'new')+osBox(115,106,80,28,'ready','on')+osBox(245,106,80,28,'running','g')+osBox(310,35,84,28,'terminated')+osBox(180,174,80,28,'waiting','c3');
  return rfSvg(360,196,'نمودار حالت‌های فرایند',s);
});

/* O3: process tree of fork(); fork(); */
regFig('figRvOFork',function(){
  var N=[[180,28,'P',''],[110,92,'P',''],[250,92,'C1','on'],[70,156,'P',''],[150,156,'C2','on'],[210,156,'C1','on'],[290,156,'C3','on']],E=[[0,1],[0,2],[1,3],[1,4],[2,5],[2,6]],s='';
  E.forEach(function(e){s+=rfEdge(N[e[0]],N[e[1]],17,17);});
  s+=rfT(8,64,'fork #1','rf-i st')+rfT(8,128,'fork #2','rf-i st');
  N.forEach(function(n){s+=rfN(n[0],n[1],17,n[2],n[3]);});
  return rfSvg(360,180,'درخت فرایندها بعد از دو fork',s);
});

/* O3: thread models many-to-one, one-to-one, many-to-many (circle = user thread, square = kernel thread) */
regFig('figRvOThreads',function(){
  var s='',P=[['many-to-one',[-30,0,30],[0]],['one-to-one',[-30,0,30],[-30,0,30]],['many-to-many',[-39,-13,13,39],[-20,20]]];
  P.forEach(function(p,k){
    var cx=60+k*120,i,j;
    s+=rfT(cx,16,p[0],'rf-i');
    for(i=0;i<p[1].length;i++)for(j=0;j<p[2].length;j++){
      if(k===1&&i!==j)continue;
      s+=rfL(cx+p[1][i],59,cx+p[2][j],116);
    }
    p[1].forEach(function(u){s+=rfC(cx+u,50,9,'rf-n');});
    p[2].forEach(function(u){s+='<rect x="'+(cx+u-9)+'" y="116" width="18" height="18" rx="3" class="rf-n c1"/>';});
    if(k)s+=rfL(k*120,24,k*120,140,'dsh');
  });
  return rfSvg(360,146,'سه مدل نگاشت ریسمان کاربر به ریسمان هسته',s);
});

/* O4: one-level paging, p indexes the page table, the entry gives f, d is copied */
regFig('figRvOPaging',function(){
  var id='osm4',s=tcDefs(id),i;
  s+='<rect x="8" y="30" width="50" height="28" class="rf-cell on"/><rect x="58" y="30" width="50" height="28" class="rf-cell"/>'+rfT(33,49,'p','rf-l')+rfT(83,49,'d','rf-l');
  for(i=0;i<5;i++)s+='<rect x="150" y="'+(20+i*22)+'" width="60" height="22" class="rf-cell'+(i===2?' on':'')+'"/>';
  s+=rfT(180,80,'f','rf-l');
  s+='<rect x="250" y="30" width="50" height="28" class="rf-cell on"/><rect x="300" y="30" width="50" height="28" class="rf-cell"/>'+rfT(275,49,'f','rf-l')+rfT(325,49,'d','rf-l');
  s+='<path d="M33 58 V75 H146" class="rf-e tc" marker-end="url(#'+id+')"/>'+osA(212,74,268,61,id);
  s+='<path d="M83 30 V12 H325 V27" class="rf-e tc dsh" marker-end="url(#'+id+')"/>';
  s+=rfT(58,100,'logical','rf-i')+rfT(180,146,'page table','rf-i')+rfT(300,82,'physical','rf-i');
  return rfSvg(360,152,'ترجمه آدرس در صفحه‌بندی یک‌سطحی',s);
});

/* O4: two-level paging 10 + 10 + 12 bits */
regFig('figRvO2Level',function(){
  var id='osm5',s=tcDefs(id);
  [[30,80,'p_1  (10)','on'],[110,80,'p_2  (10)','on'],[190,140,'d  (12)','']].forEach(function(c){
    s+='<rect x="'+c[0]+'" y="18" width="'+c[1]+'" height="28" class="rf-cell'+(c[3]?' on':'')+'"/>'+rfT(c[0]+c[1]/2,36,tcS(c[2]),'rf-s b');
  });
  s+=osBox(60,112,90,30,'outer table')+osBox(180,112,90,30,'inner table')+osBox(300,112,90,30,'frame','g');
  s+=osA(70,46,62,95,id,'dsh')+osA(150,46,175,95,id,'dsh')+osA(260,46,296,95,id,'dsh');
  s+=osA(105,112,133,112,id)+osA(225,112,253,112,id);
  return rfSvg(360,136,'صفحه‌بندی دوسطحی',s);
});

/* O5: resource-allocation graph with a cycle P1 -> R2 -> P2 -> R1 -> P1 */
regFig('figRvORag',function(){
  var id='osm6',s=tcDefs(id),P1=[70,45],R2=[290,45],P2=[290,150],R1=[70,150];
  s+=rfEdge(P1,R2,18,22,'tc',id)+rfEdge(R2,P2,19,19,'tc',id)+rfEdge(P2,R1,18,22,'tc',id)+rfEdge(R1,P1,19,19,'tc',id);
  s+=rfT(180,38,'request','rf-i')+rfT(282,101,'assigned','rf-i en')+rfT(180,166,'request','rf-i')+rfT(78,101,'assigned','rf-i st');
  [R2,R1].forEach(function(r,i){s+='<rect x="'+(r[0]-20)+'" y="'+(r[1]-17)+'" width="40" height="34" rx="4" class="rf-n c1"/>'+rfC(r[0],r[1]+4,3.5,'rf-ar')+rfT(r[0]+32,r[1]-12,tcS(i?'R_1':'R_2'),'rf-s b');});
  s+=rfN(P1[0],P1[1],18,'')+rfT(P1[0],P1[1]+4.5,tcS('P_1'),'rf-l sm')+rfN(P2[0],P2[1],18,'')+rfT(P2[0],P2[1]+4.5,tcS('P_2'),'rf-l sm');
  return rfSvg(360,180,'گراف تخصیص منابع با دور',s);
});

/* O6: effective access time tree with a TLB and a k-level page table */
regFig('figRvOEat',function(){
  var id='osm7',s=tcDefs(id);
  s+=osA(102,78,150,48,id)+osA(102,94,150,124,id);
  s+=rfT(118,52,'α','rf-a')+rfT(116,126,'1 − α','rf-a');
  s+=osBox(56,86,92,30,'address')+osBox(250,40,196,30,'hit:  ε + m','g','rf-s b')+osBox(250,132,196,30,'miss:  ε + (k+1)·m','c3','rf-s b');
  return rfSvg(360,166,'درخت زمان دسترسی مؤثر با TLB',s);
});

/* O7: LOOK, head at 90 moving up, requests 10 35 70 110 150 185 on cylinders 0..199 */
regFig('figRvODisk',function(){
  var X=function(c){return 20+c*320/199;},stops=[90,110,150,185,70,35,10],s=rfL(X(0),24,X(199),24),pts='';
  [0,10,35,70,90,110,150,185,199].forEach(function(c){s+=rfL(X(c).toFixed(1),20,X(c).toFixed(1),28)+rfT(X(c).toFixed(1),15,c,c===90?'rf-a':'rf-i');});
  stops.forEach(function(c,i){pts+=X(c).toFixed(1)+','+(42+i*18)+' ';});
  s+='<polyline points="'+pts+'" class="rf-curve"/>';
  stops.forEach(function(c,i){s+=rfC(X(c).toFixed(1),42+i*18,i?4:5.5,i?'rf-p1':'rf-p2');});
  return rfSvg(360,162,'مسیر بازوی دیسک در الگوریتم LOOK',s);
});

/* O7: RAID 0, RAID 1, RAID 5 block layouts */
regFig('figRvORaid',function(){
  var G=[['RAID 0',10,[['A_1','A_3','A_5'],['A_2','A_4','A_6']]],['RAID 1',140,[['A_1','A_2','A_3'],['A_1','A_2','A_3']]],['RAID 5',248,[['A_1','B_1','p'],['A_2','p','C_1'],['p','B_2','C_2']]]],s='';
  G.forEach(function(g){
    var w=g[2].length*38-6;s+=rfT(g[1]+w/2,16,g[0],'rf-s b');
    g[2].forEach(function(d,i){var x=g[1]+i*38;
      s+='<rect x="'+(x-2)+'" y="24" width="36" height="82" rx="6" class="rf-bx o"/>';
      d.forEach(function(b,j){s+='<rect x="'+x+'" y="'+(28+j*25)+'" width="32" height="22" rx="3" class="rf-n'+(b==='p'?' c3':'')+'"/>'+rfT(x+16,28+j*25+15.5,tcS(b),'rf-s b');});
    });
  });
  return rfSvg(360,112,'چیدمان بلوک‌ها در RAID 0 و 1 و 5',s);
});
