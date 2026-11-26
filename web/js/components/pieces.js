/* components/pieces: small shared building blocks of the views */
function ring(frac,size,sw){
  size=size||20;sw=sw||3;var r=(size-sw)/2,c=2*Math.PI*r;
  return '<svg class="ring" viewBox="0 0 '+size+' '+size+'" style="width:'+size+'px;height:'+size+'px" aria-hidden="true"><circle class="t" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" style="stroke-width:'+sw+'"/><circle class="v" cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" style="stroke-width:'+sw+'" stroke-dasharray="'+c.toFixed(2)+'" stroke-dashoffset="'+(c*(1-frac)).toFixed(2)+'"/></svg>';
}
/* "۴ از ۵" -> five squares, four filled */
function freq(p,withText){
  var m=/^(\S+) از (\S+)$/.exec(p.rank.repeat);
  if(!m)return '<span class="fqt">'+esc(p.rank.repeat)+'</span>';
  var n=+toLatin(m[1]),t=+toLatin(m[2]),h='';
  for(var i=0;i<t;i++)h+='<i class="'+(i<n?'on':'')+'"></i>';
  return '<span class="freq" title="'+esc(p.f)+'">'+h+'</span>'+(withText?'<span>'+fa(n)+' از '+fa(t)+' کنکور اخیر</span>':'');
}
function hours(h){return fa(h)+' ساعت';}
function qref(q){return 'کنکور '+fa(q.y)+' · سوال '+fa(q.n);}
function tb(back,title,right,sub){return '<div class="tb">'+(back?'<a class="ibtn tap" href="'+back+'" aria-label="برگشت">'+ic('arr')+'</a>':'<span class="logo">ک</span>')+'<div class="ttl">'+title+(sub?' <span class="sub">'+sub+'</span>':'')+'</div>'+(right||'')+'</div>';}
function themeBtn(){return '<button class="ibtn tap" data-act="theme-toggle" aria-label="تغییر پوسته">'+ic(D.documentElement.getAttribute('data-theme')==='dark'?'sun':'moon')+'</button>';}
function segbar(c){
  return '<div class="segbar">'+byRank(c).map(function(id){var s=pst(id),p=s.done?1:s.started?((s.read?1:0)+(s.ex?1:0)+s.ans/s.tot)/3:0;
    return '<i class="'+(s.done?'done':s.started?'part':'')+'" style="--p:'+Math.round(p*100)+'%" title="'+esc(PAT[id].t)+'"></i>';}).join('')+'</div>';
}
/* plain one-line excerpt of a question text */
function plain(h){return rich(String(h).split(/<(?:div|table|pre|ol|ul|figure)/)[0]).replace(/<br\s*\/?>/g,' ').replace(/<small>.*?<\/small>/g,'');}
function testBtns(d,cls){return (d.tests||[]).filter(function(c){return SELFTEST[c];}).map(function(c){return '<a class="'+(cls||'btn l ghost tap')+' c-'+c+'" href="#/t/'+c+'">'+ic('play','s')+'آزمونک '+esc(cShort(c))+'</a>';}).join('');}
function pctFa(x){return fa((Math.round(x*10)/10).toString().replace('-','−'))+'٪';}
