/* core/state: progress in localStorage (every access guarded)
   The key and shape match v1 so saved progress keeps working:
   {q:{<questionId>:{t:[tries],r:revealedSteps,done:1}}, plan:{<dayId>:1}, test:{<courseId>:{best,last,at}}, week, view, theme} */
var KEY='kn1406.v1';
function loadState(){try{var t=W.localStorage.getItem(KEY);if(t){var o=JSON.parse(t);if(o&&typeof o==='object')return o;}}catch(e){}return {};}
var S=loadState();
['q','plan','test'].forEach(function(k){if(!S[k]||typeof S[k]!=='object')S[k]={};});
function save(){try{W.localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
