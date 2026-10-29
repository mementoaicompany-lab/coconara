/* New seasonal content uses the guide's existing language and page events. */
(()=>{'use strict';
 function init(){
  const tab=document.querySelector('.latte-tab'),panel=document.getElementById('page-latte');
  if(!tab||!panel)return;
  function refresh(){
   const all=window.COCO_LATTE_COPY,copy=all?.[window.cocoLanguage?.()||'ko']||all?.ko;
   if(!copy)return;
   document.querySelectorAll('[data-latte-copy]').forEach(el=>{const value=copy[el.dataset.latteCopy];if(value&&el.textContent!==value)el.textContent=value;});
   tab.setAttribute('aria-label',copy.navAria);
   panel.querySelector('img').alt=copy.alt;
   panel.querySelector('.latte-temperature').setAttribute('aria-label',copy.temperatureLabel);
  }
  function revealSelected(){
   const current=document.querySelector('.tab-bar [aria-current="page"]');
   if(current)current.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
  }
  function visibility(){tab.classList.toggle('latte-away',document.hidden);}
  refresh();visibility();
  document.addEventListener('coco:language',refresh);
  document.addEventListener('coco:page',()=>requestAnimationFrame(revealSelected));
  window.addEventListener('popstate',()=>requestAnimationFrame(revealSelected));
  document.addEventListener('visibilitychange',visibility);
  if(panel.classList.contains('active'))revealSelected();
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
