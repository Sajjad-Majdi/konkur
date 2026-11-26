/* tools/bayes-net: 1401 Q79 Bayes network with its CPTs (figure "figBN") */
regFig('figBN',function(){
  var svg='<svg viewBox="0 0 220 170" class="bns" role="img" aria-label="شبکه بیزی"><defs><marker id="bar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 10 5 0 10z" class="hg-ar"/></marker></defs>';
  var P={A:[110,26],B:[46,86],C:[174,86],D:[110,146]},E=[['A','B'],['A','C'],['B','D'],['C','D']];
  E.forEach(function(ed){var a=P[ed[0]],b=P[ed[1]],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy),ux=dx/L,uy=dy/L;svg+='<line x1="'+(a[0]+ux*19).toFixed(1)+'" y1="'+(a[1]+uy*19).toFixed(1)+'" x2="'+(b[0]-ux*21).toFixed(1)+'" y2="'+(b[1]-uy*21).toFixed(1)+'" class="hg-e" marker-end="url(#bar)"/>';});
  Object.keys(P).forEach(function(k){svg+='<circle cx="'+P[k][0]+'" cy="'+P[k][1]+'" r="18" class="hg-n"/><text x="'+P[k][0]+'" y="'+(P[k][1]+5)+'" class="hg-l">'+k+'</text>';});
  svg+='</svg>';
  function tb(head,rows){var h='<table class="dt cpt"><tr>'+head.map(function(x){return '<th>'+rich(x)+'</th>';}).join('')+'</tr>';rows.forEach(function(r){h+='<tr>'+r.map(function(x){return '<td>'+rich('$'+x+'$')+'</td>';}).join('')+'</tr>';});return h+'</table>';}
  var t='<div class="cpts" dir="ltr">'+tb(['$P(A=0)$'],[['0.5']])+tb(['$A$','$P(B=0|A)$'],[['0','0.8'],['1','0.2']])+tb(['$A$','$P(C=0|A)$'],[['0','0.1'],['1','0.8']])+tb(['$B$','$C$','$P(D=0|B,C)$'],[['0','0','1'],['1','0','0.5'],['0','1','0.5'],['1','1','0']])+'</div>';
  return '<div class="bnf">'+svg+t+'</div>';
});
