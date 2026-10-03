# Amor 💜

Kalıp tabanlı, ruh hali olan sanal profillerle sohbet uygulaması. Saf HTML + CSS + JS; derleme ya da sunucu gerekmez, GitHub Pages'te doğrudan çalışır.

## Çalıştırma

- **Yerelde:** `index.html` dosyasını tarayıcıda aç.
- **GitHub Pages:** Depoyu GitHub'a gönder → *Settings → Pages → Branch: `main` / root* → kaydet.

## Klasör yapısı

```
index.html              uygulama iskeleti + alt menü
css/style.css           mobil öncelikli tasarım
characters/<set>/photos fotoğraf setleri (her karakter bir set kullanır)
tools/build-photos.ps1  fotoğraf listesini (js/data/photos.js) üretir
js/store.js             localStorage ile kalıcı veri
js/data/photos.js       fotoğraf setleri listesi (otomatik üretilir)
js/data/pools.js        isim, şehir, meslek, burç havuzları
js/data/archetypes.js   kişilikler: Big Five, yazım tarzı, kalıp cümleler
js/data/intents.js      niyet kalıpları, ortak cümleler, hazır cevaplar
js/generator.js         karakter oluşturucu (set + isim + kişilik → profil)
js/mood.js              ruh hali motoru (valence × arousal + enerji + sosyal pil)
js/engine.js            cevap motoru (niyet → ruh hali → kalıp → yazım tarzı)
js/app.js               ekranlar ve sohbet akışı
```

## Karakter oluşturma

Bir karakter = **fotoğraf seti** + **isim havuzundan isim** + **kişilik**. Geri kalan her şey bunlara uygun üretilir:

- İsmin dönemi yaşı belirler (trend 18-25, modern 21-32, klasik 27-42, olgun 38-50).
- Kişilik ve yaş mesleği belirler (ör. flörtöz → DJ, model; soğuk → mimar, akademisyen). Her mesleğin yaş aralığı var (`min` / `max`); genç yaşta öğrenci meslekleri öne çıkar.
- Yakınlık Lv.3'e çıkınca karakterler `_close` cümlelerine geçer (daha sıcak, romantik) ve arada `sweet` cümleleri ekler.
- Şehir, semt, sevdikleri, bio ve "Anlar" paylaşımları kişiliğin havuzundan seçilir.
- Profil fotoğrafı setteki `profile` adlı dosya (yoksa ilki), kapak ve albüm diğer fotoğraflardır.

İlk açılışta 8 karakter otomatik oluşur. Ana sayfadaki **Karakter oluştur** ile yenisi eklenir; her alan elle seçilebilir ya da 🎲 ile rastgele çekilir.

**Yeni fotoğraf seti eklemek:** `characters/<klasör>/` (ya da `characters/<klasör>/photos/`) içine fotoğrafları koy, sonra:

```
powershell -ExecutionPolicy Bypass -File tools/build-photos.ps1
```

## Nasıl çalışır?

1. Mesaj sadeleştirilir (`Selaaam!` → `selam`) ve `intents.js` içindeki kalıplarla **niyeti** bulunur.
2. Niyet ruh halini ve **yakınlık seviyesini** biraz değiştirir (iltifat +, hakaret −). Her mesaj **sosyal pili** azaltır.
3. Ruh haline göre havuz seçilir: normal (`lines`), gergin (`mood.neg`), üzgün (`mood.sad`), yorgun (`mood.low`).
4. Karakterin tarzı uygulanır: küçük harf oranı, harf uzatma (`canımmm`), emoji, gülme şekli, hitap.
5. Cevap balonlara bölünür; yazma süresi ruh haline göre hesaplanır.

Ruh hali zamanla kişiliğe bağlı "normal" haline döner (nevrotiklik yüksekse daha yavaş). **Ruh Hali** sekmesinden her karakter için valence × arousal düzleminde ayarlanabilir, kilitlenebilir ve gizli bir sebep verilebilir.

## Gerçekçilik

