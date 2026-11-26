/* core/date: Shamsi (Jalali) dates and "today" in Tehran time, no libraries */
var JMON=['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
var WDAY=['یکشنبه','دوشنبه','سه‌شنبه','چهارشنبه','پنج‌شنبه','جمعه','شنبه'];
function g2j(gy,gm,gd){
  var gdm=[0,31,59,90,120,151,181,212,243,273,304,334],gy2=gm>2?gy+1:gy;
  var days=355666+365*gy+Math.floor((gy2+3)/4)-Math.floor((gy2+99)/100)+Math.floor((gy2+399)/400)+gd+gdm[gm-1];
  var jy=-1595+33*Math.floor(days/12053);days%=12053;
  jy+=4*Math.floor(days/1461);days%=1461;
  if(days>365){jy+=Math.floor((days-1)/365);days=(days-1)%365;}
  var jm=days<186?1+Math.floor(days/31):7+Math.floor((days-186)/30);
  var jd=days<186?1+days%31:1+(days-186)%30;
  return [jy,jm,jd];
}
function parseISO(s){var p=String(s).split('-');return [+p[0],+p[1],+p[2]];}
function dayNum(g){return Math.round(Date.UTC(g[0],g[1]-1,g[2])/864e5);}
/* the current time; a check script may set window.KN_NOW (any Date-parsable string) to fake it */
function nowDate(){if(W.KN_NOW){var d=new Date(W.KN_NOW);if(!isNaN(d))return d;}return new Date();}
/* milliseconds of the moment a Tehran calendar day ends (Iran has used fixed +03:30 since 2022) */
function tehranDayEnd(iso){var g=parseISO(iso);return Date.UTC(g[0],g[1]-1,g[2]+1)-3.5*3600e3;}
/* today's Gregorian date on the Tehran clock (Intl first, fixed +03:30 as fallback) */
function tehranToday(now){
  now=now||nowDate();
  try{
    var f=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Tehran',year:'numeric',month:'numeric',day:'numeric'}).formatToParts(now),o={};
    f.forEach(function(x){o[x.type]=x.value;});
    if(o.year&&o.month&&o.day)return [+o.year,+o.month,+o.day];
  }catch(e){}
  var t=new Date(now.getTime()+3.5*3600e3);
  return [t.getUTCFullYear(),t.getUTCMonth()+1,t.getUTCDate()];
}
function daysUntil(iso){return dayNum(parseISO(iso))-dayNum(tehranToday());}
function weekdayFa(iso){var g=parseISO(iso);return WDAY[new Date(Date.UTC(g[0],g[1]-1,g[2])).getUTCDay()];}
/* "۱۶ اردیبهشت ۱۴۰۶" (with weekday: "پنج‌شنبه ۱۶ اردیبهشت ۱۴۰۶") */
function faDate(iso,withDay){var g=parseISO(iso),j=g2j(g[0],g[1],g[2]);return (withDay?weekdayFa(iso)+' ':'')+fa(j[2])+' '+JMON[j[1]-1]+' '+fa(j[0]);}
/* "۱۶ تا ۲۲ آذر ۱۴۰۵" */
function faRange(a,b){
  var ga=parseISO(a),gb=parseISO(b),ja=g2j(ga[0],ga[1],ga[2]),jb=g2j(gb[0],gb[1],gb[2]);
  if(ja[0]===jb[0]&&ja[1]===jb[1])return fa(ja[2])+' تا '+fa(jb[2])+' '+JMON[jb[1]-1]+' '+fa(jb[0]);
  return faDate(a)+' تا '+faDate(b);
}
