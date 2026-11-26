/* tools/heap: where can the k-th smallest (or the largest) sit in a min-heap of n distinct keys (tool "heap") */
function subSize(i,n){var c=0,st=[i];while(st.length){var x=st.pop();if(x>n)continue;c++;st.push(2*x,2*x+1);}return c;}
function heapPos(n,k,mode){
  var r=[];
  for(var i=1;i<=n;i++){
    var d=Math.floor(Math.log(i)/Math.LN2+1e-9);
    if(mode==='max'){if(i>Math.floor(n/2))r.push(i);}
    else if(k===1){if(i===1)r.push(i);}
    else if(k<=n&&i>=2&&d<=k-1&&k-1<=n-subSize(i,n))r.push(i);
  }
  return r;
}
function ranges(a){var r=[],s=null,p=null;a.forEach(function(x){if(s===null){s=p=x;}else if(x===p+1)p=x;else{r.push([s,p]);s=p=x;}});if(s!==null)r.push([s,p]);return r;}
regTool('heap',function(el){
  var v={n:20,k:4},mode='k';
  el.innerHTML=wgHead('مکان‌های ممکن در min-heap',seg([['k','k-امین کوچک‌ترین'],['max','بزرگ‌ترین']],mode,'mode'))+
    '<div class="stps">'+stepper('n','تعداد $n$',v.n)+stepper('k','$k$',v.k)+'</div><div class="svgbox"></div><div class="hstrip" dir="ltr"></div><div class="hpos" aria-live="polite"></div>';
  $$('.stp-l',el).forEach(function(s){s.innerHTML=rich(s.innerHTML);});
  function run(){
    $$('.stp',el).forEach(function(s){$('output',s).textContent=fa(v[s.dataset.s]);s.classList.toggle('off',mode==='max'&&s.dataset.s==='k');});
    var pos=heapPos(v.n,v.k,mode),set={};pos.forEach(function(x){set[x]=1;});
    var Wd=480,e='',nd='';
    for(var i=1;i<=v.n;i++){
      var d=Math.floor(Math.log(i)/Math.LN2+1e-9),j=i-Math.pow(2,d),x=(j+0.5)*Wd/Math.pow(2,d),y=22+d*50;
      if(i>1){var pd=d-1,pj=Math.floor(i/2)-Math.pow(2,pd),px=(pj+0.5)*Wd/Math.pow(2,pd),py=22+pd*50;e+='<line x1="'+px+'" y1="'+py+'" x2="'+x+'" y2="'+y+'" class="hp-e"/>';}
      nd+='<g class="hp-n'+(set[i]?' on':'')+'" style="--d:'+(i*0.012).toFixed(3)+'s"><circle cx="'+x+'" cy="'+y+'" r="14"/><text x="'+x+'" y="'+(y+4.5)+'">'+i+'</text></g>';
    }
    var H=22+Math.floor(Math.log(v.n)/Math.LN2+1e-9)*50+22;
    $('.svgbox',el).innerHTML='<svg viewBox="0 0 '+Wd+' '+H+'" class="hps" role="img" aria-label="هرم">'+e+nd+'</svg>';
    var s='';for(var q=1;q<=v.n;q++)s+='<span class="hc'+(set[q]?' on':'')+'">'+fa(q)+'</span>';
    $('.hstrip',el).innerHTML=s;
    var rg=ranges(pos);
    $('.hpos',el).innerHTML=pos.length?'<b>'+(mode==='max'?'بزرگ‌ترین عنصر':fa(v.k)+'-امین کوچک‌ترین')+'</b> در '+rg.map(function(r){return r[0]===r[1]?rich('$a_{'+r[0]+'}$'):rich('$a_{'+r[0]+'}$')+' تا '+rich('$a_{'+r[1]+'}$');}).join(' و ')+' <span class="muted">('+fa(pos.length)+' خانه)</span>':'<b>هیچ خانه‌ای</b>';
  }
  el.addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b||!el.contains(b))return;
    if(b.parentNode.classList.contains('mode')){segOn(b.parentNode,b.dataset.v);mode=b.dataset.v;run();return;}
    var s=b.closest('.stp');if(!s)return;var d=+b.dataset.d;
    if(s.dataset.s==='n')v.n=Math.max(2,Math.min(31,v.n+d));else v.k=Math.max(1,Math.min(6,v.k+d));
    run();
  });
  run();
});
