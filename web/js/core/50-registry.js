/* core/registry: content data (built from content/*.json) and the named tool/figure/table registries.
   Content files refer to tools, figures and tables by these names; the build checks every name exists. */
var DATA=KN_DATA;
var SITE=DATA.site, EXAM=DATA.exam, GROUPS=DATA.groups;
var COURSES=DATA.courses;                 /* every exam course, sorted by "order" */
var LIVE=COURSES.filter(function(c){return c.hasContent;});   /* courses with pages */
var COURSE={};COURSES.forEach(function(c){COURSE[c.id]=c;});
var PATTERNS=DATA.patterns, Q=DATA.q, SELFTEST=DATA.selftest, PLAN=DATA.plan;
var PAT={};PATTERNS.forEach(function(p){PAT[p.id]=p;});
function patOf(id){for(var i=0;i<PATTERNS.length;i++){var p=PATTERNS[i];if(p.ex===id||p.pr.indexOf(id)>=0)return p;}return null;}
function cShort(c){return COURSE[c].short||COURSE[c].name;}

var TOOLS={}, FIG={}, TABLES={};
/* interactive widget: mount(el) fills the element */
function regTool(name,mount){TOOLS[name]=mount;}
/* static figure inside a question: fn() returns HTML */
function regFig(name,fn){FIG[name]=fn;}
/* static table inside a pattern: fn() returns HTML */
function regTable(name,fn){TABLES[name]=fn;}
function mountTool(el){var f=TOOLS[el.dataset.w];if(f&&!el.dataset.m){el.dataset.m='1';f(el);}}
