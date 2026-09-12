/* Short coupon story and original-copy reading cards. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const copy={
 ko:{couponZoom:'쿠폰 크게 보기',map:'지도에서 이름을 누르면 안내가 열려요',list:'관광지·매장 목록',steps:['쿠폰 받기','전달하기','맛보기'],captions:['코코나라 카운터에서 쿠폰 받기','달콤아재에 쿠폰 전달','아이스크림 맛보기'],pause:'멈추기',resume:'이어서 보기',replay:'다시 보기',art:'고객이 코코나라에서 쿠폰을 받고 달콤아재에 방문해 아이스크림을 먹는 애니메이션',chapters:['추천 이유','직접 만든 맛','수제 마그넷','마지막 한마디'],prev:'이전 이야기',next:'다음 이야기',all:'원문 전체 펼쳐보기',one:'한 장씩 보기',end:'끝까지 읽었어요',read:'사장님의 추천 이야기'},
 en:{couponZoom:'View full coupon',map:'Tap a name on the map to open its guide',list:'Places & shops',steps:['Get coupon','Hand it over','Enjoy'],captions:['Get your coupon at the Coconara counter','Give your coupon to Dalkom Ajae','Enjoy your ice cream'],pause:'Pause',resume:'Continue',replay:'Replay',art:'A customer collects a coupon at Coconara, visits Dalkom Ajae and enjoys peanut ice cream',chapters:['Why this shop','Handmade','Magnets','A last word'],prev:'Previous story',next:'Next story',all:'Read the full text',one:'Read one card at a time',end:'You’ve read it all',read:'A recommendation from the owner'},
 ms:{couponZoom:'Lihat kupon penuh',map:'Tekan nama pada peta untuk membuka panduan',list:'Tempat & kedai',steps:['Ambil kupon','Serahkan','Nikmati'],captions:['Ambil kupon di kaunter Coconara','Serahkan kupon kepada Dalkom Ajae','Nikmati aiskrim anda'],pause:'Jeda',resume:'Sambung',replay:'Main semula',art:'Pelanggan mengambil kupon di Coconara, melawat Dalkom Ajae dan menikmati aiskrim',chapters:['Mengapa ini','Buatan sendiri','Magnet','Kata akhir'],prev:'Cerita sebelumnya',next:'Cerita seterusnya',all:'Baca teks penuh',one:'Baca satu kad demi satu',end:'Selesai membaca',read:'Cadangan daripada pemilik'},
 'zh-HK':{couponZoom:'查看完整優惠券',map:'點選地圖上的名稱，即可查看介紹',list:'景點及商店列表',steps:['領取優惠券','交出優惠券','享用雪糕'],captions:['在 Coconara 櫃檯領取優惠券','到 Dalkom Ajae 交出優惠券','享用美味雪糕'],pause:'暫停',resume:'繼續播放',replay:'重播',art:'顧客到 Coconara 領券，前往 Dalkom Ajae 享用花生雪糕',chapters:['推薦原因','親手製作','手製磁石','最後心聲'],prev:'上一篇',next:'下一篇',all:'展開完整原文',one:'逐張閱讀',end:'已閱讀全部內容',read:'老闆的推薦故事'},
 'zh-TW':{couponZoom:'查看完整優惠券',map:'點選地圖上的名稱，即可查看介紹',list:'景點與店家列表',steps:['領取優惠券','交出優惠券','享用冰淇淋'],captions:['在 Coconara 櫃檯領取優惠券','到 Dalkom Ajae 交出優惠券','享用美味冰淇淋'],pause:'暫停',resume:'繼續播放',replay:'重播',art:'顧客到 Coconara 領券，前往 Dalkom Ajae 享用花生冰淇淋',chapters:['推薦原因','親手製作','手作磁鐵','最後心聲'],prev:'上一篇',next:'下一篇',all:'展開完整原文',one:'逐張閱讀',end:'已閱讀全部內容',read:'老闆的推薦故事'},
 ja:{couponZoom:'クーポンを拡大する',map:'地図の名前をタップすると案内が開きます',list:'観光地・お店の一覧',steps:['受け取る','渡す','味わう'],captions:['Coconaraのカウンターで受け取る','Dalkom Ajaeにクーポンを渡す','アイスクリームを味わう'],pause:'一時停止',resume:'続きを見る',replay:'もう一度',art:'Coconaraでクーポンを受け取り、Dalkom Ajaeを訪れてアイスクリームを楽しむアニメーション',chapters:['おすすめの理由','手作りの味','マグネット','最後のひと言'],prev:'前の話',next:'次の話',all:'全文を開く',one:'1枚ずつ読む',end:'最後まで読みました',read:'店主のおすすめストーリー'}
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

function setupCouponStory(){window.CocoJourney.setupCouponStory(text);}

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
