/* Visible-only media motion, restaurant galleries and ferry guidance. */
(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],tr=s=>window.cocoTranslate?.(s)||s;
const strings={
 ko:{prev:'이전 사진',next:'다음 사진',pause:'멈추기',play:'재생하기',close:'닫기',full:'사진 크게 보기',photos:'사진',crew:'탑승 전 선원분께 확인',question:'“하우목동항행 맞나요?”',crewAlt:'배 앞에서 승객이 선원에게 목적지를 물어보고 확인하는 모습',shipAlt:'정상 운항 중인 배를 표현한 애니메이션',soundOn:'소리 켜기',soundOff:'소리 끄기',videoPlay:'영상 재생',videoPause:'영상 멈추기',muted:'음소거 자동재생',youtube:'YouTube에서 보기'},
 en:{prev:'Previous photo',next:'Next photo',pause:'Pause',play:'Play',close:'Close',full:'View full photo',photos:'Photos',crew:'Ask the crew before boarding',question:'“Is this ferry going to Haumokdong Port?”',crewAlt:'A passenger asks the crew about the destination before boarding',shipAlt:'An animation representing normal ferry service',soundOn:'Sound on',soundOff:'Mute',videoPlay:'Play video',videoPause:'Pause video',muted:'Muted autoplay',youtube:'Watch on YouTube'},
 ms:{prev:'Foto sebelumnya',next:'Foto seterusnya',pause:'Jeda',play:'Main',close:'Tutup',full:'Lihat foto penuh',photos:'Foto',crew:'Tanya kru sebelum menaiki feri',question:'“Adakah feri ini menuju ke Pelabuhan Haumokdong?”',crewAlt:'Penumpang bertanya kepada kru tentang destinasi sebelum menaiki feri',shipAlt:'Animasi perkhidmatan feri biasa',soundOn:'Hidupkan bunyi',soundOff:'Senyapkan',videoPlay:'Mainkan video',videoPause:'Jeda video',muted:'Main automatik tanpa bunyi',youtube:'Tonton di YouTube'},
 'zh-HK':{prev:'上一張相片',next:'下一張相片',pause:'暫停',play:'播放',close:'關閉',full:'查看完整相片',photos:'相片',crew:'上船前請向船員確認',question:'「這班船是去下牛目洞港嗎？」',crewAlt:'乘客上船前向船員詢問並確認目的地',shipAlt:'示意渡輪正常航行的動畫',soundOn:'開啟聲音',soundOff:'靜音',videoPlay:'播放影片',videoPause:'暫停影片',muted:'靜音自動播放',youtube:'在 YouTube 觀看'},
 'zh-TW':{prev:'上一張照片',next:'下一張照片',pause:'暫停',play:'播放',close:'關閉',full:'查看完整照片',photos:'照片',crew:'上船前請向船員確認',question:'「這班船是去下牛目洞港嗎？」',crewAlt:'乘客上船前向船員詢問並確認目的地',shipAlt:'示意渡輪正常航行的動畫',soundOn:'開啟聲音',soundOff:'靜音',videoPlay:'播放影片',videoPause:'暫停影片',muted:'靜音自動播放',youtube:'在 YouTube 觀看'},
 ja:{prev:'前の写真',next:'次の写真',pause:'一時停止',play:'再生',close:'閉じる',full:'写真を拡大',photos:'写真',crew:'乗船前に船員へ確認',question:'「下牛目洞港行きですか？」',crewAlt:'乗船前に船員へ行き先を質問して確認する乗客',shipAlt:'通常運航を表すフェリーのアニメーション',soundOn:'音声をオン',soundOff:'ミュート',videoPlay:'動画を再生',videoPause:'動画を停止',muted:'ミュートで自動再生',youtube:'YouTubeで見る'}
};
const words=()=>strings[window.cocoLanguage?.()||'ko'];const refreshers=[];
function swipe(element,callback){let start;const begin=e=>{start=[e.touches[0].clientX,e.touches[0].clientY];};const end=e=>{if(!start)return;const dx=e.changedTouches[0].clientX-start[0],dy=e.changedTouches[0].clientY-start[1];start=null;if(Math.abs(dx)>40&&Math.abs(dx)>Math.abs(dy))callback(dx<0?1:-1);};element.addEventListener('touchstart',begin,{passive:true});element.addEventListener('touchend',end,{passive:true});}

