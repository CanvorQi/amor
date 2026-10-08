/*
 * Amor - Yansıtma verileri (js/reflect.js)
 * ----------------------------------------
 * Kullanıcının cümlesindeki fiil 2. şahsa çevrilip {x} olarak cümleye girer:
 *   "bugün sinemaya gittim" -> {x} = "bugün sinemaya gittin" -> "aa bugün sinemaya gittin mi, anlat bakalım"
 * Anahtar: <zaman>_<ton>. Ton yoksa <zaman>_any kullanılır.
 * Zamanlar: past (gittim) · prog (gidiyorum) · fut (gideceğim) · habit (giderim) · neg (gitmedim, gitmem)
 *           mis (yorulmuşum) · must (gitmeliyim) · state (yorgunum, evdeyim)
 * "{x} mı" kalıbı sadece past'ta kullanılır ("gittin mi" doğru, "gidiyorsun mu" yanlış).
 */
window.Amor = window.Amor || {};

Amor.REFLECT_LINES = {
  past_any: [
    '{x} demek', '{x} mı? nasıldı peki', 'aa {x} mı, anlat bakalım', '{x} ha, güzel',
    'demek {x}, sonra ne yaptın?', 'oo {x} mı', '{x} yani, hmm ilginç', '{x} mı? hiç beklemezdim'
  ],
  past_good: [
    '{x} demek, ne güzel!', '{x} mı? buna çok sevindim', 'vay {x} ha, helal olsun',
    '{x} yani, harikaa', 'oh be {x} demek, süpermiş', '{x} mı? gurur duydum seninle'
  ],
  past_bad: [
    '{x} mı? çok üzüldüm', 'of {x} demek… geçmiş olsun', '{x} ha, canın sıkılmıştır',
    'ayy {x} mı, kötü olmuş', '{x} demek… iyi misin şimdi?', '{x} mı? gel sarılayım'
  ],
  prog_any: [
    '{x} demek', 'şu an {x} yani', '{x} ha, keyfini çıkar', 'hmm {x} demek, güzel', '{x} yani, anladım'
  ],
  prog_good: ['{x} demek, ne güzel', 'oo {x} ha, bayıldım', '{x} yani, iyi yapıyorsun'],
  prog_bad: ['{x} demek… neden ki?', 'of {x} ha, geçer inşallah', '{x} yani… üzüldüm ya', '{x} demek, yapabileceğim bir şey var mı?'],
  fut_any: [
    '{x} demek, umarım güzel geçer', '{x} ha, sonra bana anlat ama', 'oo {x} yani',
    '{x} demek, ne zaman peki?', '{x} ha, heyecanlı mısın?'
  ],
  fut_good: ['{x} demek, çok güzel!', 'oo {x} ha, şimdiden sevindim', '{x} yani, bol şans 🍀'],
  fut_bad: ['{x} demek… korkma, halledersin', '{x} ha, inşallah iyi geçer', '{x} yani… yanındayım'],
  habit_any: ['{x} demek, not aldım', '{x} ha, bunu bilmiyordum', 'demek {x}, ilginç', '{x} yani, güzel'],
  neg_any: ['{x} demek, neden ki?', '{x} ha… anladım', 'neden {x} ki?', '{x} yani, hmm'],
  neg_bad: ['{x} demek… üzüldüm', '{x} ha, olsun boş ver', 'of {x} yani, bir dahakine'],
  mis_any: ['{x} ha', '{x} demek, nasıl oldu?', 'vay {x} yani'],
  mis_bad: ['{x} demek… geçmiş olsun', 'of {x} ha, dinlen biraz'],
  must_any: ['{x} demek, ne zaman?', '{x} ha, hadi bakalım', '{x} yani, kolay gelsin'],
  state_any: ['{x} demek', '{x} ha, tamam', '{x} yani, ne yapıyorsun peki?'],
  state_good: ['{x} demek, buna sevindim', 'oh {x} ha, hep öyle ol', '{x} yani, ne güzel'],
  state_bad: ['{x} demek… ne oldu?', '{x} ha, biraz dinlen istersen', 'ayy {x} yani, geçmiş olsun', '{x} demek, anlat bana']
};

// Durum sıfatları: "yorgunum" -> "yorgunsun"
Amor.REFLECT_STATES = {
  good: ['mutlu', 'harika', 'heyecanlı', 'heyecanli', 'rahat', 'huzurlu', 'enerjik', 'keyifli', 'tok', 'hazır', 'hazir', 'özgür', 'ozgur'],
  bad: ['yorgun', 'üzgün', 'uzgun', 'hasta', 'mutsuz', 'gergin', 'stresli', 'uykulu', 'aç', 'kötü', 'kotu', 'sinirli', 'yalnız', 'yalniz', 'bitkin', 'kırgın', 'kirgin', 'meşgul', 'mesgul', 'sıkkın', 'sikkin', 'bunalmış', 'dertli'],
  any: ['evde', 'işte', 'iste', 'okulda', 'yolda', 'dışarıda', 'disarida', 'dışarda', 'disarda', 'yatakta', 'kafede', 'derste', 'sınavda', 'otobüste', 'metroda', 'arabada', 'tatilde', 'nöbette', 'mutfakta', 'salonda', 'parkta', 'sahilde', 'markette', 'sporda']
};

