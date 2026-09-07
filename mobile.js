/* Mobile navigation, labelled map, harbour motion and Dalkom photo/tasting scenes. */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const order=['home','ferry','coconara','dalkom','hundert','food'];
const words={
 ko:['이전 사진','다음 사진','자동 넘김 멈추기','자동 넘김 재생','움직임 멈추기','움직임 재생','아이스크림을 먹는 달콤아재 캐릭터','닫기','사진 전체 보기'],
 en:['Previous photo','Next photo','Pause slideshow','Play slideshow','Pause motion','Play motion','Dalkom Ajae character enjoying ice cream','Close','View full photo'],
 ms:['Foto sebelumnya','Foto seterusnya','Hentikan tayangan','Mainkan tayangan','Hentikan gerakan','Mainkan gerakan','Watak Dalkom Ajae menikmati aiskrim','Tutup','Lihat foto penuh'],
 'zh-HK':['上一張相片','下一張相片','暫停輪播','播放輪播','暫停動畫','播放動畫','Dalkom Ajae 角色享用雪糕','關閉','查看完整相片'],
 'zh-TW':['上一張照片','下一張照片','暫停輪播','播放輪播','暫停動畫','播放動畫','Dalkom Ajae 角色享用冰淇淋','關閉','查看完整照片'],
 ja:['前の写真','次の写真','スライドを停止','スライドを再生','動きを止める','動きを再生','アイスクリームを楽しむDalkom Ajaeのキャラクター','閉じる','写真全体を見る']
};
const language=()=>window.cocoLanguage?.()||'ko';
const t=s=>window.cocoTranslate?.(s)||s;
const label=n=>words[language()][n];
const ns='http://www.w3.org/2000/svg';
const originalCocoPin=window.DEFAULT_PINS.find(p=>p.id==='coconara');
window.cocoMapPin=p=>p.id==='coconara'&&Number(p.cx)===Number(originalCocoPin.cx)&&Number(p.cy)===Number(originalCocoPin.cy)?{...p,cx:116,cy:183}:p;
const getOriginalPins=window.getPins;
window.getPins=()=>getOriginalPins().map(window.cocoMapPin);
function svg(type,attrs){const el=document.createElementNS(ns,type);Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));return el;}

