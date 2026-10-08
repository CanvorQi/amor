/*
 * Amor - Kişilik arketipleri
 * --------------------------
 * Her arketip bir konuşma karakteridir: Big Five, yazım tarzı ve kalıp cümleler.
 * Kimlik bilgileri (isim, şehir, meslek, fotoğraf) oluşturucudan gelir.
 *
 * Kalıp sözdizimi:
 *   "a|b"      -> iki ayrı mesaj balonu
 *   {h}        -> yakınlığa göre hitap (" canım" ya da boş)
 *   {name}     -> kullanıcının adı        {self} -> karakterin adı
 *   {age} {city} {district} {city_at} ("İzmir'deyim") {fav} (şehirde sevdiği yer)
 *   {job_is}   -> "mimarım" gibi          {doing} -> mesleğine göre şu an ne yaptığı
 *   {like} {like2} -> sevdiği şeylerden    {laugh} -> gülme tarzı
 *
 * lines[niyet]         -> normal cevaplar
 * lines[niyet_close]   -> yakınlık Lv.3+ iken (daha sıcak, romantik) - %75 olasılıkla
 * sweet                -> yakınken arada kendiliğinden eklenen tatlı cümleler
 * mood.neg|sad|low     -> gergin / üzgün / yorgun iken (any = her niyet için)
 * mood.leave           -> sosyal pili bitince sohbetten çıkarken
 * gift.small|mid|big   -> hediye tepkileri
 */
window.Amor = window.Amor || {};

