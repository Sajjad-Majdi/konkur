/* core/plan: progress model, the study plan to the exam (content/plan.json), registration and exam dates */
var TODAY=todayMs();
var EXAMD=ymd(EXAM.date), REG_S=ymd(EXAM.registration.start), REG_E=ymd(EXAM.registration.end);
var SEC_PER_Q=135;
var STG={read:'یادآوری',ex:'مثال حل‌شده',pr:'تمرین'};
var SRCN={k:'کلید سنجش',s:'کلید نهایی سنجش',v:'حل مستقل'};

/* ---- one-time migration of v1 progress: a pattern with answered practice counts as read and example seen ---- */
(function migrate(){
  if(S.v===2)return;
  PATTERNS.forEach(function(p){if(p.pr.some(answered)){S.rd[p.id]=1;S.exd[p.id]=1;}});
  Object.keys(S.test).forEach(function(c){var t=S.test[c];if(!t||typeof t!=='object')delete S.test[c];else if(!Array.isArray(t.h))t.h=[];});
  S.v=2;save();
})();
if(!S.ps||!/^\d{4}-\d{2}-\d{2}$/.test(S.ps)){S.ps=isoOf(Math.max(ymd(PLANDATA.start),TODAY));save();}

/* ---- answers ---- */
function qs(id){var s=S.q[id];return s&&typeof s==='object'?s:null;}
function answered(id){var s=qs(id);return !!s&&((Array.isArray(s.t)&&s.t.length>0)||!!s.done);}
function firstOk(id){var s=qs(id);return !!s&&Array.isArray(s.t)&&s.t.length>0&&s.t[0]===Q[id].key;}
function fixedQ(id){var s=qs(id);return !!s&&!!s.fx;}
function ansMark(id){return !answered(id)?'':(firstOk(id)||fixedQ(id)?'ok':'bad');}
/* the wrong list: practice answered wrong first time (or "I don't know") and not solved again yet,
   plus self-test answers that were wrong (S.tw, cleared when solved again right) */
function pracWeak(id){return !!Q[id]&&!!Q[id].pat&&answered(id)&&!firstOk(id)&&!fixedQ(id);}
function weak(){
  var out=Object.keys(S.q).filter(pracWeak);
  Object.keys(S.tw||{}).forEach(function(id){if(Q[id]&&out.indexOf(id)<0)out.push(id);});
  return out;
}
function fromTest(id){return !!(S.tw&&S.tw[id])&&!pracWeak(id);}
/* the title of a wrong-list row: its pattern, or the course self-test */
function wTitle(id){var q=Q[id];return q.pat?PAT[q.pat].t:'آزمونک '+cShort(q.c);}

/* ---- pattern and course progress ---- */
function pst(id){
  var p=PAT[id],tot=p.pr.length,ans=0,right=0;
  p.pr.forEach(function(q){if(answered(q)){ans++;if(firstOk(q))right++;}});
  var read=!!S.rd[id],ex=!!S.exd[id],done=read&&ex&&ans===tot;
  var stage=!read?'read':!ex?'ex':ans<tot?'pr':'done';
  return {read:read,ex:ex,ans:ans,tot:tot,right:right,done:done,stage:stage,started:read||ex||ans>0};
}
function cst(c){
  var ids=byRank(c),done=0,ans=0,right=0,hrs=0,left=0,next=null;
  ids.forEach(function(id){var s=pst(id),h=PAT[id].rank.hours;hrs+=h;if(s.done)done++;else{left+=h;if(!next)next=id;}ans+=s.ans;right+=s.right;});
  return {n:ids.length,done:done,ans:ans,right:right,hrs:hrs,left:left,next:next};
}

/* ---- the plan: phases from plan.json, one entry per calendar day.
   S.cut = days taken off the end of the review phase so the plan never runs past the exam (keeps at least MIN_REVIEW) ---- */
