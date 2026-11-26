/* tools/rv-toc: exact figures for the theory-of-languages course: «یادآوری» figures (figRvT*) and past-question figures (figToc*).
   Automata use the tc* helpers below (states, start arrows, straight/curved edges, self-loops); the shared rf* helpers live in rv-ai.js.
   Every figure has its own arrow-marker id. Labels are Latin (LTR) on purpose; "^x" and "_x" in a label become small raised/lowered text. */
function tcF(v){return (+v).toFixed(1);}
function tcS(s){
  function sp(dy){return function(_,g,c){return '<tspan class="sp" dy="'+dy+'">'+(g||c)+'</tspan><tspan dy="'+(-dy)+'">​</tspan>';};}
  return String(s).replace(/\^(?:\{([^}]*)\}|(\*|[A-Za-z0-9]))/g,sp(-5)).replace(/_(?:\{([^}]*)\}|([A-Za-z0-9]))/g,sp(3.5));
}
function tcDefs(id){var m=function(i,o){return '<marker id="'+i+'" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="'+o+'"><path d="M0 0 10 5 0 10z" class="rf-ar"/></marker>';};return '<defs>'+m(id,'auto')+m(id+'b','auto-start-reverse')+'</defs>';}
/* straight two-way edge a<->b (one line, a head at each end, one label) */
function tcBoth(a,b,id,lab,off){var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy),p=tcRim(a,b),q=tcRim(b,a);
  return '<line x1="'+tcF(p[0])+'" y1="'+tcF(p[1])+'" x2="'+tcF(q[0])+'" y2="'+tcF(q[1])+'" class="rf-e tc" marker-start="url(#'+id+'b)" marker-end="url(#'+id+'b)"/>'+(lab?tcTxt((a[0]+b[0])/2-dy/L*off,(a[1]+b[1])/2+dx/L*off,lab):'');}
/* state at p: circle, inner ring when final, name like "q0" drawn as q with a subscript */
function tcSt(p,name,fin,cls){
  var n=name?String(name):'',m=/^([A-Za-z])(\d+)$/.exec(n);
  var lab=m?m[1]+'<tspan class="sp" dy="3">'+m[2]+'</tspan>':n;
  return rfC(p[0],p[1],17,'rf-n'+(cls?' '+cls:''))+(fin?rfC(p[0],p[1],13.2,'rf-ring'):'')+(n?rfT(p[0],p[1]+4.5,lab,'rf-l'+(n.length>2?' sm':'')):'');
}
function tcRim(p,q,r){var ex=q[0]-p[0],ey=q[1]-p[1],l=Math.sqrt(ex*ex+ey*ey);return [p[0]+ex/l*(r||17),p[1]+ey/l*(r||17)];}
/* label lines centred on (x,y); lab is a string or an array of lines */
function tcTxt(x,y,lab){var L=[].concat(lab),s='';L.forEach(function(t,i){s+=rfT(tcF(x),tcF(y+4+(i-(L.length-1)/2)*15),tcS(t),'rf-w');});return s;}
/* start arrow coming from direction ang (degrees, 180 = from the left, -90 = from above) */
function tcIn(p,ang,id){var a=ang*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
  return '<line x1="'+tcF(p[0]+c*50)+'" y1="'+tcF(p[1]+s*50)+'" x2="'+tcF(p[0]+c*17)+'" y2="'+tcF(p[1]+s*17)+'" class="rf-e tc" marker-end="url(#'+id+')"/>';}
/* straight edge a->b, label pushed off to the side by off (sign picks the side) */
function tcLine(a,b,id,lab,off,cls){var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy);
  return rfEdge(a,b,17,17,'tc'+(cls?' '+cls:''),id)+(lab?tcTxt((a[0]+b[0])/2-dy/L*off,(a[1]+b[1])/2+dx/L*off,lab):'');}
