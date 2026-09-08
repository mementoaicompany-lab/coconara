
(()=>{
const root=document.getElementById('coco-road-map'),data=window.COCO_ROAD_DATA;
if(!root||!data||!window.d3)return;
const map=root.querySelector('.um-map'),svg=d3.select(root.querySelector('.um-geography')),labels=root.querySelector('.um-labels'),dialog=root.querySelector('.um-dialog');
const state={roadOpacity:.65,smallRoads:true,gps:false,foods:true,paused:false,selected:null,duration:46000};
const offsets={mangru:[8,-39],hagosudong:[25,-51],dalkom:[8,28],biyang:[15,-28],haumok:[-26,-35],coconara:[57,30],seobin:[20,-27],geommeolle:[-30,-35],chunjin:[-32,32],hundert:[-2,-42],tolkani:[34,37],'food-som':[55,-38],'food-pado':[-52,16],'food-haha':[-55,-32],'food-udo':[50,-20]};
let routeNode=null,car=null,routeLength=0,ferry=null,ferryPath=null,ferryLength=0,lastTime=null,elapsed=0,visible=true,lastWidth=0,photoTimer=null,currentPhotos=[],photoIndex=0,focusId=null;
const locale=()=>window.cocoLanguage?.()||'ko';
const words=()=>window.COCO_MAP_UI[locale()]||window.COCO_MAP_UI.ko;
const tourIds={seobin:'seobinbaeksa',geommeolle:'geomulrae',chunjin:'cheonjin',tolkani:'dolkani'};
const compactNames={en:['Mangru','Hagosudong','Dalkom Ajae','Biyangdo','Haumokdong','Coconara','Seobinbaeksa','Geommeolle','Cheonjin','Hundert','Dolkkani','Seomsonai','Padosori','Hahahoho','Udo Sikdang'],ja:['望楼灯台','下古水洞ビーチ','ダルコムアジェ','飛揚島','下牛目洞港','ココナラ','西浜白沙','コムモルレビーチ','天津港','フンデルト','トルカニ','ソムソナイ','パドソリ海女村','ハハホホ','牛島食堂'],'zh-HK':['望樓燈塔','下古水洞海灘','Dalkom Ajae','飛揚島','下牛目洞港','Coconara','西濱白沙','黑沙海灘','天津港','Hundert','Dolkkani','Seomsonai','波濤聲海女村','Hahahoho','牛島食堂']};
compactNames.ms=compactNames.en;compactNames['zh-TW']=compactNames['zh-HK'];
const plain=s=>String(s).replace(/\[br\]/g,' ').replace(/\[\/?\d+\]/g,'').replace(/\s+/g,' ').trim();
const textIds=new Map((window.COCO_TRANSLATIONS?.catalog||[]).map(c=>[plain(c.source),c.id]));
function translated(value){if(!value||locale()==='ko')return value||'';const id=textIds.get(plain(value));return id?plain(window.COCO_TRANSLATIONS.languages[locale()]?.[id]||value):(window.cocoTranslate?.(value)||value);}
function placeName(p){return locale()==='ko'?p.name:(compactNames[locale()]?.[data.places.indexOf(p)]||translated(p.name));}
function description(p){return window.COCO_TRANSLATIONS?.tour?.[locale()]?.[tourIds[p.id]||p.id]||translated(p.content.desc);}
let projectionNow=null,gpsGroup=null,geoState={enabled:false,status:'off',fix:null},historyClose=false,bodyOverflow='';
const gps=window.CoconaraGPS.create({provider:navigator.geolocation,secure:window.isSecureContext,onChange:s=>{geoState=s;renderGPS();}});
const retry=document.createElement('button');retry.type='button';retry.className='um-gps-retry';retry.hidden=true;root.querySelector('.um-gps-status').after(retry);retry.addEventListener('click',()=>gps.start());
function renderGPS(){
 gpsGroup?.selectAll('*').remove();
 let code=geoState.status;const f=geoState.fix;
 if(f&&projectionNow&&gpsGroup){
  const [x,y]=projectionNow([f.longitude,f.latitude]),w=map.clientWidth,h=map.clientHeight;
  if(x<8||x>w-8||y<8||y>h-8)code='outside';
  else{
   const color=code==='approximate'?'#b77a22':code==='last'?'#7a8590':'#247ce1';
   const circle=d3.geoCircle().center([f.longitude,f.latitude]).radius(f.accuracy/6371008.8*180/Math.PI)();
   gpsGroup.attr('aria-label',words()[code]?.replace('{m}',Math.max(1,Math.round(f.accuracy)))||words().located);
   gpsGroup.append('path').datum(circle).attr('d',d3.geoPath(projectionNow)).attr('fill',color).attr('fill-opacity',.16).attr('stroke',color).attr('stroke-width',1).attr('stroke-opacity',.6).attr('class','um-gps-accuracy');
   gpsGroup.append('circle').attr('cx',x).attr('cy',y).attr('r',7).attr('fill',color).attr('stroke','#fff').attr('stroke-width',3).attr('class','um-gps-point');
  }
 }
 const text=(words()[code]||words().off).replace('{m}',Math.max(1,Math.round(f?.accuracy||0)));
 const status=root.querySelector('.um-gps-status');if(status.textContent!==text)status.textContent=text;
 status.dataset.state=code;
 const button=root.querySelector('.um-gps');button.textContent=geoState.enabled?words().stop:words().locate;button.setAttribute('aria-pressed',String(geoState.enabled));
 retry.textContent=words().retry;retry.hidden=!['timeout','unavailable','invalid','stale','inaccurate'].includes(code);
}
function gpsActive(){return !document.hidden&&!!root.closest('.page')?.classList.contains('active');}
function refreshUI(){
 root.lang=locale();root.dataset.language=locale();root.setAttribute('aria-label',words().map);
 root.querySelector('.um-north').setAttribute('aria-label',locale()==='ko'?'위쪽이 북쪽':'North');
 const attribution=root.querySelector('.um-foot>span:first-child');
 if(locale()==='ko')attribution.replaceChildren(document.createTextNode('도로·해안선 © '),Object.assign(document.createElement('a'),{href:'https://www.openstreetmap.org/copyright',target:'_blank',rel:'noopener noreferrer',textContent:'OpenStreetMap'}),document.createTextNode(' 기여자'));
 else attribution.replaceChildren(document.createTextNode('© '),Object.assign(document.createElement('a'),{href:'https://www.openstreetmap.org/copyright',target:'_blank',rel:'noopener noreferrer',textContent:'OpenStreetMap contributors'}));
 root.querySelector('h2').textContent=words().title;
 root.querySelector('.um-food-switch').replaceChildren(document.createTextNode(words().foods+' '),Object.assign(document.createElement('span'),{textContent:state.foods?'ON':'OFF'}));
 root.querySelector('.um-tap-hint strong').textContent=words().hint;root.querySelector('.um-tap-hint div>span').textContent=words().hintSub;
 root.querySelector('.um-harbor-kicker').textContent=words().harbor;root.querySelector('.um-harbor-guide strong').textContent=placeName(data.places.find(p=>p.id==='haumok'))+'!';root.querySelector('.um-guide-arrow').textContent=words().guide;
 root.querySelector('.um-gps-privacy').textContent=words().privacy;root.querySelector('.um-motion-control').textContent=state.paused?words().play:words().pause;
 root.querySelector('.um-geography').setAttribute('aria-label',words().map);
 root.querySelector('.um-dialog-close').setAttribute('aria-label',words().close);root.querySelector('.um-photo-prev').setAttribute('aria-label',words().prev);root.querySelector('.um-photo-next').setAttribute('aria-label',words().next);
 renderGPS();
}
window.CocoRoadMap={isOpen:()=>dialog.open,close:fromHistory=>{historyClose=!!fromHistory;dialog.close();}};
document.addEventListener('coco:language',()=>{refreshUI();draw();if(dialog.open&&state.selected)openPlace(state.selected);});
document.addEventListener('coco:page',()=>{gps.setActive(gpsActive());if(map.clientWidth>0)draw();measureVisibility();});
window.addEventListener('popstate',()=>requestAnimationFrame(()=>{gps.setActive(gpsActive());if(map.clientWidth>0)draw();measureVisibility();}));
document.addEventListener('visibilitychange',()=>gps.setActive(gpsActive()));
window.addEventListener('pagehide',()=>gps.setActive(false));window.addEventListener('pageshow',()=>{gps.setActive(gpsActive());measureVisibility();});

function imageUrl(file){return file==='fami-cabin.webp'?data.fami:data.cdn+file;}
function setPhoto(index){if(!currentPhotos.length)return;photoIndex=(index+currentPhotos.length)%currentPhotos.length;const p=data.places.find(x=>x.id===state.selected);const img=root.querySelector('.um-popup-photo img');img.src=imageUrl(currentPhotos[photoIndex]);img.alt=placeName(p)+' · '+(photoIndex+1)+' / '+currentPhotos.length;root.querySelector('.um-photo-count').textContent=(photoIndex+1)+' / '+currentPhotos.length;}
function clearGallery(){if(photoTimer)clearInterval(photoTimer);photoTimer=null;}
function openPlace(id){
 const p=data.places.find(x=>x.id===id);if(!p)return;state.selected=id;focusId=id;const c=p.content;
 labels.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.place===id)));
 root.querySelector('.um-dialog-tag').textContent=translated(p.kind==='food'?c.badge:c.tag);
 root.querySelector('#coco-road-dialog-title').textContent=(p.kind==='food'?'':(c.emoji||'📍')+' ')+translated(c.title||c.name||p.name);
 root.querySelector('.um-owner-label').textContent='👩🏻 '+(translated(c.ownerLabel)===c.ownerLabel&&locale()!=='ko'?words().owner:translated(c.ownerLabel));
 const desc=root.querySelector('.um-owner-words');desc.replaceChildren();String(description(p)).split(/\n\n/).forEach(t=>{const paragraph=document.createElement('p');paragraph.textContent=t;desc.append(paragraph);});
 const tips=root.querySelector('.um-tip-list');tips.replaceChildren();(c.tips||[]).forEach(t=>{const row=document.createElement('div');row.className='um-tip';const icon=document.createElement('span'),text=document.createElement('span');icon.textContent=t.i;text.textContent=translated(t.t);row.append(icon,text);tips.append(row);});
 const tags=root.querySelector('.um-menu-tags');tags.replaceChildren();(c.tags||[]).forEach(t=>{const tag=document.createElement('span');tag.className='um-menu-tag';tag.textContent=translated(t);tags.append(tag);});
 root.querySelector('.um-food-info').textContent=translated(c.info||'');
 const links=root.querySelector('.um-popup-links');links.replaceChildren();const linkData=p.kind==='food'?[[words().naver,c.naverUrl],[words().google,c.googleUrl]]:[[words().source,p.source]];linkData.forEach(([name,href])=>{if(!href)return;const a=document.createElement('a');a.textContent=name;a.href=href;a.target='_blank';a.rel='noopener noreferrer';links.append(a);});
 const credit=root.querySelector('.um-photo-credit');credit.replaceChildren();if(c.credit){const a=document.createElement('a');a.textContent=c.credit.author+' · '+c.credit.license;a.href=c.credit.source;a.target='_blank';a.rel='noopener noreferrer';credit.append(a);}
 currentPhotos=c.photos||[c.photo];currentPhotos=currentPhotos.filter(Boolean);root.querySelector('.um-popup-photo').hidden=!currentPhotos.length;root.querySelector('.um-photo-nav').hidden=currentPhotos.length<2;setPhoto(0);clearGallery();
 if(currentPhotos.length>1)photoTimer=setInterval(()=>{if(dialog.open&&!document.hidden)setPhoto(photoIndex+1);},4200);
 root.querySelector('.um-popup-body').scrollTop=0;if(!dialog.open){bodyOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.showModal();window.pushPopupState?.();}updateAnimationState();root.querySelector('.um-dialog-close').focus();
}
root.querySelector('.um-dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{const r=dialog.getBoundingClientRect();if(e.target===dialog&&(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom))dialog.close();});
dialog.addEventListener('close',()=>{document.body.style.overflow=bodyOverflow;if(!historyClose)window.popPopupState?.();historyClose=false;clearGallery();lastTime=null;state.selected=null;labels.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));updateAnimationState();labels.querySelector(`[data-place="${focusId}"]`)?.focus();});
root.querySelector('.um-photo-prev').addEventListener('click',()=>setPhoto(photoIndex-1));root.querySelector('.um-photo-next').addEventListener('click',()=>setPhoto(photoIndex+1));
root.querySelector('.um-harbor-guide').addEventListener('click',()=>openPlace('haumok'));
function updateAnimationState(){root.style.setProperty('--um-animation-state',state.paused||dialog.open||document.hidden||!visible?'paused':'running');}
function renderFerry(){
 if(!ferry||!ferryPath||!ferryLength)return;
 const phase=((elapsed+5400)%15500)/15500;
 let fraction,returning=false;
 if(phase<.42){const t=phase/.42;fraction=.5-.5*Math.cos(Math.PI*t);}
 else if(phase<.51)fraction=1;
 else if(phase<.93){const t=(phase-.51)/.42;fraction=.5+.5*Math.cos(Math.PI*t);returning=true;}
 else{fraction=0;returning=true;}
 const p=ferryPath.getPointAtLength(fraction*ferryLength),bob=Math.sin(elapsed/620)*1.2;
 ferry.attr('transform',`translate(${p.x},${p.y+bob}) scale(${returning?-1:1},1)`);
 ferry.attr('data-travel',returning?'outbound':'inbound');
}
function drawFerry(projection,w,h){
 const point=data.places.find(p=>p.id==='haumok');const [hx,hy]=projection([point.lon,point.lat]);
 // An illustrative approach through the water beside Haumokdong, not a navigational ferry route.
 const size=w<461?43:58;
 const endX=hx-10,endY=hy+2,startX=Math.max(size/2+7,endX-68),startY=Math.min(h-86,endY+62);
 const middleX=(startX+endX)/2-3,middleY=(startY+endY)/2;
 ferryPath=svg.append('path').attr('class','um-ferry-waterway').attr('d',`M${startX},${startY} Q${middleX},${middleY} ${endX},${endY}`).node();
 ferryLength=ferryPath.getTotalLength();
 ferry=svg.append('g').attr('class','um-ferry').attr('aria-hidden','true');
 ferry.append('path').attr('class','um-ferry-wake').attr('d',`M${-size*.42},3l-7,1 M${-size*.44},6l-9,1`);
 ferry.append('image').attr('href',data.ferry).attr('x',-size/2).attr('y',-size*.43).attr('width',size).attr('height',size*.667);
 renderFerry();
}

