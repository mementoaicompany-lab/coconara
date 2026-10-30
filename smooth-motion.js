/* Small illustrated sea; CSS motion shares the status card's pause control. */
(()=>{'use strict';
function ocean(scene){
 scene.classList.add('emoji-scene');
 const craft=document.createElement('div');craft.className='sailing-craft';craft.setAttribute('aria-hidden','true');
 const wake=document.createElement('span');wake.className='emoji-wake';
 const water=document.createElement('span');water.className='emoji-water';water.setAttribute('aria-hidden','true');
 const boat=scene.querySelector('.sailing-vessel');craft.append(wake,boat);scene.prepend(water,craft);
 const resize=()=>scene.style.setProperty('--emoji-voyage',Math.max(0,scene.clientWidth-72)+'px');
 new ResizeObserver(resize).observe(scene);resize();
}
window.CocoSmoothMotion=Object.freeze({ocean});
})();
