/* components/widgets: small building blocks shared by the tools */
function seg(items,on,cls){return '<div class="seg '+(cls||'')+'" role="tablist">'+items.map(function(it){return '<button type="button" data-v="'+it[0]+'"'+(String(it[0])===String(on)?' class="on" aria-selected="true"':'')+'>'+it[1]+'</button>';}).join('')+'</div>';}
function segOn(segEl,v){$$('button',segEl).forEach(function(b){var o=b.dataset.v===String(v);b.classList.toggle('on',o);b.setAttribute('aria-selected',o?'true':'false');});}
function stepper(key,label,val){return '<div class="stp" data-s="'+key+'"><span class="stp-l">'+label+'</span><div class="stp-c"><button type="button" data-d="1" aria-label="بیشتر">+</button><output>'+fa(val)+'</output><button type="button" data-d="-1" aria-label="کمتر">−</button></div></div>';}
function wgHead(title,right){return '<div class="wg-h"><span class="wg-t">'+IC.tool+title+'</span>'+(right||'')+'</div>';}
