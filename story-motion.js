/* A ticket leads the journey. Both shops stay fixed; no customer or articulated limbs. */
(()=>{'use strict';
const clamp=n=>Math.max(0,Math.min(1,n)),ease=n=>{n=clamp(n);return n*n*(3-2*n);},mix=(a,b,p)=>a+(b-a)*p;
function create(root){
 root.replaceChildren();root.className='coupon-art customer-story-art ticket-story-art';
 const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');root.append(canvas);
 const ctx=canvas.getContext('2d'),images={},names={coco:'rental-counter',dal:'icecream-counter',ticket:'gold-coupon',cup:'peanut-cup'};
 let loaded=false,current=0,anchor={x:116,y:222};
 function resize(){const dpr=Math.min(devicePixelRatio||1,2);canvas.width=480*dpr;canvas.height=300*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);paint(current);}
 function part(name,x,y,w,h,angle=0,alpha=1){if(alpha<=0)return;ctx.save();ctx.globalAlpha*=alpha;ctx.translate(x,y);ctx.rotate(angle*Math.PI/180);ctx.drawImage(images[name],-w/2,-h/2,w,h);ctx.restore();}
 function shop(name,x){
  ctx.drawImage(images[name],x,99,188,191.5);
  ctx.save();ctx.fillStyle=name==='coco'?'#285e50':'#81481f';ctx.font='900 15px system-ui,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  const ko=(window.cocoLanguage?.()||'ko')==='ko';ctx.fillText(name==='coco'?(ko?'코코나라':'COCONARA'):(ko?'달콤아재':'DALKOM AJAE'),x+94,121,155);ctx.restore();
 }
 function sparkle(x,y,size,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.fillStyle='#d99625';ctx.translate(x,y);ctx.beginPath();ctx.moveTo(0,-size);ctx.quadraticCurveTo(1,-1,size,0);ctx.quadraticCurveTo(1,1,0,size);ctx.quadraticCurveTo(-1,1,-size,0);ctx.quadraticCurveTo(-1,-1,0,-size);ctx.fill();ctx.restore();}
 function ticketPosition(t){
  if(t<2){const p=ease(t/2),spring=t>1.4?Math.sin((t-1.4)*12)*Math.exp(-(t-1.4)*5)*5:0;return {x:mix(116,223,p),y:mix(222,58,p)+spring,w:mix(40,146,p),a:mix(-5,0,p)};}
  if(t<8)return{x:223+Math.sin(t*1.7)*3,y:58+Math.sin(t*2)*3,w:146+Math.sin(t*2.4)*2,a:Math.sin(t*2.2)*3};
  if(t<12){const p=ease((t-8)/4);return{x:mix(223,366,p),y:mix(58,222,p)-Math.sin(p*Math.PI)*38,w:mix(146,58,p),a:Math.sin(p*Math.PI)*12};}
  if(t<14){const p=ease((t-12)/2);return{x:mix(366,240,p),y:mix(222,254,p)-Math.sin(p*Math.PI)*15,w:mix(58,128,p),a:0};}
  return{x:240,y:254+Math.sin(t*2)*2,w:128,a:Math.sin(t*2.2)*2};
 }
 function paint(ms){
  current=ms;if(!loaded)return;const t=ms/1000;
  ctx.clearRect(0,0,480,300);const bg=ctx.createLinearGradient(0,0,0,300);bg.addColorStop(0,'#fff6e9');bg.addColorStop(1,'#ffe9ce');ctx.fillStyle=bg;ctx.fillRect(0,0,480,300);
  // Fixed stores provide a stable route; the golden ticket is the only travelling character.
  shop('coco',12);shop('dal',280);
  const p=ticketPosition(t),out=1-ease((t-23.3)/.7);anchor={x:p.x,y:p.y};
  if(t>=8&&t<12){for(let i=1;i<=7;i++){const past=ticketPosition(Math.max(8,t-i*.1));sparkle(past.x-8,past.y+7,2+i*.15,(1-i/8)*.55);}}
  // Redemption brings the ice cream into the centre, while the discount remains readable.
  const reveal=ease((t-14)/1.15)*out;
  if(reveal>0){const bob=Math.sin(t*2)*2;ctx.save();ctx.globalAlpha=reveal;ctx.fillStyle='#fff7e9e8';ctx.beginPath();ctx.ellipse(240,160,70,87,0,0,Math.PI*2);ctx.fill();ctx.restore();
   part('cup',240,147+(1-reveal)*24+bob,108*reveal,165*reveal,Math.sin(t*1.3)*1.2,reveal);
   for(let i=0;i<4;i++){const a=t*.5+i*Math.PI/2;sparkle(240+Math.cos(a)*70,140+Math.sin(a)*73,3+Math.sin(t*3+i)*1.5,reveal*.7);}}
  ctx.save();ctx.globalAlpha=out;ctx.shadowColor='#95622235';ctx.shadowBlur=9;ctx.shadowOffsetY=5;
  part('ticket',p.x,p.y,p.w,p.w*344/558,p.a);ctx.restore();
  if(t>2&&t<8){const ring=.55+.45*Math.sin(t*4);sparkle(p.x-p.w/2-12,p.y-14,5,ring);sparkle(p.x+p.w/2+12,p.y+9,7,1-ring*.65);}
  root.dataset.motionTime=String(Math.round(ms));root.dataset.scene=t<8?'counter':t<16?'visit':'taste';
 }
 Promise.all(Object.entries(names).map(async([key,src])=>{const img=new Image();img.src=src+'.webp';images[key]=img;await img.decode();})).then(()=>{loaded=true;resize();}).catch(()=>{root.dataset.assetError='true';});
 return {ready:()=>loaded,paint,refreshLanguage:()=>paint(current),couponAnchor:()=>anchor};
}
window.CocoTicketStory=Object.freeze({create});
})();