/* curved edge a->b; bend bulges along the normal (-dy,dx) of a->b; the label sits off the outer side of the bulge */
function tcArc(a,b,bend,id,lab,off,cls){
  var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy),nx=-dy/L,ny=dx/L;
  var cx=(a[0]+b[0])/2+nx*bend,cy=(a[1]+b[1])/2+ny*bend,p1=tcRim(a,[cx,cy]),p2=tcRim(b,[cx,cy]);
  var s='<path d="M'+tcF(p1[0])+' '+tcF(p1[1])+' Q'+tcF(cx)+' '+tcF(cy)+' '+tcF(p2[0])+' '+tcF(p2[1])+'" class="rf-e tc'+(cls?' '+cls:'')+'" marker-end="url(#'+id+')"/>';
  if(lab){var mx=.25*p1[0]+.5*cx+.25*p2[0],my=.25*p1[1]+.5*cy+.25*p2[1],o=(off===undefined?11:off)*(bend>=0?1:-1);s+=tcTxt(mx+nx*o,my+ny*o,lab);}
  return s;
}
/* self-loop on p pointing to angle ang (degrees, -90 = above) */
function tcLoop(p,ang,id,lab,dist){
  var a=ang*Math.PI/180,d=.45,K=60,P=function(r,t){return tcF(p[0]+r*Math.cos(t))+' '+tcF(p[1]+r*Math.sin(t));};
  var s='<path d="M'+P(17,a-d)+' C'+P(K,a-.85)+' '+P(K,a+.85)+' '+P(17,a+d)+'" class="rf-e tc" marker-end="url(#'+id+')"/>';
  var L=[].concat(lab||[]);
  if(L.length){var D=dist||55,lx=p[0]+D*Math.cos(a),ly=p[1]+D*Math.sin(a),sn=Math.sin(a),sh=(L.length-1)*7.5;
    s+=tcTxt(lx,sn<-.5?ly-sh:(sn>.5?ly+sh:ly),L);}
  return s;
}
/* tree node: non-terminal in a circle, terminal as plain accent text */
function tcNT(x,y,s){return rfC(x,y,12.5,'rf-n')+rfT(x,y+4.5,tcS(s),'rf-l sm');}
function tcTm(x,y,s){return rfT(x,y+5.5,tcS(s),'rf-tm');}

/* ---------- past-question figures ---------- */

/* 1405 Q46: PDA for a^i b^j c^k with i+k=j */
regFig('figToc1405q46',function(){
  var id='tcm1',S=[55,108],P=[190,108],Q=[325,108],s=tcDefs(id);
  s+=tcIn(S,180,id)+tcLoop(S,-90,id,'a, ε/a')+tcLoop(P,-90,id,['b, a/ε','b, ε/b'])+tcLoop(Q,-90,id,'c, b/ε');
  s+=tcLine(S,P,id,'ε, ε/ε',13)+tcLine(P,Q,id,'ε, ε/ε',13);
  s+=tcSt(S,'s')+tcSt(P,'p')+tcSt(Q,'q',1);
  return rfSvg(380,145,'ماشین پشته‌ای سوال ۴۶ کنکور ۱۴۰۵',s);
});

/* 1402 Q46: finite acceptor with TWO start arrows (into q1 and into q0) */
regFig('figToc1402q46',function(){
  var id='tcm2',A=[62,92],B=[165,62],C=[265,62],X=[360,62],s=tcDefs(id);
  s+=tcIn(A,180,id)+tcIn(B,-90,id);
  s+=tcArc(A,B,-24,id,'0')+tcArc(B,A,-24,id,'0');
  s+=tcLine(B,C,id,'1',-11);
  s+=tcArc(C,X,-24,id,'1')+tcArc(X,C,-24,id,'1');
  s+=tcArc(A,X,92,id,'1',10);
  s+=tcSt(A,'q1',1)+tcSt(B,'q0')+tcSt(C,'q2',1)+tcSt(X,'');
  return rfSvg(400,165,'پذیرنده متناهی سوال ۴۶ کنکور ۱۴۰۲',s);
});

/* 1400 Q55: DFA with states 0..4 (0 start and final, 2 a trap) */
regFig('figToc1400q55',function(){
  var id='tcm3',S0=[58,52],S1=[168,52],S3=[278,52],S4=[168,140],S2=[58,140],s=tcDefs(id);
  s+=tcIn(S0,180,id);
  s+=tcLine(S0,S1,id,'a',-11)+tcLine(S1,S3,id,'b',12)+tcArc(S3,S1,30,id,'a');
  s+=tcLine(S1,S4,id,'a',10)+tcLine(S4,S2,id,'a',11)+tcLine(S4,S3,id,'b',-11);
  s+=tcArc(S3,S2,-150,id,'b',10)+tcLine(S0,S2,id,'b',10)+tcLoop(S2,90,id,'a, b');
  s+=tcSt(S0,'0',1)+tcSt(S1,'1')+tcSt(S3,'3')+tcSt(S4,'4')+tcSt(S2,'2');
  return rfSvg(330,215,'ماشین متناهی قطعی سوال ۵۵ کنکور ۱۴۰۰',s);
});

/* ---------- «یادآوری» figures ---------- */

/* T1: the Chomsky hierarchy as nested sets, one typical language in each band */
regFig('figRvTHier',function(){
  var B=[['RE','Turing-recognizable','HALT'],['REC','decidable',''],['CSL','type 1, LBA','a^nb^nc^n'],['CFL','type 2, PDA','ww^R'],['DCFL','DPDA','a^nb^n'],['REG','type 3, DFA','a^*b^*']],s='';
  B.forEach(function(b,i){
    var x=5+i*12,y=5+i*25,w=350-i*24,h=215-i*35;
    s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="12" class="rf-bx"/>';
    s+=rfT(x+9,y+17,b[0],'rf-s b st')+rfT(x+9+b[0].length*9.5+6,y+17,b[1],'rf-i st');
    if(b[2])s+=rfT(x+w-10,y+17,tcS(b[2]),'rf-a en');
  });
  return rfSvg(360,226,'سلسله‌مراتب چامسکی',s);
});

