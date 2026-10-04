/*
 * Amor - Sesli ve görüntülü arama
 * -------------------------------
 * Arama ekranı (çalıyor → bağlandı → kapandı), açıp açmama kararı, konuşma ve arama geçmişi.
 * Karakterin cümleleri sohbetteki kalıp motorundan (Engine.respond) gelir ve tarayıcının
 * Türkçe sesiyle okunur. Sen mikrofona konuşursun (destekleyen tarayıcılarda) ya da yazarsın.
 * Görüntülü aramada karşı taraf fotoğrafıdır; senin kameran küçük pencerede açılır.
 */
window.Amor = window.Amor || {};

Amor.Call = (() => {
  const A = window.Amor;
  const S = () => A.Store.state;
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const rnd = a => a[Math.floor(Math.random() * a.length)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mmss = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const TYPES = { voice: { name: 'Sesli arama', icon: '📞' }, video: { name: 'Görüntülü arama', icon: '📹' } };
  // Aramayı açması için gereken yakınlık seviyesi
  const MIN_LV = { voice: 2, video: 3 };
  const STATUS = {
    out: { missed: 'Karşı taraf cevap vermedi', declined: 'Reddedildi', cancelled: 'İptal edildi' },
    in: { missed: 'Cevapsız', rejected: 'Reddettin' }
  };

  const LINES = {
    hello: ['Alooo 😊', 'Efendim?', 'Selaam, sesini duymak güzelmiş', "Alo, n'aber?", 'Hıı aradın demek 🙈'],
    helloVideo: ['Selaam 👋 beni görebiliyor musun?', 'Aaa görüntülü 🙈 dur saçımı düzelteyim', 'Hey, kamera açıldı mı?'],
    helloIn: ['Selaam, canım sıkıldı seni aramak istedim 🙈', 'Alo, rahatsız etmedim değil mi?', 'Sesini duymak istedim 😊'],
    idle: ['Alo? Orada mısın?', 'Sesin gelmiyor galiba…', 'Hıı? Bir şey mi dedin?', 'Sessiz kaldın 😅'],
    hangupIdle: ['Sanırım hat koptu, kapatıyorum', 'Neyse sonra konuşuruz 👋'],
    tired: ['Ya çok yoruldum, kapatayım mı? Sonra yazarım 💗', 'Şarjım bitti resmen, sonra konuşalım'],
    declineLow: ['Henüz sesli konuşacak kadar tanımıyoruz bence 🙈 biraz yazışalım', 'Aramayı açmadım kusura bakma, önce biraz yazışalım'],
    declineVideo: ['Görüntülü için henüz erken bence 🙈', 'Kamera açacak durumda değilim şu an, sesli olur belki?'],
    declineBusy: st => [`Şu an ${st.say || 'müsait değilim'}, sonra konuşalım`, `Açamadım, ${st.status || 'meşgulüm'} 🙈`],
    declineMood: ['Şu an konuşacak modda değilim, yazışalım mı?', 'Kusura bakma, telefonla konuşasım yok şimdi'],
    missedIn: ['Aradım açmadın 🥺', 'Seni aradım ama meşguldün galiba'],
    rejected: ['Neden açmadın? 🥺', 'Tamam, müsait değilsen sonra konuşuruz']
  };

  const svg = p => `<svg viewBox="0 0 24 24">${p}</svg>`;
  const PHONE = 'M5 4h3.5l1.5 4.5-2.2 1.4a11 11 0 0 0 6.3 6.3l1.4-2.2L20 15.5V19a2 2 0 0 1-2.2 2A17 17 0 0 1 3 6.2 2 2 0 0 1 5 4z';
  const ICON = {
    phone: svg(`<path d="${PHONE}"/>`),
    video: svg('<rect x="2.5" y="6" width="12.5" height="12" rx="3"/><path d="M15 10.5 21 7v10l-6-3.5z"/>'),
    mic: svg('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
    speaker: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>'),
    speakerOff: svg('<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 9.5l5 5M22 9.5l-5 5"/>'),
    camOff: svg('<rect x="2.5" y="6" width="12.5" height="12" rx="3"/><path d="M15 10.5 21 7v10l-6-3.5zM3 3l18 18"/>'),
    send: svg('<path d="M4 12 20 4l-4 16-4-7z"/>')
  };

  let cur = null; // aktif arama

  /* ---------- Sesler ---------- */
  let actx = null;
  function beep(f, dur, delay = 0, vol = 0.12) {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = f;
      g.gain.value = 0;
      o.connect(g).connect(actx.destination);
      const t = actx.currentTime + delay;
      g.gain.setTargetAtTime(vol, t, 0.01);
      g.gain.setTargetAtTime(0, t + dur, 0.02);
      o.start(t);
      o.stop(t + dur + 0.3);
    } catch (e) { /* ses yoksa sessiz devam */ }
  }
  // 'out': çalma sesi (425 Hz, 1 sn aç 4 sn kapa) · 'in': gelen arama melodisi
  function ring(kind) {
    let tm = null;
    const loop = () => {
      if (kind === 'out') { beep(425, 1); tm = setTimeout(loop, 4000); }
      else { [660, 880, 990, 880].forEach((f, i) => beep(f, 0.14, i * 0.17, 0.1)); tm = setTimeout(loop, 1800); }
    };
    loop();
    return () => clearTimeout(tm);
  }
  const endTone = () => [0, 0.35, 0.7].forEach(d => beep(425, 0.2, d, 0.08));

  /* ---------- Konuşma sentezi ---------- */
  const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/gu;
  const TTS = 'speechSynthesis' in window;
  let voice = null;
  function pickVoice() {
    const tr = speechSynthesis.getVoices().filter(v => /^tr/i.test(v.lang));
    voice = tr.find(v => /yelda|emel|filiz|seda|female|kad/i.test(v.name)) || tr[0] || null;
  }
  if (TTS) { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); }

  function speak(k, text) {
    return new Promise(res => {
      const clean = text.replace(EMOJI_RE, '').replace(/\s+/g, ' ').trim();
      const est = 700 + clean.length * 60;
      if (!clean || !k.speaker || !TTS) { setTimeout(res, Math.min(est, 5000)); return; }
      const u = new SpeechSynthesisUtterance(clean);
      u.lang = 'tr-TR';
      if (voice) u.voice = voice;
      u.pitch = k.pitch;
      u.rate = k.rate;
      let done = false;
      const fin = () => { if (!done) { done = true; clearTimeout(guard); res(); } };
      const guard = setTimeout(fin, est + 4000); // iOS bazen onend göndermez
      u.onend = fin;
      u.onerror = fin;
      speechSynthesis.speak(u);
    });
  }

  /* ---------- Ses tanıma ---------- */
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;

  function listen() {
    const k = cur;
    if (!k || k.phase !== 'live') return;
    if (k.rec) { k.rec.stop(); return; }
    if (!SR) {
      A.Eco.notify('Tarayıcın sesi tanıyamıyor, yazarak konuşabilirsin', '🎙️');
      k.el.querySelector('.call-input input').focus();
      return;
    }
    const rec = new SR();
    rec.lang = 'tr-TR';
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let text = '';
    rec.onresult = e => {
      text = [...e.results].map(r => r[0].transcript).join('');
      caption('me', text, true);
    };
    rec.onerror = e => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') A.Eco.notify('Mikrofon izni verilmedi', '🎙️');
    };
    rec.onend = () => {
      if (cur !== k) return;
      k.rec = null;
      drawCtrl();
      if (text.trim()) said(text.trim());
      else caption('me', '');
    };
    k.rec = rec;
    try { rec.start(); } catch (e) { k.rec = null; }
    caption('me', 'Dinliyorum…', true);
    drawCtrl();
  }

  /* ---------- Ekran ---------- */
  function open(c, type, dir) {
    const photo = type === 'video' ? rnd(c.album.length ? c.album : [c.photo]) : (c.photo || c.cover);
    const el = document.createElement('div');
    el.className = `call-screen ${type}`;
    el.innerHTML = `
      <div class="call-bg" style="background:linear-gradient(135deg,${c.colors[0]},${c.colors[1]})">${photo ? `<img src="${esc(photo)}" alt="">` : ''}</div>
      <div class="call-shade"></div>
      <div class="call-top"><span>${TYPES[type].icon} ${TYPES[type].name}</span></div>
      <div class="call-who">
        <div class="call-ava">${A.UI.avatar(c, type === 'video' ? 48 : 120, { dot: false })}</div>
        <div><b>${esc(c.display)}</b><small id="callState"></small></div>
      </div>
      ${type === 'video' ? `<div class="call-self">${A.UI.userAvatar(56)}<video autoplay playsinline muted></video></div>` : ''}
      <div class="call-cap"><p class="her"></p><p class="me"></p></div>
      <form class="call-input" autocomplete="off" hidden>
        <input type="text" placeholder="Bir şey söyle…" enterkeyhint="send" maxlength="200">
        <button type="submit" aria-label="Gönder">${ICON.send}</button>
      </form>
      <div class="call-ctrl"></div>`;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('open'));

    const E = A.Mood.current(c).values;
    cur = {
      c, type, dir, el, phase: 'ring', speaker: true, queue: [], busy: false, rec: null, stream: null, camOn: false,
      idle: 0, lastInput: Date.now(), minutes: 0, startAt: 0, timers: [],
      pitch: 1.1 + (c.big5.E || 0.5) * 0.2, rate: clamp(0.95 + (E.arousal || 0) * 0.12, 0.85, 1.12)
    };

    el.querySelector('.call-input').onsubmit = e => {
      e.preventDefault();
      const inp = e.target.querySelector('input');
      const t = inp.value.trim();
      if (!t) return;
      inp.value = '';
      said(t);
    };
    el.querySelector('.call-ctrl').onclick = e => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (a === 'end') hangup('me');
      if (a === 'accept') connect();
      if (a === 'reject') reject();
      if (a === 'mic') listen();
      if (a === 'speaker') toggleSpeaker();
      if (a === 'cam') toggleCam();
    };
    setState(dir === 'out' ? 'Aranıyor…' : `${TYPES[type].name} geliyor…`);
    drawCtrl();
  }

  const setState = t => { const s = cur && cur.el.querySelector('#callState'); if (s) s.textContent = t; };

  function caption(who, text, live = false) {
    const p = cur && cur.el.querySelector(`.call-cap .${who}`);
    if (!p) return;
    p.textContent = text;
    p.classList.toggle('live', live);
    p.classList.remove('pop');
    void p.offsetWidth;
    if (text) p.classList.add('pop');
  }

  function drawCtrl() {
    const k = cur;
    if (!k) return;
    const btn = (a, icon, label, cls = '') => `<button type="button" data-a="${a}" class="${cls}" aria-label="${label}">${icon}<small>${label}</small></button>`;
    let html;
    if (k.phase === 'ring' && k.dir === 'in') {
      html = btn('reject', ICON.phone, 'Reddet', 'end') + btn('accept', k.type === 'video' ? ICON.video : ICON.phone, 'Cevapla', 'accept');
    } else if (k.phase === 'ring') {
      html = btn('end', ICON.phone, 'İptal', 'end');
    } else {
      html = btn('mic', ICON.mic, k.rec ? 'Dinliyor' : 'Konuş', k.rec ? 'on' : '')
        + btn('speaker', k.speaker ? ICON.speaker : ICON.speakerOff, k.speaker ? 'Hoparlör' : 'Ses kapalı', k.speaker ? '' : 'off')
        + (k.type === 'video' ? btn('cam', k.camOn ? ICON.video : ICON.camOff, k.camOn ? 'Kamera' : 'Kamera kapalı', k.camOn ? '' : 'off') : '')
        + btn('end', ICON.phone, 'Kapat', 'end');
    }
    k.el.querySelector('.call-ctrl').innerHTML = html;
    k.el.querySelector('.call-input').hidden = k.phase !== 'live';
  }

  /* ---------- Açacak mı? ---------- */
  function decide(c, type) {
    const st = A.Schedule.status(c);
    const lv = A.Engine.level(c).lv;
    const t = (a, b) => a + Math.random() * (b - a);
    if (st.forced) return { accept: true, ring: t(2000, 3500) };
    if (!A.Mood.isOnline(c)) return { status: 'missed', ring: 22000 };
    if (st.state === 'busy') return { status: 'declined', ring: t(4000, 8000), text: rnd(LINES.declineBusy(st)) };
    if (lv < MIN_LV[type]) {
      return { status: 'declined', ring: t(3000, 6000), text: rnd(type === 'video' && lv >= MIN_LV.voice ? LINES.declineVideo : LINES.declineLow) };
    }
    const v = A.Mood.current(c).values;
    const p = clamp(0.3 + 0.45 * A.Interest.get(c) + 0.2 * v.valence + 0.06 * (lv - MIN_LV[type]), 0.1, 0.95);
    if (Math.random() < p) return { accept: true, ring: t(2500, 7000) };
    return Math.random() < 0.5 ? { status: 'declined', ring: t(3000, 8000), text: rnd(LINES.declineMood) } : { status: 'missed', ring: 22000 };
  }

  /* ---------- Akış ---------- */
  function start(c, type = 'voice') {
    if (cur || !c) return;
    open(c, type, 'out');
    // iOS: konuşma sentezi ilk kez bir dokunuşla başlamalı
    if (TTS) { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); }
    cur.stopRing = ring('out');
    const d = decide(c, type);
    later(d.ring, () => (d.accept ? connect() : fail(d)));
  }

  function incoming(c, type) {
    if (cur) return;
    open(c, type, 'in');
    cur.stopRing = ring('in');
    if (navigator.vibrate) navigator.vibrate([400, 200, 400]);
    later(25000, () => {
      const k = cur;
      log('missed');
      close();
      setTimeout(() => A.UI.pushHer(k.c, rnd(LINES.missedIn)), 2500);
    });
  }

  function later(ms, fn) { const k = cur; k.timers.push(setTimeout(() => { if (cur === k) fn(); }, ms)); }

  function fail(d) {
    const k = cur;
    k.stopRing();
    setState(d.status === 'missed' ? 'Cevap yok' : 'Reddedildi');
    endTone();
    log(d.status);
    later(1800, close);
    if (d.text) setTimeout(() => A.UI.pushHer(k.c, d.text), 3000);
  }

  function reject() {
    const k = cur;
    log('rejected');
    A.Mood.nudge(k.c, { valence: -0.03 });
    close();
    if (Math.random() < 0.6) setTimeout(() => A.UI.pushHer(k.c, rnd(LINES.rejected)), 4000);
  }

  async function connect() {
    const k = cur;
    k.stopRing();
    k.phase = 'live';
    k.startAt = Date.now();
    k.el.classList.add('live');
    setState('00:00');
    drawCtrl();
    if (k.type === 'video') startCam();
    k.tick = setInterval(() => tick(k), 1000);
    const name = S().user.name;
    const pool = k.dir === 'in' ? LINES.helloIn : k.type === 'video' ? LINES.helloVideo : LINES.hello;
    k.busy = true;
    await wait(600);
    await say(k, name && Math.random() < 0.4 ? `Alo ${name} 😊` : rnd(pool));
    k.busy = false;
    k.lastInput = Date.now();
    answer();
  }

  function tick(k) {
    if (cur !== k) { clearInterval(k.tick); return; }
    const sec = Math.floor((Date.now() - k.startAt) / 1000);
    setState(mmss(sec));
    // Her dakika: yakınlık artar, sosyal pil biraz azalır
    if (sec && sec % 60 === 0 && sec / 60 > k.minutes) {
      k.minutes = sec / 60;
      if (k.minutes <= 10) S().affinity[k.c.id] = (S().affinity[k.c.id] || 0) + 1;
      A.Mood.nudge(k.c, { social: -0.03 });
      A.Store.save();
      if (!A.Mood.isOnline(k.c) && !A.Schedule.status(k.c).forced && !k.busy) { leave(k, LINES.tired); return; }
    }
    // Uzun süre sessiz kalırsan önce seslenir, sonra kapatır
    if (!k.busy && !k.rec && Date.now() - k.lastInput > 20000) {
      k.idle++;
      if (k.idle > 2) leave(k, LINES.hangupIdle);
      else {
        k.busy = true;
        say(k, rnd(LINES.idle)).then(() => { k.busy = false; k.lastInput = Date.now(); answer(); });
      }
    }
  }

  async function leave(k, pool) {
    k.busy = true;
    await say(k, rnd(pool));
    if (cur === k) hangup('her');
  }

  async function say(k, text) {
    if (cur !== k) return;
    caption('her', text);
    k.el.classList.add('talking');
    await speak(k, text);
    if (cur === k) k.el.classList.remove('talking');
  }

  function said(text) {
    const k = cur;
    if (!k || k.phase !== 'live') return;
    caption('me', text);
    k.queue.push(text);
    k.idle = 0;
    k.lastInput = Date.now();
    answer();
  }

  async function answer() {
    const k = cur;
    if (!k || k.busy || !k.queue.length || k.phase !== 'live') return;
    k.busy = true;
    const msgs = k.queue.splice(0);
    await wait(500 + Math.random() * 900);
    if (cur !== k) return;
    const r = A.Engine.respond(k.c, msgs);
    A.Store.save();
    for (const part of r.parts) {
      if (cur !== k) return;
      await say(k, part);
    }
    if (cur !== k) return;
    k.busy = false;
    k.lastInput = Date.now();
    if (r.leave) { hangup('her'); return; }
    if (k.queue.length) answer();
  }

  function toggleSpeaker() {
    cur.speaker = !cur.speaker;
    if (!cur.speaker && TTS) speechSynthesis.cancel();
    drawCtrl();
  }

  async function startCam() {
    const k = cur;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (cur !== k) { s.getTracks().forEach(t => t.stop()); return; }
      k.stream = s;
      k.camOn = true;
      k.el.querySelector('.call-self video').srcObject = s;
      k.el.querySelector('.call-self').classList.add('cam');
    } catch (e) {
      k.camOn = false;
    }
    drawCtrl();
  }

  function toggleCam() {
    const k = cur;
    if (!k.stream) { startCam(); return; }
    k.camOn = !k.camOn;
    k.stream.getVideoTracks().forEach(t => { t.enabled = k.camOn; });
    k.el.querySelector('.call-self').classList.toggle('cam', k.camOn);
    drawCtrl();
  }

  function hangup(by) {
    const k = cur;
    if (!k || k.phase === 'ended') return;
    if (k.phase === 'ring') {
      if (k.dir === 'in') return reject();
      k.stopRing();
      log('cancelled');
      close();
      return;
    }
    const dur = Math.floor((Date.now() - k.startAt) / 1000);
    endTone();
    setState(by === 'her' ? `${k.c.name} aramayı kapattı` : 'Arama bitti');
    log('done', dur);
    k.phase = 'ended';
    if (TTS) speechSynthesis.cancel();
    if (k.rec) k.rec.abort();
    later(1200, close);
  }

  function close() {
    const k = cur;
    if (!k) return;
    cur = null;
    k.timers.forEach(clearTimeout);
    clearInterval(k.tick);
    if (k.stopRing) k.stopRing();
    if (TTS) speechSynthesis.cancel();
    if (k.rec) try { k.rec.abort(); } catch (e) { /* zaten durdu */ }
    if (k.stream) k.stream.getTracks().forEach(t => t.stop());
    k.el.classList.remove('open');
    setTimeout(() => k.el.remove(), 250);
  }

  /* ---------- Geçmiş ---------- */
  function label(e) {
    const n = TYPES[e.type].name;
    if (e.status === 'done') return `${e.dir === 'in' ? 'Gelen ' + n.toLocaleLowerCase('tr') : n} · ${mmss(e.dur)}`;
    return `${n} · ${STATUS[e.dir][e.status]}`;
  }

  function log(status, dur = 0) {
    const k = cur;
    const e = { id: k.c.id, type: k.type, dir: k.dir, status, ts: Date.now(), dur };
    S().calls = [e, ...(S().calls || [])].slice(0, 100);
    const chat = (S().chats[k.c.id] = S().chats[k.c.id] || []);
    chat.push({ from: 'sys', text: `${TYPES[k.type].icon} ${label(e)}`, ts: e.ts });
    A.Store.save();
    A.UI.refresh(k.c);
  }

  const calls = () => (S().calls || []).filter(e => A.byId(e.id));

  /* ---------- Kendiliğinden gelen arama ----------
   * Yakın (Lv.3+), keyfi yerinde, boşta ve son 3 günde yazıştığın biri arada bir seni arar. */
  function maybeIncoming() {
    if (cur || document.hidden) return;
    const now = Date.now();
    if (now - (S().lastIncoming || 0) < 40 * 60000) return;
    const pool = A.CHARACTERS.filter(c => {
      if (A.Engine.level(c).lv < 3 || !A.Mood.isOnline(c) || A.Schedule.status(c).state !== 'free') return false;
      const v = A.Mood.current(c).values;
      const lastMine = [...(S().chats[c.id] || [])].reverse().find(m => m.from === 'me');
      return v.valence > 0.15 && v.social > 0.5 && A.Interest.get(c) > 0.5 && lastMine && now - lastMine.ts < 3 * 86400000;
    });
    if (!pool.length || Math.random() > 0.04) return;
    const c = rnd(pool);
    S().lastIncoming = now;
    A.Store.save();
    incoming(c, A.Engine.level(c).lv >= 4 && Math.random() < 0.3 ? 'video' : 'voice');
  }

  return { start, incoming, maybeIncoming, calls, label, MIN_LV, ICON, active: () => !!cur };
})();
