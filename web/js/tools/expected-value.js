/* tools/expected-value: expected score of a guess after eliminating options (tool "ev") */
regTool('ev',function(el){
  el.innerHTML=wgHead('چند گزینه را با اطمینان حذف کرده‌ای؟',seg([[0,'۰'],[1,'۱'],[2,'۲'],[3,'۳']],2,'pre'))+'<div class="evbar"><i></i></div><div class="evr" aria-live="polite"></div>';
  var TX=[['0','حدس کور نه سود دارد نه ضرر','n'],['\\frac{1}{9}','کمی مثبت ولی پرریسک','p'],['\\frac{1}{3}','بزن','y'],['1','دیگر حدس نیست','y']];
  function run(e){var p=1/(4-e),ev=p-(1-p)/3;$('.evbar i',el).style.width=(Math.max(ev,0)*100)+'%';var t=TX[e];$('.evr',el).innerHTML='<span class="evu">امید نمره</span><span class="evn">'+rich('$'+(t[0]==='0'?'':'+')+t[0]+'$')+'</span><span class="evu">سوال</span><b class="ev-'+t[2]+'">'+t[1]+'</b>';}
  el.addEventListener('click',function(e){var b=e.target.closest('.seg button');if(!b)return;segOn(b.parentNode,b.dataset.v);run(+b.dataset.v);});
  run(2);
});