function setupNavigation(){
 const nav=$('.tab-bar'),buttons=$$('.tab-item');
 nav.setAttribute('role','navigation');nav.setAttribute('aria-label','Main navigation');document.body.append(nav);
 buttons.forEach((button,i)=>{button.dataset.page=order[i];button.setAttribute('aria-controls','page-'+order[i]);button.onclick=()=>window.showPage(order[i],button);});
 const original=window.showPage;
 window.showPage=function(id){original.call(this,id,buttons[order.indexOf(id)]);sync();document.dispatchEvent(new Event('coco:page'));};
 function sync(){buttons.forEach((b,i)=>{if($('#page-'+order[i]).classList.contains('active'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});}
 function measure(){const height=nav.getBoundingClientRect().height;if(height>0)document.documentElement.style.setProperty('--bottom-nav-space',Math.ceil(height)+'px');}
 if('ResizeObserver'in window)new ResizeObserver(measure).observe(nav);
 window.addEventListener('resize',measure,{passive:true});window.addEventListener('popstate',()=>queueMicrotask(sync));sync();measure();
}
function enlargeFerryTimes(){
 ['nextFerryTime','nextFerryTimeIn'].forEach(id=>{const el=document.getElementById(id);el.closest('.fade-up')?.classList.add('home-ferry-large');el.parentElement.classList.add('time-and-route');});
 ['remainMin','remainMinIn'].forEach(id=>document.getElementById(id).parentElement.classList.add('time-countdown'));
}

/* Label positions are in the original geographic SVG coordinate system. */
const placements={
 mangru:{x:184,y:18,width:125,anchor:'start'},
 hagosudong:{x:250,y:63,width:124,anchor:'start'},
 dalkom:{x:229,y:119,width:115,anchor:'end'},
 biyang:{x:310,y:158,width:96,anchor:'middle'},
 haumok:{x:79,y:166,width:99,anchor:'end'},
 coconara:{x:135,y:187,width:135,anchor:'start'},
 seobinbaeksa:{x:83,y:218,width:103,anchor:'end'},
 geomulrae:{x:287,y:233,width:93,anchor:'start'},
 cheonjin:{x:85,y:260,width:101,anchor:'end'},
 hundert:{x:171,y:257,width:113,anchor:'start'},
 dolkani:{x:190,y:306,width:154,anchor:'middle'}
};
function widthOf(text,size){return [...text].reduce((n,c)=>n+(/[\u2e80-\u9fff\uac00-\ud7af\u3040-\u30ff]/u.test(c)?size:(c===' '?size*.3: c.codePointAt(0)>0xffff?size: size*.54)),0);}
function labelMap(){
 const map=$('#udo-map');if(!map)return;
 map.setAttribute('viewBox','-24 -6 408 346');map.setAttribute('role','group');
 if(typeof isAdminLoggedIn!=='undefined'&&isAdminLoggedIn)return;
 const pins=(typeof getPins==='function'?getPins():window.DEFAULT_PINS).map(window.cocoMapPin);
 pins.forEach(p=>{const g=[...map.querySelectorAll('[data-pin-id]')].find(node=>node.getAttribute('data-pin-id')===p.id);if(!g)return;g.querySelectorAll('.map-name-label,.map-label-leader,.map-name-hit,.map-pin-halo').forEach(n=>n.remove());const pos=placements[p.id]||{x:Number(p.cx)+15,y:Number(p.cy),width:90,anchor:'start'},featured=['coconara','dalkom'].includes(p.id);
 const title=(p.id==='dalkom'?'🍦 ':'')+t(p.name),base=featured?12:10.2,size=Math.min(base,base*pos.width/widthOf(title,base)),width=Math.min(pos.width,widthOf(title,size));
 const name=svg('text',{x:pos.x,y:pos.y,class:'map-name-label'+(featured?' store-label':'')+(p.id==='hundert'?' quiet-label':''),'text-anchor':pos.anchor,'aria-hidden':'true'});name.style.fontSize=size+'px';name.textContent=title;
 const left=pos.anchor==='end'?pos.x-width:pos.anchor==='middle'?pos.x-width/2:pos.x;
 const hit=svg('rect',{x:left-4,y:pos.y-size-4,width:width+8,height:size+11,rx:5,class:'map-name-hit','aria-hidden':'true'});g.append(hit);
 if(featured){const halo=svg('circle',{cx:p.cx,cy:p.cy,r:18,class:'map-pin-halo'});g.prepend(halo);}
 if(Math.hypot(pos.x-p.cx,pos.y-p.cy)>27){const line=svg('path',{d:'M '+p.cx+' '+p.cy+' L '+pos.x+' '+(pos.y-4),class:'map-label-leader'});g.prepend(line);}
 g.append(name);
 });
 if(window.cocoMapListRefresh)window.cocoMapListRefresh();
}
function setupHarbour(){
 const map=$('#udo-map'),boat=$('#ferry-boat');if(!map||!boat)return;
 boat.removeAttribute('clip-path');boat.classList.remove('ferry-one');boat.setAttribute('aria-hidden','true');
 const path=svg('path',{id:'harbor-waterway',d:'M -13 185 Q 25 191 67 185'});map.insertBefore(path,boat);
 let elapsed=5600,last=0,visible=false;
 window.cocoObserveMotion(map,inView=>{visible=inView;last=0;});
 function frame(now){const delta=last?Math.min(100,now-last):0;last=now;const paused=$('.map-motion')?.getAttribute('aria-pressed')==='true';if(!paused&&visible&&!document.hidden)elapsed+=delta;
 const phase=(elapsed%14000)/14000;let progress,direction;
 if(phase<.4){progress=(1-Math.cos(Math.PI*phase/.4))/2;direction=1;}else if(phase<.5){progress=1;direction=1;}else if(phase<.9){progress=(1+Math.cos(Math.PI*(phase-.5)/.4))/2;direction=-1;}else{progress=0;direction=-1;}
 const x=-13+80*progress,y=185+6*progress*(1-progress)+Math.sin(elapsed/380)*.6;
 boat.setAttribute('transform','translate('+x.toFixed(2)+','+y.toFixed(2)+') scale('+(direction*.62)+',.62) translate(-29,-158)');requestAnimationFrame(frame);
 }boat.setAttribute('transform','translate(67,185) scale(.62) translate(-29,-158)');requestAnimationFrame(frame);
}

let refreshGallery=()=>{},refreshTasting=()=>{};
function setupDalkomGallery(){
 const section=$('#dalkom-media-section'),original=section&&[...section.querySelectorAll('img')].filter(i=>/dal_\d\.jpg/.test(i.getAttribute('src')||''));
 if(!original?.length)return;const oldGrid=original[0].parentElement,photos=original.map(i=>i.getAttribute('src'));
 const gallery=document.createElement('div');gallery.className='dalkom-gallery';gallery.dataset.localized='true';
 gallery.innerHTML='<div class="dalkom-gallery-stage" tabindex="0"></div><div class="dalkom-gallery-controls"><button type="button" class="gallery-play"></button><div class="dalkom-gallery-nav"><button type="button" class="gallery-step gallery-prev">‹</button><span class="gallery-counter"></span><button type="button" class="gallery-step gallery-next">›</button></div></div><div class="dalkom-gallery-thumbs"></div>';
 const stage=gallery.querySelector('.dalkom-gallery-stage'),thumbs=gallery.querySelector('.dalkom-gallery-thumbs');let current=0,paused=false,visible=false;
 original.forEach((img,i)=>{img.removeAttribute('style');img.className='dalkom-gallery-photo';img.loading='lazy';img.decoding='async';img.onclick=()=>openFull(i);stage.append(img);const button=document.createElement('button');button.type='button';button.className='dalkom-thumb';const thumb=document.createElement('img');thumb.src=photos[i];thumb.alt='';thumb.loading='lazy';button.append(thumb);button.addEventListener('click',()=>show(i,true));thumbs.append(button);});oldGrid.replaceWith(gallery);
 function show(index,manual=false){current=(index+photos.length)%photos.length;if(manual)paused=true;original.forEach((img,i)=>{img.classList.toggle('current',i===current);img.setAttribute('aria-hidden',String(i!==current));});[...thumbs.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(i===current)));gallery.querySelector('.gallery-counter').textContent=(current+1)+' / '+photos.length;refresh();}
 function refresh(){const play=gallery.querySelector('.gallery-play');play.textContent=(paused?'▶ ':'⏸ ')+label(paused?3:2);play.setAttribute('aria-pressed',String(paused));gallery.querySelector('.gallery-prev').setAttribute('aria-label',label(0));gallery.querySelector('.gallery-next').setAttribute('aria-label',label(1));stage.setAttribute('aria-label',t('📸 달콤아재 사진'));original.forEach((img,i)=>{img.alt=t('📸 달콤아재 사진')+' '+(i+1);thumbs.children[i].setAttribute('aria-label',label(8)+' '+(i+1));});}
 gallery.querySelector('.gallery-play').onclick=()=>{paused=!paused;refresh();};gallery.querySelector('.gallery-prev').onclick=()=>show(current-1,true);gallery.querySelector('.gallery-next').onclick=()=>show(current+1,true);
 stage.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();show(current+(e.key==='ArrowLeft'?-1:1),true);}else if(e.key==='Enter')openFull(current);});
 let touchX,touchY;stage.addEventListener('touchstart',e=>{touchX=e.touches[0].clientX;touchY=e.touches[0].clientY;},{passive:true});stage.addEventListener('touchend',e=>{if(touchX==null)return;const dx=e.changedTouches[0].clientX-touchX,dy=e.changedTouches[0].clientY-touchY;touchX=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy)){show(current+(dx<0?1:-1),true);stage.dataset.swiped='true';setTimeout(()=>delete stage.dataset.swiped,400);}},{passive:true});
 function openFull(index){if(stage.dataset.swiped)return;const pausedBeforeFull=paused;paused=true;refresh();const overlay=document.createElement('div');overlay.className='dalkom-fullscreen';overlay.dataset.localized='true';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',t('📸 달콤아재 사진'));
 overlay.innerHTML='<button type="button" class="dalkom-full-close">×</button><img><div class="dalkom-full-controls"><button type="button" class="full-prev">‹</button><span></span><button type="button" class="full-next">›</button></div>';
 let selected=index;const previousFocus=document.activeElement,previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';let closing=false;function render(){overlay.querySelector('img').src=photos[selected];overlay.querySelector('img').alt=t('📸 달콤아재 사진')+' '+(selected+1);overlay.querySelector('.dalkom-full-controls span').textContent=(selected+1)+' / '+photos.length;}function change(delta){selected=(selected+delta+photos.length)%photos.length;render();}function finish(){overlay.remove();document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',keys);window.cocoCloseDalkom=null;paused=pausedBeforeFull;refresh();window.cocoRefreshMotionVisibility();previousFocus?.focus();}function close(){if(closing)return;closing=true;if(window.pushPopupState)history.back();else finish();}
 const closeButton=overlay.querySelector('.dalkom-full-close');closeButton.setAttribute('aria-label',label(7));closeButton.onclick=close;overlay.querySelector('.full-prev').setAttribute('aria-label',label(0));overlay.querySelector('.full-next').setAttribute('aria-label',label(1));overlay.querySelector('.full-prev').onclick=()=>change(-1);overlay.querySelector('.full-next').onclick=()=>change(1);overlay.addEventListener('click',e=>{if(e.target===overlay)close();});
 function keys(e){if(e.key==='Escape')close();else if(e.key==='ArrowLeft')change(-1);else if(e.key==='ArrowRight')change(1);else if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('button')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}}
 let startX,startY;overlay.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;startY=e.touches[0].clientY;},{passive:true});overlay.addEventListener('touchend',e=>{if(startX==null)return;const dx=e.changedTouches[0].clientX-startX,dy=e.changedTouches[0].clientY-startY;startX=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))change(dx<0?1:-1);},{passive:true});document.addEventListener('keydown',keys);document.body.append(overlay);window.cocoCloseDalkom=finish;window.pushPopupState?.();render();closeButton.focus();
 }
 window.cocoObserveMotion(gallery,inView=>{visible=inView;});
 setInterval(()=>{if(!paused&&visible&&!document.hidden&&$('#page-dalkom').classList.contains('active'))show(current+1);},5200);
 refreshGallery=refresh;show(0);
}
function init(){setupNavigation();enlargeFerryTimes();labelMap();setupHarbour();setupDalkomGallery();document.addEventListener('coco:map',labelMap);document.addEventListener('coco:language',()=>{labelMap();refreshGallery();refreshTasting();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
