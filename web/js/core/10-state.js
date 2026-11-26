/* core/state: progress in localStorage (every access guarded). The key stays 'kn1406.v1' so old progress keeps working.
   Shape (v1 fields kept, v2 fields added; see migrate() in 60-plan.js):
   q:{<qid>:{t:[first answer, later tries...], r:revealed steps, done:1, sk:1 skipped ("I don't know"), fx:1 solved again right}}
   rd:{<pid>:1} review read · exd:{<pid>:1} worked example understood · rv:{<pid>:1} review closed
   plan:{<dayId>:1} plan days without patterns marked done · test:{<cid>:{best,last,at,h:[{c,w,b,n,t,u,a}]}}
   tw:{<qid>:1} wrong in a self-test, in the wrong list until solved again
   ps: plan start (ISO) · sh: days the plan was moved forward · cut: review days dropped to fit before the exam · reg: registration done · theme · v: 2 */
var KEY='kn1406.v1';
function loadState(){try{var t=W.localStorage.getItem(KEY);if(t){var o=JSON.parse(t);if(o&&typeof o==='object')return o;}}catch(e){}return {};}
var S=loadState();
['q','plan','test','rd','exd','rv','tw'].forEach(function(k){if(!S[k]||typeof S[k]!=='object'||Array.isArray(S[k]))S[k]={};});
function save(){try{W.localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
