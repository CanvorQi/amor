/*
 * Amor - Günlük program (Presence)
 * --------------------------------
 * Her mesleğin bir programı var: uyku saatleri ve meşgul olduğu bloklar (ders, iş, nöbet, set...).
 *   sleep -> çevrimdışı, mesajlar uyanınca cevaplanır
 *   busy  -> çevrimiçi ama geç ve kısa cevap verir ("derstiyim, sonra yazarım")
 *   free  -> normal
 * Saatler ondalıklı (8.5 = 08:30). 24'ü geçen bitiş ertesi güne taşar (28 = 04:00).
 * Bazı mesleklerin birden fazla günü vardır (nöbet, uçuş, vardiya); gün sırasıyla döner.
 */
window.Amor = window.Amor || {};

Amor.SCHEDULES = (() => {
  const WD = [1, 2, 3, 4, 5], ALL = [0, 1, 2, 3, 4, 5, 6];
  return {
    ogrenci: [{ sleep: [0.5, 8], busy: [{ days: WD, from: 9, to: 14, status: 'derste', say: 'derstiyim' }] }],
    ofis: [{ sleep: [23.5, 7], busy: [{ days: WD, from: 9, to: 18, status: 'işte', say: 'işteyim' }] }],
    okul: [{ sleep: [23, 6.5], busy: [{ days: WD, from: 8, to: 15, status: 'okulda', say: 'okuldayım, derse giriyorum' }] }],
    seans: [{ sleep: [23.5, 7.5], busy: [{ days: WD, from: 10, to: 18, status: 'seansta', say: 'seanstayım' }] }],
    gece: [{ sleep: [5, 13], busy: [{ days: [4, 5, 6], from: 23, to: 28, status: 'sette', say: 'setteyim' }] }],
    kafe: [
      { sleep: [0, 6.5], busy: [{ days: [1, 2, 3, 4, 5, 6], from: 7.5, to: 15.5, status: 'vardiyada', say: 'vardiyadayım' }] },
      { sleep: [1.5, 9.5], busy: [{ days: ALL, from: 14, to: 22, status: 'vardiyada', say: 'vardiyadayım' }] }
    ],
    prova: [{ sleep: [1.5, 9.5], busy: [
      { days: WD, from: 14, to: 19, status: 'provada', say: 'provadayım' },
      { days: [5, 6], from: 20, to: 23, status: 'sahnede', say: 'sahneye çıkıyorum' }
    ] }],
    yoga: [{ sleep: [22.5, 6.5], busy: [
      { days: [1, 2, 3, 4, 5, 6], from: 7, to: 10, status: 'derste', say: 'ders veriyorum' },
      { days: WD, from: 18, to: 20, status: 'derste', say: 'akşam dersindeyim' }
    ] }],
    nobet: [
      { sleep: [23, 6.5], busy: [{ days: ALL, from: 8, to: 20, status: 'nöbette', say: 'nöbetteyim' }] },
      { sleep: [9, 16], busy: [{ days: ALL, from: 20, to: 32, status: 'gece nöbetinde', say: 'gece nöbetindeyim' }] },
      { sleep: [1, 10], busy: [] }
    ],
    cekim: [{ sleep: [1, 9], busy: [{ days: [1, 3, 5], from: 11, to: 16, status: 'çekimde', say: 'çekimdeyim' }] }],
    serbest: [{ sleep: [2, 10], busy: [{ days: [2, 4], from: 13, to: 17, status: 'çekimde', say: 'video çekiyorum' }] }],
    ucus: [
      { sleep: [22, 5], busy: [{ days: ALL, from: 6, to: 14, status: 'uçuşta', say: 'uçuştayım, inince yazarım' }] },
      { sleep: [0, 8], busy: [{ days: ALL, from: 15, to: 23, status: 'uçuşta', say: 'uçuştayım, inince yazarım' }] },
      { sleep: [0.5, 9.5], busy: [] }
    ]
  };
})();

// Meslek -> program
Amor.JOB_SCHED = {
  'Psikoloji öğrencisi': 'ogrenci', 'Edebiyat öğrencisi': 'ogrenci', 'Tıp öğrencisi': 'ogrenci', 'Konservatuvar öğrencisi': 'ogrenci',
  'Mimar': 'ofis', 'Grafik tasarımcı': 'ofis', 'Avukat': 'ofis', 'Yazılım mühendisi': 'ofis',
  'DJ': 'gece', 'Barista': 'kafe', 'Tiyatro oyuncusu': 'prova', 'Psikolog': 'seans', 'Yoga eğitmeni': 'yoga',
  'Hemşire': 'nobet', 'Öğretmen': 'okul', 'Model': 'cekim', 'Fotoğrafçı': 'cekim', 'İçerik üreticisi': 'serbest',
  'Kabin memuru': 'ucus',
  'Hukuk öğrencisi': 'ogrenci', 'İletişim öğrencisi': 'ogrenci', 'Mimarlık öğrencisi': 'ogrenci',
  'Sosyal medya uzmanı': 'ofis', 'İç mimar': 'ofis', 'Bankacı': 'ofis', 'Eczacı': 'ofis', 'Kütüphaneci': 'ofis', 'Veteriner': 'ofis',
  'Pilates eğitmeni': 'yoga', 'Doktor': 'nobet', 'Akademisyen': 'okul', 'Diyetisyen': 'seans',
  'Makyaj artisti': 'cekim', 'Kuaför': 'kafe', 'Gazeteci': 'serbest', 'Çevirmen': 'serbest', 'Seramik sanatçısı': 'serbest',
  'Butik sahibi': 'kafe', 'Emlak danışmanı': 'serbest', 'Restoran sahibi': 'kafe'
};

