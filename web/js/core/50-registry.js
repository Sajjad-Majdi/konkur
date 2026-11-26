/* core/registry: content data (built from content/*.json) and the named tool/figure/table registries.
   Content files refer to tools, figures and tables by these names; the build checks every name exists. */
var DATA=KN_DATA;
var SITE=DATA.site, EXAM=DATA.exam, GROUPS=DATA.groups;
var COURSES=DATA.courses;                 /* every exam course, sorted by "order" (study order) */
var LIVE=COURSES.filter(function(c){return c.hasContent;});   /* courses with pages */
var COURSE={};COURSES.forEach(function(c){COURSE[c.id]=c;});
var PATTERNS=DATA.patterns, Q=DATA.q, SELFTEST=DATA.selftest, PLANDATA=DATA.plan;
var PAT={};PATTERNS.forEach(function(p){PAT[p.id]=p;});
/* every question knows its pattern (null for self-test-only questions) and course */
Object.keys(Q).forEach(function(id){Q[id].pat=null;Q[id].c=id.split('-')[0];});
PATTERNS.forEach(function(p){[p.ex].concat(p.pr).forEach(function(id){if(Q[id])Q[id].pat=p.id;});});
/* study order of patterns (rank.order), over all courses and per course */
var RANK=PATTERNS.slice().sort(function(a,b){return a.rank.order-b.rank.order;}).map(function(p){return p.id;});
function byRank(c){return RANK.filter(function(id){return PAT[id].c===c;});}
function patOf(id){return Q[id]&&Q[id].pat?PAT[Q[id].pat]:null;}
function cShort(c){return COURSE[c].short||COURSE[c].name;}

var TOOLS={}, FIG={}, TABLES={};
/* interactive widget: mount(el) fills the element */
function regTool(name,mount){TOOLS[name]=mount;}
/* static figure inside a question: fn() returns HTML */
function regFig(name,fn){FIG[name]=fn;}
/* static table inside a pattern: fn() returns HTML */
function regTable(name,fn){TABLES[name]=fn;}
function mountTool(el){var f=TOOLS[el.dataset.w];if(f&&!el.dataset.m){el.dataset.m='1';f(el);}}
/* names of the tools as shown in lists */
var TOOLNAME={heur:'ابزار هیوریستیک',ab:'شبیه‌ساز آلفا-بتا',master:'ابزار قضیه اصلی',heap:'ابزار هرم',huff:'ماشین‌حساب هافمن',gantt:'شبیه‌ساز زمان‌بندی',pager:'ابزار جایگزینی صفحه',ev:'امید نمره حدس'};
