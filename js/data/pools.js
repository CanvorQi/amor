/*
 * Amor - Havuzlar
 * ---------------
 * Karakter oluşturucu kimlik bilgilerini buradan çeker.
 * İsimlerin "dönem"i yaş aralığını belirler:
 *   trend -> 18-25   modern -> 21-32   klasik -> 27-42   olgun -> 38-50
 */
window.Amor = window.Amor || {};

Amor.NAMES = {
  trend: [
    'Asya', 'Lina', 'Mira', 'Duru', 'Zümra', 'Eylül', 'Ada', 'Elisa', 'Nil', 'Lara', 'Ela', 'Masal', 'Öykü', 'Azra', 'Nisa',
    'Alya', 'Defne Su', 'Ayşe Nur', 'Asel', 'Eflin', 'İdil', 'Maya', 'Mina', 'Rüya', 'Su', 'Talya', 'Yaren', 'Beril', 'Dila',
    'Ekin', 'Mavi', 'Nisan', 'Elif Naz', 'Zeynep Su', 'Ecrin', 'Hira', 'Lavin', 'Melis Su',
    'Ahsen', 'Almila', 'Arya', 'Asude', 'Ayda', 'Bade', 'Belinay', 'Ceylin', 'Deren', 'Derin', 'Elanur', 'Elvin', 'Esila',
    'Eslem', 'Esmanur', 'Hiranur', 'İlkim', 'Lal', 'Lidya', 'Melisa', 'Meva', 'Miray', 'Naz', 'Nefes', 'Pera', 'Sahra',
    'Selen', 'Serra', 'Zeren', 'Yüsra', 'Asmin', 'Liya', 'Mihra', 'Rana'
  ],
  modern: [
    'Ece', 'Defne', 'Melis', 'Selin', 'İrem', 'Ceren', 'Damla', 'Ezgi', 'Cansu', 'Buse', 'Dilara', 'Simge', 'Gamze', 'Begüm',
    'İpek', 'Nehir', 'Ilgın', 'Tuana', 'Beren', 'Bengisu', 'Berfin', 'Cemre', 'Deniz', 'Elçin', 'Eda', 'Ezel', 'Hazal', 'Helin',
    'İlayda', 'Irmak', 'Melike', 'Nazlıcan', 'Sena', 'Sude', 'Şeyma', 'Tuğçe', 'Yağmur', 'Gizem', 'Sıla', 'Seray', 'Feza',
    'Aybüke', 'Ayça', 'Başak', 'Bensu', 'Beste', 'Cansel', 'Çağla', 'Ecem', 'Esin', 'Gökçe', 'Hilal', 'İlkay', 'Kardelen',
    'Lalin', 'Nihan', 'Öznur', 'Rabia', 'Sedef', 'Selenay', 'Sevde', 'Simay', 'Şevval', 'Yaprak', 'Bahar', 'Burçin', 'Ceyda',
    'Dicle', 'Esma', 'Gülce', 'Melda', 'Özüm', 'Zehra'
  ],
  klasik: [
    'Zeynep', 'Elif', 'Merve', 'Büşra', 'Esra', 'Kübra', 'Tuğba', 'Özge', 'Burcu', 'Ebru', 'Pınar', 'Seda', 'Derya', 'Aslı',
    'Gül', 'Sinem', 'Hande', 'Aylin', 'Ayşegül', 'Banu', 'Berna', 'Çiğdem', 'Dilek', 'Emine', 'Feride', 'Gonca', 'Gülşen',
    'Işıl', 'Leyla', 'Meltem', 'Nazlı', 'Neslihan', 'Nilay', 'Pelin', 'Sevda', 'Şule', 'Tülay', 'Yeliz', 'Zerrin', 'Özlem',
    'Buket', 'Didem', 'Duygu', 'Elvan', 'Funda', 'Gülcan', 'Gülden', 'Gülşah', 'Hatice', 'İlknur', 'Mine', 'Müge', 'Nihal',
    'Oya', 'Özden', 'Reyhan', 'Selda', 'Sevil', 'Şenay', 'Tuba', 'Yeşim', 'Zeliha', 'Aysun', 'Bilge', 'Emel', 'Ferda', 'Hale',
    'Nagehan', 'Nergis', 'Seçil', 'Sezen', 'Tijen'
  ],
  olgun: [
    'Ayten', 'Canan', 'Filiz', 'Gülay', 'Hülya', 'Nermin', 'Nur', 'Nurcan', 'Sevgi', 'Sevim', 'Serap', 'Songül', 'Yasemin',
    'Zuhal', 'Arzu', 'Belgin', 'Demet', 'Gülten', 'Handan', 'Melek', 'Nesrin', 'Selma', 'Tülin', 'Aynur', 'Birsen', 'Füsun',
    'Gülsüm', 'Lale', 'Nevin', 'Sibel', 'Şebnem', 'Ümran',
    'Aysel', 'Jale', 'Nalan', 'Saadet', 'Serpil', 'Yıldız', 'Fatma', 'Gönül', 'Kadriye', 'Leman', 'Meral', 'Necla', 'Nilgün',
    'Nurten', 'Perihan', 'Rezzan', 'Sema', 'Semra', 'Sevinç', 'Suna', 'Şükran', 'Türkan', 'Ülkü', 'Vildan', 'Gülseren',
    'Birgül', 'Feriha'
  ]
};

