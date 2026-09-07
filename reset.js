/* Original content is preserved in index.html. This layer changes presentation only,
   except the explicitly requested owner narration for tourist locations. */
(()=>{'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
// Scene autoplay follows the site's explicit setting. Visibility only suspends
// playback temporarily; it never changes a user's separate pause selection.
const motionTargets=new Set(),motionPages=new Set();let motionRefreshQueued=false;
function motionVisible(element){
 if(!element?.isConnected||document.hidden||element.closest('[hidden]'))return false;
 const page=element.closest('.page');if(page&&!page.classList.contains('active'))return false;
 const style=getComputedStyle(element);if(style.display==='none'||style.visibility==='hidden')return false;
 const rect=element.getBoundingClientRect(),viewport=window.visualViewport;
 const left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0;
 const right=left+(viewport?.width||window.innerWidth||document.documentElement.clientWidth),bottom=top+(viewport?.height||window.innerHeight||document.documentElement.clientHeight);
 return rect.width>0&&rect.height>0&&rect.right>left&&rect.left<right&&rect.bottom>top&&rect.top<bottom;
}
function refreshMotionVisibility(){
 motionTargets.forEach(record=>{const visible=motionVisible(record.element);if(visible!==record.visible){record.visible=visible;record.callback(visible);}});
}
function queueMotionVisibility(){if(motionRefreshQueued)return;motionRefreshQueued=true;requestAnimationFrame(()=>{motionRefreshQueued=false;refreshMotionVisibility();});}
const motionIntersection='IntersectionObserver'in window?new IntersectionObserver(queueMotionVisibility,{threshold:0}):null;
const motionPageObserver=new MutationObserver(queueMotionVisibility);
window.cocoRefreshMotionVisibility=refreshMotionVisibility;
window.cocoObserveMotion=(element,callback)=>{
 if(!element){callback(false);return()=>{};}
 const record={element,callback,visible:undefined};motionTargets.add(record);
 const page=element.closest('.page');if(page&&!motionPages.has(page)){motionPages.add(page);motionPageObserver.observe(page,{attributes:true,attributeFilter:['class','hidden','style']});}
 motionIntersection?.observe(element);
 record.visible=motionVisible(element);callback(record.visible);queueMotionVisibility();
 return()=>{motionTargets.delete(record);if(![...motionTargets].some(other=>other.element===element))motionIntersection?.unobserve(element);};
};
document.addEventListener('scroll',queueMotionVisibility,{capture:true,passive:true});
document.addEventListener('visibilitychange',refreshMotionVisibility);
document.addEventListener('coco:page',refreshMotionVisibility);
window.addEventListener('resize',queueMotionVisibility,{passive:true});
window.addEventListener('orientationchange',queueMotionVisibility,{passive:true});
window.addEventListener('pageshow',refreshMotionVisibility);
window.visualViewport?.addEventListener('resize',queueMotionVisibility,{passive:true});
window.visualViewport?.addEventListener('scroll',queueMotionVisibility,{passive:true});
const locales=['ko','en','zh-HK','ms','zh-TW','ja'];
const clean=s=>s.replace(/\s+/g,' ').trim(), escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ui={ko:['움직임 멈추기','움직임 재생','코코나라 사장님의 관광 안내','사진 전체 보기','사진 출처','시계방향 추천','이동 약 1시간','관광 약 2시간'],en:['Pause motion','Play motion','Your Coconara owner’s guide','View full photo','Photo credits','Clockwise recommended','About 1 hour riding','About 2 hours sightseeing'],ms:['Hentikan gerakan','Mainkan gerakan','Panduan daripada pemilik Coconara','Lihat foto penuh','Kredit foto','Arah jam disyorkan','Perjalanan kira-kira 1 jam','Bersiar-siar kira-kira 2 jam'],'zh-HK':['暫停動畫','播放動畫','Coconara 老闆帶你遊牛島','查看完整相片','相片來源','建議順時針遊覽','車程約1小時','觀光約2小時'],'zh-TW':['暫停動畫','播放動畫','Coconara 老闆帶你遊牛島','查看完整照片','照片來源','建議順時針遊覽','車程約1小時','觀光約2小時'],ja:['動きを止める','動きを再生','Coconara店主の観光案内','写真全体を見る','写真出典','時計回りがおすすめ','移動 約1時間','観光 約2時間']};
ui.ko[5]='⟳ 시계방향 추천';ui.ko[6]='🛵 이동 약 1시간';ui.ko[7]='📷 관광 약 2시간';
const data=window.COCO_TRANSLATIONS||{catalog:[],languages:{},tour:{ko:{}},photos:{}};
const lookup=new Map(data.catalog.map(x=>[x.source,x.id]));
let lang=new URLSearchParams(location.search).get('lang')||localStorage.getItem('coco_language')||'ko';if(!locales.includes(lang))lang='ko';
const saved=new WeakMap(); const inline=new Set(['STRONG','B','EM','I','U','SMALL','BR','SPAN']);
const excluded='script,style,noscript,textarea,input,select,option,svg,.language-bar,[data-localized],#adminPanel,#adminPanelBg,#adminLoginBg,.admin-fab,#adminBadge,#harborPanel,#harborPanelBg';
function serialize(el){let n=0,tags={};function rec(node){if(node.nodeType===3)return node.textContent;if(node.nodeType!==1)return '';let id=++n;if(node.tagName==='BR')return '[br]';tags[id]=[node.outerHTML.slice(0,node.outerHTML.indexOf('>')+1),'</'+node.tagName.toLowerCase()+'>'];return '['+id+']'+[...node.childNodes].map(rec).join('')+'[/'+id+']';}return {source:clean([...el.childNodes].map(rec).join('')),tags,original:el.innerHTML,rendered:el.innerHTML};}
function eligible(el){return [...el.querySelectorAll('*')].every(x=>inline.has(x.tagName)&&!x.id&&!x.hasAttribute('onclick')&&!x.hasAttribute('role'));}
function translateUnit(el){let prev=saved.get(el), current=el.nodeType===3?el.textContent:el.innerHTML;
 if(!prev||current!==prev.rendered){prev=el.nodeType===3?{source:clean(current),original:current,rendered:current,tags:{}}:serialize(el);saved.set(el,prev);}
 let result=prev.original,id=lookup.get(prev.source),t=dynamicTranslation(prev.source)||data.languages[lang]?.[id];
 if(el.nodeType===1&&!id&&!t&&!prev.managed){saved.delete(el);return false;}prev.managed=true;
 if(lang!=='ko'&&t){if(el.nodeType===3){result=prev.original.replace(prev.source,t);}else{result=escape(t).replace(/\[br\]/g,'<br>').replace(/\[(\/?)(\d+)\]/g,(_,close,n)=>prev.tags[n]?.[close?1:0]||'');}}
 if(current!==result){if(el.nodeType===3)el.textContent=result;else el.innerHTML=result;}prev.rendered=el.nodeType===3?el.textContent:el.innerHTML;
 if(el.nodeType===1){const size=parseFloat(el.style.fontSize||'0');if(size&&size<14&&prev.source.length>24)el.classList.add('readable-copy');else if(size&&size<12&&/[가-힣a-z]/i.test(prev.source))el.classList.add('readable-small');}
 return true;
}
function walk(el){if(el.nodeType===3){if(clean(el.textContent))translateUnit(el);return;}if(el.nodeType!==1||el.matches(excluded))return;if(eligible(el)&&translateUnit(el))return;[...el.childNodes].forEach(walk);}
let queued=false;const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;localize();});}});
function localize(){observer.disconnect();walk(document.body);document.documentElement.lang=lang;document.title=lang==='ko'?'우도 코코나라':'Coconara · Udo';$$('.language-bar button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lang===lang)));updateMotionLabels();observer.observe(document.body,{subtree:true,childList:true,characterData:true});}
window.cocoLocalize=localize;window.cocoLanguage=()=>lang;
window.cocoTranslate=tr;
function tr(source){const id=lookup.get(clean(source));return lang==='ko'?source:(data.languages[lang]?.[id]||source);}
function dynamicTranslation(source){if(lang==='ko')return null;let m=source.match(/^(\d{1,2})월 (\d{1,2})일 \([일월화수목금토]\)$/);if(m)return new Intl.DateTimeFormat(lang,{month:'long',day:'numeric',weekday:'short',timeZone:'Asia/Seoul'}).format(new Date(Date.UTC(new Date().getFullYear(),+m[1]-1,+m[2],3)));
 m=source.match(/^(Q\d+\. )(.+)$/);if(m){const text=tr(m[2]);if(text!==m[2])return m[1]+text;}
 if(/오늘 마지막 배: \d\d:\d\d/.test(source)||/^\d\d:\d\d\[1\] 출항\[\/1\]$/.test(source)){const key=data.catalog.find(x=>x.source.replace(/\d\d:\d\d/g,'{TIME}')===source.replace(/\d\d:\d\d/g,'{TIME}'));if(key){const t=data.languages[lang]?.[key.id];if(t)return t.replace(/\d\d:\d\d/g,source.match(/\d\d:\d\d/)[0]);}}
 const weather={en:['Clear','Mostly clear','Partly cloudy','Overcast','Fog','Drizzle','Rain','Heavy rain','Snow','Heavy snow','Showers','Heavy showers','Thunderstorm'],ms:['Cerah','Kebanyakannya cerah','Berawan sebahagian','Mendung','Berkabus','Gerimis','Hujan','Hujan lebat','Salji','Salji lebat','Hujan sekejap','Hujan sekejap lebat','Ribut petir'],'zh-HK':['天晴','大致天晴','多雲','陰天','有霧','毛毛雨','雨','大雨','雪','大雪','驟雨','強驟雨','雷暴'],'zh-TW':['晴朗','大致晴朗','多雲','陰天','有霧','毛毛雨','雨','大雨','雪','大雪','陣雨','強陣雨','雷雨'],ja:['晴れ','おおむね晴れ','雲が多い','曇り','霧','霧雨','雨','強い雨','雪','大雪','にわか雨','強いにわか雨','雷雨']};
 m=source.match(/^(-?\d+°C)\s+(맑음|대체로맑음|구름많음|흐림|안개|이슬비|비|강한비|눈|강한눈|소나기|강한소나기|뇌우)$/);if(m)return m[1]+' '+weather[lang][['맑음','대체로맑음','구름많음','흐림','안개','이슬비','비','강한비','눈','강한눈','소나기','강한소나기','뇌우'].indexOf(m[2])];
 m=source.match(/^(오전|오후)(\d+)시$/);if(m){const h=+m[2]+(m[1]==='오후'?12:0);return new Intl.DateTimeFormat(lang,{hour:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(2026,0,1,h)));}if(source==='정오')return {en:'Noon',ms:'Tengah hari','zh-HK':'中午','zh-TW':'中午',ja:'正午'}[lang];return null;
}
function setLanguage(next){if(!locales.includes(next))return;lang=next;localStorage.setItem('coco_language',lang);const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(history.state,'',url);localize();drawPins();refreshSpotText();updateTimeLabels();$$('.map-note span').forEach((e,i)=>e.textContent=ui[lang][i+5]);$('.spot-close-button')?.setAttribute('aria-label',tr('닫기'));document.dispatchEvent(new Event('coco:language'));}
$$('.language-bar button').forEach(b=>b.addEventListener('click',()=>setLanguage(b.dataset.lang)));
let mapPaused=false;
$$('.motion-toggle').forEach(button=>{button.dataset.localized='true';const stage=button.closest('.vehicle-stage');stage.classList.remove('motion-paused');button.addEventListener('click',()=>{stage.classList.toggle('motion-paused');updateMotionLabels();});});
function updateMotionLabels(){$$('.motion-toggle').forEach(b=>{const paused=b.closest('.vehicle-stage').classList.contains('motion-paused');b.innerHTML=(paused?'▶':'⏸')+' <span>'+ui[lang][paused?1:0]+'</span>';b.setAttribute('aria-pressed',String(paused));});const b=$('.map-motion');if(b){b.textContent=mapPaused?'▶':'⏸';b.setAttribute('aria-label',ui[lang][mapPaused?1:0]);b.setAttribute('title',ui[lang][mapPaused?1:0]);b.setAttribute('aria-pressed',String(mapPaused));}$$('.owner-narration-label').forEach(x=>x.textContent=ui[lang][2]);}
const ns='http://www.w3.org/2000/svg';function svgEl(type,attrs){const e=document.createElementNS(ns,type);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));return e;}
let oldPins,route,car,lastFrame=0,distance=0,mapInView=true,facing=1;
function drawPins(){if(!$('#udo-map')||!window.DEFAULT_PINS)return;if(typeof isAdminLoggedIn!=='undefined'&&isAdminLoggedIn&&oldPins){oldPins();return;}let grp=$('#map-dynamic-pins');if(!grp){grp=svgEl('g',{id:'map-dynamic-pins'});$('#udo-map').append(grp);}grp.replaceChildren();let list=$('.map-pin-list');if(!list){list=document.createElement('div');list.className='map-pin-list';list.dataset.localized='true';$('.map-svg-wrap').after(list);}list.replaceChildren();
 (typeof getPins==='function'?getPins():window.DEFAULT_PINS).map(p=>window.cocoMapPin?window.cocoMapPin(p):p).forEach((p,i)=>{const g=svgEl('g',{'data-pin-id':p.id,class:'dynamic-pin'+(p.id==='coconara'||p.id==='dalkom'?' featured-pin':''),role:'button',tabindex:'0','aria-label':tr(p.name)});const primary=['coconara','dalkom'].includes(p.id);g.append(svgEl('circle',{cx:p.cx,cy:p.cy,r:primary?12:10,fill:primary?'#d95680':'#fff',stroke:primary?'#fff':'#567c66','stroke-width':primary?2.5:1.2}));const label=svgEl('text',{x:p.cx,y:p.cy+3.2,'text-anchor':'middle','font-size':9,'font-weight':800,fill:primary?'#fff':'#365745'});label.textContent=i+1;g.append(label);const title=svgEl('title',{});title.textContent=tr(p.name);g.append(title);g.addEventListener('click',()=>window.openSpot(p.id));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();window.openSpot(p.id);}});grp.append(g);const button=document.createElement('button');button.type='button';button.className='map-place';button.dataset.spot=p.id;button.innerHTML='<span class="place-num">'+(i+1)+'</span><span>'+escape(tr(p.name))+'</span>';button.addEventListener('click',()=>window.openSpot(p.id));list.append(button);});
 document.dispatchEvent(new Event('coco:map'));
}
function setupMap(){const svg=$('#udo-map');if(!svg)return;svg.setAttribute('role','img');svg.setAttribute('aria-label','Udo coastal route');const sea=svg.querySelector(':scope > rect');if(sea)sea.setAttribute('fill','#e8f3ef');const paths=[...svg.querySelectorAll(':scope > path')];const land=paths.find(p=>p.getAttribute('fill')==='#C8E8A0');if(land){land.setAttribute('fill','#f8f3df');land.setAttribute('stroke','#adc6a1');land.setAttribute('stroke-width','1.5');}paths.filter(p=>p.getAttribute('fill')==='none'&&p.id!=='routeDot').forEach(p=>{p.style.opacity='0.5';p.setAttribute('stroke','#aac49d');p.setAttribute('stroke-width','1');});route=$('#routeDot');const old=$('#map-car-emoji');car=svgEl('g',{id:'map-car-emoji'});car.append(svgEl('image',{href:'fami-cabin.webp',x:-18,y:-21,width:36,height:30}));old?.replaceWith(car);const legend=[...svg.querySelectorAll('g')].find(g=>g.textContent.includes('시계방향 추천'));if(legend){legend.remove();const note=document.createElement('div');note.className='map-note';note.dataset.localized='true';note.innerHTML=[5,6,7].map(i=>'<span>'+ui[lang][i]+'</span>').join('');$('.map-svg-wrap').after(note);}const button=document.createElement('button');button.className='map-motion';button.dataset.localized='true';button.type='button';button.addEventListener('click',()=>{mapPaused=!mapPaused;updateMotionLabels();});$('.map-svg-wrap').append(button);oldPins=window.renderMapPins;window.renderMapPins=drawPins;drawPins();updateMotionLabels();
 window.cocoObserveMotion(svg,visible=>{mapInView=visible;lastFrame=0;});
 if(route&&typeof route.getTotalLength==='function'){const length=route.getTotalLength();function frame(now){const dt=lastFrame?Math.min(now-lastFrame,100):0;lastFrame=now;if(!mapPaused&&mapInView&&!document.hidden){distance=(distance+dt/42000*length)%length;}const p=route.getPointAtLength(distance),q=route.getPointAtLength((distance+2)%length);if(Math.abs(q.x-p.x)>.6)facing=q.x<p.x?-1:1;car.setAttribute('transform','translate('+p.x.toFixed(2)+','+p.y.toFixed(2)+') scale('+facing+',1)');requestAnimationFrame(frame);}requestAnimationFrame(frame);}
}
const originalSpots=typeof spots==='undefined'?{}:spots;
function refreshSpotText(){const id=window._currentSpotId;if(!id)return;const narration=data.tour[lang]?.[id]||data.tour.ko?.[id];const desc=$('#spotDesc');if(narration&&desc){desc.dataset.localized='true';desc.textContent=narration;}else if(desc){delete desc.dataset.localized;const s=originalSpots[id];if(s)desc.textContent=s.desc;}const label=$('.owner-narration-label');if(label){label.hidden=!narration;label.textContent=ui[lang][2];}$$('.map-note span').forEach((e,i)=>e.textContent=ui[lang][i+5]);localize();}
function setupSpots(){if(!originalSpots.haumok)originalSpots.haumok={emoji:'⚓',tag:'항구',tagBg:'#E4F0FF',tagColor:'#2255AA',title:'하우목동항',desc:data.tour.ko.haumok,photo:'spot_chunjin.jpg',tips:[{i:'📍',t:'반납 장소: 하우목동항 코코나라'}]};Object.entries(data.photos).forEach(([id,p])=>{if(originalSpots[id])originalSpots[id].photo=p.file;});const label=document.createElement('div');label.className='owner-narration-label';label.dataset.localized='true';$('#spotDesc').before(label);const credit=document.createElement('div');credit.className='photo-credit';credit.dataset.localized='true';$('#spotPhotoSlider').after(credit);
 const original=window.openSpot;window.openSpot=function(id){if(id==='haumok'&&typeof _origOpenSpot==='function'){_origOpenSpot(id);}else original(id);window._currentSpotId=id;$('#spotPopup').scrollTop=0;$('#spotPhotoSlides').style.transform='translateX(0)';const photo=data.photos[id];credit.innerHTML=photo?escape(photo.author)+' · <a href="'+escape(photo.source)+'" target="_blank" rel="noopener noreferrer">'+escape(photo.license)+'</a>':'';credit.hidden=!photo;$$('#spotPhotoSlides img').forEach(img=>{img.alt=tr(originalSpots[id]?.title||id);img.onclick=()=>window.viewDalkomPhoto_generic(img.src);});refreshSpotText();};
}
function updateTimeLabels(){const locale=lang==='ko'?'ko-KR':lang==='en'?'en-US':lang;/* Counters stay in their original IDs and continue receiving live updates. */const header=$('.header-text p');if(header&&lang!=='ko'){const today=$('#header-visitor-today'),total=$('#header-visitor-total');if(today&&total){const labels={en:['Today ',' · Total ',' visitors'],ms:['Hari ini ',' · Jumlah ',' pengunjung'],'zh-HK':['今日 ',' · 累計 ','人瀏覽'],'zh-TW':['今日 ',' · 累計 ','人瀏覽'],ja:['今日 ','人 · 累計 ','人訪問']}[lang];header.dataset.localized='true';header.replaceChildren(document.createTextNode(labels[0]),today,document.createTextNode(labels[1]),total,document.createTextNode(labels[2]));}}else if(header&&lang==='ko'&&header.dataset.localized){const today=$('#header-visitor-today'),total=$('#header-visitor-total');header.replaceChildren(document.createTextNode('오늘 '),today,document.createTextNode('명 · 누적 '),total,document.createTextNode('명 방문'));delete header.dataset.localized;}}
function start(){setupMap();setupSpots();const close=document.createElement('button');close.className='spot-close-button';close.type='button';close.textContent='×';close.setAttribute('aria-label',tr('닫기'));close.addEventListener('click',()=>window.closeSpot());$('#spotPopup').prepend(close);$('#spotPopup').setAttribute('role','dialog');$('#spotPopup').setAttribute('aria-modal','true');$('#spotPopup').setAttribute('aria-labelledby','spotTitle');localize();updateTimeLabels();$$('a[target="_blank"]').forEach(a=>a.rel='noopener noreferrer');const hash=location.hash.slice(1);if(['home','ferry','coconara','dalkom','hundert','food'].includes(hash))window.showPage(hash,$$('.tab-item')[['home','ferry','coconara','dalkom','hundert','food'].indexOf(hash)]);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
