/*
 * Amor - Mağaza, hediye, ödül ve VIP verileri
 * --------------------------------------------
 * Tüm para birimi sanal "coin"dir. Yükleme paketlerindeki ₺ fiyatlar sadece
 * görünüm içindir; satın alma bir simülasyondur, gerçek ödeme alınmaz.
 */
window.Amor = window.Amor || {};

Amor.START_COINS = 200;

/* ---------- Hediyeler ----------
 * tab: hediye | dostluk | sansli
 * rel: dostluk hediyesi gönderilince kurulan ilişki
 * lucky: [min, max] şanslı hediye, bu değer aralığında rastgele bir hediyeye dönüşür
 * vip: bu VIP seviyesinden itibaren açılır */
Amor.GIFTS = [
  { id: 'hatmi', name: 'Hatmi', e: '🍡', price: 10, tab: 'hediye' },
  { id: 'kahve', name: 'Sıcak kahve', e: '☕', price: 15, tab: 'hediye', isNew: true },
  { id: 'seni-seviyorum', name: 'Seni seviyorum', e: '🫶', price: 20, tab: 'hediye' },
  { id: 'cikolata', name: 'Çikolata', e: '🍫', price: 30, tab: 'hediye', isNew: true },
  { id: 'kalp-seker', name: 'Kalp şekeri', e: '💝', price: 50, tab: 'hediye' },
  { id: 'pembe-seker', name: 'Pembe şeker', e: '🍭', price: 50, tab: 'hediye' },
  { id: 'aycicegi', name: 'Ayçiçeği', e: '🌻', price: 60, tab: 'hediye', isNew: true },
  { id: 'cilek', name: 'Çikolatalı çilek', e: '🍓', price: 70, tab: 'hediye', isNew: true },
  { id: 'pasta', name: 'Doğum günü pastası', e: '🎂', price: 80, tab: 'hediye', isNew: true },
  { id: 'ucan-ev', name: 'Uçan ev', e: '🎈', price: 90, tab: 'hediye' },
  { id: 'yildiz', name: 'Yıldız', e: '⭐', price: 100, tab: 'hediye' },
  { id: 'lale', name: 'Lale buketi', e: '🌷', price: 110, tab: 'hediye', isNew: true },
  { id: 'cicek-dili', name: 'Çiçek dili', e: '💐', price: 120, tab: 'hediye' },
  { id: 'gul', name: 'Gül', e: '🌹', price: 150, tab: 'hediye' },
  { id: 'ucan-kelebek', name: 'Uçan kelebek', e: '🦋', price: 190, tab: 'hediye' },
  { id: 'yildiz-isigi', name: 'Yıldız ışığı', e: '🌟', price: 200, tab: 'hediye' },
  { id: 'inci', name: 'Değerli inci', e: '🦪', price: 250, tab: 'hediye' },
  { id: 'ask-mektubu', name: 'Aşk mektubu', e: '💌', price: 300, tab: 'hediye' },
  { id: 'kedicik', name: 'Tatlı kedicik', e: '🐱', price: 350, tab: 'hediye', isNew: true },
  { id: 'parfum', name: 'Parfüm', e: '🧴', price: 400, tab: 'hediye', isNew: true },
  { id: 'gokkusagi', name: 'Gökkuşağı', e: '🌈', price: 450, tab: 'hediye', isNew: true },
  { id: 'ask', name: 'Aşk', e: '❤️', price: 500, tab: 'hediye' },
  { id: 'kristal-kure', name: 'Kristal küre', e: '🔮', price: 650, tab: 'hediye', isNew: true },
  { id: 'havai-fisek', name: 'Havai fişek', e: '🎆', price: 700, tab: 'hediye' },
  { id: 'serenat', name: 'Gitarla serenat', e: '🎸', price: 800, tab: 'hediye', isNew: true },
  { id: 'cicek-ayi', name: 'Çiçek getiren ayı', e: '🧸', price: 850, tab: 'hediye' },
  { id: 'dans-eden-kalp', name: 'Dans eden kalp', e: '💗', price: 999, tab: 'hediye' },
  { id: 'opucuk', name: 'Öpücük', e: '💋', price: 1200, tab: 'hediye' },
  { id: 'beyaz-hayal', name: 'Beyaz hayal', e: '🕊️', price: 1500, tab: 'hediye' },
  { id: 'elmas-kolye', name: 'Elmas kolye', e: '📿', price: 1800, tab: 'hediye', isNew: true },
  { id: 'nisan-yuzugu', name: 'Nişan yüzüğü', e: '💍', price: 2000, tab: 'hediye' },
  { id: 'ay-isigi', name: 'Ay ışığında dans', e: '🌙', price: 2500, tab: 'hediye', isNew: true },
  { id: 'altin-asa', name: 'Altın asa', e: '🪄', price: 2990, tab: 'hediye' },
  { id: 'sakura-spor', name: 'Sakura spor', e: '🏎️', price: 3000, tab: 'hediye' },
  { id: 'paris', name: 'Paris tatili', e: '🗼', price: 4000, tab: 'hediye', isNew: true },
  { id: 'ask-kalesi', name: 'Aşk kalesi', e: '🏰', price: 5000, tab: 'hediye' },
  { id: 'unicorn', name: 'Sihirli unicorn', e: '🦄', price: 6500, tab: 'hediye', isNew: true },
  { id: 'altin-ucak', name: 'Altın uçak', e: '✈️', price: 8000, tab: 'hediye' },
  { id: 'altin-roket', name: 'Altın roket', e: '🚀', price: 10000, tab: 'hediye' },
  { id: 'derin-deniz', name: 'Derin deniz', e: '🐋', price: 14999, tab: 'hediye' },
  { id: 'ozel-ada', name: 'Özel ada', e: '🏝️', price: 20000, tab: 'hediye', isNew: true },
  { id: 'balina-yat', name: 'Balina yat', e: '🛳️', price: 29999, tab: 'hediye' },
  { id: 'ejderha', name: 'Altın ejderha', e: '🐉', price: 39999, tab: 'hediye', isNew: true },
  { id: 'lunapark', name: 'Lunapark', e: '🎡', price: 59990, tab: 'hediye' },
  { id: 'gul-kalesi', name: 'Gül kalesi', e: '🏯', price: 99990, tab: 'hediye' },
  { id: 'donen-kale', name: 'Dönen kale', e: '🌌', price: 177770, tab: 'hediye' },
  { id: 'vip-tac', name: 'VIP taç', e: '👑', price: 5990, tab: 'hediye', vip: 5 },

  { id: 'degerli-tas', name: 'Değerli taş yüzük', e: '💍', price: 1500, tab: 'dostluk', rel: 'cp' },
  { id: 'ask-yuzugu', name: 'Aşk yüzüğü', e: '💎', price: 3999, tab: 'dostluk', rel: 'cp' },
  { id: 'sihirli-tac', name: 'Sihirli taç', e: '👑', price: 1000, tab: 'dostluk', rel: 'kanka' },
  { id: 'yildiz-elmas', name: 'Yıldız elmas', e: '💠', price: 3999, tab: 'dostluk', rel: 'kanka' },
  { id: 'sabah-yildizi', name: 'Sabah yıldızı', e: '🌅', price: 1000, tab: 'dostluk', rel: 'eslik' },
  { id: 'koruyucu-asa', name: 'Koruyucu asa', e: '🔱', price: 1000, tab: 'dostluk', rel: 'koruyucu' },

  { id: 'sans-yildizi', name: 'Şans yıldızı', e: '🍀', price: 100, tab: 'sansli', lucky: [50, 500] },
  { id: 'gizemli-kutu', name: 'Gizemli kutu', e: '🎁', price: 400, tab: 'sansli', lucky: [150, 2000] },
  { id: 'altin-yumurta', name: 'Altın yumurta', e: '🥚', price: 1000, tab: 'sansli', lucky: [400, 5000] }
];

