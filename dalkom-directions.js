/* NAVER's documented app route: destination fixed, departure chosen by the app. */
(()=>{'use strict';
const place='https://map.naver.com/p/entry/place/1497457696';
function init(){
 const link=document.querySelector('#dalkom-directions');if(!link)return;
 const query=new URLSearchParams({dlat:'33.5134862',dlng:'126.9575667',dname:'달콤아재',appname:location.origin+location.pathname});
 const ua=navigator.userAgent,android=/Android/i.test(ua),ios=/iPhone|iPad|iPod/i.test(ua)||(/Macintosh/i.test(ua)&&navigator.maxTouchPoints>1);
 if(android){link.href='intent://route/car?'+query+'#Intent;scheme=nmap;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.nmap;S.browser_fallback_url='+encodeURIComponent(place)+';end';link.removeAttribute('target');}
 else if(ios){link.href='nmap://route/car?'+query;link.removeAttribute('target');}
 else{link.href=place;link.target='_blank';}
 link.rel='noopener noreferrer';
 // The explicit web link remains available if an in-app browser blocks app launches.
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