/* T1: pumping a^p b^p (p = 5): y lies inside the first p letters, so pumping changes only the number of a's */
regFig('figRvTPump',function(){
  var s='',x0=30,w=30,i,cls;
  for(i=0;i<10;i++){cls=i<2?'rf-cell':(i<4?'rf-cell on':'rf-cell');s+='<rect x="'+(x0+i*w)+'" y="34" width="'+w+'" height="30" rx="5" class="'+cls+'"/>'+rfT(x0+i*w+w/2,54,i<5?'a':'b','rf-l');}
  function br(i0,i1,lab,c){var a=x0+i0*w+3,b=x0+i1*w-3;return '<path d="M'+a+' 70v6h'+(b-a)+'v-6" class="rf-e'+(c?' on':'')+'"/>'+rfT((a+b)/2,93,lab,c?'rf-a':'rf-s b');}
  s+=br(0,2,'x')+br(2,4,'y',1)+br(4,10,'z');
  s+=rfT(x0,22,tcS('w = a^pb^p ,  p = 5'),'rf-s st')+rfT(x0+300,22,tcS('|xy| ≤ p ,  |y| ≥ 1'),'rf-i en');
  s+=rfT(180,120,tcS('xy^2z = a^7b^5 ∉ L'),'rf-a');
  return rfSvg(360,132,'لم تزریق برای a به توان p و b به توان p',s);
});

/* T2: decidable = RE ∩ co-RE, with typical problems in each region */
regFig('figRvTDec',function(){
  var s='<ellipse cx="140" cy="100" rx="112" ry="70" class="rf-ct"/><ellipse cx="220" cy="100" rx="112" ry="70" class="rf-ct"/>';
  s+=rfT(58,44,'RE','rf-s b')+rfT(302,44,'co-RE','rf-s b')+rfT(180,64,'REC','rf-a');
  s+=rfT(180,84,'decidable','rf-i');
  s+=rfT(180,108,tcS('A_{DFA} , A_{CFG}'),'rf-s')+rfT(180,128,tcS('E_{CFG}'),'rf-s');
  s+=rfT(72,98,tcS('A_{TM}'),'rf-s')+rfT(72,120,'HALT','rf-s');
  s+=rfT(288,98,tcS('E_{TM}'),'rf-s')+rfT(288,120,'co-HALT','rf-s');
  s+=rfT(356,190,tcS('EQ_{TM} : neither'),'rf-i en');
  return rfSvg(360,198,'تصمیم‌پذیر، شمارش‌پذیر و مکمل شمارش‌پذیر',s);
});

/* T4: minimisation: q0 and q2 are equivalent, merge them; the result accepts strings with an even number of a's */
regFig('figRvTMin',function(){
  var id='tcm4',Q0=[48,72],Q1=[172,72],Q2=[132,165],A=[268,102],B=[362,102],s=tcDefs(id);
  s+=tcIn(Q0,-90,id)+tcBoth(Q0,Q1,id,'a',-11)+tcLoop(Q1,-60,id,'b');
  s+=tcBoth(Q0,Q2,id,'b',11)+tcLine(Q2,Q1,id,'a',11);
  s+=tcSt(Q0,'q0',1,'on')+tcSt(Q1,'q1')+tcSt(Q2,'q2',1,'on');
  s+=rfT(214,107,'⇒','rf-a');
  s+=tcIn(A,-90,id)+tcBoth(A,B,id,'a',-11)+tcLoop(A,90,id,'b')+tcLoop(B,90,id,'b');
  s+=tcSt(A,'A',1,'on')+tcSt(B,'q1');
  return rfSvg(400,195,'کمینه‌سازی: ادغام دو حالت هم‌ارز',s);
});

/* T4: minimal DFA of {a^n b^n | n ≤ 2}; the dead state is not drawn */
regFig('figRvTAnBn',function(){
  var id='tcm5',A0=[48,55],A1=[143,55],A2=[238,55],B1=[238,140],B0=[143,140],s=tcDefs(id);
  s+=tcIn(A0,-90,id)+tcLine(A0,A1,id,'a',-11)+tcLine(A1,A2,id,'a',-11);
  s+=tcLine(A1,B0,id,'b',10)+tcLine(A2,B1,id,'b',-10)+tcLine(B1,B0,id,'b',11);
  s+=tcSt(A0,'A0',1)+tcSt(A1,'A1')+tcSt(A2,'A2')+tcSt(B1,'B1')+tcSt(B0,'B0',1);
  return rfSvg(290,178,'DFA کمینه برای a به توان n و b به توان n با n حداکثر ۲',s);
});