// Kişiliğe göre uyku kayması (saat): flörtöz geç yatar, olgun erken
Amor.SLEEP_SHIFT = { flortoz: 1.5, dramatik: 1, nese: 0.5, utangac: 0, soguk: 0, olgun: -0.5 };

Amor.Schedule = (() => {
  const H = 3600000, DAY = 86400000;
  const tz = t => new Date(t).getTimezoneOffset() * 60000;
  const dayNum = t => Math.floor((t - tz(t)) / DAY);
  const dayStart = d => d * DAY + tz(d * DAY);
  const weekday = d => (d + 4) % 7; // 1970-01-01 perşembe

  // Karakter başına sabit küçük kayma (-0.5 .. +0.5 saat)
  function jitter(c) {
    let h = 0;
    for (const ch of c.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    return ((h % 100) / 100) - 0.5;
  }

  function variants(c) {
    return Amor.SCHEDULES[Amor.JOB_SCHED[c.job]] || Amor.SCHEDULES.ofis;
  }

  function dayPlan(c, d) {
    const vs = variants(c);
    const v = vs[((d % vs.length) + vs.length) % vs.length];
    const shift = (Amor.SLEEP_SHIFT[c.archetype] || 0) + jitter(c);
    let [s, e] = v.sleep;
    s += shift; e += shift;
    if (e <= s) e += 24;
    return { sleep: [s, e], busy: v.busy };
  }

  /* Şu anki durum: { state: 'sleep'|'busy'|'free', status, say, key, until, since } */
  function status(c, t = Date.now()) {
    // Zorla çevrimiçi yapıldıysa (app.js) süre bitene kadar boşta sayılır
    const forced = ((Amor.Store.state.forced || {})[c.id]) || 0;
    if (t < forced) return { state: 'free', forced: true, until: forced };
    const dn = dayNum(t);
    const h = (t - dayStart(dn)) / H;
    let busy = null, sleep = null;
    for (const [d, off] of [[dn, 0], [dn - 1, 24]]) {
      const p = dayPlan(c, d);
      const hh = h + off;
      if (hh >= p.sleep[0] && hh < p.sleep[1]) sleep = { d, from: p.sleep[0], to: p.sleep[1] };
      for (const b of p.busy) {
        if ((!b.days || b.days.includes(weekday(d))) && hh >= b.from && hh < b.to) busy = { d, b };
      }
    }
    // meşguliyet uykudan önce gelir (gece nöbeti, set)
    if (busy) {
      return { state: 'busy', status: busy.b.status, say: busy.b.say, key: `${busy.d}-${busy.b.from}`,
        until: dayStart(busy.d) + busy.b.to * H };
    }
    if (sleep) return { state: 'sleep', since: dayStart(sleep.d) + sleep.from * H, until: dayStart(sleep.d) + sleep.to * H };
    return { state: 'free' };
  }

  // Bir sonraki uykuya kaç saat var / uyanalı kaç saat oldu
  function sleepDistance(c, t = Date.now()) {
    const dn = dayNum(t);
    const h = (t - dayStart(dn)) / H;
    const today = dayPlan(c, dn), prev = dayPlan(c, dn - 1);
    let toSleep = today.sleep[0] - h;
    if (toSleep < 0) toSleep += 24;
    // uyanma anı: dünkü uykunun bitişi ya da bugünkü (gündüz) uykunun bitişi, hangisi en son geçtiyse
    const wakes = [prev.sleep[1] - 24, today.sleep[1]].filter(w => w <= h);
    const wokeAt = wakes.length ? Math.max(...wakes) : prev.sleep[1] - 48;
    return { toSleep, sinceWake: h - wokeAt };
  }

  // Ruh hali motoru için enerji temel değeri saate göre
  function energyBase(c) {
    const st = status(c);
    if (st.state === 'sleep') return 0.2;
    const { toSleep, sinceWake } = sleepDistance(c);
    if (toSleep < 1.5) return 0.3;
    if (sinceWake >= 0 && sinceWake < 1) return 0.45;
    if (st.state === 'busy') return 0.55;
    return 0.7;
  }

  // Cevap vermeden önce bekleme (ms)
  function replyDelay(c) {
    return status(c).state === 'busy' ? (15 + Math.random() * 30) * 1000 : 0;
  }

  // Bugünün programı (sohbet menüsündeki "Hakkımda bildikleri" için)
  function today(c) {
    const p = dayPlan(c, dayNum(Date.now()));
    const fmt = x => { const v = ((x % 24) + 24) % 24; return `${String(Math.floor(v)).padStart(2, '0')}:${String(Math.round((v % 1) * 60)).padStart(2, '0')}`; };
    const wd = weekday(dayNum(Date.now()));
    return {
      sleep: `${fmt(p.sleep[0])} – ${fmt(p.sleep[1])}`,
      busy: p.busy.filter(b => !b.days || b.days.includes(wd)).map(b => `${b.status} ${fmt(b.from)} – ${fmt(b.to)}`)
    };
  }

  return { status, energyBase, replyDelay, sleepDistance, today };
})();
