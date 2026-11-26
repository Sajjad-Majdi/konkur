/* tools/search-table: comparison table of uninformed search algorithms (table "searchTable") */
regTable('searchTable',function(){
  var R=[['BFS','بله','با هزینه برابر','$O(b^d)$','$O(b^d)$'],['UCS','بله','بله','$O(b^{1+\\lfloor C^*/\\epsilon \\rfloor})$','همان زمان'],['DFS','خیر','خیر','$O(b^m)$','$O(bm)$'],['DLS','خیر','خیر','$O(b^l)$','$O(bl)$'],['IDS','بله','با هزینه برابر','$O(b^d)$','$O(bd)$'],['دوطرفه با دو BFS','بله','با هزینه برابر','$O(b^{d/2})$','$O(b^{d/2})$']];
  var h='<div class="tw"><table class="dt st"><thead><tr><th>الگوریتم</th><th>کامل</th><th>بهینه</th><th>زمان</th><th>حافظه</th></tr></thead><tbody>';
  R.forEach(function(r){h+='<tr><th>'+r[0]+'</th><td class="'+(r[1]==='بله'?'y':'n')+'">'+r[1]+'</td><td class="'+(r[2]==='بله'?'y':(r[2]==='خیر'?'n':'p'))+'">'+r[2]+'</td><td>'+rich(r[3])+'</td><td>'+rich(r[4])+'</td></tr>';});
  return h+'</tbody></table></div>';
});
