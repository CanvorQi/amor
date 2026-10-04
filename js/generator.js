/*
 * Amor - Karakter oluşturucu
 * --------------------------
 * Bir karakter = fotoğraf seti (characters/<klasör>/photos) + isim havuzundan bir isim
 *               + kişilik arketipi + bunlara uygun rastgele kimlik.
 *
 * Kayıtta sadece "kimlik" saklanır (Store.characters). Uygulama açılınca her kimlik,
 * arketipinin cümleleri ve yazım tarzıyla birleştirilip Amor.CHARACTERS'a yüklenir.
 */
window.Amor = window.Amor || {};

Amor.Gen = (() => {
  const S = () => Amor.Store.state;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const int = (a, b) => Math.floor(rnd(a, b + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);
  const jitter = v => Math.round(Math.max(0.05, Math.min(0.95, v + rnd(-0.08, 0.08))) * 100) / 100;

  const setById = id => Amor.PHOTO_SETS.find(s => s.id === id);
  // Fotoğraflar characters/<set>/photos/ ya da doğrudan characters/<set>/ altında olabilir
  const photoUrl = (setId, file) => {
    const set = setById(setId);
    const dir = set && set.dir !== undefined ? set.dir : 'photos/';
    return `characters/${encodeURIComponent(setId)}/${dir}${encodeURIComponent(file)}`;
  };

  function daysAgo(n) {
    const d = new Date(Date.now() - n * 86400000);
    return d.toISOString().slice(0, 10);
  }

  /* ---------- Havuzdan seçim ---------- */
  const usedSets = (exceptId) => new Set(S().characters.filter(c => c.id !== exceptId).map(c => c.setId));
  const usedNames = () => new Set(S().characters.map(c => c.name));

  // En az kullanılan fotoğraf setlerinden biri (karakter sayısı set sayısını geçerse tekrar başlar)
  function randomSet() {
    const count = {};
    Amor.PHOTO_SETS.forEach(s => { count[s.id] = 0; });
    S().characters.forEach(c => { if (c.setId in count) count[c.setId]++; });
    const min = Math.min(...Object.values(count));
    return pick(Amor.PHOTO_SETS.filter(s => count[s.id] === min)).id;
  }

  function randomName() {
    const used = usedNames();
    const all = Object.values(Amor.NAMES).flat();
    const free = all.filter(n => !used.has(n));
    return pick(free.length ? free : all);
  }

  function eraOf(name) {
    for (const [era, list] of Object.entries(Amor.NAMES)) if (list.includes(name)) return era;
    return 'modern';
  }

  // İsim + kişilik -> yaş aralığı (18-50)
  function ageRange(name, archId) {
    let [lo, hi] = Amor.NAME_AGE[eraOf(name)];
    if (archId === 'olgun') { lo = Math.max(lo, 25); hi = Math.max(hi, 34); }
    return [Math.max(18, lo), Math.min(50, Math.max(lo, hi))];
  }

  // Kişiliğe ve yaşa uygun meslek
  function pickJob(archId, age) {
    const fitsAge = j => age >= (j.min || 18) && age <= (j.max || 50);
    const fits = Amor.JOBS.filter(j => j.arch.includes(archId) && fitsAge(j));
    const students = fits.filter(j => j.student);
    const workers = fits.filter(j => !j.student);
    if (age <= 21 && students.length) return pick(students);
    if (age <= 24 && students.length && Math.random() < 0.5) return pick(students);
    if (workers.length) return pick(workers);
    // kişiliğe uyan yoksa yaşa uyan herhangi bir meslek
    return pick(fits.length ? fits : Amor.JOBS.filter(j => !j.student && fitsAge(j)));
  }

  const fillSimple = (s, ctx) => s
    .replace(/\{fav\}/g, ctx.fav)
    .replace(/\{like\}/g, ctx.likes[0]);

  /* ---------- Konu zevki ----------
   * Her karakterin sevmediklerinden en az biri bir sohbet konusuna denk gelsin ("futbol maçları" -> futbola ilgisiz).
   * Kişiliğin sevdiği konular hariç (engine.js topicTaste ile aynı kural). */
  const topicsOf = item => (Amor.TOPICS || []).filter(t => Amor.Engine.topicTaste({ likes: [item] }, t) === 'love').map(t => t.id);
  function mehTopics(arch, dislikes) {
    const loved = new Set(arch.likes.flatMap(topicsOf));
    return dislikes.filter(d => topicsOf(d).some(id => !loved.has(id)));
  }
  // Sevmedikleri hiçbir konuya denk gelmiyorsa kişiliğin listesinden konuyla ilgili birini döndürür
  function topicDislike(arch, dislikes) {
    if (!Amor.Engine || mehTopics(arch, dislikes).length) return null;
    const opts = mehTopics(arch, arch.dislikes.filter(d => !dislikes.includes(d)));
    return opts.length ? pick(opts) : null;
  }

  /* ---------- Huylar (js/data/traits.js) ----------
   * Her karakterin her huy için sabit bir zarı var (0-1). Zar, kişiliğin o huy ihtimalinden küçükse huy açık.
   * Böylece editörde ihtimal değişince mevcut karakterler de ona göre değişir; yeni eklenen huya da zar atılır.
   * Elle tanımlanan karakterde traits listesi verilmişse zar yerine o kullanılır. */
  function rollTraits(old) {
    const r = { ...(old || {}) };
    (Amor.TRAITS || []).forEach(t => { if (typeof r[t.id] !== 'number') r[t.id] = Math.round(Math.random() * 100) / 100; });
    return r;
  }
  function traitsOf(id) {
    if (Array.isArray(id.traits)) return id.traits;
    const roll = id.traitRoll || {};
    return (Amor.TRAITS || []).filter(t => roll[t.id] < ((t.chance || {})[id.archetype] || 0)).map(t => t.id);
  }

  /* ---------- Kimlik üret ----------
   * opts: { setId, name, archetype } verilenler korunur, diğerleri rastgele */
  function draft(opts = {}) {
    const setId = opts.setId || randomSet();
    const name = (opts.name || randomName()).trim();
    const arch = Amor.archetype(opts.archetype || pick(Amor.ARCHETYPES).id);
    const [lo, hi] = ageRange(name, arch.id);
    const age = int(lo, hi);
    const city = pick(Amor.CITIES);
    const job = pickJob(arch.id, age);
    const height = int(156, 177);
    const likes = shuffle(arch.likes).slice(0, 5);
    const set = setById(setId);
    const ctx = { fav: city.fav, likes };
    const captions = shuffle(arch.captions);
    const postPhotos = shuffle(set ? set.photos : []).slice(0, 3);
    const dislikes = shuffle(arch.dislikes).slice(0, 3);
    const meh = topicDislike(arch, dislikes);
    if (meh) dislikes[2] = meh;
    let day = int(0, 4);

    return {
      id: 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10),
      setId,
      name,
      deco: Math.random() < 0.4 ? pick(Amor.NAME_DECOS) : ['', ''],
      archetype: arch.id,
      age,
      cityName: city.name,
      district: pick(city.districts),
      job: job.title,
      height,
      weight: height - 108 + int(-4, 4),
      zodiac: pick(Amor.ZODIACS),
      bio: fillSimple(pick(arch.bios), ctx),
      likes,
      dislikes,
      big5: Object.fromEntries(Object.entries(arch.big5).map(([k, v]) => [k, jitter(v)])),
      traitRoll: rollTraits(),
      followers: int(...arch.followers),
      following: int(20, 400),
      gifts: int(5, 600),
      joined: daysAgo(int(0, 120)),
      posts: postPhotos.map((p, i) => {
        day += int(3, 14);
        return { photo: p, text: fillSimple(captions[i % captions.length], ctx), date: daysAgo(day) };
      })
    };
  }

  /* ---------- Ekran adı (Amor.NAME_STYLES) ----------
   * Stil kayıtta yoksa kimlikten sabit türetilir (her açılışta aynı). Elle tanımlanan karakterlere dokunulmaz. */
  const nicks = new Map(); // karakter id -> takma ad
  const hashOf = s => { let h = 7; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  function styledName(id) {
    const name = id.name;
    if ((Amor.CUSTOM_CHARACTERS || []).some(d => d.id === id.id)) return name;
    const h = hashOf(id.id);
    let style = id.nameStyle;
    if (style === undefined) {
      const total = Amor.NAME_STYLES.reduce((a, s) => a + s[1], 0);
      let r = h % total;
      style = Amor.NAME_STYLES.find(s => (r -= s[1]) < 0)[0];
    }
    const at = list => list[(h >>> 8) % list.length];
    const up = s => s.toLocaleUpperCase('tr'), low = s => s.toLocaleLowerCase('tr');
    switch (style) {
      case 'upper': return up(name);
      case 'lower': return low(name);
      case 'stretch': return name + name.slice(-1).repeat(1 + (h >>> 4) % 2);
      case 'paren': { const b = at(Amor.NAME_BRACKETS); return b[0] + up(name) + b[1]; }
      case 'az': return name.replace(/e/g, 'ə') + name.slice(-1);
      case 'nick': {
        // aynı takma ad iki kişide olmasın: doluysa listede sıradakine geç
        if (!nicks.has(id.id)) {
          const taken = new Set(nicks.values()), L = Amor.NICKNAMES;
          const fill = n => n.replace(/\{name\}/g, name).replace(/\{low\}/g, low(name).replace(/\s+/g, ''));
          let i = (h >>> 8) % L.length, k = 0;
          while (taken.has(fill(L[i])) && k++ < L.length) i = (i + 1) % L.length;
          nicks.set(id.id, fill(L[i]));
        }
        return nicks.get(id.id);
      }
      default: return name;
    }
  }

  /* ---------- Kimlik + arketip -> çalışan karakter ---------- */
  function hydrate(id) {
    const arch = Amor.archetype(id.archetype);
    const city = Amor.CITIES.find(c => c.name === id.cityName) || Amor.CITIES[0];
    const job = Amor.JOBS.find(j => j.title === id.job) || Amor.JOBS[0];
    const set = setById(id.setId);
    const deco = id.deco || ['', ''];
    const shown = styledName(id);
    return {
      ...id,
      traits: traitsOf(id),
      display: (deco[2] ? deco[0] + shown + deco[1] : `${deco[0]} ${shown} ${deco[1]}`).trim(),
      city: city.name, cityAt: city.at, fav: city.fav,
      jobIs: job.is, doing: job.doing,
      archLabel: arch.label, emoji: arch.icon, colors: arch.colors,
      style: arch.style, hitap: arch.hitap, lines: arch.lines, questions: arch.questions, mood: arch.mood, giftLines: arch.gift, sweet: arch.sweet || [],
      photo: set ? photoUrl(set.id, set.profile) : null,
      cover: set ? photoUrl(set.id, set.photos[0] || set.profile) : null,
      album: set ? [set.profile, ...set.photos].map(f => photoUrl(set.id, f)) : [],
      posts: (id.posts || []).map(p => ({ ...p, photo: set && p.photo ? photoUrl(set.id, p.photo) : null }))
    };
  }

  // Karakterin gönderilerine setinden fotoğraf dağıt (setteki dosyalar değişince de)
  function repost(c) {
    const photos = shuffle(setById(c.setId).photos);
    c.posts = (c.posts || []).map((p, i) => ({ ...p, photo: photos[i] || null }));
  }

  /* Yeni fotoğraf setleri gelince (PHOTO_VERSION artırılır) bir kez: aynı seti paylaşan karakterleri
   * boştaki setlere dağıt. Sohbet ettiğin ve elle tanımlanan karakterler setini korur. */
  const PHOTO_VERSION = 1;
  function spreadSets() {
    const s = S();
    const custom = new Set((Amor.CUSTOM_CHARACTERS || []).map(d => d.id));
    const talked = c => ((s.chats || {})[c.id] || []).length;
    const order = [...s.characters].sort((a, b) => (custom.has(b.id) - custom.has(a.id)) || (talked(b) - talked(a)));
    const taken = new Set();
    order.forEach(c => { if (custom.has(c.id) && setById(c.setId)) taken.add(c.setId); });
    let moved = 0;
    order.forEach(c => {
      if (custom.has(c.id)) return;
      if (setById(c.setId) && !taken.has(c.setId)) { taken.add(c.setId); return; }
      const free = Amor.PHOTO_SETS.filter(x => !taken.has(x.id));
      if (!free.length) return; // set sayısı yetmiyorsa paylaşmaya devam
      c.setId = pick(free).id;
      taken.add(c.setId);
      repost(c);
      moved++;
    });
    s.photoVersion = PHOTO_VERSION;
    return moved;
  }

  function load() {
    let changed = false;
    if ((S().photoVersion || 0) < PHOTO_VERSION && Amor.PHOTO_SETS.length) { spreadSets(); changed = true; }
    // Fotoğraf seti silinmiş/yeniden adlandırılmış karakterlere boştaki yeni bir set ata
    S().characters.forEach(c => {
      // eski karakterlere (ve sonradan eklenen huylara) zar at
      const roll = rollTraits(c.traitRoll);
      if (Object.keys(roll).length !== Object.keys(c.traitRoll || {}).length) { c.traitRoll = roll; changed = true; }
      const cur = setById(c.setId);
      if (cur) {
        // setteki dosyalar değiştiyse olmayan fotoğrafa işaret eden gönderileri yenile
        if ((c.posts || []).some(p => p.photo && !cur.photos.includes(p.photo))) { repost(c); changed = true; }
        return;
      }
      const used = usedSets(c.id);
      const free = Amor.PHOTO_SETS.filter(s => !used.has(s.id));
      const set = pick(free.length ? free : Amor.PHOTO_SETS);
      if (!set) return;
      c.setId = set.id;
      repost(c);
      changed = true;
    });
    if (changed) Amor.Store.save();
    Amor.CHARACTERS = S().characters.map(hydrate);
  }

  function add(identity) {
    S().characters.unshift(identity);
    Amor.Store.save();
    load();
    return Amor.byId(identity.id);
  }

  function remove(id) {
    const s = S();
    // elle tanımlanan karakter silinince bir daha eklenmesin
    if ((Amor.CUSTOM_CHARACTERS || []).some(d => d.id === id)) s.customRemoved = [...(s.customRemoved || []), id];
    s.characters = s.characters.filter(c => c.id !== id);
    ['moods', 'moodLog', 'chats', 'affinity', 'unread', 'follows', 'recent', 'expect', 'pending'].forEach(k => delete s[k][id]);
    Amor.Store.save();
    load();
  }

  /* İlk açılışta (ya da sürüm yükselince bir kez) karakter sayısını hedefe tamamlar.
   * Kişilikler eşit dağılır. Sonradan silinen karakterler geri gelmez. */
  const SEED_TARGET = 50, SEED_VERSION = 2;
  function seed() {
    const s = S();
    syncCustom();
    // Bir kerelik: mevcut karakterlere konuyla ilgili bir "sevmedikleri" ekle
    if ((s.tasteVersion || 0) < 1) {
      s.characters.forEach(c => {
        const d = topicDislike(Amor.archetype(c.archetype), c.dislikes || []);
        if (d) c.dislikes = [...(c.dislikes || []), d];
      });
      s.tasteVersion = 1;
      Amor.Store.save();
    }
    if ((s.seedVersion || 0) >= SEED_VERSION) return;
    while (s.characters.length < SEED_TARGET) {
      const count = {};
      Amor.ARCHETYPES.forEach(a => { count[a.id] = 0; });
      s.characters.forEach(c => { count[c.archetype] = (count[c.archetype] || 0) + 1; });
      const min = Math.min(...Object.values(count));
      const arch = pick(Amor.ARCHETYPES.filter(a => count[a.id] === min)).id;
      s.characters.push(draft({ archetype: arch }));
    }
    s.seedVersion = SEED_VERSION;
    Amor.Store.save();
  }

  /* Elle tanımlanan karakterler (karakter-ekle.bat -> js/data/custom-characters.js).
   * Yoksa eklenir; varsa tanımdaki alanlar her açılışta yeniden uygulanır.
   * Boş bırakılan alanlar rastgele kalır. */
  function syncCustom() {
    const s = S();
    const removed = s.customRemoved || [];
    s.customMoodAt = s.customMoodAt || {};
    let changed = false;
    (Amor.CUSTOM_CHARACTERS || []).forEach(def => {
      if (removed.includes(def.id) || !setById(def.setId)) return;
      let c = s.characters.find(x => x.id === def.id);
      if (!c) {
        c = draft({ setId: def.setId, name: def.name, archetype: def.archetype });
        c.id = def.id;
        s.characters.unshift(c);
      }
      const arch = Amor.archetype(def.archetype);
      if (c.archetype !== arch.id) {
        c.archetype = arch.id;
        c.big5 = Object.fromEntries(Object.entries(arch.big5).map(([k, v]) => [k, jitter(v)]));
      }
      if (c.setId !== def.setId) {
        const photos = shuffle(setById(def.setId).photos);
        c.setId = def.setId;
        c.posts = (c.posts || []).map((p, i) => ({ ...p, photo: photos[i] || null }));
      }
      c.name = def.name;
      if (def.age) c.age = def.age;
      if (def.height) { c.height = def.height; c.weight = def.height - 108; }
      const city = def.city && Amor.CITIES.find(x => x.name === def.city);
      if (city) {
        c.cityName = city.name;
        if (!city.districts.includes(c.district)) c.district = pick(city.districts);
      }
      if (def.job && Amor.JOBS.some(j => j.title === def.job)) c.job = def.job;
      if (def.bio) c.bio = def.bio;
      if (def.big5) c.big5 = { ...c.big5, ...def.big5 };
      if (Array.isArray(def.traits)) c.traits = def.traits; else delete c.traits; // boş = kişiliğe göre rastgele
      // başlangıç ruh hali: araçta her değiştirildiğinde bir kez uygulanır
      if (def.mood && s.customMoodAt[def.id] !== def.moodAt) {
        s.moods[def.id] = { values: { ...def.mood }, updatedAt: Date.now(), locked: !!def.moodLocked, cause: null, source: 'tanım' };
        s.customMoodAt[def.id] = def.moodAt;
      }
      changed = true;
    });
    if (changed) Amor.Store.save();
  }

  return { draft, hydrate, load, add, remove, seed, randomSet, randomName, usedSets, photoUrl, setById };
})();

Amor.byId = id => (Amor.CHARACTERS || []).find(c => c.id === id);