Amor.NAME_AGE = { trend: [18, 25], modern: [21, 32], klasik: [27, 42], olgun: [38, 50] };

// at: "<şehir>'deyim" hali (Türkçe ses uyumu elle yazıldı)
Amor.CITIES = [
  { name: 'İstanbul', at: "İstanbul'dayım", districts: ['Kadıköy', 'Beşiktaş', 'Cihangir', 'Bakırköy', 'Üsküdar', 'Moda', 'Nişantaşı', 'Bebek'], fav: 'Moda sahili' },
  { name: 'Ankara', at: "Ankara'dayım", districts: ['Çankaya', 'Bahçelievler', 'Ümitköy', 'Tunalı'], fav: 'Kuğulu Park' },
  { name: 'İzmir', at: "İzmir'deyim", districts: ['Alsancak', 'Karşıyaka', 'Bornova', 'Urla', 'Çeşme'], fav: 'Kordon' },
  { name: 'Antalya', at: "Antalya'dayım", districts: ['Konyaaltı', 'Lara', 'Muratpaşa', 'Kaleiçi'], fav: 'Konyaaltı sahili' },
  { name: 'Bursa', at: "Bursa'dayım", districts: ['Nilüfer', 'Osmangazi', 'Mudanya'], fav: 'Uludağ' },
  { name: 'Eskişehir', at: "Eskişehir'deyim", districts: ['Odunpazarı', 'Tepebaşı'], fav: 'Porsuk kenarı' },
  { name: 'Muğla', at: "Muğla'dayım", districts: ['Bodrum', 'Fethiye', 'Marmaris', 'Datça'], fav: 'Bodrum koyları' },
  { name: 'Trabzon', at: "Trabzon'dayım", districts: ['Ortahisar', 'Akçaabat'], fav: 'Uzungöl' },
  { name: 'Konya', at: "Konya'dayım", districts: ['Selçuklu', 'Meram'], fav: 'Meram bağları' },
  { name: 'Adana', at: "Adana'dayım", districts: ['Seyhan', 'Çukurova'], fav: 'Seyhan kıyısı' },
  { name: 'Mersin', at: "Mersin'deyim", districts: ['Yenişehir', 'Mezitli'], fav: 'Mersin sahili' },
  { name: 'Gaziantep', at: "Gaziantep'teyim", districts: ['Şahinbey', 'Şehitkamil'], fav: 'Bakırcılar Çarşısı' },
  { name: 'Kayseri', at: "Kayseri'deyim", districts: ['Melikgazi', 'Talas'], fav: 'Erciyes' },
  { name: 'Samsun', at: "Samsun'dayım", districts: ['Atakum', 'İlkadım'], fav: 'Atakum sahili' },
  { name: 'Denizli', at: "Denizli'deyim", districts: ['Merkezefendi', 'Pamukkale'], fav: 'Pamukkale travertenleri' },
  { name: 'Çanakkale', at: "Çanakkale'deyim", districts: ['Merkez', 'Ayvacık'], fav: 'Assos' },
  { name: 'Edirne', at: "Edirne'deyim", districts: ['Merkez', 'Keşan'], fav: 'Selimiye' },
  { name: 'Bolu', at: "Bolu'dayım", districts: ['Merkez', 'Mudurnu'], fav: 'Abant Gölü' },
  { name: 'Rize', at: "Rize'deyim", districts: ['Merkez', 'Çayeli'], fav: 'çay bahçeleri' },
  { name: 'Nevşehir', at: "Nevşehir'deyim", districts: ['Ürgüp', 'Göreme'], fav: 'Kapadokya' },
  { name: 'Aydın', at: "Aydın'dayım", districts: ['Kuşadası', 'Didim'], fav: 'Kuşadası koyları' },
  { name: 'Balıkesir', at: "Balıkesir'deyim", districts: ['Ayvalık', 'Edremit'], fav: 'Cunda' },
  { name: 'Hatay', at: "Hatay'dayım", districts: ['Antakya', 'İskenderun'], fav: 'Uzun Çarşı' },
  { name: 'Kocaeli', at: "Kocaeli'deyim", districts: ['İzmit', 'Gebze'], fav: 'Seka Park' }
];

