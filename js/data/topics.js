/*
 * Amor - Konular (mesajın NE HAKKINDA olduğu)
 * -------------------------------------------
 * Niyet mesajın türünü bulur (selam, iltifat, soru...), konu ise içeriğini:
 *   "dün maç berbattı"  -> futbol + kötü haber -> "üzülme, daha sezon uzun"
 *
 * words  : konuyu yakalayan kelimeler (niyetlerle aynı kurallar: kelimenin başı eşleşir, ^ = mesaj başında)
 *          ~kelime = zayıf kelime: konuyu kendisi açmaz, sadece konu zaten konuşuluyorsa sayılır
 *          ("kalem", "konu" tek başına okul demek değil ama ders konuşurken öyle)
 * tastes : karakterin sevdikleri / sevmediklerinde bu kelimeler geçerse konuya "bayılır" ya da "ilgisiz" kalır
 * lines  : good = iyi haber, bad = kötü haber, ask = kullanıcı soru soruyor, any = genel,
 *          love = karakter seviyorsa, meh = karakter sevmiyorsa (boşsa TOPIC_SHARED kullanılır),
 *          cont = konu birkaç mesajdır sürüyorsa ("bugün kafan hep derslerde galiba")
 *          {x} = mesajda yakalanan kelime (listede yazıldığı haliyle)
 * wordLines : bir kelimeye özel cevaplar; TOPIC_SETTINGS.wordChance ihtimalle ve aynı kelimeye üst üste değil
 *
 * Birden fazla konu eşleşirse en çok kelimesi tutan, eşitse en uzun kelimesi tutan kazanır; o an konuşulan konu +5 puan alır.
 * Konu, kelimesi geçmeyen TOPIC_SETTINGS.keep mesaj boyunca akılda kalır ("çok zordu ya" -> hâlâ sınav).
 * "oynuyorum, dinliyorum, okudum" gibi genel fiiller eklenmez: "futbol oynuyorum"u oyuna, "seni dinliyorum"u müziğe çeker.
 * diyalog-editoru.bat ile düzenlenebilir.
 */
window.Amor = window.Amor || {};

/* Mesajın tonu: önce kötü, sonra iyi kelimelere bakılır; ikisi de yoksa soru mu genel mi */
Amor.TOPIC_TONES = {
  bad: ['kötü', 'berbat', 'rezalet', 'felaket', 'iyi geçmedi', 'iyi değil', 'güzel değil', 'zor geçti', 'çok zor', 'kaybettik', 'kaybettim',
    'yenildik', 'kaldım', 'sinir', 'bozuldu', 'kırıldı', 'öldü', 'hasta', 'üzgün', 'üzüldüm', 'ağladım', 'moralim', 'mahvoldu', 'mahvettim',
    'olmadı', 'beceremedim', 'yoruldum', 'yorgun', 'bıktım', 'sıkıldım', 'nefret', 'kavga', 'tartıştık', 'kovuldum', 'iptal', 'rezil',
    'battı', 'boktan', 'saçma'],
  good: ['güzel', 'harika', 'süper', 'mükemmel', 'muhteşem', 'efsane', 'iyi geçti', 'çok iyi', 'kazandık', 'kazandım', 'geçtim', 'başardım',
    'mutlu', 'sevindim', 'bayıldım', 'eğlenceli', 'eğlendim', 'keyifli', 'şahane', 'yüksek aldım', 'tam not', 'terfi', 'zam aldım', 'iyiydi',
    'çok sevdim'],
  // Konuyu kapatır: bu kelimeler geçen ve konu kelimesi olmayan mesajdan sonra süren konu unutulur
  close: ['neyse', 'boşver', 'boş ver', 'geçelim', 'konuyu değiştir', 'başka konu', 'başka bir şey konuşalım', 'onu bırak', 'kapatalım']
};

/* Konu akışı ihtimalleri */
Amor.TOPIC_SETTINGS = {
  wordChance: 0.4,   // kelimeye özel cevap verme ihtimali
  contChance: 0.45,  // konu sürerken "devam" cümlesi kullanma ihtimali
  skipChance: 0.15,  // aynı konu sürerken ara sıra konuya hiç değinmeden normal cevap
  tasteChance: 0.65, // seviyor / sevmiyor tepkisi ihtimali
  keep: 2            // konu kelimesi geçmeyen kaç mesaj boyunca konu akılda kalır
};

