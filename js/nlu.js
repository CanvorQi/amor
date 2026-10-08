/*
 * Amor - NLU & Doğal Dil Anlama Motoru (js/nlu.js)
 * -------------------------------------------------
 * Saf JavaScript, sıfır bağımlılık, internetsiz ve PWA uyumlu.
 *
 * Özellikler:
 * 1. Türkçe Sadeleştirme (Turkish Folding, Unaccent, Collapse)
 * 2. Sessiz Harf İskeleti (Türkçe SMS/Sohbet Kısaltmaları: slm->selam, gnydn->günaydın, nbr->naber)
 * 3. Türkçe Morfolojik Kök Ayırıcı (Stemmer: çekim, iyelik, çoğul, hal ve zaman eklerini soyar)
 * 4. Yazım Hatası Toleransı (Damerau-Levenshtein Fuzzy Match)
 * 5. Olumsuzluk Tespiti (Negation Detection: "iyi değilim" -> kötü, "sevmiyorum" -> dislike)
 * 6. Güven Skoru ve Olasılık Tabanlı Niyet & Konu Sınıflandırma (Intent & Topic Classifier)
 * 7. Dinamik Duygu Puanlama (Sentiment Analysis: -1.0 ile +1.0)
 */

window.Amor = window.Amor || {};

