/* Daily confirmed ferry service, rendered against Korea time rather than visitor time. */
(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const KST = 9 * 60 * 60 * 1000;
  const originalDisplay = new WeakMap();
  const copy = {
    ko: {
      depart: '출항', flexible: '유동 출발', ended: '운항 종료', cancel: '결항', pending: '운항 확인 중', port: '항구에 확인',
      regular: '매 정시 출발 · 30분마다 추가출항은 항구에서 결정', last: '오늘 마지막 배: {time}',
      shortened: '단축 운항 · 관리자 확인', final: '마지막 배',
      shortenedDetail: '관리자가 확인한 마지막 출항 시각입니다. 중간 출항편은 항구에 확인해주세요.',
      pendingDetail: '오늘 운항 정보가 확인되면 배시간을 안내합니다.', cancelDetail: '오늘은 결항입니다. 출항 카운트다운을 표시하지 않습니다.',
      endedDetail: '오늘 운항이 종료되었습니다.', incomingDetail: '입도 배시간은 성산항에 확인해주세요.',
      kst: '한국시간(KST) 기준', returnBasis: '마지막 배 {time} 기준 · 1시간 전 반납',
      returnPending: '운항 확인 후 반납 시간을 안내합니다.', returnShort: '관리자가 확인한 마지막 배 {time} 기준 · 1시간 전 반납'
    },
    en: {
      depart: 'departure', flexible: 'flexible departure', ended: 'Service ended', cancel: 'Cancelled', pending: 'Awaiting confirmation', port: 'Check with the port',
      regular: 'Hourly departures · Extra half-hour sailings are decided at the port', last: 'Last ferry today: {time}',
      shortened: 'Shortened service · Confirmed by the administrator', final: 'last ferry',
      shortenedDetail: 'This is the last departure confirmed by the administrator. Ask the port about other sailings.',
      pendingDetail: 'Departure times will appear after today’s service is confirmed.', cancelDetail: 'Today’s service is cancelled. No departure countdown is shown.',
      endedDetail: 'Today’s ferry service has ended.', incomingDetail: 'Check with Seongsan Port for ferries to Udo.',
      kst: 'Korea time (KST)', returnBasis: 'Last ferry {time} · Return the vehicle 1 hour earlier',
      returnPending: 'The vehicle return time will appear after service is confirmed.', returnShort: 'Confirmed last ferry {time} · Return the vehicle 1 hour earlier'
    },
    ms: {
      depart: 'berlepas', flexible: 'pelepasan fleksibel', ended: 'Perkhidmatan tamat', cancel: 'Dibatalkan', pending: 'Menunggu pengesahan', port: 'Semak dengan pelabuhan',
      regular: 'Berlepas setiap jam · Perjalanan tambahan pada setengah jam ditentukan oleh pelabuhan', last: 'Feri terakhir hari ini: {time}',
      shortened: 'Waktu operasi dipendekkan · Disahkan pentadbir', final: 'feri terakhir',
      shortenedDetail: 'Ini waktu pelepasan terakhir yang disahkan oleh pentadbir. Semak perjalanan lain dengan pelabuhan.',
      pendingDetail: 'Waktu feri dipaparkan selepas operasi hari ini disahkan.', cancelDetail: 'Operasi hari ini dibatalkan. Kiraan detik pelepasan tidak dipaparkan.',
      endedDetail: 'Operasi feri hari ini telah tamat.', incomingDetail: 'Semak feri ke Udo dengan Pelabuhan Seongsan.',
      kst: 'Waktu Korea (KST)', returnBasis: 'Feri terakhir {time} · Pulangkan kenderaan 1 jam lebih awal',
      returnPending: 'Waktu pemulangan kenderaan dipaparkan selepas operasi disahkan.', returnShort: 'Feri terakhir yang disahkan {time} · Pulangkan kenderaan 1 jam lebih awal'
    },
    'zh-HK': {
      depart: '開船', flexible: '彈性開船', ended: '今日航班已結束', cancel: '停航', pending: '等待確認航班', port: '請向碼頭查詢',
      regular: '每小時正點開船 · 半點加班船由碼頭決定', last: '今日尾班船：{time}',
      shortened: '縮短航班時間 · 管理員已確認', final: '尾班船',
      shortenedDetail: '此為管理員確認的最後開船時間。其他航班請向碼頭查詢。',
      pendingDetail: '確認今日航班後，將顯示開船時間。', cancelDetail: '今日停航，不顯示開船倒數。',
      endedDetail: '今日渡輪服務已結束。', incomingDetail: '前往牛島的航班請向城山港查詢。',
      kst: '以韓國時間（KST）為準', returnBasis: '尾班船 {time} · 請提前1小時還車',
      returnPending: '確認航班後，將顯示還車時間。', returnShort: '已確認尾班船 {time} · 請提前1小時還車'
    },
    'zh-TW': {
      depart: '開船', flexible: '彈性開船', ended: '今日航班已結束', cancel: '停航', pending: '等待確認航班', port: '請向港口查詢',
      regular: '每小時整點開船 · 半點加班船由港口決定', last: '今日末班船：{time}',
      shortened: '縮短航班時間 · 管理員已確認', final: '末班船',
      shortenedDetail: '此為管理員確認的最後開船時間。其他航班請向港口查詢。',
      pendingDetail: '確認今日航班後，將顯示開船時間。', cancelDetail: '今日停航，不顯示開船倒數。',
      endedDetail: '今日渡輪服務已結束。', incomingDetail: '前往牛島的航班請向城山港查詢。',
      kst: '以韓國時間（KST）為準', returnBasis: '末班船 {time} · 請提前1小時還車',
      returnPending: '確認航班後，將顯示還車時間。', returnShort: '已確認末班船 {time} · 請提前1小時還車'
    },
    ja: {
      depart: '出航', flexible: '臨時出航', ended: '本日の運航終了', cancel: '欠航', pending: '運航確認中', port: '港にご確認ください',
      regular: '毎時00分出航 · 30分の追加便は港が決定します', last: '本日の最終便：{time}',
      shortened: '運航時間短縮 · 管理者確認済み', final: '最終便',
      shortenedDetail: '管理者が確認した最終出航時刻です。途中の便は港にご確認ください。',
      pendingDetail: '本日の運航が確認でき次第、出航時刻を表示します。', cancelDetail: '本日は欠航です。出航カウントダウンは表示しません。',
      endedDetail: '本日のフェリー運航は終了しました。', incomingDetail: '牛島行きの便は城山港にご確認ください。',
      kst: '韓国時間（KST）基準', returnBasis: '最終便 {time} · 1時間前までに車両を返却',
      returnPending: '運航確認後、車両の返却時刻を表示します。', returnShort: '確認済みの最終便 {time} · 1時間前までに車両を返却'
    }
  };

  const words = () => copy[window.cocoLanguage?.() || 'ko'] || copy.ko;
  const format = (template, time) => template.replace('{time}', time);
  const timeString = minutes => String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
  function setText(el, value) {
    if (!el) return;
    el.dataset.localized = 'true';
    if (el.textContent !== String(value)) el.textContent = String(value);
  }
  function show(el, visible) {
    if (!el) return;
    if (!originalDisplay.has(el)) originalDisplay.set(el, el.style.display);
    const display = visible ? originalDisplay.get(el) : 'none';
    if (el.style.display !== display) el.style.display = display;
    el.hidden = !visible;
  }
  function koreaTime() {
    const supplied = window.CoconaraFerry?.now?.();
    const epoch = Number.isFinite(supplied) ? supplied : Date.now();
    const date = new Date(epoch + KST);
    return {
      month: date.getUTCMonth() + 1,
      minute: date.getUTCHours() * 60 + date.getUTCMinutes(),
      exactMinute: date.getUTCHours() * 60 + date.getUTCMinutes() + date.getUTCSeconds() / 60,
      date: date.toISOString().slice(0, 10)
    };
  }
  function monthlyLast(month) {
    if ([1, 2, 11, 12].includes(month)) return 17 * 60;
    if ([3, 10].includes(month)) return 17 * 60 + 30;
    if ([4, 9].includes(month)) return 18 * 60;
    return 18 * 60 + 30;
  }
  function adminLast(value) {
    if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
    const [h, m] = value.split(':').map(Number);
    return h * 60 + m;
  }
  function nextDeparture(now, last) {
    // Only calculate today's daytime schedule; the source contains no overnight service.
    if (now.minute < 8 * 60 || now.exactMinute >= last) return null;
    const next = (Math.floor(now.exactMinute / 30) + 1) * 30;
    return next <= last ? { minute: next, remaining: Math.ceil(next - now.exactMinute), onTime: next % 60 === 0 } : null;
  }

  let initialized = false;
  let cards = [];
  let monthlyBlocks = [];
  let returnNote = null;

  function initialize() {
    if (initialized) return;
    initialized = true;
    const specifications = [
      ['nextFerryTime', 'remainMin', 'ferryBar', 'ferryMonthInfo', 'ferryLastInfo', false],
      ['nextFerryTime2', 'remainMin2', 'ferryBar2', 'ferryMonthInfo2', 'ferryLastInfo2', false],
      ['nextFerryTime3', 'remainMin3', 'ferryBar3', 'ferryMonthInfo3', 'ferryLastInfo3', false],
      ['nextFerryTimeIn', 'remainMinIn', 'ferryBarIn', null, null, true],
      ['nextFerryTimeIn2', 'remainMinIn2', 'ferryBarIn2', null, null, true]
    ];
    cards = specifications.flatMap(([timeId, remainId, barId, subId, lastId, incoming]) => {
      const time = byId(timeId);
      if (!time) return [];
      const remain = byId(remainId), bar = byId(barId);
      return [{ time, remain, bar, incoming, sub: byId(subId) || time.parentElement?.nextElementSibling,
        last: byId(lastId), countdown: remain?.parentElement, track: bar?.parentElement,
        card: time.closest('.fade-up'), fontSize: time.style.fontSize }];
    });
    monthlyBlocks = [...document.querySelectorAll('.ferry-table')].flatMap(table => {
      const block = table.closest('.fade-up') || table.parentElement;
      const label = block?.previousElementSibling;
      const warning = block?.nextElementSibling;
      return [block, label?.classList.contains('section-label') ? label : null,
        warning?.classList.contains('warn-box') ? warning : null].filter(Boolean);
    });
    const miniRow = byId('home-return-time-mini')?.parentElement?.parentElement;
    if (miniRow) {
      returnNote = document.createElement('div');
      returnNote.id = 'coco-ferry-return-note';
      returnNote.dataset.localized = 'true';
      returnNote.style.cssText = 'padding:0 14px 12px;font-size:12px;line-height:1.6;color:#657269;';
      miniRow.after(returnNote);
    }
  }

  function renderCard(card, state, now, last, w) {
    const active = state === 'normal';
    const departure = active ? nextDeparture(now, last) : null;
    let headline, detail;
    if (active && departure) {
      headline = timeString(departure.minute) + ' ' + (departure.onTime ? w.depart : w.flexible);
      detail = w.regular;
    } else if (state === 'shortened') {
      headline = card.incoming ? w.port : timeString(last) + ' ' + w.final;
      detail = card.incoming ? w.incomingDetail : w.shortenedDetail;
    } else if (state === 'normal') {
      headline = w.port;
      detail = w.regular;
    } else {
      headline = state === 'cancel' ? w.cancel : state === 'closed' ? w.ended : w.pending;
      detail = state === 'cancel' ? w.cancelDetail : state === 'closed' ? w.endedDetail : w.pendingDetail;
    }
    setText(card.time, headline);
    card.time.style.fontSize = (departure || (state === 'shortened' && !card.incoming)) ? card.fontSize : 'clamp(16px,4.5vw,24px)';
    card.time.style.lineHeight = '1.4';
    setText(card.sub, detail);
    setText(card.remain, departure ? departure.remaining : '--');
    show(card.countdown, Boolean(departure));
    show(card.track, Boolean(departure));
    if (card.bar) card.bar.style.width = departure ? Math.max(5, Math.min(95, departure.remaining / 60 * 100)) + '%' : '0%';
    if (card.last) {
      setText(card.last, active ? format(w.last, timeString(last)) + ' · ' + w.kst
        : state === 'shortened' ? format(w.last, timeString(last)) + ' · ' + w.shortened + ' · ' + w.kst
          : detail);
    }
    if (card.card) {
      card.card.dataset.ferryStatus = state;
      card.card.querySelectorAll('.mini-ferry-boat,.ferry-track-dot').forEach(boat => {
        boat.style.animationPlayState = active ? '' : 'paused';
      });
    }
  }

  function render() {
    if (document.readyState === 'loading') return;
    initialize();
    const w = words(), now = koreaTime();
    const snapshot = window.CoconaraFerry?.getState?.();
    let state = snapshot?.available && snapshot.date === now.date ? (snapshot.effectiveStatus || snapshot.status) : 'pending';
    if (!['normal', 'cancel', 'shortened', 'closed'].includes(state)) state = 'pending';
    let last = state === 'normal' ? monthlyLast(now.month) : adminLast(snapshot?.lastDeparture);
    if (state === 'shortened' && last === null) state = 'pending';
    if ((state === 'normal' || state === 'shortened') && now.exactMinute >= last) state = 'closed';
    cards.forEach(card => renderCard(card, state, now, last, w));

    monthlyBlocks.forEach(block => show(block, state === 'normal'));
    const row = [1, 2, 11, 12].includes(now.month) ? 1 : [3, 10].includes(now.month) ? 2 : [4, 9].includes(now.month) ? 3 : 4;
    for (let i = 1; i <= 4; i++) {
      ['row-' + i, 'row-f' + i].forEach(id => byId(id)?.classList.toggle('today-row', state === 'normal' && row === i));
    }

    const hasReturn = (state === 'normal' || state === 'shortened') && last !== null && last >= 60;
    const returnTime = hasReturn ? timeString(last - 60) : '--:--';
    const lastTime = hasReturn ? timeString(last) : '--:--';
    ['home-return-time', 'home-return-time-mini'].forEach(id => setText(byId(id), returnTime));
    ['home-last-ferry', 'home-last-ferry-mini'].forEach(id => setText(byId(id), lastTime));
    const returnDetail = hasReturn ? format(state === 'shortened' ? w.returnShort : w.returnBasis, lastTime) + ' · ' + w.kst
      : state === 'cancel' ? w.cancelDetail : state === 'closed' ? w.endedDetail : w.returnPending;
    setText(byId('home-return-desc'), returnDetail);
    setText(returnNote, returnDetail);
  }

  window.CoconaraFerrySchedule = Object.freeze({ render });
  document.addEventListener('coconara:ferry-status', render);
  document.addEventListener('coco:language', render);
  document.addEventListener('visibilitychange', render);
  // Old interval callbacks must delegate here via guards inside their original definitions.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
  else render();
  setInterval(render, 30000);
})();