/* Konuya özel "seviyor / sevmiyor" cümlesi yoksa */
Amor.TOPIC_SHARED = {
  love: ['aaa bayılırım buna!', 'dur bu benim en sevdiğim konulardan biri 😍', 'ayy ben de çok severim!', 'konu buraya gelince susmam haberin olsun {laugh}'],
  meh: ['açıkçası pek benim ilgi alanım değil {laugh}', 'hmm ben pek sevmem ama sen anlat', 'bilmem, bana göre değil gibi', 'pek anlamam ondan ama dinlerim']
};

Amor.TOPICS = [
  {
    id: 'okul', label: 'Okul / sınav',
    words: ['okul', 'ders', 'sınav', 'vize', 'final', 'quiz', 'ödev', 'hoca', 'üniversite', 'kampüs', 'lise', 'sınıf', 'dönem', 'bütünleme', 'not ortalama'],
    tastes: ['ders', 'okul'],
    lines: {
      good: ['helal olsun! kutlamamız lazım 🎉', 'bak ben demiştim yaparsın diye', 'gurur duydum seninle{h}'],
      bad: ['boşver, bir sonraki daha iyi geçer', 'ayy üzüldüm… hocalar da bazen acımasız', 'bir sınav seni tanımlamaz, kafana takma'],
      ask: ['ders deyince aklıma hep sınav stresi geliyor {laugh}', 'ben okul konusunda pek sabırlı değilim', 'en sevdiğim ders hep edebiyattı'],
      any: ['ders mi çalışıyorsun?', 'okul nasıl gidiyor bu ara?', 'kolay gelsin, okul yorucu iş']
    }
  },
  {
    id: 'is', label: 'İş',
    words: ['işteyim', 'işten', 'işe gid', 'işe geç', 'iş yeri', 'işyeri', 'mesai', 'patron', 'müdür', 'toplantı', 'maaş', 'vardiya', 'iş çok', 'iş yoğun', 'işler', 'şirket', 'ofis'],
    tastes: [],
    lines: {
      good: ['vay be, tebrikler! 👏', 'bunu kutlamak lazım', 'emeğinin karşılığını alıyorsun işte'],
      bad: ['iş yerinde moral bozmak çok kötü ya, üzülme', 'patronlar hep böyle mi oluyor acaba', 'bırak bugünü, akşam kendine iyi bak'],
      ask: ['işler yoğun ama şikayet etmeyeyim {laugh}', 'benim işler bugün sakindi', 'iş konusu açılınca konuşmayı bitiremem, dikkat et'],
      any: ['kolay gelsin 💪', 'iş nasıl, yoğun mu bugün?', 'mesai ne zaman bitiyor?']
    }
  },
  {
    id: 'yemek', label: 'Yemek',
    words: ['yemek', 'acıktım', 'aç kaldım', 'pizza', 'hamburger', 'kebap', 'mantı', 'lahmacun', 'döner', 'makarna', 'kahvaltı',
      'sushi', 'çorba', 'pilav', 'tatlı yedim'],
    tastes: ['yemek', 'tatlı', 'kahvaltı', 'pasta', 'çikolata'],
    lines: {
      good: ['ayy afiyet olsun, canım çekti şimdi', 'bu kadar güzel anlatma, acıktım {laugh}', 'afiyet olsun! ben de bir şeyler yesem iyi olacak'],
      bad: ['olsun, bir dahakine daha iyisini yeriz', 'aç aç durma ama, bir şeyler ye', 'kötü yemek günü mahveder valla'],
      ask: ['ben yemek konusunda seçici değilim, iyi bir makarnaya hayır demem', 'en sevdiğim şey ev yemeği bence', 'tatlıya zaafım var itiraf ediyorum 🙈'],
      any: ['afiyet olsun 😋', 'ne yedin, anlat?', 'şimdi canım çekti ya'],
      love: ['yemek konusu açıldıysa durmam, ben bayılırım 😋']
    }
  },
  {
    id: 'kahve', label: 'Kahve / çay',
    words: ['kahve', 'çay', 'latte', 'espresso', 'americano', 'starbucks', 'kafe', 'türk kahvesi'],
    tastes: ['kahve', 'çay', 'kafe'],
    lines: {
      good: ['kahve keyfi gibisi yok ☕', 'tam kahve havası ya', 'afiyet olsun, bir yudum da bana'],
      bad: ['kötü kahve günü mahveder, haklısın', 'olsun, bir dahakine güzel bir yere gideriz', 'kahvesi kötü olan kafeye bir daha gidilmez {laugh}'],
      ask: ['kahvesiz güne başlayamam ben ☕', 'çay mı kahve mi dersen… zor soru', 'ben günde en az iki fincan içiyorum'],
      any: ['ayy şimdi canım kahve çekti', 'afiyet olsun ☕', 'kahve mi çay mı, hangisi?'],
      love: ['kahve dediğin anda bende bir aydınlanma oluyor ☕', 'kahvesiz ben ben değilim']
    }
  },
  {
    id: 'uyku', label: 'Uyku',
    words: ['uyku', 'uykum', 'uyuyamad', 'uykusuz', 'uyandım', 'uyanık', 'kabus', 'erken kalk', 'geç kalk', 'şekerleme'],
    tastes: ['uyku', 'uyumak'],
    lines: {
      good: ['oh, iyi uyumak gibisi yok', 'dinlenmişsin bak, enerjin mesajlarından belli {laugh}', 'demek ki tatlı uykular işe yaramış'],
      bad: ['ayy uykusuzluk çok kötü, bu gece erken yat ama', 'kabus mu gördün? anlat, rahatlarsın', 'bir bitki çayı iç, belki iyi gelir'],
      ask: ['ben uykuya çok düşkünüm, alarmla aram kötü {laugh}', 'gece kuşuyum biraz, geç yatıyorum', 'hafta sonu öğlene kadar uyurum valla'],
      any: ['uykun mu var?', 'biraz dinlen istersen', 'gece çok mu geç yattın yine?']
    }
  },
  {
    id: 'hava', label: 'Hava durumu',
    words: ['hava', 'yağmur', 'kar yağ', 'karlı', 'güneş', 'sıcak', 'soğuk', 'bulut', 'fırtına', 'rüzgar', 'sonbahar', 'kış geldi', 'yaz geldi', 'bahar', 'ayaz'],
    tastes: ['yağmur', 'güneş', 'sonbahar', 'karlı', 'bulut', 'fırtına'],
    lines: {
      good: ['oh, güzel havada insanın içi açılıyor', 'tam yürüyüş havası ya', 'böyle havada evde durulmaz'],
      bad: ['kendine dikkat et, üşütme sakın', 'bu havada battaniye ve çay şart', 'hava kötü olunca benim de modum düşüyor'],
      ask: ['bizim burada da hava değişip duruyor', 'en sevdiğim mevsim sonbahar galiba 🍂', 'ben biraz serin havaları seviyorum'],
      any: ['orada hava nasıl?', 'burada da hava tuhaf bugün', 'şemsiyeyi unutma ama {laugh}'],
      love: ['ayy ben böyle havalara bayılırım', 'bu hava tam benlik 🌧️']
    }
  },
  {
    id: 'hastalik', label: 'Hastalık',
    words: ['hasta', 'grip', 'nezle', 'ateşim', 'başım ağrı', 'midem', 'boğazım', 'doktor', 'hastane', 'ilaç', 'öksür', 'covid', 'korona', 'üşüttüm',
      'ameliyat', 'iğne'],
    tastes: [],
    lines: {
      good: ['geçmiş olsun, iyileşmene çok sevindim 🌸', 'oh şükür, bir an endişelendim', 'kendine iyi bakmaya devam et ama'],
      bad: ['ayy geçmiş olsun 🥺 bol bol dinlen', 'sıcak bir çorba iç, bol su da', 'doktora gittin mi? kendini zorlama sakın'],
      ask: ['ben de geçen hafta biraz hastaydım, şimdi iyiyim', 'benim bağışıklık pek iyi değil, hemen üşütüyorum', 'şükür bu ara iyiyim'],
      any: ['geçmiş olsun 🥺', 'şimdi nasılsın, daha iyi misin?', 'kendine iyi bak lütfen']
    }
  },
  {
    id: 'muzik', label: 'Müzik',
    words: ['müzik', 'şarkı', 'konser', 'albüm', 'playlist', 'spotify', 'rock', 'pop', 'caz', 'jazz', 'hip hop', 'gitar',
      'piyano', 'klip', 'festival', 'Tarkan', 'Sezen Aksu'],
    tastes: ['müzik', 'şarkı', 'pop', 'caz', 'rock', 'konser', 'piyano', 'plak', 'vinil', 'karaoke'],
    lines: {
      good: ['ayy çok güzel, konser gibisi yok 🎶', 'şanslısın, keşke ben de olsaydım', 'bayıldım, bana da öner bunu'],
      bad: ['olsun, bir dahakine daha iyisi olur', 'müzik bile moral düzeltmiyorsa iş ciddi ya', 'kötü şarkıyı geçeriz, iyisini ben atarım sana {laugh}'],
      ask: ['ben her türden dinlerim ama moduma göre değişir', 'şu ara hep aynı şarkıyı dinleyip duruyorum {laugh}', 'müziksiz bir gün düşünemiyorum'],
      any: ['ne dinliyorsun, at bakalım 🎧', 'müzik zevkini merak ettim şimdi', 'bana da bir şarkı önersene'],
      love: ['müzik açıldıysa durmam haberin olsun 🎶', 'ayy müzik benim her şeyim']
    }
  },
  {
    id: 'film', label: 'Film / dizi',
    words: ['film', 'dizi', 'sinema', 'netflix', 'sezon', 'yeni bölüm', 'anime', 'belgesel', 'oyuncu', 'vizyon'],
    tastes: ['film', 'dizi', 'sinema', 'tiyatro', 'anime', 'belgesel', 'komedi'],
    lines: {
      good: ['ayy spoiler verme ama çok merak ettim şimdi', 'harika, listeye ekliyorum hemen', 'iyi film günü kurtarır valla 🍿'],
      bad: ['olsun, iki saatini geri istemek hakkın {laugh}', 'kötü final kadar sinir bozucu bir şey yok', 'bırak onu, sana daha güzelini önereyim'],
      ask: ['ben dizi maratonlarına bayılırım ama uykusuz kalıyorum', 'şu ara bir şey izlemiyorum, önerin var mı?', 'romantik komedilere zaafım var itiraf edeyim 🙈'],
      any: ['ne izliyorsun? 🍿', 'güzel mi bari?', 'izlerken bana da söyle, birlikte izlemiş gibi oluruz']
    }
  },
  {
    id: 'futbol', label: 'Futbol',
    words: ['maç', 'futbol', 'gol', 'derbi', 'lig', 'Galatasaray', 'Fenerbahçe', 'Beşiktaş', 'Trabzonspor', 'cimbom', 'fener', 'taraftar', 'stadyum',
      'şampiyon', 'penaltı', 'hakem', 'transfer'],
    tastes: ['futbol', 'maç'],
    lines: {
      good: ['kazandınız mı yoksa 🎉', 'helal olsun, bu akşam keyfin yerinde o zaman', 'gol sevinci gibisi yok derler'],
      bad: ['üzülme, daha sezon uzun', 'hakem yine mi {laugh}', 'bir maç bu, rövanşı var'],
      ask: ['futboldan pek anlamam ama derbi heyecanını severim', 'ben maçları sadece sonuç olarak takip ediyorum {laugh}', 'takım tutmuyorum desem kızar mısın? {laugh}'],
      any: ['{x} mı? hangi takımlısın bu arada', 'maç mı izliyorsun?', 'futbol konusunda tartışmayalım ama {laugh}']
    }
  },
  {
    id: 'oyun', label: 'Oyun',
    words: ['oyun', 'playstation', 'ps5', 'xbox', 'steam', 'valorant', 'minecraft', 'fifa', 'pubg', 'counter', 'league of legends', 'konsol'],
    tastes: ['oyun', 'playstation', 'konsol'],
    lines: {
      good: ['vay, kazandın mı? tebrikler 🎮', 'iyi oyun! bir gün bana da öğret', 'yeneni olsun {laugh}'],
      bad: ['takım arkadaşları mı sabote etti yine {laugh}', 'olsun, bir sonraki el senin', 'sinirlenince ara ver, kumandayı fırlatma ama'],
      ask: ['ben oyunlarda çok kötüyüm ama izlemeyi severim', 'telefonda ufak oyunlar oynarım arada', 'bir gün birlikte oynayalım, ama bana acı {laugh}'],
      any: ['ne oynuyorsun?', 'gece yarılarına kadar oynama ama {laugh}', 'eğlenceli mi bari?']
    }
  },
  {
    id: 'spor', label: 'Spor',
    words: ['spor', 'gym', 'antrenman', 'fitness', 'koşu', 'koştum', 'yoga', 'pilates', 'kardiyo', 'ağırlık', 'yüzme', 'yüzdüm', 'bisiklet', 'idman'],
    tastes: ['yoga', 'pilates', 'koşu', 'yüzme', 'spor', 'dans', 'yürüyüş'],
    lines: {
      good: ['vay disiplin! helal 💪', 'spordan sonraki o his çok güzel', 'bak bu motivasyon bana da lazım'],
      bad: ['kendini zorlama, kaslar da dinlenmeli', 'sakatlık mı var? dikkat et ama', 'olsun, yarın daha iyi gider'],
      ask: ['düzenli yapmaya çalışıyorum ama tembellik ağır basıyor {laugh}', 'yürüyüş benim sporum sayılır', 'yoga denedim, çok iyi geliyor'],
      any: ['spor mu yapıyorsun? helal', 'kolay gelsin 💪', 'ben de başlasam mı acaba']
    }
  },
  {
    id: 'alisveris', label: 'Alışveriş',
    words: ['alışveriş', 'mağaza', 'avm', 'indirim', 'sipariş', 'kargo', 'trendyol', 'kıyafet', 'elbise', 'ayakkabı', 'çanta', 'sepet', 'kombin'],
    tastes: ['alışveriş', 'ayakkabı', 'elbise', 'moda', 'ruj', 'çanta', 'topuklu'],
    lines: {
      good: ['ayy güle güle kullan 🛍️', 'fotosunu atsana, merak ettim', 'indirim avcısı mısın yoksa {laugh}'],
      bad: ['iade et gitsin, kafana takma', 'kargolar hep böyle ya, sinir bozucu', 'olsun, daha güzelini bulursun'],
      ask: ['ben alışverişe çıkınca kendimi kaybediyorum {laugh}', 'sepete atıp almamak benim hobim', 'online alışveriş beni mahvetti'],
      any: ['ne aldın? 👀', 'alışveriş terapisi mi', 'güle güle kullan']
    }
  },
  {
    id: 'tatil', label: 'Tatil / seyahat',
    words: ['tatil', 'deniz', 'plaj', 'otel', 'yazlık', 'kamp', 'bavul', 'valiz', 'uçak', 'seyahat', 'gezi', 'gezmeye', 'yurt dışı', 'havalimanı'],
    tastes: ['deniz', 'tatil', 'seyahat', 'gezi', 'kamp', 'sahil'],
    lines: {
      good: ['ayy kıskandım şimdi 😍', 'fotoğraf atmazsan küserim', 'tatil gibisi yok, tadını çıkar'],
      bad: ['tatilin bitmesi kadar kötüsü yok ya', 'olsun, bir sonraki daha güzel olur', 'planlar bozulunca çok sinir oluyor, anlıyorum'],
      ask: ['ben deniz kenarında bir hafta istiyorum sadece', 'en son ne zaman tatil yaptım hatırlamıyorum {laugh}', 'hayalimdeki tatil sakin bir sahil kasabası'],
      any: ['nereye gidiyorsun? 😍', 'tatil lafı bile iyi geldi', 'beni de valize koy {laugh}']
    }
  },
  {
    id: 'hayvan', label: 'Evcil hayvan',
    words: ['kedi', 'köpek', 'pati', 'kuşum', 'hamster', 'tavşan', 'mama', 'veteriner', 'yavru'],
    tastes: ['kedi', 'köpek', 'hayvan', 'pati'],
    lines: {
      good: ['ayy çok tatlı 🥺 foto lazım', 'patililer dünyanın en güzel şeyi', 'sevgimi ilet ona'],
      bad: ['ayy noldu ona? 😟', 'geçmiş olsun, umarım hemen iyileşir', 'çok üzüldüm… veterinere gittiniz mi?'],
      ask: ['ben hayvanlara bayılırım, sokakta her kediyi severim', 'evde bir kedim olsun çok istiyorum', 'köpekler mi kediler mi… ikisini de seçerim {laugh}'],
      any: ['ayy fotosunu atsana 🥺', 'adı ne?', 'patililer en tatlısı'],
      love: ['hayvan konusu açıldıysa eririm ben 🥺']
    }
  },
  {
    id: 'aile', label: 'Aile',
    words: ['annem', 'babam', 'kardeşim', 'ablam', 'abim', 'ailem', 'teyzem', 'dayım', 'amcam', 'halam', 'kuzenim', 'anneannem', 'babaannem', 'dedem', 'evdekiler'],
    tastes: [],
    lines: {
      good: ['ne güzel, aile sıcaklığı başka', 'selamımı söyle {laugh}', 'böyle anlar çok kıymetli'],
      bad: ['aile içi tartışmalar çok yorucu, anlıyorum', 'üzülme, zamanla düzelir', 'istersen anlat, dinliyorum'],
      ask: ['benimkiler biraz kalabalık ve gürültülü {laugh}', 'ailemle aram iyi, annem en yakın arkadaşım gibi', 'evin en küçüğüyüm, şımarık olduğumu söylüyorlar'],
      any: ['nasıllar, iyiler mi?', 'ailenle vakit geçirmek güzel', 'selam söyle {laugh}']
    }
  },
  {
    id: 'arkadas', label: 'Arkadaşlar',
    words: ['arkadaş', 'kanka', 'dostum', 'dostlar', 'kızlarla', 'çocuklarla', 'ekiple'],
    tastes: [],
    lines: {
      good: ['ne güzel, iyi eğlenmişsiniz', 'iyi arkadaş çok kıymetli', 'bir dahakine beni de çağırın {laugh}'],
      bad: ['arkadaş kırgınlığı en kötüsü, üzüldüm', 'konuşunca düzelir bence', 'istersen anlat, ben tarafsız dinlerim {laugh}'],
      ask: ['benim arkadaş çevrem küçük ama sağlam', 'kızlarla buluşunca saatler geçiyor', 'en yakın arkadaşım beni benden iyi tanır'],
      any: ['ne yaptınız?', 'arkadaşlarınla vakit geçirmen güzel', 'kimlerle?']
    }
  },
  {
    id: 'kitap', label: 'Kitap',
    words: ['kitap', 'roman', 'şiir', 'yazarı', 'kütüphane', 'kitapçı'],
    tastes: ['kitap', 'şiir', 'romanlar', 'roman okumak', 'kitapçı'], // "roman" tek başına "romantik"i de tutar
    lines: {
      good: ['ayy bana da öner, okumak istiyorum', 'iyi kitap gibisi yok 📚', 'bitince ne hissettin, anlat'],
      bad: ['olsun, her kitap herkese göre değil', 'yarım bırakmak da bir hak bence {laugh}', 'bırak onu, daha güzeline başla'],
      ask: ['yatmadan önce birkaç sayfa okumadan uyuyamam', 'şiire zaafım var', 'şu ara yarım bıraktığım üç kitap var {laugh}'],
      any: ['ne okuyorsun? 📚', 'güzel mi, önerir misin?', 'kitap okuyan insan bambaşka'],
      love: ['kitap konusu açıldıysa sabaha kadar konuşurum 📚']
    }
  }
];

