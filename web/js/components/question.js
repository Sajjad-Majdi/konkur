/* components/question: question card in three modes
   e = worked example (all steps + key shown), p = practice (try, mark, reveal steps), t = timed self-test (select only) */
function keySrc(q){if(q.src==='s')return 'کلید نهایی سنجش';if(q.src==='v')return 'پاسخ با حل مستقل';if(q.y===1404)return 'کلید سنجش';return 'کلید اولیه سنجش';}
function qst(id){var s=S.q[id];if(!s||typeof s!=='object'){s={t:[],r:0};S.q[id]=s;}if(!Array.isArray(s.t))s.t=[];return s;}
function qState(id){var s=S.q[id];if(!s||!s.t||!Q[id])return '';if(s.t.length&&s.t[0]===Q[id].key)return 'ok';if(s.done)return 'done';if(s.t.length)return 'bad';return '';}
function qCard(id,mode){
  var q=Q[id];
  var h='<div class="q q-'+mode+'" data-q="'+id+'" data-mode="'+mode+'">'+
    '<div class="qm"><span class="qy">کنکور '+fa(q.y)+' <b>سوال '+fa(q.n)+'</b></span><span class="qk">'+keySrc(q)+'</span></div>'+
    '<div class="qt">'+rich(q.t)+'</div>'+(q.fig?'<div class="fig">'+FIG[q.fig]()+'</div>':'')+
    '<div class="opts">'+q.o.map(function(o,k){return '<button type="button" class="opt" data-k="'+(k+1)+'"><span class="onum">'+fa(k+1)+'</span><span class="ot">'+rich(o)+'</span><span class="om"></span></button>';}).join('')+'</div>';
  if(mode==='p'){
    h+='<div class="fb" aria-live="polite"></div><ol class="steps"></ol><div class="qa"><button type="button" class="btn ghost" data-qa="next">قدم بعدی راه‌حل</button><button type="button" class="btn ghost soft" data-qa="all">کل راه‌حل</button></div>';
  }else if(mode==='e'){
    h+='<ol class="steps"></ol>';
  }
  return h+'</div>';
}
function markOpt(b,cls){b.classList.remove('ok','bad','key');if(cls){void b.offsetWidth;b.classList.add(cls);}var m=$('.om',b);if(m)m.innerHTML=cls==='ok'||cls==='key'?IC.check:(cls==='bad'?IC.x:'');}
function renderSteps(qe,n,anim){var q=Q[qe.dataset.q],ol=$('.steps',qe);if(!ol)return;for(var i=ol.children.length;i<n;i++){var li=D.createElement('li');li.innerHTML=rich(q.s[i]);if(anim===false)li.style.animation='none';else if(anim==='stagger')li.style.animationDelay=(i*0.06)+'s';ol.appendChild(li);}}
function hydrateQ(qe){
  var id=qe.dataset.q,q=Q[id],mode=qe.dataset.mode;
  if(mode==='e'){renderSteps(qe,q.s.length,'stagger');markOpt($('.opt[data-k="'+q.key+'"]',qe),'key');return;}
  if(mode!=='p')return;
  var s=S.q[id];
  if(!s)return;
  (s.t||[]).forEach(function(k){var b=$('.opt[data-k="'+k+'"]',qe);if(b)markOpt(b,k===q.key?'ok':'bad');});
  if(s.r)renderSteps(qe,s.r,false);
  if(s.r>=q.s.length)markOpt($('.opt[data-k="'+q.key+'"]',qe),(s.t||[]).indexOf(q.key)>=0?'ok':'key');
  updQA(qe);
}
function updQA(qe){
  var id=qe.dataset.q,q=Q[id],s=S.q[id]||{t:[],r:0},fb=$('.fb',qe);
  var nb=$('[data-qa="next"]',qe),ab=$('[data-qa="all"]',qe);
  var full=(s.r||0)>=q.s.length;
  if(nb){nb.disabled=full;nb.textContent=full?'راه‌حل کامل شد':'قدم بعدی راه‌حل';}
  if(ab)ab.hidden=full;
  if(fb){
    var t=s.t||[];
    if(t.length&&t[t.length-1]===q.key)fb.innerHTML='<span class="fb-ok">'+IC.check+(t.length===1?'درست در اولین تلاش':'درست در تلاش '+fa(t.length))+'</span>';
    else if(t.length)fb.innerHTML='<span class="fb-bad">'+IC.x+'گزینه '+fa(t[t.length-1])+' درست نیست</span>';
    else fb.innerHTML='';
  }
}
function refreshDots(id){var d=$('.dot[data-q="'+id+'"]');if(d){d.className='dot '+qState(id);}}
function onOpt(b){
  var qe=b.closest('.q');if(!qe)return;
  var mode=qe.dataset.mode;
  if(mode==='t'){testPick(qe,b);return;}
  if(mode!=='p')return;
  var id=qe.dataset.q,q=Q[id],k=+b.dataset.k,s=qst(id);
  if(s.t.indexOf(q.key)>=0||s.t.indexOf(k)>=0)return;
  s.t.push(k);
  if(k===q.key){s.done=1;markOpt(b,'ok');}
  else markOpt(b,'bad');
  save();updQA(qe);refreshDots(id);refreshProgress();
}
function onQA(b){
  var qe=b.closest('.q'),id=qe.dataset.q,q=Q[id],s=qst(id);
  s.r=b.dataset.qa==='next'?Math.min(q.s.length,(s.r||0)+1):q.s.length;
  if(s.r>=q.s.length){s.done=1;markOpt($('.opt[data-k="'+q.key+'"]',qe),s.t.indexOf(q.key)>=0?'ok':'key');}
  renderSteps(qe,s.r,true);save();updQA(qe);refreshDots(id);refreshProgress();
  var last=$('.steps li:last-child',qe);if(last&&last.getBoundingClientRect().bottom>W.innerHeight-90)last.scrollIntoView({behavior:'smooth',block:'center'});
}