/*
 * is:    "ne iş yapıyorsun" cevabı
 * doing: "ne yapıyorsun" cevabında kullanılır
 * arch:  bu mesleğe uygun kişilikler
 * student: öğrenci meslekleri (genç yaşlar)
 * min / max: bu mesleğin yapılabileceği yaş aralığı
 */
Amor.JOBS = [
  // öğrenciler
  { title: 'Psikoloji öğrencisi', is: 'psikoloji okuyorum', doing: ['ders çalışıyorum güya', 'vize çalışıyorum'], arch: ['nese', 'utangac', 'olgun'], student: true, max: 25 },
  { title: 'Edebiyat öğrencisi', is: 'edebiyat okuyorum', doing: ['kitap okuyorum', 'şiir yazmaya çalışıyorum'], arch: ['utangac', 'dramatik'], student: true, max: 25 },
  { title: 'Tıp öğrencisi', is: 'tıp okuyorum', doing: ['anatomi çalışıyorum', 'hastaneden yeni çıktım'], arch: ['soguk', 'utangac', 'nese'], student: true, max: 26 },
  { title: 'Konservatuvar öğrencisi', is: 'konservatuvarda okuyorum', doing: ['piyano çalışıyorum', 'provadan çıktım'], arch: ['utangac', 'dramatik'], student: true, max: 25 },
  { title: 'Hukuk öğrencisi', is: 'hukuk okuyorum', doing: ['anayasa çalışıyorum', 'kütüphanedeyim'], arch: ['soguk', 'olgun'], student: true, max: 25 },
  { title: 'İletişim öğrencisi', is: 'iletişim okuyorum', doing: ['kısa film projesiyle uğraşıyorum', 'sunum hazırlıyorum'], arch: ['nese', 'flortoz', 'dramatik'], student: true, max: 25 },
  { title: 'Mimarlık öğrencisi', is: 'mimarlık okuyorum', doing: ['maket yapıyorum', 'proje teslimine yetişmeye çalışıyorum'], arch: ['soguk', 'utangac'], student: true, max: 25 },

  // genç meslekler
  { title: 'DJ', is: "DJ'im", doing: ['set hazırlıyorum', 'yeni parça arıyorum'], arch: ['flortoz'], max: 38 },
  { title: 'Barista', is: 'baristayım', doing: ['kafede vardiyadayım', 'latte art çalışıyorum'], arch: ['nese', 'flortoz'], max: 35 },
  { title: 'Model', is: 'modelim', doing: ['çekimdeyim', 'çekim arasında mola veriyorum'], arch: ['flortoz', 'dramatik'], max: 35 },
  { title: 'İçerik üreticisi', is: 'içerik üreticisiyim', doing: ['video kurguluyorum', 'story çekiyorum'], arch: ['flortoz', 'dramatik', 'nese'], max: 40 },
  { title: 'Sosyal medya uzmanı', is: 'sosyal medya uzmanıyım', doing: ['kampanya hazırlıyorum', 'içerik takvimi yapıyorum'], arch: ['flortoz', 'nese'], max: 42 },
  { title: 'Kabin memuru', is: 'kabin memuruyum', doing: ['uçuştan yeni indim', 'otel odasında dinleniyorum'], arch: ['flortoz', 'olgun'], max: 42 },

  // her yaş
  { title: 'Mimar', is: 'mimarım', doing: ['çizim yapıyorum', 'maket yapıyorum'], arch: ['soguk', 'olgun'], min: 24 },
  { title: 'İç mimar', is: 'iç mimarım', doing: ['proje çiziyorum', 'şantiyedeyim'], arch: ['soguk', 'dramatik', 'olgun'], min: 24 },
  { title: 'Grafik tasarımcı', is: 'grafik tasarımcıyım', doing: ['logo çiziyorum', 'müşteri revizesiyle uğraşıyorum'], arch: ['soguk', 'nese'], min: 22 },
  { title: 'Tiyatro oyuncusu', is: 'tiyatro oyuncusuyum', doing: ['replik ezberliyorum', 'provadayım'], arch: ['dramatik'], min: 21 },
  { title: 'Psikolog', is: 'psikoloğum', doing: ['seanslarım bitti, dinleniyorum', 'vaka notlarımı yazıyorum'], arch: ['olgun'], min: 26 },
  { title: 'Yoga eğitmeni', is: 'yoga eğitmeniyim', doing: ['dersim yeni bitti', 'meditasyon yapıyordum'], arch: ['olgun', 'utangac'], min: 23 },
  { title: 'Pilates eğitmeni', is: 'pilates eğitmeniyim', doing: ['ders aralarındayım', 'reformer derslerim bitti'], arch: ['nese', 'olgun', 'flortoz'], min: 23 },
  { title: 'Hemşire', is: 'hemşireyim', doing: ['nöbetteyim', 'nöbetten yeni çıktım'], arch: ['nese', 'olgun'], min: 22 },
  { title: 'Doktor', is: 'doktorum', doing: ['hastanedeyim', 'nöbet sonrası dinleniyorum'], arch: ['olgun', 'soguk'], min: 27 },
  { title: 'Öğretmen', is: 'öğretmenim', doing: ['ödev okuyorum', 'yarınki derse hazırlanıyorum'], arch: ['olgun', 'nese'], min: 23 },
  { title: 'Akademisyen', is: 'üniversitede akademisyenim', doing: ['makale yazıyorum', 'sınav kağıdı okuyorum'], arch: ['soguk', 'olgun'], min: 29 },
  { title: 'Avukat', is: 'avukatım', doing: ['dosya okuyorum', 'duruşmadan yeni çıktım'], arch: ['soguk', 'olgun'], min: 25 },
  { title: 'Bankacı', is: 'bankacıyım', doing: ['şubedeyim', 'rapor hazırlıyorum'], arch: ['soguk', 'olgun'], min: 23 },
  { title: 'Eczacı', is: 'eczacıyım', doing: ['eczanedeyim', 'reçete hazırlıyorum'], arch: ['olgun', 'nese'], min: 25 },
  { title: 'Diyetisyen', is: 'diyetisyenim', doing: ['danışanlarımla görüşüyorum', 'beslenme planı yazıyorum'], arch: ['nese', 'olgun'], min: 23 },
  { title: 'Veteriner', is: 'veterinerim', doing: ['klinikteyim, bir kediye bakıyorum', 'aşı randevularım var'], arch: ['nese', 'utangac', 'olgun'], min: 25 },
  { title: 'Fotoğrafçı', is: 'fotoğrafçıyım', doing: ['fotoğraf düzenliyorum', 'çekime hazırlanıyorum'], arch: ['nese', 'soguk', 'utangac'], min: 20 },
  { title: 'Makyaj artisti', is: 'makyaj artistiyim', doing: ['gelin makyajı yapıyorum', 'çekimdeyim'], arch: ['flortoz', 'dramatik'], min: 20 },
  { title: 'Kuaför', is: 'kuaförüm', doing: ['salondayım, müşterim var', 'fön çekiyorum'], arch: ['nese', 'flortoz'], min: 20 },
  { title: 'Gazeteci', is: 'gazeteciyim', doing: ['haber yazıyorum', 'röportajdayım'], arch: ['soguk', 'dramatik'], min: 23 },
  { title: 'Çevirmen', is: 'çevirmenim', doing: ['çeviri yetiştiriyorum', 'roman çeviriyorum'], arch: ['utangac', 'soguk'], min: 23 },
  { title: 'Kütüphaneci', is: 'kütüphaneciyim', doing: ['kitap düzenliyorum', 'kütüphanedeyim'], arch: ['utangac'], min: 23 },
  { title: 'Seramik sanatçısı', is: 'seramik atölyem var', doing: ['atölyedeyim, çamura bulandım', 'fırını bekliyorum'], arch: ['utangac', 'dramatik', 'olgun'], min: 24 },
  { title: 'Butik sahibi', is: 'butik işletiyorum', doing: ['dükkandayım', 'yeni sezon ürünleri seçiyorum'], arch: ['flortoz', 'nese', 'dramatik'], min: 26 },
  { title: 'Emlak danışmanı', is: 'emlak danışmanıyım', doing: ['ev gösteriyorum', 'müşteri bekliyorum'], arch: ['flortoz', 'nese'], min: 24 },
  { title: 'Restoran sahibi', is: 'bir restoranım var', doing: ['mutfaktayım', 'servis yoğun'], arch: ['olgun', 'nese'], min: 30 }
];

