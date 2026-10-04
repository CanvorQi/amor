/*
 * Amor - Cevap Motoru (yapay zeka yok, kalıp tabanlı)
 * ---------------------------------------------------
 * 1) Mesajın niyetini bul (selamlama, iltifat, soru...)
 * 2) Mesajın ruh haline ve yakınlığa etkisini uygula
 * 3) Ruh haline göre doğru kalıp havuzunu seç (normal / gergin / üzgün / yorgun)
 * 4) Karakterin yazım tarzını uygula (küçük harf, harf uzatma, emoji, gülme)
 * 5) Balonlara böl ve yazma sürelerini hesapla
 */
window.Amor = window.Amor || {};

Amor.Engine = (() => {
  const S = () => Amor.Store.state;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pickRaw = arr => arr[Math.floor(Math.random() * arr.length)];

  /* ---------- Metin sadeleştirme ---------- */
  const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  const fold = s => s.toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, ch => FOLD[ch]);
  const collapse = s => s.replace(/(.)\1+/gu, '$1');
  const norm = s => collapse(fold(s).replace(/[^\p{L}\p{N}\p{Extended_Pictographic}\s]/gu, ' ').replace(/\s+/g, ' ').trim());

  let COMPILED = [], ORDER = [], TOPICS_C = [], TONES_C = { good: [], bad: [] }, TRAIT_C = { why: [], ask: [] };
  // '^kelime' = sadece mesaj başında, '~kelime' = zayıf (konular: sadece o konu zaten konuşuluyorsa sayılır)
  const pat = w => {
    const weak = w.startsWith('~');
    const s = weak ? w.slice(1) : w;
    const start = s.startsWith('^');
    return { w, weak, start, p: collapse(fold(start ? s.slice(1) : s)) };
  };
  const bare = w => w.replace(/^~/, '').replace(/^\^/, '');
  const pats = words => (words || []).map(pat).filter(x => x.p.trim());
  function compile() {
    COMPILED = Amor.INTENTS.map(([intent, words]) => ({ intent, pats: words.map(pat) }));
    ORDER = COMPILED.map(x => x.intent);
    TOPICS_C = (Amor.TOPICS || []).map(t => ({ t, pats: pats(t.words), taste: pats(t.tastes) }));
    const T = Amor.TOPIC_TONES || {};
    TONES_C = { good: pats(T.good), bad: pats(T.bad), close: pats(T.close) };
    const W = Amor.TRAIT_WORDS || {};
    TRAIT_C = { why: pats(W.why), ask: pats(W.ask) };
  }

  /* ---------- Özel diyalog (diyalog-editoru.bat -> js/data/custom-dialog.js) ----------
   * intents[id] = { words, before, effect }  -> kelime listesini değiştirir / yeni niyet ekler
   * lines[arketip]["niyet" | "niyet_close" | "neg:niyet" | "sad:niyet" | "low:niyet"] = cümleler
   * topics[id] = { label, words, tastes, lines, wordLines } (null = sil), tones = { good, bad }, topicShared = { love, meh },
   * topicSettings = { wordChance, contChance, skipChance, tasteChance, keep }
   * traits[id] = { chance: { arketip: 0-1 }, lines: { yuva | "yuva@arketip": cümleler } }, traitSettings = { tersChance, ... } */
  const KEEP = ['fallback', 'greet', 'opener'];
  function applyDialog(D) {
    Object.entries(D.intents || {}).forEach(([id, def]) => {
      const i = Amor.INTENTS.findIndex(r => r[0] === id);
      const words = def.words || (i >= 0 ? Amor.INTENTS[i][1] : null);
      if (words) {
        if (i >= 0 && !def.before) Amor.INTENTS[i][1] = words;
        else {
          if (i >= 0) Amor.INTENTS.splice(i, 1);
          const at = Amor.INTENTS.findIndex(r => r[0] === def.before);
          Amor.INTENTS.splice(at < 0 ? Amor.INTENTS.length : at, 0, [id, words]);
        }
      }
      if (def.effect) Amor.INTENT_EFFECTS[id] = def.effect;
    });
    Object.entries(D.lines || {}).forEach(([aid, pools]) => {
      const a = Amor.ARCHETYPES.find(x => x.id === aid);
      if (!a) return;
      Object.entries(pools).forEach(([key, list]) => {
        const m = key.match(/^(neg|sad|low):(.+)$/);
        const bank = m ? (a.mood[m[1]] = a.mood[m[1]] || {}) : a.lines;
        const k = m ? m[2] : key;
        if (list.length) bank[k] = list;
        else if (m || !KEEP.includes(k)) delete bank[k]; // boş yol -> yedek havuza düşer
      });
    });
    Amor.TOPICS = Amor.TOPICS || [];
    Object.entries(D.topics || {}).forEach(([id, def]) => {
      const i = Amor.TOPICS.findIndex(t => t.id === id);
      if (!def) { if (i >= 0) Amor.TOPICS.splice(i, 1); return; }
      const t = { ...def, id };
      if (i >= 0) Amor.TOPICS[i] = t; else Amor.TOPICS.push(t);
    });
    if (D.tones) Amor.TOPIC_TONES = { ...Amor.TOPIC_TONES, ...D.tones };
    if (D.topicShared) Amor.TOPIC_SHARED = { ...Amor.TOPIC_SHARED, ...D.topicShared };
    if (D.topicSettings) Amor.TOPIC_SETTINGS = { ...Amor.TOPIC_SETTINGS, ...D.topicSettings };
    Object.entries(D.traits || {}).forEach(([id, def]) => {
      const t = (Amor.TRAITS || []).find(x => x.id === id);
      if (!t || !def) return;
      if (def.chance) t.chance = { ...t.chance, ...def.chance };
      t.lines = t.lines || {};
      Object.entries(def.lines || {}).forEach(([k, list]) => { if (list.length) t.lines[k] = list; else delete t.lines[k]; });
    });
    if (D.traitSettings) Amor.TRAIT_SETTINGS = { ...Amor.TRAIT_SETTINGS, ...D.traitSettings };
    compile();
  }
  if (Amor.CUSTOM_DIALOG) applyDialog(Amor.CUSTOM_DIALOG);
  else compile();

  function matches(text, { start, p }) {
    if (start) return text === p || text.startsWith(p + ' ');
    if (!/^\p{L}/u.test(p)) return text.includes(p);
    return (' ' + text).includes(' ' + p);
  }

  function detect(raw) {
    const text = norm(raw);
    const lower = raw.toLocaleLowerCase('tr');
    const nameM = lower.match(/(?:^|\s)(?:benim )?(?:adım|adim|ismim|bana)\s+([a-zçğıöşü]{2,15})(?:\s+de(?:\s|$)|\s|$)/);
    if (nameM && !['ne', 'mi', 'de', 'da'].includes(nameM[1])) {
      return { intent: 'tell_name', name: cap(nameM[1]), text, greet: false };
    }
    let found = 'fallback', word = null;
    for (const { intent, pats } of COMPILED) {
      const hit = pats.find(p => matches(text, p));
      if (hit) { found = intent; word = hit.w; break; }
    }
    if (found === 'fallback' && isQuestion(raw)) found = 'question';
    const greet = found !== 'greet' && COMPILED.find(x => x.intent === 'greet').pats.some(p => matches(text, p));
    return { intent: found, text, greet, word };
  }
  const isQuestion = raw => /\?\s*$/.test(raw) || /(^|\s)(mi|mu)(sin|sun|yim|yum|yiz|yuz|siniz)?(\s|$)/.test(fold(raw));

  /* ---------- Konu (js/data/topics.js) ----------
   * Niyet mesajın türünü, konu içeriğini bulur: "dün maç berbattı" -> futbol + kötü haber.
   * TOPIC_FULL niyetlerinde konu cümlesi normal cevabın yerine, TOPIC_AFTER'da selam/cevaptan sonra gelir.
   * Konu birkaç mesaj akılda kalır (topicTurn): "~zayıf" kelimeler ve konu kelimesi geçmeyen mesajlar
   * ("çok zordu ya") süren konuya bağlanır, konu sürdükçe "devam" cümleleri gelir. */
  const TOPIC_FULL = ['fallback', 'question', 'answer_good', 'answer_bad', 'agree', 'disagree', 'laugh', 'ask_hobby'];
  const TOPIC_AFTER = ['greet', 'morning', 'how_are_you', 'wyd'];
  const TOPIC_INHERIT = ['fallback', 'question', 'answer_good', 'answer_bad']; // konu kelimesi yoksa süren konuya bağlanabilenler
  const SET = () => ({ wordChance: 0.4, contChance: 0.45, skipChance: 0.15, tasteChance: 0.65, keep: 2, ...(Amor.TOPIC_SETTINGS || {}) });

  function toneOf(raw, intent) {
    const text = norm(raw);
    return intent === 'answer_bad' ? 'bad' : intent === 'answer_good' ? 'good'
      : TONES_C.bad.some(p => matches(text, p)) ? 'bad'
      : TONES_C.good.some(p => matches(text, p)) ? 'good'
      : isQuestion(raw) ? 'ask' : 'any';
  }

  // current: şu an konuşulan konunun id'si (zayıf kelimeleri açar, eşitlikte +5 puan)
  function topicOf(raw, intent, current = null) {
    const text = norm(raw);
    let best = null;
    TOPICS_C.forEach(T => {
      const on = T.t.id === current;
      const hits = T.pats.filter(p => (on || !p.weak) && matches(text, p));
      if (!hits.length) return;
      const top = hits.reduce((a, b) => b.p.length > a.p.length ? b : a);
      const score = hits.length * 10 + top.p.length + (on ? 5 : 0); // çok kelimesi tutan, eşitse uzun kelimesi tutan kazanır
      if (!best || score > best.score) best = { id: T.t.id, topic: T.t, word: bare(top.w), score };
    });
    if (best) best.tone = toneOf(raw, intent);
    return best;
  }

  /* Bir kullanıcı turunda konu: hangi konu, akıştaki durum ve (varsa) konu cevabı.
   * ctx: { id, word, streak, idle, lastWord, ts } — önceki turdan; null olabilir. Saf fonksiyon: Store'a yazmaz.
   * Dönen: { tp, ctx (yeni), reply: { line, kind } | null }
   *   kind: word (kelimeye özel) · cont (konu devam ediyor) · tone (iyi/kötü/soru/genel) · love / meh (zevk) */
  function topicTurn(c, ctx, raw, intent) {
    const s = SET();
    if (ctx && Date.now() - (ctx.ts || 0) > 30 * 60000) ctx = null; // yarım saat sessizlikten sonra konu unutulur
    const ok = TOPIC_FULL.includes(intent) || TOPIC_AFTER.includes(intent);
    let tp = ok ? topicOf(raw, intent, ctx && ctx.id) : null;
    const text = norm(raw);
    // "neyse, boşver" -> konu kapanır
    if (!tp && ctx && TONES_C.close.some(p => matches(text, p))) return { tp: null, ctx: null, reply: null, closed: true };
    // "hmm, ok" gibi kuru mesajlar konuya bağlanmaz
    const dry = text.length <= 3 || (Amor.DRY || []).includes(text);
    if (!tp && ctx && !dry && TOPIC_INHERIT.includes(intent)) {
      const t = (Amor.TOPICS || []).find(x => x.id === ctx.id);
      if (t) tp = { id: t.id, topic: t, word: ctx.word, tone: toneOf(raw, intent), score: 0, inherited: true };
    }
    if (!tp) {
      const idle = ctx ? ctx.idle + 1 : 0;
      return { tp: null, ctx: ctx && idle <= s.keep ? { ...ctx, idle, ts: Date.now() } : null, reply: null };
    }
    const same = ctx && ctx.id === tp.id;
    const nc = {
      id: tp.id, word: tp.word,
      streak: same ? ctx.streak + 1 : 1,
      idle: tp.inherited ? ctx.idle + 1 : 0,               // bağlanan mesaj konuyu tazelemez, sadece sürdürür
      lastWord: same ? ctx.lastWord : null, ts: Date.now()
    };
    tp.streak = nc.streak;
    if (nc.idle > s.keep) return { tp: null, ctx: null, reply: null };

    const L = tp.topic.lines || {};
    const has = k => L[k] && L[k].length;
    const neutral = tp.tone === 'any' || tp.tone === 'ask';
    const going = nc.streak >= 2;
    const out = (line, kind) => ({ tp, ctx: nc, reply: { line, kind } });

    // Ara sıra konuya hiç değinmeden normal cevap (konu yine de akılda kalır)
    if (same && neutral && Math.random() < s.skipChance) return { tp, ctx: nc, reply: null };

    // 1) Kelimeye özel cevap: bir ihtimal; aynı kelimeye üst üste verilmez
    const wl = !tp.inherited && neutral ? (tp.topic.wordLines || {})[tp.word] : null;
    if (wl && wl.length) {
      if (nc.lastWord === tp.word) nc.lastWord = null;
      else if (Math.random() < s.wordChance) { nc.lastWord = tp.word; return out(pick(c, wl), 'word'); }
    }
    // 2) Konu sürüyor: "bugün kafan hep derslerde galiba"
    if (neutral && has('cont') && (tp.inherited || (going && Math.random() < s.contChance))) return out(pick(c, L.cont), 'cont');
    if (tp.inherited && neutral) return { tp, ctx: nc, reply: null };
    // 3) Ton / zevk
    const taste = Math.random() < s.tasteChance ? topicTaste(c, tp) : null;
    const pool = topicPool(tp, taste);
    if (pool && pool.length) return out(pick(c, pool), taste && neutral ? taste : 'tone');
    return { tp, ctx: nc, reply: null };
  }

  // Karakter bu konuyu seviyor mu: sevdikleri / sevmedikleri içinde konunun zevk kelimeleri geçiyor mu.
  // Kişiliğin sevdiği bir konuya "ilgisiz" kalmaz (Neşeli "soğuk kahve" sevmese de kahveyi sever).
  function topicTaste(c, tp) {
    const T = TOPICS_C.find(x => x.t.id === tp.id);
    if (!T || !T.taste.length) return null;
    const has = list => (list || []).some(l => { const t = norm(l); return T.taste.some(p => matches(t, p)); });
    if (has(c.likes)) return 'love';
    const arch = c.archetype && Amor.archetype ? Amor.archetype(c.archetype) : null;
    return has(c.dislikes) && !(arch && has(arch.likes)) ? 'meh' : null;
  }

  // Konu cümle havuzu; iyi/kötü haberde empati önce gelir, zevk sadece soru ve genelde
  function topicPool(tp, taste) {
    const L = tp.topic.lines || {};
    const has = k => L[k] && L[k].length;
    if (taste && (tp.tone === 'ask' || tp.tone === 'any')) return has(taste) ? L[taste] : (Amor.TOPIC_SHARED || {})[taste] || null;
    return has(tp.tone) ? L[tp.tone] : tp.tone === 'ask' && has('any') ? L.any : null;
  }

  const cap = w => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1);

  /* ---------- Yakınlık seviyesi ---------- */
  const LEVELS = [0, 8, 20, 40, 70, 110];
  const LEVEL_NAMES = ['Yeni tanışma', 'Tanıdık', 'Arkadaş', 'Yakın', 'Özel', 'Ruh eşi'];
  function level(c) {
    const pts = S().affinity[c.id] || 0;
    let lv = 1;
    LEVELS.forEach((t, i) => { if (pts >= t) lv = i + 1; });
    const next = LEVELS[lv] ?? null;
    return { lv, pts, name: LEVEL_NAMES[lv - 1], next, prev: LEVELS[lv - 1] };
  }

  /* ---------- Kalıp seçimi (yakın zamanda kullanılanı tekrar etme) ---------- */
  function pick(c, pool) {
    const recent = S().recent[c.id] || [];
    const fresh = pool.filter(l => !recent.includes(l));
    const line = pickRaw(fresh.length ? fresh : pool);
    S().recent[c.id] = [line, ...recent].slice(0, 14);
    return line;
  }

  /* ---------- Yazım tarzı ---------- */
  const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
  const hasEmoji = s => /\p{Extended_Pictographic}/u.test(s);

  function laugh(c) {
    switch (c.style.laugh) {
      case 'ahah': return 'ahah' + 'ah'.repeat(Math.floor(rand(0, 3)));
      case 'keysmash': {
        const L = 'ASDJSKFHSJGKS';
        let s = '';
        const n = Math.floor(rand(6, 11));
        for (let i = 0; i < n; i++) s += L[Math.floor(Math.random() * L.length)];
        return s;
      }
      case 'hihi': return 'hihi';
      case 'hh': return 'hh';
      default: return '😊';
    }
  }

  function hitap(c) {
    const lists = c.hitap || [];
    const list = lists[Math.min(level(c).lv - 1, lists.length - 1)] || [];
    if (!list.length || Math.random() < 0.4) return '';
    return ' ' + pickRaw(list);
  }

  function fill(c, s, extra = {}) {
    const name = extra.name || S().user.name || '';
    const likes = [...(c.likes || [])].sort(() => Math.random() - 0.5);
    return s
      .replace(/\{h\}/g, () => hitap(c))
      .replace(/\{name\}/g, name)
      .replace(/\{self\}/g, c.name)
      .replace(/\{age\}/g, c.age)
      .replace(/\{city_at\}/g, c.cityAt || c.city)
      .replace(/\{city\}/g, c.city)
      .replace(/\{district\}/g, c.district)
      .replace(/\{fav\}/g, c.fav || c.city)
      .replace(/\{job_is\}/g, c.jobIs || c.job)
      .replace(/\{doing\}/g, () => pickRaw(c.doing || ['takılıyorum']))
      .replace(/\{like\}/g, likes[0] || '')
      .replace(/\{like2\}/g, likes[1] || '')
      .replace(/\{laugh\}/g, () => laugh(c))
      .replace(/\{x\} m[ıi](?=[\s?!.,]|$)/g, () => `{x} ${Amor.Memory.soru(extra.x || '')}`)
      .replace(/\{x\}/g, extra.x || '')
      .replace(/\{cause\}/g, extra.cause || '')
      .replace(/\s+([,.!?])/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function stylize(c, part, mods, grp, isLast) {
    let s = part;
    if (mods.flat) {
      s = s.replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim() || 'hm';
    }
    // Bilerek BÜYÜK yazılmış kısımlara dokunma
    if (!/\p{Lu}{4,}/u.test(s) && Math.random() < c.style.lowercase) s = s.toLocaleLowerCase('tr');
    // Düzgün yazan kişilikler (soğuk, olgun) ortak cümlelerde de büyük harfle başlar
    else if (c.style.lowercase < 0.3) s = s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
    if ((grp === 'pos' || grp === 'neu') && Math.random() < c.style.elongate) {
      s = s.replace(/([aeıioöuüm])(\s*)$/i, (m, ch, sp) => ch.repeat(Math.floor(rand(3, 5))) + sp);
    }
    if (isLast && !hasEmoji(s) && Math.random() < c.style.emojiRate * mods.emoji) {
      s += ' ' + pickRaw(c.style.emojis);
    }
    return s;
  }

  /* ---------- Beklenen cevap (karakter soru sorduysa) ---------- */
  function expectFrom(parts, intent) {
    const t = fold(parts.join(' '));
    const asksBack = /sen\s*\?/.test(t);
    if (/adin ne/.test(t) || (intent === 'ask_name' && asksBack)) return 'name';
    if (/kac yasindasin/.test(t) || (intent === 'ask_age' && asksBack)) return 'age';
    if (/nerelisin/.test(t) || (intent === 'ask_city' && asksBack)) return 'city';
    return null;
  }

  // Cevabın kendisini cümleye almak için: "Tarkan tabii ki!" -> "Tarkan tabii ki"
  const captureAnswer = raw => raw.trim().replace(/[.!?…]+$/, '').split(/\s+/).slice(0, 5).join(' ');

  function applyExpect(c, d, raw) {
    const exp = S().expect[c.id];
    S().expect[c.id] = null;
    if (!exp) return d;

    // Karakterin kendi sorusu ("kedi mi köpek mi?") -> soru bankasındaki tepki
    if (exp.startsWith('q:')) {
      const Q = Amor.QUESTIONS[exp.slice(2)];
      const ok = ['fallback', 'agree', 'disagree', 'answer_good', 'answer_bad', 'question', 'laugh'];
      if (!Q || !ok.includes(d.intent)) return d;
      const f = ' ' + fold(raw).replace(/[^\p{L}\p{N}\s]/gu, ' ');
      const hit = (Q.answers || []).find(a => a.m.some(w => f.includes(' ' + w)));
      if (hit) return { ...d, intent: 'react_q', qLine: pickRaw(hit.r), x: captureAnswer(raw) };
      // "ok", "hmm" gibi kuru bir cevap soruya cevap sayılmaz
      const n = norm(raw);
      if (n.length <= 3 || Amor.DRY.includes(n)) return d;
      if (Q.any) return { ...d, intent: 'react_q', qLine: pickRaw(Q.any), x: captureAnswer(raw) };
      return d;
    }

    if (!['fallback', 'question', 'answer_good', 'greet'].includes(d.intent)) return d;
    const words = raw.trim().split(/\s+/);
    if (exp === 'name' && words.length <= 2 && /^\p{L}{2,15}$/u.test(words[words.length - 1])) {
      return { ...d, intent: 'tell_name', name: cap(words[words.length - 1].toLocaleLowerCase('tr')) };
    }
    const num = raw.match(/\b(1[5-9]|[2-9]\d)\b/);
    if (exp === 'age' && num) return { ...d, intent: 'react_age', x: num[1] };
    if (exp === 'city' && words.length <= 3 && d.intent === 'fallback') return { ...d, intent: 'react_city', x: cap(words[0].toLocaleLowerCase('tr')) };
    return d;
  }

  /* ---------- Yakınlığa göre havuz ----------
   * Lv.3+ iken "_close" havuzu varsa onu kullanır (daha sıcak, romantik).
   * Normal hali "daha yeni tanışıyoruz" gibi yakınlıkla çelişen niyetlerde her zaman, diğerlerinde %75. */
  const ALWAYS_CLOSE = ['flirt', 'kiss', 'hug', 'meet'];
  function linePool(c, intent) {
    const close = c.lines[intent + '_close'];
    if (close && level(c).lv >= 3 && (ALWAYS_CLOSE.includes(intent) || Math.random() < 0.75)) return close;
    return c.lines[intent] || c.lines.fallback;
  }

  /* ---------- Kişilik özellikleri (js/data/traits.js) ----------
   * c.traits: karakterin açık huyları (generator.js). Cümle önce "yuva@arketip", yoksa ortak "yuva" havuzundan. */
  const TSET = () => ({ tersChance: 0.18, redChance: 0.5, tripChance: 0.7, sulkTurns: 3, lateMin: 20, nudgeMin: 4, nudge2Min: 15,
    saykoChance: 0.7, oddChance: 0.07, ...(Amor.TRAIT_SETTINGS || {}) });
  const hasTrait = (c, id) => (c.traits || []).includes(id);
  function traitPool(c, id, slot) {
    const t = (Amor.TRAITS || []).find(x => x.id === id);
    const L = (t && t.lines) || {};
    const own = L[slot + '@' + c.archetype];
    return own && own.length ? own : L[slot] && L[slot].length ? L[slot] : null;
  }
  function traitLine(c, id, ...slots) {
    for (const s of slots) { const p = traitPool(c, id, s); if (p) return pick(c, p); }
    return null;
  }

  // Karakterin son mesajından sonra kullanıcının ilk cevabı kaç dakika sonra geldi
  function replyGap(c) {
    const w = (S().waitFrom || {})[c.id];
    const msgs = (S().chats || {})[c.id] || [];
    if (!w) return 0;
    let first = null;
    for (let i = msgs.length - 1; i >= 0 && msgs[i].from !== 'her'; i--) if (msgs[i].from === 'me') first = msgs[i];
    return first ? Math.max(0, first.ts - w) / 60000 : 0;
  }

  const SULK_END = ['sorry', 'miss', 'hug', 'kiss', 'compliment', 'flirt'];
  const TERS_ON = ['fallback', 'question', 'wyd', 'how_are_you', 'compliment', 'greet', 'laugh', 'agree', 'answer_good', 'ask_hobby'];
  const RED_ON = { meet: 'meet', photo: 'photo', kiss: 'kiss', hug: 'hug', flirt: 'flirt', ask_age: 'ask', ask_city: 'ask', ask_job: 'ask', ask_name: 'ask' };

  /* Huyların bu turdaki etkisi. Dönen:
   *   { stop: true, line, cold }  -> normal cevabın yerine bu cümle (cold: emojisiz, soğuk)
   *   { prefix, odd }             -> normal cevaba eklenecekler (geç cevaba sitem, tuhaf cümle) */
  function traitTurn(c, best, messages, env) {
    const s = TSET(), now = Date.now();
    const text = norm(messages.join(' '));
    const said = list => list.some(p => matches(text, p));

    // Tripçi: trip sürüyorsa kısa ve soğuk; özür / iltifat barıştırır
    if (hasTrait(c, 'trip')) {
      const all = S().sulk = S().sulk || {};
      let sk = all[c.id];
      if (sk && now - sk.ts > 45 * 60000) sk = all[c.id] = null; // 45 dk sonra kendiliğinden geçer
      if (sk) {
        if (best.intent === 'sorry' || (SULK_END.includes(best.intent) && Math.random() < 0.5)) {
          all[c.id] = null;
          Amor.Mood.nudge(c, { valence: 0.08 });
          return { stop: true, line: traitLine(c, 'trip', 'end') || 'tamam', cold: false };
        }
        sk.left--; sk.ts = now;
        if (sk.left <= 0) { all[c.id] = null; return { stop: true, line: traitLine(c, 'trip', 'fade', 'sulk') || 'neyse', cold: true }; }
        return { stop: true, line: traitLine(c, 'trip', said(TRAIT_C.why) ? 'why' : 'sulk', 'sulk') || 'tamam.', cold: true };
      }
      const dry = messages.every(m => { const n = norm(m); return n.length <= 3 || (Amor.DRY || []).includes(n); });
      const known = env.lv >= 2; // yeni tanıştığı birine trip atmaz (hakaret hariç)
      const why = best.intent === 'insult' && Math.random() < 0.85 ? 'insult'
        : known && env.gap >= s.lateMin && Math.random() < s.tripChance ? 'late'
        : known && dry && Math.random() < s.tripChance * 0.4 ? 'dry'
        : known && best.intent === 'bye' && Math.random() < s.tripChance * 0.4 ? 'bye' : null;
      const line = why && traitLine(c, 'trip', why);
      if (line) {
        all[c.id] = { ts: now, left: s.sulkTurns, why };
        Amor.Mood.nudge(c, { valence: -0.08 });
        return { stop: true, line, cold: true };
      }
    }

    // Nazlı: istekleri ve kişisel soruları geri çevirir, yakınlaştıkça daha az
    if (hasTrait(c, 'red')) {
      const slot = RED_ON[best.intent] || (['fallback', 'question', 'agree'].includes(best.intent) && said(TRAIT_C.ask) ? 'any' : null);
      if (slot && Math.random() < s.redChance * Math.max(0.3, 1 - 0.12 * (env.lv - 1))) {
        const line = traitLine(c, 'red', slot, 'any');
        if (line) return { stop: true, line, cold: true };
      }
    }

    // Ters: gerginken ve sıkılmışken daha sık, çok yakınken daha az
    if (hasTrait(c, 'ters') && TERS_ON.includes(best.intent)) {
      const p = s.tersChance * (env.grp === 'neg' ? 2 : 1) * (env.interest < 0.4 ? 1.5 : 1) * (env.lv >= 4 ? 0.5 : 1);
      if (Math.random() < p) {
        const line = traitLine(c, 'ters', best.intent, 'any');
        if (line) return { stop: true, line, cold: true };
      }
    }

    return {
      prefix: hasTrait(c, 'ilgi') && env.gap >= s.lateMin ? traitLine(c, 'ilgi', 'late') : null,
      odd: hasTrait(c, 'sayko') && Math.random() < s.oddChance ? traitLine(c, 'sayko', 'odd') : null
    };
  }

  /* ---------- Ana fonksiyon ---------- */
  // messages: karakterin henüz cevaplamadığı kullanıcı mesajları
  // opts.back: karakter çevrimdışıydı, şimdi dönüyor (geç cevap sitemi yok)
  function respond(c, messages, opts = {}) {
    const gap = opts.back ? 0 : replyGap(c);
    if (S().nudges) S().nudges[c.id] = 0;
    // En öncelikli niyeti seç
    const rank = i => i === 'tell_name' ? -1 : i === 'question' ? 998 : i === 'fallback' ? 999 : ORDER.indexOf(i);
    let best = null;
    messages.forEach(m => {
      const d = detect(m);
      if (!best || rank(d.intent) < rank(best.intent)) best = d;
    });
    const first = detect(messages[0]);
    best.greet = best.greet || (best.intent !== 'greet' && first.intent === 'greet');
    // Hafıza: mesajlardan bilgi çıkar (şehir, iş, olay...)
    const newFacts = Amor.Memory.learn(c, messages, best.intent);
    best = applyExpect(c, best, messages[messages.length - 1]);

    if (best.intent === 'tell_name' && best.name) S().user.name = best.name;
    if (best.intent === 'react_city') Amor.Memory.remember(c, 'city', best.x);
    if (best.intent === 'react_age') Amor.Memory.remember(c, 'age', Number(best.x));

    // İlgi: kuru / tekrar / aceleci mesajlar düşürür, merak ve özen artırır
    const repeated = Amor.Interest.isRepeat(c, messages);
    Amor.Interest.evaluate(c, messages, best, { repeated, answeredQ: best.intent === 'react_q', newFacts });
    const interest = Amor.Interest.get(c);

    // Ruh hali + yakınlık etkisi
    const eff = Amor.INTENT_EFFECTS[best.intent] || {};
    const E = c.big5.E;
    Amor.Mood.nudge(c, {
      valence: (eff.valence || 0) * (best.intent === 'insult' ? (0.6 + c.big5.N) : 1),
      arousal: eff.arousal || 0,
      energy: -0.004 * messages.length,
      social: -(0.015 + (1 - E) * 0.025) * messages.length
    });
    S().affinity[c.id] = Math.max(0, (S().affinity[c.id] || 0) + (eff.aff ?? 1));

    const mood = Amor.Mood.current(c);
    const mods = Amor.Mood.modifiers(mood.values);
    const grp = Amor.Mood.group(mods.label);

    // Sosyal pil bitti -> sohbetten çık
    if (mood.values.social < 0.12 && !Amor.Schedule.status(c).forced) { // zorla çevrimiçiyken sohbetten çıkmaz
      const line = pick(c, c.mood.leave || Amor.SHARED.leave);
      return finish(c, [fill(c, line)], mods, grp, { leave: true });
    }

    const plan = Amor.Schedule.status(c);
    const casual = ['fallback', 'agree', 'answer_good', 'laugh', 'question', 'disagree'];
    let line, extra = { name: best.name, x: best.x }, askId = null;

    // Konu ve konu akışı (ruh hali kötü olsa da konu takip edilir, sadece cevapta kullanılmaz)
    const topicCtx = S().topicCtx = S().topicCtx || {};
    const turn = topicTurn(c, topicCtx[c.id] || null, messages.join(' '), best.intent);
    topicCtx[c.id] = turn.ctx;
    let topicUsed = null;

    // Huylar: trip, reddetme, terslenme normal cevabın yerine geçer
    const tr = traitTurn(c, best, messages, { lv: level(c).lv, gap, grp, interest });
    if (tr.stop) {
      const parts = tr.line.split('|').map(p => fill(c, p, extra)).filter(Boolean);
      return finish(c, parts, tr.cold ? { ...mods, emoji: 0 } : mods, tr.cold ? 'neg' : grp, {}, 'trait');
    }

    if (repeated && Math.random() < 0.7) {
      line = pick(c, Amor.SHARED.repeat);
    } else if (best.intent === 'react_q') {
      line = best.qLine;
    } else if (best.intent === 'ask_memory') {
      line = Amor.Memory.summary(c).join('|');
    } else if (best.intent.startsWith('react_')) {
      line = pick(c, Amor.SHARED[best.intent]);
    } else if (interest < 0.3 && casual.includes(best.intent)) {
      // sıkıldı: tek kelimelik cevaplar
      line = pick(c, Amor.SHARED.bored);
    } else if (grp === 'neg' || grp === 'sad' || grp === 'low') {
      const bank = c.mood[grp] || {};
      const pool = bank[best.intent] || (best.intent === 'insult' ? c.lines.insult : null) || bank.any || Amor.SHARED[grp];
      line = pick(c, pool);
      // Güvendiği biriyse kötü ruh halinin sebebini ima edebilir
      if (best.intent === 'how_are_you' && mood.cause && level(c).lv >= 3) {
        line += '|' + pick(c, Amor.SHARED.cause);
        extra.cause = mood.cause;
      }
    } else {
      line = pick(c, linePool(c, best.intent));
      if (turn.reply) {
        const tl = turn.reply.line;
        line = TOPIC_AFTER.includes(best.intent) ? line.split('|')[0] + '|' + tl : tl;
        extra.x = turn.tp.word;
        topicUsed = turn.tp;
      }
      if (best.greet && best.intent !== 'greet' && c.lines.greet) {
        line = pick(c, c.lines.greet).split('|')[0] + '|' + line;
      }
    }

    // Yeni öğrendiği bilgiye tepki ("İzmir mi? hep merak etmişimdir")
    // Olay için konu cevabı iyi/kötü haberi zaten karşıladıysa ("dün sınavım berbattı") "nasıl geçti?" diye sormaz
    const toldOutcome = topicUsed && (topicUsed.tone === 'good' || topicUsed.tone === 'bad');
    if (newFacts.length && best.intent !== 'insult' && grp !== 'neg' && !repeated && !(toldOutcome && newFacts[0].type === 'event')) {
      const fr = Amor.Memory.reaction(c, newFacts[0]);
      if (fr) {
        if (casual.includes(best.intent) || best.intent === 'answer_bad') line = fr;
        else if (best.intent === 'greet') line = line.split('|')[0] + '|' + fr; // önce selam, sonra tepki
        else line = fr + '|' + line;
      }
    }

    let parts = line.split('|').map(p => fill(c, p, extra)).filter(Boolean);
    parts = parts.slice(0, Math.max(mods.maxParts, newFacts.length ? 2 : 1));
    if (tr.prefix) parts.unshift(fill(c, tr.prefix)); // "neredeydin?"
    if (tr.odd) parts.push(fill(c, tr.odd));

    const good = grp === 'pos' || grp === 'neu';
    // Selamlaşınca: zamanı gelen olayı sor ya da eski bir bilgiyi hatırla
    if (good && interest >= 0.3 && (['greet', 'how_are_you', 'morning'].includes(best.intent) || best.greet)) {
      const fu = Amor.Memory.followup(c);
      const cb = fu ? null : (Math.random() < 0.5 ? Amor.Memory.callback(c) : null);
      if (fu) { parts.push(fill(c, fu.line)); askId = fu.qid; }
      else if (cb) parts.push(fill(c, cb));
    }

    // Yakınsa (Lv.3+) ve keyfi yerindeyse arada tatlı bir cümle ekler
    const noAsk = ['bye', 'night', 'insult', 'tell_name'].includes(best.intent) || plan.state === 'busy';
    let sweetened = false;
    if (good && !noAsk && !repeated && c.sweet?.length && level(c).lv >= 3 && interest >= 0.5 &&
        Math.random() < 0.12 + 0.05 * (level(c).lv - 3)) {
      parts.push(fill(c, pick(c, c.sweet)));
      sweetened = true;
    }

    // İyi ruh halinde, ilgiliyse ve dışa dönükse soru sorarak sohbeti sürdür
    if (good && !noAsk && !sweetened && !parts.join(' ').includes('?') &&
        Math.random() < E * 0.35 * mods.askBack * (0.4 + interest) && c.questions?.length) {
      const q = pick(c, c.questions);
      parts.push(fill(c, q.q || q));
      if (q.id) askId = q.id;
    }

    // Meşgulse (derste, nöbette...) bir kere söyler, kısa yazar
    if (plan.state === 'busy') {
      parts = parts.slice(0, 1);
      if (S().busyNote?.[c.id] !== plan.key) {
        S().busyNote = S().busyNote || {};
        S().busyNote[c.id] = plan.key;
        parts.unshift(pick(c, Amor.SHARED.busy).replace('{busy}', plan.say));
      }
    }

    return finish(c, parts, mods, grp, { askId }, best.intent);
  }

  function finish(c, rawParts, mods, grp, flags, intent) {
    const parts = rawParts.map((p, i) => stylize(c, p, mods, grp, i === rawParts.length - 1));
    S().expect[c.id] = flags.askId ? 'q:' + flags.askId : expectFrom(rawParts, intent);
    delete flags.askId;
    const delays = parts.map((p, i) => {
      let ms = (p.length / c.style.cps) * 1000 / mods.speed;
      ms = Math.max(600, Math.min(3500, ms));
      if (i === 0) ms += rand(400, 1400) + mods.extraDelay * 1000;
      return Math.round(ms);
    });
    // Cevap beklemeye başladığı an (geç cevap ve "neden bakmıyorsun bana?" için); vedalaşınca beklemez
    S().waitFrom = S().waitFrom || {};
    S().waitFrom[c.id] = flags.leave || ['bye', 'night'].includes(intent) ? null : Date.now() + delays.reduce((a, b) => a + b + 250, 0);
    Amor.Store.save();
    return { parts, delays, mood: mods.label, ...flags };
  }

  // Karakterin kendiliğinden attığı ilk mesaj
  // Karakterin kendiliğinden attığı mesaj; hafızasında sorulacak bir şey varsa onu sorar
  function opener(c) {
    const mods = Amor.Mood.modifiers(Amor.Mood.current(c).values);
    // Huylar: uzun süredir yazmayana sitem, sayko ise garip bir başlangıç
    const mine = [...((S().chats || {})[c.id] || [])].reverse().find(m => m.from === 'me');
    const special = hasTrait(c, 'ilgi') && mine && Date.now() - mine.ts > 12 * 3600000 && Math.random() < 0.6 ? traitLine(c, 'ilgi', 'forgot')
      : hasTrait(c, 'sayko') && Math.random() < TSET().saykoChance ? traitLine(c, 'sayko', 'opener') : null;
    if (special) return finish(c, special.split('|').map(p => fill(c, p)), { ...mods, emoji: 0.3 }, 'neu', {}, 'opener');
    const fu = Amor.Memory.followup(c);
    const cb = fu ? null : (Math.random() < 0.4 ? Amor.Memory.callback(c) : null);
    let parts, askId = null;
    if (fu || cb) {
      parts = [fill(c, pick(c, c.lines.greet).split('|')[0]), fill(c, fu ? fu.line : cb)];
      askId = fu ? fu.qid : null;
    } else {
      parts = pick(c, linePool(c, 'opener')).split('|').map(p => fill(c, p));
    }
    return finish(c, parts, mods, 'pos', { askId }, 'opener');
  }

  // Çevrimdışıyken gelen mesajlara geri dönüş (reason: 'sleep' uyuyordu, diğer: meşgul/yorgun)
  function comeBack(c, messages, reason) {
    const r = respond(c, messages, { back: true });
    if (r.leave) return r;
    const pool = reason === 'sleep' ? Amor.SHARED.back_sleep : Amor.SHARED.back;
    r.parts.unshift(stylize(c, fill(c, pick(c, pool)), Amor.Mood.modifiers(Amor.Mood.current(c).values), 'neu', false));
    r.delays.unshift(1200);
    return r;
  }

  /* Zorla çevrimiçi yapılınca ilk mesajı. reason: 'sleep' | 'busy' | 'tired'
   * Tripçi biri uykusundan uyandırılırsa yarı ihtimalle trip atar. */
  function wake(c, reason) {
    const mods = Amor.Mood.modifiers(Amor.Mood.current(c).values);
    let line = null;
    if (reason === 'sleep' && hasTrait(c, 'trip') && Math.random() < 0.5) {
      line = traitLine(c, 'trip', 'wake');
      if (line) { S().sulk = S().sulk || {}; S().sulk[c.id] = { ts: Date.now(), left: TSET().sulkTurns, why: 'wake' }; }
    }
    if (line) return finish(c, line.split('|').map(p => fill(c, p)), { ...mods, emoji: 0 }, 'neg', {}, 'wake');
    line = pick(c, Amor.SHARED['forced_' + reason] || Amor.SHARED.back);
    return finish(c, line.split('|').map(p => fill(c, p)), mods, 'neu', {}, 'wake');
  }

  /* "Neden bakmıyorsun bana?" (ilgi bekleyen huy). kind: 'unread' (mesajına bakmadın) | 'seen' (görüp cevap vermedin)
   * n: bu bekleyişte kaçıncı dürtme (0 ilk). Kullanıcı yazınca respond sayacı sıfırlar. */
  function nudge(c, kind, n = 0) {
    const line = traitLine(c, 'ilgi', n ? 'again' : kind, kind, 'unread');
    if (!line) return null;
    S().nudges = S().nudges || {};
    S().nudges[c.id] = n + 1;
    const mods = Amor.Mood.modifiers(Amor.Mood.current(c).values);
    return finish(c, line.split('|').map(p => fill(c, p)), { ...mods, emoji: 0.3 }, 'neu', {}, 'nudge');
  }

  /* ---------- Hediyeden yakınlık ----------
   * Gönderildiği an eklenir (çevrimdışıyken de). Değerin kareköküyle artar:
   * 10 coin ≈ +2°C, 150 ≈ +5, 1000 ≈ +12, 10k ≈ +34. Hediye seven arketipte daha fazla. */
  function giftAffinity(c, value) {
    const gain = Math.round((Math.sqrt(value) / 3 + 1) * (Amor.GIFT_LOVE[c.archetype] ?? 1));
    S().affinity[c.id] = (S().affinity[c.id] || 0) + gain;
    return gain;
  }

  /* ---------- Hediye tepkisi ----------
   * r: Wallet.sendGift sonucu { delivered, qty, value, rel } */
  function giftReact(c, r) {
    const love = Amor.GIFT_LOVE[c.archetype] ?? 1;
    const v = r.value;
    // Değer büyüdükçe etki artar ama logaritmik (10 coin ≈ küçük, 100k ≈ çok büyük)
    Amor.Mood.nudge(c, {
      valence: Math.min(0.6, (0.04 + Math.log10(v + 1) * 0.07) * love),
      arousal: v >= 3000 ? 0.15 : 0.04,
      social: Math.min(0.4, 0.05 + Math.log10(v + 1) * 0.05)
    });
    Amor.Interest.add(c, Math.min(0.1, Math.log10(v + 1) * 0.02 * love));

    const mood = Amor.Mood.current(c);
    const mods = Amor.Mood.modifiers(mood.values);
    const grp = Amor.Mood.group(mods.label);
    const tier = v < 300 ? 'small' : v < 3000 ? 'mid' : 'big';
    const giftName = r.qty > 1 ? `${r.qty} ${r.delivered.name.toLocaleLowerCase('tr')}` : r.delivered.name.toLocaleLowerCase('tr');
    const pool = (c.giftLines && c.giftLines[tier]) || ['teşekkürler {gift}'];
    let parts = pick(c, pool).split('|').map(p => fill(c, p).replace(/\{gift\}/g, giftName));
    if (r.rel) parts.push(r.rel.line);
    // Trip atıyorsa hediye barıştırır
    let made = 0;
    if ((S().sulk || {})[c.id]) {
      S().sulk[c.id] = null;
      const end = traitLine(c, 'trip', 'end');
      if (end) { const e = end.split('|').map(p => fill(c, p)); made = e.length; parts = [...e, ...parts]; }
    }
    // Gerginken bile hediye kabul edilir ama tarzı soğuk kalır
    if (grp !== 'neg') mods.maxParts = Math.max(mods.maxParts, parts.length);
    return finish(c, parts.slice(0, Math.max(mods.maxParts, r.rel ? 2 : 1) + made), mods, grp === 'neg' ? 'neg' : 'pos', {}, 'gift');
  }

  // Önizleme için: kaydetmeden, ruh hali değiştirmeden örnek cümle
  function sample(c, intent) {
    const line = pickRaw(c.lines[intent] || c.lines.fallback);
    return line.split('|').map(p => fill(c, p)).join(' ');
  }

  return { detect, respond, opener, comeBack, nudge, wake, giftReact, giftAffinity, level, norm, sample, applyDialog, topicOf, topicTaste, topicPool, topicTurn,
    traitTurn, traitPool, TRAIT_SETTINGS: TSET, TOPIC_FULL, TOPIC_AFTER, TOPIC_INHERIT, LEVELS };
})();
