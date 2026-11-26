/* tools/expected-value: expected score of a guess after eliminating options (tool "ev").
   k options left: p = 1/k, value = p − (1 − p)/3 = (4 − k) / 3k of one right answer */
regTool('ev',function(el){
  var k=3;
  function draw(){
    var v=(4-k)/(3*k),verdict=k===4?'زدن و نزدن فرقی ندارد':k===1?'جواب را می‌دانی':k===3?'زدنش به صرفه است':'حتماً بزن';
    var b=function(val,l){return '<button type="button" class="tap'+(k===val?' on':'')+'" data-k="'+val+'" aria-pressed="'+(k===val)+'">'+l+'</button>';};
    var val=v===0?'۰':'+'+fa(v===1?1:v.toFixed(2));
    el.innerHTML='<div class="ev"><div class="ev-q">چند گزینه را با اطمینان حذف کرده‌ای</div><div class="seg">'+b(4,'هیچ')+b(3,'یکی')+b(2,'دو تا')+b(1,'سه تا')+'</div>'+
      '<div class="ev-bar" style="direction:ltr"><i class="v" style="left:0;width:'+Math.max(v*100,0.8)+'%;background:'+(v===0?'var(--ink-3)':'var(--ok)')+'"></i></div>'+
      '<div class="ev-l"><span>۰</span><span>۱</span></div>'+
      '<div class="ev-out" aria-live="polite"><b style="color:'+(v===0?'var(--ink-2)':'var(--ok)')+'">'+val+'</b><span>امید نمره این سوال · '+verdict+'</span></div></div>';
  }
  el.addEventListener('click',function(e){var x=e.target.closest('[data-k]');if(!x)return;k=+x.dataset.k;draw();});
  draw();
});
