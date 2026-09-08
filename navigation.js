(()=>{'use strict';
function init(){
 const body=document.getElementById('no-customer-body'),button=document.querySelector('button[onclick="toggleNoCustomer(this)"]');
 if(!body||!button)return;
 const card=button.parentElement;card.id='coconara-unavailable';button.setAttribute('aria-controls',body.id);
 const sync=()=>button.setAttribute('aria-expanded',String(body.style.display!=='none'));
 new MutationObserver(sync).observe(body,{attributes:true,attributeFilter:['style']});sync();
 let highlightTimer;
 window.cocoOpenRequired=()=>{
  window.showPage('coconara');
  if(body.style.display==='none')window.toggleNoCustomer(button);
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const target=card.previousElementSibling?.classList.contains('section-label')?card.previousElementSibling:card;
   window.scrollTo({top:window.scrollY+target.getBoundingClientRect().top-document.querySelector('.tab-bar').getBoundingClientRect().height-12,behavior:'instant'});button.focus({preventScroll:true});
   clearTimeout(highlightTimer);card.classList.add('coco-required-highlight');highlightTimer=setTimeout(()=>card.classList.remove('coco-required-highlight'),2800);
  }));
 };
 const trigger=document.getElementById('required-guide-link');
 if(trigger){trigger.onclick=window.cocoOpenRequired;trigger.setAttribute('role','button');trigger.tabIndex=0;trigger.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.cocoOpenRequired();}});}
 const nav=document.querySelector('.tab-bar');
 const update=()=>{nav.querySelector('[aria-current="page"]')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});};
 document.addEventListener('coco:language',update);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
