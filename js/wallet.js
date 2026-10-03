/*
 * Amor - Cüzdan ve ekonomi (sadece sanal coin)
 * ---------------------------------------------
 * Coin bakiyesi, yükleme simülasyonu, VIP, günlük giriş, görevler, başarımlar,
 * çanta (hediye envanteri), çerçeve/arka plan eşyaları, ziyaretçiler ve hediye gönderme.
 */
window.Amor = window.Amor || {};

Amor.Wallet = (() => {
  const S = () => Amor.Store.state;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const DAY = 86400000;

  function today(offset = 0) {
    const d = new Date(Date.now() + offset * DAY);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  const monthKey = () => today().slice(0, 7);

  /* ---------- Durum (eksik alanları tamamla, gün/ay değişince sıfırla) ---------- */
  function st() {
    const s = S();
    if (!s.wallet) s.wallet = { coins: Amor.START_COINS, earned: 0, spent: 0, recharged: 0, history: [] };
    if (!s.inventory) s.inventory = { gifts: {}, frames: {}, bgs: {} };
    if (!s.equipped) s.equipped = { frame: null, bg: 'mor-gece' };
    if (!s.giftsReceived) s.giftsReceived = {};
    if (!s.relations) s.relations = {};
    if (!s.visitors) s.visitors = [];
    if (!s.visited) s.visited = [];
    if (!s.checkin) s.checkin = { last: '', streak: 0 };
    if (!s.achievements) s.achievements = { claimed: [] };
    if (!s.daily || s.daily.date !== today()) {
      s.daily = { date: today(), msg: 0, gift: 0, spin: 0, spinsUsed: 0, chats: [], visits: [], claimed: [], vipBonus: false };
    }
    if (!s.monthly || s.monthly.key !== monthKey()) s.monthly = { key: monthKey(), recharged: 0, claimed: [] };
    return s;
  }
  const save = () => Amor.Store.save();

  /* ---------- Coin ---------- */
  const coins = () => st().wallet.coins;

  function log(amount, reason) {
    const w = st().wallet;
    w.history.unshift({ ts: Date.now(), amount, reason });
    w.history = w.history.slice(0, 200);
  }

  function add(amount, reason) {
    const w = st().wallet;
    w.coins += amount;
    if (reason !== 'Yükleme') w.earned += amount;
    log(amount, reason);
    save();
    Amor.Wallet.onChange && Amor.Wallet.onChange();
  }

  function spend(amount, reason) {
    const w = st().wallet;
    if (w.coins < amount) return false;
    w.coins -= amount;
    w.spent += amount;
    log(-amount, reason);
    save();
    Amor.Wallet.onChange && Amor.Wallet.onChange();
    return true;
  }

  /* ---------- Seviyeler ---------- */
  // Harcamaya göre kullanıcı seviyesi (hediye panelindeki Lv)
  function wealth() {
    const spent = st().wallet.spent;
    const lv = Math.floor(Math.sqrt(spent / 50)) + 1;
    const prev = (lv - 1) ** 2 * 50, next = lv ** 2 * 50;
    return { lv, spent, prev, next, need: next - spent, pct: Math.round((spent - prev) / (next - prev) * 100) };
  }

  function vip() {
    const r = st().wallet.recharged;
    let lv = 0;
    Amor.VIP_LEVELS.forEach((t, i) => { if (i > 0 && r >= t) lv = i; });
    const next = Amor.VIP_LEVELS[lv + 1] ?? null;
    const prev = Amor.VIP_LEVELS[lv];
    return { lv, recharged: r, next, pct: next ? Math.round((r - prev) / (next - prev) * 100) : 100 };
  }
  const hasPerk = id => {
    const p = Amor.VIP_PERKS.find(x => x.id === id);
    return !!p && vip().lv >= p.vip;
  };

  /* ---------- Yükleme (simülasyon) ---------- */
  function recharge(pack) {
    const s = st();
    const total = pack.coins + (pack.bonus || 0);
    s.wallet.recharged += pack.coins;
    s.monthly.recharged += pack.coins;
    add(total, 'Yükleme');
    return total;
  }

  function monthlyTiers() {
    const m = st().monthly;
    return Amor.MONTHLY_TIERS.map((t, i) => ({ ...t, i, reached: m.recharged >= t.at, claimed: m.claimed.includes(i) }));
  }

  function grant(reward, reason) {
    if (reward.coins) add(reward.coins, reason);
    if (reward.gift) addGift(reward.gift, reward.qty || 1);
    if (reward.frame) giveItem('frames', reward.frame, reward.days || 3);
    save();
  }

  function claimTier(i) {
    const t = monthlyTiers()[i];
    if (!t || !t.reached || t.claimed) return false;
    st().monthly.claimed.push(i);
    grant(t.reward, 'Yükleme Yıldızı');
    return true;
  }

  /* ---------- Günlük giriş ---------- */
  function checkinState() {
    const c = st().checkin;
    const done = c.last === today();
    const continues = c.last === today(-1);
    const streak = done ? c.streak : (continues ? c.streak : 0);
    return { done, streak, dayIndex: done ? (streak - 1) % 7 : streak % 7 };
  }

  function doCheckin() {
    const c = st().checkin;
    const cs = checkinState();
    if (cs.done) return null;
    c.streak = cs.streak + 1;
    c.last = today();
    const reward = Amor.CHECKIN[(c.streak - 1) % 7];
    grant(reward, `Giriş ödülü · ${c.streak}. gün`);
    return reward;
  }

  /* ---------- Görevler ---------- */
  function track(event, data) {
    const d = st().daily;
    if (event === 'msg') d.msg++;
    if (event === 'gift') d.gift++;
    if (event === 'spin') d.spin++;
    if (event === 'chat' && !d.chats.includes(data)) d.chats.push(data);
    if (event === 'visit') {
      if (!d.visits.includes(data)) d.visits.push(data);
      const v = st().visited.filter(x => x.id !== data);
      v.unshift({ id: data, ts: Date.now() });
      st().visited = v.slice(0, 100);
    }
    save();
  }

  function taskProgress(t) {
    const d = st().daily;
    const n = { msg: d.msg, chat: d.chats.length, visit: d.visits.length, gift: d.gift, spin: d.spin }[t.id] || 0;
    return { n: Math.min(n, t.target), target: t.target, done: n >= t.target, claimed: d.claimed.includes(t.id) };
  }

  function claimTask(id) {
    const t = Amor.DAILY_TASKS.find(x => x.id === id);
    const p = taskProgress(t);
    if (!p.done || p.claimed) return false;
    st().daily.claimed.push(id);
    add(t.coins, `Görev · ${t.name}`);
    return true;
  }

  function achievementProgress(a) {
    const s = st();
    let n = 0, target = a.target || 1;
    if (a.id === 'name') n = s.user.name ? 1 : 0;
    if (a.id === 'follow') n = Object.values(s.follows).filter(Boolean).length;
    if (a.id === 'lv3') n = (Amor.CHARACTERS || []).some(c => Amor.Engine.level(c).lv >= 3) ? 1 : 0;
    if (a.id === 'create') n = s.createdCount ? 1 : 0;
    if (a.id === 'recharge') n = s.wallet.recharged > 0 ? 1 : 0;
    return { n: Math.min(n, target), target, done: n >= target, claimed: s.achievements.claimed.includes(a.id) };
  }

  function claimAchievement(id) {
    const a = Amor.ACHIEVEMENTS.find(x => x.id === id);
    const p = achievementProgress(a);
    if (!p.done || p.claimed) return false;
    st().achievements.claimed.push(id);
    grant({ coins: a.coins, frame: a.frame, days: a.days }, `Başarım · ${a.name}`);
    return true;
  }

  function claimableCount() {
    let n = checkinState().done ? 0 : 1;
    Amor.DAILY_TASKS.forEach(t => { const p = taskProgress(t); if (p.done && !p.claimed) n++; });
    Amor.ACHIEVEMENTS.forEach(a => { const p = achievementProgress(a); if (p.done && !p.claimed) n++; });
    monthlyTiers().forEach(t => { if (t.reached && !t.claimed) n++; });
    return n;
  }

  /* ---------- VIP günlük bonus ---------- */
  function vipBonusAvailable() { return hasPerk('daily') && !st().daily.vipBonus; }
  function claimVipBonus() {
    if (!vipBonusAvailable()) return 0;
    st().daily.vipBonus = true;
    const n = vip().lv * 50;
    add(n, 'VIP günlük bonus');
    return n;
  }

  /* ---------- Şans çarkı ---------- */
  function spinsLeft() {
    const free = hasPerk('spin') ? 2 : 1;
    return Math.max(0, free - st().daily.spinsUsed);
  }
  function spin() {
    if (!spinsLeft()) return null;
    const total = Amor.WHEEL.reduce((a, s) => a + s.w, 0);
    let r = Math.random() * total, idx = 0;
    for (; idx < Amor.WHEEL.length; idx++) { r -= Amor.WHEEL[idx].w; if (r <= 0) break; }
    idx = Math.min(idx, Amor.WHEEL.length - 1);
    st().daily.spinsUsed++;
    track('spin');
    add(Amor.WHEEL[idx].coins, 'Şans çarkı');
    return idx;
  }

  /* ---------- Çanta ---------- */
  function addGift(id, qty = 1) {
    const g = st().inventory.gifts;
    g[id] = (g[id] || 0) + qty;
    save();
  }
  const bag = () => Object.entries(st().inventory.gifts).filter(([, n]) => n > 0)
    .map(([id, n]) => ({ gift: giftById(id), qty: n })).filter(x => x.gift);

  /* ---------- Eşyalar (çerçeve / arka plan) ---------- */
  function giveItem(kind, id, days) {
    const inv = st().inventory[kind];
    const base = Math.max(Date.now(), inv[id] || 0);
    inv[id] = base + days * DAY;
    save();
  }
  function owns(kind, id) {
    if (kind === 'frames' && id === 'vip') return hasPerk('frame');
    if (kind === 'bgs' && id === 'mor-gece') return true;
    return (st().inventory[kind][id] || 0) > Date.now();
  }
  const expiresIn = (kind, id) => Math.ceil(((st().inventory[kind][id] || 0) - Date.now()) / DAY);

  function buyItem(kind, item) {
    if (!spend(item.price, `Mağaza · ${item.name}`)) return false;
    giveItem(kind, item.id, Amor.ITEM_DAYS);
    return true;
  }
  function equip(slot, id) {
    st().equipped[slot] = id;
    save();
  }
  function activeFrame() {
    const id = st().equipped.frame;
    return id && owns('frames', id) ? Amor.FRAMES.find(f => f.id === id) : null;
  }
  function activeBg() {
    const id = st().equipped.bg;
    const bg = id && owns('bgs', id) ? Amor.BACKGROUNDS.find(b => b.id === id) : null;
    return bg || Amor.BACKGROUNDS[0];
  }

  /* ---------- Ziyaretçiler ---------- */
  function addVisitor(id) {
    const v = st().visitors.filter(x => x.id !== id);
    v.unshift({ id, ts: Date.now() });
    st().visitors = v.slice(0, 100);
    save();
  }

  /* ---------- Hediye gönder ---------- */
  const giftById = id => Amor.GIFTS.find(g => g.id === id);

  function unitPrice(gift) {
    return hasPerk('discount') ? Math.round(gift.price * 0.95) : gift.price;
  }

  // Şanslı hediye -> değer aralığında rastgele bir normal hediye
  function resolveLucky(gift) {
    if (!gift.lucky) return gift;
    const [lo, hi] = gift.lucky;
    const pool = Amor.GIFTS.filter(g => g.tab === 'hediye' && !g.vip && g.price >= lo && g.price <= hi);
    return pick(pool.length ? pool : [giftById('gul')]);
  }

  /* fromBag: çantadan gönderiliyorsa coin harcanmaz
   * döner: { ok, reason, delivered, qty, value } */
  function sendGift(c, gift, qty, fromBag) {
    const s = st();
    if (fromBag) {
      if ((s.inventory.gifts[gift.id] || 0) < qty) return { ok: false, reason: 'Çantada yeterli yok' };
      s.inventory.gifts[gift.id] -= qty;
    } else {
      const cost = unitPrice(gift) * qty;
      if (!spend(cost, `Hediye · ${gift.name} x${qty} → ${c.name}`)) return { ok: false, reason: 'coin' };
    }
    const delivered = resolveLucky(gift);
    const rec = s.giftsReceived[c.id] = s.giftsReceived[c.id] || {};
    rec[delivered.id] = (rec[delivered.id] || 0) + qty;
    if (gift.rel) s.relations[c.id] = gift.rel;
    track('gift');
    save();
    return { ok: true, gift, delivered, qty, value: delivered.price * qty, rel: gift.rel ? Amor.RELATIONS[gift.rel] : null };
  }

  function receivedCount(id) {
    return Object.values(st().giftsReceived[id] || {}).reduce((a, b) => a + b, 0);
  }

  return {
    st, today, coins, add, spend, wealth, vip, hasPerk,
    recharge, monthlyTiers, claimTier,
    checkinState, doCheckin, track, taskProgress, claimTask, achievementProgress, claimAchievement, claimableCount,
    vipBonusAvailable, claimVipBonus, spinsLeft, spin,
    addGift, bag, owns, expiresIn, buyItem, equip, activeFrame, activeBg,
    addVisitor, giftById, unitPrice, sendGift, receivedCount,
    onChange: null
  };
})();
