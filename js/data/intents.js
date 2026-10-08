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
  ['insult', ['aptal', 'salak', 'gerizekali', 'mal misin', 'siktir', 'amk', '^aq', 'orospu', 'kaltak', 'cirkinsin', 'igrenc', 'defol', 'ezik', 'sikicisin', 'sus lan', 'kapa ceneni', 'kes sesini', 'moron', 'yavsak', 'defol git', 'bıktım senden', 'nefret ediyorum']],
  ['night', ['iyi gece', 'yatiyorum', 'uyuyacam', 'uyuyacagim', 'uyumaya', 'tatli ruya', 'iyi uykular', 'ben kacar uyuyorum', 'uyu hadi', 'geceler', 'hadi iyi geceler', 'ben yatar', 'uykulu', 'uykum geldi']],
  ['morning', ['gunaydin', 'gnydn', 'gunaydn', 'gunaydinlar', 'aydinliklar', 'gunun guzel gecsin', 'uyandim', 'uyandim sonunda', 'mutlu sabahlar', 'guzel bir gun']],
  ['bye', ['gorusuruz', 'gorusmek uzere', 'hosca kal', 'hoscakal', 'bay bay', 'kactim', 'gitmem lazim', 'gidiyorum', 'sonra konusuruz', 'sonra yazarim', 'kendine iyi bak', 'ben kacayim', 'yazarim sana', 'optum bay', 'bye bye']],
  ['ask_call', ['arayabilir miyim', 'arayabilirmiyim', 'arayayim mi', 'arayim mi', 'arasam', 'ararsam', 'aramami', 'seni arayayim', 'beni ara', 'beni arar misin',
    'telefonda konusalim', 'telefonla konusalim', 'sesli konusalim', 'sesli arayayim', 'goruntulu konusalim', 'goruntulu arayayim', 'goruntulu arayabilir',
    'sesini duymak istiyorum', 'sesini duyabilir', 'aramak istiyorum', 'konusabilir miyiz telefonda', 'musait misin konusmaya', 'goruntuluye gecelim']],
  ['kiss', ['opuyorum', 'opucuk', 'opeyim', 'opmek', 'opebilir', 'operim', 'opucugum', 'muck', 'mucuk', 'mua', 'kocaman opuyorum', 'op beni', 'opucukler', 'dudagindan', 'yanagindan', '😘', '💋']],
  ['hug', ['sariliyorum', 'sarilmak', 'sarilalim', 'sarilsam', 'saril', 'kucakla', 'kucak', 'kocaman sarilalim', 'simsiki saril', 'sicacik sarilalim', 'saril bana', '🤗']],
  ['flirt', ['seni seviyorum', 'seviyorum seni', 'askim', 'sevgilim', 'evlen', 'asik oldum', 'asigim', 'hoslaniyorum', 'bebegim', 'balim',
    'sevgili olalim', 'cikalim mi', 'kalbimi caldin', 'kalbim senin', 'benimsin', 'sevdim seni', 'seni cok begeniyorum',
    'cok tatlisin ya', 'asigim sana', 'kalbimdesin', 'benim olur musun', 'hayatimin anlami', 'sensiz olmuyor', 'iyi ki varsin', 'canimsin', 'her seyimsin']],
  ['miss', ['ozledim', 'ozlemisim', 'ozlettin', 'seni dusunuyordum', 'aklimdasin', 'aklimdan cikmiyorsun', 'ruyamda', 'aklima geldin', 'cok ozledim', 'burnumda tutuyorsun', 'hasret kaldim', 'nerdesin sen ya', 'aklim hep sende']],
  ['ask_age', ['kac yasindasin', 'kac yasinda', 'yasin kac', 'kac yas', 'yas kac', 'kac yasindasin sen', 'dogum yilin kac', 'dogum gunun ne zaman']],
  ['ask_memory', ['beni hatirliyor', 'hatirliyor musun', 'hakkimda ne biliyorsun', 'benim hakkimda', 'adimi biliyor', 'adimi hatirliyor', 'ben kimim', 'beni unuttun mu', 'benim hakkimda ne biliyorsun', 'bizi hatirliyor musun']],
  ['ask_name', ['adin ne', 'ismin ne', 'adini ogren', 'kimsin', 'adiniz ne', 'ismin nedir', 'gercek adin', 'sana nasil sesleneyim']],
  ['ask_city', ['nerelisin', 'nerdesin', 'neredesin', 'nerede yasiyorsun', 'nerde yasiyorsun', 'memleket', 'hangi sehir', 'nerde oturuyorsun', 'nerede oturuyorsun', 'hangi sehirdensin', 'sehrin neresi']],
  ['ask_job', ['ne is yapiyorsun', 'ne is yapiyon', 'meslegin', 'calisiyor musun', 'okuyor musun', 'ogrenci misin', 'isin ne', 'ne okuyorsun', 'meslek ne', 'ne isle mesgulsun', 'ne isle ugrasiyorsun', 'calisiyor musun hala']],
  ['ask_hobby', ['hobi', 'ne seversin', 'neler seversin', 'ne yapmayi seversin', 'bos zaman', 'ilgi alan', 'nelerden hoslanirsin', 'nelerle ilgilenirsin', 'bos vaktinde', 'sevdigin seyler']],
  ['how_are_you', ['nasilsin', 'nasilsn', 'naber', 'nbr', 'ne haber', 'iyi misin', 'iyimisin', 'nasil gidiyor', 'keyifler', 'napan', 'nabion', 'keyfin nasil', 'halin hatirin', 'nasil gidiyo', 'iyi misin bakalim']],
  ['wyd', ['ne yapiyorsun', 'ne yapiyosun', 'ne yapiyon', 'napiyorsun', 'napiyosun', 'napiyon', 'napion', 'napiyordun', 'napiyodun', 'napcan', 'neler yapiyorsun', 'ne yapiyordun', 'mesgul musun', 'neyle ugrasiyorsun', 'ne yapiyon bakalim']],
  ['meet', ['bulusalim', 'bulusak', 'goruselim', 'gorusek', 'bulusma', 'kahve icelim', 'disari cikalim', 'numara', 'insta', 'whatsapp', '^wp', 'snap', 'telefonun', 'adresin', 'ne zaman gorusucez', 'ne zaman bulusalim', 'birlikte bir seyler yapalim', 'yemege cikalim mi', 'telefon numaran', 'instagramin']],
  ['photo', ['foto', 'resim', 'resmini', 'selfie', 'goruntulu', 'resim at', 'fotografini gonder', 'selfie at', 'boydan foto', 'yuzunu goreyim', 'fotograf']],
  ['compliment', ['guzelsin', 'cok guzel', 'tatlisin', 'cok tatli', 'harikasin', 'gulusun', 'gozlerin', 'bomba', 'afet', 'cicisin', 'sirinsin',
    'muhtesemsin', 'mukemmelsin', 'sevimlisin', 'cekicisin', 'hossun', 'cok hos', 'prenses', 'melek', 'icimi isit', 'saclarin',
    'tarzini', 'enerjini seviyorum', 'cok zarifsin', 'bir tanesin', 'ozelsin', 'kralice', 'cok zekisin', 'gözlerin parildiyor', 'cok havalisin', 'tarzin cok iyi', 'kusursuzsun', '😍']],
  ['answer_bad', ['kotuyum', 'kotu', 'moralim bozuk', 'uzgunum', 'sikildim', 'canim sikkin', 'berbat', 'yorgunum', 'mutsuz', 'pek iyi degil', 'idare eder', 'hic iyi degilim', 'berbatim', 'cok kotuyum', 'icim daraliyor', 'tatsizim', 'moralim sifir', 'canim cok sikkin', 'cok yoruldum']],
  ['sorry', ['ozur', 'pardon', 'kusura bakma', 'affet', 'cok ozur dilerim', 'kusuruma bakma', 'hata ettim', 'bagisla']],
  ['thanks', ['tesekkur', '^tsk', 'sagol', 'sag ol', 'eyvallah', '^eyv', 'mersi', 'cok tesekkurler', 'sagolasin', 'tesekkur ederim canim', 'minnettarim']],
  ['laugh', ['haha', 'ahah', 'jsjs', 'sjsj', 'ksks', 'sksk', 'asd', '^lol', '^xd', 'komiksin', 'kahkaha', 'puhaha', 'ahahah', 'kahkaha attim', 'cok guldum', 'koptum', '😂', '🤣']],
  ['greet', ['^selam', '^slm', '^merhaba', '^mrb', '^meraba', '^hey', '^sa', '^selamun', '^selamlar', '^hi', '^hello', '^alo', '^as', '^selamm', '^iyi gunler', '^heey']],
  ['answer_good', ['^iyiyim', '^iyi', '^super', '^harika', '^bomba', '^cok iyi', '^fena degil', '^iyidir', '^ben de iyi', '^iyim', '^mukemmel', '^iyiyim sukur', '^cok sukur', '^iyi gidiyor', '^harikayim', '^bomba gibiyim', '^keyfim yerinde']],
  ['agree', ['^evet', '^tamam', '^olur', '^he', '^aynen', '^kesinlikle', '^tabi', '^tabii', '^okey', '^ok', '^tm', '^tabi ki', '^bence de', '^kesinlikle katiliyorum', '^aynen oyle', '^katiliyorum']],
  ['disagree', ['^hayir', '^yok', '^istemiyorum', '^olmaz', '^asla', '^yo', '^hic sanmiyorum', '^katilmiyorum', '^asla olmaz', '^yok ya', '^hic istemiyorum']]
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
  neg: ['hmm', 'tamam', 'peki', 'öyle', 'anladım seni', 'demek öyle', 'peki bakalım', 'sen bilirsin tabii', 'ne bileyim, öyle olsun'],
  sad: ['...', 'bilmiyorum', 'öyle işte', 'içim biraz buruk', 'boş ver ya...', 'konuşmasak daha iyi gibi', 'canım bir şeye sıkkın da', 'bazen her şey üst üste gelir ya, öyle'],
  low: ['mm', 'hı hı', 'uykum var', 'kafam pek yerinde değil', 'enerjim sıfırlandı bugün', 'biraz dinlensem iyi olucak', 'gözlerim kapanıyor resmen'],
  leave: ['ben çıkıyorum, sonra konuşuruz', 'biraz işim çıktı hemen gelicem', 'şimdi çıkmam gerek, öptüm sonra yazarım', 'kısa bir ara veriyorum, bekle beni', 'kaçtım ben, görüşürüz sonra'],
  back: ['şimdi gördüm mesajını', 'buradayım, kusura bakma', 'geldim', 'işimi hallettim hemen geldim!', 'burdayım burdayım, beklettim mi?', 'telefon elimde değildi, geldim şimdi'],
  back_sleep: ['günaydın, yeni uyandım', 'uyuyordum, şimdi gördüm', 'pardon uyumuşum', 'uyuyakalmışım ya kusura bakma', 'tatlı bir uykudan yeni uyandım, buradayım!'],
  // Zorla çevrimiçi yapılınca (uyurken / meşgulken / sosyal pili bitikken)
  forced_sleep: ['hı? uyuyordum ya 😴|neyse, buradayım', 'uyandırdın beni...|bir şey mi oldu?', 'gözlerim açılmıyor ama|söyle bakalım 🥱', 'saat kaç ya...|tamam tamam, uyandım', 'rüyamın en tatlı yerindeydim {laugh}|ama senin için uyandım'],
  forced_busy: ['elimdeki işi bıraktım, buradayım', 'kaçamak yaptım, söyle bakalım {laugh}', 'aslında işim var ama|senin için çıktım', 'işleri biraz askıya aldım, seni dinliyorum'],
  forced_tired: ['çok yorgunum ama senin için buradayım', 'pilim bitmişti...|ama tamam, konuşalım', 'biraz bitiğim ama yaz bakalım 🥱', 'sosyal pilim sıfırdı ama sana her zaman vaktim var'],
  busy: ['şu an {busy}, sonra yazarım', '{busy}, kısa yazıyorum', '{busy} şu an, çıkınca yazarım', 'biraz {busy}, bitince uzun uzun konuşuruz tamam mı?', 'şimdi {busy}, aklım sende ama kaçmam lazım'],
  repeat: ['bunu zaten söyledin {laugh}', 'aynı şeyi yazdın ama', 'deja vu yaşıyorum şu an', 'iki kere dedin bunu farkında mısın? {laugh}', 'aynı cümleyi duydum sanki az önce'],
  bored: ['hmm', 'tamam', 'öyle mi', 'he', 'anladım', 'ok', 'peki madem', 'öyle diyorsan', 'hıı anladım'],
  cause: ['aslında {cause} yüzünden biraz kafam karışık', 'şey… {cause}. neyse boş ver', 'kafamı kurcalayan bir şey var: {cause}', 'bugün biraz {cause} durumu var, o yüzden dalgınım'],
  react_age: ['{x} mi, güzel yaş', '{x} ha, tamam', '{x} yaşındasın demek, tam en güzel dönemler', 'vaay {x}, çok iyiymiş', '{x} mi? Yaşıt sayılırız neredeyse'],
  react_city: ['{x} ha, hiç gitmedim oraya', '{x} güzel yermiş diyorlar', '{x} mi? Oranın havası çok güzeldir derler', '{x}\'da yaşamak nasıl bir his?', 'bir gün {x}\'ya gidersem bana rehberlik edersin artık'],
  react_name: ['memnun oldum {x}', '{x}, güzel isim', 'ismin çok hoşmuş {x}', '{x}... Bu ismi duyunca gülümsedim', 'artık sana adınla hitap edebilirim {x}']
};