Amor.GIFT_TABS = [['hediye', 'hediye'], ['dostluk', 'Dostluk'], ['sansli', 'Şanslı Hediyeler'], ['canta', 'Çanta']];

Amor.RELATIONS = {
  cp: { tag: 'CP', title: 'Sevgili', color: '#ff3d8b', line: 'artık sevgiliyiz yani 🙈💕' },
  kanka: { tag: 'Kanka', title: 'Kanka', color: '#8b5cf6', line: 'kankam benim 👑' },
  eslik: { tag: 'Eşlik', title: 'Yol arkadaşı', color: '#f97316', line: 'yol arkadaşım oldun 🌅' },
  koruyucu: { tag: 'Koruyucu', title: 'Koruyucu', color: '#0ea5e9', line: 'koruyucum sensin artık 🔱' }
};

// Kişiliğe göre hediyeden ne kadar etkilenir
Amor.GIFT_LOVE = { nese: 1.1, soguk: 0.5, utangac: 0.9, flortoz: 1.4, dramatik: 1.25, olgun: 0.7 };

/* ---------- Yükleme paketleri (simülasyon) ---------- */
Amor.RECHARGE_PACKS = [
  { coins: 300, price: 14.65 },
  { coins: 1000, price: 48.82 },
  { coins: 3000, price: 146.46 },
  { coins: 7000, price: 341.74, bonus: 200 },
  { coins: 14000, price: 683.48, bonus: 500 },
  { coins: 35000, price: 1708.70, bonus: 1500 },
  { coins: 100000, price: 4881.99, bonus: 5000 },
  { coins: 150000, price: 7322.99, bonus: 9000 },
  { coins: 250000, price: 12204.98, bonus: 18000 }
];

