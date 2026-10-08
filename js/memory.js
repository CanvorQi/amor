/*
 * Amor - Hafıza
 * -------------
 * Kullanıcının söylediklerinden bilgi çıkarır ve SADECE o karaktere kaydeder:
 *   şehir, yaş, meslek, evcil hayvan, sevdikleri / sevmedikleri, olaylar ("yarın sınavım var")
 * Sonra bunları kullanır:
 *   - öğrenince tepki verir        ("İzmir mi? hep merak etmişimdir")
 *   - olayın zamanı geçince sorar   ("dün sınavın vardı, nasıl geçti?")
 *   - aradan zaman geçince hatırlar ("işler nasıl gidiyor?")
 *   - "beni hatırlıyor musun" sorusuna bildiklerini sayar
 */
window.Amor = window.Amor || {};

Amor.Memory = (() => {
  const S = () => Amor.Store.state;
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const FOLD = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  const fold = s => s.toLocaleLowerCase('tr').replace(/[çğıöşüâîû]/g, ch => FOLD[ch]);
  const DAY = 86400000;

  function dateKey(offset = 0) {
    const d = new Date(Date.now() + offset * DAY);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function get(c) {
    const all = S().memory = S().memory || {};
    return all[c.id] = all[c.id] || { facts: {}, likes: [], dislikes: [], events: [], lastCallback: 0 };
  }

  /* ---------- Tepki cümleleri (karakterin tarzı sonradan uygulanır) ---------- */
  const REACT = {
    city_same: [
      '{x} mı?? ben de oradayım!',
      'aa hemşehriyiz o zaman 😄',
      '{x} mi?! Tesadüfe bak, aynı şehirdeyiz!',
      'Vay canına, ben de {x}\'dayım! Karşılaşırız belki {laugh}'
    ],
    city: [
      '{x} ha, hiç gitmedim oraya',
      '{x} güzel yermiş diyorlar',
      '{x} mı? hep merak etmişimdir',
      '{x} çok özel bir yer bence',
      '{x}\'nın havası bambaşka derler',
      'Bir gün {x}\'ya gelirsem bana etrafı gezdirirsin artık!'
    ],
    age: [
      '{x} mı, güzel yaş',
      '{x} ha, tamam not ettim',
      '{x} mi? Hayatın en güzel, en enerjik dönemleri bence',
      'Vaay {x}! Tam en keyifli yaşlar',
      '{x} demek... Yaşıt sayılırız neredeyse {laugh}'
    ],
    job_student: [
      'öğrencisin demek, ne okuyorsun?',
      'okul hayatı ha, kolay gelsin',
      'öğrenci olmak hem eğlenceli hem yorucu, kolay gelsin!',
      'dersler ve vizeler seni çok yıpratmıyordur umarım {laugh}'
    ],
    job: [
      '{x} ha, nasıl gidiyor?',
      'vay, {x}! zor mu?',
      '{x} olmak epey havalıymış bu arada!',
      'işinde başarılar dilerim, kendini çok yorma ama',
      '{x} demek... Severek mi yapıyorsun işini?'
    ],
    job_issiz: [
      'olsun, iyi bir şey bulursun 🍀',
      'sakın moralini bozma, en güzeli karşına çıkacaktır 🍀',
      'her şey zamanla yoluna girer, biraz dinlenmene bak'
    ],
    pet: [
      'ayy {x} mı var? adı ne? 🥺',
      '{x} mı var?? fotosunu görmem lazım',
      'inanmıyorum, {x} beslemek harika bir his olmalı 🥺',
      'ayy bayılırım! Sevgimi ilet minik dostumuza'
    ],
    like_same: [
      'ayy ben de {x} çok severim!',
      '{x} mı? zevklerimiz uyuşuyor 😄',
      '{x} konusunda aynı fikirde olmamıza çok sevindim!',
      'ortak zevklerimizin olması ne kadar hoş {laugh}'
    ],
    like: [
      '{x} ha, not ettim',
      '{x} demek, güzel',
      '{x} sevmene sevindim, bunu aklımda tutacağım',
      'zevkli birisin belli ki, {x} harika bir tercih'
    ],
    dislike: [
      '{x} sevmiyorsun demek, not ettim {laugh}',
      'anlaşıldı, {x} yok',
      'tamamdır, {x} konusunu rafa kaldırıyorum {laugh}',
      'haklısın, {x} herkesin sevebileceği bir şey değil'
    ],
    event: [
      'ayy {x} {mi} var? başarılar 🍀',
      '{x} {mi}? kolay gelsin, sonra anlat ama',
      'harika bir gün olsun senin için, bol şans 🍀',
      'aklım sende kalacak, umarım her şey harika geçer!'
    ],
    event_birthday: [
      'doğum günün mü?? iyi ki doğdun 🎂🎉',
      'ayy mutlu yıllar! İyi ki varsın, yeni yaşın sana güzellikler getirsin 🎂✨',
      'doğum günün kutlu olsun, sevdiklerinle nice harika senelere! 🎉'
    ],
    event_past: [
      '{x} nasıl geçti peki?',
      '{x} nasıldı, umarım her şey istediğin gibi gitmiştir?',
      '{x} bitti mi, rahatladın mı biraz?'
    ]
  };

  /* ---------- Bilgi çıkarma ---------- */
  const STOP = ['seni', 'sizi', 'onu', 'bunu', 'beni', 'kimseyi', 'hepsini', 'seyi', 'çok', 'cok', 'en', 'da', 'de', 'ben', 'sen', 'hepsi'];

  // "kahveyi" -> "kahve", "müziği" -> "müzik"
  function stripAcc(w) {
    if (w.length < 5) return w;
    let s = w.replace(/(yı|yi|yu|yü)$/, '');
    if (s === w) s = w.replace(/[ıiuü]$/, '');
    return s.replace(/ğ$/, 'k');
  }

  function cityFrom(f) {
    for (const [k, disp] of Amor.MEM_CITIES) {
      const re = new RegExp(`(?:^|\\s)${k}'?(?:l[iu]y[iu]m|d[ae]y[iu]m|t[ae]y[iu]m|d[ae]n[iu]m|t[ae]n[iu]m|(?:d[ae]|t[ae])? (?:yasiyorum|oturuyorum)|(?:da|de|ta|te) dogdum)(?=\\s|$|[.,!?])`);
      if (re.test(f)) return disp;
    }
    return null;
  }

  function jobFrom(f) {
    if (/(?:^|\s)(calismiyorum|issizim)/.test(f)) return { value: 'işsiz', issiz: true };
    if (/(?:^|\s)(universitede okuyorum|okula gidiyorum|lisede okuyorum)/.test(f)) return { value: 'öğrenci', student: true };
    for (const [k, disp, student] of Amor.MEM_JOBS) {
      const re = new RegExp(`(?:^|\\s)${k}(?:y[iu]m|[iu]m)(?=\\s|$|[.,!?])|(?:^|\\s)${k} olarak calisiyorum`);
      if (re.test(f)) return { value: disp, student: !!student, issiz: k === 'issiz' };
    }
    return null;
  }

  function petFrom(f) {
    const PETS = { kedim: 'kedin', kopegim: 'köpeğin', kusum: 'kuşun', baligim: 'balığın', tavsanim: 'tavşanın', hamsterim: 'hamsterın' };
    const m = f.match(/(?:^|\s)(kedim|kopegim|kusum|baligim|tavsanim|hamsterim) (?:var|oldu)/);
    return m ? PETS[m[1]] : null;
  }

  function likeFrom(low, verbs) {
    const re = new RegExp(`([a-zçğıöşü]+) (?:çok |cok )?(?:${verbs})(?=\\s|$|[.,!?])`);
    const m = low.match(re);
    if (!m || STOP.includes(m[1])) return null;
    return stripAcc(m[1]);
  }

  function eventsFrom(f) {
    const out = [];
    for (const ev of Amor.MEM_EVENTS) {
      if (!ev.m.some(w => (' ' + f).includes(' ' + w))) continue;
      let due = dateKey(0), past = false;
      if (/(?:^|\s)yarin/.test(f)) due = dateKey(1);
      else if (/(?:^|\s)haftaya/.test(f)) due = dateKey(7);
      else if (/(?:^|\s)dun/.test(f)) { due = dateKey(-1); past = true; }
      else if (!/(?:^|\s)(bugun|var|olacak|gidiyorum|gidecegim)/.test(f)) continue;
      out.push({ key: ev.key, label: ev.label, mi: ev.mi, due, past });
    }
    return out;
  }

  /* Yeni öğrenilen bilgileri kaydeder ve döndürür: [{ type, value, ... }] */
  function learn(c, messages, intent) {
    const mem = get(c);
    const found = [];
    for (const raw of messages) {
      const low = raw.toLocaleLowerCase('tr');
      const f = fold(raw);

      for (const ev of eventsFrom(f)) {
        if (mem.events.some(e => e.key === ev.key && e.due === ev.due)) continue;
        mem.events.push({ ...ev, asked: ev.past, ts: Date.now() });
        found.push({ type: 'event', ...ev });
      }
      const city = cityFrom(f);
      if (city && mem.facts.city !== city) { mem.facts.city = city; found.push({ type: 'city', value: city }); }

      const age = f.match(/(?:^|\s)(\d{2}) yasindayim|yasim (\d{2})/);
      const a = age && Number(age[1] || age[2]);
      if (a && a >= 15 && a < 90 && mem.facts.age !== a) { mem.facts.age = a; found.push({ type: 'age', value: a }); }

      const job = jobFrom(f);
      if (job && mem.facts.job !== job.value) { mem.facts.job = job.value; mem.facts.student = job.student; found.push({ type: 'job', ...job }); }

      const pet = petFrom(f);
      if (pet && mem.facts.pet !== pet) { mem.facts.pet = pet; found.push({ type: 'pet', value: pet }); }

      if (intent !== 'flirt') {
        const like = likeFrom(low, 'severim|seviyorum|bayılırım|bayılıyorum|bayiliyorum');
        if (like && !mem.likes.includes(like)) { mem.likes.push(like); found.push({ type: 'like', value: like }); }
        const dis = likeFrom(low, 'sevmem|sevmiyorum|nefret ederim|hoşlanmam|hoslanmam');
        if (dis && !mem.dislikes.includes(dis)) { mem.dislikes.push(dis); found.push({ type: 'dislike', value: dis }); }
      }
    }
    // Kötü bir gün geçirdiğini söylediyse ertesi gün halini sorar
    if (intent === 'answer_bad' && !mem.events.some(e => e.key === 'moral' && e.due === dateKey(0))) {
      mem.events.push({ key: 'moral', label: 'moralin', due: dateKey(0), asked: false, ts: Date.now() });
    }
    mem.likes = mem.likes.slice(-12);
    mem.dislikes = mem.dislikes.slice(-12);
    mem.events = mem.events.slice(-20);
    // Yeni öğrendiğini hemen "hatırlıyormuş" gibi sormasın (en az 4 saat sonra)
    if (found.length) { mem.updated = Date.now(); mem.lastCallback = Date.now(); }
    return found;
  }

  // Dışarıdan bilinen bilgi kaydı (ör. "nerelisin?" sorusuna tek kelime cevap)
  function remember(c, type, value) {
    get(c).facts[type] = value;
  }

  /* ---------- Öğrenince tepki ---------- */
  function reaction(c, fact) {
    const sameLike = l => (c.likes || []).some(x => fold(x).includes(fold(l)) || fold(l).includes(fold(x)));
    let pool, x = String(fact.value || '');
    switch (fact.type) {
      case 'city': pool = fact.value === c.city ? REACT.city_same : REACT.city; break;
      case 'age': pool = REACT.age; break;
      case 'job': pool = fact.issiz ? REACT.job_issiz : fact.student ? REACT.job_student : REACT.job; break;
      case 'pet': pool = REACT.pet; break;
      case 'like': pool = sameLike(x) ? REACT.like_same : REACT.like; break;
      case 'dislike': pool = REACT.dislike; break;
      case 'event':
        x = fact.label;
        pool = fact.key === 'dogumgunu' && !fact.past ? REACT.event_birthday : fact.past ? REACT.event_past : REACT.event;
        break;
      default: return null;
    }
    return pick(pool).replace(/\{x\} m[ıi](?=[\s?!.,]|$)/g, `{x} ${soru(x)}`).replace(/\{x\}/g, x).replace(/\{mi\}/g, fact.mi || soru(x));
  }

  /* ---------- Zamanı gelen olayı sor ---------- */
  function followup(c) {
    const mem = get(c);
    const today = dateKey(0), yesterday = dateKey(-1);
    const hour = new Date().getHours();
    const ev = mem.events.find(e => !e.asked && (e.due < today || (e.due === today && hour >= 19 && e.key !== 'moral')));
    if (!ev) return null;
    ev.asked = true;
    const when = ev.due === today ? 'bugün' : ev.due === yesterday ? 'dün' : 'geçen gün';
    if (ev.key === 'moral') return { line: `${when} moralin bozuktu, şimdi nasılsın?`, qid: null };
    if (ev.key === 'dogumgunu') return { line: 'doğum günün nasıl geçti? 🎂', qid: 'event_followup' };
    return { line: `${when} ${ev.label} vardı, nasıl geçti?`, qid: 'event_followup' };
  }

  /* ---------- Aradan zaman geçince hatırla ---------- */
  function callback(c) {
    const mem = get(c), f = mem.facts;
    if (Date.now() - (mem.lastCallback || 0) < 4 * 3600000) return null;
    const opts = [];
    if (f.city) opts.push(`${f.city} nasıl, hava güzel mi bugün?`);
    if (f.job) opts.push(f.issiz ? 'iş bakmaya devam ediyor musun?' : f.student ? 'dersler nasıl gidiyor?' : 'işler nasıl gidiyor?');
    if (f.pet) opts.push(`${f.pet} nasıl? 🐾`);
    if (mem.likes.length) opts.push(`aklıma geldi, sen ${pick(mem.likes)} seviyordun değil mi`);
    if (!opts.length) return null;
    mem.lastCallback = Date.now();
    return pick(opts);
  }

  // Kelimenin son ünlüsü (sayılar okunuşlarına göre: 25 -> "beş" -> e)
  const NUM_LAST = ['ı', 'i', 'i', 'ü', 'ö', 'e', 'ı', 'i', 'i', 'u'];       // sıfır bir iki üç dört beş altı yedi sekiz dokuz
  const TENS_LAST = ['', 'o', 'i', 'u', 'ı', 'i', 'ı', 'i', 'e', 'a'];       // on yirmi otuz kırk elli altmış yetmiş seksen doksan
  function lastVowel(word) {
    const w = String(word).toLocaleLowerCase('tr').trim();
    const num = w.match(/(\d+)$/);
    if (num) {
      const n = Number(num[1]);
      return n % 10 ? NUM_LAST[n % 10] : TENS_LAST[Math.floor(n / 10) % 10] || 'ı';
    }
    return (w.match(/[aeıioöuü]/g) || ['e']).pop();
  }

  // Soru eki: kahve -> "mi", kedin -> "mi", 25 -> "mi", 30 -> "mu", Ankara -> "mı"
  const soru = word => ({ a: 'mı', ı: 'mı', e: 'mi', i: 'mi', o: 'mu', u: 'mu', ö: 'mü', ü: 'mü' }[lastVowel(word)]);

  // "-sin" eki: doktor -> "sun", mühendis -> "sin", avukat -> "sın", şoför -> "sün"
  const youAre = word => ({ a: 'sın', ı: 'sın', e: 'sin', i: 'sin', o: 'sun', u: 'sun', ö: 'sün', ü: 'sün' }[lastVowel(word)]);

  /* ---------- "Beni hatırlıyor musun?" ---------- */
  function summary(c) {
    const mem = get(c), f = mem.facts;
    const name = S().user.name;
    const bits = [];
    if (f.city) bits.push(`${f.city} diyordun`);
    if (f.age) bits.push(`${f.age} yaşındasın`);
    if (f.job) bits.push(f.issiz ? 'iş arıyorsun' : f.student ? 'öğrencisin' : f.job + youAre(f.job));
    if (f.pet) bits.push(`bir de ${f.pet} var`);
    if (mem.likes.length) bits.push(`${mem.likes.slice(-2).join(' ve ')} seviyorsun`);
    if (!name && !bits.length) return ['hmm', 'bana pek bir şey anlatmadın ki {laugh}'];
    const parts = [name ? `tabii ki ${name} 🙈` : 'tabii ki hatırlıyorum 🙈'];
    if (bits.length) parts.push(bits.slice(0, 3).join(', '));
    return parts;
  }

  // Sohbet menüsündeki "Hakkımda bildikleri" listesi
  function list(c) {
    const mem = get(c), f = mem.facts, out = [];
    if (S().user.name) out.push(['👤', 'Adın', S().user.name]);
    if (f.city) out.push(['📍', 'Şehir', f.city]);
    if (f.age) out.push(['🎂', 'Yaş', f.age]);
    if (f.job) out.push(['💼', 'Meslek', f.job]);
    const PET_NAME = { kedin: 'kedi', 'köpeğin': 'köpek', 'kuşun': 'kuş', 'balığın': 'balık', 'tavşanın': 'tavşan', 'hamsterın': 'hamster' };
    if (f.pet) out.push(['🐾', 'Evcil hayvan', PET_NAME[f.pet] || f.pet]);
    if (mem.likes.length) out.push(['💜', 'Sevdiklerin', mem.likes.join(', ')]);
    if (mem.dislikes.length) out.push(['✖', 'Sevmediklerin', mem.dislikes.join(', ')]);
    mem.events.slice(-4).forEach(e => out.push(['📅', e.key === 'moral' ? 'Moral' : e.label, `${e.due}${e.asked ? ' · soruldu' : ''}`]));
    return out;
  }

  return { get, learn, remember, reaction, followup, callback, summary, list, dateKey, soru };
})();