/* Sohbet ekranındaki hazır cevap önerileri */
Amor.QUICK_REPLIES = [
  'Selam 👋', 'Nasılsın?', 'Ne yapıyorsun?', 'Gülüşün çok güzel', 'Kaç yaşındasın?', 'Nerelisin?', 'Hobilerin neler?',
  'Özledim seni', 'Hahaha çok komiksin', 'Kahve içelim mi?', 'İyi geceler 🌙', 'Günaydın ☀️', 'Seni düşünüyordum 💭',
  'Sarılmak istiyorum 🤗', 'Gülüşün içimi ısıtıyor', 'Rüyamda seni gördüm 🙈', 'Ne iş yapıyorsun?', 'Beni hatırlıyor musun?',
  'Gözlerin çok güzel', 'Öpüyorum 😘', 'Sesini merak ediyorum', 'Bugün nasıl geçti?', 'Günün nasıl gidiyor?', 'Sana bir şey sorabilir miyim?',
  'Bir şarkı önersene 🎶', 'En sevdiğin film hangisi?', 'Buluşalım mı bir gün? ☕', 'Çok tatlısın gerçekten', 'Moralim biraz bozuk...',
  'Bugün harika bir haber aldım 🎉', 'Şu an ne dinliyorsun?', 'Yemek yedin mi?', 'Hafta sonu ne yapıyorsun?', 'İyi ki varsın ✨'
];