// Aylık yükleme hedefleri (Yükleme Yıldızı etkinliği)
Amor.MONTHLY_TIERS = [
  { at: 5000, label: '300 coin', reward: { coins: 300 } },
  { at: 15000, label: 'Yıldız çerçeve · 3 gün', reward: { frame: 'yildiz', days: 3 } },
  { at: 30000, label: '1000 coin + Altın roket', reward: { coins: 1000, gift: 'altin-roket' } },
  { at: 50000, label: '3000 coin + Gül kalesi', reward: { coins: 3000, gift: 'gul-kalesi' } }
];

/* ---------- VIP ---------- */
Amor.VIP_LEVELS = [0, 300, 5000, 20000, 50000, 150000, 500000]; // toplam yükleme
Amor.VIP_PERKS = [
  { id: 'frame', name: 'VIP Çerçevesi', icon: '💠', vip: 1, desc: 'Mağazada VIP çerçevesi ücretsiz' },
  { id: 'badge', name: 'VIP Madalyası', icon: '🎖️', vip: 1, desc: 'İsminin yanında VIP rozeti' },
  { id: 'visitors', name: 'Beni Kim Ziyaret Etti', icon: '👀', vip: 1, desc: 'Tüm ziyaretçileri gör' },
  { id: 'daily', name: 'Günlük Bonus', icon: '🪙', vip: 2, desc: 'Her gün VIP seviyesi × 50 coin' },
  { id: 'color', name: 'Renkli İsim', icon: '🌈', vip: 3, desc: 'İsmin renkli görünür' },
  { id: 'discount', name: 'Hediye İndirimi', icon: '🏷️', vip: 4, desc: 'Tüm hediyelerde %5 indirim' },
  { id: 'gift', name: 'Özel Hediye', icon: '👑', vip: 5, desc: 'VIP taç hediyesi açılır' },
  { id: 'spin', name: 'Ekstra Çark', icon: '🎡', vip: 6, desc: 'Günde 2 ücretsiz çark' }
];

/* ---------- Eşya mağazası ---------- */
Amor.FRAMES = [
  { id: 'altin', name: 'Altın defne', price: 1990, ring: 'conic-gradient(#f8d34a,#b8860b,#ffe680,#b8860b,#f8d34a)', deco: '👑' },
  { id: 'kraliyet', name: 'Mor kraliyet', price: 990, ring: 'conic-gradient(#a855f7,#facc15,#7c3aed,#facc15,#a855f7)', deco: '💜' },
  { id: 'zumrut', name: 'Zümrüt saray', price: 1990, ring: 'conic-gradient(#10b981,#facc15,#047857,#6ee7b7,#10b981)', deco: '🕌' },
  { id: 'kurdele', name: 'Pembe kurdele', price: 690, ring: 'conic-gradient(#ff8fc7,#ffd1e8,#ff3d8b,#ffd1e8,#ff8fc7)', deco: '🎀' },
  { id: 'gece', name: 'Gece neonu', price: 1290, ring: 'conic-gradient(#22d3ee,#6366f1,#ec4899,#22d3ee)', deco: '🌙' },
  { id: 'yildiz', name: 'Yıldız', price: 2490, ring: 'conic-gradient(#fde68a,#f59e0b,#fff7d6,#f59e0b,#fde68a)', deco: '⭐' },
  { id: 'vip', name: 'VIP', price: 0, vip: 1, ring: 'conic-gradient(#60a5fa,#1d4ed8,#93c5fd,#1d4ed8,#60a5fa)', deco: '💠' }
];