window.cocoShowPhotos=function(sources,start,title){
 if($('.dalkom-fullscreen')||!sources.length)return;
 const overlay=document.createElement('div');overlay.className='dalkom-fullscreen';overlay.dataset.localized='true';overlay.setAttribute('role','dialog');overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label',title||words().photos);
 overlay.innerHTML='<button type="button" class="dalkom-full-close">×</button><img><div class="dalkom-full-controls"><button type="button" class="full-prev">‹</button><span></span><button type="button" class="full-next">›</button></div>';
 let current=start||0,closing=false;const focus=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';
 function draw(){overlay.querySelector('img').src=sources[current];overlay.querySelector('img').alt=(title||words().photos)+' '+(current+1);overlay.querySelector('.dalkom-full-controls span').textContent=(current+1)+' / '+sources.length;}
 function change(delta){current=(current+delta+sources.length)%sources.length;draw();}
 function finish(){overlay.remove();document.body.style.overflow=overflow;document.removeEventListener('keydown',keys);window.cocoCloseDalkom=null;focus?.focus();}
 function close(){if(closing)return;closing=true;if(window.pushPopupState)history.back();else finish();}
 function keys(e){if(e.key==='Escape')close();else if(e.key==='ArrowLeft')change(-1);else if(e.key==='ArrowRight')change(1);else if(e.key==='Tab'){const buttons=[...overlay.querySelectorAll('button:not(:disabled)')],i=buttons.indexOf(document.activeElement);e.preventDefault();buttons[(i+(e.shiftKey?-1:1)+buttons.length)%buttons.length].focus();}}
 const x=overlay.querySelector('.dalkom-full-close');x.setAttribute('aria-label',words().close);x.onclick=close;
 for(const [cls,delta,label]of [['full-prev',-1,'prev'],['full-next',1,'next']]){const b=overlay.querySelector('.'+cls);b.disabled=sources.length===1;b.setAttribute('aria-label',words()[label]);b.onclick=()=>change(delta);}
 overlay.addEventListener('click',e=>{if(e.target===overlay)close();});swipe(overlay,change);document.addEventListener('keydown',keys);document.body.append(overlay);window.cocoCloseDalkom=finish;window.pushPopupState?.();draw();x.focus();
};