Amor.NLU = (() => {
  /* ---------- 1. Karakter & Metin Sadeleştirme ---------- */
  const FOLD_MAP = {
    'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u',
    'â': 'a', 'î': 'i', 'û': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i',
    'I': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u', 'Â': 'a', 'Î': 'i', 'Û': 'u'
  };

  const VOWELS = new Set(['a', 'e', 'i', 'o', 'u']);

  // Türkçe küçük harfe çevirme + karakter sadeleştirme
  function fold(str) {
    if (!str) return '';
    return str
      .toLocaleLowerCase('tr')
      .replace(/[çğıöşüâîûÇĞİIÖŞÜÂÎÛ]/g, ch => FOLD_MAP[ch] || ch);
  }

  // Tekrar eden harfleri sadeleştir (ör: "selaaammm" -> "selam", "çooook" -> "cok")
  function collapse(str) {
    if (!str) return '';
    return str.replace(/(.)\1+/gu, '$1');
  }

  // Standart normalizasyon: boşluklar, emojiler ve sadeleştirilmiş harfler
  function norm(str) {
    if (!str) return '';
    const folded = fold(str);
    const collapsed = collapse(folded);
    return collapsed
      .replace(/[^\p{L}\p{N}\p{Extended_Pictographic}\s?]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Kelimeleri listeye böl
  function tokenize(str) {
    const n = norm(str);
    return n ? n.split(' ').filter(Boolean) : [];
  }

  // Sessiz harf iskeleti (slm, nbr, gnydn, mrb gibi SMS/chat kısaltmalarını yakalamak için)
  function skeleton(word) {
    if (!word || word.length <= 2) return word;
    const f = fold(word);
    let s = '';
    for (let i = 0; i < f.length; i++) {
      const ch = f[i];
      if (!VOWELS.has(ch) && /[a-z]/i.test(ch)) s += ch;
    }
    return s.length >= 2 ? s : word;
  }

  /* ---------- 2. Türkçe Morfolojik Kök Ayırıcı (Stemmer) ---------- */
  // Türkçe sondan eklemeli bir dildir. Ekleri sağdan sola güvenli bir şekilde soyar.
  // Kök boyutu 3 veya daha büyük kaldığı sürece ekleri temizler.
  const SUFFIX_PATTERNS = [
    // Fiil zaman ve kişi ekleri
    /(?:abil|ebil)(?:ir|irsin|irim|iriz|irsiniz|irler)?$/, // yapabilir, gelebilir
    /(?:iyor|ıyor|uyor|üyor)(?:sun|sum|lar|uz|dum|du|duk)?$/, // geliyor, yapıyorsun
    /(?:acak|ecek)(?:sin|sim|lar|yiz|tim|ti|tik)?$/, // yapacağım, gideceğiz
    /(?:alim|elim|ak|ek)$/, // buluşalım, gidelim
    /(?:mak|mek)$/, // mastar: buluşmak, gitmek
    /(?:dik|dık|duk|dük|tik|tık|tuk|tük)$/, // geldik, yaptık
    /(?:dim|dım|dum|düm|tim|tım|tum|tüm)$/, // geldim, gördüm
    /(?:di|dı|du|dü|ti|tı|tu|tü)$/, // geldi, yaptı
    /(?:mis|miş|mus|müş|misim|mişim|missin|mişsin)$/, // gitmiş, yapmışım
    /(?:yici|yıcı|ici|ıcı)$/,

    // İsim çoğul ekleri
    /(?:lar|ler)$/, // sınavlar -> sınav, vizeler -> vize

    // İsim çekim ve iyelik ekleri
    /(?:imiz|umuz|ümüz|ımız|iniz|ünüz|unuz|ınız)$/, // evimiz, dersimiz
    /(?:miz|muz|müz|mız|niz|nüz|nuz|nız)$/,
    /(?:si|sı|su|sü)$/, // kapısı
    /(?:im|ım|um|üm|in|ın|un|ün)$/, // sınavım -> sınav, ödevim -> ödev, adım -> ad

    // Hal ekleri (Ayrılma, bulunma, yönelme, belirtme, vasıta)
    /(?:den|dan|ten|tan)$/, // okuldan -> okul, sınavdan -> sınav
    /(?:de|da|te|ta)$/, // okulda, evde
    /(?:ye|ya|e|a)$/, // okula, eve
    /(?:yi|yı|yu|yü)$/, // sınavı, kahveyi
    /(?:le|la|yle|yla)$/, // arabayla, dostla

    // Sıfat & niteleme ekleri
    /(?:li|lı|lu|lü)$/, // İzmirli, şanslı
    /(?:siz|sız|suz|süz)$/, // neşesiz
    /(?:lik|lık|luk|lük)$/, // güzellik
    /(?:sin|sın|sun|sün|siniz|sınız|sunuz|sünüz)$/, // güzelsin -> güzel, tatlısın -> tatlı
    /(?:yim|yım|yum|yüm)$/ // iyiyim -> iyi, hastayım -> hasta
  ];

  function stem(word) {
    if (!word) return '';
    let w = fold(word).replace(/[^\p{L}]/gu, '');
    if (w.length <= 3) return w;

    let modified = true;
    let passes = 0;
    while (modified && passes < 3 && w.length > 3) {
      modified = false;
      passes++;
      for (const pat of SUFFIX_PATTERNS) {
        if (pat.test(w)) {
          const stripped = w.replace(pat, '');
          if (stripped.length >= 3) {
            w = stripped;
            modified = true;
            break;
          }
        }
      }
    }

    // Yumuşayan son harfi aslına çevir (kitab->kitap, çiçeğ->çiçek)
    if (w.endsWith('g')) w = w.slice(0, -1) + 'k';
    else if (w.endsWith('b') && w.length >= 4) w = w.slice(0, -1) + 'p';
    else if (w.endsWith('c') && w.length >= 4) w = w.slice(0, -1) + 'c';

    return w;
  }

  /* ---------- 3. Yazım Hatası Toleransı (Levenshtein & Benzerlik) ---------- */
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;

    const row = [];
    for (let j = 0; j <= b.length; j++) row[j] = j;

    for (let i = 1; i <= a.length; i++) {
      let prev = i;
      for (let j = 1; j <= b.length; j++) {
        let val;
        if (a[i - 1] === b[j - 1]) {
          val = row[j - 1];
        } else {
          val = Math.min(row[j - 1] + 1, prev + 1, row[j] + 1);
        }
        row[j - 1] = prev;
        prev = val;
      }
      row[b.length] = prev;
    }
    return row[b.length];
  }

  function similarity(a, b) {
    if (!a || !b) return 0;
    if (a === b) return 1;
    const maxLen = Math.max(a.length, b.length);
    if (maxLen === 0) return 1;
    const dist = levenshtein(a, b);
    return Math.max(0, 1 - dist / maxLen);
  }

  /* ---------- 4. Olumsuzluk Analizi (Negation) ---------- */
  const NEGATION_WORDS = new Set([
    'degil', 'deil', 'yok', 'hic', 'asla', 'istemem', 'istemiyorum',
    'sevmem', 'sevmiyorum', 'olmaz', 'hayir', 'yoo', 'yook'
  ]);

  function isNegated(text, targetWord = null) {
    const tokens = tokenize(text);
    if (!tokens.length) return false;

    // Cümlede genel olumsuzluk kelimesi var mı?
    const hasNegWord = tokens.some(t => NEGATION_WORDS.has(t));
    if (!targetWord) return hasNegWord;

    const targetFolded = fold(targetWord);
    const targetIdx = tokens.findIndex(t => t.includes(targetFolded) || targetFolded.includes(t));
    if (targetIdx === -1) return hasNegWord;

    // Hedef kelimenin hemen öncesinde veya sonrasında "değil / hiç / yok" var mı?
    for (let i = Math.max(0, targetIdx - 2); i <= Math.min(tokens.length - 1, targetIdx + 2); i++) {
      if (NEGATION_WORDS.has(tokens[i])) return true;
    }
    return false;
  }

  /* ---------- 5. Eşleşme Fonksiyonu (Fuzzy + Stem + Exact) ---------- */
  /*
   * Bir cümlenin veya kelimenin verilen kalıpla (pattern) ne kadar örtüştüğünü hesaplar.
   * Dönen: { hit: boolean, score: 0..1, type: 'exact'|'prefix'|'stem'|'skeleton'|'fuzzy'|null }
   */
  function matchPattern(textNorm, pat) {
    const { p, start } = pat; // p = temizlenmiş aranacak kök/ifade
    if (!p) return { hit: false, score: 0 };

    // A) Tam veya Başlangıç Cümle Eşleşmesi
    if (start) {
      if (textNorm === p) return { hit: true, score: 1.0, type: 'exact' };
      if (textNorm.startsWith(p + ' ')) return { hit: true, score: 0.95, type: 'prefix' };
      // Kök başlangıç kontrolü
      const pStem = stem(p);
      const textStem = stem(textNorm.split(' ')[0]);
      if (pStem && textStem && pStem === textStem) return { hit: true, score: 0.88, type: 'stem' };
      return { hit: false, score: 0 };
    }

    // B) Alt Dize / Tam Kelime Eşleşmesi (Exact substring)
    const paddedText = ' ' + textNorm + ' ';
    const paddedP = ' ' + p + ' ';
    if (paddedText.includes(paddedP)) {
      return { hit: true, score: 1.0, type: 'exact' };
    }
    if (textNorm.includes(p)) {
      return { hit: true, score: 0.92, type: 'substring' };
    }

    // C) Kelime Kelime Kontrol (Stemmer + Skeleton + Fuzzy)
    const textTokens = textNorm.split(' ').filter(Boolean);
    const pTokens = p.split(' ').filter(Boolean);

    // Eğer pattern tek bir kelimeyse
    if (pTokens.length === 1) {
      const pWord = pTokens[0];
      const pStem = stem(pWord);
      const pSkel = skeleton(pWord);

      let bestScore = 0;
      let bestType = null;

      for (const token of textTokens) {
        // 1. Kök eşleşmesi (Örn: "vizelerim" -> "vize", "buluşalım" -> "buluş")
        const tStem = stem(token);
        // kısa kökler gevşek eşleşmesin: "de" -> "defol", "geçtim" -> "geceler" (ikisi de "gec") olmasın
        const sameStem = pStem === tStem && (pStem.length >= 4 || token.startsWith(pWord.slice(0, 4)));
        const prefix = pStem.length >= 3 && token.startsWith(pStem) && (pStem.length >= 4 || token.startsWith(pWord.slice(0, 4)));
        if (pStem && tStem && (sameStem || prefix || (tStem.length >= 4 && pStem.startsWith(tStem)))) {
          if (0.85 > bestScore) { bestScore = 0.85; bestType = 'stem'; }
        }

        // 2. İskelet eşleşmesi (Örn: "slm" -> "selam", "gnydn" -> "günaydın", "nbr" -> "naber")
        const tSkel = skeleton(token);
        if (pSkel && tSkel && pSkel === tSkel && pSkel.length >= 2) {
          if (0.82 > bestScore) { bestScore = 0.82; bestType = 'skeleton'; }
        }

        // 3. Yazım hatası / Levenshtein benzerliği (Örn: "buluslım" -> "bulusalim"); ilk iki harf tutmalı ("okuyorum" -> "opuyorum" olmasın)
        if (token.length >= 4 && pWord.length >= 4 && token.slice(0, 2) === pWord.slice(0, 2)) {
          const sim = similarity(token, pWord);
          if (sim >= 0.75 && sim > bestScore) {
            bestScore = sim * 0.8;
            bestType = 'fuzzy';
          }
        }
      }

      if (bestScore >= 0.70) {
        return { hit: true, score: bestScore, type: bestType };
      }
    } else {
      // Çok kelimeli kalıp (Örn: "seni seviyorum", "iyi geceler", "ne yapiyorsun")
      // Tüm parçaların sırasıyla veya büyük oranda geçmesi
      let matchedCount = 0;
      for (const pw of pTokens) {
        const pwStem = stem(pw);
        const match = textTokens.some(tw => tw === pw || stem(tw) === pwStem || (tw.length >= 4 && similarity(tw, pw) >= 0.8));
        if (match) matchedCount++;
      }
      const ratio = matchedCount / pTokens.length;
      if (ratio >= 0.75) {
        return { hit: true, score: 0.85 * ratio, type: 'multi_word' };
      }
    }

    return { hit: false, score: 0 };
  }

  /* ---------- 6. Niyet Sınıflandırıcı (Classify Intent) ---------- */
  function classifyIntent(raw, compiledIntents, intentOrder = []) {
    const text = norm(raw);
    const lower = raw.toLocaleLowerCase('tr');

    // İsim söyleme tespiti (Örn: "adım Deniz", "bana Can de", "ben Mehmet")
    const nameM = lower.match(/(?:^|\s)(?:benim )?(?:adım|adim|ismim|bana)\s+([a-zçğıöşü]{2,15})(?:\s+de(?:\s|$)|\s|$)/);
    if (nameM && !['ne', 'mi', 'de', 'da'].includes(nameM[1])) {
      const cap = s => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
      return {
        intent: 'tell_name',
        name: cap(nameM[1]),
        text,
        greet: false,
        score: 1.0,
        word: nameM[0].trim(),
        matchType: 'regex'
      };
    }

    const isQ = /\?\s*$/.test(raw) || /(^|\s)(mi|mu|mı|mü)(sin|sun|yim|yum|yiz|yuz|siniz)?(\s|$)/.test(fold(raw));
    const negated = isNegated(text);

    let bestIntent = 'fallback';
    let bestScore = 0;
    let matchedWord = null;
    let matchType = null;

    // Niyetleri sırayla veya skor ağırlığıyla tara
    for (const { intent, pats } of compiledIntents) {
      for (const p of pats) {
        const res = matchPattern(text, p);
        if (res.hit) {
          // Olumsuzluk ayarı: Eğer kullanıcı "iyi değilim" dediyse 'answer_good' niyeti elensin/ters dönsün
          if (negated && (intent === 'answer_good' || intent === 'compliment')) {
            continue;
          }

          // Cümle içi öncelik skoru
          let finalScore = res.score;
          // Sıralama bonusu (Amor.INTENTS içindeki üst sıralar az da olsa önceliklidir)
          const orderIdx = intentOrder.indexOf(intent);
          if (orderIdx >= 0) {
            finalScore += (1 - orderIdx / (intentOrder.length || 1)) * 0.05;
          }

          if (finalScore > bestScore) {
            bestScore = finalScore;
            bestIntent = intent;
            matchedWord = p.w;
            matchType = res.type;
          }
        }
      }
    }

    // Olumsuzluk özel durumu: "kötü değilim" -> answer_good veya neutral
    if (negated && bestIntent === 'answer_bad' && text.includes('kotu')) {
      bestIntent = 'answer_good';
      bestScore = 0.75;
    }

    // Fallback durumunda soru ise 'question' yap
    if (bestIntent === 'fallback' && isQ) {
      bestIntent = 'question';
      bestScore = 0.65;
    }

    // Selam içeriyor mu kontrolü
    const greetDef = compiledIntents.find(x => x.intent === 'greet');
    let hasGreet = false;
    if (greetDef && bestIntent !== 'greet') {
      hasGreet = greetDef.pats.some(p => matchPattern(text, p).hit);
    }

    return {
      intent: bestIntent,
      score: Math.min(1.0, Math.round(bestScore * 100) / 100),
      word: matchedWord,
      matchType,
      text,
      greet: hasGreet,
      isQuestion: isQ,
      negated
    };
  }

  /* ---------- 7. Konu Sınıflandırıcı (Classify Topic) ---------- */
  function classifyTopic(raw, topicsCompiled, currentTopicId = null) {
    const text = norm(raw);
    let best = null;

    topicsCompiled.forEach(T => {
      const on = T.t.id === currentTopicId;
      let totalHits = 0;
      let topScore = 0;
      let topWord = '';

      T.pats.forEach(p => {
        if (!on && p.weak) return; // zayıf kelimeler sadece konu zaten açıksa sayılır
        const res = matchPattern(text, p);
        if (res.hit) {
          totalHits++;
          const score = res.score * 10 + p.p.length + (on ? 5 : 0);
          if (score > topScore) {
            topScore = score;
            topWord = p.w.replace(/^[\^~]/, '');
          }
        }
      });

      if (totalHits > 0) {
        const finalScore = totalHits * 10 + topScore;
        if (!best || finalScore > best.score) {
          best = {
            id: T.t.id,
            topic: T.t,
            word: topWord,
            score: finalScore,
            hits: totalHits
          };
        }
      }
    });

    return best;
  }

  /* ---------- 8. Ton ve Duygu Analizi (Tone & Sentiment) ---------- */
  function classifyTone(raw, tonesCompiled, isQ = false) {
    const text = norm(raw);
    const negated = isNegated(text);

    let badHits = 0;
    let goodHits = 0;

    tonesCompiled.bad.forEach(p => {
      if (matchPattern(text, p).hit) badHits++;
    });

    tonesCompiled.good.forEach(p => {
      if (matchPattern(text, p).hit) goodHits++;
    });

    // Olumsuzluk kelimeleri tonu tersine çevirebilir ("iyi değil" -> kötü haber)
    if (negated) {
      if (goodHits > 0 && badHits === 0) return 'bad';
      if (badHits > 0 && goodHits === 0) return 'good';
    }

    if (badHits > goodHits) return 'bad';
    if (goodHits > badHits) return 'good';
    if (isQ) return 'ask';
    return 'any';
  }

  // Dinamik duygu skoru (-1.0 çok negatif, +1.0 çok pozitif)
  function sentiment(raw) {
    const text = norm(raw);
    const tokens = tokenize(text);
    if (!tokens.length) return 0;

    const POSITIVE_SEEDS = new Set([
      'guzel', 'harika', 'super', 'mukemmel', 'muhtesem', 'iyi', 'mutlu', 'tatli',
      'seviyorum', 'bayildim', 'sevindim', 'askim', 'canim', 'opuyorum', 'saril', 'bomba'
    ]);
    const NEGATIVE_SEEDS = new Set([
      'kotu', 'berbat', 'uzgun', 'rezalet', 'nefret', 'kirildim', 'agladim', 'sikildim',
      'yorgun', 'aptal', 'salak', 'defol', 'ezik', 'moralsiz', 'mahvoldum'
    ]);

    let score = 0;
    const negated = isNegated(text);

    tokens.forEach(t => {
      const s = stem(t);
      if (POSITIVE_SEEDS.has(t) || POSITIVE_SEEDS.has(s)) score += 1;
      if (NEGATIVE_SEEDS.has(t) || NEGATIVE_SEEDS.has(s)) score -= 1.2;
    });

    if (negated) score = -score;
    return Math.max(-1, Math.min(1, score * 0.3));
  }

  /* ---------- Dışa Açılan Arayüz ---------- */
  return {
    fold,
    collapse,
    norm,
    tokenize,
    skeleton,
    stem,
    levenshtein,
    similarity,
    isNegated,
    matchPattern,
    classifyIntent,
    classifyTopic,
    classifyTone,
    sentiment
  };
})();
