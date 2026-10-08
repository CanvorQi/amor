/*
 * Amor - Arayüz
 * -------------
 * Hash tabanlı basit yönlendirme (GitHub Pages ile uyumlu):
 *   #/home  #/messages  #/mood  #/me  #/p/<id>  #/chat/<id>  #/mood/<id>
 */
(() => {
  const A = window.Amor;
  const S = () => A.Store.state;
  const $ = (sel, root = document) => root.querySelector(sel);
  const view = $('#view');
  const app = $('#app');

  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const chars = () => A.CHARACTERS;

  const ui = {
    homeTab: 'recommended', msgTab: 'msg', msgFilter: 'all', contactFilter: 'all', contactAsc: false, profileTab: 'profile', route: null,
    filter: { min: 18, max: 99, city: '', online: false }
  };
  const typing = {};   // karakter yazıyor mu
  const reading = {};  // mesajı okumak üzere bekliyor mu
  const timers = {};   // cevap bekletme zamanlayıcıları
  const openerSent = {};

  /* ---------- İkonlar ---------- */
  const ICON = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    arrowLeft: '<svg viewBox="0 0 24 24"><path d="M20 12H5M11 5l-7 7 7 7"/></svg>',
    more: '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="12" cy="19" r="1.3"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M3.4 11.1 19.6 3.6c.9-.4 1.8.5 1.4 1.4l-7.5 16.2c-.4.9-1.7.8-2-.1l-1.6-5.4a1 1 0 0 0-.6-.6L3.9 13.5c-.9-.3-1-1.6-.1-2z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v6a3.5 3.5 0 0 1-3.5 3.5H11l-4.3 3.4c-.6.5-1.5 0-1.5-.7V16A3.5 3.5 0 0 1 4 12.5z"/><circle cx="9.5" cy="9.5" r="1.2" fill="#fff"/><circle cx="14.5" cy="9.5" r="1.2" fill="#fff"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>'
  };

  /* ---------- Yardımcılar ---------- */
  // Telefonda avatarlar biraz daha küçük
  const avaSize = size => Math.round(window.innerWidth < 768 ? size * 0.8 : size);

  function avatar(c, size = 56, opts = {}) {
    size = avaSize(size);
    const online = A.Mood.isOnline(c);
    const inner = c.photo
      ? `<img src="${esc(c.photo)}" alt="${esc(c.name)}" loading="lazy">`
      : esc(c.name.charAt(0));
    const busy = online && A.Schedule.status(c).state === 'busy';
    const dot = opts.dot === false ? '' : `<i class="dot ${online ? (busy ? 'busy' : '') : 'off'}"></i>`;
    const unread = opts.unread ? `<b class="unread">${opts.unread > 99 ? '99+' : opts.unread}</b>` : '';
    const deco = opts.deco ? `<span class="deco">${c.emoji}</span>` : '';
    return `<div class="ava" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px;background:linear-gradient(135deg,${c.colors[0]},${c.colors[1]})">${inner}${deco}${dot}${unread}</div>`;
  }

  // Kullanıcının avatarı (mağazadan alınan çerçeveyle)
  function userAvatar(size = 56, frameOverride) {
    size = avaSize(size);
    const f = frameOverride || A.Wallet.activeFrame();
    const name = S().user.name || 'Sen';
    const inner = `<div class="ava" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px;background:linear-gradient(135deg,#7b5cff,#c86bff)">${esc(name.charAt(0))}</div>`;
    if (!f) return inner;
    return `<div class="uava" style="width:${size}px;height:${size}px"><i class="ring" style="background:${f.ring}"></i>${inner}<span class="fdeco" style="font-size:${Math.round(size * 0.34)}px">${f.deco}</span></div>`;
  }

  // Kullanıcının adı (VIP rozeti ve renkli isim)
  function userName() {
    const v = A.Wallet.vip().lv;
    const name = esc(S().user.name || 'İsimsiz');
    const colored = A.Wallet.hasPerk('color') ? `<span class="rainbow">${name}</span>` : name;
    return `${colored}${A.Wallet.hasPerk('badge') ? ` <span class="vip-badge">VIP${v}</span>` : ''}`;
  }

  function relChip(c) {
    const rel = A.RELATIONS[(S().relations || {})[c.id]];
    return rel ? `<span class="chip" style="background:${rel.color};color:#fff">💞 ${rel.tag}</span>` : '';
  }

  function moodInfo(c) {
    const cur = A.Mood.current(c);
    const lab = A.Mood.label(cur.values);
    return { cur, lab, meta: A.Mood.LABELS[lab] };
  }

  function moodChip(c) {
    const { meta } = moodInfo(c);
    return `<span class="chip mood" style="background:${meta.color}">${meta.emoji} ${meta.name}</span>`;
  }

  function fmtTime(ts) {
    const d = new Date(ts), now = new Date();
    const hm = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return hm;
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')} ${hm}`;
  }

  const chatOf = c => (S().chats[c.id] = S().chats[c.id] || []);
  const lastMsg = c => { const m = S().chats[c.id]; return m && m.length ? m[m.length - 1] : null; };
  const totalUnread = () => Object.values(S().unread).reduce((a, b) => a + (b || 0), 0);

  function updateBadge() {
    const n = totalUnread();
    const b = $('#navBadge');
    b.hidden = !n;
    b.textContent = n > 99 ? '99+' : n;
  }

  function toast(c, text) {
    const el = document.createElement('button');
    el.className = 'toast';
    el.innerHTML = `${avatar(c, 40, { dot: false })}<div class="info"><b>${esc(c.name)}</b><span>${esc(text)}</span></div>`;
    el.onclick = () => { location.hash = `#/chat/${c.id}`; el.remove(); };
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  /* ---------- Yönlendirme ---------- */
  function parseRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const [name = 'home', id, extra] = parts;
    return { name, id, extra };
  }

  function render() {
    if (!A.Store.account()) return renderAuth();
    const r = ui.route = parseRoute();
    const c = r.id ? A.byId(r.id) : null;
    const full = ['p', 'chat', 'create', ...(A.FULL_PAGES || [])].includes(r.name) || (r.name === 'mood' && c);
    app.classList.toggle('no-nav', full);
    document.querySelectorAll('.nav a').forEach(a => a.classList.toggle('active', a.dataset.tab === r.name && !full));
    updateBadge();
    document.querySelectorAll('.sheet-wrap, .lightbox').forEach(el => el.remove());
    window.scrollTo(0, 0);

    // id bir karakter değilse (ör. #/game/slot) sayfa kendisi karar verir
    if (r.id && !c && !(A.Pages && A.Pages[r.name])) { location.hash = '#/home'; return; }
    if (A.Pages && A.Pages[r.name]) return A.Pages[r.name](r);
    switch (r.name) {
      case 'messages': return renderMessages();
      case 'mood': return c ? renderMoodEditor(c) : renderMoodList();
      case 'me': return renderMe();
      case 'p': return renderProfile(c);
      case 'chat': return renderChat(c);
      case 'create': return renderCreate();
      default: return renderHome();
    }
  }

  /* ---------- Ana sayfa ---------- */
  function renderHome() {
    const tabs = [['recommended', 'Önerilen'], ['online', 'Çevrimiçi'], ['new', 'Yeni'], ['popular', 'Popüler']];
    let list = [...chars()];
    if (ui.homeTab === 'online') list = list.filter(A.Mood.isOnline);
    if (ui.homeTab === 'new') list.sort((a, b) => b.joined.localeCompare(a.joined));
    if (ui.homeTab === 'popular') list.sort((a, b) => b.followers - a.followers);
    if (ui.homeTab === 'recommended') {
      // Ruh hali iyi ve çevrimiçi olanlar üstte
      const score = c => { const v = A.Mood.current(c).values; return (A.Mood.isOnline(c) ? 1 : 0) + v.valence + v.social; };
      list.sort((a, b) => score(b) - score(a));
    }
    const f = ui.filter;
    const filtered = f.min > 18 || f.max < 99 || f.city || f.online;
    list = list.filter(c => c.age >= f.min && c.age <= f.max && (!f.city || c.city === f.city) && (!f.online || A.Mood.isOnline(c)));

    view.innerHTML = `
      <div class="page-pad home ${window.scrollY > 120 ? 'compact' : ''}">
        <div class="home-top">
          <div class="banners">
            <a class="banner gold" href="#/rewards"><b>Ödüller</b><small>${A.Wallet.claimableCount()} ödül alınabilir</small><span class="art">🪙</span></a>
            <button class="banner green" data-act="mood"><b>Ruh hali</b><small>herkes nasıl?</small><span class="art">💗</span></button>
          </div>
          <div class="tabs-row">
            <div class="tabs">
              ${tabs.map(([k, t]) => `<button data-tab="${k}" class="${ui.homeTab === k ? 'active' : ''}">${t}</button>`).join('')}
            </div>
            <button class="tab-tool ${filtered ? 'on' : ''}" data-act="filter" aria-label="Filtre"><svg viewBox="0 0 24 24"><path d="M4 5h13l-5 6.5V18l-3 1.5v-8z"/><path d="M15 15h5M15 18.5h5"/></svg></button>
            <button class="tab-tool" data-act="rank" aria-label="Sıralama">🏆</button>
          </div>
        </div>
        <div class="list">
          ${list.length ? list.map(homeRow).join('') : `<div class="empty"><span class="big">😴</span>${!chars().length ? 'Henüz karakter yok.<br><a href="#/create" style="color:var(--pink)">Bir tane oluştur ✨</a>' : filtered ? 'Filtreye uyan kimse yok' : 'Şu an kimse çevrimiçi değil'}</div>`}
        </div>
      </div>`;

    view.querySelectorAll('.tabs button').forEach(b => b.onclick = () => { ui.homeTab = b.dataset.tab; renderHome(); });
    view.querySelector('[data-act=mood]').onclick = () => { location.hash = '#/mood'; };
    view.querySelector('[data-act=filter]').onclick = filterSheet;
    view.querySelector('[data-act=rank]').onclick = rankSheet;
    view.querySelectorAll('.row').forEach(row => row.onclick = e => {
      const id = row.dataset.id;
      if (e.target.closest('.hi-btn')) {
        const c = A.byId(id);
        if (!chatOf(c).length && !sendUser(c, 'Selam 👋')) return;
        location.hash = `#/chat/${id}`;
      } else {
        ui.profileTab = 'profile';
        location.hash = `#/p/${id}`;
      }
    });
  }

  function homeRow(c) {
    const started = chatOf(c).length > 0;
    return `
      <div class="row" data-id="${c.id}" role="button" tabindex="0">
        ${avatar(c, 80)}
        <div class="info">
          <div class="name">${esc(c.display)}</div>
          <div class="chips">
            <span class="chip sex">♀</span>
            <span class="chip flag">🇹🇷</span>
            <span class="chip">${esc(c.city)}</span>
            <span class="chip">${c.age}yş</span>
            <span class="chip">${c.height}cm</span>
            <span class="chip">${esc(c.job)}</span>
          </div>
          <div class="bio">${esc(c.bio)}</div>
        </div>
        <button class="hi-btn ${started ? 'msg' : 'hi'}" aria-label="Mesaj">${started ? ICON.chat : 'Hi'}</button>
      </div>`;
  }

  // Yukarı kaydırınca banner'lar küçülür (eşik aralığı titremeyi önler)
  window.addEventListener('scroll', () => {
    const h = $('.home');
    if (!h) return;
    if (window.scrollY > 120) h.classList.add('compact');
    else if (window.scrollY < 20) h.classList.remove('compact');
  }, { passive: true });

  function filterSheet() {
    const f = ui.filter;
    const cities = [...new Set(chars().map(c => c.city))].sort((a, b) => a.localeCompare(b, 'tr'));
    const ages = Array.from({ length: 82 }, (_, i) => i + 18);
    const opts = (list, sel) => list.map(v => `<option ${v === sel ? 'selected' : ''}>${v}</option>`).join('');
    const sh = A.Eco.sheet(`
      <div class="sheet-grip"></div>
      <h3>Filtre</h3>
      <div class="flt-row"><span>Yaş</span><select id="fMin">${opts(ages, f.min)}</select><em>–</em><select id="fMax">${opts(ages, f.max)}</select></div>
      <div class="flt-row"><span>Şehir</span><select id="fCity"><option value="">Hepsi</option>${cities.map(c => `<option ${c === f.city ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div>
      <label class="flt-row"><span>Sadece çevrimiçi</span><input type="checkbox" id="fOn" ${f.online ? 'checked' : ''}></label>
      <div class="flt-btns"><button class="btn ghost" id="fReset">Sıfırla</button><button class="btn pink" id="fApply">Uygula</button></div>`, 'light');
    const $s = sel => sh.el.querySelector(sel);
    $s('#fReset').onclick = () => { ui.filter = { min: 18, max: 99, city: '', online: false }; sh.close(); renderHome(); };
    $s('#fApply').onclick = () => {
      const a = +$s('#fMin').value, b = +$s('#fMax').value;
      ui.filter = { min: Math.min(a, b), max: Math.max(a, b), city: $s('#fCity').value, online: $s('#fOn').checked };
      sh.close();
      renderHome();
    };
  }

  // Hediye sıralaması: en çok hediye alanlar
  function rankSheet() {
    const score = c => c.gifts + A.Wallet.receivedCount(c.id);
    const top = [...chars()].sort((a, b) => score(b) - score(a)).slice(0, 20);
    const medal = i => ['🥇', '🥈', '🥉'][i] || `<b>${i + 1}</b>`;
    const sh = A.Eco.sheet(`
      <div class="sheet-grip"></div>
      <h3>🏆 Hediye Sıralaması</h3>
      ${top.map((c, i) => `<button class="c-row rank" data-p="${c.id}"><span class="medal">${medal(i)}</span>${avatar(c, 48)}
        <div class="info"><div class="name">${esc(c.display)}</div><div class="chips"><span class="chip">${esc(c.city)}</span></div></div>
        <span class="chip gift">🎁 ${score(c).toLocaleString('tr-TR')}</span></button>`).join('')}`, 'light');
    sh.el.onclick = e => { const r = e.target.closest('[data-p]'); if (r) { sh.close(); location.hash = `#/p/${r.dataset.p}`; } };
  }

  /* ---------- Mesajlar ---------- */
  // Geniş ekranda (≥1024px) mesaj listesi ve sohbet yan yana
  const wideMQ = window.matchMedia('(min-width: 1024px)');
  const wide = () => wideMQ.matches;

  function msgRowsHtml(activeId) {
    let list = chars().filter(c => chatOf(c).length);
    if (ui.msgFilter === 'unread') list = list.filter(c => S().unread[c.id] || c.id === activeId);
    if (ui.msgFilter === 'online') list = list.filter(c => A.Mood.isOnline(c) || c.id === activeId);
    // Sabitlenenler en üstte (sabitlenme sırasıyla), diğerleri son mesaja göre
    const pins = pinned();
    list.sort((a, b) => {
      const pa = pins.indexOf(a.id), pb = pins.indexOf(b.id);
      if (pa !== -1 || pb !== -1) return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
      return (lastMsg(b)?.ts || 0) - (lastMsg(a)?.ts || 0);
    });
    return list.length ? list.map(c => msgRow(c, c.id === activeId)).join('')
      : '<div class="empty"><span class="big">💌</span>Henüz mesaj yok.<br>Ana sayfadan birine “Hi” de!</div>';
  }

  /* ---------- Sohbet sabitleme (en fazla 4) ---------- */
  const MAX_PINS = 4;
  const pinned = () => (S().pinned = (S().pinned || []).filter(id => A.byId(id)));
  const isPinned = id => pinned().includes(id);

  function togglePin(id) {
    const pins = pinned();
    if (pins.includes(id)) {
      S().pinned = pins.filter(x => x !== id);
      A.Eco.notify('Sabitleme kaldırıldı', '📌');
    } else {
      if (pins.length >= MAX_PINS) { A.Eco.notify(`En fazla ${MAX_PINS} sohbet sabitlenebilir`, '📌'); return; }
      pins.push(id);
      A.Eco.notify('Sohbet en üste sabitlendi', '📌');
    }
    A.Store.save();
    const hint = $('.pin-hint');
    if (hint) hint.textContent = `📌 Sabitlemek için sohbete basılı tut ya da sağ tıkla · ${pinned().length}/${MAX_PINS}`;
    const rows = $('#msgRows');
    if (rows) { rows.innerHTML = msgRowsHtml(ui.route.name === 'chat' ? ui.route.id : null); bindRows(rows.closest('.split-list') || view); }
  }

  // Basılı tutunca / sağ tıklayınca açılan sohbet işlemleri
  function rowActions(id) {
    const c = A.byId(id);
    const pinnedNow = isPinned(id);
    const sh = A.Eco.sheet(`
      <div class="sheet-grip"></div>
      <div class="row-act-head">${avatar(c, 44, { dot: false })}<b>${esc(c.display)}</b></div>
      <button class="act" data-act="pin">📌 ${pinnedNow ? 'Sabitlemeyi kaldır' : `En üste sabitle <small>(${pinned().length}/${MAX_PINS})</small>`}</button>
      <button class="act" data-act="read">✓ Okundu olarak işaretle</button>
      <button class="act" data-act="profile">👤 Profili gör</button>
      <button class="act danger" data-act="delete">🗑️ Sohbeti sil</button>`, 'light');
    sh.el.onclick = e => {
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (!a) return;
      sh.close();
      if (a === 'pin') togglePin(id);
      if (a === 'read') { S().unread[id] = 0; A.Store.save(); refresh(c); }
      if (a === 'profile') location.hash = `#/p/${id}`;
      if (a === 'delete' && confirm(`${c.name} ile sohbet silinsin mi?`)) {
        S().chats[id] = []; S().unread[id] = 0; S().pinned = pinned().filter(x => x !== id); A.Store.save();
        if (ui.route.name === 'chat' && ui.route.id === id) location.hash = '#/messages'; else render();
      }
    };
  }

  function messagesPanel(activeId) {
    const tabs = [['contacts', 'Rehber'], ['msg', 'Mesaj'], ['calls', 'Arama']];
    const filters = [['all', 'Tümü'], ['unread', 'Okunmamış'], ['online', 'Çevrimiçi']];
    const head = `<div class="page-pad"><div class="tabs msg-tabs">
      ${tabs.map(([k, t]) => `<button data-mt="${k}" class="${ui.msgTab === k ? 'active' : ''}">${t}</button>`).join('')}
    </div></div>`;
    if (ui.msgTab === 'contacts') return `<div class="msg-panel">${head}${contactsHtml()}</div>`;
    if (ui.msgTab === 'calls') return `<div class="msg-panel">${head}${callsHtml()}</div>`;
    return `<div class="msg-panel">${head}
      <div class="page-pad"><div class="tabs sub-tabs">
        ${filters.map(([k, t]) => `<button data-f="${k}" class="${ui.msgFilter === k ? 'active' : ''}">${t}</button>`).join('')}
      </div></div>
      ${!S().user.name ? '<a class="notice" href="#/me" style="display:block">Adını yazarsan kızlar sana adınla hitap eder ✨</a>' : ''}
      <div class="pin-hint">📌 Sabitlemek için sohbete basılı tut ya da sağ tıkla · ${pinned().length}/${MAX_PINS}</div>
      <div class="list" id="msgRows">${msgRowsHtml(activeId)}</div></div>`;
  }

  /* ---------- Rehber ---------- */
  // Seni tanıyacak kadar yakınlaşanlar (Lv.2+) seni takip eder
  const followsMe = c => A.Engine.level(c).lv >= 2;
  const contactGroups = () => {
    const rel = S().relations || {};
    return [
      ['friends', 'Dostluk', chars().filter(c => rel[c.id])],
      ['fans', 'Beni Takip Edenler', chars().filter(followsMe)],
      ['following', 'Takip Ettiklerim', chars().filter(c => S().follows[c.id])],
      ['mutual', 'Karşılıklı Takip', chars().filter(c => S().follows[c.id] && followsMe(c))]
    ];
  };
  const giftCount = c => Object.values((S().giftsReceived || {})[c.id] || {}).reduce((a, b) => a + b, 0);

  function contactsHtml() {
    const filters = [['all', 'Tümü'], ['gift', 'Hediye gönderdiklerim'], ['online', 'Çevrimiçi']];
    let list = chars().filter(c => chatOf(c).length || S().affinity[c.id]);
    if (ui.contactFilter === 'gift') list = list.filter(giftCount);
    if (ui.contactFilter === 'online') list = list.filter(A.Mood.isOnline);
    const aff = c => S().affinity[c.id] || 0;
    list.sort((a, b) => (A.Mood.isOnline(b) - A.Mood.isOnline(a)) || (ui.contactAsc ? aff(a) - aff(b) : aff(b) - aff(a)));
    return `
      <div class="c-groups">${contactGroups().map(([k, t, l]) => `<button class="c-group" data-g="${k}"><span>${t}</span><b>${l.length}</b><i>›</i></button>`).join('')}</div>
      <div class="c-head"><b>Yakınlık <small>(${list.length})</small></b><button id="cSort" aria-label="Sırala">⇅</button></div>
      <div class="c-filters">${filters.map(([k, t]) => `<button data-cf="${k}" class="${ui.contactFilter === k ? 'active' : ''}">${t}</button>`).join('')}</div>
      <div class="c-note">Şu anda çevrimiçi kullanıcılar önceliklidir</div>
      <div class="list">${list.length ? list.map(c => {
        const mine = chatOf(c).filter(m => m.from === 'me').length, g = giftCount(c);
        return `<button class="c-row" data-chat="${c.id}">${avatar(c, 56)}
          <div class="info"><div class="name">${esc(c.display)}</div>
            <div class="chips"><span class="chip sex">💬 ${mine}</span>${g ? `<span class="chip gift">🎁 ${g}</span>` : ''}${relChip(c)}</div></div>
          <span class="chip lv">♥ Lv.${A.Engine.level(c).lv}</span></button>`;
      }).join('') : '<div class="empty"><span class="big">💞</span>Henüz kimseyle yakınlaşmadın</div>'}</div>`;
  }

  function contactSheet(key) {
    const [, title, list] = contactGroups().find(g => g[0] === key);
    const sh = A.Eco.sheet(`
      <div class="sheet-grip"></div><h3>${title} <small>(${list.length})</small></h3>
      ${list.length ? list.map(c => `<button class="c-row" data-p="${c.id}">${avatar(c, 48)}
        <div class="info"><div class="name">${esc(c.display)}</div><div class="chips"><span class="chip">${esc(c.city)}</span><span class="chip">${c.age}yş</span></div></div>
        <span class="chip lv">♥ Lv.${A.Engine.level(c).lv}</span></button>`).join('')
        : `<div class="empty">${key === 'fans' ? 'Biriyle biraz yazışınca seni takip etmeye başlar' : 'Burada henüz kimse yok'}</div>`}`, 'light');
    sh.el.onclick = e => { const r = e.target.closest('[data-p]'); if (r) { sh.close(); location.hash = `#/p/${r.dataset.p}`; } };
  }

  /* ---------- Arama geçmişi ---------- */
  function callsHtml() {
    const list = A.Call ? A.Call.calls() : [];
    const hint = '<p class="call-hint">💬 Açmıyor mu? Önce mesajla <b>"arayabilir miyim?"</b> diye sor. "Olur" derse 10 dakika içinde araman kesin açılır, <b>"beni ara"</b> dersen o seni arar.</p>';
    if (!list.length) return `<div class="empty"><span class="big">📞</span>Henüz arama yok.<br>Sohbette 📞 ya da 📹 ile arayabilirsin.</div>${hint}`;
    return `${hint}<div class="list">${list.map(e => {
      const c = A.byId(e.id);
      const bad = e.dir === 'in' && e.status !== 'done';
      const ok = A.Call.permitLeft(c);
      return `<div class="call-row" data-chat="${c.id}">${avatar(c, 64, { dot: false })}
        <div class="info"><div class="name">${esc(c.display)}</div>
          <div class="st ${bad ? 'bad' : ''}">${e.dir === 'in' ? '↙' : '↗'} ${esc(A.Call.label(e))}</div>
          ${ok ? `<small class="call-ok">${ok.type === 'video' ? '📹' : '📞'} Aramanı bekliyor · ${ok.min} dk</small>` : `<small>${fmtTime(e.ts)}</small>`}</div>
        <button class="call-btn ask" data-ask="${c.id}" aria-label="Mesajla aramak için izin iste">💬</button>
        <button class="call-btn" data-call="voice" data-id="${c.id}" aria-label="Sesli ara">${A.Call.ICON.phone}</button>
        <button class="call-btn" data-call="video" data-id="${c.id}" aria-label="Görüntülü ara">${A.Call.ICON.video}</button></div>`;
    }).join('')}</div>`;
  }

  function bindMessagesPanel(root, activeId) {
    const redraw = () => { root.innerHTML = messagesPanel(activeId); bindMessagesPanel(root, activeId); };
    root.querySelectorAll('[data-mt]').forEach(b => b.onclick = () => { ui.msgTab = b.dataset.mt; redraw(); });
    root.querySelectorAll('[data-cf]').forEach(b => b.onclick = () => { ui.contactFilter = b.dataset.cf; redraw(); });
    root.querySelectorAll('[data-g]').forEach(b => b.onclick = () => contactSheet(b.dataset.g));
    const sort = root.querySelector('#cSort');
    if (sort) sort.onclick = () => { ui.contactAsc = !ui.contactAsc; redraw(); };
    root.querySelectorAll('[data-chat]').forEach(r => r.onclick = e => {
      const call = e.target.closest('[data-call]');
      const ask = e.target.closest('[data-ask]');
      if (call) A.Call.start(A.byId(call.dataset.id), call.dataset.call);
      else if (ask) {
        location.hash = `#/chat/${ask.dataset.ask}`;
        setTimeout(() => sendUser(A.byId(ask.dataset.ask), pickRaw(ASK_CALL)), 300);
      } else location.hash = `#/chat/${r.dataset.chat}`;
    });
    root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => {
      ui.msgFilter = b.dataset.f;
      root.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('active', x === b));
      $('#msgRows').innerHTML = msgRowsHtml(activeId);
      bindRows(root);
    });
    bindRows(root);
  }
  function bindRows(root) {
    root.querySelectorAll('.msg-row').forEach(r => {
      let timer = null, long = false;
      const cancel = () => clearTimeout(timer);
      r.onpointerdown = () => { long = false; timer = setTimeout(() => { long = true; rowActions(r.dataset.id); }, 500); };
      r.onpointerup = cancel;
      r.onpointerleave = cancel;
      r.onpointercancel = cancel;
      r.oncontextmenu = e => { e.preventDefault(); cancel(); long = true; rowActions(r.dataset.id); };
      r.onclick = () => { if (long) { long = false; return; } location.hash = `#/chat/${r.dataset.id}`; };
    });
  }

  function renderMessages() {
    if (wide()) {
      view.innerHTML = `<div class="split"><aside class="split-list">${messagesPanel(null)}</aside>
        <section class="split-empty"><span>💌</span><b>Bir sohbet seç</b><small>Soldaki listeden birine tıkla ya da ana sayfadan yeni biriyle tanış.</small></section></div>`;
      bindMessagesPanel($('.split-list'), null);
      return;
    }
    view.innerHTML = messagesPanel(null);
    bindMessagesPanel(view, null);
  }

  function msgRow(c, active) {
    const last = lastMsg(c);
    const lv = A.Engine.level(c);
    const text = typing[c.id] ? 'yazıyor…' : (last.from === 'me' ? 'Sen: ' : '') + last.text;
    return `
      <button class="msg-row ${active ? 'active' : ''} ${isPinned(c.id) ? 'pinned' : ''}" data-id="${c.id}">
        ${avatar(c, 62, { unread: S().unread[c.id] })}
        <div class="info">
          <div class="top"><span class="name">${esc(c.name)}</span><span class="time">${isPinned(c.id) ? '<span class="pin">📌</span>' : ''}${fmtTime(last.ts)}</span></div>
          <div class="bottom">
            <div class="last ${typing[c.id] ? 'typing' : ''}">${esc(text)}</div>
            <span class="chip lv">♥ Lv.${lv.lv}</span>
          </div>
        </div>
      </button>`;
  }

  /* ---------- Profil ---------- */
  function renderProfile(c) {
    const { meta, cur } = moodInfo(c);
    const online = A.Mood.isOnline(c);
    const followed = !!S().follows[c.id];
    const tabs = [['profile', 'Profil'], ['album', 'Albüm'], ['moments', 'Anlar'], ['gifts', 'Hediyeler']];
    const grad = `linear-gradient(135deg,${c.colors[0]},${c.colors[1]})`;
    A.Wallet.track('visit', c.id);

    view.innerHTML = `<div class="profile">
      <div class="cover" style="background:${grad}">
        ${c.cover ? `<img class="cover-bg" src="${esc(c.cover)}" alt="" aria-hidden="true"><img class="cover-fg" src="${esc(c.cover)}" alt="" data-zoom="0">` : ''}
      </div>
      <a class="round-btn left" href="#/home" aria-label="Geri">${ICON.back}</a>
      <a class="round-btn right" href="#/mood/${c.id}" aria-label="Ruh hali">${ICON.more}</a>

      <div class="pcard">
        ${avatar(c, 96, { deco: true })}
        <div class="pname">${esc(c.display)} <span class="online-pill ${presence(c).cls}">● ${esc(presence(c).text)}</span></div>
        <div class="pbio">${esc(c.bio)}</div>
        ${forceBtn(c)}
        <div class="chips">
          <span class="chip sex">♀ ${c.age}</span>
          <span class="chip loc">📍 ${esc(c.city)}</span>
          <span class="chip zod">✦ ${esc(c.zodiac)}</span>
          <span class="chip arch">${c.emoji} ${esc(c.archLabel)}</span>
          <span class="chip lv">♥ Lv.${A.Engine.level(c).lv}</span>
          ${relChip(c)}
        </div>
        <div class="stats">
          <div><b>${c.followers + (followed ? 1 : 0)}</b><span>Takipçi</span></div>
          <div><b>${c.following}</b><span>Takip et</span></div>
          <div><b>${c.gifts + A.Wallet.receivedCount(c.id)}</b><span>Hediye</span></div>
        </div>
      </div>

      <a class="mood-strip" href="#/mood/${c.id}">
        <span class="em">${meta.emoji}</span>
        <span class="txt"><b>Şu an: ${meta.name}</b><small>valence ${cur.values.valence.toFixed(2)} · arousal ${cur.values.arousal.toFixed(2)}${cur.locked ? ' · 🔒' : ''}</small></span>
        <span class="chip">Ayarla ›</span>
      </a>

      <div class="sheet-body">
        <div class="tabs dark">
          ${tabs.map(([k, t]) => `<button data-t="${k}" class="${ui.profileTab === k ? 'active' : ''}">${t}</button>`).join('')}
        </div>
        <div id="ptab">${profileTab(c)}</div>
      </div>

      <div class="cta-bar">
        <button class="follow ${followed ? 'on' : ''}" aria-label="Takip">${followed ? '💗' : '🤍'}</button>
        <a class="btn primary" href="#/chat/${c.id}">💬 mesaj gönder</a>
      </div></div>`;

    view.querySelectorAll('[data-t]').forEach(b => b.onclick = () => {
      ui.profileTab = b.dataset.t;
      view.querySelectorAll('[data-t]').forEach(x => x.classList.toggle('active', x === b));
      $('#ptab').innerHTML = profileTab(c);
    });
    $('.profile', view).addEventListener('click', e => {
      const z = e.target.closest('[data-zoom]');
      if (z) lightbox(c.album.length ? c.album : [c.cover], +z.dataset.zoom);
      if (e.target.closest('#delChar') && confirm(`${c.name} silinsin mi? Sohbet ve ruh hali geçmişi de silinir.`)) {
        A.Gen.remove(c.id);
        location.hash = '#/home';
      }
    });
    $('.follow', view).onclick = () => {
      S().follows[c.id] = !S().follows[c.id];
      if (S().follows[c.id]) A.Mood.nudge(c, { valence: 0.05 });
      A.Store.save();
      renderProfile(c);
    };
    window.scrollTo(0, 0);
  }

  function profileTab(c) {
    const grad = (i) => `linear-gradient(${135 + i * 30}deg,${c.colors[0]},${c.colors[1]})`;
    if (ui.profileTab === 'album') {
      if (!c.album.length) return '<div class="empty">Albüm boş</div>';
      return `<div class="album">${c.album.map((src, i) => `<div style="background:${grad(i)}"><img src="${esc(src)}" alt="" loading="lazy" data-zoom="${i}"></div>`).join('')}</div>`;
    }
    if (ui.profileTab === 'gifts') {
      const rec = Object.entries((S().giftsReceived || {})[c.id] || {})
        .map(([id, n]) => ({ g: A.Wallet.giftById(id), n })).filter(x => x.g)
        .sort((a, b) => b.g.price - a.g.price);
      const total = rec.reduce((a, x) => a + x.g.price * x.n, 0);
      return `
        <div class="gift-wall-head"><b>Senden aldığı hediyeler</b><small>Toplam değer: ${total.toLocaleString('tr-TR')} coin</small></div>
        ${rec.length ? `<div class="gift-wall">${rec.map(x => `<div><span>${x.g.e}</span><b>${esc(x.g.name)}</b><small>x${x.n}</small></div>`).join('')}</div>`
          : '<div class="empty"><span class="big">🎁</span>Henüz hediye göndermedin</div>'}
        <a class="btn pink block" href="#/chat/${c.id}/gift" style="margin-top:14px">🎁 Hediye gönder</a>`;
    }
    if (ui.profileTab === 'moments') {
      if (!c.posts.length) return '<div class="empty">Henüz paylaşım yok</div>';
      return c.posts.map((p, i) => `
        <div class="post">
          <div class="p-head">${avatar(c, 44, { dot: false })}<div><b>${esc(c.display)}</b><small>${p.date}</small></div></div>
          <p>${esc(p.text)}</p>
          ${p.photo ? `<div class="p-img" style="background:${grad(i)}"><img src="${esc(p.photo)}" alt="" loading="lazy" data-zoom="${Math.max(0, c.album.indexOf(p.photo))}"></div>` : ''}
        </div>`).join('');
    }
    const traits = [['O', 'Deneyime açıklık'], ['C', 'Sorumluluk'], ['E', 'Dışa dönüklük'], ['A', 'Uyumluluk'], ['N', 'Duygusal hassasiyet']];
    const huys = (A.TRAITS || []).filter(t => (c.traits || []).includes(t.id));
    return `
      <div class="sec-title" style="margin-top:4px">Doğrulama</div>
      <div class="verify"><div class="v1">✔ Gerçek kişi doğrulaması</div><div class="v2">♀ Cinsiyet doğrulaması</div></div>
      <div class="sec-title">Profil</div>
      <div class="info-row"><span>🏠 Memleket</span><b>Türkiye ${esc(c.city)}, ${esc(c.district)}</b></div>
      <div class="info-row"><span>📏 Boy</span><b>${c.height}cm</b></div>
      <div class="info-row"><span>⚖️ Ağırlık</span><b>${c.weight}kg</b></div>
      <div class="info-row"><span>💼 Meslek</span><b>${esc(c.job)}</b></div>
      <div class="info-row"><span>✦ Burç</span><b>${esc(c.zodiac)}</b></div>
      <div class="sec-title">Sevdikleri</div>
      <div class="chips">${c.likes.map(l => `<span class="chip">💜 ${esc(l)}</span>`).join('')}</div>
      <div class="sec-title">Sevmedikleri</div>
      <div class="chips">${c.dislikes.map(l => `<span class="chip">✖ ${esc(l)}</span>`).join('')}</div>
      ${huys.length ? `<div class="sec-title">Huyları</div>
      <div class="chips">${huys.map(t => `<span class="chip" title="${esc(t.desc)}">${t.icon} ${esc(t.label)}</span>`).join('')}</div>` : ''}
      <div class="sec-title">Kişilik (Big Five)</div>
      ${traits.map(([k, t]) => `
        <div class="trait"><div class="t-top"><span>${t}</span><span>${Math.round(c.big5[k] * 100)}</span></div>
        <div class="bar"><i style="width:${c.big5[k] * 100}%"></i></div></div>`).join('')}
      <button class="btn ghost block" id="delChar" style="margin-top:22px;color:#ff2d55">Karakteri sil</button>`;
  }

  /* ---------- Fotoğraf görüntüleyici ---------- */
  function lightbox(list, start = 0) {
    let i = start;
    const el = document.createElement('div');
    el.className = 'lightbox';
    const draw = () => {
      el.innerHTML = `
        <img src="${esc(list[i])}" alt="">
        ${list.length > 1 ? `<button class="lb-nav prev" aria-label="Önceki">‹</button><button class="lb-nav next" aria-label="Sonraki">›</button>
        <div class="lb-count">${i + 1} / ${list.length}</div>` : ''}
        <button class="lb-close" aria-label="Kapat">✕</button>`;
    };
    el.onclick = e => {
      if (e.target.closest('.prev')) { i = (i - 1 + list.length) % list.length; draw(); return; }
      if (e.target.closest('.next')) { i = (i + 1) % list.length; draw(); return; }
      el.remove();
    };
    // kaydırarak geçiş
    let x0 = null;
    el.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', e => {
      if (x0 === null || list.length < 2) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) { i = (i + (dx < 0 ? 1 : -1) + list.length) % list.length; draw(); }
      x0 = null;
    });
    draw();
    document.body.appendChild(el);
  }

  /* ---------- Sohbet ---------- */
  function renderChat(c) {
    S().unread[c.id] = 0;
    A.Store.save();
    const lv = A.Engine.level(c);
    const { meta } = moodInfo(c);
    const quick = [...A.QUICK_REPLIES].sort(() => Math.random() - 0.5).slice(0, 6);

    const chatHtml = `
      <div class="chat">
        <div class="chat-head">
          <a class="icon-btn" href="#/messages" aria-label="Geri">${ICON.arrowLeft}</a>
          <a class="who" href="#/p/${c.id}">
            ${avatar(c, 40)}
            <div><b>${esc(c.display)}</b><small id="chatStatus" class="${presence(c).cls}">${esc(presence(c).text)}</small></div>
          </a>
          <a class="couple" href="#/p/${c.id}">
            <span class="heart">💗<small>LV ${lv.lv}</small></span>
            ${userAvatar(32)}
          </a>
          <button class="icon-btn" id="moreBtn" aria-label="Menü">${ICON.more}</button>
        </div>

        <div class="hcard">
          ${avatar(c, 58, { deco: true })}
          <div class="info">
            <div class="nm">${esc(c.name.toLocaleUpperCase('tr').split('').join(' '))}</div>
            <div class="meta">${c.age} | ${c.height}cm | ${esc(c.zodiac)} | ${esc(c.job)}</div>
            ${relChip(c) ? `<div style="margin-top:4px">${relChip(c)}</div>` : ''}
            <div class="lvbar">${lvbarInner(lv)}</div>
            ${c.album.length > 1 ? `<div class="thumbs">${c.album.slice(1, 5).map((s, i) => `<img src="${esc(s)}" alt="" data-zoom="${i + 1}">`).join('')}</div>` : ''}
          </div>
          <a class="mood-btn" href="#/mood/${c.id}" id="moodBtn">${meta.emoji}<small>${meta.name}</small></a>
        </div>

        <div class="msgs" id="msgs"></div>

        <div id="forceBar">${forceBtn(c)}</div>
        <div class="quick" id="quick">${quick.map(q => `<button>${esc(q)}</button>`).join('')}</div>
        <form class="composer" id="composer" autocomplete="off">
          <input id="msgInput" type="text" placeholder="Bir şey söyle · ${MSG_COST} ♥" enterkeyhint="send" maxlength="300">
          <button class="send-btn" type="submit" aria-label="Gönder">${ICON.send}</button>
        </form>
        <div class="chat-tools" id="chatTools">
          <button type="button" id="giftBtn" aria-label="Hediye gönder"><span>🎁</span>Hediye</button>
          <button type="button" data-call="video" aria-label="Görüntülü ara"><span>📹</span>Görüntülü</button>
          <button type="button" data-call="voice" aria-label="Sesli ara"><span>📞</span>Sesli</button>
          <button type="button" data-tool="tasks" aria-label="Yakınlık görevleri"><span>💗</span>Görevler</button>
          <button type="button" data-tool="memory" aria-label="Hakkımda bildikleri"><span>🧠</span>Hafıza</button>
        </div>
      </div>`;

    if (wide()) {
      view.innerHTML = `<div class="split"><aside class="split-list">${messagesPanel(c.id)}</aside>${chatHtml}</div>`;
      bindMessagesPanel($('.split-list'), c.id);
    } else {
      view.innerHTML = chatHtml;
    }

    applyChatTheme(lv);
    drawMessages(c);

    const input = $('#msgInput');
    $('#composer').onsubmit = e => {
      e.preventDefault();
      const t = input.value.trim();
      if (!t) return;
      if (sendUser(c, t)) input.value = '';
      input.focus();
    };
    $('#quick').querySelectorAll('button').forEach(b => b.onclick = () => sendUser(c, b.textContent));
    $('#moreBtn').onclick = e => { e.stopPropagation(); toggleMenu(c); };
    $('.hcard').onclick = e => {
      const z = e.target.closest('[data-zoom]');
      if (z) lightbox(c.album, +z.dataset.zoom);
    };
    const openGifts = () => A.GiftPanel.open(c, r => sendGift(c, r));
    $('#giftBtn').onclick = openGifts;
    $('#chatTools').addEventListener('click', e => {
      const b = e.target.closest('[data-call], [data-tool]');
      if (!b) return;
      if (b.dataset.call) A.Call.start(c, b.dataset.call);
      if (b.dataset.tool === 'tasks') tasksSheet(c);
      if (b.dataset.tool === 'memory') memorySheet(c);
    });
    if (ui.route.extra === 'gift') { history.replaceState(null, '', `#/chat/${c.id}`); ui.route.extra = null; openGifts(); }
  }

  // Arka plan + baloncuk: mağazadan seçilen ya da kalp düzeyiyle açılan
  function applyChatTheme(lv) {
    const el = $('.chat');
    if (!el) return;
    const t = A.Wallet.chatTheme(lv.lv);
    el.className = `chat ${t.bg.cls || ''} bub-${t.bubble.id}`;
    el.style.background = t.bg.css || '';
  }

  // Yakınlık çubuğu: seviye adı, puan (°C) ve sonraki seviyeye ilerleme
  function lvbarInner(lv) {
    const pct = lv.next ? Math.round((lv.pts - lv.prev) / (lv.next - lv.prev) * 100) : 100;
    return `<span>${lv.name} · ${lv.pts}°C</span><div class="bar"><i style="width:${pct}%"></i></div>`;
  }

  // Yakınlık görevleri: seviyeyi nasıl artıracağı ve hangi özelliklerin açıldığı
  function tasksSheet(c) {
    const lv = A.Engine.level(c);
    const pct = lv.next ? Math.round((lv.pts - lv.prev) / (lv.next - lv.prev) * 100) : 100;
    const M = A.Call.MIN_LV;
    const tasks = [
      ['💬', `Mesajlaş · ${MSG_COST} ♥`, 'Her sohbet yakınlığı artırır; onu merak etmek daha çok', true],
      ['🎁', 'Hediye gönder', 'Değerine göre: 10 ♥ ≈ +2°C, 1.000 ♥ ≈ +12°C, 10.000 ♥ ≈ +34°C', true],
      ['📞', `Sesli ara · Lv.${M.voice}`, 'Konuştuğun her dakika +1°C (aramada en fazla 10). Mesajla "arayabilir miyim?" diye sorarsan Lv.' + (M.voice - 1) + "'de de olur", lv.lv >= M.voice - 1],
      ['📹', `Görüntülü ara · Lv.${M.video}`, 'Yakınlaşınca kamerayı açmayı kabul eder. "Görüntülü arayayım mı?" diye sorarsan Lv.' + (M.video - 1) + "'de de olur", lv.lv >= M.video - 1],
      ['📲', 'Seni arasın · Lv.3', 'Keyfi yerindeyse arada bir kendisi arar', lv.lv >= 3],
      ['💖', 'Kalp teması · Lv.4', 'Kalpli baloncuklar ve uçan kalpler arka planı', lv.lv >= 4],
      ['💎', 'Mücevher kalp · Lv.5', 'Sohbete mücevher kalp arka planı gelir', lv.lv >= 5]
    ];
    A.Eco.sheet(`
      <div class="sheet-grip"></div>
      <h3>💗 Yakınlık Görevleri</h3>
      <div class="mem-block">
        <div class="row2"><b>Lv.${lv.lv} ${lv.name}</b><span>${lv.pts}°C${lv.next ? ` / ${lv.next}°C` : ''}</span></div>
        <div class="bar"><i style="width:${pct}%"></i></div>
        <small>${lv.next ? `Sonraki seviyeye ${lv.next - lv.pts}°C kaldı` : 'En yüksek seviyedesiniz 💞'}</small>
      </div>
      ${tasks.map(([i, t, d, ok]) => `<div class="task-row ${ok ? '' : 'locked'}"><span>${i}</span><div><b>${t}</b><small>${d}</small></div><em>${ok ? '✓' : '🔒'}</em></div>`).join('')}`, 'light');
  }

  /* ---------- Hediye ---------- */
  function sendGift(c, r) {
    chatOf(c).push({ from: 'me', type: 'gift', gift: r.delivered.id, qty: r.qty, text: `🎁 ${r.delivered.name} x${r.qty}`, ts: Date.now() });
    if (r.gift.lucky) chatOf(c).push({ from: 'sys', text: `${r.gift.e} ${r.gift.name} açıldı: içinden ${r.delivered.e} ${r.delivered.name} çıktı!`, ts: Date.now() });
    if (r.rel) chatOf(c).push({ from: 'sys', text: `💞 ${c.name} ile artık ${r.rel.title} rozetiniz var`, ts: Date.now() });
    const before = A.Engine.level(c).lv;
    const gain = A.Engine.giftAffinity(c, r.value);
    const lv = A.Engine.level(c);
    chatOf(c).push({ from: 'sys', text: lv.lv > before ? `💗 +${gain}°C yakınlık · Lv.${lv.lv} ${lv.name} oldunuz!` : `💗 +${gain}°C yakınlık`, ts: Date.now() });
    A.Store.save();
    refresh(c);
    if (onChatWith(c)) updateChatHeader(c);
    if (!A.Mood.isOnline(c)) {
      // hediye sosyal pilini biraz doldurur; çevrimiçi olunca teşekkür eder
      A.Mood.nudge(c, { social: 0.15 });
      S().pendingGift = S().pendingGift || {};
      S().pendingGift[c.id] = r;
      S().pending[c.id] = true;
      A.Store.save();
      return;
    }
    reactGift(c, r);
  }

  function reactGift(c, r) {
    if (typing[c.id]) { setTimeout(() => reactGift(c, r), 700); return; }
    clearTimeout(timers[c.id]);
    play(c, A.Engine.giftReact(c, r));
  }

  function toggleMenu(c) {
    const old = $('.menu');
    if (old) { old.remove(); return; }
    const m = document.createElement('div');
    m.className = 'menu';
    m.innerHTML = `
      <button data-a="profile">👤 Profili gör</button>
      <button data-a="pin">📌 ${isPinned(c.id) ? 'Sabitlemeyi kaldır' : 'En üste sabitle'}</button>
      <button data-a="memory">🧠 Hakkımda bildikleri</button>
      <button data-a="mood">💗 Ruh halini ayarla</button>
      <button data-a="clear" class="danger">🗑️ Sohbeti temizle</button>`;
    $('.chat').appendChild(m);
    m.onclick = e => {
      const a = e.target.closest('button')?.dataset.a;
      if (a === 'profile') location.hash = `#/p/${c.id}`;
      if (a === 'memory') memorySheet(c);
      if (a === 'pin') togglePin(c.id);
      if (a === 'mood') location.hash = `#/mood/${c.id}`;
      if (a === 'clear' && confirm(`${c.name} ile sohbet silinsin mi?`)) {
        S().chats[c.id] = []; S().expect[c.id] = null; A.Store.save(); drawMessages(c);
      }
      m.remove();
    };
    setTimeout(() => document.addEventListener('click', function off() { m.remove(); document.removeEventListener('click', off); }), 0);
  }

  // Karakterin senin hakkında bildikleri + ilgisi + bugünkü programı
  function memorySheet(c) {
    const v = A.Interest.get(c);
    const facts = A.Memory.list(c);
    const plan = A.Schedule.today(c);
    const p = presence(c);
    A.Eco.sheet(`
      <div class="sheet-grip"></div>
      <h3>🧠 ${esc(c.name)} hakkında ne biliyor?</h3>
      <div class="mem-block">
        <div class="row2"><b>İlgisi</b><span>${A.Interest.label(v)} · %${Math.round(v * 100)}</span></div>
        <div class="bar"><i style="width:${v * 100}%;background:${v < 0.3 ? '#ef4444' : v < 0.55 ? '#f59e0b' : '#22c55e'}"></i></div>
        <small>Kuru cevaplar, tekrar ve erken buluşma isteği düşürür; onu merak etmek, sorularına cevap vermek ve kendinden bahsetmek artırır.</small>
      </div>
      <div class="mem-block">
        <b>Hatırladıkları</b>
        ${facts.length ? facts.map(([i, k, val]) => `<div class="info-row"><span>${i} ${esc(k)}</span><b>${esc(val)}</b></div>`).join('')
          : '<small>Henüz kendinden bahsetmedin. "İzmirliyim", "25 yaşındayım", "yarın sınavım var", "kahve severim" gibi şeyler yaz.</small>'}
      </div>
      <div class="mem-block">
        <b>Bugünkü programı</b>
        <div class="info-row"><span>📍 Şu an</span><b>${esc(p.text)}</b></div>
        <div class="info-row"><span>💤 Uyku</span><b>${plan.sleep}</b></div>
        ${plan.busy.map(b => `<div class="info-row"><span>⏰ Meşgul</span><b>${esc(b)}</b></div>`).join('') || '<div class="info-row"><span>⏰ Meşgul</span><b>bugün boş</b></div>'}
      </div>`, 'light');
  }

  function drawMessages(c) {
    const box = $('#msgs');
    if (!box) return;
    const msgs = chatOf(c);
    let html = '', prevTs = 0, prevFrom = null;
    msgs.forEach((m, i) => {
      if (m.ts - prevTs > 10 * 60 * 1000) { html += `<div class="stamp">${fmtTime(m.ts)}</div>`; prevFrom = null; }
      if (m.from === 'sys') {
        html += `<div class="sys">${esc(m.text)}</div>`;
      } else if (m.from === 'her') {
        html += `<div class="msg her ${prevFrom === 'her' ? 'cont' : ''}">${avatar(c, 36, { dot: false })}<div class="bubble">${esc(m.text)}</div></div>`;
      } else {
        const answered = msgs.slice(i + 1).some(x => x.from === 'her');
        const g = m.type === 'gift' ? A.Wallet.giftById(m.gift) : null;
        const body = g
          ? `<div class="gift-bubble"><span class="ge">${g.e}</span><div><b>${esc(g.name)}</b><small>x${m.qty} · ${(g.price * m.qty).toLocaleString('tr-TR')} coin</small></div></div>`
          : `<div class="bubble">${esc(m.text)}</div>`;
        html += `<div class="msg me"><span class="seen ${answered || m.seen ? '' : 'wait'}">${ICON.check}</span>${body}</div>`;
      }
      prevTs = m.ts; prevFrom = m.from;
    });
    // Son mesaj seninse ve okunduysa: "Görüldü 21:04"
    const lastReal = [...msgs].reverse().find(m => m.from !== 'sys');
    if (lastReal && lastReal.from === 'me' && lastReal.seen && !typing[c.id]) {
      html += `<div class="seen-label">Görüldü ${fmtTime((S().lastSeen || {})[c.id] || lastReal.ts)}</div>`;
    }
    if (!msgs.length) html = `<div class="sys">${esc(c.name)} ile sohbete başla. İlk mesajı sen at 💌</div>`;
    if (typing[c.id]) html += `<div class="msg her ${prevFrom === 'her' ? 'cont' : ''}">${avatar(c, 36, { dot: false })}<div class="bubble"><span class="typing-dots"><i></i><i></i><i></i></span></div></div>`;
    box.innerHTML = html;
    box.scrollTop = box.scrollHeight;
  }

  const onChatWith = c => ui.route && ui.route.name === 'chat' && ui.route.id === c.id;

  function refresh(c) {
    if (onChatWith(c)) { drawMessages(c); updateStatus(c); }
    const side = $('.split-list');
    const rows = $('#msgRows');
    if (side && rows) {
      // geniş ekran: yan listedeki satırları güncelle (yazıyor…, son mesaj, okunmamış)
      rows.innerHTML = msgRowsHtml(ui.route.name === 'chat' ? ui.route.id : null);
      bindRows(side);
    } else if (ui.route && ui.route.name === 'messages') renderMessages();
    updateBadge();
  }

  function updateStatus(c) {
    const el = $('#chatStatus');
    if (!el) return;
    const p = presence(c);
    el.textContent = p.text;
    el.className = p.cls;
    const fb = $('#forceBar');
    if (fb) fb.innerHTML = forceBtn(c);
  }

  const MSG_COST = 40; // her mesaj bu kadar coin harcar
  const ASK_CALL = ['Müsaitsen arayabilir miyim? 📞', 'Seni arayayım mı? 🙈', 'Sesini duymak istiyorum, arayabilir miyim?'];
  const pickRaw = a => a[Math.floor(Math.random() * a.length)];
  function sendUser(c, text) {
    if (!A.Wallet.spend(MSG_COST, `Mesaj · ${c.name}`)) {
      if (confirm(`Mesaj göndermek için ${MSG_COST} ♥ gerekli. Coin yüklemek ister misin?`)) location.hash = '#/recharge';
      return false;
    }
    chatOf(c).push({ from: 'me', text, ts: Date.now() });
    A.Wallet.track('msg');
    A.Wallet.track('chat', c.id);
    A.Store.save();
    if (!A.Mood.isOnline(c)) {
      markPending(c);
      refresh(c);
      return true;
    }
    refresh(c);
    // Okumak üzere bekliyorsa yeni mesajı da o okuyunca görecek
    if (reading[c.id]) return true;
    // Art arda yazılan mesajları toplayıp tek seferde cevaplasın
    clearTimeout(timers[c.id]);
    timers[c.id] = setTimeout(() => startReply(c), 1100);
    return true;
  }

  function unanswered(c) {
    const out = [];
    const msgs = chatOf(c);
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].from === 'her') break;
      if (msgs[i].from === 'me' && msgs[i].type !== 'gift') out.unshift(msgs[i].text);
    }
    return out;
  }

  function startReply(c, mode) {
    if (typing[c.id] || reading[c.id]) { timers[c.id] = setTimeout(() => startReply(c, mode), 800); return; }
    if (!unanswered(c).length) return;
    // Okumadan önce bekler: meşgulse (derste, nöbette) uzun, ilgisi azaldıysa umursamaz
    const wait = mode === 'back' ? 0 : A.Schedule.replyDelay(c) + A.Interest.delay(c);
    reading[c.id] = true;
    timers[c.id] = setTimeout(() => {
      reading[c.id] = false;
      if (!A.Mood.isOnline(c)) { markPending(c); return; } // beklerken uyudu
      markSeen(c);
      const msgs = unanswered(c); // beklerken yeni mesaj gelmiş olabilir
      if (!msgs.length) return;
      // İlgisini kaybettiyse "Görüldü"de bırakabilir
      if (mode !== 'back' && Math.random() < A.Interest.ignoreChance(c)) { A.Store.save(); refresh(c); return; }
      const r = mode === 'back' ? A.Engine.comeBack(c, msgs, (S().pendingReason || {})[c.id]) : A.Engine.respond(c, msgs);
      play(c, r);
    }, wait);
  }

  /* ---------- Zorla çevrimiçi ----------
   * Uyuyan, meşgul ya da sosyal pili bitmiş karakteri coin karşılığı FORCE_MIN dakika çevrimiçi yapar
   * (schedule.js bu sürede onu boşta sayar). Bekleyen mesaj varsa onlara uyanmış gibi cevap verir. */
  const FORCE_COST = 100, FORCE_MIN = 30;
  function forceInfo(c) {
    const st = A.Schedule.status(c);
    if (st.forced) return null;
    if (st.state === 'sleep') return { reason: 'sleep', text: '😴 Uyuyor' };
    if (!A.Mood.isOnline(c)) return { reason: 'tired', text: '🔋 Sosyal pili bitti, çevrimdışı' };
    if (st.state === 'busy') return { reason: 'busy', text: `⏰ Şu an ${st.status}, geç cevap verir` };
    return null;
  }
  const forceBtn = c => {
    const f = forceInfo(c);
    return f ? `<div class="force-bar"><span>${esc(f.text)}</span><button class="btn pink sm" data-force="${c.id}">⚡ Zorla çevrimiçi yap · ${FORCE_COST} ♥</button></div>` : '';
  };
  function forceOnline(c) {
    const f = forceInfo(c);
    if (!f) return;
    if (!A.Wallet.spend(FORCE_COST, `Zorla çevrimiçi · ${c.name}`)) {
      if (confirm(`Yeterli coin yok (${FORCE_COST} ♥ gerekli). Coin yüklemek ister misin?`)) location.hash = '#/recharge';
      return;
    }
    S().forced = S().forced || {};
    S().forced[c.id] = Date.now() + FORCE_MIN * 60000;
    const v = A.Mood.current(c).values;
    A.Mood.nudge(c, { social: Math.max(0, 0.55 - v.social), valence: f.reason === 'sleep' ? -0.08 : 0 });
    A.Store.save();
    if (S().pending[c.id]) {
      S().pending[c.id] = false;
      S().pendingReason = S().pendingReason || {};
      S().pendingReason[c.id] = f.reason === 'sleep' ? 'sleep' : 'other';
      const pg = (S().pendingGift || {})[c.id];
      if (pg) { delete S().pendingGift[c.id]; reactGift(c, pg); } else startReply(c, 'back');
    } else if (!typing[c.id] && !reading[c.id]) {
      play(c, A.Engine.wake(c, f.reason));
    }
    if (ui.route && ui.route.name === 'p') renderProfile(c); else refresh(c);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-force]');
    if (b) { const c = A.byId(b.dataset.force); if (c) forceOnline(c); }
  });

  // Son gönderilen mesajlar "görüldü"
  function markSeen(c) {
    const msgs = chatOf(c);
    for (let i = msgs.length - 1; i >= 0 && msgs[i].from !== 'her'; i--) if (msgs[i].from === 'me') msgs[i].seen = true;
    S().lastSeen = S().lastSeen || {};
    S().lastSeen[c.id] = Date.now();
    A.Store.save();
    refresh(c);
  }

  function markPending(c) {
    S().pending[c.id] = true;
    S().pendingReason = S().pendingReason || {};
    S().pendingReason[c.id] = A.Schedule.status(c).state === 'sleep' ? 'sleep' : 'other';
    A.Store.save();
  }

  // Sohbet başlığındaki durum: yazıyor / çevrimiçi / meşgul / son görülme
  function presence(c) {
    if (typing[c.id]) return { text: 'yazıyor…', cls: 'typing' };
    const st = A.Schedule.status(c);
    if (st.forced) return { text: `Çevrimiçi · ⚡ ${Math.max(1, Math.ceil((st.until - Date.now()) / 60000))} dk`, cls: 'on' };
    if (A.Mood.isOnline(c)) return st.state === 'busy' ? { text: `meşgul · ${st.status}`, cls: 'busy' } : { text: 'Çevrimiçi', cls: 'on' };
    const seen = Math.max((S().lastSeen || {})[c.id] || 0, st.state === 'sleep' ? Math.min(st.since, Date.now()) : 0);
    return { text: seen ? `son görülme ${relTime(seen)}` : 'çevrimdışı', cls: 'off' };
  }

  function relTime(ts) {
    const diff = (Date.now() - ts) / 60000;
    if (diff < 1) return 'az önce';
    if (diff < 60) return `${Math.floor(diff)} dk önce`;
    const d = new Date(ts), hm = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === new Date().toDateString()) return `bugün ${hm}`;
    if (d.toDateString() === new Date(Date.now() - 86400000).toDateString()) return `dün ${hm}`;
    return fmtTime(ts);
  }

  function play(c, r) {
    let i = 0;
    const next = () => {
      typing[c.id] = true;
      refresh(c);
      setTimeout(() => {
        typing[c.id] = false;
        pushHer(c, r.parts[i]);
        i++;
        if (i < r.parts.length) setTimeout(next, 250);
        else if (unanswered(c).length) timers[c.id] = setTimeout(() => startReply(c), 900);
      }, r.delays[i]);
    };
    next();
  }

  function pushHer(c, text) {
    chatOf(c).push({ from: 'her', text, ts: Date.now() });
    if (!onChatWith(c)) {
      S().unread[c.id] = (S().unread[c.id] || 0) + 1;
      toast(c, text);
    }
    A.Store.save();
    refresh(c);
    if (onChatWith(c)) updateChatHeader(c);
  }

  function updateChatHeader(c) {
    const { meta } = moodInfo(c);
    const btn = $('#moodBtn');
    if (btn) btn.innerHTML = `${meta.emoji}<small>${meta.name}</small>`;
    const lv = A.Engine.level(c);
    const bar = $('.hcard .lvbar');
    if (bar) bar.innerHTML = lvbarInner(lv);
    const heart = $('.couple .heart small');
    if (heart) heart.textContent = `LV ${lv.lv}`;
    applyChatTheme(lv);
  }

  /* ---------- Ruh hali listesi ---------- */
  function renderMoodList() {
    view.innerHTML = `
      <div class="page-pad moods">
        <div class="h-title">Ruh Hali</div>
        <p class="about" style="margin-top:-6px">Valence × arousal düzleminde her karakterin anlık ruh hali. Ayarladığın değer zamanla kişiliğine göre “normal” haline geri döner.</p>
        ${chars().map(c => {
          const { cur, meta } = moodInfo(c);
          const v = cur.values;
          const bar = (lbl, val) => `<div><label>${lbl}</label><div class="bar"><i style="width:${Math.round(val * 100)}%"></i></div></div>`;
          return `
            <a class="mood-card" href="#/mood/${c.id}">
              ${avatar(c, 54)}
              <div class="info">
                <div class="name">${esc(c.name)} ${cur.locked ? '🔒' : ''}</div>
                <div class="mini-bars">
                  ${bar('Valence', (v.valence + 1) / 2)}${bar('Arousal', v.arousal)}
                  ${bar('Enerji', v.energy)}${bar('Sosyal pil', v.social)}
                </div>
              </div>
              <div class="face">${meta.emoji}<small>${meta.name}</small></div>
            </a>`;
        }).join('')}
      </div>`;
  }

  /* ---------- Ruh hali düzenleyici (Set mood) ---------- */
  function renderMoodEditor(c) {
    const cur = A.Mood.current(c);
    const draft = { ...cur.values };
    const base = cur.baseline;
    view.innerHTML = `
      <div class="editor-head">
        <button class="icon-btn" id="edBack" aria-label="Geri">${ICON.arrowLeft}</button>
        ${avatar(c, 40)}
        <h1>${esc(c.name)} · Ruh hali</h1>
      </div>

      <div class="pad-wrap">
        <div class="pad" id="pad">
          <span class="q tl">😤 Gergin</span><span class="q tr">🤩 Coşkulu</span>
          <span class="q bl">😔 Üzgün</span><span class="q br">😌 Huzurlu</span>
          <span class="axis x">VALENCE →</span><span class="axis y">↑ AROUSAL</span>
          <div class="ghost" id="ghost" title="Kişiliğine göre normal hali"></div>
          <div class="knob" id="knob"></div>
        </div>
      </div>

      <div class="live-label" id="live"></div>

      <div class="ctrl">
        <div class="row2"><span>⚡ Enerji</span><small id="enV"></small></div>
        <input type="range" id="en" min="0" max="1" step="0.01">
        <div class="row2"><span>🔋 Sosyal pil</span><small id="soV"></small></div>
        <input type="range" id="so" min="0" max="1" step="0.01">
      </div>

      <div class="ctrl">
        <div class="row2"><span>Hazır ruh halleri</span></div>
        <div class="presets">
          ${Object.keys(A.Mood.PRESETS).map(k => `<button data-p="${k}">${A.Mood.LABELS[k].emoji} ${A.Mood.LABELS[k].name}</button>`).join('')}
        </div>
      </div>

      <div class="ctrl">
        <div class="row2"><span>Gizli sebep</span><small>sadece güvendiği kişiye ima eder</small></div>
        <input type="text" id="cause" maxlength="80" placeholder="ör. sınavdan düşük aldı" value="${esc(cur.cause || '')}">
        <div class="row2" style="margin-top:14px"><span>🔒 Kilitle <small style="display:block">zamanla normale dönmesin</small></span>
          <label class="switch"><input type="checkbox" id="lock" ${cur.locked ? 'checked' : ''}><span></span></label>
        </div>
      </div>

      <div class="actions">
        <button class="btn ghost" id="resetBtn">Sıfırla</button>
        <button class="btn primary" id="saveBtn">Kaydet</button>
      </div>

      <div class="log">
        <div class="sec-title">Geçmiş</div>
        ${(S().moodLog[c.id] || []).slice(0, 12).map(l => {
          const m = A.Mood.LABELS[l.label];
          return `<div class="log-item"><span class="em">${m.emoji}</span><div class="txt"><b>${m.name}</b>${l.cause ? ` · ${esc(l.cause)}` : ''}<small>${fmtTime(l.ts)} · ${esc(l.source)}</small></div></div>`;
        }).join('') || '<div class="about">Henüz değişiklik yok.</div>'}
      </div>`;

    $('#edBack').onclick = () => { if (history.length > 1) history.back(); else location.hash = '#/mood'; };
    const pad = $('#pad'), knob = $('#knob'), ghost = $('#ghost');
    const en = $('#en'), so = $('#so');

    const place = (el, v) => {
      el.style.left = ((v.valence + 1) / 2 * 100) + '%';
      el.style.top = ((1 - v.arousal) * 100) + '%';
    };

    function sync() {
      place(knob, draft);
      place(ghost, base);
      en.value = draft.energy; so.value = draft.social;
      $('#enV').textContent = Math.round(draft.energy * 100) + '%';
      $('#soV').textContent = Math.round(draft.social * 100) + '%';
      const lab = A.Mood.label(draft);
      const m = A.Mood.LABELS[lab];
      knob.textContent = m.emoji;
      $('#live').style.background = m.color;
      $('#live').innerHTML = `<span class="em">${m.emoji}</span><div>${m.name}<small>valence ${draft.valence.toFixed(2)} · arousal ${draft.arousal.toFixed(2)}</small></div>`;
    }

    function fromPointer(e) {
      const r = pad.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      draft.valence = Math.round((x * 2 - 1) * 100) / 100;
      draft.arousal = Math.round((1 - y) * 100) / 100;
      sync();
    }
    pad.addEventListener('pointerdown', e => { pad.setPointerCapture(e.pointerId); pad.classList.add('drag'); fromPointer(e); });
    pad.addEventListener('pointermove', e => { if (pad.classList.contains('drag')) fromPointer(e); });
    const end = () => pad.classList.remove('drag');
    pad.addEventListener('pointerup', end);
    pad.addEventListener('pointercancel', end);

    en.oninput = () => { draft.energy = +en.value; sync(); };
    so.oninput = () => { draft.social = +so.value; sync(); };
    view.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { Object.assign(draft, A.Mood.PRESETS[b.dataset.p]); sync(); });

    $('#saveBtn').onclick = () => {
      A.Mood.set(c, draft, { cause: $('#cause').value, locked: $('#lock').checked, source: 'panel' });
      renderMoodEditor(c);
    };
    $('#resetBtn').onclick = () => { A.Mood.reset(c); renderMoodEditor(c); };

    sync();
    window.scrollTo(0, 0);
  }

  /* ---------- Karakter oluştur ---------- */
  function renderCreate() {
    if (!ui.create) {
      const d = A.Gen.draft();
      ui.create = { setId: d.setId, name: d.name, archetype: d.archetype, draft: d };
    }
    const st = ui.create;
    const used = A.Gen.usedSets();
    const pv = A.Gen.hydrate(st.draft);
    const arch = A.archetype(st.archetype);
    const stripScroll = $('.sets') ? $('.sets').scrollLeft : null;

    view.innerHTML = `
      <div class="create">
        <div class="editor-head">
          <a class="icon-btn" href="#/home" aria-label="Geri">${ICON.arrowLeft}</a>
          <h1>Karakter Oluştur</h1>
          <button class="chip dice-all" id="allDice">🎲 Hepsi</button>
        </div>

        <div class="ctrl">
          <div class="row2"><span>📸 Fotoğraf seti</span><button class="dice-btn" data-dice="set" aria-label="Rastgele set">🎲</button></div>
          <div class="sets">
            ${A.PHOTO_SETS.map(s => `
              <button class="set ${s.id === st.setId ? 'on' : ''} ${used.has(s.id) ? 'used' : ''}" data-set="${esc(s.id)}">
                <img src="${A.Gen.photoUrl(s.id, s.profile)}" alt="" loading="lazy">
                <span>${used.has(s.id) ? 'kullanımda' : (s.photos.length + 1) + ' foto'}</span>
              </button>`).join('')}
          </div>
        </div>

        <div class="ctrl">
          <div class="row2"><span>✍️ İsim</span><button class="dice-btn" data-dice="name" aria-label="Rastgele isim">🎲</button></div>
          <input type="text" id="cName" maxlength="16" value="${esc(st.name)}" placeholder="İsim havuzundan çekmek için 🎲">
        </div>

        <div class="ctrl">
          <div class="row2"><span>💫 Kişilik</span><button class="dice-btn" data-dice="arch" aria-label="Rastgele kişilik">🎲</button></div>
          <div class="presets">
            ${A.ARCHETYPES.map(a => `<button data-arch="${a.id}" class="${a.id === st.archetype ? 'on' : ''}">${a.icon} ${a.label}</button>`).join('')}
          </div>
          <div class="about" style="margin-top:8px">${esc(arch.desc)}</div>
        </div>

        <div class="sec-title" style="margin:18px 16px 8px">Önizleme</div>
        <div class="preview">
          <div class="pv-photo">
            ${pv.photo ? `<img src="${esc(pv.photo)}" alt="">` : ''}
            <div class="pv-over">
              <b>${esc(pv.display)}</b>
              <div class="chips">
                <span class="chip sex">♀ ${pv.age}</span>
                <span class="chip loc">📍 ${esc(pv.city)}</span>
                <span class="chip">${pv.height}cm</span>
                <span class="chip zod">✦ ${esc(pv.zodiac)}</span>
              </div>
            </div>
          </div>
          <div class="pv-body">
            <div class="info-row"><span>💼 Meslek</span><b>${esc(pv.job)}</b></div>
            <div class="info-row"><span>🏠 Semt</span><b>${esc(pv.district)}, ${esc(pv.city)}</b></div>
            <div class="pv-bio">“${esc(pv.bio)}”</div>
            <div class="chips">${pv.likes.map(l => `<span class="chip">💜 ${esc(l)}</span>`).join('')}</div>
            <div class="pv-sample"><small>Örnek mesajı</small>${esc(A.Engine.sample(pv, 'greet'))} · ${esc(A.Engine.sample(pv, 'ask_city'))}</div>
          </div>
        </div>

        <div class="actions" style="padding-bottom:calc(20px + var(--safe-b))">
          <button class="btn ghost" id="reroll">🎲 Detaylar</button>
          <button class="btn primary" id="createBtn">✨ Oluştur</button>
        </div>
      </div>`;

    if (stripScroll !== null) $('.sets').scrollLeft = stripScroll;
    else { const on = $('.set.on'); if (on) on.scrollIntoView({ inline: 'center', block: 'nearest' }); }

    const redraft = () => {
      st.draft = A.Gen.draft({ setId: st.setId, name: st.name, archetype: st.archetype });
      renderCreate();
    };
    const nameInput = $('#cName');

    view.querySelectorAll('[data-set]').forEach(b => b.onclick = () => { st.setId = b.dataset.set; redraft(); });
    view.querySelectorAll('[data-arch]').forEach(b => b.onclick = () => { st.archetype = b.dataset.arch; redraft(); });
    nameInput.onchange = () => { st.name = nameInput.value.trim() || A.Gen.randomName(); redraft(); };
    view.querySelectorAll('[data-dice]').forEach(b => b.onclick = () => {
      const k = b.dataset.dice;
      if (k === 'set') st.setId = A.Gen.randomSet();
      if (k === 'name') st.name = A.Gen.randomName();
      if (k === 'arch') st.archetype = A.ARCHETYPES[Math.floor(Math.random() * A.ARCHETYPES.length)].id;
      redraft();
    });
    $('#reroll').onclick = redraft;
    $('#allDice').onclick = () => { ui.create = null; renderCreate(); };
    $('#createBtn').onclick = () => {
      const typed = nameInput.value.trim();
      if (typed && typed !== st.draft.name) { st.name = typed; st.draft = A.Gen.draft({ setId: st.setId, name: typed, archetype: st.archetype }); }
      const c = A.Gen.add(st.draft);
      S().createdCount = (S().createdCount || 0) + 1;
      A.Store.save();
      ui.create = null;
      ui.profileTab = 'profile';
      location.hash = `#/p/${c.id}`;
    };
  }

  /* ---------- Hesap: giriş / oluşturma ----------
   * Hesaplar bu cihazda tutulur (store.js); her hesabın karakterleri, sohbetleri ve coinleri ayrıdır.
   * Giriş / çıkıştan sonra sayfa yeniden yüklenir, böylece zamanlayıcılar ve önbellekler temiz başlar. */
  const auth = { mode: null, pick: null, error: '' };
  function renderAuth() {
    ui.route = { name: 'auth' };
    app.classList.add('no-nav');
    const list = A.Store.accounts();
    const mode = auth.mode || (list.length ? 'login' : 'register');
    const err = auth.error ? `<div class="auth-err">${esc(auth.error)}</div>` : '';
    const ava = (name, size) => `<div class="ava" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.42)}px;background:linear-gradient(135deg,#7b5cff,#c86bff)">${esc((name || '?').charAt(0).toLocaleUpperCase('tr'))}</div>`;
    let body;
    if (mode === 'login') {
      body = `<h2>Hesabını seç</h2>
        <div class="acc-list">${list.map(a => `
          <div class="acc ${auth.pick === a.id ? 'on' : ''}" data-acc="${a.id}">
            ${ava(a.user.name || a.username, 46)}
            <div class="acc-info"><b>${esc(a.user.name || a.username)}</b><small>@${esc(a.username)}${a.hasPin ? ' · 🔒' : ''}</small></div>
            ${auth.pick === a.id && a.hasPin ? `<input class="pin" id="pinIn" type="password" inputmode="numeric" maxlength="4" placeholder="PIN" autocomplete="off">` : ''}
            <span class="go">›</span>
          </div>`).join('')}</div>
        ${err}
        <button class="btn ghost block" data-mode="register" style="margin-top:14px">+ Yeni hesap oluştur</button>`;
    } else {
      body = `<h2>Hesap oluştur</h2>
        <p class="auth-sub">Hesabın bu cihazda saklanır. Her hesabın kendi karakterleri, sohbetleri ve coinleri olur.</p>
        ${!list.length && A.Store.hasLegacy() ? '<div class="notice">Bu cihazdaki mevcut sohbetlerin ve karakterlerin yeni hesabına aktarılacak 💌</div>' : ''}
        <form id="regForm" autocomplete="off">
          <div class="field"><label>Kullanıcı adı</label><input name="username" maxlength="20" placeholder="ör. deniz.34" autocapitalize="none" required></div>
          <div class="field"><label>Adın</label><input name="name" maxlength="20" placeholder="Kızlar sana böyle hitap edecek" required></div>
          <div class="field two"><div><label>Yaşın</label><input name="age" inputmode="numeric" maxlength="2" required></div>
            <div><label>Şehrin</label><input name="city" maxlength="20" placeholder="isteğe bağlı"></div></div>
          <div class="field"><label>PIN (isteğe bağlı)</label><input name="pin" type="password" inputmode="numeric" maxlength="4" placeholder="4 haneli · hesabı açarken sorulur"></div>
          ${err}
          <button class="btn pink block" type="submit" style="margin-top:16px">Hesabı oluştur</button>
        </form>
        ${list.length ? '<button class="btn ghost block" data-mode="login" style="margin-top:10px">Mevcut hesaba giriş yap</button>' : ''}`;
    }
    view.innerHTML = `<div class="auth"><div class="auth-logo">amor</div><div class="auth-card card">${body}</div></div>`;

    const enter = () => { location.hash = '#/home'; location.reload(); };
    view.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => { auth.mode = b.dataset.mode; auth.error = ''; auth.pick = null; renderAuth(); });
    view.querySelectorAll('[data-acc]').forEach(el => el.onclick = e => {
      if (e.target.id === 'pinIn') return;
      const a = list.find(x => x.id === el.dataset.acc);
      if (!a.hasPin) { const r = A.Store.login(a.id); if (r.ok) enter(); return; }
      if (auth.pick !== a.id) { auth.pick = a.id; auth.error = ''; renderAuth(); $('#pinIn').focus(); return; }
      tryPin();
    });
    function tryPin() {
      const r = A.Store.login(auth.pick, $('#pinIn').value);
      if (r.ok) return enter();
      auth.error = r.error; renderAuth(); $('#pinIn').focus();
    }
    const pin = $('#pinIn');
    if (pin) pin.oninput = () => { if (pin.value.length === 4) tryPin(); };
    const form = $('#regForm');
    if (form) form.onsubmit = e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      const r = A.Store.register(f);
      if (r.ok) return enter();
      auth.error = r.error; renderAuth();
      Object.entries(f).forEach(([k, v]) => { const i = $(`#regForm [name=${k}]`); if (i) i.value = v; });
    };
  }

  /* ---------- Ben ---------- */
  function renderMe() {
    const u = S().user;
    const acc = A.Store.account();
    const chatsCount = chars().filter(c => chatOf(c).length).length;
    const sent = chars().reduce((n, c) => n + chatOf(c).filter(m => m.from === 'me').length, 0);
    const follows = Object.values(S().follows).filter(Boolean).length;
    const best = [...chars()].sort((a, b) => (S().affinity[b.id] || 0) - (S().affinity[a.id] || 0))[0];
    const bestLv = best ? A.Engine.level(best) : null;

    const W = A.Wallet;
    const vip = W.vip();
    const wl = W.wealth();
    const todayVisitors = S().visitors.filter(v => new Date(v.ts).toDateString() === new Date().toDateString()).length;
    const menu = [
      ['#/visitors', '👀', 'Ziyaretçiler', todayVisitors],
      ['#/vip', '👑', 'VIP', 0],
      ['#/game', '🎡', 'Oyun', W.spinsLeft()],
      ['#/store', '🛍️', 'Mağaza', 0],
      ['#/rewards', '🎁', 'Ödüller', W.claimableCount()],
      ['#/create', '✨', 'Karakter oluştur', 0]
    ];

    view.innerHTML = `
      <div class="me-head">
        <div class="me-top">
          <a class="pill" href="#/recharge"><span class="coin">♥</span><b data-coins>${W.coins().toLocaleString('tr-TR')}</b> Yükle</a>
          <a class="pill" href="#/vip">💎 VIP${vip.lv}</a>
        </div>
        <div class="row-me">
          ${userAvatar(76)}
          <div>
            <div class="nm">${userName()}</div>
            <div class="chips" style="margin-top:6px">
              <span class="chip" style="background:#3b82f6;color:#fff">♂ ${esc(u.age || '?')}</span>
              <span class="chip loc">📍 ${esc(u.city || 'Türkiye')}</span>
              <span class="chip" style="background:#16a34a;color:#fff">Lv.${wl.lv}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="me-card card">
        <div class="stats" style="margin-top:0">
          <div><b>${chatsCount}</b><span>Sohbet</span></div>
          <div><b>${sent}</b><span>Mesaj</span></div>
          <div><b>${follows}</b><span>Takip</span></div>
        </div>
        ${best && S().affinity[best.id] ? `<div class="info-row" style="margin-top:10px"><span>En yakının</span><b>${esc(best.name)} · Lv.${bestLv.lv} ${bestLv.name}</b></div>` : ''}
      </div>

      <div class="me-menu card">
        ${menu.map(([href, icon, name, n]) => `<a href="${href}"><span class="mi">${icon}${n ? `<b class="mbadge">${n}</b>` : ''}</span>${name}</a>`).join('')}
      </div>

      <div class="page-pad narrow">
        ${installCard()}
        <div class="card">
          <div class="sec-title" style="margin-top:0">Profilin</div>
          <div class="field"><label>Adın</label><input id="uName" maxlength="20" value="${esc(u.name)}" placeholder="Kızlar sana böyle hitap edecek"></div>
          <div class="field"><label>Yaşın</label><input id="uAge" inputmode="numeric" maxlength="2" value="${esc(u.age)}"></div>
          <div class="field"><label>Şehrin</label><input id="uCity" maxlength="20" value="${esc(u.city)}"></div>
        </div>

        <div class="card" style="margin-top:12px">
          <div class="sec-title" style="margin-top:0">Hesap</div>
          <div class="info-row"><span>Kullanıcı adı</span><b>@${esc(acc.username)}</b></div>
          <div class="info-row"><span>Oluşturulma</span><b>${new Date(acc.created).toLocaleDateString('tr-TR')}</b></div>
          <div class="info-row"><span>PIN</span><b>${acc.pin ? '🔒 açık' : 'yok'}</b></div>
          <div class="acc-btns">
            <button class="btn ghost" id="accSwitch">Hesap değiştir / çıkış</button>
            <button class="btn ghost" id="accPin">${acc.pin ? 'PIN\'i değiştir / kaldır' : 'PIN koy'}</button>
          </div>
          <button class="btn ghost block" id="accDel" style="margin-top:8px;color:#ff2d55">Hesabı sil</button>
        </div>

        <div class="card" style="margin-top:12px">
          <div class="sec-title" style="margin-top:0">Amor nasıl çalışır?</div>
          <div class="about">
            Burada yapay zeka yok. Her mesajın <b>niyeti</b> (selam, iltifat, soru…) kalıplarla bulunur ve karakter,
            kendi kişiliğine ve o anki <b>ruh haline</b> uygun hazır cümlelerden birini seçer.<br><br>
            • <b>Valence × arousal</b>: mutluluk ve heyecan ekseni. Gerginken kısa ve emojisiz, coşkuluyken çok balonlu yazar.<br>
            • <b>Sosyal pil</b>: her mesajla azalır, biterse sohbetten çıkar; yarım saatte toparlanır.<br>
            • <b>Yakınlık seviyesi</b>: iltifat ve sohbetle artar, hakaretle düşer. Yükseldikçe hitaplar değişir.<br>
            • <b>Hediyeler</b>: değerine ve kişiliğe göre ruh halini ve yakınlığı artırır. Flörtöz biri çok, soğuk biri az etkilenir.<br>
            • <b>Coin</b> tamamen sanaldır; yükleme bir simülasyondur, gerçek para çekilmez.<br>
            • Tüm veriler sadece bu tarayıcıda (<code>localStorage</code>) saklanır; her hesabın verisi ayrıdır.
          </div>
        </div>

        <button class="btn ghost block" id="resetAll" style="margin-top:14px;color:#ff2d55">Tüm verileri sıfırla</button>
      </div>`;

    const ib = $('#installBtn');
    if (ib) ib.onclick = async () => { installPrompt.prompt(); await installPrompt.userChoice; installPrompt = null; renderMe(); };
    const bind = (id, key) => $(id).onchange = () => { u[key] = $(id).value.trim(); A.Store.save(); renderMe(); };
    bind('#uName', 'name'); bind('#uAge', 'age'); bind('#uCity', 'city');
    $('#accSwitch').onclick = () => { A.Store.logout(); location.hash = '#/home'; location.reload(); };
    $('#accPin').onclick = () => {
      const p = prompt(acc.pin ? 'Yeni 4 haneli PIN (boş bırakırsan PIN kaldırılır):' : '4 haneli PIN:');
      if (p === null) return;
      if (!A.Store.setPin(p.trim())) return alert('PIN 4 haneli rakam olmalı.');
      renderMe();
    };
    $('#accDel').onclick = () => {
      if (!confirm(`@${acc.username} hesabı ve içindeki bütün karakterler, sohbetler ve coinler kalıcı olarak silinsin mi?`)) return;
      if (prompt('Onaylamak için kullanıcı adını yaz:') !== acc.username) return alert('Kullanıcı adı eşleşmedi, silinmedi.');
      A.Store.removeAccount(acc.id); location.hash = '#/home'; location.reload();
    };
    $('#resetAll').onclick = () => {
      if (confirm('Bu hesaptaki tüm karakterler, sohbetler, ruh halleri ve ayarlar silinsin mi? Yeni karakterler oluşturulur.')) {
        A.Store.reset(); A.Wallet.st(); A.Gen.seed(); A.Gen.load();
        location.hash = '#/home'; render();
      }
    };
  }

  /* ---------- Zamanlayıcı: dönüşler ve kendiliğinden gelen mesajlar ---------- */
  function tick() {
    if (!A.Store.account()) return;
    // süresi dolan "zorla çevrimiçi" kayıtları
    Object.entries(S().forced || {}).forEach(([id, until]) => { if (until < Date.now()) delete S().forced[id]; });
    chars().forEach(c => {
      if (S().pending[c.id] && A.Mood.isOnline(c) && !typing[c.id]) {
        S().pending[c.id] = false;
        const pg = (S().pendingGift || {})[c.id];
        if (pg) delete S().pendingGift[c.id];
        A.Store.save();
        if (pg) reactGift(c, pg);
        else startReply(c, 'back');
      }
    });

    // Arada biri profiline bakar (yakın olanlar daha sık)
    if (Math.random() < 0.2) {
      const seenToday = new Set(S().visitors.filter(v => new Date(v.ts).toDateString() === new Date().toDateString()).map(v => v.id));
      const pool = chars().filter(c => !seenToday.has(c.id) && A.Mood.isOnline(c));
      const weighted = pool.flatMap(c => Array(1 + Math.min(5, A.Engine.level(c).lv)).fill(c));
      if (weighted.length) A.Wallet.addVisitor(weighted[Math.floor(Math.random() * weighted.length)].id);
    }

    // Çevrimiçi olanların "son görülme"si şimdi
    S().lastSeen = S().lastSeen || {};
    chars().forEach(c => { if (A.Mood.isOnline(c)) S().lastSeen[c.id] = Date.now(); });
    const open = ui.route && ui.route.name === 'chat' && A.byId(ui.route.id);
    if (open) updateStatus(open);

    // İlgi bekleyen huy: mesajına bakmadıysan ya da görüp cevap vermediysen "neden bakmıyorsun bana?"
    const now = Date.now();
    const ts = A.Engine.TRAIT_SETTINGS();
    chars().forEach(c => {
      if (!(c.traits || []).includes('ilgi') || typing[c.id] || reading[c.id] || S().pending[c.id]) return;
      const from = (S().waitFrom || {})[c.id], last = lastMsg(c), n = (S().nudges || {})[c.id] || 0;
      if (!from || !last || last.from !== 'her' || n >= 2) return;
      if (!A.Mood.isOnline(c) || A.Schedule.status(c).state !== 'free' || A.Interest.get(c) < 0.3) return;
      if (now - from < (n ? ts.nudge2Min : ts.nudgeMin) * 60000 || now - from > 6 * 3600000) return; // çok eskiyse açılış mesajı ("beni unuttun mu?") halleder
      const r = A.Engine.nudge(c, onChatWith(c) || !S().unread[c.id] ? 'seen' : 'unread', n);
      if (r) play(c, r);
    });

    // Keyfi yerinde, boş ve konuşmak isteyen biri arada bir kendisi yazar
    const candidates = chars().filter(c => {
      if (openerSent[c.id] || typing[c.id] || reading[c.id] || onChatWith(c)) return false;
      if (A.Schedule.status(c).state !== 'free' || A.Interest.get(c) < 0.35) return false;
      const v = A.Mood.current(c).values;
      const last = lastMsg(c);
      return A.Mood.isOnline(c) && v.valence > 0.1 && v.social > 0.5 && (!last || now - last.ts > 30 * 60 * 1000);
    });
    if (candidates.length && Math.random() < 0.25) {
      const c = candidates[Math.floor(Math.random() * candidates.length)];
      openerSent[c.id] = true;
      play(c, A.Engine.opener(c));
    }

    if (A.Call) A.Call.maybeIncoming();

    // Listelerdeki çevrimiçi / ruh hali bilgisini tazele
    const r = ui.route;
    if (r && !r.id && r.name === 'home') renderHome();
    if (r && !r.id && r.name === 'mood') renderMoodList();
  }

  /* ---------- PWA: çevrimdışı çalışma + ana ekrana ekleme ---------- */
  let installPrompt = null;
  const standalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installPrompt = e;
    if (ui.route && ui.route.name === 'me') renderMe();
  });

  function installCard() {
    if (standalone()) return '';
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (installPrompt) {
      return `<div class="card install"><span>📲</span><div><b>Amor'u telefonuna yükle</b><small>Ana ekrandan uygulama gibi açılır, internetsiz de çalışır.</small></div><button class="btn sm pink" id="installBtn">Yükle</button></div>`;
    }
    if (ios) {
      return `<div class="card install"><span>📲</span><div><b>Ana ekrana ekle</b><small>Safari'de <b>Paylaş</b> → <b>Ana Ekrana Ekle</b>'ye dokun.</small></div></div>`;
    }
    return '';
  }

  /* ---------- Başlat ---------- */
  A.UI = { render, fmtTime, avatar, userAvatar, pushHer, refresh };
  A.Wallet.onChange = () => {
    const n = A.Wallet.coins().toLocaleString('tr-TR');
    document.querySelectorAll('[data-coins]').forEach(el => { el.textContent = n; });
  };
  // Hesap açıksa verileri hazırla; değilse render() hesap ekranını gösterir
  if (A.Store.account()) {
    A.Wallet.st();
    A.Gen.seed();
    A.Gen.load();
  }
  window.addEventListener('hashchange', render);
  // Pencere 1024px eşiğini geçince mesaj/sohbet düzenini yeniden kur (tek sütun <-> iki sütun)
  wideMQ.addEventListener('change', () => { if (ui.route && ['chat', 'messages'].includes(ui.route.name)) render(); });
  render();
  setTimeout(() => $('#splash').classList.add('hide'), 1100);
  setTimeout(tick, 8000);
  setInterval(tick, 25000);
})();
