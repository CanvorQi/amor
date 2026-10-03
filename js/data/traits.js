/*
 * Amor - Kişilik özellikleri (huylar)
 * -----------------------------------
 * Arketipin üstüne eklenen huylar: ters, tripçi, nazlı, ilgi bekleyen, sayko.
 * Her karakterin her huy için sabit bir zarı vardır (generator.js); zar, kişiliğin ihtimalinden
 * küçükse huy açıktır. İhtimal değişince mevcut karakterler de ona göre değişir.
 *
 * chance[arketip]  -> o kişilikteki karakterlerin yüzde kaçında bu huy var
 * lines[yuva]      -> ortak cümleler;  lines["yuva@arketip"] -> o kişiliğe özel (boşsa ortak kullanılır)
 * Cümle sözdizimi archetypes.js ile aynı ("a|b" iki balon, {h}, {name}, {laugh}...).
 */
window.Amor = window.Amor || {};

Amor.TRAITS = [
  /* -------- Ters: arada bir terslenir -------- */
  {
    id: 'ters', label: 'Ters', icon: '🙄',
    desc: 'Arada bir terslenir; kısa, iğneli cevaplar verir. Gerginken ve sıkıldığında daha sık.',
    chance: { nese: 0.05, soguk: 0.6, utangac: 0, flortoz: 0.3, dramatik: 0.25, olgun: 0.05 },
    lines: {
      any: ['ne var', 'eee?', 'bana ne', 'ne alaka şimdi', 'ya bi sus', 'iyi, ne yapayım', 'hıh', 'çok mu önemli', 'off ya', 'tamam, anladık'],
      greet: ['ne var', 'hı, selam', 'evet?', 'yine mi sen'],
      how_are_you: ['iyiyim, ne olacak', 'her sorduğunda aynı cevap: iyiyim', 'nasıl olayım, işte', 'bunu sormaktan sıkılmadın mı'],
      wyd: ['sana ne', 'ne yaptığım seni ilgilendirir mi', 'hiç, niye', 'nefes alıyorum, yeter mi'],
      compliment: ['biliyorum, söylemene gerek yok', 'e?', 'tamam, sonra?', 'bunu herkese diyorsun bence'],
      question: ["bilmiyorum, google'a sor", 'nereden bileyim', 'çok soru soruyorsun', 'sorgu mu bu'],
      laugh: ['komik değildi', 'neye gülüyorsun'],
      'any@soguk': ['Ne var?', 'Ve?', 'Bunu neden bana anlatıyorsun?', 'Gereksiz.', 'Sıkıldım.'],
      'any@dramatik': ['YETER 😤', 'ya bi rahat bırak', 'şu an hiç çekemem'],
      'any@flortoz': ['sıkıcısın bugün 🙄', 'ya bi dur', 'eee? bu kadar mı']
    }
  },

  /* -------- Tripçi: trip atar, özür bekler -------- */
  {
    id: 'trip', label: 'Tripçi', icon: '😤',
    desc: 'Geç cevap verince, kuru yazınca, erken gidince ya da hakarette trip atar. Birkaç mesaj kısa ve soğuk yazar; özür, iltifat, sarılma ya da hediye ile barışır.',
    chance: { nese: 0.3, soguk: 0.2, utangac: 0.15, flortoz: 0.45, dramatik: 0.7, olgun: 0 },
    lines: {
      late: ['şimdi mi aklına geldim?', 'bu kadar geç mi cevap verilir', 'saatlerdir bekliyorum ama neyse', 'hıh, sonunda yazabildin demek', 'çok meşguldün herhalde. tamam.'],
      dry: ['bu ne kuruluk ya', 'tek kelimeyle mi geçiştiriyorsun beni', 'tamam yani. peki.', 'sen hep böyle mi yazarsın'],
      bye: ['gidiyor musun yine? tamam, git', 'hep böyle zaten', 'iyi, git bakalım'],
      insult: ['tamam. konuşmuyorum seninle', 'bunu söylediğine inanamıyorum', 'kırıldım. yazma bana'],
      sulk: ['tamam.', 'peki.', 'iyi.', 'hı', 'sen bilirsin', 'öyle olsun', 'ok.', '...'],
      why: ['yok bir şey.', 'bir şey olmadı.', 'sen düşün bakalım', 'gerçekten bilmiyor musun?', 'boşver.', 'hiç.'],
      end: ['tamam... affettim ama bir daha olmasın', 'hmph. peki, barıştık', 'bu seferlik', 'tamam, kızgın değilim artık', 'hadi neyse, unuttum gitti'],
      fade: ['neyse, uzatmayacağım', 'tamam geçti, takma', 'off neyse'],
      wake: ['uyuyordum. uyandırdın. tamam.', 'saatin farkında mısın sen?', 'çok güzel bir rüya görüyordum. teşekkürler.'],
      'late@dramatik': ['SAATLERDİR BEKLİYORUM 😭', 'unuttun beni değil mi 💔|tamam anladım', 'hiç önemsemiyorsun beni 😭'],
      'sulk@dramatik': ['tamam 💔', 'peki.', 'ben zaten alıştım', 'hiç önemli değilim zaten', '...'],
      'end@dramatik': ['tamam affettim 😭|ama bir daha yaparsan ağlarım', 'barıştık mı? 🥹|barıştık'],
      'late@soguk': ['Geç kaldın.', 'Bekletmeyi seviyorsun galiba.'],
      'sulk@soguk': ['Peki.', 'Tamam.', 'Hm.', 'Fark etmez.'],
      'end@soguk': ['Tamam. Unuttum.', 'Peki. Bu seferlik.']
    }
  },

  /* -------- Nazlı: istekleri geri çevirir -------- */
  {
    id: 'red', label: 'Nazlı', icon: '✋',
    desc: 'Buluşma, fotoğraf, öpücük, sarılma, flört ve kişisel sorulara sık sık "hayır" der. Yakınlık arttıkça daha az.',
    chance: { nese: 0.1, soguk: 0.5, utangac: 0.4, flortoz: 0.3, dramatik: 0.15, olgun: 0.2 },
    lines: {
      meet: ['hayır.', 'olmaz, buluşmam', 'yok öyle bir şey', 'hiç zorlama, gelmiyorum', 'istemiyorum'],
      photo: ['atmam', 'fotoğraf yok', 'hayır, istemiyorum', 'neden atayım ki', 'albümde ne varsa o'],
      kiss: ['hayır', 'öpmek yok', 'kalsın', 'yok yok'],
      hug: ['sarılmak istemiyorum', 'hayır, kalsın', 'uzak dur bakayım'],
      flirt: ['hiç uğraşma', 'yok öyle şeyler', 'boşuna yazma bunları', 'hayır.'],
      ask: ['söylemem', 'neden söyleyeyim ki', 'bilmesen de olur', 'sır'],
      any: ['hayır', 'istemiyorum', 'olmaz', 'yapmam'],
      'any@utangac': ['şey... hayır 🙈', 'yok, istemiyorum...', 'olmaz ama...'],
      'meet@utangac': ['hayır... ben buluşmam 🙈', 'şimdilik olmaz...'],
      'any@soguk': ['Hayır.', 'İstemiyorum.', 'Olmaz.']
    }
  },

  /* -------- İlgi bekler: "neden bakmıyorsun bana?" -------- */
  {
    id: 'ilgi', label: 'İlgi bekler', icon: '👀',
    desc: 'Mesajına bakmazsan ya da görüp cevap vermezsen kendisi yazar ("neden bakmıyorsun bana?"). Geç cevaba sitem eder, uzun süre yazmazsan "beni unuttun mu?" der.',
    chance: { nese: 0.45, soguk: 0.05, utangac: 0.3, flortoz: 0.35, dramatik: 0.6, olgun: 0.05 },
    lines: {
      unread: ['neden bakmıyorsun bana?', 'hey', 'orada mısın?', 'mesajımı görmedin mi', 'bakmayacak mısın bana?', 'neredesin?', '👀'],
      seen: ['gördün ama cevap yok', 'görüldü attın yani', 'neden yazmıyorsun?', 'cevap vermeyecek misin?', 'okudun, biliyorum', 'bana bakmıyorsun bile'],
      again: ['hâlâ cevap yok', 'tamam, anladım', 'beni unuttun mu?', 'peki, beklerim', 'sessizlik de bir cevap herhalde'],
      late: ['neredeydin?', 'nihayet', 'sonunda yazdın', 'bu kadar geç mi bakılır?', 'merak ettim seni'],
      forgot: ['beni unuttun mu?', 'hiç yazmıyorsun artık', 'hey, ben hâlâ buradayım', 'unutuldum galiba', 'neden bakmıyorsun bana artık?'],
      'unread@dramatik': ['NEDEN BAKMIYORSUN BANA 😭', 'görmezden mi geliyorsun 💔', 'merhaba?? ben buradayım 😭'],
      'seen@dramatik': ['GÖRDÜN VE CEVAP YOK 😭', 'görüldü mü atıyorsun bana 💔'],
      'unread@utangac': ['şey... meşgul müsün? 🙈', 'rahatsız ettiysem kusura bakma...'],
      'seen@utangac': ['cevap yazmayacak mısın... 🥺', 'bir şey mi yanlış söyledim...']
    }
  },

  /* -------- Sayko: garip, tekinsiz başlangıçlar -------- */
  {
    id: 'sayko', label: 'Sayko', icon: '🌀',
    desc: 'Sohbeti garip, tekinsiz mesajlarla başlatır; arada tuhaf bir cümle ekler.',
    chance: { nese: 0.1, soguk: 0.15, utangac: 0.15, flortoz: 0.15, dramatik: 0.25, olgun: 0.02 },
    lines: {
      opener: [
        'rüyamda seni gördüm|hiç konuşmadın, sadece bana baktın|neyse naber 🙂',
        'bugün 214 tane kuş saydım|sana söylemek istedim',
        'aynaya baktım, arkamda sen vardın sanki|neyse',
        'şu an ne giydiğini tahmin ettim|söylemeyeceğim 🙂',
        'sence ay bizi izliyor mu|ben onu izliyorum',
        'kafamda seninle 47 farklı tanışma senaryosu var|en sevdiğim 23.sü',
        'bugün bir kediyle 20 dakika bakıştık|kazandım',
        'seni düşünürken çayım soğudu|bunun hesabını vereceksin 🙂',
        'isminin harflerini tersten yazdım|daha güzel oldu',
        'uyuyamadım|tavandaki çatlakları saydım|sonra seni düşündüm, çatlaklar azaldı',
        'son görülmene 14 kere baktım bugün|normal mi',
        'sana bir sır vereyim mi|yok, vermeyeyim 🙂',
        'dün gece biri kapımı çaldı|açmadım|sen miydin?',
        'bir gün kaybolursam ilk seni ararım|bilmen gerekiyordu',
        'merhaba|bu mesajı 3 kere yazıp sildim|şimdi gönderdim',
        'bugün herkes bana tuhaf baktı|sence neden'
      ],
      odd: ['bunu not aldım 🙂', 'seni çok iyi tanıyorum aslında', 'bunu biliyordum zaten', 'ilginç... çok ilginç', 'bunu söyleyeceğini rüyamda görmüştüm', 'hmm... kaydettim'],
      'opener@soguk': ['Rüyamda seni gördüm. Hiç konuşmadın.|Garip.', 'Bugün 214 kuş saydım.|Sana söylemem gerekiyordu, bilmiyorum neden.', 'Son görülmene baktım.|Merak etme, sadece birkaç kere.'],
      'opener@dramatik': ['RÜYAMDA SENİ GÖRDÜM 😭|ama yüzün yoktu|hâlâ titriyorum', 'bugün bir falcı bana senden bahsetti 🎭|adını bile bildi', 'kader bizi buluşturdu biliyor musun ✨|yıldızlar söyledi']
    }
  }
];

