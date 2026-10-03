/*
 * Amor - Oyunlar (sadece sanal coin)
 * ----------------------------------
 *   #/game            oyun merkezi
 *   #/game/wheel      günlük ücretsiz şans çarkı (shop.js)
 *   #/game/blackjack  21: krupiye 17'de durur, blackjack 3:2 öder
 *   #/game/slot       3 makaralı slot makinesi
 * Coinler tamamen sanaldır; gerçek para ile alınamaz, çekilemez.
 */
window.Amor = window.Amor || {};

(() => {
  const A = window.Amor;
  const W = () => A.Wallet;
  const S = () => A.Store.state;
  const $ = (sel, root = document) => root.querySelector(sel);
  const view = () => $('#view');
  const E = () => A.Eco;
  const fmt = n => Number(n).toLocaleString('tr-TR');
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const BETS = [10, 50, 100, 500];

  A.Games = A.Games || {};

  function stats(game) {
    const g = S().games = S().games || {};
    return g[game] = g[game] || { played: 0, won: 0, net: 0, best: 0 };
  }
  function record(game, bet, payout) {
    const st = stats(game);
    st.played++;
    if (payout > bet) st.won++;
    st.net += payout - bet;
    st.best = Math.max(st.best, payout - bet);
    A.Store.save();
  }

  /* ========== Oyun merkezi ========== */
  A.Pages.game = r => {
    if (r && r.id && A.Games[r.id]) return A.Games[r.id]();
    const left = W().spinsLeft();
    const bj = stats('blackjack'), sl = stats('slot');
    view().innerHTML = `
      <div class="eco game game-hub">
        <div class="eco-head">${E().back('#/me')}<h1>Etkileşimli oyun</h1><span></span></div>
        <div class="hub-top">
          <a class="hub-wheel" href="#/game/wheel">
            <span class="hw-art">🎡</span>
            <div><b>Şans Çarkı</b><small>${left ? `${left} ücretsiz çevirme hazır` : 'Yarın tekrar ücretsiz'}</small>
            <span class="btn sm gold">${left ? 'Çevir' : 'Bak'}</span></div>
          </a>
          <div class="g-card blue"><b data-coins>${fmt(W().coins())}</b><small>Coinlerim</small></div>
        </div>
        <h2 class="hub-title">Tüm Oyunlar</h2>
        <div class="game-grid">
          <a class="game-tile slot-tile" href="#/game/slot">
            <em>Slot</em><span class="gt-art">🎰</span><b>Amor Slot</b>
            <small>${sl.played ? `${sl.played} el · en büyük +${fmt(sl.best)}` : '3 makara, 7️⃣7️⃣7️⃣ = x150'}</small>
          </a>
          <a class="game-tile bj-tile" href="#/game/blackjack">
            <em>Kart</em><span class="gt-art">🃏</span><b>Blackjack</b>
            <small>${bj.played ? `${bj.played} el · ${bj.won} kazanç` : "21'e en yakın kazanır"}</small>
          </a>
          <a class="game-tile wheel-tile" href="#/game/wheel">
            <em>Günlük</em><span class="gt-art">🎡</span><b>Şans Çarkı</b>
            <small>Ücretsiz, coin harcamaz</small>
          </a>
        </div>
        <p class="demo-note" style="text-align:center">🧪 Coinler tamamen sanaldır, gerçek para ile alınamaz ve çekilemez. Biterse Ödüller'den ve çarktan kazanabilirsin.</p>
      </div>`;
  };

  /* ========== Blackjack ========== */
  const SUITS = ['♠', '♥', '♦', '♣'];
  const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  let bj = { phase: 'bet', bet: 50, deck: [], player: [], dealer: [], msg: '', result: null };

  function newDeck() {
    const d = [];
    for (let k = 0; k < 4; k++) for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [d[i], d[j]] = [d[j], d[i]]; }
    return d;
  }
  function handValue(hand) {
    let v = 0, aces = 0;
    hand.forEach(c => { if (c.r === 'A') { v += 11; aces++; } else v += ['J', 'Q', 'K'].includes(c.r) ? 10 : Number(c.r); });
    while (v > 21 && aces) { v -= 10; aces--; }
    return v;
  }
  const isBJ = h => h.length === 2 && handValue(h) === 21;
  const draw = () => { if (bj.deck.length < 15) bj.deck = newDeck(); return bj.deck.pop(); };

  function cardHtml(c, hidden, i) {
    if (hidden) return `<div class="play-card back" style="--i:${i}"></div>`;
    const red = c.s === '♥' || c.s === '♦';
    return `<div class="play-card ${red ? 'red' : ''}" style="--i:${i}"><b>${c.r}</b><span>${c.s}</span><b class="br">${c.r}</b></div>`;
  }

  function finishBJ(result) {
    const bet = bj.bet;
    const payout = { win: bet * 2, blackjack: Math.floor(bet * 2.5), push: bet, lose: 0 }[result];
    if (payout) W().add(payout, `Blackjack · ${result === 'push' ? 'berabere' : 'kazanç'}`);
    record('blackjack', bet, payout);
    bj.phase = 'done';
    bj.result = result;
    bj.msg = { win: `Kazandın! +${fmt(payout - bet)}`, blackjack: `BLACKJACK! +${fmt(payout - bet)}`, push: 'Berabere, bahsin iade edildi', lose: `Kaybettin −${fmt(bet)}` }[result];
    if (result === 'win' || result === 'blackjack') E().burst(result === 'blackjack' ? '🃏' : '🪙', 16);
    bj.bet = bj.baseBet; // ikiye katlandıysa eski bahse dön
    A.Games.blackjack();
  }

  function dealerPlay() {
    bj.phase = 'dealer';
    while (handValue(bj.dealer) < 17) bj.dealer.push(draw());
    const p = handValue(bj.player), d = handValue(bj.dealer);
    finishBJ(d > 21 || p > d ? 'win' : p === d ? 'push' : 'lose');
  }

  A.Games.blackjack = () => {
    const playing = bj.phase === 'play';
    const hideHole = playing;
    const pv = handValue(bj.player), dv = hideHole ? handValue([bj.dealer[0]].filter(Boolean)) : handValue(bj.dealer);
    const st = stats('blackjack');
    view().innerHTML = `
      <div class="eco game bj">
        <div class="eco-head">${E().back('#/game')}<h1>Blackjack</h1><span class="coin-pill">${E().COIN} <b data-coins>${fmt(W().coins())}</b></span></div>
        <div class="table">
          <div class="hand-area">
            <small>Krupiye ${bj.dealer.length ? `· ${dv}${hideHole ? '+?' : ''}` : ''}</small>
            <div class="hand">${bj.dealer.map((c, i) => cardHtml(c, hideHole && i === 1, i)).join('') || '<div class="play-card ghost"></div><div class="play-card ghost"></div>'}</div>
          </div>
          <div class="bj-msg ${bj.result || ''}">${bj.msg || 'Bahsini seç ve dağıt'}</div>
          <div class="hand-area">
            <div class="hand">${bj.player.map((c, i) => cardHtml(c, false, i)).join('') || '<div class="play-card ghost"></div><div class="play-card ghost"></div>'}</div>
            <small>Sen ${bj.player.length ? `· ${pv}` : ''}</small>
          </div>
        </div>
        ${playing ? `
          <div class="bj-actions">
            <button class="btn ghost" id="hit">Kart çek</button>
            <button class="btn pink" id="stand">Dur</button>
            <button class="btn gold" id="double" ${bj.player.length === 2 && W().coins() >= bj.bet ? '' : 'disabled'}>2x</button>
          </div>` : `
          <div class="chips-row">${BETS.map(b => `<button class="chip-btn ${bj.bet === b ? 'on' : ''}" data-bet="${b}">${b}</button>`).join('')}</div>
          <div class="bj-actions"><button class="btn pink block" id="deal">Dağıt · ${fmt(bj.bet)} coin</button></div>`}
        <p class="demo-note" style="text-align:center">Krupiye 17'de durur · Blackjack 3:2 öder · ${st.played} el oynandı, ${st.won} kazanç</p>
      </div>`;

    view().querySelectorAll('[data-bet]').forEach(b => b.onclick = () => { bj.bet = +b.dataset.bet; A.Games.blackjack(); });
    const deal = $('#deal');
    if (deal) deal.onclick = () => {
      if (!W().spend(bj.bet, 'Blackjack bahsi')) return E().notify('Yeterli coin yok', '😕');
      bj.baseBet = bj.bet;
      bj.player = [draw(), draw()];
      bj.dealer = [draw(), draw()];
      bj.phase = 'play'; bj.msg = ''; bj.result = null;
      if (isBJ(bj.player) || isBJ(bj.dealer)) {
        return finishBJ(isBJ(bj.player) && isBJ(bj.dealer) ? 'push' : isBJ(bj.player) ? 'blackjack' : 'lose');
      }
      A.Games.blackjack();
    };
    const hit = $('#hit');
    if (hit) hit.onclick = () => {
      bj.player.push(draw());
      const v = handValue(bj.player);
      if (v > 21) return finishBJ('lose');
      if (v === 21) return dealerPlay();
      A.Games.blackjack();
    };
    const stand = $('#stand');
    if (stand) stand.onclick = dealerPlay;
    const dbl = $('#double');
    if (dbl) dbl.onclick = () => {
      if (!W().spend(bj.bet, 'Blackjack 2x')) return;
      bj.bet *= 2;
      bj.player.push(draw());
      if (handValue(bj.player) > 21) return finishBJ('lose');
      dealerPlay();
    };
  };

  /* ========== Slot makinesi ========== */
  const SYMBOLS = [
    { e: '🍒', w: 30, pay: 5 }, { e: '🍋', w: 25, pay: 8 }, { e: '🍇', w: 20, pay: 10 }, { e: '🔔', w: 12, pay: 15 },
    { e: '⭐', w: 8, pay: 25 }, { e: '💋', w: 6, pay: 40 }, { e: '💎', w: 4, pay: 75 }, { e: '7️⃣', w: 2, pay: 150 }
  ];
  const TOTAL_W = SYMBOLS.reduce((a, s) => a + s.w, 0);
  const ROW = 84; // bir sembolün yüksekliği (px)
  let slot = { bet: 50, result: ['🍒', '🍋', '🍇'], spinning: false, lastWin: 0, msg: '' };

  function roll() {
    let r = Math.random() * TOTAL_W;
    for (const s of SYMBOLS) { r -= s.w; if (r <= 0) return s.e; }
    return SYMBOLS[0].e;
  }
  // Kazanç: 3 aynı -> tablo; 2 kiraz -> x2; herhangi 2 aynı -> bahis iade
  function payoutFor(res, bet) {
    if (res[0] === res[1] && res[1] === res[2]) return bet * SYMBOLS.find(s => s.e === res[0]).pay;
    if (res.filter(e => e === '🍒').length === 2) return bet * 2;
    if (res[0] === res[1] || res[1] === res[2] || res[0] === res[2]) return bet;
    return 0;
  }

  A.Games.slot = () => {
    const st = stats('slot');
    view().innerHTML = `
      <div class="eco game slotp">
        <div class="eco-head">${E().back('#/game')}<h1>Amor Slot</h1><span class="coin-pill">${E().COIN} <b data-coins>${fmt(W().coins())}</b></span></div>
        <div class="machine">
          <div class="machine-top">💗 AMOR SLOT 💗</div>
          <div class="reels">
            ${[0, 1, 2].map(i => `<div class="reel"><div class="strip" id="strip${i}">${['', slot.result[i], ''].map(e => `<div class="sym">${e || roll()}</div>`).join('')}</div></div>`).join('')}
            <div class="payline"></div>
          </div>
          <div class="slot-msg ${slot.lastWin ? 'win' : ''}" id="slotMsg">${slot.msg || 'Bahsini seç ve çevir'}</div>
        </div>
        <div class="chips-row">${BETS.map(b => `<button class="chip-btn ${slot.bet === b ? 'on' : ''}" data-bet="${b}">${b}</button>`).join('')}</div>
        <div style="padding:0 16px"><button class="btn pink block spin-btn" id="spin">🎰 Çevir · ${fmt(slot.bet)} coin</button></div>
        <details class="paytable">
          <summary>Ödeme tablosu</summary>
          ${SYMBOLS.slice().reverse().map(s => `<div><span>${s.e}${s.e}${s.e}</span><b>x${s.pay}</b></div>`).join('')}
          <div><span>🍒🍒 (iki kiraz)</span><b>x2</b></div>
          <div><span>Herhangi iki aynı</span><b>x1</b></div>
        </details>
        <p class="demo-note" style="text-align:center">${st.played} çevirme · en büyük kazanç +${fmt(st.best)} · Coinler sanaldır.</p>
      </div>`;

    view().querySelectorAll('[data-bet]').forEach(b => b.onclick = () => { if (!slot.spinning) { slot.bet = +b.dataset.bet; A.Games.slot(); } });
    $('#spin').onclick = e => {
      if (slot.spinning) return;
      if (!W().spend(slot.bet, 'Slot bahsi')) return E().notify('Yeterli coin yok', '😕');
      slot.spinning = true;
      e.currentTarget.disabled = true;
      $('#slotMsg').textContent = 'Dönüyor…';
      $('#slotMsg').className = 'slot-msg';
      const res = [roll(), roll(), roll()];
      // Her makaraya uzun bir şerit koy; sonucu ortadaki satıra getir
      res.forEach((sym, i) => {
        const strip = $(`#strip${i}`);
        const n = 22 + i * 6;
        const items = Array.from({ length: n }, () => roll());
        items[n - 2] = sym;
        strip.style.transition = 'none';
        strip.style.transform = 'translateY(0)';
        strip.innerHTML = items.map(x => `<div class="sym">${x}</div>`).join('');
        strip.offsetHeight; // yeniden çizim
        strip.style.transition = `transform ${1.2 + i * 0.45}s cubic-bezier(.15,.85,.25,1)`;
        strip.style.transform = `translateY(-${(n - 3) * ROW}px)`;
      });
      setTimeout(() => {
        const win = payoutFor(res, slot.bet);
        if (win) W().add(win, 'Slot kazancı');
        record('slot', slot.bet, win);
        slot.result = res;
        slot.lastWin = win > slot.bet ? win : 0;
        slot.msg = win > slot.bet ? `Kazandın! +${fmt(win - slot.bet)}` : win === slot.bet ? 'Bahsin iade edildi' : 'Olmadı, bir daha?';
        if (win >= slot.bet * 10) E().burst(res[0], 24, true);
        else if (win > slot.bet) E().burst('🪙', 12);
        slot.spinning = false;
        A.Games.slot();
      }, 1200 + 2 * 450 + 150);
    };
  };
})();
