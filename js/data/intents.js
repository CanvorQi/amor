/*
 * Amor - Niyet (intent) kalıpları ve ortak cümleler
 * --------------------------------------------------
 * Kullanıcının mesajı küçük harfe çevrilir, Türkçe karakterler sadeleştirilir
 * (ç->c, ş->s, ı->i ...) ve tekrar eden harfler tek harfe indirilir
 * ("selaaam" -> "selam"). Kalıplar da aynı şekilde sadeleştirilip aranır.
 *
 *   'kelime'   -> mesajdaki herhangi bir kelimenin başında geçerse eşleşir (ek alabilir)
 *   '^kelime'  -> sadece mesajın başında, tam kelime olarak
 *
 * Sıra önemlidir: üstteki niyet önce kontrol edilir.
 */
window.Amor = window.Amor || {};

Amor.INTENTS = [
  ['insult', ['aptal', 'salak', 'gerizekali', 'mal misin', 'siktir', 'amk', '^aq', 'orospu', 'kaltak', 'cirkinsin', 'igrenc', 'defol', 'ezik', 'sikicisin', 'sus lan', 'kapa ceneni']],
  ['night', ['iyi gece', 'yatiyorum', 'uyuyacam', 'uyuyacagim', 'uyumaya', 'tatli ruya', 'iyi uykular']],
  ['morning', ['gunaydin', 'gnydn', 'gunaydn']],
  ['bye', ['gorusuruz', 'gorusmek uzere', 'hosca kal', 'hoscakal', 'bay bay', 'kactim', 'gitmem lazim', 'gidiyorum', 'sonra konusuruz', 'sonra yazarim']],
  ['kiss', ['opuyorum', 'opucuk', 'opeyim', 'opmek', 'opebilir', 'operim', 'opucugum', 'muck', 'mucuk', 'mua', '😘', '💋']],
  ['hug', ['sariliyorum', 'sarilmak', 'sarilalim', 'sarilsam', 'saril', 'kucakla', 'kucak', '🤗']],
  ['flirt', ['seni seviyorum', 'seviyorum seni', 'askim', 'sevgilim', 'evlen', 'asik oldum', 'asigim', 'hoslaniyorum', 'bebegim', 'balim',
    'sevgili olalim', 'cikalim mi', 'kalbimi caldin', 'kalbim senin', 'benimsin', 'sevdim seni', 'seni cok begeniyorum']],
  ['miss', ['ozledim', 'ozlemisim', 'ozlettin', 'seni dusunuyordum', 'aklimdasin', 'aklimdan cikmiyorsun', 'ruyamda', 'aklima geldin']],
  ['ask_age', ['kac yasindasin', 'kac yasinda', 'yasin kac', 'kac yas']],
  ['ask_memory', ['beni hatirliyor', 'hatirliyor musun', 'hakkimda ne biliyorsun', 'benim hakkimda', 'adimi biliyor', 'adimi hatirliyor', 'ben kimim']],
  ['ask_name', ['adin ne', 'ismin ne', 'adini ogren', 'kimsin']],
  ['ask_city', ['nerelisin', 'nerdesin', 'neredesin', 'nerede yasiyorsun', 'nerde yasiyorsun', 'memleket', 'hangi sehir']],
  ['ask_job', ['ne is yapiyorsun', 'ne is yapiyon', 'meslegin', 'calisiyor musun', 'okuyor musun', 'ogrenci misin', 'isin ne', 'ne okuyorsun']],
  ['ask_hobby', ['hobi', 'ne seversin', 'neler seversin', 'ne yapmayi seversin', 'bos zaman', 'ilgi alan', 'nelerden hoslanirsin']],
  ['how_are_you', ['nasilsin', 'nasilsn', 'naber', 'nbr', 'ne haber', 'iyi misin', 'iyimisin', 'nasil gidiyor', 'keyifler']],
  ['wyd', ['ne yapiyorsun', 'ne yapiyosun', 'ne yapiyon', 'napiyorsun', 'napiyosun', 'napiyon', 'napion', 'napiyordun', 'napiyodun', 'napcan', 'neler yapiyorsun', 'ne yapiyordun']],
  ['meet', ['bulusalim', 'bulusak', 'goruselim', 'gorusek', 'bulusma', 'kahve icelim', 'disari cikalim', 'numara', 'insta', 'whatsapp', '^wp', 'snap', 'telefonun', 'adresin']],
  ['photo', ['foto', 'resim', 'resmini', 'selfie', 'goruntulu']],
  ['compliment', ['guzelsin', 'cok guzel', 'tatlisin', 'cok tatli', 'harikasin', 'gulusun', 'gozlerin', 'bomba', 'afet', 'cicisin', 'sirinsin',
    'muhtesemsin', 'mukemmelsin', 'sevimlisin', 'cekicisin', 'hossun', 'cok hos', 'prenses', 'melek', 'icimi isit', 'saclarin',
    'tarzini', 'enerjini seviyorum', 'cok zarifsin', 'bir tanesin', 'ozelsin', 'kralice', '😍']],
  ['answer_bad', ['kotuyum', 'kotu', 'moralim bozuk', 'uzgunum', 'sikildim', 'canim sikkin', 'berbat', 'yorgunum', 'mutsuz', 'pek iyi degil', 'idare eder']],
  ['sorry', ['ozur', 'pardon', 'kusura bakma', 'affet']],
  ['thanks', ['tesekkur', '^tsk', 'sagol', 'sag ol', 'eyvallah', '^eyv', 'mersi']],
  ['laugh', ['haha', 'ahah', 'jsjs', 'sjsj', 'ksks', 'sksk', 'asd', '^lol', '^xd', 'komiksin', 'kahkaha', '😂', '🤣']],
  ['greet', ['^selam', '^slm', '^merhaba', '^mrb', '^meraba', '^hey', '^sa', '^selamun', '^selamlar', '^hi', '^hello', '^alo', '^as']],
  ['answer_good', ['^iyiyim', '^iyi', '^super', '^harika', '^bomba', '^cok iyi', '^fena degil', '^iyidir', '^ben de iyi', '^iyim', '^mukemmel']],
  ['agree', ['^evet', '^tamam', '^olur', '^he', '^aynen', '^kesinlikle', '^tabi', '^tabii', '^okey', '^ok', '^tm']],
  ['disagree', ['^hayir', '^yok', '^istemiyorum', '^olmaz', '^asla', '^yo']]
];