function renderCar(){if(!car||!routeNode||!routeLength)return;const d=(elapsed%state.duration)/state.duration*routeLength,p=routeNode.getPointAtLength(d),before=routeNode.getPointAtLength((d-4+routeLength)%routeLength),after=routeNode.getPointAtLength((d+4)%routeLength);const flip=after.x<before.x?-1:1;car.attr('transform',`translate(${p.x},${p.y}) scale(${flip},1)`);}
function draw(){
 const w=map.clientWidth;if(w<1)return;const h=w<461?Math.round(w*1.25+60)+(state.foods?80:25):650;map.style.height=h+'px';svg.attr('viewBox',`0 0 ${w} ${h}`);svg.selectAll('*').remove();labels.replaceChildren();
 const projection=projectionNow=d3.geoMercator().fitExtent([[w<461?35:85,52],[w-(w<461?30:75),h-78]],data.land),path=d3.geoPath(projection);
 svg.append('g').selectAll('path').data(data.land.features).join('path').attr('d',path).attr('fill','none').attr('stroke','#cde4d9').attr('stroke-width',17).attr('stroke-linejoin','round').attr('opacity',.45);
 svg.append('g').selectAll('path').data(data.land.features).join('path').attr('d',path).attr('fill','var(--um-land)').attr('stroke','#a9c4b0').attr('stroke-width',1.25).attr('stroke-linejoin','round');
 svg.append('g').selectAll('path').data(data.beaches.features).join('path').attr('d',path).attr('fill','#efdfba').attr('opacity',.8);
 svg.append('g').attr('opacity',state.smallRoads?state.roadOpacity*.5:0).selectAll('path').data(data.roads.features.filter(d=>!d.properties.coastal&&d.properties.kind!=='tertiary')).join('path').attr('d',path).attr('fill','none').attr('stroke','var(--um-local)').attr('stroke-width',d=>d.properties.kind==='track'?.6:.9).attr('stroke-linecap','round').attr('stroke-linejoin','round');
 svg.append('g').selectAll('path').data(data.roads.features.filter(d=>d.properties.kind==='tertiary'||d.properties.coastal)).join('path').attr('d',path).attr('fill','none').attr('stroke','var(--um-road)').attr('stroke-width',d=>d.properties.coastal?2.15:1.2).attr('opacity',d=>d.properties.coastal?state.roadOpacity:state.roadOpacity*.65).attr('stroke-linecap','round').attr('stroke-linejoin','round');
 routeNode=svg.append('path').datum(data.route).attr('class','um-actual-route').attr('d',path).attr('fill','none').attr('stroke','#6d9d83').attr('stroke-width',2.6).attr('opacity',.22).attr('stroke-linejoin','round').node();routeLength=routeNode.getTotalLength();
 const scale0=projection([126.95,33.5]),scale1=projection([126.95+500/(111320*Math.cos(33.5*Math.PI/180)),33.5]);root.querySelector('.um-scale span').style.width=(scale1[0]-scale0[0])+'px';
 drawFerry(projection,w,h);
 const leaders=svg.append('g'),dots=svg.append('g');const occupied=[];const priority=p=>p.id==='haumok'?4:['coconara','dalkom'].includes(p.id)?3:p.kind==='food'?2:1;
 data.places.filter(p=>state.foods||p.kind!=='food').sort((a,b)=>priority(b)-priority(a)).forEach(p=>{
  const [x,y]=projection([p.lon,p.lat]),store=['coconara','dalkom'].includes(p.id),harbor=p.id==='haumok',food=p.kind==='food';const b=document.createElement('button');b.type='button';b.dataset.place=p.id;b.className='um-pin-label'+(store?' um-store':'')+(p.id==='dalkom'?' um-dalkom':'')+(harbor?' um-harbor':'')+(food?' um-food':'')+(p.id==='hundert'?' um-quiet':'');b.textContent=(p.id==='dalkom'?'🍦 ':p.id==='coconara'?'🌷 ':harbor?'⚓ ':'')+placeName(p);b.setAttribute('aria-pressed',String(p.id===state.selected));b.setAttribute('aria-haspopup','dialog');b.setAttribute('aria-label',placeName(p)+' '+words().details);b.addEventListener('click',()=>openPlace(p.id));labels.append(b);
  const bw=b.offsetWidth,bh=b.offsetHeight,base=offsets[p.id]||[0,-27];let chosen;
  const candidates=[base,[base[0],base[1]-24],[base[0],base[1]+24],[-bw/2-15,0],[bw/2+15,0],[0,-58],[0,58],[0,-85],[0,85],[-80,-90],[80,-90],[-90,90],[90,90]];
  for(let step=110;step<=190;step+=25)candidates.push([-70,-step],[70,-step],[-70,step],[70,step]);
  for(const [dx,dy]of candidates){const xx=Math.max(9,Math.min(w-bw-9,x+dx-bw/2)),yy=Math.max(10,Math.min(h-bh-55,y+dy-bh/2));const r={x:xx,y:yy,w:bw,h:bh};if(!occupied.some(a=>r.x<a.x+a.w+4&&r.x+r.w+4>a.x&&r.y<a.y+a.h+4&&r.y+r.h+4>a.y)){chosen=r;break;}}
  if(!chosen){for(let yy=12;yy<h-bh-55&&!chosen;yy+=8)for(let xx=10;xx<w-bw-10&&!chosen;xx+=8){const r={x:xx,y:yy,w:bw,h:bh};if(!occupied.some(a=>r.x<a.x+a.w+4&&r.x+r.w+4>a.x&&r.y<a.y+a.h+4&&r.y+r.h+4>a.y))chosen=r;}}
  if(!chosen)chosen={x:Math.max(9,Math.min(w-bw-9,x-bw/2)),y:Math.max(10,Math.min(h-bh-55,y+45)),w:bw,h:bh};occupied.push(chosen);b.style.left=chosen.x+'px';b.style.top=chosen.y+'px';
  const tx=Math.max(chosen.x+6,Math.min(chosen.x+chosen.w-6,x)),ty=Math.max(chosen.y+8,Math.min(chosen.y+chosen.h-8,y));
  if(Math.hypot(tx-x,ty-y)>6)leaders.append('path').attr('d',`M${x},${y}L${tx},${ty}`).attr('class','um-leader'+(store?' store':''));
  const color=harbor?'#26785d':store?'#bd5078':food?'#b77f32':'#739989';if(store||harbor)dots.append('circle').attr('cx',x).attr('cy',y).attr('r',10).attr('fill',color).attr('opacity',.15);
  dots.append('circle').attr('data-location',p.id).attr('cx',x).attr('cy',y).attr('r',store||harbor?4.5:food?4:3).attr('fill',color).attr('stroke','#fffdf4').attr('stroke-width',1.5);
 });
 gpsGroup=svg.append('g').attr('class','um-gps-mark').attr('role','img');renderGPS();
 car=svg.append('g').attr('class','um-fami').attr('aria-hidden','true');const size=w<461?47:57;car.append('ellipse').attr('cx',0).attr('cy',1).attr('rx',size*.27).attr('ry',3.2).attr('fill','#416b5630');car.append('image').attr('href',data.fami).attr('x',-size/2).attr('y',-size*.61).attr('width',size).attr('height',size*.667);renderCar();
 root.querySelector('.um-food-switch').setAttribute('aria-pressed',String(state.foods));root.querySelector('.um-food-switch span').textContent=state.foods?'ON':'OFF';
}
function measureVisibility(){const r=root.getBoundingClientRect();visible=!!root.closest('.page')?.classList.contains('active')&&r.bottom>0&&r.top<(window.innerHeight||document.documentElement.clientHeight)&&r.right>0&&r.left<window.innerWidth;updateAnimationState();}
function tick(time){if(!root.isConnected){clearGallery();return;}if(lastTime!==null&&visible&&!document.hidden&&!state.paused&&!dialog.open)elapsed+=Math.min(time-lastTime,100);lastTime=time;renderCar();renderFerry();requestAnimationFrame(tick);}
root.querySelector('.um-gps').addEventListener('click',()=>{if(geoState.enabled)gps.stop();else gps.start();});root.querySelector('.um-food-switch').addEventListener('click',()=>{state.foods=!state.foods;draw();});
root.querySelector('.um-motion-control').addEventListener('click',e=>{state.paused=!state.paused;e.currentTarget.setAttribute('aria-pressed',String(state.paused));e.currentTarget.textContent=state.paused?words().play:words().pause;lastTime=null;updateAnimationState();});
new ResizeObserver(()=>{if(map.clientWidth!==lastWidth){lastWidth=map.clientWidth;draw();}measureVisibility();}).observe(map);
if('IntersectionObserver'in window)new IntersectionObserver(measureVisibility).observe(root);window.addEventListener('scroll',measureVisibility,{passive:true});window.addEventListener('resize',measureVisibility,{passive:true});document.addEventListener('visibilitychange',()=>{lastTime=null;measureVisibility();});window.addEventListener('pagehide',clearGallery,{once:true});refreshUI();draw();gps.setActive(gpsActive());measureVisibility();window.cocoObserveMotion?.(root,()=>measureVisibility());requestAnimationFrame(tick);

})();