Amor.BACKGROUNDS = [
  { id: 'mor-gece', name: 'Mor gece', price: 0, css: 'linear-gradient(180deg,#3b1d63 0%,#241444 45%,#160d2c 100%)' },
  { id: 'gul-bahcesi', name: 'Gül bahçesi', price: 1490, css: 'linear-gradient(180deg,#5b1036 0%,#3a0d2a 50%,#1e0716 100%)' },
  { id: 'okyanus', name: 'Okyanus', price: 1490, css: 'linear-gradient(180deg,#0b3a5b 0%,#0a2540 50%,#061426 100%)' },
  { id: 'galaksi', name: 'Galaksi', price: 2490, css: 'radial-gradient(circle at 30% 20%,#4c1d95 0%,#1e1b4b 40%,#0b0820 100%)' },
  { id: 'gun-batimi', name: 'Gün batımı', price: 1990, css: 'linear-gradient(180deg,#7c2d12 0%,#4a1942 55%,#1a0b24 100%)' }
];
Amor.ITEM_DAYS = 7; // satın alınan eşya süresi

/* ---------- Ödüller ---------- */
Amor.CHECKIN = [
  { coins: 5 }, { coins: 5 }, { coins: 10 }, { coins: 10 }, { coins: 15 }, { coins: 20 },
  { coins: 30, gift: 'gul', qty: 3 }
];

// Günlük görevler (her gün sıfırlanır)
Amor.DAILY_TASKS = [
  { id: 'msg', name: '10 mesaj gönder', desc: 'Herhangi biriyle sohbet et', icon: '💬', target: 10, coins: 20, go: '#/messages' },
  { id: 'chat', name: '3 farklı kişiyle konuş', desc: 'Yeni insanlarla tanış', icon: '👥', target: 3, coins: 25, go: '#/home' },
  { id: 'visit', name: '3 profil ziyaret et', desc: 'Profillere göz at', icon: '👀', target: 3, coins: 15, go: '#/home' },
  { id: 'gift', name: 'Bir hediye gönder', desc: 'Sohbette 🎁 butonuna bas', icon: '🎁', target: 1, coins: 30, go: '#/messages' },
  { id: 'spin', name: 'Şans çarkını çevir', desc: 'Günde bir ücretsiz', icon: '🎡', target: 1, coins: 10, go: '#/game' }
];

// Başarımlar (bir kez)
Amor.ACHIEVEMENTS = [
  { id: 'name', name: 'Adını yaz', desc: 'Ben sayfasından', icon: '✍️', coins: 20, go: '#/me' },
  { id: 'follow', name: '5 kişiyi takip et', desc: 'Profillerde 🤍 butonu', icon: '💗', target: 5, coins: 50, go: '#/home' },
  { id: 'lv3', name: 'Biriyle Lv.3 ol', desc: 'Sohbet ve hediyelerle', icon: '💞', coins: 100, go: '#/messages' },
  { id: 'create', name: 'Karakter oluştur', desc: 'Kendi profilini tasarla', icon: '✨', coins: 50, go: '#/create' },
  { id: 'recharge', name: 'İlk yükleme', desc: 'Altın çerçeve · 3 gün', icon: '🪙', frame: 'altin', days: 3, go: '#/recharge' }
];

/* ---------- Şans çarkı ---------- */
Amor.WHEEL = [
  { coins: 10, w: 22, color: '#a78bfa' },
  { coins: 50, w: 14, color: '#f472b6' },
  { coins: 20, w: 20, color: '#60a5fa' },
  { coins: 200, w: 4, color: '#fbbf24' },
  { coins: 30, w: 18, color: '#34d399' },
  { coins: 100, w: 8, color: '#fb7185' },
  { coins: 15, w: 13, color: '#818cf8' },
  { coins: 500, w: 1, color: '#f59e0b' }
];
