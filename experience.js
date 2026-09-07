/* Short coupon story and original-copy reading cards. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const copy={
 ko:{couponZoom:'쿠폰 크게 보기',map:'지도에서 이름을 누르면 안내가 열려요',list:'관광지·매장 목록',steps:['쿠폰 받기','전달하기','맛보기'],captions:['코코나라에서 20% 쿠폰 받기','달콤아재에 쿠폰 전달','아이스크림 맛보기'],pause:'멈추기',resume:'이어서 보기',replay:'다시 보기',art:'코코나라 쿠폰을 받아 달콤아재에 전달하고 아이스크림을 맛보는 모습',chapters:['추천 이유','직접 만든 맛','수제 마그넷','마지막 한마디'],prev:'이전 이야기',next:'다음 이야기',all:'원문 전체 펼쳐보기',one:'한 장씩 보기',end:'끝까지 읽었어요',read:'사장님의 추천 이야기'},
 en:{couponZoom:'View full coupon',map:'Tap a name on the map to open its guide',list:'Places & shops',steps:['Get coupon','Hand it over','Enjoy'],captions:['Get a 20% coupon at Coconara','Give your coupon to Dalkom Ajae','Enjoy your ice cream'],pause:'Pause',resume:'Continue',replay:'Replay',art:'A visitor gets a Coconara coupon, gives it to Dalkom Ajae and enjoys ice cream',chapters:['Why this shop','Handmade','Magnets','A last word'],prev:'Previous story',next:'Next story',all:'Read the full text',one:'Read one card at a time',end:'You’ve read it all',read:'A recommendation from the owner'},
 ms:{couponZoom:'Lihat kupon penuh',map:'Tekan nama pada peta untuk membuka panduan',list:'Tempat & kedai',steps:['Ambil kupon','Serahkan','Nikmati'],captions:['Ambil kupon 20% di Coconara','Serahkan kupon kepada Dalkom Ajae','Nikmati aiskrim anda'],pause:'Jeda',resume:'Sambung',replay:'Main semula',art:'Pengunjung mengambil kupon Coconara, menyerahkannya kepada Dalkom Ajae dan menikmati aiskrim',chapters:['Mengapa ini','Buatan sendiri','Magnet','Kata akhir'],prev:'Cerita sebelumnya',next:'Cerita seterusnya',all:'Baca teks penuh',one:'Baca satu kad demi satu',end:'Selesai membaca',read:'Cadangan daripada pemilik'},
 'zh-HK':{couponZoom:'查看完整優惠券',map:'點選地圖上的名稱，即可查看介紹',list:'景點及商店列表',steps:['領取優惠券','交出優惠券','享用雪糕'],captions:['在 Coconara 領取八折優惠券','到 Dalkom Ajae 交出優惠券','享用美味雪糕'],pause:'暫停',resume:'繼續播放',replay:'重播',art:'旅客在 Coconara 領取優惠券，交給 Dalkom Ajae 後享用雪糕',chapters:['推薦原因','親手製作','手製磁石','最後心聲'],prev:'上一篇',next:'下一篇',all:'展開完整原文',one:'逐張閱讀',end:'已閱讀全部內容',read:'老闆的推薦故事'},
 'zh-TW':{couponZoom:'查看完整優惠券',map:'點選地圖上的名稱，即可查看介紹',list:'景點與店家列表',steps:['領取優惠券','交出優惠券','享用冰淇淋'],captions:['在 Coconara 領取八折優惠券','到 Dalkom Ajae 交出優惠券','享用美味冰淇淋'],pause:'暫停',resume:'繼續播放',replay:'重播',art:'旅客在 Coconara 領取優惠券，交給 Dalkom Ajae 後享用冰淇淋',chapters:['推薦原因','親手製作','手作磁鐵','最後心聲'],prev:'上一篇',next:'下一篇',all:'展開完整原文',one:'逐張閱讀',end:'已閱讀全部內容',read:'老闆的推薦故事'},
 ja:{couponZoom:'クーポンを拡大する',map:'地図の名前をタップすると案内が開きます',list:'観光地・お店の一覧',steps:['受け取る','渡す','味わう'],captions:['Coconaraで20%オフクーポンを受け取る','Dalkom Ajaeにクーポンを渡す','アイスクリームを味わう'],pause:'一時停止',resume:'続きを見る',replay:'もう一度',art:'Coconaraのクーポンを受け取り、Dalkom Ajaeに渡してアイスクリームを楽しむ様子',chapters:['おすすめの理由','手作りの味','マグネット','最後のひと言'],prev:'前の話',next:'次の話',all:'全文を開く',one:'1枚ずつ読む',end:'最後まで読みました',read:'店主のおすすめストーリー'}
};
const text=()=>copy[window.cocoLanguage?.()||'ko'];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let refreshMap=()=>{},refreshCoupon=()=>{},refreshReading=()=>{};

function setupMapDirectory(){
 const list=$('.map-pin-list');if(!list)return;
 const details=document.createElement('details');details.className='map-directory';
 const summary=document.createElement('summary');summary.dataset.localized='true';summary.innerHTML='<span></span><span class="directory-count">11</span><span class="directory-chevron" aria-hidden="true">⌄</span>';
 list.before(details);details.append(summary,list);
 const hint=$('.map-card-hdr>span');if(hint)hint.classList.add('map-tap-hint');
 function refresh(){summary.firstElementChild.textContent=text().list;summary.querySelector('.directory-count').textContent=list.children.length;list.querySelectorAll('.map-place').forEach(b=>b.classList.toggle('featured-place',['coconara','dalkom'].includes(b.dataset.spot)));if(hint)hint.title=text().map;$('#udo-map').setAttribute('aria-label',text().map);}
 window.cocoMapListRefresh=refresh;refreshMap=refresh;refresh();
}

function setupCouponStory(){
 const photo=$('#dal-coupon-photo');if(!photo)return;
 const proof=photo.parentElement,details=proof.parentElement,card=details.parentElement,header=card.firstElementChild;
 card.classList.add('coupon-story-card');header.classList.add('coupon-offer-header');details.classList.add('coupon-details');proof.classList.add('coupon-proof');proof.style.animation='none';details.lastElementChild.classList.add('coupon-original-copy');
 const film=document.createElement('div');film.className='coupon-film';film.dataset.localized='true';
 film.innerHTML='<div class="coupon-canvas"><div class="coupon-art" role="img"><img class="coupon-sheet" src="coupon-journey.webp" alt="" decoding="async"></div><div class="coupon-caption"><span class="coupon-scene-number"></span><strong></strong></div></div><div class="coupon-journey-steps"></div><div class="coupon-film-footer"><div class="coupon-time-track" aria-hidden="true"><i></i></div><button type="button" class="coupon-play"></button></div>';
 header.after(film);film.after(proof);proof.setAttribute('role','button');proof.tabIndex=0;const oldPhotoClick=proof.onclick;proof.onclick=()=>window.cocoShowPhotos?window.cocoShowPhotos([photo.src],0,text().couponZoom):oldPhotoClick.call(proof);proof.addEventListener('keydown',e=>{if(e.target!==proof)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();proof.click();}});
 const art=film.querySelector('.coupon-art'),sheet=film.querySelector('.coupon-sheet'),steps=film.querySelector('.coupon-journey-steps'),play=film.querySelector('.coupon-play');
 const durations=[800,600,800,600,800,1200],total=4800;
 let elapsed=reduced.matches?total:0,paused=reduced.matches,complete=reduced.matches,visible=true,loaded=sheet.complete&&sheet.naturalWidth>0,last=0,frame=-1,phase=0;
 for(let i=0;i<3;i++){const button=document.createElement('button');button.type='button';button.innerHTML='<b>'+(i+1)+'</b><span></span>';button.onclick=()=>{elapsed=[0,1400,2800][i];paused=true;complete=false;draw();refresh();};steps.append(button);}
 function refresh(){proof.setAttribute('aria-label',text().couponZoom);proof.classList.toggle('coupon-still',paused||complete||!visible||document.hidden);art.setAttribute('aria-label',text().art);[...steps.children].forEach((button,i)=>{button.lastElementChild.textContent=text().steps[i];button.setAttribute('aria-pressed',String(i===phase));});film.querySelector('.coupon-scene-number').textContent=['01','02','03'][phase];film.querySelector('.coupon-caption strong').textContent=text().captions[phase];play.textContent=(complete?'↻ ':paused?'▶ ':'⏸ ')+text()[complete?'replay':paused?'resume':'pause'];play.setAttribute('aria-pressed',String(paused||complete));}
 function draw(){let end=0,index=5;for(let i=0;i<durations.length;i++){end+=durations[i];if(elapsed<end){index=i;break;}}const nextPhase=Math.floor(index/2);if(frame!==index){frame=index;sheet.style.transform='translate('+(-(index%3)*100/3)+'%,'+(-Math.floor(index/3)*50)+'%)';art.dataset.frame=String(index);phase=nextPhase;if(index===0)proof.classList.remove('coupon-pop');if(index===1&&!reduced.matches)proof.classList.add('coupon-pop');refresh();}film.querySelector('.coupon-time-track i').style.width=Math.min(100,elapsed/total*100)+'%';}
 play.onclick=()=>{if(complete){elapsed=0;complete=false;paused=false;}else paused=!paused;draw();refresh();};
 sheet.addEventListener('load',()=>{loaded=true;});
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;refresh();},{threshold:0}).observe(card);
 function tick(now){const delta=last?Math.min(100,now-last):0;last=now;if(loaded&&visible&&!document.hidden&&$('#page-dalkom').classList.contains('active')&&!paused&&!complete){elapsed=(elapsed+delta)%(total+1800);draw();}requestAnimationFrame(tick);}
 document.addEventListener('visibilitychange',refresh);refreshCoupon=refresh;draw();refresh();requestAnimationFrame(tick);
}

function setupReadingCards(){
 const why=$('[data-sec-key="why"]'),about=$('[data-sec-key="about"]'),magnet=$('[data-sec-key="magnet"]');if(!why||!about||!magnet)return;
 const intro=why.previousElementSibling,last=magnet.nextElementSibling,blocks=[why,about,magnet,last],section=document.createElement('section');section.className='owner-reading';section.setAttribute('aria-label',text().read);intro.before(section);section.append(intro);intro.classList.add('owner-reading-header');
 const nav=document.createElement('nav');nav.className='reading-index';nav.dataset.localized='true';section.append(nav);
 const stage=document.createElement('div');stage.className='reading-stage';section.append(stage);
 blocks.forEach((block,i)=>{block.classList.add('reading-card');block.id='owner-reading-'+i;const row=i===3?block:[...block.children].find(c=>c.tagName!=='BUTTON');row.classList.add('reading-row');const spacer=row.firstElementChild;spacer.classList.add('reading-spacer');const content=row.lastElementChild;content.classList.add('reading-content');content.firstElementChild.classList.add('reading-title');content.lastElementChild.classList.add('reading-copy');block.setAttribute('role','group');block.setAttribute('aria-roledescription','slide');stage.append(block);const button=document.createElement('button');button.type='button';button.setAttribute('aria-controls',block.id);button.innerHTML='<b>0'+(i+1)+'</b><span></span>';button.onclick=()=>show(i,true);nav.append(button);});
 about.querySelector('[data-sec-content]').classList.add('reading-features');magnet.querySelector('[data-sec-content]').classList.add('reading-magnet');
 const controls=document.createElement('div');controls.className='reading-controls';controls.dataset.localized='true';controls.innerHTML='<div class="reading-progress"><span></span><div><i></i></div></div><div class="reading-buttons"><button type="button" class="reading-prev"></button><button type="button" class="reading-next"></button></div><button type="button" class="reading-all"></button>';section.append(controls);
 let current=0,all=false;const prev=controls.querySelector('.reading-prev'),next=controls.querySelector('.reading-next'),allButton=controls.querySelector('.reading-all');
 function refresh(){section.setAttribute('aria-label',text().read);[...nav.children].forEach((button,i)=>{button.lastElementChild.textContent=text().chapters[i];if(i===current)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');});prev.textContent='← '+text().prev;prev.disabled=current===0;next.textContent=current===3?'✓ '+text().end:text().next+' →';next.disabled=current===3;allButton.textContent=all?text().one:text().all;allButton.setAttribute('aria-expanded',String(all));controls.querySelector('.reading-progress>span').textContent=all?'4 / 4':(current+1)+' / 4';controls.querySelector('.reading-progress i').style.width=(all?100:(current+1)*25)+'%';controls.querySelector('.reading-buttons').hidden=all;}
 function show(index,user=false){current=index;section.dataset.chapter=String(current);blocks.forEach((b,i)=>b.hidden=!all&&i!==current);section.classList.toggle('show-all',all);refresh();if(user){const target=all?blocks[current]:section;target.scrollIntoView?.({behavior:reduced.matches?'auto':'smooth',block:'start'});}}
 prev.onclick=()=>show(Math.max(0,current-1),true);next.onclick=()=>show(Math.min(3,current+1),true);allButton.onclick=()=>{all=!all;show(current,true);};
 refreshReading=refresh;show(0);
}
function init(){setupMapDirectory();setupCouponStory();setupReadingCards();document.addEventListener('coco:language',()=>{refreshMap();refreshCoupon();refreshReading();});}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
