/*
 * Amor - Soru bankası
 * -------------------
 * Karakterin sorduğu her sorunun beklenen cevapları ve tepkileri.
 * m: cevapta aranan kelimeler (sadeleştirilmiş: ç->c, ş->s, ı->i ...; kelime başı eşleşir)
 * r: tepki cümleleri       any: hiçbir kalıp tutmazsa
 * capture: cevabın kendisi {x} olarak cümleye girer ("en sevdiğin şarkı ne?" -> "Tarkan mı?")
 */
window.Amor = window.Amor || {};

Amor.QUESTIONS = {
  bugun_ne: {
    answers: [
      { m: ['hic', 'bos', 'evde', 'yatiyorum', 'takiliyorum'], r: ['tembellik günü yani {laugh}', 'bazen hiçbir şey yapmamak da lazım'] },
      { m: ['is', 'calis', 'ders', 'okul', 'mesai'], r: ['kolay gelsin 💪', 'çalışkan birisin bakıyorum'] }
    ],
    any: ['güzel, keyifli gibi', 'hmm iyiymiş']
  },
  kedi_kopek: {
    answers: [
      { m: ['kedi'], r: ['kedi insanı! anlaşacağız 🐈', 'kedici misin? süper'] },
      { m: ['kopek'], r: ['köpek mi?? anlaşamayız {laugh}|şaka şaka', 'köpekler de tatlı ama bilmiyorum…'] },
      { m: ['ikisi', 'her ikisi'], r: ['diplomatik cevap {laugh}'] },
      { m: ['hicbiri', 'sevmem', 'sevmiyorum'], r: ['hiçbiri mi? kalpsiz 😅'] }
    ],
    any: ['hmm ilginç cevap {laugh}']
  },
  sarki: { capture: true, any: ['{x} mı? hemen dinleyeceğim 🎧', '{x}, zevkli birisin', '{x} ha, not ettim'] },
  kahve_cay: {
    answers: [
      { m: ['kahve'], r: ['kahveci! aynen öyle ☕'] },
      { m: ['cay'], r: ['çaycı mısın? demli mi açık mı?', 'çay da güzel ama kahve > çay {laugh}'] },
      { m: ['ikisi'], r: ['ikisi de olur değil mi {laugh}'] }
    ],
    any: ['hmm']
  },
  hafta_sonu: {
    answers: [
      { m: ['evde', 'hic', 'yattim', 'uyudum', 'dinlendim'], r: ['evde takılmak da güzel bazen', 'dinlenmişsin bari'] },
      { m: ['gezd', 'disari', 'arkadas', 'sinema', 'deniz', 'yemek'], r: ['güzelmiş, keyifli geçmiş', 'kıskandım şu an {laugh}'] },
      { m: ['calistim', 'is', 'ders'], r: ['hafta sonu da mı çalışılır ya 🥺'] }
    ],
    any: ['güzel', 'keyifli geçmiş']
  },
  is_ne: { capture: true, any: ['{x}. İlginç.', '{x}. Zor mu?'] },
  kitap_son: {
    capture: true,
    answers: [{ m: ['okumam', 'okumuyorum', 'hic', 'hatirlamiyorum'], r: ['Hiç mi? Hm.', 'Başlamak için geç değil.'] }],
    any: ['{x}. Fena seçim değil.', '{x}. Not ettim.']
  },
  kalabalik: {
    answers: [
      { m: ['kalabalik'], r: ['Kalabalık. Anlaşamayabiliriz.', 'Enerjin yüksek demek.'] },
      { m: ['sessiz'], r: ['Doğru cevap.', 'Sessizlik. İyi.'] }
    ],
    any: ['Hm. Kararsızsın.']
  },
  kitap: {
    answers: [
      { m: ['evet', 'okurum', 'severim', 'okuyorum', 'tabi'], r: ['ne güzel... en sevdiğin kitap ne? ☺️', 'ah çok sevindim 📚'] },
      { m: ['hayir', 'okumam', 'pek', 'yok'], r: ['olsun... belki bir gün ☺️', 'ben sana bir tane öneririm o zaman'] }
    ],
    any: ['hmm ☺️']
  },
  mevsim: {
    answers: [
      { m: ['kis'], r: ['kış... kar yağarken çay içmek ☺️'] },
      { m: ['yaz'], r: ['yaz mı... ben sıcağı pek sevmem ama 🙈'] },
      { m: ['sonbahar'], r: ['sonbahar!! benim de en sevdiğim 🍂'] },
      { m: ['ilkbahar', 'bahar'], r: ['bahar çiçekleri ☺️ güzel seçim'] }
    ],
    any: ['hmm güzel...']
  },
  yagmur: {
    answers: [
      { m: ['evet', 'severim', 'bayilirim', 'tabi'], r: ['yaa ☺️ yağmurda yürümek gibisi yok'] },
      { m: ['hayir', 'sevmem', 'nefret'], r: ['olsun... ben ikimiz için severim 🌧️'] }
    ],
    any: ['hmm...']
  },
  dans: {
    answers: [
      { m: ['evet', 'bilirim', 'tabi', 'iyiyim'], r: ['o zaman bir gün göster 💃', 'iddialı 😏 görürüz'] },
      { m: ['hayir', 'bilmem', 'yok', 'beceremem'], r: ['ben öğretirim 😏', 'olsun, ben iki kişilik dans ederim 💃'] }
    ],
    any: ['hmm 😏']
  },
  muzik: { capture: true, any: ['{x} ha 😏 fena değil', '{x}, zevkine güvendim'] },
  gece_kusu: {
    answers: [
      { m: ['evet', 'tabi', 'aynen', 'kesinlikle'], r: ['bizden biri 🌙', 'o zaman gece konuşuruz 😏'] },
      { m: ['hayir', 'erken', 'yok'], r: ['erken yatan biri ha 😴', 'tamam dede {laugh}'] }
    ],
    any: ['hmm']
  },
  bu_aksam: {
    answers: [{ m: ['hic', 'evde', 'bir sey yok', 'plan yok'], r: ['boşsun yani 😏', 'evde mi? sıkıcıı'] }],
    any: ['güzel plan 😏', 'hmm kıskandım']
  },
  film: {
    capture: true,
    answers: [{ m: ['aglamam', 'hic', 'aglamadim'], r: ['HİÇ Mİ 😭 taş kalpli', 'inanmıyorum 😭'] }],
    any: ['{x} 😭 ben de ağlamıştım', 'ayy {x} 💔 o film bir başka']
  },
  tiyatro: {
    answers: [
      { m: ['evet', 'giderim', 'severim'], r: ['ayy süper 🎭 birlikte gideriz!', 'EVET 😭 sanat ruhlu biri'] },
      { m: ['hayir', 'gitmem', 'pek', 'yok'], r: ['seni bir oyuna götürmem lazım 🎭', 'olmaz öyle 😭'] }
    ],
    any: ['hmm 🎭']
  },
  hayal: { capture: true, any: ['{x}... çok güzel bir hayal ✨', 'umarım gerçek olur 😭💕'] },
  mutlu: { capture: true, any: ['{x}. Güzel bir cevap 🙂', '{x}... Bunu duymak güzel.'] },
  kendin_icin: {
    answers: [{ m: ['hic', 'yok', 'vakit', 'zaman'], r: ['Bugün kendine biraz vakit ayır bence 🌿'] }],
    any: ['Güzel, bunu yapmaya devam et 🙂', 'Kendine iyi bakman önemli 🌿']
  },
  deniz_dag: {
    answers: [
      { m: ['deniz'], r: ['Deniz 🌊 Aynı fikirdeyiz.'] },
      { m: ['dag'], r: ['Dağ... Sakinliği seviyorsun demek 🙂'] }
    ],
    any: ['İkisinin de ayrı güzelliği var 🙂']
  },
  tatli_tuzlu: {
    answers: [
      { m: ['tatli'], r: ['tatlıcı! anlaşırız 🍰', 'tatlı mı? sen de tatlısın zaten 🙈'] },
      { m: ['tuzlu'], r: ['tuzlu mu? cips gecesi yaparız o zaman {laugh}', 'ben tatlıyım sen tuzlu, dengeliyiz 😄'] },
      { m: ['ikisi'], r: ['açgözlü {laugh}'] }
    ],
    any: ['hmm not ettim']
  },
  ilk_bulusma: {
    capture: true,
    answers: [
      { m: ['kahve', 'kafe'], r: ['kahve klasik ama ben bayılırım ☕💕', 'kahve mi? tamam ama tatlıyı sen ısmarlarsın {laugh}'] },
      { m: ['yemek', 'restoran', 'aksam yemegi'], r: ['akşam yemeği mi? çok romantik 🕯️', 'iyi bir yemek kalbe giden yol 😏'] },
      { m: ['sinema', 'film'], r: ['sinema mı? patlamış mısır benden 🍿', 'karanlık salon... akıllısın 😏'] },
      { m: ['deniz', 'sahil', 'yuruyus', 'park'], r: ['sahilde yürüyüş... gün batımında olsun ama 🌅', 'çok romantik 🥺 kabul'] },
      { m: ['konser', 'dans'], r: ['konser!! anlaştık 🎶', 'dans mı? cesur seçim 💃'] }
    ],
    any: ['{x} mı? hmm puan verdim 😄', '{x}... ilginç seçim, sevdim 💕']
  },
  sabah_gece: {
    answers: [
      { m: ['sabah', 'erken'], r: ['Sabah insanı. Disiplinli demek 🙂', 'Sabah kahvesi senden o zaman.'] },
      { m: ['gece', 'gec'], r: ['Gece. Benim saatim de o.', 'Gece kuşu. Anlaşırız.'] },
      { m: ['ikisi', 'farketmez', 'fark etmez'], r: ['Uyumlu birisin demek.'] }
    ],
    any: ['Hm. Not ettim.']
  },
  ciddi: {
    answers: [
      { m: ['ciddi', 'iliski', 'evlilik', 'uzun sure', 'gercek'], r: ['Doğru cevap 🖤', 'Güzel. Ben de vakit kaybetmeyi sevmem.'] },
      { m: ['vakit', 'eglen', 'takil', 'bakalim', 'bilmiyorum'], r: ['Dürüstsün en azından.', 'Hm. Göreceğiz.'] }
    ],
    any: ['Hm. Anladım.']
  },
  romantik: {
    answers: [
      { m: ['evet', 'inanirim', 'var', 'tabi', 'kesinlikle'], r: ['ben de inanıyorum... 🥺', 'romantik birisin... sevdim 💕'] },
      { m: ['hayir', 'yok', 'inanmam', 'saçma', 'sacma'], r: ['olsun... belki fikrini değiştiririm 🙈', 'hiç mi? 🥺 kalbimi kırdın biraz'] }
    ],
    any: ['hmm... güzel düşünce ☺️']
  },
  mektup: {
    answers: [
      { m: ['evet', 'yazdim', 'yazmistim'], r: ['ne kadar romantik... kime yazmıştın? 🙈', 'bunu duymak çok güzel 💌'] },
      { m: ['hayir', 'yok', 'hic'], r: ['belki ilk mektubunu bana yazarsın... 🙈', 'olsun, ben sana yazarım ☺️'] }
    ],
    any: ['hmm... 💌']
  },
  kiskanc: {
    answers: [
      { m: ['evet', 'biraz', 'cok', 'tabi'], r: ['kıskançlık biraz tatlıdır ama dozunda 😏', 'iyi, beni kıskan biraz 😏💋'] },
      { m: ['hayir', 'degilim', 'yok', 'asla'], r: ['hiç mi? emin misin 😏', 'güven veren adam, sevdim 🔥'] }
    ],
    any: ['hmm göreceğiz 😏']
  },
  en_romantik: {
    capture: true,
    answers: [{ m: ['hic', 'yok', 'hatirlamiyorum', 'yapmadim'], r: ['HİÇ Mİ 😭 o zaman ilkini bana yaparsın', 'bunu değiştirmemiz lazım 😭💕'] }],
    any: ['{x}?? 😭 çok romantik', 'kalbim eridi 😭 {x}...']
  },
  iliski: {
    capture: true,
    answers: [
      { m: ['guven', 'saygi', 'durust', 'sadakat'], r: ['Güven ve saygı... Aynı şeyleri önemsiyoruz 🙂', 'Çok doğru. Gerisi zaten gelir 🌿'] },
      { m: ['eglen', 'kafa', 'rahat'], r: ['Rahat ve keyifli. Güzel 🙂'] },
      { m: ['ciddi', 'evlilik', 'uzun'], r: ['Ciddi ve uzun soluklu... Ben de öyle düşünüyorum 🤍'] }
    ],
    any: ['{x}. Güzel bir cevap 🙂']
  },

  // Hafızadaki bir olayı sorduktan sonra ("sınavın nasıl geçti?")
  event_followup: {
    answers: [
      { m: ['iyi', 'guzel', 'harika', 'super', 'gecti', 'basardim', 'kazandim', 'mukemmel', 'fena degil'], r: ['oh süper, çok sevindim 🥰', 'harika! biliyordum zaten'] },
      { m: ['kotu', 'berbat', 'kaldim', 'olmadi', 'kaybettim', 'rezalet', 'gecmedi'], r: ['üzüldüm 🥺|bir dahakine olacak', 'olsun, önemli olan denemek'] }
    ],
    any: ['anladım, umarım iyi geçmiştir']
  }
};
