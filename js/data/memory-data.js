/*
 * Amor - Hafıza sözlükleri
 * ------------------------
 * Kullanıcının mesajlarından bilgi çıkarmak için: şehirler, meslekler, olaylar.
 * Aramalar sadeleştirilmiş metinde yapılır (ç->c, ş->s, ı->i, ğ->g, ö->o, ü->u).
 */
window.Amor = window.Amor || {};

// [sadeleştirilmiş, görünen]
Amor.MEM_CITIES = [
  ['istanbul', 'İstanbul'], ['ankara', 'Ankara'], ['izmir', 'İzmir'], ['bursa', 'Bursa'], ['antalya', 'Antalya'],
  ['adana', 'Adana'], ['konya', 'Konya'], ['gaziantep', 'Gaziantep'], ['antep', 'Antep'], ['mersin', 'Mersin'],
  ['kayseri', 'Kayseri'], ['eskisehir', 'Eskişehir'], ['diyarbakir', 'Diyarbakır'], ['samsun', 'Samsun'],
  ['trabzon', 'Trabzon'], ['malatya', 'Malatya'], ['erzurum', 'Erzurum'], ['van', 'Van'], ['denizli', 'Denizli'],
  ['sakarya', 'Sakarya'], ['kocaeli', 'Kocaeli'], ['izmit', 'İzmit'], ['manisa', 'Manisa'], ['aydin', 'Aydın'],
  ['mugla', 'Muğla'], ['bodrum', 'Bodrum'], ['tekirdag', 'Tekirdağ'], ['edirne', 'Edirne'], ['balikesir', 'Balıkesir'],
  ['canakkale', 'Çanakkale'], ['hatay', 'Hatay'], ['urfa', 'Urfa'], ['sanliurfa', 'Şanlıurfa'], ['mardin', 'Mardin'],
  ['ordu', 'Ordu'], ['rize', 'Rize'], ['sivas', 'Sivas'], ['tokat', 'Tokat'], ['maras', 'Maraş'], ['elazig', 'Elazığ'],
  ['batman', 'Batman'], ['zonguldak', 'Zonguldak'], ['bolu', 'Bolu'], ['afyon', 'Afyon'], ['isparta', 'Isparta'],
  ['kutahya', 'Kütahya'], ['usak', 'Uşak'], ['yalova', 'Yalova'], ['duzce', 'Düzce'], ['nigde', 'Niğde'],
  ['nevsehir', 'Nevşehir'], ['aksaray', 'Aksaray'], ['corum', 'Çorum'], ['amasya', 'Amasya'], ['giresun', 'Giresun'],
  ['kastamonu', 'Kastamonu'], ['sinop', 'Sinop'], ['karabuk', 'Karabük'], ['kirikkale', 'Kırıkkale'], ['bartin', 'Bartın']
];

// [sadeleştirilmiş kök, görünen, öğrenci mi]
Amor.MEM_JOBS = [
  ['ogrenci', 'öğrenci', true], ['universiteli', 'üniversiteli', true], ['muhendis', 'mühendis'], ['doktor', 'doktor'],
  ['ogretmen', 'öğretmen'], ['avukat', 'avukat'], ['hemsire', 'hemşire'], ['polis', 'polis'], ['asker', 'asker'],
  ['yazilimci', 'yazılımcı'], ['tasarimci', 'tasarımcı'], ['muhasebeci', 'muhasebeci'], ['mimar', 'mimar'],
  ['sofor', 'şoför'], ['esnaf', 'esnaf'], ['garson', 'garson'], ['asci', 'aşçı'], ['berber', 'berber'], ['pilot', 'pilot'],
  ['isci', 'işçi'], ['memur', 'memur'], ['emlakci', 'emlakçı'], ['kuafor', 'kuaför'], ['eczaci', 'eczacı'],
  ['veteriner', 'veteriner'], ['bankaci', 'bankacı'], ['sporcu', 'sporcu'], ['futbolcu', 'futbolcu'],
  ['muzisyen', 'müzisyen'], ['fotografci', 'fotoğrafçı'], ['programci', 'programcı'], ['issiz', 'işsiz'], ['serbest', 'serbest çalışan']
];

/*
 * Olaylar: "yarın sınavım var" -> karakter sonra "sınavın nasıl geçti?" diye sorar.
 * label: "sınavın"  mi: soru eki ("sınavın mı var?")
 */
Amor.MEM_EVENTS = [
  { key: 'sinav', m: ['sinav', 'vize', 'final', 'quiz'], label: 'sınavın', mi: 'mı' },
  { key: 'mac', m: ['mac'], label: 'maçın', mi: 'mı' },
  { key: 'toplanti', m: ['toplanti'], label: 'toplantın', mi: 'mı' },
  { key: 'mulakat', m: ['mulakat', 'is gorusme'], label: 'iş görüşmen', mi: 'mi' },
  { key: 'dogumgunu', m: ['dogum gunu', 'dogumgunu'], label: 'doğum günün', mi: 'mü' },
  { key: 'randevu', m: ['randevu', 'doktora gid'], label: 'randevun', mi: 'mu' },
  { key: 'yolculuk', m: ['yolculuk', 'seyahat', 'tatile gid', 'tatil'], label: 'yolculuğun', mi: 'mu' },
  { key: 'sunum', m: ['sunum'], label: 'sunumun', mi: 'mu' },
  { key: 'ameliyat', m: ['ameliyat'], label: 'ameliyatın', mi: 'mı' },
  { key: 'dugun', m: ['dugun'], label: 'düğünün', mi: 'mü' }
];

// Kuru mesajlar (ilgiyi düşürür)
Amor.DRY = ['hm', 'hmm', 'ok', 'tamam', 'tm', 'he', 'evet', 'yok', 'iyi', 'aynen', 'peki', 'k', 'h', 'ha', 'öyle', 'oyle', 'saol', 'sagol', 'eyv', 'ya', 'hı', 'hi'];
