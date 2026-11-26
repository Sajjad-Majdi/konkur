/* core/util: DOM helpers, Persian digits, escaping */
var D=document, W=window;
function $(s,r){return (r||D).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s));}
var FAD='۰۱۲۳۴۵۶۷۸۹';
function fa(x){return String(x).replace(/[0-9]/g,function(d){return FAD.charAt(+d);}).replace(/\./g,'٫');}
function toLatin(s){return String(s).replace(/[۰-۹]/g,function(d){return FAD.indexOf(d);});}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function walk(n,f){f(n);if(n.ch)n.ch.forEach(function(c){walk(c,f);});}
