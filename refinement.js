/* Keep the existing panel and history lifecycle, with a visible, keyboard-accessible exit. */
(()=>{'use strict';
const panel=document.getElementById('panel-directions'),close=document.getElementById('directions-close'),trigger=document.getElementById('home-directions');
if(!panel||!close)return;
trigger?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();trigger.click();}});
let wasOpen=false,opener=null,overflow='';
function sync(){const open=panel.classList.contains('open');if(open===wasOpen)return;wasOpen=open;
 if(open){opener=document.activeElement;overflow=document.body.style.overflow;document.body.style.overflow='hidden';close.focus();}
 else{document.body.style.overflow=overflow;if(opener?.isConnected)opener.focus({preventScroll:true});}
}
new MutationObserver(sync).observe(panel,{attributes:true,attributeFilter:['class']});
panel.addEventListener('keydown',e=>{if(!panel.classList.contains('open'))return;
 if(e.key==='Escape'){e.preventDefault();e.stopPropagation();window.closePanel(panel.id);}
 if(e.key==='Tab'){const items=[...panel.querySelectorAll('button,a[href],input,[tabindex="0"]')].filter(x=>x.getClientRects().length&&!x.disabled);const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}
});
sync();
})();