function setupFoodGalleries(){
 const records=new Set();
 function enhance(){
  for(const r of records)if(!r.root.isConnected){r.stopObserving?.();records.delete(r);}
  $$('#page-food .food-card').forEach((card,index)=>{
   if(card.querySelector('.food-gallery'))return;const old=[...card.children].find(el=>el.tagName==='DIV'&&[...el.children].some(c=>c.tagName==='IMG'));if(!old)return;
   const images=[...old.children].filter(el=>el.tagName==='IMG');if(!images.length)return;
   const name=window.getFoods?.()[index]?.name||words().photos,sources=images.map(i=>i.getAttribute('src')),root=document.createElement('div');root.className='food-gallery';root.dataset.localized='true';
   root.innerHTML='<div class="food-gallery-stage" tabindex="0"></div><div class="food-gallery-controls"><button type="button" class="food-auto"></button><div><button type="button" class="food-prev">‹</button><span class="food-counter"></span><button type="button" class="food-next">›</button></div></div><div class="food-thumbnails"></div>';
   const stage=root.querySelector('.food-gallery-stage'),thumbs=root.querySelector('.food-thumbnails'),r={root,visible:false,paused:false,current:0,swiped:0};
   images.forEach((img,i)=>{img.removeAttribute('style');img.className='food-gallery-photo';img.loading='lazy';img.decoding='async';img.onclick=()=>{if(performance.now()<r.swiped)return;r.paused=true;refresh();window.cocoShowPhotos(sources,r.current,tr(name));};stage.append(img);const b=document.createElement('button');b.type='button';const thumb=document.createElement('img');thumb.src=sources[i];thumb.alt='';thumb.loading='lazy';b.append(thumb);b.onclick=()=>show(i,true);thumbs.append(b);});old.replaceWith(root);
   function refresh(){stage.setAttribute('aria-label',tr(name)+' · '+words().full);root.querySelector('.food-auto').textContent=(r.paused?'▶ ':'⏸ ')+words()[r.paused?'play':'pause'];root.querySelector('.food-auto').setAttribute('aria-pressed',String(r.paused));root.querySelector('.food-prev').setAttribute('aria-label',words().prev);root.querySelector('.food-next').setAttribute('aria-label',words().next);images.forEach((img,i)=>{img.alt=tr(name)+' · '+words().photos+' '+(i+1);thumbs.children[i].setAttribute('aria-label',words().full+' '+(i+1));});}
   function show(index,manual=false){r.current=(index+images.length)%images.length;if(manual)r.paused=true;images.forEach((img,i)=>{img.classList.toggle('current',i===r.current);img.setAttribute('aria-hidden',String(i!==r.current));thumbs.children[i].setAttribute('aria-pressed',String(i===r.current));});root.querySelector('.food-counter').textContent=(r.current+1)+' / '+images.length;refresh();}
   root.querySelector('.food-prev').onclick=()=>show(r.current-1,true);root.querySelector('.food-next').onclick=()=>show(r.current+1,true);root.querySelector('.food-auto').onclick=()=>{r.paused=!r.paused;refresh();};
   stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(r.current+(e.key==='ArrowRight'?1:-1),true);}else if(e.key==='Enter')images[r.current].click();});swipe(stage,delta=>{r.swiped=performance.now()+450;show(r.current+delta,true);});
   if(images.length===1){root.querySelector('.food-gallery-controls').hidden=true;thumbs.hidden=true;}
   r.refresh=refresh;r.next=()=>show(r.current+1);r.count=images.length;records.add(r);r.stopObserving=window.cocoObserveMotion(root,visible=>{r.visible=visible;});show(0);
  });
 }
 const original=window.renderFoodPage;window.renderFoodPage=function(){const result=original.apply(this,arguments);enhance();return result;};enhance();window.addEventListener('load',enhance);
 setInterval(()=>{if(document.hidden||$('.dalkom-fullscreen')||!$('#page-food').classList.contains('active'))return;for(const r of records)if(r.visible&&!r.paused&&r.count>1)r.next();},4800);
 refreshers.push(()=>records.forEach(r=>r.refresh()));
}

function setupCrewScenes(){
 const ferryWarning=$('#ferryLastInfo3')?.closest('.fade-up')?.nextElementSibling;const targets=[$('#home-ferry-check-body'),ferryWarning].filter(Boolean);
 targets.forEach((target,index)=>{const scene=document.createElement('div');scene.className='crew-check-scene';scene.dataset.localized='true';scene.innerHTML='<div class="crew-art" role="img"><img src="crew-question-sheet.webp" class="crew-sheet" alt="" loading="lazy"></div><div class="crew-quote"><span></span><strong></strong><button type="button"></button></div>';
  if(index===0)target.prepend(scene);else target.firstElementChild.after(scene);
  let paused=false,visible=false;function refresh(){scene.querySelector('.crew-art').setAttribute('aria-label',words().crewAlt);scene.querySelector('.crew-quote>span').textContent=words().crew;scene.querySelector('.crew-quote>strong').textContent=words().question;const b=scene.querySelector('button');b.textContent=(paused?'▶ ':'⏸ ')+words()[paused?'play':'pause'];b.setAttribute('aria-pressed',String(paused));scene.style.setProperty('--scene-motion',paused||!visible||document.hidden?'paused':'running');}
  scene.querySelector('button').onclick=()=>{paused=!paused;refresh();};window.cocoObserveMotion(scene,inView=>{visible=inView;refresh();});document.addEventListener('visibilitychange',refresh);refreshers.push(refresh);refresh();
 });
}