// Ton kökleri: zamanın tonunu düzeltir ("yoruldum" kötü, "kazandım" iyi)
Amor.REFLECT_TONE = {
  bad: ['yorul', 'sıkıl', 'sikil', 'üzül', 'uzul', 'hastalan', 'kaybet', 'kırıl', 'kiril', 'ağla', 'agla', 'kavga', 'ayrıl', 'ayril',
    'bunal', 'sinirlen', 'kork', 'bık', 'bik', 'düş', 'dus', 'kalamad', 'uyuyamad', 'kaçır', 'kacir', 'ağrı', 'agri', 'üşü', 'usu', 'kız', 'kiz', 'bayıl', 'bayil', 'çakt', 'cakt', 'kaldım', 'kaldim'],
  good: ['kazan', 'başar', 'basar', 'sevin', 'eğlen', 'eglen', 'gül', 'gul', 'geçt', 'gect', 'kutla', 'tatile', 'terfi', 'mezun', 'hallett', 'bitirdi', 'bitird', 'dinlen', 'tanış', 'tanis']
};

// Şahıs çevirisi: "annemle" -> "annenle", "bana" -> "sana"
Amor.REFLECT_PRONOUNS = {
  ben: 'sen', bana: 'sana', beni: 'seni', benim: 'senin', bende: 'sende', benden: 'senden', benimle: 'seninle',
  biz: 'siz', bize: 'size', bizi: 'sizi', bizim: 'sizin', bizde: 'sizde', bizden: 'sizden', bizimle: 'sizinle',
  kendim: 'kendin', kendime: 'kendine', kendimi: 'kendini', kendimle: 'kendinle'
};
// İyelik eki çevrilecek isimler (kökler): annem, arkadaşımla, evimde, başım...
Amor.REFLECT_OWNED = [
  'anne', 'baba', 'kardeş', 'kardes', 'abla', 'abi', 'ağabey', 'arkadaş', 'arkadas', 'kanka', 'sevgili', 'eş', 'kız', 'kiz', 'oğl', 'ogl',
  'kedi', 'köpeğ', 'kopeg', 'köpek', 'kopek', 'ev', 'oda', 'iş', 'okul', 'ders', 'hoca', 'patron', 'müdür', 'mudur', 'telefon', 'araba',
  'aile', 'teyze', 'dayı', 'dayi', 'amca', 'hala', 'kuzen', 'dede', 'nine', 'babaanne', 'anneanne', 'ekip', 'takım', 'takim', 'sınıf', 'sinif',
  'komşu', 'komsu', 'saç', 'sac', 'kafa', 'karn', 'baş', 'bas', 'mide', 'diş', 'dis', 'ayağ', 'ayag', 'kol', 'sırt', 'sirt', 'boğaz', 'bogaz',
  'boyn', 'gün', 'gun', 'hafta', 'sınav', 'sinav', 'proje', 'ödev', 'odev', 'oyun', 'çanta', 'canta', 'bilgisayar', 'kahve', 'yemeğ', 'yemeg'
];

// Yansıtılmayacak fiiller ("anladım" -> "anladın demek" tuhaf durur)
Amor.REFLECT_SKIP = [
  'anladım', 'anladim', 'bilmiyorum', 'bilmiyom', 'bilmem', 'sanırım', 'sanirim', 'diyorum', 'dedim', 'derim', 'tamam', 'hamam', 'imam',
  'yardım', 'yardim', 'adım', 'adim', 'kadim', 'karım', 'karim', 'birim', 'yorum', 'seviyorum', 'özledim', 'ozledim', 'buradayım',
  'buradayim', 'burdayım', 'burdayim'
];
// Tek başına yazılınca yansıtılmaz ("gidiyorum" = vedalaşma), cümle içinde olur ("okula gidiyorum")
Amor.REFLECT_ALONE = ['geldim', 'gittim', 'gidiyorum', 'gidiyom', 'kaçtım', 'kactim', 'çıkıyorum', 'cikiyorum', 'uyuyorum', 'yatıyorum', 'yatiyorum'];
// Hitap ve dolgu kelimeleri: yansıtılan cümleye alınmaz
Amor.REFLECT_DROP = [
  'aşkım', 'askim', 'canım', 'canim', 'cnm', 'sevgilim', 'bebeğim', 'bebegim', 'tatlım', 'tatlim', 'güzelim', 'guzelim', 'hayatım', 'hayatim',
  'bitanem', 'birtanem', 'prensesim', 'hocam', 'dostum', 'kankam', 'ya', 'yaa', 'şey', 'sey', 'valla', 'vallahi', 'abi', 'işte', 'iste', 'hmm', 'of', 'ay', 'ayy', 'aa',
  'ben', 'biz', 'be', 'lan', 'ha', 'ki', 'yani', 'bak', 'hani', 'aslında', 'aslinda', 'neyse'
];
