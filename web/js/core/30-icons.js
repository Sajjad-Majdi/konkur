/* core/icons: inline stroke icons by name (courses.json "icon" refers to these) */
function icp(p,extra){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"'+(extra||'')+'>'+p+'</svg>';}
var IC={
  map:icp('<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4z"/><path d="M9 4v14M15 6v14"/>'),
  ai:icp('<rect x="6.5" y="6.5" width="11" height="11" rx="3"/><path d="M10 10h4v4h-4zM12 2.5v4M12 17.5v4M2.5 12h4M17.5 12h4"/>'),
  ds:icp('<circle cx="12" cy="5" r="2.3"/><circle cx="5.5" cy="18.5" r="2.3"/><circle cx="18.5" cy="18.5" r="2.3"/><path d="M10.9 7.1 6.6 16.3M13.1 7.1l4.3 9.2"/>'),
  os:icp('<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M3 9h18M7 12.5l2.5 2-2.5 2M12 16.5h4.5"/>'),
  toc:icp('<circle cx="6" cy="14" r="3.3"/><circle cx="18" cy="14" r="3.3"/><circle cx="18" cy="14" r="1.5"/><path d="M9.5 14h4.6M12.6 12.4l1.6 1.6-1.6 1.6"/><path d="M4.4 11.2C3.2 6.6 8.8 6.6 7.6 11.2"/>'),
  exam:icp('<path d="M5 21V4"/><path d="M5 4.5h12l-2.5 4 2.5 4H5"/>'),
  sun:icp('<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4"/>'),
  moon:icp('<path d="M20 14.6A8.2 8.2 0 1 1 9.4 4a6.6 6.6 0 0 0 10.6 10.6z"/>'),
  chev:icp('<path d="m6 9.5 6 6 6-6"/>'),
  check:icp('<path d="m5 12.5 4.5 4.5L19 7.5"/>'),
  x:icp('<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>'),
  cue:icp('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
  how:icp('<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8z"/>'),
  trap:icp('<path d="M12 4 2.8 19.5h18.4L12 4z"/><path d="M12 10v4.2M12 17h.01"/>'),
  book:icp('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5v-15z"/><path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H20v3H6.5"/>'),
  pen:icp('<path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5z"/>'),
  rep:icp('<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5"/><path d="M20 4v4.5h-4.5"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.5"/><path d="M4 20v-4.5h4.5"/>'),
  tool:icp('<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>'),
  play:icp('<path d="M7 4.5v15l12-7.5-12-7.5z"/>'),
  next:icp('<path d="m14.5 6-6 6 6 6"/>'),
  prev:icp('<path d="m9.5 6 6 6-6 6"/>'),
  first:icp('<path d="m10 6 6 6-6 6M18 6v12"/>'),
  last:icp('<path d="m14 6-6 6 6 6M6 6v12"/>'),
  clock:icp('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  lock:icp('<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>')
};
/* sprite icons from the template (<symbol id="i-name">): ic('home'), ic('check','s') */
function ic(n,c){return '<svg class="ic '+(c||'')+'" aria-hidden="true"><use href="#i-'+n+'"/></svg>';}