function setupFerryStatus(){
 const banner=$('#ferry-status-banner');if(!banner)return;
 const scene=document.createElement('div');scene.className='ferry-sailing-scene';scene.dataset.localized='true';scene.innerHTML='<img src="sailing-ferry.webp" class="sailing-vessel" alt=""><button type="button"></button>';banner.firstElementChild.after(scene);
 const badge=$('#fsb-badge');badge.dataset.localized='true';badge.setAttribute('aria-live','polite');let paused=false,visible=true;
 function sync(){if(window.CoconaraFerry) {const state=window.CoconaraFerry.getState().status;scene.hidden=state!=='normal';scene.querySelector('img').alt=words().shipAlt;scene.style.setProperty('--scene-motion',paused||!visible||document.hidden||state!=='normal'?'paused':'running');const button=scene.querySelector('button');button.textContent=paused?'▶':'⏸';button.setAttribute('aria-label',words()[paused?'play':'pause']);button.setAttribute('aria-pressed',String(paused));return;}const state=['normal','cancel','pending','closed','shortened'].find(s=>banner.classList.contains(s))||'pending',data=window.FERRY_STATUS_MAP[state];badge.hidden=state==='normal';badge.textContent=tr(data.badge||data.title);badge.style.background=data.badgeBg||({pending:'#aa750f',closed:'#526078'}[state]);badge.style.color='#fff';scene.hidden=state!=='normal';scene.querySelector('img').alt=words().shipAlt;scene.style.setProperty('--scene-motion',paused||!visible||document.hidden||state!=='normal'?'paused':'running');const button=scene.querySelector('button');button.textContent=paused?'▶':'⏸';button.setAttribute('aria-label',words()[paused?'play':'pause']);button.setAttribute('aria-pressed',String(paused));}
 scene.querySelector('button').onclick=()=>{paused=!paused;sync();};const original=window.applyFerryStatus;window.applyFerryStatus=function(){const result=original.apply(this,arguments);sync();return result;};new MutationObserver(sync).observe(banner,{attributes:true,attributeFilter:['class']});window.cocoObserveMotion(banner,inView=>{visible=inView;sync();});document.addEventListener('visibilitychange',sync);document.addEventListener('coconara:ferry-status',sync);refreshers.push(sync);sync();
}

