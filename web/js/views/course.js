/* views/course: the page of ANY course that has content — header ring, its patterns in file order, its self-test */
function courseHTML(c){
  var co=COURSE[c],ps=PATTERNS.filter(function(p){return p.c===c;}),st=courseStats(c),nq=0,tl=(SELFTEST[c]||[]).length;
  ps.forEach(function(p){nq+=1+p.pr.length;});
  var h='<section class="chead"><div><h1>'+co.name+'</h1><p class="sub">'+fa(ps.length)+' الگو و '+fa(nq)+' سوال واقعی'+(tl?' و آزمونک '+fa(tl)+' سوالی':'')+'</p></div><div class="cring">'+ringSvg(frac(st),c)+'<small class="cst" data-c="'+c+'">'+fa(st.done)+' از '+fa(st.n)+'</small></div></section>';
  h+='<div class="plist">'+ps.map(patHTML).join('')+'</div>';
  var ys=(SELFTEST[c]||[]).map(function(id){return Q[id].y;}),y0=Math.min.apply(null,ys),y1=Math.max.apply(null,ys);
  if(tl)h+='<section class="card tcard" id="t-'+c+'"><h2>آزمونک '+co.name+'</h2><p class="lead">'+fa(tl)+' سوال واقعی ترکیبی از '+fa(y0)+' تا '+fa(y1)+' در '+fa(tl*135/60)+' دقیقه با نمره منفی</p><div class="tst" data-c="'+c+'"></div><button type="button" class="btn big" data-test="'+c+'">'+IC.play+'شروع آزمونک</button></section>';
  return h;
}