/*
 * Konu akışı: zayıf kelimeler, "devam" cümleleri ve kelimeye özel cevaplar.
 * Okunması kolay olsun diye ayrı yazıldı, yüklenirken yukarıdaki konulara eklenir.
 */
(() => {
  const FLOW = {
    okul: {
      words: ['etüt', 'dershane', 'test çöz', 'soru çöz', '~kitap', '~kalem', '~defter', '~konu', '~soru', '~test', '~çalış', '~not'],
      cont: ['bugün kafan hep derslerde galiba {laugh}', 'okul gündemimiz bitmiyor ama dinlemeye devam 📚', 'sen bu ara okulla epey uğraşıyorsun',
        'tamam artık senin ders programını ezbere biliyorum {laugh}'],
      wordLines: {
        sınav: ['ne zaman sınavın?', 'sınav haftası mı başladı yoksa 😬'],
        ödev: ['ödev mi? teslim ne zaman?', 'ödevleri son geceye bırakanlardan mısın {laugh}'],
        hoca: ['hoca mı sinir etti yine {laugh}', 'hocalarla aran nasıl?'],
        final: ['finaller korkunç ya, kolay gelsin'],
        kitap: ['hangi dersin kitabı?', 'o kitapları kim yazıyor ya, hep çok kalın {laugh}'],
        kalem: ['kalem kutun hâlâ renkli kalemlerle dolu mu {laugh}', 'not tutarken kalem mi tablet mi?'],
        konu: ['hangi konu? anlat, belki ben de hatırlarım', 'zor bir konu mu?']
      }
    },
    is: {
      words: ['~proje', '~müşteri', '~rapor', '~mail', '~dosya'],
      cont: ['bugün iş seni bırakmıyor galiba', 'iş konusu açılınca sen de durmuyorsun {laugh}', 'mesai bitince bunları unut ama, söz mü?'],
      wordLines: {
        patron: ['patronun nasıl biri?', 'patronlar… ayrı bir dünya {laugh}'],
        toplantı: ['toplantı mı? uzun sürdü mü?', 'o toplantı bir mail olabilirdi bence {laugh}'],
        maaş: ['maaş günü en güzel gün {laugh}']
      }
    },
    yemek: {
      words: ['~tarif', '~fırın', '~sos', '~lezzet', '~tatlı'],
      cont: ['bugün hep yemekten konuşuyoruz, acıktım valla {laugh}', 'sen yemeğe benim kadar düşkünsün galiba', 'bu konuşmadan sonra bir şeyler yemezsem olmaz'],
      wordLines: {
        pizza: ['pizza her zaman doğru cevap 🍕', 'ananaslı pizza: evet mi hayır mı?'],
        kahvaltı: ['kahvaltı günün en güzel öğünü ya', 'serpme kahvaltı mı, hızlı bir şeyler mi?'],
        mantı: ['mantı mı? bol yoğurtlu olsun lütfen 🤤'],
        döner: ['döner dürüm mü, porsiyon mu?']
      }
    },
    kahve: {
      words: ['~fincan', '~köpük', '~demle', '~sütlü', '~şekerli'],
      cont: ['kahve muhabbeti uzadıkça benim de canım çekiyor ☕', 'bugün kaçıncı kahve bu {laugh}', 'tamam artık bir kahve sözü alıyorum senden'],
      wordLines: {
        çay: ['çay demli mi olsun açık mı?', 'ince belli bardakta mı, kupada mı?'],
        latte: ['latte tatlı insanların kahvesi bence {laugh}'],
        'türk kahvesi': ['türk kahvesi içince fala bakıyor musun {laugh}']
      }
    },
    uyku: {
      words: ['~yatak', '~yastık', '~alarm', '~gece', '~sabah'],
      cont: ['uyku muhabbeti yaptıkça esneyesim geliyor {laugh}', 'bugün hep uykudan bahsediyorsun, git yat bence', 'senin uyku düzenin bayağı karışık galiba'],
      wordLines: {
        kabus: ['kabus mu? ne gördün?', 'kabustan sonra tekrar uyumak çok zor ya'],
        uykusuz: ['kaç saat uyudun ki?']
      }
    },
    hava: {
      words: ['~şemsiye', '~mont', '~üşüdüm', '~terledim', '~derece'],
      cont: ['bugün hava gündemimizden düşmüyor {laugh}', 'hava muhabbeti yapıyoruz, tam bizden {laugh}', 'tamam ikna oldum, hava gerçekten tuhaf'],
      wordLines: {
        yağmur: ['yağmur sesi dinlemeyi sever misin?', 'şemsiyesiz mi yakalandın yoksa {laugh}'],
        güneş: ['güneşli günler moralimi direkt yükseltiyor ☀️'],
        soğuk: ['sıkı giyin ama, üşütme'],
        sıcak: ['bu sıcakta dondurma şart 🍦']
      }
    },
    hastalik: {
      words: ['~ateş', '~ağrı', '~öksürük', '~iyileş', '~vitamin', '~muayene'],
      cont: ['hâlâ geçmedi mi? 🥺', 'bugün hep hastalıktan konuşuyoruz, kendine iyi bakıyorsun değil mi', 'iyileşene kadar bunu soracağım haberin olsun'],
      wordLines: {
        doktor: ['doktor ne dedi?', 'doktora gittin mi? içim rahat etsin'],
        grip: ['grip çok fena, bol ıhlamur iç'],
        ilaç: ['ilaçlarını saatinde al ama']
      }
    },
    muzik: {
      words: ['~dinle', '~ses', '~nota', '~melodi', '~sanatçı', '~grup'],
      cont: ['müzik konusunda anlaşıyoruz galiba 🎶', 'bu konuşmadan sonra bana bir playlist borçlusun', 'sen de müzikle yaşıyorsun anladığım kadarıyla'],
      wordLines: {
        konser: ['kimin konseri?', 'konserde en önde mi durursun arkada mı?'],
        gitar: ['gitar mı çalıyorsun? bir gün bana da çal'],
        Tarkan: ['Tarkan mı? efsane ya'],
        spotify: ['spotify listeni merak ettim, at bakalım']
      }
    },
    film: {
      words: ['~izle', '~sahne', '~karakter', '~final', '~seri', '~bölüm'],
      cont: ['film muhabbetimiz bitmiyor, bayıldım 🍿', 'sen bu ara epey dizi izliyorsun galiba', 'bana bir izleme listesi hazırlaman lazım artık'],
      wordLines: {
        dizi: ['hangi dizi?', 'dizi maratonu mu yapıyorsun'],
        sinema: ['sinemada en arkaya mı oturursun ortaya mı?', 'sinemaya en son ne zaman gittin?'],
        netflix: ["netflix'te ne var bu ara?"],
        anime: ['anime mi? en sevdiğin hangisi?']
      }
    },
    futbol: {
      words: ['~takım', '~skor', '~kaleci', '~forvet', '~teknik direktör', '~puan'],
      cont: ['bugün tam maç havasındasın {laugh}', 'futbol konusu açılınca sen de coşuyorsun', 'tamam artık takımının fikstürünü ben de biliyorum {laugh}'],
      wordLines: {
        derbi: ['derbi günleri ortalık karışıyor ya {laugh}'],
        hakem: ['hakemler hep suçlu zaten {laugh}'],
        transfer: ['transfer dedikodularına inanıyor musun?']
      }
    },
    oyun: {
      words: ['~level', '~bölüm', '~karakter', '~skin', '~rank', '~maç'],
      cont: ['oyun konusunda bayağı ciddisin anlaşılan {laugh}', 'bugün kafan hep oyunda galiba', 'bir gün bana da öğretmen lazım bunları'],
      wordLines: {
        minecraft: ['minecraft mı? ev mi yapıyorsun madende mi takılıyorsun {laugh}'],
        valorant: ['valorant mı? rankın ne?'],
        fifa: ["fifa'da hangi takımla oynuyorsun?"]
      }
    },
    spor: {
      words: ['~kas', '~kilo', '~set', '~protein', '~esneme'],
      cont: ['bugün spor motivasyonun tavan {laugh}', 'sen bu işi ciddiye alıyorsun, saygı duydum 💪', 'beni de spora başlatacaksın bu gidişle'],
      wordLines: {
        yoga: ['yoga mı? hangi pozu seviyorsun?'],
        koşu: ['kaç km koştun?', 'sabah mı koşarsın akşam mı?'],
        gym: ["gym'de en sevdiğin hareket ne?"]
      }
    },
    alisveris: {
      words: ['~beden', '~renk', '~fiyat', '~iade', '~beğendim'],
      cont: ['alışveriş muhabbeti uzadıkça benim sepet doluyor {laugh}', 'bugün tam alışveriş modundasın', 'tamam, bir dahakine beraber gidiyoruz'],
      wordLines: {
        indirim: ['indirim mi? nerede, söyle hemen 👀'],
        kargo: ['kargo geldi mi? kutu açma anı en güzeli'],
        ayakkabı: ['ayakkabı asla fazla değildir {laugh}']
      }
    },
    tatil: {
      words: ['~bilet', '~rezervasyon', '~manzara', '~güneşlen'],
      cont: ['tatil konuşmak bile beni dinlendirdi {laugh}', 'sen kafayı tatile takmışsın, haklısın da', 'tamam planı yaptık, sadece gitmek kaldı {laugh}'],
      wordLines: {
        deniz: ['denize girer misin yoksa kenarda mı oturursun?'],
        kamp: ['kamp mı? çadırda uyumak bana göre değil galiba {laugh}'],
        uçak: ['uçakta cam kenarı mı koridor mu?']
      }
    },
    hayvan: {
      words: ['~tasma', '~mırla', '~havla', '~patisi', '~tüy'],
      cont: ['patili muhabbeti hiç bitmesin 🥺', 'sen tam bir hayvansever çıktın', 'artık fotoğraf görmeden bu konuyu kapatmam {laugh}'],
      wordLines: {
        kedi: ['kedi mi? adı ne?', 'kediler evin gerçek sahibi zaten {laugh}'],
        köpek: ['köpek mi? hangi cins?', 'köpekler dünyanın en sadık dostu'],
        veteriner: ['veteriner ne dedi?']
      }
    },
    aile: {
      words: ['~evde', '~bayram', '~akraba', '~ziyaret'],
      cont: ['ailenle aran iyi galiba, hep onlardan bahsediyorsun', 'bugün aile gündemi yoğun {laugh}', 'seni dinlerken ailen bana tanıdık gelmeye başladı'],
      wordLines: {
        annem: ['annenle aran nasıl?', 'anneler her şeyi bilir ya {laugh}'],
        kardeşim: ['kardeşin küçük mü büyük mü?', 'kardeş kavgası mı yoksa {laugh}'],
        dedem: ['dedeler en tatlısı 🥺']
      }
    },
    arkadas: {
      words: ['~buluştuk', '~takıldık', '~grup'],
      cont: ['arkadaş muhabbetin bitmiyor, sosyal kelebek misin {laugh}', 'arkadaşların seni çok seviyor gibi', 'bir gün o ekipten biriyle tanışmam lazım {laugh}'],
      wordLines: {
        kanka: ['kankan kim? anlat bakalım']
      }
    },
    kitap: {
      words: ['~sayfa', '~okuyorum', '~yazar', '~bölüm', '~karakter'],
      cont: ['kitap konuşmak çok iyi geldi 📚', 'sen tam bir kitap kurdusun', 'bu kitabı ben de okumalıyım galiba'],
      wordLines: {
        şiir: ['kimin şiiri?', 'bana da bir dize yazsana'],
        roman: ['romanın sonu iyi mi bitiyor?'],
        kütüphane: ['kütüphanede ders mi çalışıyorsun, kitap mı seçiyorsun?']
      }
    }
  };
  Amor.TOPICS.forEach(t => {
    const f = FLOW[t.id];
    if (!f) return;
    t.words = [...t.words, ...(f.words || [])];
    t.lines.cont = f.cont || [];
    t.wordLines = f.wordLines || {};
  });
})();
