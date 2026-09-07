/* Coastal vehicle scenes and the Coconara owner's original recommendation. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const copy={
 ko:{vehicles:['코코 1인승','파미 2인승','오픈카 2인승'],pause:'움직임 멈추기',play:'움직임 재생',owner:'달콤아재를 추천하는 코코나라 사장님 캐릭터'},
 en:{vehicles:['Coco · 1 seat','Fami · 2 seats','Open-top · 2 seats'],pause:'Pause motion',play:'Play motion',owner:'The Coconara owner character recommending Dalkom Ajae'},
 ms:{vehicles:['Coco · 1 tempat duduk','Fami · 2 tempat duduk','Kereta terbuka · 2 tempat duduk'],pause:'Hentikan gerakan',play:'Mainkan gerakan',owner:'Watak pemilik Coconara yang mengesyorkan Dalkom Ajae'},
 'zh-HK':{vehicles:['Coco 單人座','Fami 雙人座','開篷車 雙人座'],pause:'暫停動畫',play:'播放動畫',owner:'向旅客推薦 Dalkom Ajae 的 Coconara 老闆角色'},
 'zh-TW':{vehicles:['Coco 單人座','Fami 雙人座','敞篷車 雙人座'],pause:'暫停動畫',play:'播放動畫',owner:'向旅客推薦 Dalkom Ajae 的 Coconara 老闆角色'},
 ja:{vehicles:['ココ 1人乗り','ファミ 2人乗り','オープンカー 2人乗り'],pause:'動きを止める',play:'動きを再生',owner:'Dalkom AjaeをおすすめするCoconara店主のキャラクター'}
};
const words=()=>copy[window.cocoLanguage?.()||'ko'];
const refreshers=[];

function setupVehicles(){
 $$('.vehicle-stage').forEach((stage,index)=>{
  const coast=document.createElement('div');coast.className='vehicle-coast';coast.setAttribute('aria-hidden','true');stage.prepend(coast);
  const bubble=document.createElement('div');bubble.className='vehicle-speech';bubble.dataset.localized='true';stage.append(bubble);
  let visible=false;
  function refresh(){bubble.textContent=words().vehicles[index];const paused=stage.classList.contains('motion-paused');stage.style.setProperty('--coastal-motion',paused||!visible||document.hidden||!$('#page-coconara').classList.contains('active')?'paused':'running');}
  new MutationObserver(refresh).observe(stage,{attributes:true,attributeFilter:['class']});
  new MutationObserver(refresh).observe($('#page-coconara'),{attributes:true,attributeFilter:['class']});
  window.cocoObserveMotion(stage,inView=>{visible=inView;refresh();});
  document.addEventListener('visibilitychange',refresh);refreshers.push(refresh);refresh();
 });
}

function setupOwner(){
 const section=$('.owner-reading'),header=$('.owner-reading-header'),avatar=$('#dalkom-kakao-avatar');if(!section||!header||!avatar)return;
 const identity=avatar.nextElementSibling;identity.classList.add('owner-host-speech');
 const art=document.createElement('div');art.className='owner-host-art';art.dataset.localized='true';art.setAttribute('role','img');art.innerHTML='<img class="owner-host-sheet" src="coconara-owner-sheet.webp" alt="" loading="lazy" decoding="async">';header.prepend(art);
 const quote=document.createElement('div');quote.className='owner-host-quote';quote.dataset.localized='true';identity.append(quote);
 const control=document.createElement('button');control.className='owner-host-toggle';control.type='button';control.dataset.localized='true';header.append(control);
 const titles=$$('.owner-reading .reading-title');let paused=false,visible=false;
 function refresh(){
  const chapter=Number(section.dataset.chapter||0),heading=titles[chapter]?.textContent||'';
  if(quote.textContent!==heading)quote.textContent=heading;
  art.setAttribute('aria-label',words().owner);control.textContent=(paused?'▶ ':'⏸ ')+words()[paused?'play':'pause'];control.setAttribute('aria-pressed',String(paused));
  header.classList.toggle('owner-beat-alt',chapter%2===1);header.style.setProperty('--owner-motion',paused||!visible||document.hidden||!$('#page-dalkom').classList.contains('active')?'paused':'running');
 }
 control.onclick=()=>{paused=!paused;refresh();};
 const watch=new MutationObserver(refresh);watch.observe(section,{attributes:true,attributeFilter:['data-chapter','class']});watch.observe($('#page-dalkom'),{attributes:true,attributeFilter:['class']});titles.forEach(title=>watch.observe(title,{childList:true,characterData:true,subtree:true}));
 window.cocoObserveMotion(header,inView=>{visible=inView;refresh();});
 document.addEventListener('visibilitychange',refresh);refreshers.push(refresh);refresh();
}
function init(){setupVehicles();setupOwner();document.addEventListener('coco:language',()=>refreshers.forEach(refresh=>refresh()));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
