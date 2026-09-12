/* A single articulated customer moves through both shops on one continuous timeline. */
(()=>{'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},mix=(a,b,p)=>a+(b-a)*p;
function create(root){
 root.replaceChildren();root.className='coupon-art customer-story-art';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');root.append(canvas);
 const ctx=canvas.getContext('2d'),images={},names={head:'traveler-head',joy:'traveler-joy',torso:'traveler-torso',arm:'traveler-arm',spoon:'traveler-spoon-arm',left:'traveler-leg-left',right:'traveler-leg-right',cup:'traveler-cup',ticket:'traveler-ticket',gripAtlas:'traveler-grip',coco:'rental-counter',dal:'icecream-counter'};
 let loaded=false,current=0,anchor={x:245,y:168};
 function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=480*dpr;canvas.height=300*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);paint(current);}
 function part(name,x,y,w,h,angle=0,px=.5,py=0,mirror=1,alpha=1){if(alpha<=0)return;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(angle*Math.PI/180);ctx.scale(mirror,1);ctx.drawImage(images[name],-px*w,-py*h,w,h);ctx.restore();}
 // Color-key the neutral sprite backdrop once at load time, then reuse the composited layer.
 function gripLayers(image){
  const layer=document.createElement('canvas');layer.width=image.naturalWidth;layer.height=image.naturalHeight;
  const c=layer.getContext('2d',{willReadFrequently:true});c.drawImage(image,0,0);const pixels=c.getImageData(0,0,layer.width,layer.height),a=pixels.data;
  for(let i=0;i<a.length;i+=4){const lo=Math.min(a[i],a[i+1],a[i+2]),chroma=Math.max(a[i],a[i+1],a[i+2])-lo;
   if(lo>130)a[i+3]=Math.round(a[i+3]*ease((chroma-7)/23));}
  c.putImageData(pixels,0,0);
  for(const [name,offset] of [['grip',0],['emptyGrip',768]]){const sprite=document.createElement('canvas');sprite.width=713;sprite.height=627;sprite.getContext('2d').drawImage(layer,45+offset,180,713,627,0,0,713,627);images[name]=sprite;}
 }
 function shop(name,x){
  ctx.drawImage(images[name],x,28,245,250);
  ctx.save();ctx.fillStyle=name==='coco'?'#285e50':'#81481f';ctx.font='900 19px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  const ko=(window.cocoLanguage?.()||'ko')==='ko';ctx.fillText(name==='coco'?(ko?'코코나라':'COCONARA'):(ko?'달콤아재':'DALKOM AJAE'),x+122,55,195);ctx.restore();
 }
 function paint(ms){
  current=ms;if(!loaded)return;
  const t=ms/1000,travel=ease((t-8)/4),camera=590*travel;
  const approach=ease(t/2),worldX=t<8?mix(415,288,approach):mix(288,878,travel),x=worldX-camera;
  const walking=t<2?Math.sin(Math.PI*clamp(t/2)):t>=8&&t<12?Math.sin(Math.PI*clamp((t-8)/4)):0;
  const gait=Math.sin(t*9),bob=walking*Math.abs(Math.sin(t*9))*1.6;
  const y=143-bob,reach=ease((t-2)/.8)*(1-ease((t-6.5)/.6));
  const handover=ease((t-12)/.6)*(1-ease((t-13.8)/.6));
  const eating=ease((t-14.1)/.8),bite=eating*(.5-.5*Math.cos(Math.max(0,t-16)*Math.PI));
  ctx.clearRect(0,0,480,300);
  const bg=ctx.createLinearGradient(0,0,0,300);bg.addColorStop(0,'#fff6e9');bg.addColorStop(1,'#ffe9ce');ctx.fillStyle=bg;ctx.fillRect(0,0,480,300);
  // The camera travels with the customer; the shops and character never change scale.
  ctx.save();ctx.globalAlpha=ease((24-t)/.35);
  shop('coco',18-camera);shop('dal',608-camera);
  ctx.save();ctx.fillStyle='#8d572b15';ctx.beginPath();ctx.ellipse(x,275,39,5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  const armBlend=ease((t-2)/.7)*(1-ease((t-13.5)/.7));
  const gripBlend=ease((t-3.45)/.3)*(1-ease((t-12.65)/.2));
  const gripAngle=-5+walking*gait*2+handover*4;
  const leftAngle=mix(walking*gait*9,17,reach);
  const cupIn=ease((t-13.5)/.8);
  // Shoulder overlaps sit behind the cardigan; elbows stay bent when holding the ticket.
  part('left',x-13,y+61,28,73,walking*gait*15,.5,.06);
  part('right',x+13,y+61,28,73,-walking*gait*15,.5,.06);
  part('arm',x+24,y+8,28,72,-walking*gait*9,.73,.1,-1,1-eating);
  part('arm',x-24,y+8,28,72,leftAngle,.73,.1,1,(1-armBlend)*(1-eating));
  part('emptyGrip',x-24,y+8,74.865,65.835,gripAngle,643/713,91/627,1,armBlend*(1-gripBlend));
  part('grip',x-24,y+8,74.865,65.835,gripAngle,643/713,91/627,1,armBlend*gripBlend);
  if(t>=13.5)part('cup',mix(806-camera,x+65,cupIn),mix(175,y+12,cupIn),31,40,0,.5,.5);
  part('emptyGrip',x+24,y+8,54.901,48.279,0,643/713,91/627,-1,eating);
  part('torso',x,y-3,65,78,0,.5,0);
  const radians=gripAngle*Math.PI/180,localX=(200-688)*.105,localY=(330-271)*.105;
  const ticketX=x-24+localX*Math.cos(radians)-localY*Math.sin(radians),ticketY=y+8+localX*Math.sin(radians)+localY*Math.cos(radians);
  anchor={x:ticketX,y:ticketY};
  // Only the handover is a free ticket. Once held, the ticket and gripping fingers are one sprite.
  if(t>=3&&t<3.75){const p=ease((t-3)/.65),tx=mix(210-camera,ticketX,p),ty=mix(162,ticketY,p)-Math.sin(p*Math.PI)*12;
   part('ticket',tx,ty,30,22,gripAngle,.5,.5,1,1-gripBlend);}
  if(t>=12.65&&t<13.35){const p=ease((t-12.65)/.7),tx=mix(ticketX,800-camera,p),ty=mix(ticketY,160,p)-Math.sin(p*Math.PI)*10;
   part('ticket',tx,ty,30,22,gripAngle*(1-p),.5,.5,1,(1-gripBlend)*(1-p));}
  part('head',x,y-74,91,93,walking*gait*.6,.5,0,1,1-bite*.85);
  part('joy',x,y-74,91,93,walking*gait*.6,.5,0,1,bite*.85);
  if(eating>0){
   part('spoon',x-24,y+4,42,42,mix(12,-18,bite),.12,.28,1,eating);
   // The cardigan covers the shoulder attachment while the forearm stays in front.
   ctx.save();ctx.beginPath();ctx.ellipse(x-23,y+13,11,15,0,0,Math.PI*2);ctx.clip();
   ctx.drawImage(images.arm,35,110,100,120,x-34,y-2,22,30);ctx.restore();
  }
  ctx.restore();root.dataset.motionTime=String(Math.round(ms));root.dataset.scene=t<8?'counter':t<16?'visit':'taste';
 }
 Promise.all(Object.entries(names).map(async([key,src])=>{const img=new Image();img.src=src+'.webp';images[key]=img;await img.decode();})).then(()=>{gripLayers(images.gripAtlas);loaded=true;resize();}).catch(()=>{root.dataset.assetError='true';});
 return {ready:()=>loaded,paint,refreshLanguage:()=>paint(current),couponAnchor:()=>anchor};
}
window.CocoCustomerStory=Object.freeze({create});
})();