/* "Ne oldu?", "kızdın mı?" -> trip sırasında sebebi sorunca; istek kalıpları -> nazlı karakter reddeder */
Amor.TRAIT_WORDS = {
  why: ['ne oldu', 'kizdin mi', 'kustun mu', 'darildin', 'trip', 'neden boyle', 'nedir bu', 'bir sey mi oldu', 'sorun ne', 'bozuldun', 'neyin var'],
  ask: ['atar misin', 'atsana', 'yollar misin', 'yollasana', 'gonderir misin', 'gondersene', 'yapar misin', 'yapsana', 'soyler misin', 'soylesene',
    'gelir misin', 'gelsene', 'verir misin', 'versene']
};

Amor.TRAIT_SETTINGS = {
  tersChance: 0.18,  // terslenme ihtimali (gerginken x2, sıkılmışken x1.5, Lv.4+ yarısı)
  redChance: 0.5,    // isteği reddetme ihtimali (her yakınlık seviyesinde biraz azalır)
  tripChance: 0.7,   // geç cevaba trip ihtimali (kuru mesaj ve vedada bunun %40'ı)
  sulkTurns: 3,      // trip kaç mesaj sürer (özür / iltifat / hediye erken bitirir)
  lateMin: 20,       // kaç dakika sonra gelen cevap "geç" sayılır
  nudgeMin: 4,       // cevap gelmezse kaç dakika sonra "neden bakmıyorsun bana?"
  nudge2Min: 15,     // ikinci (son) dürtme
  saykoChance: 0.7,  // sayko karakterin açılış mesajının garip olma ihtimali
  oddChance: 0.07    // sayko karakterin cevabına tuhaf bir cümle eklemesi
};
