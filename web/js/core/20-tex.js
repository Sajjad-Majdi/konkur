/* core/tex: a small TeX subset renderer; rich() turns $...$ inside text into math */
var SYM={le:'≤',leq:'≤',ge:'≥',geq:'≥',ne:'≠',neq:'≠',to:'→',rightarrow:'→',Rightarrow:'⇒',models:'⊨',land:'∧',lor:'∨',sim:'¬',lnot:'¬',times:'×',cdot:'·',ldots:'…',cdots:'⋯',infty:'∞',epsilon:'ε',alpha:'α',beta:'β',theta:'θ',Theta:'Θ',Omega:'Ω',sum:'∑',int:'∫',lfloor:'⌊',rfloor:'⌋',lceil:'⌈',rceil:'⌉',equiv:'≡','in':'∈',subseteq:'⊆',pi:'π',mid:'|',approx:'≈',star:'⋆',neg:'¬',Leftrightarrow:'⇔',iff:'⇔',prod:'∏',Delta:'Δ',omega:'ω',phi:'φ',propto:'∝',ll:'≪',
  cup:'∪',cap:'∩',Sigma:'Σ',Gamma:'Γ',emptyset:'∅',varnothing:'∅',lambda:'λ',delta:'δ',varepsilon:'ε',notin:'∉',subset:'⊂',subsetneq:'⊊',supseteq:'⊇',vdash:'⊢',circ:'∘',aleph:'ℵ',forall:'∀',exists:'∃',langle:'⟨',rangle:'⟩'};
var REL={'≤':1,'≥':1,'≠':1,'→':1,'⇒':1,'⊨':1,'≡':1,'∈':1,'⊆':1,'≈':1,'⇔':1,'∝':1,'≪':1,'∉':1,'⊂':1,'⊊':1,'⊇':1,'⊢':1};
var FN={log:1,ln:1,max:1,min:1,sin:1,cos:1,mod:1,lim:1};
function tex(src){
  var i=0,n=src.length;
  function chr(c){
    if(/[A-Za-z]/.test(c))return '<i>'+c+'</i>';
    if(c==='+'||c==='-')return '<span class="bo">'+(c==='-'?'−':'+')+'</span>'+(c==='+'?'<wbr>':'');
    if(c==='='||c==='<'||c==='>')return '<span class="rel">'+esc(c)+'</span><wbr>';
    if(c==="'")return '′';
    if(c==='*')return '∗';
    return esc(c);
  }
  function atom(){
    while(i<n&&src.charAt(i)===' ')i++;
    var c=src.charAt(i);
    if(c==='{'){i++;var h=seq('}');i++;return h;}
    if(c==='\\')return cmd();
    i++;return chr(c);
  }
  function cmd(){
    i++;
    if(i>=n)return '';
    var c=src.charAt(i);
    if(!/[A-Za-z]/.test(c)){
      i++;
      if(c===',')return '<span class="ts"></span>';
      if(c===' ')return ' ';
      if(c==='{'||c==='}'||c==='|')return c;
      return esc(c);
    }
    var m=/^[A-Za-z]+/.exec(src.slice(i))[0];i+=m.length;
    if(m==='frac'){var a=atom(),b=atom();return '<span class="fr"><span class="nu">'+a+'</span><span class="de">'+b+'</span></span>';}
    if(m==='sqrt'){var x=atom();return '<span class="sq"><span class="sr">√</span><span class="sx">'+x+'</span></span>';}
    if(m==='overline'){var o=atom();return '<span class="ol">'+o+'</span>';}
    if(m==='left'||m==='right'||m==='big'||m==='Big'||m==='bigg')return '';
    if(FN[m])return '<span class="fn">'+m+'</span>';
    if(SYM[m]){var s=SYM[m];if(REL[s])return '<span class="rel">'+s+'</span><wbr>';if(s==='∑'||s==='∫'||s==='∏')return '<span class="bop">'+s+'</span>';return s;}
    return esc(m);
  }
  function seq(end){
    var h='';
    while(i<n&&src.charAt(i)!==end){
      var c=src.charAt(i);
      if(c===' '){i++;continue;}
      if(c==='^'||c==='_'){i++;var a=atom();h+=(c==='^'?'<sup>':'<sub>')+a+(c==='^'?'</sup>':'</sub>');continue;}
      if(c==='{'){i++;h+=seq('}');i++;continue;}
      if(c==='\\'){h+=cmd();continue;}
      i++;h+=chr(c);
    }
    return h;
  }
  return seq('\u0000');
}
function rich(s){return String(s).replace(/\$([^$]+)\$/g,function(_,m){
  var parts=m.split(/\\ /);
  var h=parts.length>1?parts.map(function(p){return '<span class="mw">'+tex(p).replace(/<wbr>/g,'')+'</span>';}).join(' '):(m.length<24?'<span class="mw">'+tex(m).replace(/<wbr>/g,'')+'</span>':tex(m));
  return '<bdi dir="ltr" class="m">'+h+'</bdi>';});}
