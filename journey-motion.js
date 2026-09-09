/* One clock per scene keeps illustration, speech and coupon landing in sync. */
(()=>{'use strict';
const $=s=>document.querySelector(s),clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
const words=()=>window.COCO_JOURNEY_COPY[window.cocoLanguage?.()||'ko']||window.COCO_JOURNEY_COPY.ko;
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const records=new Set();let running=false;
function clock(root,cycle,paint,refresh=()=>{},ready=()=>true){
 const r={root,cycle,paint,refresh,ready,time:0,last:0,visible:false,paused:false};records.add(r);
 const api={seek(t){r.time=t;r.last=0;paint(r.time);refresh();},toggle(){r.paused=!r.paused;r.last=0;refresh();},get paused(){return r.paused;},get playing(){return !r.paused&&r.visible&&!document.hidden&&ready();}};
 window.cocoObserveMotion(root,v=>{r.visible=v;r.last=0;refresh();});
 document.addEventListener('visibilitychange',()=>{r.last=0;refresh();});
 paint(0);
 if(!running){running=true;requestAnimationFrame(tick);}
 function tick(now){for(const item of records){
  if(!item.root.isConnected){records.delete(item);continue;}
  const page=item.root.closest('.page');
  const active=item.visible&&!item.paused&&!document.hidden&&item.ready()&&(!page||page.classList.contains('active'));
  const dt=active&&item.last?Math.min(80,now-item.last):0;item.last=active?now:0;
  if(active){item.time=(item.time+dt)%item.cycle;item.paint(item.time);}
 }if(records.size)requestAnimationFrame(tick);else running=false;}
 return api;
}
function strip(root,src){
 root.replaceChildren();root.classList.add('journey-strip');
 const layers=[0,1].map(()=>{const layer=document.createElement('div');layer.className='journey-pose';const image=document.createElement('img');image.src=src;image.alt='';image.decoding='async';layer.append(image);root.append(layer);return {layer,image,index:-1};});
 let loaded=false;Promise.all(layers.map(x=>x.image.decode().catch(()=>{}))).then(()=>{loaded=layers.every(x=>x.image.naturalWidth>0);});
 function frame(item,index){if(item.index===index)return;item.index=index;item.image.style.transform='translate('+(-(index%3)*100/3)+'%,'+(-Math.floor(index/3)*50)+'%)';}
 return {ready:()=>loaded,paint(time,cycle){
  const duration=cycle/6,index=Math.floor(time/duration)%6,progress=(time%duration)/duration;
  const mix=ease((time%duration-(duration-320))/320);
  frame(layers[0],index);frame(layers[1],(index+1)%6);
  const amplitude=reduced()?0:1;
  layers[0].layer.style.transform='translate('+(Math.sin(time/1700)*1.8*amplitude).toFixed(2)+'px,'+(Math.sin(time/950)*1.1*amplitude).toFixed(2)+'px) scale('+(1+.009*amplitude)+')';
  layers[1].layer.style.transform=layers[0].layer.style.transform;
  layers[1].layer.style.opacity=String(mix);
  root.dataset.frame=String(index);root.dataset.blend=mix.toFixed(3);
 }};
}
function setupCouponStory(text){
 const photo=$('#dal-coupon-photo');if(!photo)return;
 const proof=photo.parentElement,details=proof.parentElement,card=details.parentElement,header=card.firstElementChild;
 card.classList.add('coupon-story-card','coupon-continuous');header.classList.add('coupon-offer-header');details.classList.add('coupon-details');proof.classList.add('coupon-proof');proof.style.animation='none';details.lastElementChild.classList.add('coupon-original-copy');
 const film=document.createElement('div');film.className='coupon-film';film.dataset.localized='true';
 film.innerHTML='<div class="coupon-canvas"><div class="coupon-art" role="img"></div><div class="coupon-caption"><span class="coupon-scene-number"></span><strong></strong></div></div><div class="coupon-journey-steps"></div><div class="coupon-film-footer"><div class="coupon-time-track" aria-hidden="true"><i></i></div><button type="button" class="coupon-play"></button></div>';
 header.after(film);film.after(proof);
 // The offer and the animated handover share one canvas; retain the original offer text.
 const canvas=film.querySelector('.coupon-canvas'),caption=film.querySelector('.coupon-caption');canvas.append(header);canvas.after(caption);
 film.removeAttribute('data-localized');film.querySelectorAll('.coupon-art,.coupon-caption,.coupon-journey-steps,.coupon-film-footer').forEach(el=>el.dataset.localized='true');
proof.setAttribute('role','button');proof.tabIndex=0;
 proof.onclick=()=>window.cocoShowPhotos?.([photo.src],0,text().couponZoom);
 proof.addEventListener('keydown',e=>{if(e.target===proof&&(e.key==='Enter'||e.key===' ')){e.preventDefault();proof.click();}});
 const art=film.querySelector('.coupon-art'),poses=strip(art,'coupon-journey.webp'),steps=film.querySelector('.coupon-journey-steps'),play=film.querySelector('.coupon-play');
 const flyer=document.createElement('img');flyer.className='coupon-flight';flyer.alt='';flyer.setAttribute('aria-hidden','true');flyer.src=photo.src;card.append(flyer);
 const cycle=9600;let phase=-1,api,geometry=null;
 function measure(){const c=card.getBoundingClientRect(),a=art.getBoundingClientRect(),p=photo.getBoundingClientRect();if(p.width&&a.width)geometry={sx:a.left-c.left+a.width*.34,sy:a.top-c.top+a.height*.54,tx:p.left-c.left+p.width/2,ty:p.top-c.top+p.height/2,width:p.width,height:p.height};}
 function refresh(){
  proof.setAttribute('aria-label',text().couponZoom);art.setAttribute('aria-label',text().art);
  [...steps.children].forEach((b,i)=>{b.lastElementChild.textContent=text().steps[i];b.setAttribute('aria-pressed',String(i===phase));});
  film.querySelector('.coupon-scene-number').textContent=['01','02','03'][Math.max(0,phase)];film.querySelector('.coupon-caption strong').textContent=text().captions[Math.max(0,phase)];
  play.textContent=(api?.paused?'▶ ':'⏸ ')+text()[api?.paused?'resume':'pause'];play.setAttribute('aria-pressed',String(Boolean(api?.paused)));
 }
 for(let i=0;i<3;i++){const b=document.createElement('button');b.type='button';b.innerHTML='<b>'+(i+1)+'</b><span></span>';b.onclick=()=>api.seek(i*3200);steps.append(b);}
 function paint(time){poses.paint(time,cycle);const next=Math.floor(time/3200);if(next!==phase){phase=next;refresh();}
  film.querySelector('.coupon-time-track i').style.width=(time/cycle*100)+'%';
  // The real coupon emerges from the coupon held in the second pose.
  const p=(time-2050)/1100,q=ease(p);const flying=p>=0&&p<1&&geometry;
  flyer.style.opacity=flying?String(Math.min(1,p*8,(1-p)*12)):'0';
  if(flying){const g=geometry,x=g.sx+(g.tx-g.sx)*q+Math.sin(q*Math.PI)*22,y=g.sy+(g.ty-g.sy)*q-Math.sin(q*Math.PI)*36;
   flyer.style.width=g.width+'px';flyer.style.height=g.height+'px';flyer.style.transform='translate3d('+x+'px,'+y+'px,0) translate(-50%,-50%) scale('+(.18+.82*q)+') rotate('+(-9*(1-q))+'deg)';}
  const land=(time-3040)/620,burst=land>=0&&land<=1?Math.sin(land*Math.PI)*Math.exp(-land*1.6):0;
  photo.style.transform='scale('+(1+.065*burst)+') rotate('+(1.5*burst)+'deg)';
  proof.style.setProperty('--coupon-spark',String(burst));proof.dataset.landing=String(burst>0);
 }
 api=clock(film,cycle,paint,refresh,poses.ready);play.onclick=()=>api.toggle();
 if('ResizeObserver'in window)new ResizeObserver(measure).observe(card);window.addEventListener('resize',measure,{passive:true});photo.addEventListener('load',()=>{flyer.src=photo.src;measure();});measure();
 document.addEventListener('coco:language',()=>{refresh();requestAnimationFrame(measure);});refresh();
}
function setupCrewScenes(originalWords){
 const warning=$('#ferryLastInfo3')?.closest('.fade-up')?.nextElementSibling;
 [$('#home-ferry-check-body'),warning].filter(Boolean).forEach((target,index)=>{
  const scene=document.createElement('div');scene.className='crew-check-scene crew-continuous';scene.dataset.localized='true';
  scene.innerHTML='<div class="crew-art" role="img"></div><div class="crew-quote"><span class="crew-eyebrow"></span><div class="crew-speech"><div class="crew-speech-panel"><strong></strong><p></p></div><div class="crew-speech-panel"><strong></strong><p></p></div><div class="crew-speech-panel"><strong></strong><p></p></div></div><button type="button"></button></div><small class="crew-service-note"></small>';
  if(index===0)target.prepend(scene);else target.firstElementChild.after(scene);
  const poses=strip(scene.querySelector('.crew-art'),'crew-question-sheet.webp'),speech=scene.querySelector('.crew-speech'),button=scene.querySelector('button');let api,phase=-1;
  function refresh(){const w=words();scene.querySelector('.crew-art').setAttribute('aria-label',originalWords().crewAlt);scene.querySelector('.crew-eyebrow').textContent=w.crewTitle;scene.querySelector('.crew-service-note').textContent=w.crewNote;
   [...speech.children].forEach((panel,i)=>{panel.querySelector('strong').textContent=[w.crewAsk,w.crewAnswer,w.crewDestination][i];panel.querySelector('p').textContent=[w.crewAnswer,w.crewBoard,w.crewDestinationNote][i];panel.style.opacity=i===Math.max(0,phase)?'1':'0';panel.setAttribute('aria-hidden',String(i!==Math.max(0,phase)));});
   button.textContent=(api?.paused?'▶ ':'⏸ ')+(api?.paused?w.play:w.paused);button.setAttribute('aria-pressed',String(Boolean(api?.paused)));if(api?.paused){speech.style.opacity='1';speech.style.transform='none';}}
  api=clock(scene,12000,t=>{poses.paint(t,12000);const next=t<3000?0:t<8000?1:2,start=[0,3000,8000][next],end=[3000,8000,12000][next];if(phase!==next){phase=next;refresh();}
   const fade=Math.min(ease((t-start)/300),ease((end-t)/240));speech.style.opacity=String(.45+.55*fade);speech.style.transform='translateY('+((1-fade)*5)+'px) scale('+(.98+.02*fade)+')';},refresh,poses.ready);
  button.onclick=()=>api.toggle();document.addEventListener('coco:language',refresh);refresh();
 });
}
function initRoute(){const root=$('#ferry-route-journey');if(!root)return;let api;
 const boat=root.querySelector('.route-vessel'),bubble=root.querySelector('.route-time-bubble'),button=root.querySelector('button');
 const active=()=>{const s=window.CoconaraFerry?.getState?.();return ['normal','shortened'].includes(s?.effectiveStatus||s?.status);};
 function refresh(){const w=words();root.setAttribute('aria-label',w.routeLabel);root.querySelector('.route-from').textContent=w.routeFrom;root.querySelector('.route-to').textContent=w.routeTo;bubble.textContent=w.routeTime;button.textContent=(api?.paused?'▶ ':'⏸ ')+(api?.paused?w.play:w.paused);button.setAttribute('aria-pressed',String(Boolean(api?.paused)));root.dataset.operating=String(active());}
 api=clock(root,12000,t=>{const phase=t/12000,progress=(1-Math.cos(phase*2*Math.PI))/2,direction=phase<.5?1:-1;
  boat.style.left=(13+progress*74)+'%';boat.style.transform='translateX(-50%) translateY('+(Math.sin(t/550)*2)+ 'px) scaleX('+direction+')';
  const reveal=Math.min(ease((t%6000)/600),ease((6000-t%6000)/650));bubble.style.opacity=String(.35+.65*reveal);bubble.style.transform='translateX(-50%) translateY('+((1-reveal)*4)+'px) scale('+(.94+.06*reveal)+')';},refresh,active);
 button.onclick=()=>api.toggle();document.addEventListener('coco:language',refresh);document.addEventListener('coconara:ferry-status',refresh);refresh();
}
window.CocoJourney=Object.freeze({setupCouponStory,setupCrewScenes});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initRoute,{once:true});else initRoute();
})();
