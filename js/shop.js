/*
 * Amor - Ekonomi ekranları
 * ------------------------
 * Yükleme (simülasyon), Coin geçmişi, Yükleme Yıldızı, Ödüller (Görev Merkezi),
 * Eşya Mağazası, VIP Merkezi, Ziyaretçiler, Şans Çarkı ve sohbetteki Hediye paneli.
 * app.js'teki yardımcıları Amor.UI üzerinden kullanır.
 */
window.Amor = window.Amor || {};

(() => {
  const A = window.Amor;
  const W = () => A.Wallet;
  const S = () => A.Store.state;
  const U = () => A.UI;
  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const fmt = n => Number(n).toLocaleString('tr-TR');
  const view = () => $('#view');
  const back = (href) => `<a class="icon-btn" href="${href}" aria-label="Geri"><svg viewBox="0 0 24 24"><path d="M20 12H5M11 5l-7 7 7 7"/></svg></a>`;
  const COIN = '<span class="coin">♥</span>';

  A.Pages = A.Pages || {};
  A.FULL_PAGES = ['recharge', 'coins', 'star', 'rewards', 'store', 'vip', 'visitors', 'game'];

  /* ---------- Ortak ---------- */
  function notify(text, icon = '🪙') {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span style="font-size:28px">${icon}</span><div class="info"><b>${esc(text)}</b></div>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 2600);
  }

  // Ekrana yağan emoji (coin kazanınca, hediye gönderince)
  function burst(emoji, count = 14, big = false) {
    const layer = document.createElement('div');
    layer.className = 'burst' + (big ? ' big' : '');
    if (big) layer.innerHTML = `<div class="burst-main">${emoji}</div>`;
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.textContent = emoji;
      s.style.left = Math.random() * 100 + '%';
      s.style.animationDelay = Math.random() * 0.6 + 's';
      s.style.fontSize = 18 + Math.random() * 22 + 'px';
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 2600);
  }

  function sheet(html, cls = '') {
    const wrap = document.createElement('div');
    wrap.className = 'sheet-wrap';
    wrap.innerHTML = `<div class="sheet ${cls}">${html}</div>`;
    wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('open'));
    function close() { wrap.classList.remove('open'); setTimeout(() => wrap.remove(), 250); }
    return { el: wrap.firstElementChild, close };
  }

  function countdown(to) {
    let ms = Math.max(0, to - Date.now());
    const d = Math.floor(ms / 86400000); ms -= d * 86400000;
    const h = Math.floor(ms / 3600000); ms -= h * 3600000;
    const m = Math.floor(ms / 60000); ms -= m * 60000;
    const s = Math.floor(ms / 1000);
    return { d, h, m, s };
  }
  const pad = n => String(n).padStart(2, '0');
  const endOfMonth = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth() + 1, 1).getTime(); };
  const endOfDay = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1).getTime(); };

  // Sayfadan çıkınca duran zamanlayıcı
  let pageTimer = null;
  function every(ms, fn) {
    clearInterval(pageTimer);
    pageTimer = setInterval(() => { if (!document.body.contains(fn.el)) { clearInterval(pageTimer); return; } fn(); }, ms);
  }

  /* ========== Yükleme ========== */
  A.Pages.recharge = () => {
    const w = W().st().wallet;
    const m = W().st().monthly;
    const goal = A.MONTHLY_TIERS[A.MONTHLY_TIERS.length - 1].at;
    const next = W().monthlyTiers().find(t => !t.reached);

    view().innerHTML = `
      <div class="eco recharge">
        <div class="eco-head">${back('#/me')}<h1>Yükleme</h1><a class="head-link" href="#/coins">Coin Geçmişi</a></div>
        <div class="balance-card">
          <small>Coin Bakiyesi</small>
          <span class="where">📍 Türkiye ›</span>
          <b data-coins>${fmt(w.coins)}</b>
          <span class="big-coin">♥</span>
        </div>
        <a class="star-strip" href="#/star"><span>🎁</span>Yükleme Yıldızı · aylık hedeflere ulaş, ödülleri topla<span>›</span></a>
        <div class="month-card">
          <div class="bar pinkbar"><i style="width:${Math.min(100, m.recharged / goal * 100)}%"></i></div>
          <div class="row2"><span>${fmt(m.recharged)}</span><span>${fmt(goal)} ${COIN}</span></div>
          <p>${next ? `<b>Bu ay yüklenen</b> · Sonraki ödül için ${fmt(next.at - m.recharged)} ${COIN} daha: <b>${esc(next.label)}</b>` : '<b>Tüm aylık ödüller açıldı 🎉</b>'}</p>
        </div>
        <div class="packs">
          ${A.RECHARGE_PACKS.map((p, i) => `
            <button class="pack" data-pack="${i}">
              ${p.bonus ? `<em>+${fmt(p.bonus)}</em>` : ''}
              <b>${fmt(p.coins)}</b>
              <span class="big-coin sm">♥</span>
              <span class="price">${p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</span>
            </button>`).join('')}
        </div>
        <p class="demo-note">🧪 Bu bir demo. Fiyatlar sadece görünüm içindir, satın alma bir simülasyondur ve <b>gerçek para çekilmez</b>.</p>
      </div>`;

    view().querySelectorAll('[data-pack]').forEach(b => b.onclick = () => buySheet(A.RECHARGE_PACKS[+b.dataset.pack]));
  };

  function buySheet(p) {
    const total = p.coins + (p.bonus || 0);
    const sh = sheet(`
      <div class="sheet-grip"></div>
      <h3>Ödeme simülasyonu</h3>
      <div class="pay-coins"><span class="big-coin">♥</span><b>${fmt(total)}</b>${p.bonus ? `<small>${fmt(p.coins)} + ${fmt(p.bonus)} bonus</small>` : ''}</div>
      <div class="pay-row"><span>Tutar</span><b><s>${p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺</s> 0,00 ₺</b></div>
      <div class="pay-row"><span>Ödeme yöntemi</span><b>🧪 Demo kart</b></div>
      <p class="demo-note">Gerçek ödeme alınmaz. Coinler sadece bu tarayıcıda, uygulama içinde geçerlidir.</p>
      <button class="btn pink block" id="payBtn">Onayla (demo)</button>`, 'light');
    $('#payBtn', sh.el).onclick = e => {
      const b = e.currentTarget;
      b.disabled = true;
      b.innerHTML = '<span class="spinner"></span> İşleniyor…';
      setTimeout(() => {
        W().recharge(p);
        sh.close();
        burst('🪙', 22);
        notify(`+${fmt(total)} coin yüklendi`);
        U().render();
      }, 900);
    };
  }

  /* ========== Coin geçmişi ========== */
  A.Pages.coins = () => {
    const h = W().st().wallet.history;
    view().innerHTML = `
      <div class="eco light-page">
        <div class="eco-head dark-text">${back('#/recharge')}<h1>Coin Geçmişi</h1><span></span></div>
        <div class="card" style="margin:0 16px">
          ${h.length ? h.map(x => `
            <div class="hist">
              <div><b>${esc(x.reason)}</b><small>${U().fmtTime(x.ts)}</small></div>
              <span class="${x.amount >= 0 ? 'plus' : 'minus'}">${x.amount >= 0 ? '+' : ''}${fmt(x.amount)}</span>
            </div>`).join('') : '<div class="empty">Henüz hareket yok</div>'}
        </div>
      </div>`;
  };

  /* ========== Yükleme Yıldızı (aylık etkinlik) ========== */
  A.Pages.star = () => {
    const m = W().st().monthly;
    const tiers = W().monthlyTiers();
    const goal = tiers[tiers.length - 1].at;
    view().innerHTML = `
      <div class="eco star">
        <div class="eco-head">${back('#/recharge')}<h1></h1><span></span></div>
        <div class="star-hero"><span class="chest">🧰</span><h2>YÜKLEME<br>YILDIZI</h2></div>
        <div class="star-pill">Aylık yükleme</div>
        <div class="clock" id="clock"></div>
        <div class="star-box">
          <small>Bu ay yükleme yap</small>
          <b>${fmt(goal)} <span class="big-coin sm">♥</span></b>
        </div>
        <div class="star-box">
          <div class="row2"><span>Yükleme ilerlemesi</span><span>${fmt(m.recharged)}/${fmt(goal)}</span></div>
          <div class="bar goldbar"><i style="width:${Math.min(100, m.recharged / goal * 100)}%"></i></div>
          <div class="tiers">
            ${tiers.map(t => `
              <div class="tier ${t.reached ? 'ok' : ''}">
                <span class="t-at">${fmt(t.at)}</span>
                <span class="t-label">${esc(t.label)}</span>
                ${t.claimed ? '<button class="btn sm ghost" disabled>Alındı</button>'
                  : t.reached ? `<button class="btn sm pink" data-tier="${t.i}">Al</button>`
                  : '<button class="btn sm ghost" disabled>Kilitli</button>'}
              </div>`).join('')}
          </div>
        </div>
        <div style="padding:16px"><a class="btn pink block" href="#/recharge">Şimdi yükle</a></div>
      </div>`;

    view().querySelectorAll('[data-tier]').forEach(b => b.onclick = () => {
      if (W().claimTier(+b.dataset.tier)) { burst('🎁', 12); notify('Ödül alındı', '🎁'); A.Pages.star(); }
    });
    const tickClock = () => {
      const t = countdown(endOfMonth());
      const box = (v) => String(v).padStart(2, '0').split('').map(d => `<i>${d}</i>`).join('');
      const el = $('#clock');
      if (el) el.innerHTML = `<div><small>Günler</small>${box(t.d)}</div>:<div><small>Saat</small>${box(t.h)}</div>:<div><small>Dakika</small>${box(t.m)}</div>:<div><small>Saniye</small>${box(t.s)}</div>`;
    };
    tickClock.el = $('#clock');
    tickClock();
    every(1000, tickClock);
  };

  /* ========== Ödüller (Görev Merkezi) ========== */
  let rewardTab = 'daily';
  A.Pages.rewards = () => {
    const s = W().st();
    const cs = W().checkinState();
    view().innerHTML = `
      <div class="eco rewards">
        <div class="rw-head">
          <div class="eco-head">${back('#/home')}<h1>Görev Merkezi</h1><span></span></div>
          <div class="rw-user">
            <b>${esc(s.user.name || 'Misafir')}</b>
            <small>Toplam kazanılan coin ${fmt(s.wallet.earned)} ${COIN}</small>
          </div>
          <span class="rw-art">📅</span>
        </div>
        <div class="rw-body">
          <div class="rw-card">
            <div class="row2"><b>Ardışık giriş</b><small>Art arda ${cs.streak} gün giriş yaptın</small></div>
            <div class="days">
              ${A.CHECKIN.map((r, i) => {
                const taken = i < cs.dayIndex || (cs.done && i === cs.dayIndex);
                const isToday = i === cs.dayIndex;
                return `<div class="day ${taken ? 'taken' : ''} ${isToday ? 'today' : ''}">
                  <span>${r.gift ? '🎁' : '🪙'}</span><b>+${r.coins}</b>
                  <small>${isToday ? 'Bugün' : 'Gün ' + (i + 1)}</small>
                  <em>${taken ? 'Alındı' : (isToday ? 'Al' : '')}</em>
                </div>`;
              }).join('')}
            </div>
            <button class="btn pink block" id="checkin" ${cs.done ? 'disabled' : ''}>${cs.done ? 'Bugün giriş yapıldı ✓' : 'Bugünün ödülünü al'}</button>
          </div>

          <div class="tabs dark" style="margin-top:6px">
            <button data-rt="daily" class="${rewardTab === 'daily' ? 'active' : ''}">Günlük görevler</button>
            <button data-rt="ach" class="${rewardTab === 'ach' ? 'active' : ''}">Başarımlar</button>
          </div>
          ${rewardTab === 'daily' ? `<div class="mini-clock" id="dayClock"></div>` : ''}
          <div class="tasks">
            ${(rewardTab === 'daily' ? A.DAILY_TASKS : A.ACHIEVEMENTS).map(t => {
              const p = rewardTab === 'daily' ? W().taskProgress(t) : W().achievementProgress(t);
              const btn = p.claimed ? '<button class="btn sm ghost" disabled>Alındı</button>'
                : p.done ? `<button class="btn sm pink" data-claim="${t.id}">Al</button>`
                : `<a class="btn sm pink outline" href="${t.go}">git</a>`;
              return `<div class="task">
                <span class="t-icon">${t.icon}</span>
                <div class="t-info"><b>${esc(t.name)}</b><small>${esc(t.desc)}</small>
                  <span class="t-rew">${t.coins ? `🪙 +${t.coins}` : ''} ${p.target > 1 ? `· ${p.n}/${p.target}` : ''}</span></div>
                ${btn}
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>`;

    $('#checkin').onclick = () => {
      const r = W().doCheckin();
      if (r) { burst(r.gift ? '🌹' : '🪙', 14); notify(`+${r.coins} coin${r.gift ? ' + ' + r.qty + ' gül çantana' : ''}`); A.Pages.rewards(); }
    };
    view().querySelectorAll('[data-rt]').forEach(b => b.onclick = () => { rewardTab = b.dataset.rt; A.Pages.rewards(); });
    view().querySelectorAll('[data-claim]').forEach(b => b.onclick = () => {
      const ok = rewardTab === 'daily' ? W().claimTask(b.dataset.claim) : W().claimAchievement(b.dataset.claim);
      if (ok) { burst('🪙', 12); notify('Ödül alındı'); A.Pages.rewards(); }
    });
    const dc = $('#dayClock');
    if (dc) {
      const t = () => { const c = countdown(endOfDay()); dc.innerHTML = `Yenilenmesine <i>${pad(c.h)}</i>:<i>${pad(c.m)}</i>:<i>${pad(c.s)}</i>`; };
      t.el = dc; t(); every(1000, t);
    }
  };

  /* ========== Eşya Mağazası ========== */
  let storeCat = 'frames', storeFilter = 'all';
  A.Pages.store = () => {
    const coins = W().coins();
    const items = storeCat === 'frames' ? A.FRAMES : A.BACKGROUNDS;
    const eq = W().st().equipped;
    const list = items.filter(it => storeFilter === 'all' ? true : storeFilter === 'ok' ? it.price <= coins || W().owns(storeCat, it.id) : it.price > coins && !W().owns(storeCat, it.id));
    const cats = [['frames', '🏵️', 'Çerçeveler'], ['bgs', '🌌', 'Arka Plan']];

    view().innerHTML = `
      <div class="eco store">
        <div class="eco-head">${back('#/me')}<h1>Eşya Mağazası</h1><span></span></div>
        <div class="cats">${cats.map(([k, i, n]) => `<button data-cat="${k}" class="${storeCat === k ? 'on' : ''}"><span>${i}</span>${n}</button>`).join('')}</div>
        <div class="filters">${[['all', 'Hepsi'], ['ok', 'Uygun'], ['no', 'Uygun Değil']].map(([k, n]) => `<button data-f="${k}" class="${storeFilter === k ? 'on' : ''}">${n}</button>`).join('')}</div>
        <div class="items">
          ${list.map(it => {
            const owned = W().owns(storeCat, it.id);
            const slot = storeCat === 'frames' ? 'frame' : 'bg';
            const using = eq[slot] === it.id && owned;
            const locked = it.vip && W().vip().lv < it.vip;
            const preview = storeCat === 'frames'
              ? U().userAvatar(76, it)
              : `<div class="bg-swatch" style="background:${it.css}"><i></i><i></i></div>`;
            let action;
            if (locked) action = `<span class="lock">🔒 VIP${it.vip}</span>`;
            else if (using) action = `<button class="btn sm ghost" disabled>Kullanılıyor</button>`;
            else if (owned) action = `<button class="btn sm pink" data-use="${it.id}">Kullan</button>`;
            else action = `<button class="btn sm pink" data-buy="${it.id}">Satın al</button>`;
            const left = owned && it.price && !(storeCat === 'bgs' && it.id === 'mor-gece') ? `${W().expiresIn(storeCat, it.id)} gün kaldı` : (it.price ? `${A.ITEM_DAYS} gün` : 'süresiz');
            return `<div class="item">
              <div class="item-prev">${preview}</div>
              <b class="item-name">${esc(it.name)}</b>
              <div class="row2"><span class="price">${it.price ? `${COIN} ${fmt(it.price)}` : 'Ücretsiz'}</span><small>${left}</small></div>
              ${action}
            </div>`;
          }).join('') || '<div class="empty">Bu filtrede eşya yok</div>'}
        </div>
        <div class="store-bar"><span>${COIN} <b data-coins>${fmt(coins)}</b></span><a class="btn pink sm" href="#/recharge">Yüklemek</a></div>
      </div>`;

    view().querySelectorAll('[data-cat]').forEach(b => b.onclick = () => { storeCat = b.dataset.cat; A.Pages.store(); });
    view().querySelectorAll('[data-f]').forEach(b => b.onclick = () => { storeFilter = b.dataset.f; A.Pages.store(); });
    view().querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
      const it = items.find(x => x.id === b.dataset.buy);
      if (!W().buyItem(storeCat, it)) return notify('Yeterli coin yok', '😕');
      W().equip(storeCat === 'frames' ? 'frame' : 'bg', it.id);
      burst('✨', 12);
      notify(`${it.name} alındı ve kullanılıyor`, '🛍️');
      A.Pages.store();
    });
    view().querySelectorAll('[data-use]').forEach(b => b.onclick = () => {
      W().equip(storeCat === 'frames' ? 'frame' : 'bg', b.dataset.use);
      A.Pages.store();
    });
  };

  /* ========== VIP Merkezi ========== */
  A.Pages.vip = () => {
    const v = W().vip();
    const nextNeed = v.next ? v.next - v.recharged : 0;
    view().innerHTML = `
      <div class="eco vip">
        <div class="eco-head">${back('#/me')}<h1>VIP Merkezi</h1><span></span></div>
        <div class="vip-card">
          <b>VIP ${v.lv}</b>
          <span class="vip-v">V</span>
          <p>${v.next ? `VIP ${v.lv + 1} için ${fmt(nextNeed)} coin daha yükle` : 'En yüksek seviyedesin 👑'}</p>
          <div class="bar"><i style="width:${v.pct}%"></i></div>
          <div class="row2"><a class="btn sm glass" href="#/recharge">Yükle</a><small>Toplam yükleme: ${fmt(v.recharged)}</small></div>
        </div>
        ${W().vipBonusAvailable() ? `<div style="padding:0 16px"><button class="btn pink block" id="vipBonus">🪙 Günlük VIP bonusunu al (+${v.lv * 50})</button></div>` : ''}
        <h2 class="vip-title">VIP${Math.max(1, v.lv)} Ayrıcalıkları (${A.VIP_PERKS.filter(p => v.lv >= p.vip).length}/${A.VIP_PERKS.length})</h2>
        <div class="perks">
          ${A.VIP_PERKS.map(p => `
            <div class="perk ${v.lv >= p.vip ? 'on' : ''}">
              <span>${p.icon}</span><b>${esc(p.name)}</b><small>${v.lv >= p.vip ? esc(p.desc) : 'VIP' + p.vip + ' ile açılır'}</small>
            </div>`).join('')}
        </div>
        <div class="vip-levels">
          ${A.VIP_LEVELS.slice(1).map((t, i) => `<div class="${v.lv >= i + 1 ? 'on' : ''}"><b>VIP${i + 1}</b><small>${fmt(t)}</small></div>`).join('')}
        </div>
      </div>`;
    const b = $('#vipBonus');
    if (b) b.onclick = () => { const n = W().claimVipBonus(); if (n) { burst('🪙', 16); notify(`+${n} VIP bonusu`); A.Pages.vip(); } };
  };

  /* ========== Ziyaretçiler ========== */
  let visTab = 'me';
  A.Pages.visitors = () => {
    const s = W().st();
    const list = (visTab === 'me' ? s.visitors : s.visited).map(x => ({ ...x, c: A.byId(x.id) })).filter(x => x.c);
    const canSeeAll = W().hasPerk('visitors') || visTab === 'them';
    const when = ts => {
      const d = Math.floor((new Date().setHours(0, 0, 0, 0) - new Date(ts).setHours(0, 0, 0, 0)) / 86400000);
      return d <= 0 ? 'Bugün' : d === 1 ? 'Dün' : `${d} gün önce`;
    };
    view().innerHTML = `
      <div class="eco light-page">
        <div class="eco-head dark-text">${back('#/me')}<h1>Ziyaretçi kullanıcı</h1><span></span></div>
        <div class="tabs dark" style="justify-content:space-around;padding:0 16px">
          <button data-v="me" class="${visTab === 'me' ? 'active' : ''}" style="font-size:16px">Beni kim gördü</button>
          <button data-v="them" class="${visTab === 'them' ? 'active' : ''}" style="font-size:16px">Kimi ziyaret ettim</button>
        </div>
        <div class="list" style="padding:0 16px">
          ${list.length ? list.map((x, i) => {
            const hidden = !canSeeAll && i >= 3;
            return `<a class="vis-row ${hidden ? 'blur' : ''}" href="${hidden ? '#/vip' : '#/p/' + x.c.id}">
              ${U().avatar(x.c, 56, { dot: false })}
              <div><b>${esc(x.c.display)} <span class="sex">♀</span></b><small>${visTab === 'me' ? `${when(x.ts)} profilini gördü` : `${when(x.ts)} ziyaret ettin`}</small></div>
            </a>`;
          }).join('') : `<div class="empty"><span class="big">👀</span>${visTab === 'me' ? 'Henüz kimse profilini görmedi.<br>Sohbet ettikçe ziyaretçilerin artar.' : 'Henüz kimseyi ziyaret etmedin.'}</div>`}
          ${!canSeeAll && list.length > 3 ? '<a class="btn primary block" href="#/vip" style="margin:12px 0">👑 Tüm ziyaretçileri görmek için VIP1 ol</a>' : ''}
        </div>
        <p class="demo-note" style="text-align:center">En fazla 100 kayıt görüntülenebilir.</p>
      </div>`;
    view().querySelectorAll('[data-v]').forEach(b => b.onclick = () => { visTab = b.dataset.v; A.Pages.visitors(); });
  };

  /* ========== Şans Çarkı ========== */
  let wheelAngle = 0;
  A.Games = A.Games || {};
  A.Games.wheel = () => {
    const segs = A.WHEEL;
    const step = 360 / segs.length;
    const grad = segs.map((s, i) => `${s.color} ${i * step}deg ${(i + 1) * step}deg`).join(',');
    const left = W().spinsLeft();
    view().innerHTML = `
      <div class="eco game">
        <div class="eco-head">${back('#/game')}<h1>Şans Çarkı</h1><span></span></div>
        <div class="game-top">
          <div class="g-card blue"><b data-coins>${fmt(W().coins())}</b><small>Coinlerim</small></div>
          <div class="g-card orange"><b>${left}</b><small>Ücretsiz çevirme</small></div>
        </div>
        <div class="wheel-wrap">
          <div class="pointer">▼</div>
          <div class="wheel" id="wheel" style="background:conic-gradient(${grad});transform:rotate(${wheelAngle}deg)">
            ${segs.map((s, i) => `<span style="transform:rotate(${i * step + step / 2}deg)"><b>${s.coins}</b></span>`).join('')}
          </div>
          <div class="hub">♥</div>
        </div>
        <div style="padding:0 16px">
          <button class="btn pink block" id="spinBtn" ${left ? '' : 'disabled'}>${left ? 'Çevir!' : 'Yarın tekrar gel 🌙'}</button>
          <p class="demo-note" style="text-align:center">Her gün ${W().hasPerk('spin') ? 2 : 1} ücretsiz çevirme. Coin ile çevrilmez, sadece ödül kazanılır.</p>
        </div>
      </div>`;
    $('#spinBtn').onclick = e => {
      const idx = W().spin();
      if (idx === null) return;
      e.currentTarget.disabled = true;
      // seçilen dilim üstteki oka gelsin
      const target = 360 - (idx * step + step / 2);
      wheelAngle += 360 * 5 + ((target - wheelAngle) % 360 + 360) % 360;
      const wheel = $('#wheel');
      wheel.style.transition = 'transform 4s cubic-bezier(.17,.67,.12,1)';
      wheel.style.transform = `rotate(${wheelAngle}deg)`;
      setTimeout(() => { burst('🪙', 18); notify(`+${segs[idx].coins} coin kazandın!`, '🎡'); A.Games.wheel(); }, 4200);
    };
  };

  /* ========== Hediye paneli (sohbet içinde) ========== */
  let giftTab = 'hediye';
  const QTYS = [1, 3, 9, 99];

  A.GiftPanel = {
    open(c, onSent) {
      let sel = null, qty = 1;
      const sh = sheet('<div id="gp"></div>', 'gift-sheet');

      function draw() {
        const w = W().wealth();
        const vipLv = W().vip().lv;
        const bag = W().bag();
        const list = giftTab === 'canta'
          ? bag.map(b => ({ ...b.gift, owned: b.qty }))
          : A.GIFTS.filter(g => g.tab === giftTab);
        if (sel && !list.find(g => g.id === sel)) sel = null;

        $('#gp', sh.el).innerHTML = `
          <div class="gp-banner"><b>Yeni hediyeler mevcut</b><small>✦ Lüks Seyahat Teması ✦</small><span>🏎️</span><span>✈️</span></div>
          <div class="gp-level">
            <span class="lvl">Lv.${w.lv}</span>
            <div><div class="bar"><i style="width:${w.pct}%"></i></div><small>Lv.${w.lv + 1} için ${fmt(w.need)} coin daha harca</small></div>
          </div>
          <div class="gp-tabs">
            ${A.GIFT_TABS.map(([k, n]) => `<button data-gt="${k}" class="${giftTab === k ? 'on' : ''}">${k === 'canta' ? '🎒' : n}${k === 'canta' && bag.length ? '<i class="dot-red"></i>' : ''}</button>`).join('')}
          </div>
          <div class="gp-grid">
            ${list.length ? list.map(g => {
              const locked = g.vip && vipLv < g.vip;
              const tag = g.rel ? `<em class="tag" style="background:${A.RELATIONS[g.rel].color}">${A.RELATIONS[g.rel].tag}</em>`
                : g.isNew ? '<em class="tag">yeni</em>' : g.lucky ? '<em class="tag lucky">şans</em>' : locked ? `<em class="tag vipt">VIP${g.vip}</em>` : '';
              return `<button class="gcell ${sel === g.id ? 'on' : ''} ${locked ? 'locked' : ''}" data-g="${g.id}">
                ${tag}<span class="ge">${g.e}</span><b>${esc(g.name)}</b>
                <small>${g.owned ? 'x' + g.owned : `${fmt(W().unitPrice(g))} ${COIN}`}</small>
              </button>`;
            }).join('') : `<div class="empty" style="grid-column:1/-1;color:#aaa">${giftTab === 'canta' ? 'Çantan boş. Ödüllerden hediye kazanabilirsin 🎒' : 'Hediye yok'}</div>`}
          </div>
          <div class="gp-bottom">
            <div class="gp-coins">${COIN} <b data-coins>${fmt(W().coins())}</b><a href="#/recharge" id="gpRecharge">Coin yükle ›</a></div>
            <div class="gp-send">
              <button id="gpQty">${qty} ▴</button>
              <button id="gpSend" ${sel ? '' : 'disabled'}>Gönder</button>
            </div>
          </div>
          ${giftTab === 'sansli' ? '<p class="gp-note">Şanslı hediye gönderilince içinden rastgele bir hediye çıkar.</p>' : ''}
          ${giftTab === 'dostluk' ? '<p class="gp-note">Dostluk hediyesi aranızda bir ilişki rozeti oluşturur (CP, Kanka…).</p>' : ''}`;

        sh.el.querySelectorAll('[data-gt]').forEach(b => b.onclick = () => { giftTab = b.dataset.gt; draw(); });
        sh.el.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
          const g = A.W_gift(b.dataset.g);
          if (g.vip && vipLv < g.vip) return notify(`Bu hediye VIP${g.vip} ile açılır`, '🔒');
          sel = b.dataset.g; draw();
        });
        $('#gpQty', sh.el).onclick = () => { qty = QTYS[(QTYS.indexOf(qty) + 1) % QTYS.length]; draw(); };
        $('#gpRecharge', sh.el).onclick = () => sh.close();
        $('#gpSend', sh.el).onclick = () => {
          const g = A.W_gift(sel);
          const fromBag = giftTab === 'canta';
          const r = W().sendGift(c, g, qty, fromBag);
          if (!r.ok) {
            if (r.reason === 'coin') {
              sh.el.classList.add('shake'); setTimeout(() => sh.el.classList.remove('shake'), 400);
              notify('Yeterli coin yok · Yükle sayfasına git', '😕');
            } else notify(r.reason, '🎒');
            return;
          }
          burst(r.delivered.e, Math.min(30, 8 + qty * 2), true);
          onSent && onSent(r);
          draw();
        };
      }
      draw();
    }
  };
  A.W_gift = id => A.GIFTS.find(g => g.id === id);

  A.Eco = { notify, burst, sheet, back, fmt, COIN };
})();
