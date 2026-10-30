/* v22 map guide: native modal, keyboard dismissal and existing history integration. */
(()=>{'use strict';
 const dialog=document.getElementById('map-guide-dialog'),button=document.querySelector('.um-guide-button');
 if(!dialog||!button)return;
 // The legacy document ends inside a hidden page; top-layer dialogs need a visible ancestor.
 document.body.append(dialog);
 let fromHistory=false,overflow='',opener=null;
 function open(){if(dialog.open)return;opener=document.activeElement;overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();dialog.querySelector('.map-guide-content').scrollTop=0;window.pushPopupState?.();dialog.querySelector('.map-guide-close').focus();}
 window.CocoMapGuide={isOpen:()=>dialog.open,close:history=>{fromHistory=!!history;dialog.close();}};
 window.toggleMapDesc=open;
 button.addEventListener('click',open);
 dialog.querySelector('.map-guide-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
 dialog.addEventListener('close',()=>{document.body.style.overflow=overflow;if(!fromHistory)window.popPopupState?.();fromHistory=false;if(opener?.isConnected)opener.focus({preventScroll:true});});
 const photo=document.querySelector('.um-popup-photo'),expand=photo?.querySelector('.um-photo-expand');
 const photoCopy={ko:['사진 전체 보기','사진 채워 보기'],en:['View full photo','Fill photo'],ms:['Lihat foto penuh','Penuhkan bingkai'],'zh-HK':['查看完整相片','填滿相片'],'zh-TW':['查看完整照片','填滿照片'],ja:['写真全体を見る','写真を大きく表示']};
 function refreshPhoto(){if(expand)expand.textContent=(photoCopy[window.cocoLanguage?.()||'ko']||photoCopy.ko)[photo.classList.contains('show-full-photo')?1:0];}
 expand?.addEventListener('click',()=>{const full=photo.classList.toggle('show-full-photo');expand.setAttribute('aria-pressed',String(full));refreshPhoto();});
 document.querySelector('.um-dialog')?.addEventListener('close',()=>{photo.classList.remove('show-full-photo');expand.setAttribute('aria-pressed','false');refreshPhoto();});
 document.addEventListener('coco:language',refreshPhoto);refreshPhoto();
})();

/* Benefit cards remain ordinary controls; the original coupon/barcode actions are retained. */
(()=>{'use strict';
 function init(){
  document.querySelectorAll('#couponPopupBg .coupon-popup>div[onclick]').forEach((card,i)=>{
   card.classList.add('gift-partner-card',i===0?'gift-partner-dalkom':'gift-partner-park');card.setAttribute('role','button');card.tabIndex=0;
   card.addEventListener('keydown',e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();card.click();}});
  });
  document.querySelectorAll('.coupon-offer-header>div:first-child>div:nth-child(2)>span').forEach(el=>el.classList.add('discount-stamp'));
  document.querySelectorAll('.benefit-ticket,.dalkom-welcome').forEach(card=>{
   const refresh=visible=>card.classList.toggle('benefit-in-view',visible);
   window.cocoObserveMotion?.(card,refresh);
   if(card.matches('.benefit-ticket')&&'ResizeObserver'in window)new ResizeObserver(()=>card.style.setProperty('--ticket-width',card.offsetWidth+'px')).observe(card);
  });
  const observer=new MutationObserver(records=>{for(const record of records)for(const node of record.addedNodes)if(node.id==='_barcodeModal'){
   const box=node.querySelector('#_barcodeBox');box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',box.children[1].textContent);box.querySelector('button').focus({preventScroll:true});
  }});observer.observe(document.body,{childList:true});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

/* v25: legible port direction and only-on-screen emphasis. */
(()=>{'use strict';
 function init(){
  const routes=[],reduced=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.mini-ferry-boat.lr,.mini-ferry-boat.rl').forEach(boat=>{
   const pill=boat.parentElement.parentElement,card=pill.closest('.fade-up');
   if(!card)return;
   const outgoing=boat.classList.contains('rl'),header=card.children[1],timeLine=pill.parentElement,timeLayout=timeLine.parentElement.parentElement;
   card.classList.add('ferry-route-card','departure-card');card.dataset.direction=outgoing?'outgoing':'incoming';
   header.classList.add('departure-card-heading');header.lastElementChild.hidden=true;
   const label=header.firstElementChild;label.dataset.localized='true';
   const time=card.querySelector('[id^="nextFerryTime"]');
   timeLine.classList.add('departure-primary');timeLayout.classList.add('departure-time-layout');
   const eyebrow=document.createElement('div');eyebrow.className='departure-time-eyebrow';eyebrow.dataset.localized='true';
   const headerInfo=document.createElement('div');headerInfo.className='departure-header-info';headerInfo.dataset.localized='true';
   const toggle=document.createElement('button');toggle.type='button';toggle.className='departure-motion-toggle';
   headerInfo.append(eyebrow,toggle);header.append(headerInfo);
   const detail=timeLine.nextElementSibling;detail?.classList.add('departure-detail');
   const countdown=card.querySelector('[id^="remainMin"]')?.parentElement;countdown?.classList.add('departure-countdown');
   pill.className='departure-route';pill.removeAttribute('style');pill.dataset.localized='true';
   pill.innerHTML='<div class="departure-ports"><div><span aria-hidden="true">⚓</span><strong class="port-seongsan"></strong></div><div><span aria-hidden="true">🏝️</span><strong class="port-udo"></strong></div></div><div class="departure-track" aria-hidden="true"><span class="departure-water"></span><span class="departure-traveler"><span class="departure-wake"></span><span class="departure-vessel"><img src="sailing-ferry.webp" alt=""></span></span></div>';
   timeLayout.after(pill);
   card.querySelector('[id^=ferryBar]')?.parentElement.classList.add('departure-old-progress');
   const track=pill.querySelector('.departure-track');
   function measure(){track.style.setProperty('--sail-distance',Math.max(0,track.clientWidth-64)+'px');}
   new ResizeObserver(measure).observe(track);measure();
   let visible=false,paused=reduced.matches;
   function control(){const lang=window.cocoLanguage?.()||'ko',w=window.COCO_CHOICE_COPY[lang]||window.COCO_CHOICE_COPY.ko,m=window.COCO_JOURNEY_COPY[lang]||window.COCO_JOURNEY_COPY.ko;
    toggle.textContent=paused?'▶':'Ⅱ';toggle.setAttribute('aria-pressed',String(paused));
    const name=w[outgoing?'routeLeaving':'routeEntering']+' · '+m[paused?'play':'paused'];toggle.setAttribute('aria-label',name);toggle.title=name;
   }
   function motion(){const available=['normal','shortened'].includes(card.dataset.ferryStatus)&&time.dataset.hasDeparture==='true';
    const active=available&&!paused&&visible&&!document.hidden;
    card.dataset.routeAvailable=String(available);card.dataset.routePaused=String(paused);toggle.hidden=!available;
    card.style.setProperty('--route-motion',active?'running':'paused');control();
   }
   toggle.addEventListener('click',()=>{paused=!paused;motion();});
   reduced.addEventListener('change',()=>{if(reduced.matches)paused=true;motion();});
   window.cocoObserveMotion?.(card,v=>{visible=v;motion();});
   new MutationObserver(motion).observe(card,{attributes:true,attributeFilter:['data-ferry-status']});document.addEventListener('visibilitychange',motion);
   routes.push({pill,label,outgoing,eyebrow,time,motion});
  });
  function refresh(){const w=window.COCO_CHOICE_COPY[window.cocoLanguage?.()||'ko']||window.COCO_CHOICE_COPY.ko;
   routes.forEach(({pill,label,outgoing,eyebrow,time,motion})=>{pill.querySelector('.port-seongsan').textContent=w.portSeongsan;pill.querySelector('.port-udo').textContent=w.portHaumokdong;label.textContent=w[outgoing?'routeLeaving':'routeEntering'];eyebrow.textContent=time.dataset.hasDeparture==='true'?w.nextSailing:w.sailingInfo;motion();});}
  refresh();document.addEventListener('coco:language',refresh);document.addEventListener('coconara:ferry-status',()=>queueMicrotask(refresh));
  routes.forEach(({time})=>new MutationObserver(refresh).observe(time,{attributes:true,attributeFilter:['data-has-departure']}));
  document.querySelectorAll('.coupon-funding,.battery-range').forEach(el=>window.cocoObserveMotion?.(el,v=>el.style.setProperty('--notice-motion',v&&!document.hidden?'running':'paused')));
  document.addEventListener('visibilitychange',()=>{document.querySelectorAll('.coupon-funding,.battery-range').forEach(el=>{const box=el.getBoundingClientRect();el.style.setProperty('--notice-motion',!document.hidden&&box.top<innerHeight&&box.bottom>0?'running':'paused');});});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
