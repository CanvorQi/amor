/*
 * Amor - Kalıcı veri (localStorage)
 * Sunucu yok: her şey kullanıcının tarayıcısında saklanır.
 *
 * Hesaplar: "amor:accounts" = { list: [{ id, username, pin, created }], current }
 * Her hesabın verisi ayrı anahtarda: "amor:v2:<id>". Hesap yoksa (ilk açılış) state boş durur
 * ve uygulama hesap oluşturma ekranını gösterir. Hesaplardan önceki eski veri ("amor:v2")
 * ilk oluşturulan hesaba aktarılır.
 */
window.Amor = window.Amor || {};

Amor.Store = (() => {
  const LEGACY = 'amor:v2', ACC = 'amor:accounts';
  const defaults = () => ({
    user: { name: '', age: '', city: '' },
    characters: [], // oluşturulan karakterlerin kimlikleri (generator.js)
    moods: {},     // karakter id -> { values, updatedAt, locked, cause, source }
    moodLog: {},   // karakter id -> [{ ts, source, label, after, cause }]
    chats: {},     // karakter id -> [{ from: 'me' | 'her', text, ts }]
    affinity: {},  // karakter id -> yakınlık puanı
    unread: {},    // karakter id -> okunmamış sayısı
    follows: {},   // karakter id -> true
    recent: {},    // karakter id -> son kullanılan kalıplar (tekrar etmesin)
    expect: {},    // karakter id -> beklenen cevap türü ('name' | 'age' | 'city')
    pending: {}    // karakter id -> çevrimdışıyken gelen mesaj var mı
  });

  const read = k => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* gizli sekme vb. */ } };
  const drop = k => { try { localStorage.removeItem(k); } catch (e) { /* yok say */ } };

  let accs = read(ACC) || { list: [], current: null };
  let key = null;
  let state = defaults();

  function open(id) {
    key = LEGACY + ':' + id;
    state = Object.assign(defaults(), read(key) || {});
  }
  if (accs.current && accs.list.some(a => a.id === accs.current)) open(accs.current);
  else accs.current = null;

  function save() {
    if (key) write(key, state);
  }

  // Bu hesabın verisini sıfırla (profil bilgileri kalır)
  function reset() {
    const user = state.user;
    state = defaults();
    state.user = user;
    save();
  }

  /* ---------- Hesaplar ---------- */
  // PIN düz metin saklanmasın diye basit bir özet (gerçek güvenlik değil: veri zaten bu cihazda)
  const hash = s => { let h = 5381; for (const ch of 'amor:' + s) h = ((h << 5) + h + ch.charCodeAt(0)) >>> 0; return h.toString(36); };
  const norm = u => String(u || '').trim().toLocaleLowerCase('tr');

  const accounts = () => accs.list.map(a => ({ id: a.id, username: a.username, created: a.created, hasPin: !!a.pin, user: (read(LEGACY + ':' + a.id) || {}).user || {} }));
  const account = () => accs.list.find(a => a.id === accs.current) || null;
  const hasLegacy = () => !!read(LEGACY);

  // { username, name, age, city, pin } -> { ok, error }
  function register(f) {
    const username = norm(f.username);
    if (!/^[a-z0-9._çğıöşü]{3,20}$/.test(username)) return { ok: false, error: 'Kullanıcı adı 3-20 karakter olmalı (harf, rakam, nokta, alt çizgi).' };
    if (accs.list.some(a => a.username === username)) return { ok: false, error: 'Bu kullanıcı adı bu cihazda zaten var.' };
    if (!String(f.name || '').trim()) return { ok: false, error: 'Adını yazmalısın.' };
    const age = Number(f.age);
    if (!Number.isInteger(age) || age < 18 || age > 99) return { ok: false, error: 'Yaş 18-99 arasında olmalı.' };
    if (f.pin && !/^\d{4}$/.test(f.pin)) return { ok: false, error: 'PIN 4 haneli olmalı (ya da boş bırak).' };
    const id = 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    accs.list.push({ id, username, pin: f.pin ? hash(f.pin) : null, created: Date.now() });
    accs.current = id;
    write(ACC, accs);
    // Hesaplardan önceki veri ilk hesaba geçer
    const legacy = accs.list.length === 1 ? read(LEGACY) : null;
    if (legacy) { write(LEGACY + ':' + id, legacy); drop(LEGACY); }
    open(id);
    state.user = { ...state.user, name: String(f.name).trim(), age: String(age), city: String(f.city || '').trim() };
    save();
    return { ok: true, adopted: !!legacy };
  }

  function login(id, pin) {
    const a = accs.list.find(x => x.id === id);
    if (!a) return { ok: false, error: 'Hesap bulunamadı.' };
    if (a.pin && hash(pin || '') !== a.pin) return { ok: false, error: 'PIN yanlış.' };
    accs.current = id;
    write(ACC, accs);
    open(id);
    return { ok: true };
  }

  function logout() {
    save();
    accs.current = null;
    write(ACC, accs);
    key = null;
    state = defaults();
  }

  function setPin(pin) {
    const a = account();
    if (!a) return false;
    if (pin && !/^\d{4}$/.test(pin)) return false;
    a.pin = pin ? hash(pin) : null;
    write(ACC, accs);
    return true;
  }

  function removeAccount(id) {
    accs.list = accs.list.filter(a => a.id !== id);
    drop(LEGACY + ':' + id);
    if (accs.current === id) { accs.current = null; key = null; state = defaults(); }
    write(ACC, accs);
  }

  return {
    get state() { return state; },
    save,
    reset,
    accounts, account, hasLegacy, register, login, logout, setPin, removeAccount
  };
})();
