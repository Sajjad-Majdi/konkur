/* tools/os-pager: page replacement FIFO / LRU / OPT on a reference string, frame by frame (tool "pager").
   A new page fills the first empty frame; a victim keeps its frame slot so the table rows stay stable.
   OPT ties (pages never used again, or used at the same time) go to the lowest slot. */
function osPaging(refs,k,alg){
  var fr=[],load=[],used=[],cols=[],faults=0;
  refs.forEach(function(r,t){
    var at=fr.indexOf(r),hit=at>=0;
    if(hit)used[at]=t;
    else{
      faults++;
      if(fr.length<k){at=fr.length;fr.push(r);}
      else{
        var v=0,i;
        for(i=1;i<k;i++){
          if(alg==='fifo'&&load[i]<load[v])v=i;
          else if(alg==='lru'&&used[i]<used[v])v=i;
          else if(alg==='opt'){var nx=function(p){var j=refs.indexOf(p,t+1);return j<0?1e9:j;};if(nx(fr[i])>nx(fr[v]))v=i;}
        }
        at=v;fr[v]=r;
      }
      load[at]=t;used[at]=t;
    }
    cols.push({r:r,f:fr.slice(),hit:hit,at:at});
  });
  return {cols:cols,faults:faults};
}
regTool('pager',function(el){
  var k=3,alg='fifo',txt='7 0 1 2 0 3 0 4 2 3 0 3 2 1 2 0 1 7 0 1';
  el.innerHTML=wgHead('جایگزینی صفحه',seg([['fifo','FIFO'],['lru','LRU'],['opt','OPT']],alg,'alg'))+
    '<input class="in wide" dir="ltr" aria-label="رشته ارجاع" value="'+txt+'">'+
    '<div class="stps">'+stepper('k','تعداد قاب',k)+'</div><div class="tw pgt"></div><div class="hpos pgr" aria-live="polite"></div>';
  function run(){
    $('.stp output',el).textContent=fa(k);
    var refs=toLatin($('input',el).value).split(/[^0-9]+/).filter(function(x){return x!=='';}).slice(0,40).map(Number);
    if(!refs.length){$('.pgt',el).innerHTML='';$('.pgr',el).textContent='';return;}
    var r=osPaging(refs,k,alg),h='<table class="dt st"><thead><tr><th></th>'+r.cols.map(function(c){return '<th>'+fa(c.r)+'</th>';}).join('')+'</tr></thead><tbody>';
    for(var i=0;i<k;i++)h+='<tr><th>'+fa(i+1)+'</th>'+r.cols.map(function(c){var v=c.f[i];return '<td'+(!c.hit&&c.at===i?' class="n"':'')+'>'+(v===undefined?'':fa(v))+'</td>';}).join('')+'</tr>';
    h+='<tr><th></th>'+r.cols.map(function(c){return c.hit?'<td class="y">✓</td>':'<td class="n">F</td>';}).join('')+'</tr></tbody></table>';
    $('.pgt',el).innerHTML=h;
    $('.pgr',el).innerHTML='<b>'+fa(r.faults)+' خطای صفحه</b> <span class="muted">از '+fa(refs.length)+' ارجاع</span>';
  }
  $('input',el).addEventListener('input',run);
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!el.contains(b))return;
    if(b.parentNode.classList.contains('alg')){segOn(b.parentNode,b.dataset.v);alg=b.dataset.v;run();return;}
    var s=b.closest('.stp');if(!s)return;k=Math.max(1,Math.min(7,k+(+b.dataset.d)));run();
  });
  run();
});