function setupBroadcastAutoplay() {
  const frames = $$('#page-coconara iframe[src*="youtube.com/embed/"],#page-dalkom iframe[src*="youtube.com/embed/"],#page-hundert iframe[src*="youtube.com/embed/"]');
  if (!frames.length) return;
  const records = [];
  let chosen = null, scheduled = false, rearmScheduled = false, visibilityObserver = null;

  function refresh(r) {
    r.sound.textContent = (r.muted ? '🔇 ' : '🔊 ') + words()[r.muted ? 'soundOn' : 'soundOff'];
    r.sound.disabled = !r.ready;
    r.sound.setAttribute('aria-pressed', String(!r.muted));
    r.start.textContent = (r.requested ? '⏸ ' : '▶ ') + words()[r.requested ? 'videoPause' : 'videoPlay'];
    r.start.disabled = !r.ready;
    r.note.textContent = words().muted;
    r.external.textContent = words().youtube;
    r.external.hidden = !r.error;
  }

  // Caption suppression is best effort and one-shot. The public IFrame API
  // does not document a captions on/off method; never repeatedly override CC.
  function captionsOff(r) {
    if (!r.captionDefaultPending || r.intent !== 'auto') return;
    // A focused cross-origin player can mean the viewer is operating native CC.
    // Preserve that choice even if its captions module first appears late.
    if (document.activeElement === r.frame) { r.captionDefaultPending = false; return; }
    try {
      if (!(r.player.getOptions?.() || []).includes('captions')) return;
      if (typeof r.player.unloadModule === 'function') {
        r.captionDefaultPending = false;
        r.player.unloadModule('captions');
      } else if ((r.player.getOptions('captions') || []).includes('track') && typeof r.player.setOption === 'function') {
        r.captionDefaultPending = false;
        r.player.setOption('captions', 'track', {});
      }
    } catch (_) { /* Native CC remains available when optional methods differ. */ }
  }

  function measure(r) {
    if (document.hidden || !r.frame.closest('.page')?.classList.contains('active')) return 0;
    const box = r.frame.getBoundingClientRect();
    const viewport = window.visualViewport;
    const left = viewport?.offsetLeft || 0, top = viewport?.offsetTop || 0;
    const width = viewport?.width || window.innerWidth || document.documentElement.clientWidth;
    const height = viewport?.height || window.innerHeight || document.documentElement.clientHeight;
    // IO also supplies a fallback for environments without geometry APIs.
    if (!(box.width > 0 && box.height > 0 && width > 0 && height > 0)) return r.intersecting ? r.ratio : 0;
    let x1 = Math.max(box.left, left), x2 = Math.min(box.right, left + width);
    let y1 = Math.max(box.top, top), y2 = Math.min(box.bottom, top + height);
    for (let parent = r.frame.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
      const style = getComputedStyle(parent), clip = parent.getBoundingClientRect();
      if (clip.width > 0 && /hidden|clip|auto|scroll/.test(style.overflowX)) { x1 = Math.max(x1, clip.left); x2 = Math.min(x2, clip.right); }
      if (clip.height > 0 && /hidden|clip|auto|scroll/.test(style.overflowY)) { y1 = Math.max(y1, clip.top); y2 = Math.min(y2, clip.bottom); }
    }
    // A tall player can never reach a fixed 55% intersection on a short phone.
    // Positive visible area is eligible; only the most visible player is chosen.
    return Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  }
  const active = r => measure(r) > 0;

  function pause(r, user = false) {
    if (user) { r.userPaused = true; r.manualActive = false; r.captionDefaultPending = false; }
    const shouldPause = r.requested || r.playing;
    clearTimeout(r.watchdog);
    r.requested = false;
    r.playing = false;
    r.intent = user ? 'user-pause' : 'suspend';
    if (r.ready && shouldPause) {
      r.programmaticPause = true;
      try { r.player.pauseVideo(); } catch (_) { /* A loading iframe can vanish. */ }
    }
    refresh(r);
  }

  function play(r, user = false) {
    if (!r.ready || !active(r) || r.error || (!user && (r.userPaused || r.ended))) return;
    clearTimeout(r.watchdog);
    r.userPaused = false;
    r.blocked = false;
    r.programmaticPause = false;
    r.intent = user ? 'manual' : 'auto';
    r.requested = true;
    r.playing = false;
    if (user) { r.ended = false; r.manualActive = true; r.captionDefaultPending = false; }
    try {
      // Calls are intentionally adjacent and synchronous, including the trusted
      // gesture fallback below. Every automatic attempt starts muted.
      if (!user) { r.player.mute(); r.muted = true; }
      captionsOff(r);
      r.player.playVideo();
    } catch (_) { r.requested = false; r.blocked = true; }
    refresh(r);
    // Some embedded/mobile players fail without onAutoplayBlocked. Distinguish
    // a never-started attempt from a visitor pausing an already-playing video.
    if (r.requested && !r.playing) r.watchdog = setTimeout(() => {
      if (!r.requested || r.playing || !active(r)) return;
      let state;
      try { state = r.player.getPlayerState?.(); } catch (_) { return; }
      if (state === -1 || state === 2 || state === 5) {
        r.requested = false; r.blocked = true; refresh(r);
      }
    }, 2500);
  }

  function evaluate(rearm = false) {
    scheduled = false;
    rearm = rearm || rearmScheduled; rearmScheduled = false;
    records.forEach(r => {
      r.visibleArea = measure(r);
      const visible = r.visibleArea > 0;
      if (visible && (!r.wasActive || rearm) && !r.userPaused && !r.ended) r.blocked = false;
      r.wasActive = visible;
      if (!visible) pause(r);
    });
    const candidates = records.filter(r => r.visibleArea > 0 && r.ready && !r.error && !r.userPaused && !r.ended && !r.blocked)
      .sort((a, b) => b.visibleArea - a.visibleArea);
    const manual = candidates.find(r => r.manualActive && r.requested);
    let candidate = manual || candidates[0] || null;
    // Avoid swapping two nearly equal visible videos on every scroll pixel.
    if (!manual && chosen && candidates.includes(chosen) && chosen.requested && chosen.visibleArea >= (candidate?.visibleArea || 0) * .8) candidate = chosen;
    records.forEach(r => { if (r !== candidate && (r.requested || r.playing)) pause(r); });
    chosen = candidate;
    if (candidate && !candidate.requested) play(candidate);
  }
  function schedule(rearm = false) {
    rearmScheduled = rearmScheduled || rearm === true;
    if (!scheduled) { scheduled = true; queueMicrotask(() => evaluate()); }
  }

  for (const [i, frame] of frames.entries()) {
    const url = new URL(frame.src);
    url.searchParams.set('enablejsapi', '1'); url.searchParams.set('origin', location.origin);
    url.searchParams.set('playsinline', '1'); url.searchParams.set('autoplay', '0');
    url.searchParams.set('mute', '1'); url.searchParams.set('cc_load_policy', '0'); url.searchParams.delete('cc_lang_pref');
    frame.src = url.href; frame.id = frame.id || 'broadcast-player-' + i;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    frame.parentElement.classList.add('broadcast-player-wrap');
    const bar = document.createElement('div'); bar.className = 'broadcast-controls'; bar.dataset.localized = 'true';
    bar.innerHTML = '<span></span><div><button type="button" class="broadcast-sound"></button><button type="button" class="broadcast-start"></button></div><a target="_blank" rel="noopener noreferrer" hidden></a>';
    frame.parentElement.after(bar);
    const r = { frame, bar, sound: bar.querySelector('.broadcast-sound'), start: bar.querySelector('.broadcast-start'),
      note: bar.querySelector('span'), external: bar.querySelector('a'), ratio: 0, intersecting: false, visibleArea: 0,
      wasActive: false, ready: false, requested: false, playing: false, intent: 'idle', captionDefaultPending: true,
      muted: true, userPaused: false, manualActive: false, programmaticPause: false, blocked: false, ended: false, error: false, watchdog: null };
    r.external.href = 'https://www.youtube.com/watch?v=' + url.pathname.split('/').pop();
    r.sound.onclick = () => {
      if (!r.ready) return;
      r.muted = !r.muted;
      if (r.muted) r.player.mute(); else r.player.unMute();
      refresh(r);
    };
    r.start.onclick = () => {
      if (!r.ready) return;
      if (r.requested || r.playing) pause(r, true);
      else { records.forEach(other => { if (other !== r) pause(other); }); chosen = r; play(r, true); }
    };
    records.push(r); refresh(r);
  }

  if ('IntersectionObserver' in window) {
    visibilityObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { const r = records.find(item => item.frame === entry.target); if (r) { r.intersecting = entry.isIntersecting; r.ratio = entry.intersectionRatio; } });
      schedule();
    }, { threshold: [0, .01, .1, .25, .5, .75, 1] });
    records.forEach(r => visibilityObserver.observe(r.frame));
  }
  const pageObserver = new MutationObserver(() => schedule(true));
  $$('.page').forEach(page => pageObserver.observe(page, { attributes: true, attributeFilter: ['class'] }));
  document.addEventListener('visibilitychange', () => schedule(true));
  window.addEventListener('pageshow', () => schedule(true));
  window.addEventListener('focus', () => schedule(true));
  window.addEventListener('online', () => schedule(true));
  window.addEventListener('orientationchange', () => schedule(true));
  window.addEventListener('resize', () => schedule());
  document.addEventListener('scroll', () => schedule(), { capture: true, passive: true });
  window.visualViewport?.addEventListener('resize', () => schedule());
  window.visualViewport?.addEventListener('scroll', () => schedule());

  function retryFromGesture(event) {
    if (!event.isTrusted || document.hidden || event.target?.closest?.('.broadcast-controls')) return;
    // Do not queue this call: it must remain in the real input event's stack.
    // Never use a general page touch to undo the visitor's actual pause.
    const candidate = records.filter(r => active(r) && r.ready && !r.requested && !r.userPaused && !r.ended && !r.error)
      .sort((a, b) => measure(b) - measure(a))[0];
    if (!candidate) return;
    if (records.some(r => r !== candidate && active(r) && (r.requested || r.playing))) return;
    records.forEach(r => { if (r !== candidate) pause(r); }); chosen = candidate;
    play(candidate);
  }
  document.addEventListener('touchend', retryFromGesture, { passive: true });
  document.addEventListener('pointerup', retryFromGesture, { passive: true });
  document.addEventListener('click', retryFromGesture);
  function preserveNativeCaptionChoice() {
    const r = records.find(item => item.frame === document.activeElement);
    if (r) r.captionDefaultPending = false;
  }
  document.addEventListener('focusin', preserveNativeCaptionChoice);
  window.addEventListener('blur', () => queueMicrotask(preserveNativeCaptionChoice));

  function mount() {
    if (!window.YT?.Player) return;
    records.forEach(r => {
      if (r.player) return;
      r.player = new YT.Player(r.frame.id, { events: {
        onReady: event => {
          r.player = event.target; r.ready = true;
          const currentFrame = r.player.getIframe?.();
          if (currentFrame && currentFrame !== r.frame) { visibilityObserver?.unobserve(r.frame); r.frame = currentFrame; visibilityObserver?.observe(r.frame); }
          r.player.mute(); r.muted = true; refresh(r); evaluate();
        },
        onApiChange: () => captionsOff(r),
        onStateChange: event => {
          if (event.data === 1) {
            clearTimeout(r.watchdog);
            const nativeIntent = !r.requested && document.activeElement === r.frame && !r.programmaticPause;
            if (!active(r) || ((r.userPaused || r.intent === 'suspend') && !nativeIntent)) { r.playing = true; pause(r); return; }
            if (nativeIntent) { r.manualActive = true; r.intent = 'manual'; r.captionDefaultPending = false; }
            captionsOff(r);
            // Captions may load after PLAYING. Keep the one-shot pending until
            // the module exists or a native/manual interaction yields control.
            r.programmaticPause = false; r.playing = true; r.requested = true;
            r.userPaused = false; r.blocked = false; r.ended = false;
            records.forEach(other => { if (other !== r) pause(other); }); chosen = r;
          } else if (event.data === 2) {
            const wasPlaying = r.playing;
            clearTimeout(r.watchdog); r.requested = false; r.playing = false;
            if (r.programmaticPause) r.programmaticPause = false;
            else if (wasPlaying && active(r)) { r.userPaused = true; r.manualActive = false; r.intent = 'user-pause'; r.captionDefaultPending = false; }
            else if (active(r)) r.blocked = true;
          } else if (event.data === 0) {
            clearTimeout(r.watchdog); r.requested = false; r.playing = false; r.ended = true;
          }
          refresh(r);
        },
        onAutoplayBlocked: () => {
          clearTimeout(r.watchdog); r.blocked = true; r.requested = false; r.playing = false;
          // This event is a browser policy result, never a visitor pause.
          refresh(r);
        },
        onError: () => { clearTimeout(r.watchdog); r.error = true; r.requested = false; r.playing = false; r.blocked = true; refresh(r); }
      } });
    });
  }
  if (window.YT?.Player) mount();
  else {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof previous === 'function') previous(); mount(); };
    if (!$('#coco-youtube-api')) {
      const script = document.createElement('script'); script.id = 'coco-youtube-api'; script.src = 'https://www.youtube.com/iframe_api'; script.async = true; document.head.append(script);
    }
  }
  refreshers.push(() => records.forEach(refresh));
}
function init(){setupFoodGalleries();setupCrewScenes();setupFerryStatus();setupBroadcastAutoplay();document.addEventListener('coco:language',()=>refreshers.forEach(f=>f()));}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
