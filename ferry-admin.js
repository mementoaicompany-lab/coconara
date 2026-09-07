/* Firebase compat Auth + RTDB ferry management.
 * Load after Firebase app/database/auth compat SDKs and initializeApp().
 * window.COCONARA_ADMIN_UID must match the single UID enforced by RTDB rules.
 * The UID check below controls the UI; deployed server rules enforce writes.
 * No password, ferry status, or authorization flag is persisted by this module.
 */
(() => {
  'use strict';
  if (window.CoconaraFerry) return;

  const DAY = 86400000, KST = 9 * 3600000;
  const STORED_STATUSES = ['normal', 'cancel', 'shortened'];
  const ALL_STATUSES = [...STORED_STATUSES, 'pending', 'closed'];
  const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
  const $ = id => document.getElementById(id);
  const uid = () => typeof window.COCONARA_ADMIN_UID === 'string' ? window.COCONARA_ADMIN_UID.trim() : '';
  const copy = value => value ? { ...value } : null;
  const words = {
    ko: { pending: '오늘 운항 정보 확인 중', pendingSub: '오늘 확인된 운항 정보를 기다리고 있습니다. 탑승 전 항구에 확인해 주세요.', normal: '오늘 배는 정상 운항합니다', normalSub: '오늘 확인된 운항 정보입니다. 탑승 전 항구와 목적지를 꼭 확인해 주세요.', cancel: '오늘 배가 결항됩니다', cancelSub: '방문 전 반드시 확인하세요 · 당일 100% 환불', shortened: '오늘은 단축 운항합니다', shortenedSub: '우도 출항 마지막 배 {time} · 출발 전 항구에 확인해 주세요.', closed: '오늘 단축 운항이 종료되었습니다', closedSub: '안내된 우도 출항 마지막 배 시각 {time}이 지났습니다.', normalBadge: '정상 운항', cancelBadge: '결항', shortenedBadge: '단축 운항', pendingBadge: '확인 중', closedBadge: '운항 종료', memo: '코코나라 관리자 안내', updated: '확인 {time} · 한국시간', dateZone: '한국시간' },
    en: { pending: 'Checking today’s ferry service', pendingSub: 'Today’s service has not been confirmed yet. Please check with the port before boarding.', normal: 'Ferries are operating normally today', normalSub: 'Today’s service is confirmed. Please check the port and destination before boarding.', cancel: 'Ferries are cancelled today', cancelSub: 'Please check before visiting · 100% same-day refund', shortened: 'Ferry service ends earlier today', shortenedSub: 'Last departure from Udo: {time}. Please confirm with the port before travelling.', closed: 'Today’s shortened ferry service has ended', closedSub: 'The announced last departure from Udo, {time}, has passed.', normalBadge: 'Normal service', cancelBadge: 'Cancelled', shortenedBadge: 'Shortened service', pendingBadge: 'Awaiting confirmation', closedBadge: 'Service ended', memo: 'Notice from Coconara', updated: 'Confirmed {time} · Korea time', dateZone: 'Korea time' },
    ms: { pending: 'Menyemak perkhidmatan feri hari ini', pendingSub: 'Perkhidmatan hari ini belum disahkan. Sila semak dengan pelabuhan sebelum menaiki feri.', normal: 'Feri beroperasi seperti biasa hari ini', normalSub: 'Perkhidmatan hari ini telah disahkan. Sila semak pelabuhan dan destinasi sebelum menaiki feri.', cancel: 'Perkhidmatan feri dibatalkan hari ini', cancelSub: 'Sila semak sebelum berkunjung · Bayaran balik 100% pada hari yang sama', shortened: 'Waktu operasi feri dipendekkan hari ini', shortenedSub: 'Feri terakhir dari Udo: {time}. Sila sahkan dengan pelabuhan sebelum bertolak.', closed: 'Perkhidmatan feri yang dipendekkan hari ini telah tamat', closedSub: 'Waktu feri terakhir dari Udo yang diumumkan, {time}, telah berlalu.', normalBadge: 'Operasi biasa', cancelBadge: 'Dibatalkan', shortenedBadge: 'Waktu dipendekkan', pendingBadge: 'Menunggu pengesahan', closedBadge: 'Operasi tamat', memo: 'Makluman daripada Coconara', updated: 'Disahkan {time} · Waktu Korea', dateZone: 'Waktu Korea' },
    'zh-HK': { pending: '正在確認今日渡輪服務', pendingSub: '今日航班資料尚待確認。上船前請先向港口查詢。', normal: '今日渡輪正常航行', normalSub: '今日航班資料已確認。上船前請再次確認港口及目的地。', cancel: '今日渡輪停航', cancelSub: '出發前請務必確認 · 當日全額退款', shortened: '今日渡輪提早結束服務', shortenedSub: '牛島出發尾班船：{time}。出發前請向港口確認。', closed: '今日提早結束的渡輪服務已完結', closedSub: '已公布的牛島出發尾班船時間 {time} 已過。', normalBadge: '正常航行', cancelBadge: '停航', shortenedBadge: '提早結束服務', pendingBadge: '確認中', closedBadge: '服務已結束', memo: 'Coconara 管理員通知', updated: '確認時間 {time} · 韓國時間', dateZone: '韓國時間' },
    'zh-TW': { pending: '正在確認今日渡輪服務', pendingSub: '今日航班資訊尚待確認。搭船前請先向港口查詢。', normal: '今日渡輪正常航行', normalSub: '今日航班資訊已確認。搭船前請再次確認港口及目的地。', cancel: '今日渡輪停航', cancelSub: '出發前請務必確認 · 當日全額退款', shortened: '今日渡輪提早結束服務', shortenedSub: '牛島出發末班船：{time}。出發前請向港口確認。', closed: '今日提早結束的渡輪服務已結束', closedSub: '已公布的牛島出發末班船時間 {time} 已過。', normalBadge: '正常航行', cancelBadge: '停航', shortenedBadge: '提早結束服務', pendingBadge: '確認中', closedBadge: '服務已結束', memo: 'Coconara 管理員通知', updated: '確認時間 {time} · 韓國時間', dateZone: '韓國時間' },
    ja: { pending: '本日のフェリー運航情報を確認中です', pendingSub: '本日の運航情報はまだ確認できていません。乗船前に港へご確認ください。', normal: '本日のフェリーは通常運航です', normalSub: '本日の運航情報は確認済みです。乗船前に港と行き先を必ずご確認ください。', cancel: '本日のフェリーは欠航です', cancelSub: 'ご来訪前に必ずご確認ください · 当日は全額返金', shortened: '本日はフェリーの運航時間を短縮します', shortenedSub: '牛島発の最終便は {time} です。出発前に港へご確認ください。', closed: '本日の短縮運航は終了しました', closedSub: '案内された牛島発最終便の時刻 {time} を過ぎました。', normalBadge: '通常運航', cancelBadge: '欠航', shortenedBadge: '短縮運航', pendingBadge: '確認中', closedBadge: '運航終了', memo: 'Coconaraからのお知らせ', updated: '確認 {time} · 韓国時間', dateZone: '韓国時間' }
  };
  const language = () => {
    const value = typeof window.cocoLanguage === 'function' ? window.cocoLanguage() : document.documentElement.lang;
    return Object.prototype.hasOwnProperty.call(words, value) ? value : 'ko';
  };
  // Default timetable guidance never claims a daily administrator confirmation.
  Object.assign(words.ko, {
    closed: '오늘 운항이 종료되었습니다',
    defaultNormalSub: '평상시 정상 운항 기준 안내입니다. 탑승 전 항구와 목적지를 꼭 확인해 주세요.',
    defaultClosedSub: '월별 기본 시간표의 우도 출항 마지막 배 시각 {time}이 지났습니다.'
  });
  Object.assign(words.en, {
    closed: 'Today’s ferry service has ended',
    defaultNormalSub: 'Standard ferry service guidance. Please check the port and destination before boarding.',
    defaultClosedSub: 'The last departure from Udo on the standard monthly timetable, {time}, has passed.'
  });
  Object.assign(words.ms, {
    closed: 'Perkhidmatan feri hari ini telah tamat',
    defaultNormalSub: 'Panduan operasi feri biasa. Sila semak pelabuhan dan destinasi sebelum menaiki feri.',
    defaultClosedSub: 'Waktu feri terakhir dari Udo mengikut jadual bulanan biasa, {time}, telah berlalu.'
  });
  Object.assign(words['zh-HK'], {
    closed: '今日渡輪服務已結束',
    defaultNormalSub: '按平日正常航班提供資訊。上船前請確認港口及目的地。',
    defaultClosedSub: '每月基本時間表所列的牛島出發尾班船時間 {time} 已過。'
  });
  Object.assign(words['zh-TW'], {
    closed: '今日渡輪服務已結束',
    defaultNormalSub: '依平日正常航班提供資訊。搭船前請確認港口及目的地。',
    defaultClosedSub: '每月基本時刻表所列的牛島出發末班船時間 {time} 已過。'
  });
  Object.assign(words.ja, {
    closed: '本日のフェリー運航は終了しました',
    defaultNormalSub: '通常の運航予定に基づくご案内です。乗船前に港と行き先をご確認ください。',
    defaultClosedSub: '月別の通常時刻表にある牛島発最終便の時刻 {time} を過ぎました。'
  });
  const text = (key, time) => words[language()][key].replace('{time}', time || '');
  let offset = 0, timeReady = false, connected = false, raw = null, received = false;
  let readError = '', auth = null, database = null, ferryRef = null;
  let persistence = null, authReady = false, authenticatedAdmin = false;
  let signingIn = false, signingOut = false, saveInFlight = false, openAfterLogin = false;
  let queuedSnapshot = null, queuedSnapshotReceived = false, draftDirty = false;
  let state, lastEmitted = '', midnightTimer, initialized = false, focusBeforeDialog = null;
  const now = () => Date.now() + (timeReady ? offset : 0);
  const dateKey = (epoch = now()) => new Date(epoch + KST).toISOString().slice(0, 10);
  const dayStart = (epoch = now()) => Math.floor((epoch + KST) / DAY) * DAY - KST;
  const isAdmin = () => Boolean(authReady && authenticatedAdmin && uid() && auth?.currentUser?.uid === uid());

  // This validator is also exposed for deterministic service-day boundary tests.
  function validateRecord(record, epoch = now()) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
    const permitted = ['status', 'date', 'serviceDayStart', 'memo', 'lastDeparture', 'updatedAt', 'updatedByUID'];
    if (Object.keys(record).some(key => !permitted.includes(key))) return null;
    if (!uid() || record.updatedByUID !== uid() || !STORED_STATUSES.includes(record.status)) return null;
    if (record.date !== dateKey(epoch) || record.serviceDayStart !== dayStart(epoch)) return null;
    if (typeof record.memo !== 'string' || record.memo.length > 500) return null;
    if (!Number.isInteger(record.updatedAt) || record.updatedAt < record.serviceDayStart || record.updatedAt > epoch + 60000) return null;
    if (record.status === 'shortened' ? typeof record.lastDeparture !== 'string' || !TIME.test(record.lastDeparture) : record.lastDeparture != null) return null;
    return { status: record.status, date: record.date, serviceDayStart: record.serviceDayStart, memo: record.memo,
      lastDeparture: record.status === 'shortened' ? record.lastDeparture : null,
      updatedAt: record.updatedAt, updatedByUID: record.updatedByUID };
  }

  function deriveState() {
    const epoch = now(), today = dateKey(epoch);
    // Connection diagnostics do not discard an already received valid override.
    // Without today's override, the business's standard service is the default.
    const record = validateRecord(raw, epoch);
    let reason = !uid() ? 'configuration' : readError || (!connected ? 'disconnected' : !timeReady ? 'clock' : !received ? 'loading' : !raw ? 'missing' : raw.date !== today ? 'stale' : '');
    if (!reason && !record) reason = 'invalid';
    const operatingStatus = record?.status || 'normal';
    let effective = operatingStatus, cutoffTime = record?.lastDeparture || null;
    if (operatingStatus === 'normal' && typeof window.getLastFerry === 'function') {
      const scheduled = window.getLastFerry(new Date(epoch + KST).getUTCMonth() + 1);
      if (scheduled && Number.isInteger(scheduled.h) && Number.isInteger(scheduled.m) && scheduled.h >= 0 && scheduled.h <= 23 && scheduled.m >= 0 && scheduled.m <= 59) {
        cutoffTime = String(scheduled.h).padStart(2, '0') + ':' + String(scheduled.m).padStart(2, '0');
      }
    }
    if (cutoffTime && (operatingStatus === 'normal' || operatingStatus === 'shortened')) {
      const [hour, minute] = cutoffTime.split(':').map(Number);
      if (epoch >= dayStart(epoch) + (hour * 60 + minute) * 60000) effective = 'closed';
    }
    return { status: effective, effectiveStatus: effective, storedStatus: record?.status || null, confirmed: Boolean(record),
      available: true, source: record ? 'admin' : 'default',
      date: record?.date || today, today, serviceDayStart: record?.serviceDayStart || dayStart(epoch),
      memo: record?.memo || '', lastDeparture: record?.lastDeparture || null, cutoffTime,
      updatedAt: record?.updatedAt || null, updatedByUID: record?.updatedByUID || null,
      reason: reason || null, connected, timeReady };
  }

  function setText(element, value) { if (element && element.textContent !== value) element.textContent = value; }
  function renderMemo() {
    const wrap = $('fsb-memo-wrap'), node = $('fsb-memo-text');
    if (!wrap || !node) return;
    const value = state.confirmed ? state.memo : '';
    setText(node, value); // Never interpret an administrator's memo as HTML.
    node.style.whiteSpace = 'pre-wrap';
    wrap.hidden = !value.trim();
    wrap.style.display = value.trim() ? 'block' : 'none';
    const label = wrap.querySelector('#fsb-memo-label') || wrap.firstElementChild;
    if (label && label !== node) { label.id = 'fsb-memo-label'; setText(label, '📢 ' + text('memo')); }
  }
  function renderPublic() {
    if (!state) return;
    const banner = $('ferry-status-banner'), status = state.status;
    if (banner) {
      banner.dataset.localized = 'true';
      ALL_STATUSES.forEach(name => banner.classList.toggle(name, name === status));
      banner.dataset.ferryStatus = status;
      banner.dataset.ferryConfirmed = String(state.confirmed);
      banner.dataset.ferryAvailable = String(state.available);
      banner.dataset.ferrySource = state.source;
      banner.setAttribute('aria-live', 'polite');
      banner.setAttribute('aria-atomic', 'true');
    }
    setText($('fsb-icon'), { normal: '🚢', cancel: '⛔', shortened: '🕒', pending: '⏳', closed: '🌙' }[status]);
    setText($('fsb-title'), text(status));
    const subKey = state.source === 'default' ? (status === 'closed' ? 'defaultClosedSub' : 'defaultNormalSub') : status + 'Sub';
    setText($('fsb-sub'), text(subKey, state.cutoffTime));
    const badge = $('fsb-badge');
    if (badge) {
      badge.hidden = status === 'normal';
      badge.dataset.localized = 'true';
      setText(badge, text(status + 'Badge'));
      badge.style.background = { normal: '#237252', cancel: '#a83c47', shortened: '#8c5b15', pending: '#725b2d', closed: '#546378' }[status];
      badge.style.color = '#fff';
    }
    const locale = language() === 'ko' ? 'ko-KR' : language();
    let displayDate;
    try { displayDate = new Intl.DateTimeFormat(locale, { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' }).format(new Date(now())); }
    catch (_) { displayDate = state.today; }
    setText($('fsb-date'), displayDate + ' · ' + text('dateZone'));
    let updated = $('fsb-updated');
    if (!updated && $('fsb-sub')) {
      updated = document.createElement('div'); updated.id = 'fsb-updated'; updated.dataset.localized = 'true'; $('fsb-sub').after(updated);
    }
    if (updated) {
      updated.hidden = !state.confirmed;
      const stamp = state.updatedAt ? new Date(state.updatedAt + KST).toISOString().slice(11, 16) : '';
      setText(updated, state.confirmed ? text('updated', stamp) : '');
    }
    renderMemo();
  }
  function refresh(force = false) {
    state = deriveState();
    renderPublic();
    renderAdminMeta();
    syncDraft();
    const signature = JSON.stringify(state);
    if (force || signature !== lastEmitted) {
      lastEmitted = signature;
      document.dispatchEvent(new CustomEvent('coconara:ferry-status', { detail: copy(state), bubbles: true }));
    }
    clearTimeout(midnightTimer);
    midnightTimer = setTimeout(() => refresh(), Math.max(50, dayStart() + DAY - now() + 25));
  }

  function adminMessage(value, kind = 'info') {
    const message = $('ferryAdminMessage');
    if (message) { message.dataset.kind = kind; setText(message, value); }
  }
  function loginMessage(value) { setText($('adminErr'), value); }
  function renderAdminMeta() {
    if (!$('ferryAdminDate')) return;
    setText($('ferryAdminDate'), dateKey() + ' · 한국시간 기준');
    const current = $('ferryAdminCurrent');
    const labels = { normal: '정상 운항', cancel: '결항', shortened: '단축 운항', closed: '운항 종료', pending: '오늘 정보 확인 중' };
    setText(current, '현재 공개 상태: ' + labels[state?.status || 'normal'] + (state?.source === 'default' ? ' · 기본 안내' : ' · 관리자 설정'));
    if ($('ferryAdminConnection')) {
      setText($('ferryAdminConnection'), connected && timeReady && !readError ? '서버 연결됨' : '서버 연결과 시간을 확인 중입니다.');
      $('ferryAdminConnection').dataset.connected = String(connected && timeReady && !readError);
    }
    const save = $('ferryAdminSave');
    if (save) save.disabled = saveInFlight || !isAdmin() || !connected || !timeReady || Boolean(readError);
    const fieldset = $('ferryAdminFields');
    if (fieldset) fieldset.disabled = saveInFlight;
  }
  function syncDraft() {
    if (saveInFlight || draftDirty || !$('ferryAdminForm')) return;
    const record = validateRecord(raw);
    document.querySelectorAll('#ferryAdminForm input[name="ferry-status"]').forEach(input => { input.checked = (record?.status || 'normal') === input.value; });
    $('edit-ferry-memo').value = record?.memo || '';
    $('ferryLastDeparture').value = record?.lastDeparture || '';
    updateDraftFields();
  }
  function updateDraftFields() {
    const shortened = document.querySelector('#ferryAdminForm input[name="ferry-status"]:checked')?.value === 'shortened';
    const wrap = $('ferryLastDepartureWrap'), field = $('ferryLastDeparture');
    if (wrap) wrap.hidden = !shortened;
    if (field) { field.required = shortened; field.disabled = !shortened || saveInFlight; }
    setText($('ferryMemoCount'), ($('edit-ferry-memo')?.value.length || 0) + ' / 500');
  }
  function closeLogin() {
    $('adminLoginBg')?.classList.remove('open');
    if ($('adminPw')) $('adminPw').value = '';
    loginMessage('');
    restoreFocus();
  }
  function showLogin() {
    if (isAdmin()) return openPanel();
    focusBeforeDialog = document.activeElement;
    $('adminLoginBg')?.classList.add('open');
    loginMessage(!uid() ? '관리자 UID 설정이 필요합니다.' : !auth ? '인증 서비스를 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.' : '');
    $('adminId')?.focus();
  }
  function closePanel() { $('adminPanelBg')?.classList.remove('open'); $('adminPanel')?.classList.remove('open'); restoreFocus(); }
  function restoreFocus() { if (focusBeforeDialog?.isConnected && typeof focusBeforeDialog.focus === 'function') focusBeforeDialog.focus(); }
  function openPanel() {
    if (!isAdmin()) { showLogin(); return; }
    focusBeforeDialog = document.activeElement;
    syncDraft(); renderAdminMeta();
    $('adminPanelBg')?.classList.add('open'); $('adminPanel')?.classList.add('open');
    $('ferryAdminHeading')?.focus();
  }
  function reflectAuth(allowed) {
    authenticatedAdmin = allowed;
    // Original classic scripts use a global lexical variable, not window's property.
    if (typeof isAdminLoggedIn !== 'undefined') isAdminLoggedIn = allowed;
    window.isAdminLoggedIn = allowed;
    $('adminBadge')?.classList.toggle('show', allowed);
    document.body.classList.toggle('admin-mode', allowed);
    if (!allowed) closePanel();
    ['toggleGearBtns', 'toggleArrowDrag', 'showBroadcastAdminBtns', 'showDalBroadcastAdminBtns'].forEach(name => {
      if (typeof window[name] === 'function') { try { window[name](allowed); } catch (_) { /* Optional legacy editing surfaces. */ } }
    });
    ['renderMapPins', 'renderFoodPage', 'initDalCoupon', 'initHundert'].forEach(name => {
      if (typeof window[name] === 'function') { try { window[name](); } catch (_) { /* A missing optional panel must not affect auth. */ } }
    });
    const photo = $('spotPhotoAdminBtn'); if (photo) photo.style.display = allowed ? 'block' : 'none';
    renderAdminMeta();
    document.dispatchEvent(new CustomEvent('coconara:admin-auth', { detail: { authenticated: allowed }, bubbles: true }));
  }
  function authError(error) {
    const code = error?.code || '';
    if (code === 'auth/not-authorized') return '이 계정에는 관리자 권한이 없습니다.';
    if (code === 'auth/network-request-failed') return '네트워크 연결을 확인하고 다시 로그인해 주세요.';
    if (code === 'auth/too-many-requests') return '로그인 시도가 많습니다. 잠시 후 다시 시도해 주세요.';
    if (['auth/operation-not-allowed', 'auth/invalid-api-key', 'auth/unauthorized-domain'].includes(code)) return 'Firebase 인증 설정을 확인해야 합니다. 관리자에게 문의해 주세요.';
    if (['auth/web-storage-unsupported', 'auth/unsupported-persistence-type'].includes(code)) return '이 브라우저에서 세션을 저장할 수 없습니다. 다른 브라우저로 시도해 주세요.';
    return '이메일 또는 비밀번호를 확인해 주세요.';
  }
  async function login() {
    if (signingIn) return false;
    if (!auth || !uid()) { loginMessage('관리자 인증 설정을 확인해야 합니다.'); return false; }
    const form = $('cocoAdminLoginForm'); if (form && !form.reportValidity()) return false;
    const email = $('adminId')?.value.trim(), password = $('adminPw')?.value;
    if (!email || !password) { loginMessage('이메일과 비밀번호를 입력해 주세요.'); return false; }
    signingIn = true; openAfterLogin = true;
    $('cocoAdminLoginButton').disabled = true; loginMessage('로그인 정보를 확인하고 있습니다…');
    try {
      await persistence;
      const credential = await auth.signInWithEmailAndPassword(email, password);
      if (credential.user.uid !== uid()) { const error = new Error('Not authorized'); error.code = 'auth/not-authorized'; throw error; }
      // Only onAuthStateChanged may show the badge and authenticated panel.
      return true;
    } catch (error) {
      openAfterLogin = false; loginMessage(authError(error)); return false;
    } finally {
      signingIn = false; $('cocoAdminLoginButton').disabled = false; $('adminPw').value = '';
    }
  }
  async function logout() {
    if (!auth || signingOut) return false;
    if (saveInFlight) { adminMessage('저장 응답을 기다리는 중입니다. 완료 후 로그아웃해 주세요.', 'error'); return false; }
    signingOut = true; $('ferryAdminLogout').disabled = true;
    try { await auth.signOut(); draftDirty = false; return true; }
    catch (_) { adminMessage('로그아웃하지 못했습니다. 연결을 확인하고 다시 시도해 주세요.', 'error'); return false; }
    finally { signingOut = false; $('ferryAdminLogout').disabled = false; }
  }
  function selectStatus(status) {
    if (!isAdmin() || saveInFlight || !STORED_STATUSES.includes(status)) return false;
    const radio = document.querySelector('#ferryAdminForm input[value="' + status + '"]');
    if (radio) { radio.checked = true; draftDirty = true; updateDraftFields(); }
    return true;
  }
  async function save() {
    if (saveInFlight) return false;
    if (!isAdmin()) { showLogin(); return false; }
    if (!ferryRef || !connected || !timeReady || readError) { adminMessage('서버 연결과 시간을 확인한 후 저장해 주세요.', 'error'); return false; }
    const form = $('ferryAdminForm'); if (!form.reportValidity()) return false;
    const status = form.querySelector('input[name="ferry-status"]:checked')?.value;
    const memo = $('edit-ferry-memo').value.trim(), lastDeparture = $('ferryLastDeparture').value;
    if (!STORED_STATUSES.includes(status) || memo.length > 500 || (status === 'shortened' && !TIME.test(lastDeparture))) {
      adminMessage('운항 상태와 마지막 출항 시각, 메모 길이를 확인해 주세요.', 'error'); return false;
    }
    const payload = { status, date: dateKey(), serviceDayStart: dayStart(), memo,
      updatedAt: window.firebase.database.ServerValue.TIMESTAMP, updatedByUID: auth.currentUser.uid };
    if (status === 'shortened') payload.lastDeparture = lastDeparture;
    saveInFlight = true; queuedSnapshot = null; queuedSnapshotReceived = false;
    renderAdminMeta(); updateDraftFields(); $('ferryAdminSave').textContent = '서버에 저장 중…';
    adminMessage('서버의 저장 확인을 기다리고 있습니다.');
    const slow = setTimeout(() => {
      if (saveInFlight) adminMessage('아직 서버 응답을 기다리고 있습니다. 연결을 유지해 주세요. 저장 완료 여부는 응답 후 표시됩니다.');
    }, 12000);
    try {
      // RTDB emits local optimistic events before this promise resolves. They are
      // buffered below and cannot change the public confirmed state before ACK.
      await ferryRef.set(payload);
      if (queuedSnapshotReceived) { raw = queuedSnapshot; received = true; }
      draftDirty = false;
      adminMessage(payload.date === dateKey() ? '오늘 운항 정보가 서버에 저장되었습니다.' : '저장한 정보의 날짜가 지나 기본 정상 운항으로 돌아갔습니다. 오늘 변경 사항이 있으면 다시 저장해 주세요.', 'success');
      return true;
    } catch (error) {
      // A rejected optimistic value must never be promoted into public service.
      readError = 'write-error';
      adminMessage(error?.code === 'PERMISSION_DENIED' || error?.code === 'permission-denied'
        ? '저장 권한이 거부되었습니다. 관리자 계정과 서버 규칙을 확인해 주세요.'
        : '저장하지 못했습니다. 입력 내용은 유지됩니다. 연결을 확인하고 다시 시도해 주세요.', 'error');
      return false;
    } finally {
      clearTimeout(slow); saveInFlight = false; queuedSnapshot = null; queuedSnapshotReceived = false;
      $('ferryAdminSave').textContent = '오늘 운항 정보 저장';
      refresh(); updateDraftFields();
      if (readError === 'write-error') retryRead();
    }
  }

  function createUI() {
    let loginBg = $('adminLoginBg');
    if (!loginBg) { loginBg = document.createElement('div'); loginBg.id = 'adminLoginBg'; document.body.append(loginBg); }
    loginBg.className = 'admin-modal-bg coco-ferry-login'; loginBg.dataset.localized = 'true';
    loginBg.innerHTML = '<section class="admin-modal" role="dialog" aria-modal="true" aria-labelledby="cocoAdminLoginHeading"><div class="ferry-admin-eyebrow">COCONARA ADMIN</div><h2 id="cocoAdminLoginHeading">관리자 로그인</h2><p>등록된 이메일 계정으로 로그인해 주세요.</p><form id="cocoAdminLoginForm"><label for="adminId">이메일</label><input class="admin-input" type="email" id="adminId" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" required placeholder="이메일 주소"><label for="adminPw">비밀번호</label><input class="admin-input" type="password" id="adminPw" autocomplete="current-password" required placeholder="비밀번호"><button class="admin-login-btn" type="submit" id="cocoAdminLoginButton">로그인</button><div class="admin-err" id="adminErr" role="status" aria-live="polite"></div><button class="ferry-admin-text-button" type="button" id="cocoAdminLoginCancel">닫기</button></form></section>';
    let backdrop = $('adminPanelBg');
    if (!backdrop) { backdrop = document.createElement('div'); backdrop.id = 'adminPanelBg'; document.body.append(backdrop); }
    backdrop.className = 'admin-panel-bg coco-ferry-admin-backdrop'; backdrop.removeAttribute('onclick');
    let panel = $('adminPanel');
    if (!panel) { panel = document.createElement('section'); panel.id = 'adminPanel'; document.body.append(panel); }
    panel.className = 'admin-panel coco-ferry-admin'; panel.dataset.localized = 'true';
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'true'); panel.setAttribute('aria-labelledby', 'ferryAdminHeading');
    panel.innerHTML = '<div class="ferry-admin-handle" aria-hidden="true"></div><div class="ferry-admin-top"><div><div class="ferry-admin-eyebrow">COCONARA ADMIN</div><h2 id="ferryAdminHeading" tabindex="-1">오늘의 운항 관리</h2></div><button type="button" class="ferry-admin-close" id="ferryAdminClose" aria-label="관리자 패널 닫기">×</button></div><div class="ferry-admin-summary"><strong id="ferryAdminDate"></strong><span id="ferryAdminCurrent"></span><small id="ferryAdminConnection"></small></div><form id="ferryAdminForm"><fieldset id="ferryAdminFields"><legend>오늘의 운항 상태</legend><div class="ferry-admin-options"><label class="ferry-admin-option"><input type="radio" name="ferry-status" value="normal" required><span><strong>정상 운항</strong><small>예정된 시간표로 운항</small></span></label><label class="ferry-admin-option"><input type="radio" name="ferry-status" value="cancel"><span><strong>결항</strong><small>오늘 운항하지 않음</small></span></label><label class="ferry-admin-option"><input type="radio" name="ferry-status" value="shortened"><span><strong>단축 운항</strong><small>우도 출항 마지막 배 시각 지정</small></span></label></div><div id="ferryLastDepartureWrap" class="ferry-admin-field" hidden><label for="ferryLastDeparture">우도 출항 마지막 배 <span>한국시간</span></label><input type="time" id="ferryLastDeparture" step="60" min="00:00" max="23:59"><p>이 시각이 지나면 오늘 운항 종료로 표시됩니다.</p></div><div class="ferry-admin-field"><label for="edit-ferry-memo">고객에게 보여줄 안내 메모 <span>선택</span></label><textarea id="edit-ferry-memo" maxlength="500" rows="4" placeholder="예) 오늘은 하우목동항만 운행합니다."></textarea><div class="ferry-admin-field-footer"><span>입력한 문구가 그대로 공개됩니다.</span><span id="ferryMemoCount">0 / 500</span></div></div></fieldset><p class="ferry-admin-day-note">평상시에는 정상 운항이 기본이므로 매일 저장할 필요가 없습니다. 결항·단축 운항이 있는 날만 수정해 주세요. 당일 변경 상태와 메모는 한국시간 자정에 만료되고 기본 정상 운항으로 돌아갑니다.</p><div id="ferryAdminMessage" role="status" aria-live="polite"></div><button type="submit" class="ferry-admin-save" id="ferryAdminSave">오늘 운항 정보 저장</button></form><button type="button" class="admin-logout" id="ferryAdminLogout">로그아웃</button>';
    $('cocoAdminLoginForm').addEventListener('submit', event => { event.preventDefault(); login(); });
    // Keep the original document-level Enter shortcut from bypassing form intent.
    loginBg.addEventListener('keydown', event => { if (event.key === 'Enter') event.stopPropagation(); });
    $('cocoAdminLoginCancel').addEventListener('click', closeLogin);
    loginBg.addEventListener('click', event => { if (event.target === loginBg) closeLogin(); });
    backdrop.addEventListener('click', closePanel); $('ferryAdminClose').addEventListener('click', closePanel);
    $('ferryAdminForm').addEventListener('submit', event => { event.preventDefault(); save(); });
    $('ferryAdminForm').addEventListener('input', () => { draftDirty = true; updateDraftFields(); });
    $('ferryAdminForm').addEventListener('change', () => { draftDirty = true; updateDraftFields(); });
    $('ferryAdminLogout').addEventListener('click', logout);
    document.addEventListener('keydown', event => {
      const dialog = loginBg.classList.contains('open') ? loginBg.querySelector('[role="dialog"]') : panel.classList.contains('open') ? panel : null;
      if (!dialog) return;
      if (event.key === 'Escape') { event.preventDefault(); loginBg.classList.contains('open') ? closeLogin() : closePanel(); }
      if (event.key === 'Tab') {
        const focusable = [...dialog.querySelectorAll('button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[tabindex="0"]')].filter(element => !element.closest('[hidden]'));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (!first) return;
        if (event.shiftKey && (document.activeElement === first || !focusable.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && (document.activeElement === last || !focusable.includes(document.activeElement))) { event.preventDefault(); first.focus(); }
      }
    });
  }

  function removeLegacyCredentials() {
    try {
      localStorage.removeItem('coco_admin');
      const saved = JSON.parse(localStorage.getItem('coco_data') || 'null');
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        const keys = ['adminId', 'adminPw', 'ferryStatus', 'ferryStatusDate', 'ferryMemo'];
        const changed = keys.some(key => Object.prototype.hasOwnProperty.call(saved, key));
        keys.forEach(key => { delete saved[key]; });
        if (changed) localStorage.setItem('coco_data', JSON.stringify(saved));
      }
    } catch (_) { /* Public service remains usable when browser storage is blocked. */ }
  }
  function acceptSnapshot(snapshot) {
    if (saveInFlight) { queuedSnapshot = snapshot.val(); queuedSnapshotReceived = true; return; }
    raw = snapshot.val(); received = true; readError = '';
    refresh(); syncDraft();
  }
  function retryRead() {
    if (!ferryRef || !connected || saveInFlight) return Promise.resolve(false);
    return ferryRef.get().then(snapshot => { acceptSnapshot(snapshot); return true; }).catch(() => { readError = 'read-error'; refresh(); return false; });
  }
  function connectFirebase() {
    const firebase = window.firebase;
    if (!firebase?.apps?.length || typeof firebase.database !== 'function') { readError = 'unavailable'; refresh(); return; }
    try {
      database = firebase.database(); ferryRef = database.ref('ferryStatus');
      database.ref('.info/serverTimeOffset').on('value', snapshot => {
        const value = snapshot.val(); timeReady = typeof value === 'number' && Number.isFinite(value);
        if (timeReady) offset = value;
        refresh(); syncDraft();
      }, () => { timeReady = false; refresh(); });
      database.ref('.info/connected').on('value', snapshot => {
        const reconnect = !connected && snapshot.val() === true; connected = snapshot.val() === true;
        refresh(); if (reconnect) retryRead();
      }, () => { connected = false; refresh(); });
      ferryRef.on('value', acceptSnapshot, () => { readError = 'read-error'; refresh(); });
    } catch (_) { readError = 'unavailable'; refresh(); }
    if (typeof firebase.auth !== 'function') return;
    try {
      auth = firebase.auth();
      persistence = auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      // Attach both branches immediately: blocked storage cannot leave an unhandled rejection.
      persistence.then(() => {
        auth.onAuthStateChanged(user => {
          authReady = true;
          const allowed = Boolean(user && uid() && user.uid === uid());
          reflectAuth(allowed);
          if (allowed && openAfterLogin) { openAfterLogin = false; closeLogin(); openPanel(); }
          if (user && !allowed) {
            openAfterLogin = false; loginMessage('이 계정에는 관리자 권한이 없습니다.');
            auth.signOut().catch(() => { loginMessage('관리자 권한이 없는 계정입니다. 로그아웃을 다시 시도해 주세요.'); });
          }
        }, () => { authReady = false; reflectAuth(false); loginMessage('인증 상태를 확인하지 못했습니다. 다시 로그인해 주세요.'); });
      }, error => { authReady = false; reflectAuth(false); loginMessage(authError(error)); });
    } catch (_) { auth = null; loginMessage('인증 서비스를 불러오지 못했습니다.'); }
  }

  // Legacy inline handlers remain callable, but none can bypass Auth or make an
  // optimistic/localStorage ferry status look confirmed.
  window.adminFabClick = () => isAdmin() ? openPanel() : showLogin();
  window.adminLogin = login; window.adminLogout = logout;
  window.openAdminPanel = openPanel; window.closeAdminPanel = closePanel;
  window.closeAdminLogin = closeLogin;
  window.setFerryStatus = selectStatus;
  window.saveFerryMemo = save; window.saveMemo = save;
  window.clearFerryMemo = () => { if (isAdmin() && !saveInFlight && $('edit-ferry-memo')) { $('edit-ferry-memo').value = ''; draftDirty = true; updateDraftFields(); } };
  window.applyFerryStatus = () => renderPublic(); window.applyFerryMemo = () => renderMemo();
  window.initFerryStatus = () => refresh(); window.presetFerryStatusNormalAndClearMemo = () => {};
  window.fbSetFerryStatus = selectStatus; window.fbSaveFerryMemo = save; window.fbClearFerryMemo = window.clearFerryMemo;
  window.CoconaraFerry = Object.freeze({ getState: () => copy(deriveState()), isConfirmed: () => deriveState().confirmed, isAvailable: () => deriveState().available,
    now, dateKey, dayStart, validateRecord, refresh: () => refresh(true), retry: retryRead,
    isAdmin, openAdmin: () => isAdmin() ? openPanel() : showLogin(), save });

  function start() {
    if (initialized) return; initialized = true;
    removeLegacyCredentials(); createUI(); reflectAuth(false); refresh(); connectFirebase();
    document.addEventListener('coco:language', () => refresh(true));
    document.addEventListener('visibilitychange', () => { refresh(); if (!document.hidden && readError) retryRead(); });
    window.addEventListener('online', retryRead);
    window.addEventListener('load', () => { removeLegacyCredentials(); refresh(true); });
    setInterval(() => { refresh(); if (readError && connected) retryRead(); }, 60000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
