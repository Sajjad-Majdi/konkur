/* tools/huffman: Huffman merge calculator (tool "huff") */
function huff(ws){
  var nodes=ws.map(function(w,i){return {w:w,ids:[i],o:i};}),len=ws.map(function(){return 0;}),merges=[],o=ws.length;
  while(nodes.length>1){
    nodes.sort(function(a,b){return a.w-b.w||a.o-b.o;});
    var x=nodes.shift(),y=nodes.shift(),z={w:x.w+y.w,ids:x.ids.concat(y.ids),o:o++};
    z.ids.forEach(function(i){len[i]++;});merges.push([x.w,y.w,z.w]);nodes.push(z);
  }
  return {merges:merges,total:merges.reduce(function(s,m){return s+m[2];},0),len:len};
}
regTool('huff',function(el){
  var P={q:'1000 1200 800 1500 1800 700',g:'1 2 4 8 16'};
  el.innerHTML=wgHead('ماشین‌حساب هافمن',seg([['q','۱۴۰۵ سوال ۶۷'],['g','تصاعد هندسی']],'q','pre'))+
    '<input class="in wide" dir="ltr" inputmode="numeric" value="'+P.q+'" aria-label="فراوانی‌ها"><div class="hm"></div><div class="hsum" aria-live="polite"></div>';
  var inp=$('input',el);
  function run(){
    var ws=toLatin(inp.value).split(/[^0-9]+/).filter(Boolean).map(Number).filter(function(x){return x>0;}).slice(0,12);
    if(ws.length<2){$('.hm',el).innerHTML='';$('.hsum',el).innerHTML='<span class="muted">حداقل دو عدد</span>';return;}
    var r=huff(ws),N=ws.reduce(function(a,b){return a+b;},0),fx=Math.ceil(Math.log(ws.length)/Math.LN2-1e-9);
    $('.hm',el).innerHTML=r.merges.map(function(m,j){return '<div class="hmr" style="animation-delay:'+(j*0.07)+'s"><span class="hn">'+fa(j+1)+'</span>'+rich('$'+m[0]+'+'+m[1]+'='+m[2]+'$')+'</div>';}).join('');
    var L='abcdefghijkl';
    $('.hsum',el).innerHTML='<div class="htot"><span>تعداد کل بیت‌ها برابر جمع ادغام‌ها</span><b>'+fa(r.total)+'</b></div>'+
      '<div class="hcmp"><span>کد ثابت '+fa(fx)+' بیتی</span><b>'+fa(N*fx)+'</b></div><div class="hcmp"><span>یک بیت برای هر حرف</span><b>'+fa(N)+'</b></div>'+
      '<div class="tw"><table class="dt hl" dir="ltr"><tr><th>'+rich('$x$')+'</th>'+ws.map(function(w,i){return '<td>'+L.charAt(i)+'</td>';}).join('')+'</tr><tr><th>'+rich('$f$')+'</th>'+ws.map(function(w){return '<td>'+w+'</td>';}).join('')+'</tr><tr><th>بیت</th>'+r.len.map(function(x){return '<td><b>'+x+'</b></td>';}).join('')+'</tr></table></div>';
  }
  el.addEventListener('click',function(e){var b=e.target.closest('button');if(!b||!el.contains(b))return;if(b.parentNode.classList.contains('pre')){segOn(b.parentNode,b.dataset.v);inp.value=P[b.dataset.v];run();}});
  inp.addEventListener('input',function(){segOn($('.pre',el),'');run();});
  run();
});