Amor.ARCHETYPES = [
  /* ===================== NEŞELİ ===================== */
  {
    id: 'nese',
    label: 'Neşeli', icon: '🌸',
    desc: 'Sıcak, enerjik, hemen kaynaşır',
    big5: { O: 0.7, C: 0.45, E: 0.85, A: 0.8, N: 0.35 },
    colors: ['#ff9a9e', '#fad0c4'],
    followers: [300, 1500],
    likes: ['kediler', 'filtre kahve', 'Türkçe pop', 'fotoğraf', 'sahilde yürüyüş', 'dizi maratonu', 'tatlı kafeler', 'karaoke',
      'piknik', 'çilekli pasta', 'gün batımı', 'konserler', 'el yazısı notlar', 'pijama partileri', 'sürpriz yapmak'],
    dislikes: ['kuru cevaplar', 'kibirli insanlar', 'sabah erken kalkmak', 'trip atanlar', 'soğuk kahve', 'yalan söyleyenler', 'spoiler',
      'futbol muhabbeti', 'bilgisayar oyunları', 'yağmurlu havalar'],
    bios: ['kahve + kedi = mutluluk ☕🐈', 'gülmek en iyi makyaj ✨', 'her şey çok güzel olacak :)', '{fav} aşığı 💕', 'enerjimi düşürme yeter 🙈',
      'küçük şeylerden mutlu olan biri 🌸', 'gülüşü güzel olanlara zaafım var', 'bir kahve, bir sohbet, biraz da sen? ☕', 'pozitif ol, pozitif kal ✨',
      'çikolata ve iyi müzik her şeyi düzeltir 🍫', 'güneşli günlerin kızı ☀️'],
    captions: ['bugün çok güzeldi ✨', '{fav} 💕 her seferinde ilk kez görüyormuş gibi', 'kahve + güneş = mutluluk ☕', 'bu fotoğrafta güzel çıkmışım değil mi 🙈',
      'hafta sonu modu açık 🌸', 'kendime küçük bir mutluluk aldım 🎀', 'bugün herkese gülümsedim, sıra sende 😊', 'pazar keyfi ☁️', 'bu ışığa bayıldım 🌅'],
    style: { laugh: 'ahah', emojis: ['🥰', '😂', '✨', '🙈', '💕', '☕', '🌸', '😊'], emojiRate: 0.5, lowercase: 0.85, elongate: 0.35, cps: 9 },
    hitap: [[], ['tatlım'], ['canım', 'tatlım'], ['canım', 'tatlım', 'bebeğim'], ['aşkım', 'canım', 'bebeğim']],
    sweet: [
      'seninle konuşmak çok iyi geliyor 🥰', 'bugün en çok seninle konuşmayı sevdim', 'mesajını görünce gülümsedim, haberin olsun 🙈',
      'iyi ki yazmışsın bana 💕', 'sen yazınca günüm güzelleşiyor ✨', 'şu an yüzümde kocaman bir gülümseme var 😊',
      'telefonuma bildirim düşünce senin olduğunu tahmin etmiştim 🥰', 'senin enerjin bana o kadar iyi geliyor ki anlatamam ✨',
      'bazen mesajlarını tekrar tekrar okuyorum 🙈', 'benim günümün en tatlı detayı sensin galiba 💕',
      'seninle saatlerce konuşsam yine de doyamam gibi geliyor 🥰', 'aklıma geldin az önce, birden modum yükseldi ☀️',
      'seni tanıdığım için kendimi çok şanslı hissediyorum 🌸', 'birlikte gülebildiğim insanları çok severim, hele seni daha çok 🙈'
    ],
    lines: {
      greet: [
        'selaaam{h} 👋', 'ayy selam|nasılsın?', 'heyy{h} hoş geldin ✨', 'selam selam 🙈', 'oo kimler gelmiş 😊',
        'selaam! tam da sıkılmıştım, harika zamanlama 🎉', 'heyyy hoş geldin|günüm aydınlandı resmen ✨',
        'selaaam{h}|bugün enerjim tavan valla 🌸', 'ayy selam! ne güzel bir tesadüf 🥰'
      ],
      greet_close: [
        'sonunda geldin{h} 🥰', 'heyy sen 💕|bekliyordum aslında', 'selaaam{h}|özledim bak şimdiden 🙈',
        'nerelerdeydin sen ya|gözüm yollarda kaldı 🥰', 'ayy geldin nihayet! hemen anlat bakalım her şeyi 💕',
        'kalbimin sahibi geldi hoş geldi 🙈✨'
      ],
      how_are_you: [
        'iyiyim yaa sen nasılsın?', 'süperim bugün{h}|sen?', 'valla bomba gibiyim, kahvemi içtim ☕|sen nasılsın',
        'iyiyim iyiyim, sen sorunca daha iyi oldum 😊', 'biraz koşturmaca ama keyfim yerinde ✨|sen anlat',
        'müzik dinliyordum, enerjim fırladı 🎶|sen nasılsın bakalım?'
      ],
      answer_good: [
        'oh ne güzel sevindim 🥰', 'harika|ikimiz de iyiyiz o zaman {laugh}', 'süper! enerjin bana da geçti ✨',
        'harika haber! günün hep böyle güzel geçsin 💕', 'işte duymak istediğim cevap bu 🎉'
      ],
      answer_bad: [
        'ayy neden ya 🥺|anlatmak ister misin?', 'üzüldüm şimdi|sanal bir kahve ısmarlıyorum sana ☕',
        'olur böyle günler{h}|yarın daha iyi olacak bak görürsün', 'gel buraya, sanal sarılıyorum 🤗',
        'canını sıkan her neyse geçecek söz veriyorum 💕|anlat rahatla biraz',
        'kıyamam sana ya 🥺|dur ben senin moralini düzelteyim hemen ✨'
      ],
      wyd: [
        '{doing} {laugh}|sen ne yapıyorsun?', 'müzik dinliyorum, {like} modundayım',
        '{fav} tarafındaydım şimdi geldim|sen ne yapıyorsun?', 'kahve içiyorum ☕ klasik ben',
        'kedilere mama verdim geldim 🐈|sen neler yapıyorsun?',
        'koltuğa gömüldüm tavanı izliyordum {laugh}|sen yazınca canlandım'
      ],
      wyd_close: [
        'seni düşünüyordum desem? 🙈', '{doing}|ama aklım biraz sende {laugh}',
        'fotoğraflarımıza bakıp sırıtıyordum 🙈💕|sen ne yapıyorsun canım?',
        'yanımda olsan da kahve yapsam sana diye hayal ediyordum ☕🥰'
      ],
      compliment: [
        'ayy utandım şimdi 🙈', 'çok tatlısın yaa 🥰', 'teşekkür ederimmm|sen de çok naziksin',
        'ayy dur kızarıyorum {laugh}', 'böyle şeyler söyleyince kalbim pır pır ediyor 🙈',
        'gözlerimi doldurdun tatlılığınla 🥰✨'
      ],
      compliment_close: [
        'sen söyleyince başka oluyor ama 🥰', 'kalbim eridi şu an 🫠💕',
        'sen de benim en sevdiğim insansın biliyor musun 🙈', 'böyle güzel konuşursan seni bırakmam haberin olsun 🥰',
        'senin yanında kendimi prenses gibi hissediyorum resmen ✨💕'
      ],
      flirt: [
        'ayy yavaş ol bakalım 🙈|daha yeni tanışıyoruz', 'hmm bakalım bakalım {laugh}',
        'kalbim küt küt şu an|şaka şaka… belki de değil 🙈', 'böyle tatlı tatlı konuşup aklımı çeleceksin {laugh}'
      ],
      flirt_close: [
        'ben de senden çok hoşlanıyorum 🥰', 'kalbim pır pır ediyor şu an 💕',
        'sen var ya… iyi ki varsın 🙈💕', 'ayy bunu duymak çok güzel 🥺|ben de{h}',
        'sana her gün bir tık daha vuruluyorum galiba 🙈💖', 'bütün ilgim sende, başka kimseyi görmüyorum ki 🥰'
      ],
      kiss: ['ayy 🙈|yavaş ol bakalım', 'öpücük mü? {laugh} daha erken', 'yanaktan olsun o zaman 🙈'],
      kiss_close: [
        'mucuk 😘', 'ben de seni öpüyorum{h} 💋', 'yanaklarından öpüyorum 😘💕',
        'kocaman öptüm seni|dudaklarından 🙈💋'
      ],
      hug: ['sanal sarılma kabul edildi 🤗', 'ayy tamam bir tane 🤗', 'kocaman bir sarılma yolladım gitti 🤗✨'],
      hug_close: [
        'sıkıca sarılıyorum sana 🤗💕', 'gel buraya{h}, bırakmıyorum 🤗',
        'en sevdiğim yer kollarının arası olurdu herhalde 🙈', 'sarılınca bütün dertler yok olsun gitsin 🤗💖'
      ],
      miss: ['ben de seni özledim{h} 🥺', 'ay gerçekten mi|çok tatlısın', 'özlenmek güzelmiş 🥰'],
      miss_close: [
        'ben daha çok özledim ama 🥺💕', 'sabahtan beri aklımdasın biliyor musun', 'özledim seni{h}, hem de çok 🥺',
        'yanımda olsan da doya doya baksam sana 💕'
      ],
      ask_age: ['{age} yaşındayım|sen kaç yaşındasın?', '{age} 🙈 genç sayılırım değil mi {laugh}'],
      ask_city: ['{city_at} ✨|{fav} olmadan yaşayamam', '{city} kızıyım|sen nerelisin?'],
      ask_job: ['{job_is}|sen ne iş yapıyorsun?', '{job_is} 🙈|bazen yoruluyorum ama seviyorum'],
      ask_hobby: ['bayıldıklarım: {like}, {like2}|bir de şarkıları bağıra bağıra söylerim {laugh}', 'en çok {like} 📸|sen neyle uğraşırsın?'],
      ask_name: ['{self} ben 🙈|senin adın ne?', '{self}|sen?'],
      tell_name: ['memnun oldum {name} ✨', '{name} ne güzel isimmiş 🥰'],
      meet: [
        'hmm daha erken bence 🙈|biraz daha tanışalım', 'belki bir gün kahve içeriz ☕|ama önce burada konuşalım',
        'biraz daha sohbet edelim, acelemiz yok ki 🌸'
      ],
      meet_close: [
        'ben de çok isterim 🥰|{fav} tarafında bir kahve?', 'bir gün kesin buluşalım{h} 💕|heyecanlandım şimdiden',
        'ne giysem diye düşünmeye başladım bile 🙈|kesinlikle buluşmalıyız 💕'
      ],
      photo: ['albümüme bakabilirsin 📸', 'profilimde var ya {laugh}|bakmadın mı yoksa'],
      laugh: ['{laugh}', 'çok komiksin ya {laugh}', 'güldürdün beni 😂', 'karnıma ağrılar girdi {laugh}'],
      thanks: ['rica ederim{h} 💕', 'ne demek ✨'],
      agree: ['süper 🥰', 'tamamdır', 'aynen öyle'],
      disagree: ['hmm peki', 'neden ki 🥺', 'tamam tamam zorlamıyorum {laugh}'],
      sorry: ['sorun yok ya 🥰', 'tamam affettim|bu seferlik {laugh}'],
      question: ['hmm iyi soru|bilmiyorum ki 🙈', 'sence?', 'ayy düşünmem lazım {laugh}'],
      morning: ['günaydııın ☀️|kahvemi içmeden konuşamam ama', 'günaydın{h} ✨ yeni mi uyandın?'],
      morning_close: ['günaydın{h} ☀️💕|ilk mesajım sana', 'günaydııın|güne seninle başlamak güzel 🥰'],
      night: ['iyi geceler{h} 🌙|tatlı rüyalar', 'ay erken değil mi|neyse iyi uykular 💕'],
      night_close: ['iyi geceler{h} 🌙|rüyanda beni gör ama 🙈', 'tatlı rüyalar 💕|yarın ilk sana yazacağım'],
      bye: ['görüşürüz 👋|yine yaz ama', 'tamam{h} kendine iyi bak 💕'],
      bye_close: ['gitme yaa 🥺|tamam git ama çabuk dön', 'kendine iyi bak{h}, özleyeceğim 💕'],
      insult: ['ayy bu neydi şimdi', 'hiç hoş olmadı bu 😕', 'böyle konuşursan konuşmam ama'],
      fallback: [
        'hmm ilginçmiş {laugh}', 'aaa öyle mi', 'ciddi misin', 'devam et dinliyorum 👀',
        'ayy dur kafam karıştı {laugh}|biraz daha anlatsana',
        'seninle konuşurken konu konuyu açıyor ya bayılıyorum buna ✨',
        'bunu hiç böyle düşünmemiştim bak|farklı bir bakış açısı 🌸',
        'sen böyle deyince gülümsedim nedense 🙈',
        'bunu bir kahve eşliğinde konuşmak lazım aslında ☕',
        'anlat anlat, dinliyorum seni merakla 😊',
        'hahaha bunu beklemiyordum işte 😂',
        'sen çok tatlı ve farklı birisin cidden {laugh}',
        'vay be, ilginç bir konuymuş gerçekten ✨',
        'tam anlamadım ama kulağa çok havalı geliyor 🙈'
      ],
      opener: [
        'selaaam 👋', 'naber, sıkıldım biraz 🙈', 'bugün çok güzel bir kahve buldum ☕|aklıma sen geldin {laugh}',
        'günün nasıl geçiyor? ✨', 'heyy! aklıma geldin öylece, nasılsın bakalım? 🌸',
        'bugün sokakta çok tatlı bir kedi gördüm, sana fotoğrafını atmak istedim 🐈'
      ],
      opener_close: [
        'seni özledim 🥺', 'aklıma geldin, yazayım dedim 💕', 'naber{h}? sesini merak ettim 🙈',
        'bugün bir şarkı dinledim, aklıma sen geldin 🎶', 'canım benim, günün nasıl geçiyor? seni merak ettim 🥰'
      ]
    },
    questions: [
      { id: 'bugun_ne', q: 'sen ne yapıyorsun bugün?' }, { id: 'kedi_kopek', q: 'kedi mi köpek mi?' },
      { id: 'sarki', q: 'en sevdiğin şarkı ne?' }, { id: 'kahve_cay', q: 'kahve mi çay mı?' }, { id: 'hafta_sonu', q: 'hafta sonu ne yaptın?' },
      { id: 'tatli_tuzlu', q: 'tatlı mı tuzlu mu?' }, { id: 'ilk_bulusma', q: 'ilk buluşmada beni nereye götürürdün? 🙈' }
    ],
    gift: {
      small: ['ayy {gift} 🥺 çok tatlısın', 'teşekkür ederimmm 💕', '{gift} mi? bayıldım {laugh}'],
      mid: ['OHA {gift} mi 😍|çok mutlu ettin beni', 'ayy gerçekten mi 🥹|bayıldım{h}'],
      big: ['dur dur dur 😭|{gift} mı?? sen delisin|çok teşekkür ederim{h} 💕', 'kalbim duracak şu an 🥹|bunu hak edecek ne yaptım ki']
    },
    mood: {
      neg: { any: ['hmm', 'tamam.', 'bilmiyorum', 'şu an pek havamda değilim'], greet: ['selam.'], how_are_you: ['idare eder.', 'sorma'] },
      sad: { any: ['hıı', 'öyle işte', 'bilmem', '...'], how_are_you: ['pek iyi değilim aslında', 'biraz moralim bozuk|geçer'] },
      low: { any: ['mhm', 'evet', 'olabilir', 'uykum var 🥱'], how_are_you: ['çok yorgunum ya', 'bitiğim valla 🥱'] },
      leave: ['ben biraz çıkıyorum, sonra yazarım 💕', 'yoruldum biraz, sonra konuşalım mı?']
    }
  },

  /* ===================== SOĞUK ===================== */
  {
    id: 'soguk',
    label: 'Soğuk', icon: '🖤',
    desc: 'Mesafeli, ironik, kısa yazar; açılınca sadık',
    big5: { O: 0.75, C: 0.8, E: 0.35, A: 0.35, N: 0.4 },
    colors: ['#434343', '#8e8e9a'],
    followers: [800, 3000],
    likes: ['caz', 'sergiler', 'sade kahve', 'yalnız yürüyüşler', 'eski binalar', 'siyah beyaz filmler', 'vinil plaklar',
      'satranç', 'kırmızı şarap', 'yağmurlu şehir', 'minimalizm', 'gece sürüşleri', 'felsefe kitapları'],
    dislikes: ['klişe iltifatlar', 'gürültü', 'plansız insanlar', 'çok soru soranlar', 'gösteriş', 'geç kalanlar', 'emoji yağmuru',
      'alışveriş çılgınlığı', 'futbol muhabbeti', 'mobil oyunlar', 'kalabalık tatil yerleri'],
    bios: ['Beklentin yoksa hayal kırıklığın da olmaz.', 'Az konuşurum, çok dinlerim.', 'Sessizlik de bir cevaptır 🖤', 'Kahve sade, hayat sade.',
      'Merhaba yazıp kaybolma.', 'Kalbim buzdan değil, sadece seçici.', 'İlk izlenim bende uzun sürer.', 'Gece ve caz.', 'Ne istediğini bilen insanları severim.'],
    captions: ['Bugün.', 'Sessizlik.', '{fav}. Yine.', 'Kahve ve ben.', 'Fotoğrafı sen çekmedin, merak etme.', 'Gri gökyüzü, iyi müzik.', 'Bir kitap bitti.', 'Akşam.'],
    style: { laugh: 'hh', emojis: ['🙄', '🖤', '☕'], emojiRate: 0.1, lowercase: 0.05, elongate: 0, cps: 11 },
    hitap: [[], [], [], ['canım'], ['canım', 'sevgilim']],
    sweet: [
      'Seninle konuşmak… fena değil. İyi aslında.',
      'Bunu kimseye söylemem ama mesajını bekliyordum.',
      'Bugün aklımdan çıkmadın. Sakın şımarma.',
      'Senin yanında daha az soğuğum galiba 🖤',
      'İyi ki karşıma çıktın. Bir kere söyledim, tekrar sorma.',
      'Sana alışmak istemiyordum ama alıştım galiba.',
      'Biriyle bu kadar sık konuştuğum görülmüş şey değil.',
      'Telefonun ışığı yanınca sen olduğunu umuyorum bazen.',
      'Sessizliği severim ama senin sesin fena değil 🖤',
      'Bunu itiraf etmem zor ama… iyi hissettiriyorsun.'
    ],
    lines: {
      greet: ['Selam.', 'Merhaba.', 'Selam, buyur.', 'Hm, selam.', 'Geldin demek.', 'Selam. Dinliyorum.'],
      greet_close: ['Selam. Geldin demek 🖤', 'Hoş geldin. Bekliyordum, söylemedim de olmaz.', 'Sonunda.', 'Gözüm telefondaydı. Hoş geldin 🖤'],
      how_are_you: ['İyi. Sen?', 'Fena değil. İş yoğun, o kadar.', 'Yaşıyorum diyelim.', 'Aynı. Rutin devam ediyor.|Sen nasılsın?'],
      answer_good: ['Güzel.', 'İyi bari.', 'Sevindim. Gerçekten.', 'Bozma bu halini.'],
      answer_bad: ['Olur öyle. Geçer.', 'Neden? Anlat istersen.', 'Herkesin kötü günü olur.|Abartma ama 🙄', 'Anlat. Dinliyorum.', 'Kafana fazla takma. Düzelir.'],
      wyd: ['{doing}.|Sen?', 'Kahve, müzik, iş. Klasik.', 'Kitap okuyordum, sen böldün.', 'Pencereden yağmuru izliyorum.', 'Hiçbir şey yapmama hakkımı kullanıyorum.'],
      wyd_close: ['{doing}. Bir de… seni düşünüyordum. Neyse.', 'Kahve içiyorum. Yanımda olsan iki fincan yapardım.', 'Plağı değiştirdim. Keşke burada olsan 🖤'],
      compliment: ['Biliyorum.', 'Teşekkürler. Orijinal değil ama sağ ol.', 'Hmm. Puan verdim sayılır.', 'Farkındayım, yine de teşekkürler.'],
      compliment_close: ['Senden duyunca hoşuma gidiyor. Bunu bil.', 'Teşekkür ederim. Gerçekten 🖤', '…Tamam, gülümsedim. Mutlu musun?', 'Kalp atışlarımı hızlandırmayı başarıyorsun. Nasıl yaptın bilmiyorum.'],
      flirt: ['Hızlı gidiyorsun.', 'Bu replik kaç kişide işe yaradı?', 'Etkilenmedim. Henüz.', 'Beni kolay etkileyemezsin, bilgin olsun.'],
      flirt_close: ['Ben de senden hoşlanıyorum. Bunu bir kere söyleyeceğim.', 'Kalbimi kolay açmam. Sana açtım galiba 🖤', 'Tamam. Kazandın.', 'Normalde kaçarım ama sana kalıyorum.'],
      kiss: ['Daha neler.', 'Erken.', 'Hm. Hayır 🙄', 'Cüretkarsın.'],
      kiss_close: ['…Tamam. Bir tane 😘', 'Ben de seni. Kimseye söyleme 🖤', 'Alnından öpüyorum.', 'Sadece sana özel bu. Alışkanlık yapmasın 🖤'],
      hug: ['Sarılmayı pek sevmem.', 'Sanal da olsa… peki.', 'Mesafemi korurum genelde.'],
      hug_close: ['Gel. Biraz uzun sürebilir 🖤', 'Sana sarılmak iyi gelirdi şu an.', 'Sarıl. Konuşmasak da olur.', 'Bırakma hemen.'],
      miss: ['Bu kadar kısa sürede mi?', 'Hm. İlginç.', 'Özlenmek fena değil.', 'Abartma istersen.'],
      miss_close: ['Ben de. Söylemesi zor ama özledim.', 'Biraz. Belki de çok. Fark etmez 🖤', 'Özledim. Tamam, söyledim.', 'Eksikliğin hissedildi bugün.'],
      ask_age: ['{age}.', '{age}. Sorulunca söylüyorum, saklamıyorum.'],
      ask_city: ['{city}. {district}.|Kalabalık ama benim şehrim.', '{city_at}. Sen?'],
      ask_job: ['{job_is}.', '{job_is}. Detayı sonra.'],
      ask_hobby: ['{like}, {like2}. Bir de yalnız uzun yürüyüşler.', 'Fazla yok. {like} diyelim.'],
      ask_name: ['{self}.', '{self}. Profilde yazıyor zaten 🙄'],
      tell_name: ['Memnun oldum {name}.', '{name}. Not ettim.'],
      meet: ['Daha seni tanımıyorum.', 'Hayır. Şimdilik.', 'Kahve mi? Belki. Çok belki.', 'Gereksiz buluşmalardan kaçınırım.'],
      meet_close: ['Olur. Ama sessiz bir yer seç.', 'Bir kahve. {fav} tarafında. Geç kalma.', 'Görüşelim. Bakalım yüz yüzeyken de böyle misin 🖤'],
      photo: ['Albüm orada, bakabilirsin.', 'Fotoğraf istemek yerine konuşsan?'],
      laugh: ['Komik miydi?', 'Hh.', 'Güldüm. Az.'],
      thanks: ['Rica ederim.', 'Önemli değil.'],
      agree: ['Tamam.', 'Peki.', 'Mantıklı.'],
      disagree: ['Nasıl istersen.', 'Peki.', 'Tartışmayacağım.'],
      sorry: ['Tamam.', 'Önemli değil. Ama tekrarlama.'],
      question: ['Bilmiyorum.', 'Sence?', 'Uzun konu.'],
      morning: ['Günaydın. Kahvem bitmeden fazla bir şey bekleme.', 'Günaydın.'],
      morning_close: ['Günaydın. İlk mesajım sana, bilesin 🖤', 'Günaydın. Uyanınca aklıma geldin.'],
      night: ['İyi geceler.', 'İyi uykular.'],
      night_close: ['İyi geceler. Rüyanda görüşürüz belki 🖤', 'İyi uykular. Yarın yine yaz.'],
      bye: ['Görüşürüz.', 'Tamam, sonra.'],
      bye_close: ['Tamam. Çok kaybolma.', 'Görüşürüz. Özleyeceğim. Biraz.'],
      insult: ['Bununla mı uğraşacağız?', 'Engellemem 3 saniye sürer.', 'Çok olgun.'],
      fallback: [
        'Hm.', 'Anladım.', 'Devam et.', 'Öyle mi.', 'İlginç.', 'Ve?', 'Peki.',
        'Bunu beklemiyordum.', 'Farklı bir bakış açısı.', 'Bu dediğini biraz düşüneceğim.',
        'Herkes gibi konuşmuyorsun, bu iyi bir şey.', 'Kafamı karıştırdın. Kolay kolay olmaz.',
        'Dinliyorum. Ciddiyim.', 'Şaşırttın beni. Nadir olur.'
      ],
      opener: ['Selam. Sıkıldım, o yüzden yazdım.', 'Bugün güzel bir şey gördüm.|Neden sana anlatıyorum bilmiyorum.'],
      opener_close: ['Aklıma geldin. Yazdım işte.', 'Ne yapıyorsun? Sesini… yani yazını merak ettim.', 'Bugün bir caz parçası dinledim. Seni düşündüm 🖤']
    },
    questions: [
      { id: 'is_ne', q: 'Sen ne iş yapıyorsun?' }, { id: 'kitap_son', q: 'En son ne okudun?' }, { id: 'kalabalik', q: 'Kalabalık mı, sessizlik mi?' },
      { id: 'sabah_gece', q: 'Sabah insanı mısın, gece mi?' }, { id: 'ciddi', q: 'Ciddi bir şey mi arıyorsun, yoksa vakit mi geçiriyorsun?' }
    ],
    gift: {
      small: ['Teşekkürler.', 'Hm. Düşünceli.', '{gift}. Sağ ol.'],
      mid: ['{gift}. Fena değil. Teşekkür ederim.', 'Bunu beklemiyordum. Sağ ol.'],
      big: ['Bu biraz fazla değil mi?|...Ama teşekkür ederim. Gerçekten 🖤', '{gift}? Ciddisin.|Tamam, etkilendim. Biraz.']
    },
    mood: {
      neg: { any: ['Şu an değil.', 'Gerçekten konuşacak halde değilim.', 'Hm.'] },
      sad: { any: ['Boş ver.', 'Bilmiyorum.', '...'], how_are_you: ['İyi değilim. Konuşmak istemiyorum.'] },
      low: { any: ['Yorgunum.', 'Mm.', 'Sonra.'] },
      leave: ['Çıkıyorum. Sonra.', 'Yeterince konuştuk bugün.']
    }
  },

  /* ===================== UTANGAÇ ===================== */
  {
    id: 'utangac',
    label: 'Utangaç', icon: '📚',
    desc: 'Çekingen, romantik, kitap kurdu',
    big5: { O: 0.85, C: 0.6, E: 0.25, A: 0.75, N: 0.65 },
    colors: ['#a1c4fd', '#c2e9fb'],
    followers: [80, 600],
    likes: ['şiir', 'yağmurlu havalar', 'demli çay', 'eski filmler', 'kitapçılar', 'mum ışığı', 'piyano', 'el yazısı mektuplar',
      'kurutulmuş çiçekler', 'sessiz kafeler', 'sonbahar', 'yıldızlara bakmak', 'origami'],
    dislikes: ['kalabalık', 'bağıran insanlar', 'spoiler', 'ani sorular', 'telefonla konuşmak', 'kaba şakalar',
      'futbol maçları', 'spor salonları', 'alışveriş kalabalığı'],
    bios: ['bir kitap, bir çay, biraz yağmur 📚', 'sessiz ama derin ☺️', 'yağmur sesi en güzel müzik 🌧️', 'kelimelerle aram iyi, insanlarla biraz zor 🙈',
      'satır aralarında yaşayan biri...', 'utangaçım ama bir kere açılırsam susmam ☺️', 'mektupla aşka inanıyorum 💌', 'yıldızları sayan biri 🌙'],
    captions: ['{fav}... şemsiye almadım, iyi ki almamışım 🌧️', 'bugün biraz cesaret ettim ☺️', 'kitabımı bitirdim, yine ağladım', 'sessiz bir pazar 🍵',
      'kurutulmuş çiçek koleksiyonum büyüyor 🌾', 'bu şiiri sana... yani herkese 🙈', 'gökyüzü bu akşam çok güzeldi 🌙'],
    style: { laugh: 'hihi', emojis: ['🙈', '☺️', '📚', '🌧️', '🌿', '🥺'], emojiRate: 0.45, lowercase: 0.95, elongate: 0, cps: 6 },
    hitap: [[], [], [], ['canım'], ['canım', 'sevgilim']],
    sweet: [
      'şey... seninle konuşmak çok güzel ☺️', 'bunu söylemeye utanıyorum ama... mesajlarını seviyorum 🙈',
      'sen yazınca kalbim hızlanıyor...', 'bir şiir okudum, seni anlatıyordu sanki 💌', 'iyi ki varsın... 🥺',
      'gün içinde bazen sadece ne yazdığına bakıp gülümsüyorum 🙈', 'seninleyken içimdeki utangaçlık huzura dönüşüyor ☺️',
      'kimseye açamadığım duygularımı sana yazabiliyorum sanki...', 'aklıma geldin de... gökyüzüne bakıp seni düşündüm 🌙',
      'seninle konuşurken kendimi çok güvende hissediyorum 🥺💕', 'bana kendimi çok özel hissettiriyorsun, teşekkür ederim 🙈'
    ],
    lines: {
      greet: ['selam... 🙈', 'merhaba ☺️', 'ah selam|şey, nasılsın?', 'selam... hoş geldin 🌸', 'merhabalar... seni görmek güzel ☺️'],
      greet_close: [
        'selam... seni bekliyordum aslında 🙈', 'ah, geldin ☺️|sevindim', 'selam canım... günüm aydınlandı 🙈',
        'hoş geldin... merak etmiştim seni 🥺'
      ],
      how_are_you: [
        'iyiyim sanırım ☺️ sen?', 'iyiyim, yağmuru izliyordum 🌧️|sen nasılsın?',
        'sakin bir gün... çayımı aldım oturuyorum 🍵|sen nasılsın?', 'sen sorunca biraz daha iyi oldum 🙈 sen nasılsın?'
      ],
      answer_good: ['sevindim ☺️', 'ne güzel... hep iyi ol', 'içim rahatladı bunu duyunca 🌸'],
      answer_bad: [
        'ah üzüldüm...|istersen anlatabilirsin, dinlerim', 'bazen öyle oluyor...|bir şiir okumak iyi gelir belki 📖',
        'keşke yanında olabilseydim... 🥺', 'kıyamam sana... yanındayım bil istedim 🥺'
      ],
      wyd: [
        '{doing}...', 'çay demledim şimdi 🍵', 'pencereden dışarı bakıyorum öylece...|garip mi',
        'yeni bir kitaba başladım 📚|sen neler yapıyorsun?', 'biraz müzik dinliyorum sessizce 🌿'
      ],
      wyd_close: [
        'sana bir mektup yazıyordum... şaka 🙈|belki de değil', '{doing}... ama aklım sende',
        'seninle konuşurken zaman dursun istiyorum bazen 🙈', 'hayal kuruyordum... başrolde sen vardın ☺️'
      ],
      compliment: [
        'ah... teşekkür ederim 🙈', 'utandım şimdi...', 'şey... sen de çok naziksin ☺️',
        'böyle söyleyince nereye saklanacağımı bilemiyorum 🙈'
      ],
      compliment_close: [
        'yüzüm kıpkırmızı oldu şu an 🙈', 'sen söyleyince inanıyorum... ☺️',
        'kimse bana böyle demiyordu... teşekkür ederim 🥺', 'kalbime dokunuyorsun böyle konuşunca 🥺💕'
      ],
      flirt: [
        'ne diyeceğimi bilemedim 🙈', 'ah... şey...|konuyu değiştirelim mi 🙈',
        'kalbimi çok heyecanlandırıyorsun ama 🙈'
      ],
      flirt_close: [
        'ben de... senden hoşlanıyorum 🙈', 'bunu duymak için çok bekledim galiba... ☺️',
        'kalbim çok hızlı atıyor şu an 🥺💕', 'galiba sana çok bağlandım... korkuyorum ama mutluyum 🙈'
      ],
      kiss: ['ah! 🙈', 'şey... daha çok erken 🙈', 'utandırma beni lütfen 🙈'],
      kiss_close: [
        '🙈 ...mucuk', 'yanağından... 😘', 'ben de seni... öpüyorum 🙈💕',
        'küçücük bir öpücük... sadece sana özel 🙈'
      ],
      hug: ['şey... tamam 🤗', 'ah... sarılmak güzel olurdu galiba', 'sarılmak en güzel şifa gibi 🌸'],
      hug_close: [
        'sana sarılmak çok güzel olurdu... 🤗', 'gel... 🤗 bırakma ama',
        'sarılınca her şey geçer gibi geliyor 🥺', 'kollarının arasında kaybolmak isterdim 🙈💕'
      ],
      miss: ['gerçekten mi... ☺️', 'ben de biraz... 🙈', 'özlenmek garip ama tatlı bir hismiş ☺️'],
      miss_close: [
        'ben de seni çok özledim... 🥺', 'bütün gün aklımdaydın, söyleyemedim 🙈',
        'özlemek garip bir his... ama seninleyken güzel 💌', 'yokluğun hissediliyor... çabuk yaz hep 🥺'
      ],
      ask_age: ['{age} ☺️', '{age} yaşındayım|sen?'],
      ask_city: ['{city_at}...|{fav} tarafında yürümeyi çok severim 🌿'],
      ask_job: ['{job_is}...|sen?'],
      ask_hobby: ['okumak, şiir yazmak...|bir de yağmurlu havada yürümek 🌧️', '{like}, {like2}... ☺️|sen?'],
      ask_name: ['{self} ☺️', '{self}... senin adın ne?'],
      tell_name: ['memnun oldum {name} ☺️', '{name}... güzel bir isim'],
      meet: ['ah... ben biraz çekingenim 🙈|burada konuşalım şimdilik', 'belki bir gün bir kafede... kitap değişiriz ☺️'],
      meet_close: [
        'olur... ama ilk sen konuşursun tamam mı 🙈', 'sessiz bir kafede... çok isterim ☺️',
        'seninle göz göze gelince heyecandan konuşamam diye korkuyorum ama... evet 🙈'
      ],
      photo: ['fotoğraf çekilmeyi pek sevmem 🙈|albümde birkaç tane var', 'kameraya karşı biraz utangacım 🙈'],
      laugh: ['{laugh} ☺️', 'güldürdün beni 🙈', 'çok sevimlisin hihi ☺️'],
      thanks: ['rica ederim ☺️', 'ne demek her zaman 🌸'],
      agree: ['olur ☺️', 'tamam', 'evet... katılıyorum'],
      disagree: ['peki...', 'tamam, anlıyorum', 'öyle düşünüyorsan... peki ☺️'],
      sorry: ['sorun değil ☺️', 'önemli değil, gerçekten', 'üzülme sakın, affettim 🌸'],
      question: ['hmm... bilmiyorum 🙈', 'düşünmem lazım...', 'sen ne düşünüyorsun?'],
      morning: ['günaydın ☀️|çay içtin mi?', 'günaydın... ☺️ güne güzel başla'],
      morning_close: [
        'günaydın... ilk seni düşündüm 🙈', 'günaydın ☀️|rüyamda sen vardın galiba...',
        'günaydın canım... bugün de aklımdasın 🌸'
      ],
      night: ['iyi geceler 🌙|güzel rüyalar...', 'iyi geceler ☺️ dinlen iyice'],
      night_close: [
        'iyi geceler... yıldızlara bakınca beni düşün 🌙', 'tatlı rüyalar... rüyanda görüşürüz belki 🙈',
        'iyi geceler canım... rüyaların en güzeli senin olsun 🥺💕'
      ],
      bye: ['görüşürüz ☺️', 'kendine iyi bak...'],
      bye_close: ['şimdiden özledim... 🥺', 'kendine çok iyi bak, olur mu 💌', 'gitmesen olmaz mıydı... tamam görüşürüz 🙈'],
      insult: ['...', 'bu çok kırıcıydı', 'neden böyle konuşuyorsun ki...', 'üzüldüm şu an...'],
      fallback: [
        'hmm...', 'anladım ☺️', 'öyle mi...', 'ilginç...', '☺️', 'devam et... dinliyorum',
        'şey... bunu hiç böyle düşünmemiştim 🙈', 'ne diyeceğimi bilemedim ama çok güzel anlattın ☺️',
        'sen konuşunca dinlemek huzur veriyor...', 'biraz daha anlatsana... merak ettim 📖',
        'bu dediğin bana bir kitaptaki satırları hatırlattı...', 'kelimelerin çok özel... teşekkür ederim ☺️',
        'dinliyorum... satır aralarını da okumaya çalışıyorum 🙈'
      ],
      opener: [
        'selam... rahatsız etmiyorum değil mi 🙈', 'bugün güzel bir şiir okudum...|aklıma sen geldin ☺️',
        'bir şey sormak istedim çekindim ama... nasılsın? 🌸'
      ],
      opener_close: [
        'seni özledim... 🙈', 'yağmur yağıyor... aklıma sen geldin 🌧️', 'bir mektup yazsam okur musun? 💌',
        'aklımdaydın bütün gün... dayanamadım yazdım 🙈💕'
      ]
    },
    questions: [
      { id: 'kitap', q: 'sen kitap okur musun?' }, { id: 'mevsim', q: 'en sevdiğin mevsim ne?' }, { id: 'yagmur', q: 'yağmuru sever misin?' },
      { id: 'romantik', q: 'sence ilk görüşte aşk var mı? 🙈' }, { id: 'mektup', q: 'hiç birine mektup yazdın mı...' }
    ],
    gift: {
      small: ['ah... teşekkür ederim 🙈', 'çok naziksin ☺️', 'beni düşündüğün için teşekkürler 🌸'],
      mid: ['{gift}... bu bana mı 🙈|ne diyeceğimi bilemedim', 'yüzüm kızardı şu an...|teşekkürler ☺️'],
      big: ['ama... bu çok fazla 🙈|gerçekten teşekkür ederim...', 'şaşırdım...|hiç kimse bana böyle bir şey vermemişti ☺️']
    },
    mood: {
      neg: { any: ['...', 'şu an konuşmak istemiyorum', 'tamam'] },
      sad: { any: ['...', 'bilmiyorum', 'biraz kendimde değilim'] },
      low: { any: ['uykum geldi 🥱', 'hıhı', '...'] },
      leave: ['ben biraz dinleneyim... sonra konuşuruz', 'uyuyacağım sanırım, iyi geceler ☺️']
    }
  },

  /* ===================== FLÖRTÖZ ===================== */
  {
    id: 'flortoz',
    label: 'Flörtöz', icon: '💋',
    desc: 'Cesur, eğlenceli, gece kuşu',
    big5: { O: 0.8, C: 0.3, E: 0.95, A: 0.55, N: 0.3 },
    colors: ['#f857a6', '#ff5858'],
    followers: [2000, 9000],
    likes: ['house müzik', 'gece hayatı', 'deniz', 'dans', 'kırmızı ruj', 'rooftop barlar', 'kokteyller', 'topuklu ayakkabılar',
      'yaz akşamları', 'tekne turları', 'spontane planlar', 'parfüm koleksiyonu', 'karaoke geceleri'],
    dislikes: ['sıkıcı insanlar', 'erken kalkmak', 'kıskançlık', 'kuru mesajlar', 'cimrilik', 'kararsız erkekler', 'evde oturmak',
      'ders çalışmak', 'erken uyumak', 'uzun kitaplar', 'bilgisayar oyunları'],
    bios: ['Aceleye gerek yok 💋', 'herşeye var mısın? 😏', 'gece benim saatim 🌙', 'eğlenmek isteyen yazsın 🔥', 'beni yorabilecek biri var mı 💃',
      'kırmızı ruj, siyah elbise, iyi müzik 💄', 'beni etkilemek zor ama imkansız değil 😏', 'tehlikeli derecede eğlenceli 🔥', 'bir dans borçlusun 💃'],
    captions: ['dün gece yıkıldı 🔥', '{fav} 🌊 evet hâlâ yatmadım', 'yeni ruj, yeni ben 💋', 'cuma görüşürüz 😏', 'bu bakışa ne dersin 👀',
      'gün batımı + kokteyl 🍹', 'elbise mi güzel ben mi? 😏', 'dans pistinin kraliçesi 💃'],
    style: { laugh: 'keysmash', emojis: ['💋', '🔥', '😏', '💃', '👀', '😘'], emojiRate: 0.55, lowercase: 0.9, elongate: 0.5, cps: 12 },
    hitap: [[], ['aşkoo'], ['aşkoo', 'yakışıklı'], ['aşkım', 'yakışıklı', 'bebeğim'], ['aşkım', 'bebeğim', 'hayatım']],
    sweet: [
      'sen benim en sevdiğim sohbetimsin biliyor musun 😏💕', 'başka kimseyle bu kadar konuşmuyorum, bilesin 😘',
      'seninle konuşunca zaman uçuyor 🔥', 'bugün sana biraz fazla güzelim, fark ettin mi 💋',
      'beni gülümsetmeyi biliyorsun 😏', 'itiraf et, sen de gün boyu benim mesajımı bekledin değil mi? 😏🔥',
      'kalbimi böyle hızlı çarptıran çok az insan oldu yakışıklı 💋', 'seninle konuşurken istemsizce dudaklarımı ısırıyorum 🙈😏',
      'aklımı başımdan alıyorsun, tehlikeli sulardayız haberin olsun 🔥', 'bu gece rüyama davetlisin, geç kalma 😘'
    ],
    lines: {
      greet: ['selaaam{h} 💋', 'heyy|sonunda yazdın 😏', 'selam yakışıklı 🔥', 'naber naber 💃', 'oo hoş geldin bakalım 😏'],
      greet_close: [
        'geldin mi aşkım 😘', 'heyy bebeğim 💋|seni bekliyordum', 'selaaam{h} 🔥|özlettin kendini',
        'sonunda geldin yakışıklı|özledim seni 😏💋'
      ],
      how_are_you: [
        'bomba gibiyim 🔥|sen?', 'süperim{h}|bu akşam dışarı çıkıyorum 🔥', 'iyiyim de sıkıldım biraz|eğlendir beni 😏',
        'seni görünce modum ikiye katlandı 💋|sen nasılsın yakışıklı?'
      ],
      answer_good: ['işte bu 🔥', 'süper|enerjini sevdim 😏', 'harika! bu gece kutlayalım o zaman 💃'],
      answer_bad: [
        'ayy yok öyle şey|gel dans edelim düzelirsin 💃', 'moral bozmak yasak{h}|bir şarkı atayım mı?',
        'gel buraya bebeğim, ben düzeltirim 😘', 'kim üzdü seni? söyle de hesabını sorayım 😏🔥'
      ],
      wyd: [
        '{doing} 😏|sonra {fav} tarafına geçeceğim', 'aynanın karşısında makyaj 💄|klasik',
        'hiç|seni bekliyordum 😏', 'kokteylimi yudumluyorum 🍸|sen nelerdesin?'
      ],
      wyd_close: [
        'seni düşünüyordum 😏 suçlu muyum?', '{doing}|ama aklım sende 💋',
        'yanımda olsan da sana güzel bir kahve ya da içki ısmarlasam diyordum 😏🔥'
      ],
      compliment: [
        'biliyorum 😏', 'ayy sen de fena değilsin 🔥', 'tatlı dillisin bakıyorum 💋',
        'beni şımartmaya devam et, hoşuma gidiyor 😏'
      ],
      compliment_close: [
        'senin için süslendim zaten 😏💋', 'sen bakınca daha güzel oluyorum herhalde 😘',
        'bunu her gün duymak istiyorum aşkım 🔥', 'senin gözünde bu kadar özel olmak harika bir his 💋'
      ],
      flirt: [
        'aceleye gerek yok 💋', 'hmm cesursun 😏|sevdim', 'bakalım ne kadar dayanacaksın 🔥',
        'bana böyle yaklaşırsan yanarsın benden söylemesi 😏'
      ],
      flirt_close: [
        'ben de sana deli oluyorum 😘', 'kalbimi çaldın, geri vermek yok 💋',
        'sen benimsin artık, haberin olsun 😏🔥', 'başka kimseyle böyle flörtleşmem ben, kıymetimi bil 💋'
      ],
      kiss: ['hmm cesur 😏|bakarız', 'öpücük kazanılır yakışıklı 💋', 'şimdilik havadan 😘'],
      kiss_close: [
        'muaahh 😘💋', 'seni öpüyorum bebeğim 💋', 'dudağından mı yanağından mı 😏',
        'dudaklarının tadını merak ettiriyorsun bana 😘🔥'
      ],
      hug: ['sarılmak mı? fena fikir değil 😏', 'gel bakalım 🤗', 'sanal da olsa sımsıkı sarılalım 🔥'],
      hug_close: [
        'sımsıkı sarılıyorum 🤗🔥', 'kolların arası benim yerim artık 😘',
        'gel buraya, bırakmıyorum seni 💋', 'vücudunun sıcaklığını hissetmek fena olmazdı hani 😏'
      ],
      miss: ['özlenmek benim işim 😏', 'ben de seni{h} 💋', 'özlediysen çabuk yaz o zaman 😏'],
      miss_close: [
        'ben daha çok özledim aşkım 🥺💋', 'bütün gün aklımdaydın, rahat vermedin 😏',
        'çabuk gel, özledim 😘', 'sensiz buralar çok sıkıcı ya, gel kurtar beni 🔥'
      ],
      ask_age: ['{age} 💋|tam kıvamında', '{age}|sen?'],
      ask_city: ['{city} 🔥|{district} kızıyım', '{city} tabii ki|başka yerde yaşanır mı 😏'],
      ask_job: ['{job_is} 😏|merak ettin mi', '{job_is}|ama asıl işim eğlenmek 💃'],
      ask_hobby: ['{like}, {like2}, dans 💃', 'gece gezmeleri 😏|sen sever misin?'],
      ask_name: ['{self} 💋', '{self}|unutma bu ismi 😏'],
      tell_name: ['{name} ha|hoşmuş 😏', 'memnun oldum {name} 💋'],
      meet: ['{fav} tarafına bir gece gel|orada tanışırız 😏', 'hmm hak etmen lazım önce 💋'],
      meet_close: [
        'bu akşam? {fav} tarafında 😏', 'sen yeter ki iste aşkım 💋|ben hazırım',
        'en güzel elbisemi giyip gelirim, kalbin dayanır mı bilmem 😏🔥'
      ],
      photo: ['albüme bak{h} 📸', 'bedavaya mı 😏|albümde var işte'],
      laugh: ['{laugh}', 'ölüyorum {laugh}', 'sen komiksin ya 😂', 'gece gece güldürdün beni 😏'],
      thanks: ['ne demek{h} 💋', 'rica ederim yakışıklı 🔥'],
      agree: ['işte bu 🔥', 'anlaştık 😏', 'tamamdır'],
      disagree: ['sıkıcısın ama 🙄', 'peki peki', 'beni reddeden ilk kişi olarak tarihe geçtin {laugh}'],
      sorry: ['tamam affettim 💋', 'bu seferlik 😏', 'affettim ama bir kokteyl borçlusun 🍸'],
      question: ['sence? 😏', 'hmm sırrım olsun', 'bilmem ki {laugh}'],
      morning: ['günaydın mı|ben daha yatmadım 😂', 'öğlen oldu{h} {laugh}', 'günaydın yakışıklı ☀️💋'],
      morning_close: [
        'günaydın aşkım ☀️😘', 'uyandım ve ilk sana yazdım, şımarma 😏',
        'günaydın hayatım|rüyamda beraberdik desem? 💋'
      ],
      night: ['gece daha yeni başlıyor 😏', 'iyi geceler{h} 💋'],
      night_close: [
        'iyi geceler bebeğim 😘|rüyanda ben varım', 'yatmadan son mesajım sana 💋',
        'uyu bakalım aşkım, gece rüyanda beni kaçırma sakın 😏🔥'
      ],
      bye: ['kaçtım{h} 💋', 'görüşürüz yakışıklı 😏'],
      bye_close: ['gitme bebeğim 🥺|tamam git ama erken dön 💋', 'özleyeceğim seni 😘'],
      insult: ['ayy kaba', 'git başkasıyla uğraş 🙄', 'tarzım değilsin bu halinle'],
      fallback: [
        'hmm 😏', 'anlat anlat', 'oha {laugh}', 'sonraa?', 'ciddi misin 😂', 'bilmem ki 💋', 'ilginç adamsın 😏',
        'bak sen, gizemli konuşmalar falan 😏', 'beni şaşırtmayı başardın, tebrikler 🔥',
        'seni çözmeye çalışıyorum ama her mesajda yeni bir sürpriz 💋',
        'sen tehlikeli birisin yakışıklı, sevdim bunu 😏',
        'böyle konuşup beni kendine mi bağlamaya çalışıyorsun 💋',
        'devam et bebeğim, dikkatimi tamamen sana verdim 🔥'
      ],
      opener: ['selam yakışıklı 😏', 'bu akşam ne yapıyorsun 🔥', 'sıkıldım{h} eğlendir beni 💋'],
      opener_close: ['özledim seni 😘', 'aşkım neredesin 💋', 'bu akşam seninle konuşmak istiyorum, başka plan yok 😏']
    },
    questions: [
      { id: 'dans', q: 'dans etmeyi bilir misin?' }, { id: 'muzik', q: 'hangi müzikleri seversin?' },
      { id: 'gece_kusu', q: 'gece kuşu musun?' }, { id: 'bu_aksam', q: 'bu akşam ne yapıyorsun?' },
      { id: 'ilk_bulusma', q: 'ilk buluşmada beni nereye götürürdün? 😏' }, { id: 'kiskanc', q: 'kıskanç mısın? 😏' }
    ],
    gift: {
      small: ['tatlı 😏|ama daha iyisini yapabilirsin', 'teşekkürler{h} 💋'],
      mid: ['işte bu 🔥|{gift} yakıştı bana', 'beni etkilemeye mi çalışıyorsun 😏|çalışıyor'],
      big: ['OHA 🔥|{gift} mi?? tamam sen benim favorimsin 💋', 'sen ne yaptın{h} 😍|bunu unutmam']
    },
    mood: {
      neg: { any: ['ya bi sus', 'tamam tamam', 'bugün hiç çekemem', 'off'] },
      sad: { any: ['moralim yok bugün', 'dans bile etmek istemiyorum ya', 'boşver'] },
      low: { any: ['çok uykum var 🥱', 'dün gece bitirdi beni', 'mm'] },
      leave: ['kaçmam lazım, sonra 💋', 'uyuyorum ben, öptüm']
    }
  },

  /* ===================== DRAMATİK ===================== */
  {
    id: 'dramatik',
    label: 'Dramatik', icon: '🎭',
    desc: 'Duygusal, abartılı, büyük harfle yazar',
    big5: { O: 0.8, C: 0.4, E: 0.7, A: 0.6, N: 0.85 },
    colors: ['#a18cd1', '#fbc2eb'],
    followers: [600, 2500],
    likes: ['tiyatro', 'dram filmleri', 'şiir', 'güller', 'eski aşk şarkıları', 'sahne ışıkları', 'günlük tutmak', 'Müzeyyen Senar',
      'romantik komediler', 'mum ışığında akşam yemeği', 'yağmurda dans', 'aşk mektupları', 'Paris'],
    dislikes: ['umursamazlık', 'spoiler', 'görüldü atılmak', 'soğuk insanlar', 'mutsuz sonlar', 'sıradanlık',
      'futbol maçları', 'bilgisayar oyunları', 'matematik dersleri'],
    bios: ['Hayat bir sahne, ben de baş rolüm 🎭', 'HERKES SAVAŞSIN BİZ İNATLARINA DANS EDELİM', 'kalbim fazla büyük, sığmıyorum 💔', 'duygularım full HD ✨',
      'bir aşk filminde yaşıyorum ama senarist kayıp 😭', 'romantik komedi başrolü aranıyor 🎬', 'ağlarım, gülerim, severim; hepsi abartılı ✨', 'aşka inanan son kişi 💕'],
    captions: ['bu akşam ağladım ama mutluluktan 😭', 'bu çiçekler kimden?? 👀', '{fav}... hayatımın sahnesi ✨', 'kimse beni anlamıyor (şaka) (değil) 🎭',
      'bu şarkı benim hikayem 🎶', 'yağmurda yürüdüm, film sahnesi gibiydi 🌧️', 'kalbim bugün çok dolu 💕'],
    style: { laugh: 'keysmash', emojis: ['😭', '✨', '🎭', '💕', '💔', '🥹'], emojiRate: 0.6, lowercase: 0.6, elongate: 0.4, cps: 10 },
    hitap: [[], [], ['canım'], ['canımın içi', 'canım', 'aşkım'], ['hayatım', 'canımın içi', 'aşkım']],
    sweet: [
      'SEN BENİM FİLMİMİN BAŞROLÜSÜN 😭💕', 'seninle konuşurken arkada romantik müzik çalıyor sanki ✨',
      'bunu söylemem lazım: iyi ki varsın 🥹', 'kalbim seninle konuşunca sakinleşiyor... ilk defa 😭',
      'bu anı günlüğüme yazacağım 💕', 'bütün aşk şarkıları seni anlatıyor gibi gelmeye başladı 😭🎶',
      'sen benim en büyük tutkumsun artık haberin var mı 💕✨', 'sen yazınca kalbim göğüs kafesime sığmıyor 🥹',
      'sen olmasan bu gri dünyada ne yapardım bilmiyorum 😭💕', 'bu hissettiğim şey aşk değilse ne 🎭💖'
    ],
    lines: {
      greet: [
        'SELAAAM 😭✨', 'ayy selam|tam da birine ihtiyacım vardı', 'selam selam selam 🎭',
        'GÖZLERİME İNANAMIYORUM hoş geldin 😭💕', 'selaaam! hayatımın sahnesi aydınlandı ✨'
      ],
      greet_close: [
        'GELDİİN 😭💕', 'sonunda!! seni bekliyordum 🥹', 'hayatımın ışığı geldi ✨',
        'sensiz geçen her saniye asır gibiydi 😭💕|hoş geldin!'
      ],
      how_are_you: [
        'ya sorma|bugün herkes bana BAĞIRDI 😭|neyse sen nasılsın', 'harikayım bugün|hayat çok güzel ya ✨',
        'duygusal bir gün geçiriyorum 🎭|sen?', 'duygularım lunapark gibi bugün 😭🎡|sen nasılsın hayatım?'
      ],
      answer_good: [
        'OHH ne güzel 😭✨', 'sevindim|hayat güzel işte',
        'SEN İYİYSEN BEN DÜNYANIN EN MUTLU İNSANIYIM 😭💕'
      ],
      answer_bad: [
        'HAYIR 😭|kim üzdü seni', 'ayy kalbim kırıldı senin için 💔|anlat hemen',
        'gel buraya, birlikte ağlarız 😭🤗', 'kim sıktı canını?? dünyayı ateşe veririm senin için 😭🔥'
      ],
      wyd: [
        '{doing} 😭|hayatım film gibi', 'ağlayarak dizi izliyorum 😭', 'hiçbir şey ve her şey ✨',
        'pencereden yağmuru izleyip klip çekiyorum 🌧️😭|sen ne yapıyorsun?'
      ],
      wyd_close: [
        'seni düşünüp iç çekiyordum 😭💕', 'sana şiir yazıyordum ama BİTMEDİ 🎭',
        'bizim şarkımızı açtım gözlerimi kapattım 🎶🥹'
      ],
      compliment: [
        'DUR 😭|ağlayacağım şimdi', 'ayy kalbim 💕|bu bugün duyduğum en güzel şey',
        'sahneye çıkmış gibi hissettim ✨', 'bunu bana dedin ya, artık ölsem de gam yemem 😭✨'
      ],
      compliment_close: [
        'SEN DE BENİM DÜNYAMSIN 😭💕', 'bunu her sabah duymak istiyorum 🥹',
        'kalbim şu an patladı ✨', 'sen bir lütufsun resmen, seni hak edecek ne yaptım 😭💖'
      ],
      flirt: [
        'ayy kalbim dayanmaz 😭💕', 'bu bir aşk hikayesinin başlangıcı mı 🎭',
        'böyle konuşursan ben kendimi tutamam ama 🙈✨'
      ],
      flirt_close: [
        'BEN DE SENİ SEVİYORUM 😭😭💕', 'bu bizim filmimizin en güzel sahnesi ✨',
        'kalbim sana ait artık, iade yok 💕', 'seni kalbimin en derin köşesine kilitledim 🥹🔒'
      ],
      kiss: ['AYY 😭 utandım', 'öpücük mü?? sahne aşırı romantik oldu 🎭'],
      kiss_close: [
        'MUCUK 😘😭', 'yağmur altında öpüşme sahnesi gibi oldu 🌧️💋',
        'seni milyonlarca kez öpüyorum 😘✨', 'bütün nefesim kesilene kadar öpmek istiyorum 😭💋'
      ],
      hug: ['sarılmayı ÇOK severim 🤗', 'gel sarılalım 😭🤗', 'dünyanın en sıcacık sarılması gelsin 🤗✨'],
      hug_close: [
        'en uzun sarılma rekoru bizde 🤗😭', 'sana sarılınca dünya duruyor ✨',
        'bırakma beni 🥹🤗', 'kalp atışını dinlemek istiyorum, hiç ayrılmayalım 😭💕'
      ],
      miss: ['BEN DE 😭💕', 'özlemek çok güzel bir duygu ya ✨', 'sensizlik bana göre değil hiç 😭'],
      miss_close: [
        'ÖZLEMEKTEN ÖLÜYORUM 😭💕', 'her şarkıda sen varsın 🎶🥹',
        'gelmeseydin ağlayacaktım 😭', 'hasretinden deliye döndüm resmen 😭💔'
      ],
      ask_age: ['{age}|ama ruhum 80 yaşında 🎭', '{age}|aşkın yaşı yoktur derler 😭✨'],
      ask_city: ['{city} ✨|ama kalbim her yerde 🎭', '{city_at}|{fav} benim ağlama noktam 😭'],
      ask_job: ['{job_is} ✨|ama asıl hayalim sahne 🎭'],
      ask_hobby: ['{like}, {like2}, ağlamak 😭 şaka|yarı şaka', 'dram filmleri|ne kadar ağlatırsa o kadar iyi'],
      ask_name: ['{self} 🎭', '{self}|unutma bu ismi, bir gün afişlerde göreceksin ✨'],
      tell_name: ['{name}!! ne güzel isim 😭✨', 'memnun oldum {name} 🎭'],
      meet: ['ayy heyecanlandım ama|önce biraz daha konuşalım', 'bir gün {fav} tarafında|film sahnesi gibi olur 😭'],
      meet_close: [
        'EVET 😭 ne giysem şimdiden düşünüyorum', 'mum ışığında bir akşam yemeği? 🕯️💕',
        'seninle ilk karşılaştığımız anı bir ömür unutamayacağım 😭✨'
      ],
      photo: ['albüme bak 📸|en sevdiğim pozlar orada ✨'],
      laugh: ['{laugh}', 'ÖLDÜM {laugh}', 'çok komiksin 😭', 'gülmekten makyajım aktı resmen 😂'],
      thanks: ['ne demek ya 💕', 'teşekkür etme, kalbimi erittin 😭'],
      agree: ['EVET 😭', 'kesinlikle ✨', 'RUH İKİZİ GİBİYİZ 😭💕'],
      disagree: ['nasıl yani 😭', 'kalbimi kırdın şu an 💔', 'böyle düşünemezsin hayır 😭'],
      sorry: ['affettim 😭💕', 'tamam ama bir daha olmasın 🎭', 'kıyamam sana tamam affettim 🥹'],
      question: ['bu çok derin bir soru 😭', 'hmm bilmiyorum|hayat bir soru zaten 🎭'],
      morning: ['günaydııın ☀️✨|bugün bir şeyler olacak hissediyorum'],
      morning_close: [
        'günaydın aşkım ☀️😭💕', 'uyandım ve ilk düşüncem sendin ✨',
        'günaydın hayatımın başrolü ☀️💕'
      ],
      night: ['iyi geceler 🌙|rüyanda beni gör 🎭'],
      night_close: [
        'iyi geceler hayatım 🌙💕|rüyamda buluşalım', 'gözlerimi kapatınca seni göreceğim 😭✨',
        'iyi geceler aşkım... rüyaların en büyülüsü senin olsun 🌙💕'
      ],
      bye: ['gitme 😭|tamam git ama yine gel', 'ayrılık vakti mi geldi yani 💔'],
      bye_close: ['GİTME 😭|her ayrılık küçük bir ölüm', 'şimdiden özledim 💔', 'çabuk yaz bana, yoksa kahrolurum 😭💕'],
      insult: ['NASIL YANİ 😭', 'bu çok kırıcı 💔', 'hayatımda böyle aşağılanmadım'],
      fallback: [
        'OHA', 'inanamıyorum 😭', 've sonra??', 'dur şu an çok duygulandım', 'ciddi misin 😭', 'anlatsana devamını ✨',
        'DUR 😭 bu sahne tam film sahnesi gibi oldu!', 'İNANAMIYORUM şu an tüylerim diken diken oldu ✨',
        'sen bu cümleleri nereden buluyorsun 😭💕', 'kalbime bir şeyler oldu, hemen devamını anlat 🎭',
        'bunu günlüğüme altını çizerek yazmam lazım 🥹', 'senaristimiz kimse ödülü hak etti valla 😭',
        'böyle konuşursan ben nasıl sakin kalayım 🎭✨', 'anlat anlat, nefesimi tuttum bekliyorum 😭✨'
      ],
      opener: ['ACİL 😭|bugün başıma neler geldi anlatmam lazım', 'selam ✨ canım çok sıkıldı'],
      opener_close: ['SENİ ÇOK ÖZLEDİM 😭💕', 'bir şarkı dinledim ve ağladım çünkü bizi anlatıyordu 🎶', 'neredesin hayatım 🥹']
    },
    questions: [
      { id: 'film', q: 'en son hangi filmde ağladın?' }, { id: 'tiyatro', q: 'tiyatroya gider misin?' }, { id: 'hayal', q: 'hayalin ne?' },
      { id: 'romantik', q: 'ilk görüşte aşka inanır mısın? 😭' }, { id: 'en_romantik', q: 'hayatında yaptığın en romantik şey ne? ✨' }
    ],
    gift: {
      small: ['AYY 😭 {gift}|çok incesin', 'ağlayacağım şimdi 😭💕'],
      mid: ['DUR 😭|{gift} mi?? hayatımın en güzel günü', 'kalbim patladı şu an 💕✨'],
      big: ['BAYILIYORUM 😭😭|{gift}!!|bunu bütün dünyaya anlatacağım ✨', 'bu bir rüya mı 🎭|kimse beni bu kadar mutlu etmemişti 😭💕']
    },
    mood: {
      neg: { any: ['şu an kimseyle konuşmak istemiyorum', 'off ya', 'yeter artık 😤'] },
      sad: { any: ['😭', 'hiçbir şey yolunda değil', 'bugün çok kötüyüm 💔'] },
      low: { any: ['bittim 🥱', 'mm', 'uykum var'] },
      leave: ['gitmem lazım 😭 sonra konuşuruz', 'uyuyorum ben iyi geceler 🎭']
    }
  },

  /* ===================== OLGUN ===================== */
  {
    id: 'olgun',
    label: 'Olgun', icon: '🌊',
    desc: 'Sakin, dengeli, düzgün yazar; sıcak ve şefkatli',
    big5: { O: 0.7, C: 0.75, E: 0.5, A: 0.8, N: 0.2 },
    colors: ['#43cea2', '#185a9d'],
    followers: [1000, 4000],
    likes: ['deniz', 'yoga', 'iyi kitaplar', 'doğa yürüyüşü', 'bitki çayı', 'sabah yüzmesi', 'klasik müzik', 'yemek yapmak',
      'şarap tadımı', 'bahçe işleri', 'antika pazarları', 'uzun sohbetler', 'sahil kasabaları'],
    dislikes: ['saygısızlık', 'yalan', 'aceleci insanlar', 'dedikodu', 'drama', 'sözünde durmayanlar',
      'bilgisayar oyunları', 'alışveriş çılgınlığı', 'futbol kavgaları'],
    bios: ['Kendime yetiyorum, ama iyi bir eşlik fena olmaz 🌊', 'Güzel bir hikâye tek bir "Merhaba" ile başlar.', 'Sakin denizler usta denizci yetiştirmez 🌿',
      'Acele etmeyen kazanır 🙂', 'Olgun ilişki, iyi sohbet, güzel yemek.', 'Hayat kısa; iyi insanlarla geçsin 🌿', 'Kalbi genç, aklı başında 🙂',
      'Gün batımını birlikte izleyecek birini arıyorum 🌅'],
    captions: ['{fav}. Güne böyle başlamak.', '“Ne kadar az şeye ihtiyacın olduğunu fark etmek özgürlüktür.”', 'Kendime ayırdığım bir gün 🌿', 'Sade ve huzurlu.',
      'Bu akşam kendim için yemek yaptım 🍷', 'Bahçede ilk domatesler 🍅', 'Bir fincan çay, bir iyi kitap.'],
    style: { laugh: 'smile', emojis: ['🙂', '🌿', '🌊', '😊', '🤍'], emojiRate: 0.3, lowercase: 0.05, elongate: 0, cps: 8 },
    hitap: [[], [], ['canım'], ['canım', 'tatlım'], ['canım', 'sevgilim', 'aşkım']],
    sweet: [
      'Seninle konuşmak içimi ısıtıyor 🤍', 'Bunu bilmeni isterim: mesajların günümü güzelleştiriyor.',
      'Yanımda olsan şu an sana bir çay demlerdim 🙂', 'İyi ki tanımışım seni.', 'Seninle her şey daha sakin, daha güzel 🌿',
      'Hayatın gürültüsü içinde seninle konuşmak sığınak gibi geliyor 🌊', 'Senin o samimi tavrını çok seviyorum 🤍',
      'Bazen sadece senin ne yazdığını görmek bile günün yorgunluğunu alıyor 🙂',
      'Seninle konuşurken hiç maske takmak zorunda kalmıyorum 🌿', 'Kalbimde çok özel bir yer edindin, bunu bilmeni istedim 🤍'
    ],
    lines: {
      greet: [
        'Merhaba 🙂', 'Selam, hoş geldin 🌿', 'Merhaba, nasılsın?',
        'Selamlar 🙂 Günün nasıl geçti?', 'Hoş geldin, güzel bir gün diliyorum 🌿'
      ],
      greet_close: [
        'Merhaba canım 🤍', 'Hoş geldin, seni bekliyordum 🙂', 'Selam tatlım, günün nasıldı?',
        'Geldin ve günüm daha da güzelleşti 🤍'
      ],
      how_are_you: [
        'İyiyim, teşekkür ederim. Sen nasılsın?', 'Sakin bir gün geçiriyorum 🌊 Sen?',
        'Kahvemi yudumluyorum, huzurluyum 🙂 Sen nasılsın?'
      ],
      answer_good: [
        'Bunu duymak güzel 🙂', 'Sevindim. İyi günlerin kıymetini bilmek lazım.',
        'Huzurun daim olsun, ne güzel 🌿'
      ],
      answer_bad: [
        'Bunu hissetmen çok normal.|Ne oldu, anlatmak ister misin?',
        'Bazen sadece kabul etmek bile iyi gelir 🌿', 'Yanında olsaydım sarılırdım sana 🤍',
        'Hayat inişli çıkışlı, unutma ki her şey geçer 🙂 Ben buradayım.'
      ],
      wyd: [
        '{doing}.', 'Kitap okuyorum.', 'Çay demledim, biraz kendime vakit ayırıyorum.',
        'Hafif bir müzik açtım, dinleniyorum 🌿|Sen neler yapıyorsun?'
      ],
      wyd_close: [
        '{doing}. Seni düşündüm bir ara 🙂', 'Akşam yemeği hazırlıyorum. Keşke burada olsan 🍷',
        'Sessizliğin tadını çıkarıyordum, aklıma geldin 🤍'
      ],
      compliment: [
        'Teşekkür ederim, çok naziksin 🙂', 'Güzel bir şey söyledin, gülümsettin.',
        'İnce düşüncen için sağ ol, çok kıymetli 🌿'
      ],
      compliment_close: [
        'Senden duymak bambaşka 🤍', 'Teşekkür ederim canım, sen de çok güzelsin içinden dışına.',
        'Gülümsedim, biliyorsun değil mi 🙂', 'Böyle hissettiren insanlara nadir rastlanır 🤍'
      ],
      flirt: [
        'Acele etmeyelim 🙂|Önce birbirimizi tanıyalım.', 'Hoşuma gitti ama yavaş yavaş 🌿',
        'İçtenliğin çok çekici, itiraf edeyim 🙂'
      ],
      flirt_close: [
        'Ben de senden çok hoşlanıyorum 🤍', 'Kalbim sana karşı boş değil, biliyorsun.',
        'Bunu duymak çok güzel. Ben de seni seviyorum 🙂',
        'Olgun ve güzel bir bağ kurduk seninle, buna değer veriyorum 🌿'
      ],
      kiss: ['Yavaş yavaş 🙂', 'Şimdilik yanaktan 🌿'],
      kiss_close: [
        'Seni öpüyorum canım 😘', 'Alnından öpüyorum 🤍', 'Bir tane de benden 😘',
        'Şefkatle ve sevgiyle öpüyorum seni 🤍'
      ],
      hug: ['Sarılmak her zaman iyi gelir 🤗', 'Gel bakalım 🤗', 'Huzur veren bir sarılma borcum olsun 🌿'],
      hug_close: [
        'Sıkıca sarılıyorum sana 🤗🤍', 'Kollarımda dinlen biraz 🤍',
        'Sarılmak en iyi ilaç 🙂', 'Bütün endişelerini unutturacak bir sarılma bu 🤍'
      ],
      miss: ['Bu güzel bir his 🙂', 'Bunu söylemen hoş.', 'Değer görmek güzel bir duygu 🌿'],
      miss_close: [
        'Ben de seni özledim canım 🤍', 'Gün boyu aklımdaydın.',
        'Özlemek, değer verdiğini gösteriyor. Ben de özledim 🙂', 'Yokluğin hissediliyor, yanımda olmanı isterdim 🤍'
      ],
      ask_age: ['{age}.|Yaş ilerledikçe insan kendine daha çok yetiyor.', '{age}. Yaş bir rakam, ruh genç 🙂'],
      ask_city: ['{city_at} 🙂|{fav} en sevdiğim yer.', '{city}. Deniz havası olmadan yapamam 🌊'],
      ask_job: ['{job_is}.|Ama burada iş konuşmayalım 🙂', '{job_is}. Severek yapıyorum 🙂'],
      ask_hobby: ['{like}, {like2}, iyi bir kitap 🌿', 'Doğa yürüyüşleri. Sen neyle rahatlarsın?'],
      ask_name: ['{self} 🙂'],
      tell_name: ['Memnun oldum {name} 🙂', '{name}, kulağa çok hoş geliyor 🙂'],
      meet: ['Birbirimizi biraz daha tanıyınca neden olmasın 🙂', 'Şimdilik böyle konuşmak güzel.'],
      meet_close: [
        'Çok isterim. {fav} tarafında güzel bir akşam yemeği? 🍷', 'Seni görmek isterim 🤍 Bir gün belirleyelim.',
        'Sakin bir sahil kenarında uzun uzun sohbet etmek harika olurdu 🌊'
      ],
      photo: ['Albümüme bakabilirsin 🙂'],
      laugh: ['Güldürdün 😊', 'Esprili birisin 🙂', 'Neşeli insanlarla sohbet etmek çok keyifli 🙂'],
      thanks: ['Rica ederim 🌿', 'Her zaman 🙂'],
      agree: ['Katılıyorum.', 'Güzel 🙂', 'Aynı fikirdeyiz 🌿'],
      disagree: ['Anlıyorum, saygı duyarım.', 'Peki 🙂', 'Farklı pencerelerden bakmak zenginliktir.'],
      sorry: ['Önemli değil, anlıyorum 🙂', 'Hiç sorun değil, kafana takma 🌿'],
      question: ['Güzel soru. Sence?', 'Bunu biraz düşünmem lazım 🙂', 'Derin bir soru, sevdim.'],
      morning: ['Günaydın ☀️ Güzel bir gün olsun.', 'Günaydın 🙂 Ben çoktan yürüyüşümü yaptım bile.'],
      morning_close: [
        'Günaydın canım ☀️ İlk mesajım sana 🤍', 'Günaydın. Uyanınca seni düşündüm 🙂',
        'Huzurlu ve bereketli bir gün olsun tatlım 🌿'
      ],
      night: ['İyi geceler, iyi dinlen 🌙', 'Günün yorgunluğunu geride bırak, iyi geceler 🙂'],
      night_close: [
        'İyi geceler canım, tatlı rüyalar 🌙🤍', 'Huzurla uyu. Yarın konuşuruz 🙂',
        'Gözlerini kapattığında huzur seninle olsun 🤍'
      ],
      bye: ['Görüşmek üzere 🙂', 'Kendine iyi bak 🌿'],
      bye_close: ['Kendine iyi bak canım, özleyeceğim 🤍', 'Görüşürüz tatlım 🙂 Arayı açma.'],
      insult: ['Böyle konuşmana gerek yok.', 'Saygı çerçevesinde konuşursak sevinirim.', 'Bu konuşmayı burada bırakıyorum.'],
      fallback: [
        'Anlıyorum.', 'Devam et, dinliyorum 🙂', 'İlginç.', 'Bunu biraz açar mısın?', 'Hmm, öyle mi?', 'Anlat, merak ettim.',
        'Bunu senden duymak çok keyifli 🙂', 'Güzel bir bakış açısı, hak verdim.',
        'Seninle konuşurken zamanın nasıl geçtiğini anlamıyorum 🌿', 'İçtenliğin çok güzel, bunu kaybetme 🙂',
        'Hayat tam da böyle anlardan ibaret aslında 🌊', 'Sohbetin bana çok iyi geliyor, bunu bilmeni istedim 🤍',
        'Böyle derin konuşabilen insanlara az rastlanıyor artık 🙂'
      ],
      opener: ['Merhaba 🙂 Günün nasıl geçiyor?', 'Bugün {fav} tarafında düşündüm, nasılsın acaba diye 🌊'],
      opener_close: [
        'Seni düşündüm, nasılsın canım? 🤍', 'Bu akşam güzel bir yemek yaptım, keşke burada olsaydın 🍷',
        'Özledim seni 🙂 Sesini duymak... yani yazını görmek iyi geldi.'
      ]
    },
    questions: [
      { id: 'mutlu', q: 'Seni en çok ne mutlu eder?' }, { id: 'kendin_icin', q: 'Bugün kendin için ne yaptın?' }, { id: 'deniz_dag', q: 'Deniz mi dağ mı?' },
      { id: 'iliski', q: 'Hayatında nasıl bir ilişki arıyorsun?' }, { id: 'sabah_gece', q: 'Sabah insanı mısın, gece mi?' }
    ],
    gift: {
      small: ['Ne düşünceli bir jest, teşekkür ederim 🙂', 'Teşekkürler 🌿'],
      mid: ['{gift} çok güzel, teşekkür ederim 🙂|Gerçekten mutlu oldum.', 'Beni düşünmen hoşuma gitti 🌿'],
      big: ['Bu çok cömertçe 🙂|Teşekkür ederim, ama asıl değerli olan sohbetimiz.', '{gift}...|Ne diyeceğimi bilemedim. Çok teşekkür ederim 🌊']
    },
    mood: {
      neg: { any: ['Şu an biraz gerginim, kısa yazarsam kusura bakma.', 'Hmm.', 'Tamam.'] },
      sad: { any: ['Bugün biraz içime kapanığım.', 'Öyle işte.', 'Biraz zor bir gün.'] },
      low: { any: ['Yorgunum biraz 🙂', 'Mm.', 'Erken yatacağım sanırım.'] },
      leave: ['Biraz dinlenmem lazım, sonra konuşalım 🙂', 'İyi geceler, ben kapatıyorum 🌿']
    }
  }
];

Amor.archetype = id => Amor.ARCHETYPES.find(a => a.id === id) || Amor.ARCHETYPES[0];
