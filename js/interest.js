/*
 * Amor - İlgi (Saneme attraction.py'den esinlenildi)
 * ---------------------------------------------------
 * Yakınlık sadece artar; ilgi ise sohbetin kalitesine göre iner çıkar (0..1).
 *   Düşürür: kuru cevaplar ("hmm", "ok"), aynı şeyi tekrar etmek, erken buluşma/numara istemek,
 *            iltifat yağmuru, hakaret
 *   Artırır: onu merak etmek (sorular), sorusuna cevap vermek, kendinden bahsetmek, güldürmek,
 *            uzun ve özenli mesajlar, hediye
 * İlgi düşükse: cevaplar gecikir, kısalır, soru sormaz, bazen "Görüldü"de bırakır.
 * Zamanla kişiliğe bağlı temel değere döner (yarı ömür 12 saat).
 */
window.Amor = window.Amor || {};

Amor.Interest = (() => {
  const S = () => Amor.Store.state;
  const BASE = { nese: 0.65, flortoz: 0.6, dramatik: 0.6, utangac: 0.55, olgun: 0.55, soguk: 0.45 };
  const HALF_LIFE_H = 12;
  const clamp = v => Math.max(0, Math.min(1, v));
  const norm = s => (Amor.Engine ? Amor.Engine.norm(s) : s.toLowerCase().trim());

  const base = c => BASE[c.archetype] ?? 0.55;

  function get(c) {
    const all = S().interest = S().interest || {};
    const st = all[c.id];
    if (!st) return base(c);
    const dtH = (Date.now() - st.ts) / 3600000;
    const f = 1 - Math.exp(-dtH * Math.LN2 / HALF_LIFE_H);
    return clamp(st.v + (base(c) - st.v) * f);
  }

  function add(c, delta) {
    const all = S().interest = S().interest || {};
    all[c.id] = { v: clamp(get(c) + delta), ts: Date.now() };
    return all[c.id].v;
  }

  // Kullanıcının bu karaktere yazdığı önceki mesajlar (şimdiki hariç)
  function history(c, skip) {
    return (S().chats[c.id] || []).filter(m => m.from === 'me' && m.type !== 'gift').map(m => m.text).slice(0, -skip || undefined).slice(-20);
  }

  const isDry = t => {
    const n = norm(t);
    return n.length <= 3 || Amor.DRY.includes(n);
  };

  // Selamlaşma, teşekkür, gülme gibi doğal tekrarlar sayılmaz
  const ROUTINE = ['greet', 'how_are_you', 'morning', 'night', 'bye', 'thanks', 'laugh', 'agree', 'wyd'];
  function isRepeat(c, messages) {
    const prev = history(c, messages.length).map(norm);
    return messages.some(m => {
      const n = norm(m);
      return n.length > 3 && prev.includes(n) && !ROUTINE.includes(Amor.Engine.detect(m).intent);
    });
  }

  /* Bir tur mesajın ilgiye etkisi. ctx: { repeated, answeredQ, newFacts } */
  function evaluate(c, messages, best, ctx) {
    const lv = Amor.Engine.level(c).lv;
    const picky = c.archetype === 'soguk' || c.archetype === 'flortoz' ? 1.3 : 1;
    let d = 0;
    const why = [];

    if (messages.every(isDry) && !ctx.answeredQ) { d -= 0.04 * picky * Math.min(2, messages.length); why.push('kuru'); }
    if (ctx.repeated) { d -= 0.06; why.push('tekrar'); }
    if (best.intent === 'insult') { d -= 0.15; why.push('hakaret'); }
    if (best.intent === 'meet' && lv <= 2) { d -= lv === 1 ? 0.08 : 0.04; why.push('aceleci'); }
    if (best.intent === 'photo' && lv <= 1) { d -= 0.03; why.push('aceleci'); }
    if (best.intent === 'flirt' && lv <= 1) { d += c.archetype === 'flortoz' ? 0.01 : -0.03; }
    // öpücük / sarılma: tanışırken aceleci, yakınken hoş
    if (best.intent === 'kiss' || best.intent === 'hug') {
      if (lv >= 3) d += 0.02;
      else if (c.archetype !== 'flortoz') { d -= best.intent === 'kiss' ? 0.04 : 0.02; why.push('aceleci'); }
    }

    // iltifat yağmuru
    if (best.intent === 'compliment') {
      const recent = history(c, messages.length).slice(-6).filter(t => Amor.Engine.detect(t).intent === 'compliment').length;
      if (recent >= 2) { d -= 0.03; why.push('iltifat yağmuru'); }
      else d += c.archetype === 'soguk' ? 0 : 0.02;
    }

    if (best.intent.startsWith('ask_')) d += 0.03;
    if (best.intent === 'laugh' || best.intent === 'wyd' || best.intent === 'how_are_you') d += 0.015;
    if (ctx.answeredQ) d += 0.04;
    if (ctx.newFacts && ctx.newFacts.length) d += 0.03;
    if (messages.join(' ').length > 40) d += 0.02;

    d = Math.max(-0.2, Math.min(0.1, d));
    add(c, d);
    return { delta: d, why };
  }

  // İlgiye göre cevaba başlamadan önceki bekleme (ms)
  function delay(c) {
    const v = get(c);
    if (v >= 0.4) return 0;
    return (3 + (0.4 - v) * 60 * Math.random()) * 1000; // en fazla ~27 sn
  }

  // "Görüldü"de bırakma olasılığı
  function ignoreChance(c) {
    const v = get(c);
    return v < 0.15 ? 0.6 : v < 0.25 ? 0.3 : 0;
  }

  function label(v) {
    return v >= 0.75 ? 'Çok ilgili' : v >= 0.55 ? 'İlgili' : v >= 0.35 ? 'Normal' : v >= 0.2 ? 'Sıkılıyor' : 'İlgisini kaybetti';
  }

  return { get, add, evaluate, isRepeat, delay, ignoreChance, label, base };
})();