/* T5: derivation tree of aabccc in S -> aSc | aS | A,  A -> bAcc | bA | bAc | ε */
regFig('figRvTTree',function(){
  var E=[[160,20,40,60],[160,20,120,60],[160,20,290,60],[120,60,80,100],[120,60,160,100],[160,100,160,140],[160,140,110,180],[160,140,160,180],[160,140,210,180],[160,140,250,180],[160,180,160,220]],s='';
  E.forEach(function(e){s+=rfL(e[0],e[1],e[2],e[3]);});
  s+=tcNT(160,20,'S')+tcNT(120,60,'S')+tcNT(160,100,'S')+tcNT(160,140,'A')+tcNT(160,180,'A');
  s+=tcTm(40,60,'a')+tcTm(290,60,'c')+tcTm(80,100,'a')+tcTm(110,180,'b')+tcTm(210,180,'c')+tcTm(250,180,'c')+tcTm(160,220,'ε');
  return rfSvg(320,236,'درخت اشتقاق رشته aabccc',s);
});

/* T6: the two parse trees of a+a*a in E -> E+E | E*E | a */
regFig('figRvTAmb',function(){
  function tree(o,top){
    var s='',L=[],N=[],T=[];
    if(top==='+'){
      L=[[90,20,35,68],[90,20,90,68],[90,20,145,68],[35,68,35,112],[145,68,110,112],[145,68,145,112],[145,68,180,112],[110,112,110,156],[180,112,180,156]];
      N=[[90,20],[35,68],[145,68],[110,112],[180,112]];T=[[90,68,'+'],[35,112,'a'],[145,112,'*'],[110,156,'a'],[180,156,'a']];
    }else{
      L=[[90,20,45,68],[90,20,95,68],[90,20,150,68],[45,68,12,112],[45,68,45,112],[45,68,78,112],[150,68,150,112],[12,112,12,156],[78,112,78,156]];
      N=[[90,20],[45,68],[150,68],[12,112],[78,112]];T=[[95,68,'*'],[45,112,'+'],[150,112,'a'],[12,156,'a'],[78,156,'a']];
    }
    L.forEach(function(e){s+=rfL(e[0]+o,e[1],e[2]+o,e[3]);});
    N.forEach(function(n){s+=tcNT(n[0]+o,n[1],'E');});
    T.forEach(function(t){s+=tcTm(t[0]+o,t[1],t[2]);});
    return s;
  }
  var s=tree(0,'+')+tree(222,'*');
  s+=rfT(100,190,'a + (a * a)','rf-s b')+rfT(312,190,'(a + a) * a','rf-s b');
  return rfSvg(395,200,'دو درخت تجزیه متفاوت برای یک رشته',s);
});

/* T6: PDA for {a^n b^n | n ≥ 0} with a bottom marker $, accepting by final state */
regFig('figRvTPda',function(){
  var id='tcm6',Q1=[40,95],Q2=[150,95],Q3=[262,95],Q4=[365,95],s=tcDefs(id);
  s+=tcIn(Q1,-90,id)+tcLine(Q1,Q2,id,'ε, ε/$',13)+tcLoop(Q2,-90,id,'a, ε/a')+tcLine(Q2,Q3,id,'b, a/ε',13)+tcLoop(Q3,-90,id,'b, a/ε')+tcLine(Q3,Q4,id,'ε, $/ε',13);
  s+=tcSt(Q1,'q1',1)+tcSt(Q2,'q2')+tcSt(Q3,'q3')+tcSt(Q4,'q4',1);
  return rfSvg(400,130,'ماشین پشته‌ای برای a به توان n و b به توان n',s);
});

/* T7: state elimination: removing q leaves the edge label d + a b* c */
regFig('figRvTElim',function(){
  var id='tcm7',S=[36,70],Q=[116,70],F=[196,70],S2=[262,70],F2=[368,70],s=tcDefs(id);
  s+=tcLine(S,Q,id,'a',-11)+tcLoop(Q,-90,id,'b')+tcLine(Q,F,id,'c',-11)+tcArc(S,F,48,id,'d',10);
  s+=tcSt(S,'s')+tcSt(Q,'q','','on')+tcSt(F,'f',1);
  s+=rfT(229,75,'⇒','rf-a');
  s+=tcLine(S2,F2,id,'d + ab^*c',-12,'on')+tcSt(S2,'s')+tcSt(F2,'f',1);
  return rfSvg(400,135,'حذف حالت برای ساختن عبارت منظم',s);
});
