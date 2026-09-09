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
const coupleLabels={ko:'커플이 각자 코코 1인승 한 대씩 타고 우도 해안도로를 달리는 모습',en:'A couple each riding their own one-seat Coco along the Udo coast',ms:'Pasangan masing-masing menunggang Coco satu tempat duduk di pesisir Udo','zh-HK':'情侶各自駕駛一輛單人座 Coco，沿牛島海岸行駛','zh-TW':'情侶各自駕駛一輛單人座 Coco，沿牛島海岸行駛',ja:'それぞれ1人乗りココに乗って牛島の海岸を走るカップル'};

function setupVehicles(){
 $$('.vehicle-stage').forEach((stage,index)=>{
  const coast=document.createElement('div');coast.className='vehicle-coast';coast.setAttribute('aria-hidden','true');stage.prepend(coast);
  const sprite=stage.querySelector('.vehicle-sprite'),couple=stage.dataset.vehicle==='scooter';let scene=stage;
  if(couple){
   stage.classList.add('couple-stage');scene=document.createElement('div');scene.className='couple-scene';stage.prepend(scene);scene.append(coast,sprite);
   sprite.src='coco-couple-coast.png?v=19.1';sprite.width=1536;sprite.height=1024;sprite.classList.add('couple-scene-image');
   const wheels=document.createElement('div');wheels.className='couple-wheel-details';wheels.setAttribute('aria-hidden','true');
   [[16.2,75.6,5.2,9.6],[41.8,78.6,8,13.5],[55.6,75.8,5.2,9.6],[81.5,78.8,8,13.5]].forEach(([x,y,w,h])=>{const wheel=document.createElement('i');wheel.className='wheel-detail';wheel.style.cssText='left:'+x+'%;top:'+y+'%;width:'+w+'%;height:'+h+'%';wheel.innerHTML='<b></b>';wheels.append(wheel);});scene.append(wheels);
  }else{
   // Keep each single-vehicle transparent image and its own wheel coordinates intact.
   const rider=document.createElement('div');rider.className='vehicle-rider';sprite.before(rider);rider.append(sprite);
   const wheels=document.createElement('div');wheels.className='vehicle-wheel-details';wheels.setAttribute('aria-hidden','true');wheels.innerHTML='<i class="wheel-detail wheel-rear"><b></b></i><i class="wheel-detail wheel-front"><b></b></i>';rider.append(wheels);
  }
  const ground=document.createElement('div');ground.className='vehicle-road-surface';ground.setAttribute('aria-hidden','true');ground.innerHTML='<div class="road-grain"></div><div class="road-dashes"></div>';scene.append(ground);
  const wind=document.createElement('div');wind.className='vehicle-wind';wind.setAttribute('aria-hidden','true');wind.innerHTML='<i></i><i></i><i></i>';scene.append(wind);
  const bubble=document.createElement('div');bubble.className='vehicle-speech';bubble.dataset.localized='true';scene.append(bubble);
  if(couple){const second=bubble.cloneNode();second.classList.add('vehicle-speech-second');scene.append(second);}
  let visible=false;
  function refresh(){stage.querySelectorAll('.vehicle-speech').forEach(b=>b.textContent=words().vehicles[{scooter:0,fami:1,open:2}[stage.dataset.vehicle]]);if(couple)sprite.alt=coupleLabels[window.cocoLanguage?.()||'ko'];const paused=stage.classList.contains('motion-paused');stage.style.setProperty('--coastal-motion',paused||!visible||document.hidden||!$('#page-coconara').classList.contains('active')?'paused':'running');}
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
  header.dataset.paused=String(paused);header.classList.toggle('owner-beat-alt',chapter%2===1);header.style.setProperty('--owner-motion',paused||!visible||document.hidden||!$('#page-dalkom').classList.contains('active')?'paused':'running');
 }
 control.onclick=()=>{paused=!paused;refresh();};
 const watch=new MutationObserver(refresh);watch.observe(section,{attributes:true,attributeFilter:['data-chapter','class']});watch.observe($('#page-dalkom'),{attributes:true,attributeFilter:['class']});titles.forEach(title=>watch.observe(title,{childList:true,characterData:true,subtree:true}));
 window.cocoObserveMotion(header,inView=>{visible=inView;refresh();});
 document.addEventListener('visibilitychange',refresh);refreshers.push(refresh);refresh();
}
function init(){setupVehicles();setupOwner();document.addEventListener('coco:language',()=>refreshers.forEach(refresh=>refresh()));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