var PHASES=[], LP=[], MIN_REVIEW=7;
function buildPlan(){
  PHASES.length=0;LP.length=0;
  PLANDATA.phases.forEach(function(ph,pi){
    var P={id:ph.id,name:ph.name,short:ph.short,courses:ph.courses||[],soon:!!ph.soon,fin:!!ph.final};
    if(P.soon)P.bar='repeating-linear-gradient(135deg,var(--line-2) 0 4px,transparent 4px 8px)';
    else if(P.fin)P.bar='var(--brand)';
    else if(P.courses.length>1)P.bar='linear-gradient(270deg,'+P.courses.map(function(c){return 'var(--c-'+c+')';}).join(',')+')';
    else P.bar='var(--c-'+(P.courses[0]||'brand')+')';
    PHASES.push(P);
    if(ph.soon){for(var i=0;i<ph.soon;i++)LP.push({ph:pi,soon:true,pats:[],text:'',extra:'',id:ph.id+'-'+(i+1)});return;}
    var days=ph.days;
    if(ph.final){P.full=days.length;days=days.slice(0,Math.max(Math.min(MIN_REVIEW,days.length),days.length-(+S.cut||0)));}
    days.forEach(function(d){LP.push({ph:pi,pats:d.p||[],text:d.t||'',extra:d.x||'',tests:d.ts||null,id:d.id});});
  });
  LP.forEach(function(d,i){d.n=i+1;});
  PHASES.forEach(function(ph,pi){var ds=LP.filter(function(d){return d.ph===pi;});ph.from=ds[0].n;ph.to=ds[ds.length-1].n;ph.len=ds.length;});
}
function finPhase(){return PHASES.filter(function(p){return p.fin;})[0]||null;}
function cutRoom(){var f=finPhase();return f?Math.max(0,f.len-MIN_REVIEW):0;}
function planStart(){return ymd(S.ps)+(+S.sh||0)*DAY;}
/* a plan that would end on or after the exam gives up review days first */
function fitPlan(){var over=-buffer(),add=Math.min(over,cutRoom());if(over>0&&add>0){S.cut=(+S.cut||0)+add;buildPlan();save();}}
/* moving the plan forward by the days behind: first the buffer, then review days; what does not fit stays behind */
function shiftPlan(lag){
  var buf=Math.max(0,buffer()),fromBuf=Math.min(lag,buf),fromRev=Math.min(lag-fromBuf,cutRoom());
  return {move:fromBuf+fromRev,fromBuf:fromBuf,fromRev:fromRev,left:lag-fromBuf-fromRev,buf:buf};
}
buildPlan();
function dateOf(n){return planStart()+(n-1)*DAY;}
function nOf(t){return dd(planStart(),t)+1;}
function todayN(){return nOf(TODAY);}
function dayDone(d){return !d.soon&&(d.pats.length?d.pats.every(function(id){return pst(id).done;}):!!S.plan[d.id]);}
function lastDate(){return dateOf(LP.length);}
function buffer(){return dd(lastDate(),EXAMD)-1;}
function missed(){var k=Math.min(LP.length+1,todayN());return LP.filter(function(d){return d.n<k&&!d.soon&&!dayDone(d);});}
function phaseOf(k){for(var i=0;i<PHASES.length;i++)if(k>=PHASES[i].from&&k<=PHASES[i].to)return i;return k<1?0:PHASES.length-1;}
/* what the "today" card shows */
function heroModel(){
  var k=Math.min(LP.length,todayN()),lag=missed().length;
  var d=LP.slice(0,Math.max(0,k)).filter(function(x){return !x.soon&&!dayDone(x);})[0];
  var rest=RANK.filter(function(id){return !pst(id).done;})[0];
  function free(){return {kind:pst(rest).started?'go':'start',d:{pats:[rest],ph:-1,n:0},pid:rest,behind:0,lag:0};}
  if(d){
    var behind=d.n<k?d.n:0;
    if(!d.pats.length)return {kind:'text',d:d,behind:behind,lag:lag};
    var pid=d.pats.filter(function(id){return !pst(id).done;})[0];
    return {kind:pst(pid).started?'go':'start',d:d,pid:pid,behind:behind,lag:lag};
  }
  var nx=LP.filter(function(x){return x.n>k&&!x.soon&&!dayDone(x);})[0];
  if(k>=1&&LP[k-1]&&LP[k-1].soon&&rest)return free();
  if(nx&&k>=1)return {kind:'daydone',d:LP[k-1],next:nx};
  if(rest)return free();
  return {kind:'plandone'};
}
/* registration and exam state on day t */
function timeState(t,regDone){
  t=t||TODAY;if(regDone===undefined)regDone=!!S.reg;
  var reg;
  if(t<REG_S)reg='before';
  else if(t<=REG_E)reg=regDone?'done':(t===REG_E?'last':'open');
  else reg='after';
  return {t:t,toExam:dd(t,EXAMD),reg:reg,toReg:dd(t,REG_S),regLeft:dd(t,REG_E)+1};
}
/* calendar months (Shamsi) from the plan start to the exam */
function planMonths(){
  var out=[],a=Math.min(ymd(S.ps),planStart(),TODAY),seen={};
  for(var t=a;t<=EXAMD;t+=DAY){var j=jp(t),k=j[0]+'-'+j[1];if(!seen[k]){seen[k]=1;out.push([j[0],j[1]]);}}
  return out;
}
fitPlan();
