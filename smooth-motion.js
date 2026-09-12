/* Stable artwork, elapsed-time animation, and a textured sea updated at display refresh. */
(()=>{'use strict';
const tau=Math.PI*2;
function picture(src,cls){const img=new Image();img.src=src;img.alt='';img.className=cls;img.decoding='async';img.draggable=false;return img;}
function ocean(scene){
 scene.classList.add('ocean-scene');
 const canvas=document.createElement('canvas');canvas.className='ocean-water';canvas.setAttribute('aria-hidden','true');
 const wake=picture('ocean-wake.webp','ocean-wake'),dolphin=picture('baby-dolphin.webp','ocean-dolphin'),splash=picture('dolphin-splash.webp','dolphin-splash');
 const craft=document.createElement('div');craft.className='sailing-craft';craft.setAttribute('aria-hidden','true');
 const dolphinWindow=document.createElement('div');dolphinWindow.className='dolphin-window';dolphinWindow.setAttribute('aria-hidden','true');dolphinWindow.append(dolphin);
 scene.prepend(canvas,craft,dolphinWindow,splash);
 const boat=scene.querySelector('.sailing-vessel'),texture=picture('udo-ocean.webp','');
 craft.append(wake,boat);
 const ctx=canvas.getContext('2d',{alpha:false}),surface=document.createElement('canvas'),sea=surface.getContext('2d',{alpha:false});
 let width=0,height=0,time=0,last=0,visible=false,ready=false,raf=0;
 function resize(){
  const box=scene.getBoundingClientRect();if(!box.width)return;
  width=Math.round(box.width);height=Math.round(box.height);
  const ratio=Math.min(devicePixelRatio||1,1.75);
  canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);
  surface.width=width+48;surface.height=height+24;
  // Preserve the horizon and the depth of the original sea photograph.
  const scale=Math.max(surface.width/texture.naturalWidth,surface.height/texture.naturalHeight),sw=surface.width/scale,sh=surface.height/scale;
  if(ready)sea.drawImage(texture,(texture.naturalWidth-sw)/2,0,sw,sh,0,0,surface.width,surface.height);
  draw(time);
 }
 function draw(ms){
  if(!ready||!width)return;
  const t=ms/1000,horizon=height*.32;
  ctx.drawImage(surface,24,0,width,height,0,0,width,height);
  // Narrow strips refract the supplied water texture. They grow more active toward the foreground.
  for(let y=Math.floor(horizon);y<height;y+=2){
   const depth=(y-horizon)/(height-horizon),amp=depth*3.8;
   const dx=Math.sin(y*.12-t*1.65)*amp+Math.sin(y*.035-t*.73)*amp*.7;
   const dy=Math.sin(y*.042-t*1.25)*depth*1.4;
   ctx.drawImage(surface,24+dx,y+dy,width,2,0,y,width,2);
  }
  // Hull and attached stern wake move together, with one gentle roll.
  const boatWidth=Math.min(255,width*.59),boatHeight=boatWidth*2/3;
  const x=((t+12)%32)/32*(width+boatWidth*1.6)-boatWidth*.8;
  const top=height*.72-boatHeight*.68+Math.sin(t*1.8)*.85;
  craft.style.width=boatWidth+'px';craft.style.height=boatHeight+'px';
  craft.style.transform=`translate3d(${x-boatWidth/2}px,${top}px,0) rotate(${Math.sin(t*1.8)*.35}deg)`;
  wake.style.transform=`scaleX(${1+Math.sin(t*2.8)*.035})`;wake.style.opacity=String(.48+Math.sin(t*2.2)*.045);
  // A rounded baby dolphin surfaces in a long, low arc and slips back below the waterline.
  const leap=(t%19-8)/3.6,on=leap>0&&leap<1,dw=Math.min(61,width*.15),dh=dw*1.245;
  dolphin.style.opacity=on?'1':'0';splash.style.opacity='0';
  if(on){const dx=width*(.12+.52*leap),base=height*.91;
   const dy=base+dh*.2-Math.sin(leap*Math.PI)*(height*.23+dh*.75);
   dolphin.style.width=dw+'px';dolphin.style.transform=`translate3d(${dx}px,${dy}px,0) rotate(${-20+leap*70}deg)`;
   const edge=leap<.25?Math.sin(leap/.25*Math.PI):leap>.75?Math.sin((leap-.75)/.25*Math.PI):0;
   splash.style.width=(45+edge*24)+'px';splash.style.left=(dx-6)+'px';splash.style.top=(base-9)+'px';splash.style.opacity=String(edge*.6);
  }
  scene.dataset.motionTime=String(Math.round(ms));
 }
 function active(){return ready&&visible&&!document.hidden&&!scene.hidden&&scene.style.getPropertyValue('--scene-motion')==='running'&&scene.closest('.page')?.classList.contains('active');}
 function tick(now){raf=0;if(!active()){last=0;return;}if(last)time+=Math.min(80,now-last);last=now;draw(time);raf=requestAnimationFrame(tick);}
 function sync(){if(!active()){last=0;if(raf)cancelAnimationFrame(raf);raf=0;return;}if(!raf)raf=requestAnimationFrame(tick);}
 new ResizeObserver(resize).observe(scene);
 new MutationObserver(sync).observe(scene,{attributes:true,attributeFilter:['style','hidden']});
 new MutationObserver(sync).observe(scene.closest('.page'),{attributes:true,attributeFilter:['class']});
 window.cocoObserveMotion(scene,v=>{visible=v;sync();});
 document.addEventListener('visibilitychange',sync);
 texture.decode().then(()=>{ready=true;resize();sync();}).catch(()=>{});
}
window.CocoSmoothMotion=Object.freeze({ocean});
})();