/* Kullanıcı mesajının ruh haline etkisi (valence, arousal, social) ve yakınlık puanı */
Amor.INTENT_EFFECTS = {
  insult:     { valence: -0.3, arousal: 0.25, aff: -6 },
  compliment: { valence: 0.08, arousal: 0.03, aff: 2 },
  flirt:      { valence: 0.04, arousal: 0.05, aff: 1 },
  kiss:       { valence: 0.03, arousal: 0.06, aff: 1 },
  hug:        { valence: 0.05, arousal: 0.02, aff: 2 },
  miss:       { valence: 0.06, aff: 2 },
  laugh:      { valence: 0.04, arousal: 0.02, aff: 2 },
  thanks:     { valence: 0.03, aff: 1 },
  sorry:      { valence: 0.05, aff: 1 },
  answer_bad: { valence: -0.02 },
  how_are_you:{ valence: 0.02, aff: 1 }
};

/* Karakterin kendi cümlesi yoksa kullanılan ortak cümleler */
Amor.SHARED = {
  neg: ['hmm', 'tamam', 'peki', 'öyle'],
  sad: ['...', 'bilmiyorum', 'öyle işte'],
  low: ['mm', 'hı hı', 'uykum var'],
  leave: ['ben çıkıyorum, sonra konuşuruz'],
  back: ['şimdi gördüm mesajını', 'buradayım, kusura bakma', 'geldim'],
  back_sleep: ['günaydın, yeni uyandım', 'uyuyordum, şimdi gördüm', 'pardon uyumuşum'],
  // Zorla çevrimiçi yapılınca (uyurken / meşgulken / sosyal pili bitikken)
  forced_sleep: ['hı? uyuyordum ya 😴|neyse, buradayım', 'uyandırdın beni...|bir şey mi oldu?', 'gözlerim açılmıyor ama|söyle bakalım 🥱', 'saat kaç ya...|tamam tamam, uyandım'],
  forced_busy: ['elimdeki işi bıraktım, buradayım', 'kaçamak yaptım, söyle bakalım {laugh}', 'aslında işim var ama|senin için çıktım'],
  forced_tired: ['çok yorgunum ama senin için buradayım', 'pilim bitmişti...|ama tamam, konuşalım', 'biraz bitiğim ama yaz bakalım 🥱'],
  busy: ['şu an {busy}, sonra yazarım', '{busy}, kısa yazıyorum', '{busy} şu an, çıkınca yazarım'],
  repeat: ['bunu zaten söyledin {laugh}', 'aynı şeyi yazdın ama', 'deja vu yaşıyorum şu an'],
  bored: ['hmm', 'tamam', 'öyle mi', 'he', 'anladım', 'ok'],
  cause: ['aslında {cause} yüzünden biraz kafam karışık', 'şey… {cause}. neyse boş ver'],
  react_age: ['{x} mi, güzel yaş', '{x} ha, tamam'],
  react_city: ['{x} ha, hiç gitmedim oraya', '{x} güzel yermiş diyorlar'],
  react_name: ['memnun oldum {x}', '{x}, güzel isim']
};

/* Sohbet ekranındaki hazır cevap önerileri */
Amor.QUICK_REPLIES = [
  'Selam 👋', 'Nasılsın?', 'Ne yapıyorsun?', 'Gülüşün çok güzel', 'Kaç yaşındasın?', 'Nerelisin?', 'Hobilerin neler?',
  'Özledim seni', 'Hahaha çok komiksin', 'Kahve içelim mi?', 'İyi geceler 🌙', 'Günaydın ☀️', 'Seni düşünüyordum 💭',
  'Sarılmak istiyorum 🤗', 'Gülüşün içimi ısıtıyor', 'Rüyamda seni gördüm 🙈', 'Ne iş yapıyorsun?', 'Beni hatırlıyor musun?',
  'Gözlerin çok güzel', 'Öpüyorum 😘', 'Sesini merak ediyorum', 'Bugün nasıl geçti?'
];