Amor.ZODIACS = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];

// İsmin yanına bazen eklenen süs (örnek ekranlardaki gibi)
Amor.NAME_DECOS = [
  ['✨', '✨'], ['🌸', ''], ['👑', '👑'], ['🦋', ''], ['', '🍒'], ['🌙', ''], ['', '💋'], ['🌷', ''], ['💫', '💫'],
  ['🎀', ''], ['', '🌙'], ['🖤', ''], ['☁️', ''], ['', '🌸'], ['🍓', ''], ['💕', ''], ['', '🦢'], ['🌺', '🌺'],
  ['🌼', ''], ['', '🌷'], ['⭐', '⭐'], ['🍑', ''], ['', '✨'], ['🌹', ''], ['', '🖤'], ['🫧', ''], ['🐚', ''], ['', '🦋'],
  ['🌊', ''], ['🔥', ''], ['', '🍓'], ['🌻', ''], ['💎', '💎'], ['🕊️', ''], ['', '🎀'], ['🍒', ''], ['🌿', ''], ['', '💫'],
  ['🐰', ''], ['🧸', ''], ['🌈', ''], ['🍵', ''], ['🪐', ''], ['', '🫶'],
  // semboller
  ['♡', '♡'], ['⋆', '⋆'], ['☾', ''], ['ʚ', 'ɞ'], ['꒰', '꒱'], ['༄', ''], ['✿', ''], ['', '୨୧'], ['☆', ''], ['❀', '❀'],
  // isme bitişik (üçüncü eleman 1): 🍺Seda🍺, 👑Mine, elisa💜
  ['🍺', '🍺', 1], ['👑', '', 1], ['', '💜', 1], ['❤️‍🔥', '❤️‍🔥', 1], ['🐱', '🐱', 1], ['😈😈', '', 1], ['', '🍭', 1], ['ᯓ', '🍭', 1],
  ['', '👸', 1], ['🎲 ', '', 1], ['⍟🍂 ', ' ⍟🍂', 1], ['', ' 『✗』', 1], ['🦋', '🦋', 1], ['', '🥀', 1], ['🖤', '🖤', 1], ['', '😈', 1],
  ['🍒', '', 1], ['', '🫦', 1], ['✮', '✮', 1], ['', '🌙', 1], ['💋', '', 1], ['', '🐾', 1], ['ꨄ', '', 1], ['', '⚡', 1]
];

