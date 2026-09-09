/* Only the newly requested copy is localized here; existing terms use the original catalog. */
(()=>{'use strict';
const lang=()=>window.cocoLanguage?.()||'ko';
const words=()=>window.COCO_CHOICE_COPY[lang()]||window.COCO_CHOICE_COPY.ko;
function refresh(){
 document.querySelectorAll('[data-choice-copy]').forEach(el=>{const text=words()[el.dataset.choiceCopy];if(text&&el.textContent!==text)el.textContent=text;});
 document.querySelectorAll('[data-vehicle-book]').forEach(el=>el.setAttribute('aria-label',words()[el.dataset.vehicleBook+'Book']));
 const tab=document.querySelector('.tab-item [data-choice-copy="iceTab"]')?.closest('.tab-item');
 if(tab){
  tab.classList.add('ice-cream-tab');tab.setAttribute('aria-label',words().iceNavAria);
  const icon=tab.querySelector('.ti');
  if(icon&&!icon.querySelector('.ice-nav-icon')){
   const wrapper=document.createElement('span');wrapper.className='ice-nav-icon';wrapper.setAttribute('aria-hidden','true');
   while(icon.firstChild)wrapper.append(icon.firstChild);icon.append(wrapper);
   const sparkle=document.createElement('span');sparkle.className='ice-nav-sparkle';sparkle.setAttribute('aria-hidden','true');sparkle.textContent='✦';icon.append(sparkle);
  }
 }
}
function init(){
 document.querySelectorAll('[data-brand-page]').forEach(button=>button.addEventListener('click',()=>{const page=button.dataset.brandPage;window.showPage(page,[...document.querySelectorAll('.tab-item')].find(tab=>tab.getAttribute('onclick')?.includes("'"+page+"'")));}));
 const story=document.querySelector('.coco-story-body');if(story){const button=story.parentElement.querySelector('button');story.id='coco-brand-story';button.setAttribute('aria-controls',story.id);const sync=()=>button.setAttribute('aria-expanded',String(story.style.display!=='none'));new MutationObserver(sync).observe(story,{attributes:true,attributeFilter:['style']});sync();}
 const visibility=()=>document.querySelector('.ice-cream-tab')?.classList.toggle('ice-nav-hidden',document.hidden);
 refresh();visibility();document.addEventListener('visibilitychange',visibility);document.addEventListener('coco:language',refresh);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
