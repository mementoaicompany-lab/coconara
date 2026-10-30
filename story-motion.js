/* One customer's visit: a pink Coco ride, a small coupon at the counter, a bite of ice cream. */
(()=>{'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},mix=(a,b,p)=>a+(b-a)*p;
function create(root){
 root.replaceChildren();root.className='coupon-art customer-story-art pink-coco-story';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');root.append(canvas);
 const ctx=canvas.getContext('2d'),images={},names={coco:'rental-counter.webp',dal:'icecream-counter.webp',customer:'pink-coco-journey.webp',parked:'pink-coco-parked.webp'};
 let loaded=false,current=0;
 const dpr=Math.min(window.devicePixelRatio||1,2);canvas.width=640*dpr;canvas.height=280*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
 // Bounds register the feet and head of complete poses; no independently moving body parts.
 const frames=[
  {s:[75,5,465,505],foot:[310,507]},
  {s:[680,8,286,499],foot:[766,505]},
  {s:[1160,8,198,499],foot:[1250,505]},
  {s:[175,520,220,499],foot:[270,1018]},
  {s:[680,520,190,499],foot:[766,1018]},
  {s:[1160,520,198,499],foot:[1250,1018]}
 ];
 function pose(index,x,y,scale,opacity=1){
  if(opacity<=0)return;const f=frames[index],[sx,sy,w,h]=f.s;
  ctx.save();ctx.globalAlpha=opacity;
  ctx.drawImage(images.customer,sx,sy,w,h,x-(f.foot[0]-sx)*scale,y-(f.foot[1]-sy)*scale,w*scale,h*scale);ctx.restore();
 }
 function shop(key,x){
  ctx.drawImage(images[key],x,23,206,210);
  const ko=(window.cocoLanguage?.()||'ko')==='ko';
  ctx.fillStyle=key==='coco'?'#285e50':'#81481f';ctx.font='800 16px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(key==='coco'?(ko?'코코나라':'COCONARA'):(ko?'달콤아재':'DALKOM AJAE'),x+103,47,160);
 }
 function blend(a,b,amount,x,y){pose(a,x,y,.35,1-amount);pose(b,x,y,.35,amount);}
 function paint(ms){
  current=ms;if(!loaded)return;const t=ms/1000;
  ctx.clearRect(0,0,640,280);ctx.fillStyle='#fff7ec';ctx.fillRect(0,0,640,280);
  // Fixed surroundings and a single ground plane keep the movement easy to follow.
  ctx.fillStyle='#f3e8d8';ctx.beginPath();ctx.ellipse(320,247,311,18,0,0,Math.PI*2);ctx.fill();
  shop('coco',12);shop('dal',422);
  if(t>=7.85){
   ctx.save();ctx.globalAlpha=ease((t-7.85)/.4);
   ctx.drawImage(images.parked,312,136,179,119.33);ctx.restore();
  }
  if(t<8.25){
   const progress=ease((t-1.1)/6.1),x=mix(143,390,progress);
   const fade=1-ease((t-7.85)/.4),travel=progress>0&&progress<1;
   pose(0,x,254+(travel?Math.sin(t*9)*.35:0),.335,fade);
  }
  if(t>=7.85){
   const entrance=ease((t-7.85)/.4),x=446+ease((t-8.3)/1.4)*8,y=254;
   if(t<12.7)pose(1,x,y,.35,entrance);
   else if(t<13.05)blend(1,2,ease((t-12.7)/.35),x,y);
   else if(t<16.5)pose(2,x,y,.35);
   else if(t<16.9)blend(2,3,ease((t-16.5)/.4),x,y);
   else if(t<17.3)pose(3,x,y,.35);
   else if(t<17.65)blend(3,4,ease((t-17.3)/.35),x,y);
   else if(t<18.7)pose(4,x,y,.35);
   else if(t<19.05)blend(4,5,ease((t-18.7)/.35),x,y);
   else pose(5,x,y,.35);
  }
  // A brief quiet dissolve resets the loop, rather than reversing the visit.
  if(t>23.45){ctx.fillStyle=`rgba(255,247,236,${ease((t-23.45)/.55)})`;ctx.fillRect(0,0,640,280);}
  if(t<.45){ctx.fillStyle=`rgba(255,247,236,${1-ease(t/.45)})`;ctx.fillRect(0,0,640,280);}
  root.dataset.motionTime=String(Math.round(ms));root.dataset.scene=t<8?'ride':t<16?'redeem':'taste';
 }
 Promise.all(Object.entries(names).map(async([key,src])=>{const img=new Image();img.src=src;images[key]=img;await img.decode();})).then(()=>{loaded=true;paint(current||500);}).catch(()=>{root.dataset.assetError='true';canvas.hidden=true;});
 return {ready:()=>loaded,paint,refreshLanguage:()=>paint(current)};
}
window.CocoTicketStory=Object.freeze({create});
})();