/* İsmin yazılışı (ekran adı): BÜYÜK, küçük, son harfi uzatma (SUDEE), parantez ((ZEHRA)), Azeri harfi (Nəzrinn).
 * Karakterin kaydında yoksa kimliğinden sabit olarak türetilir; böylece eski karakterler de çeşitlenir. */
Amor.NAME_STYLES = [
  ['', 52], ['upper', 13], ['lower', 11], ['stretch', 9], ['paren', 6], ['az', 3], ['nick', 6]
];
Amor.NAME_BRACKETS = [['((', '))'], ['『', '』'], ['【', '】'], ['〖', '〗'], ['(', ')']];

/* İsim yerine kullanılan takma adlar ({name}: gerçek isim, {low}: küçük harfle) */
Amor.NICKNAMES = [
  'KRALİÇE', 'Prenses', 'Alevvvlik', 'Tatlı Cadı', 'Bal Kız', 'Ay Kızı', 'Leydi', 'Sultan', 'Melek', 'Gece Kuşu',
  'kelebek', 'Pamuk', 'minnoş', 'Asi Kız', 'Fırtına', 'Kraliçe Arı', 'Papatya', 'Yıldız Tozu', 'cadı', 'Sihirli',
  '{low}kara', '{low}cım', '{low}nur', '{low}_', 'its{low}', '{low}.x', 'miss{low}', '{name} Hanım', 'Küçük {name}', '{name}ş'
];