- **Günlük program** (`js/schedule.js`): her mesleğin uyku ve meşgul saatleri var. Uyurken çevrimdışıdır, uyanınca "günaydın, yeni uyandım" diye döner. Derste/nöbette/sette geç ve kısa cevap verir. Enerji saate göre değişir.
- **Hafıza** (`js/memory.js`): "İzmirliyim", "25 yaşındayım", "mühendisim", "kedim var", "kahve severim", "yarın sınavım var" gibi bilgileri o karakter saklar, tepki verir, sonra hatırlar ("dün sınavın vardı, nasıl geçti?"). "Beni hatırlıyor musun?" diye sorabilirsin. Sohbette ⋮ → **Hakkımda bildikleri**.
- **Soru-cevap** (`js/data/questions.js`): karakterin sorduğu her soruya beklenen cevaplar ve tepkiler.
- **İlgi** (`js/interest.js`): kuru cevaplar, tekrar ve erken buluşma isteği ilgiyi düşürür; ilgi azalınca cevaplar gecikir, kısalır ve "Görüldü"de bırakılabilirsin.

## Telefona yükleme (PWA)

GitHub Pages'te açınca tarayıcı "Ana ekrana ekle" önerir (Ben sayfasında da buton var; iPhone'da Safari → Paylaş → Ana Ekrana Ekle). Uygulama internetsiz de açılır.
Yeni sürüm yayınlarken `sw.js` içindeki `VERSION` değerini artır (`amor-v2` gibi), yoksa telefonlar eski sürümü önbellekten göstermeye devam eder. İkonları yeniden üretmek için: `powershell -ExecutionPolicy Bypass -File tools/build-icons.ps1`.

## Coin, hediye ve ödüller (tamamen sanal)

Gerçek para yoktur. Yükleme ekranındaki ₺ fiyatlar sadece görünüm içindir; "Onayla (demo)" bakiyeye coin ekler.

- **Hediye:** Sohbette 🎁 → hediye / Dostluk / Şanslı / Çanta. Değeri ve kişiliğe göre ruh halini ve yakınlığı artırır (flörtöz çok, soğuk az etkilenir). Dostluk hediyeleri ilişki rozeti (CP, Kanka…) kurar, şanslı hediyelerden rastgele bir hediye çıkar.
- **Ödüller:** 7 günlük giriş serisi, günlük görevler, başarımlar.
- **Yükleme Yıldızı:** aylık yükleme hedefleri ve ödülleri.
- **VIP:** toplam yüklemeye göre VIP1–6; rozet, renkli isim, günlük bonus, ziyaretçilerin tamamı, hediye indirimi.
- **Mağaza:** 7 günlük avatar çerçeveleri ve sohbet arka planları.
- **Oyunlar** (`js/games.js`): Şans Çarkı (günde 1 ücretsiz), Blackjack (krupiye 17'de durur, blackjack 3:2) ve 3 makaralı Slot. Bahisler sanal coin ile.

## Sohbet sabitleme

Mesaj listesinde bir sohbete basılı tut (masaüstünde sağ tık) → **En üste sabitle**. En fazla 4 sohbet sabitlenir; sohbet içindeki ⋮ menüsünden de yapılabilir.

## Karakter sayısı

İlk açılışta 50 karakter oluşur (kişilikler eşit dağılır). Fotoğraf seti sayısı 50'den azsa en az kullanılan setler tekrar kullanılır. Sayıyı `js/generator.js` içindeki `SEED_TARGET` belirler; değiştirince `SEED_VERSION`'ı da bir artır ki mevcut kullanıcılarda tamamlansın.

Veriler: `js/data/shop.js` (katalog), mantık: `js/wallet.js`, ekranlar: `js/shop.js`.

## Yeni kişilik eklemek

`js/data/archetypes.js` içindeki bir kişiliği kopyalayıp `id`, `big5`, `style`, `lines` alanlarını değiştir; `pools.js` içindeki mesleklerin `arch` listesine yeni `id`'yi ekle.
