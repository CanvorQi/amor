/*
 * Amor - Ruh Hali Motoru (Saneme mood.py'nin JS hali)
 * ----------------------------------------------------
 * Russell'ın iki ekseni + iki bar:
 *   valence  -1 → +1   mutsuz ↔ mutlu
 *   arousal   0 → 1    sakin ↔ heyecanlı / gergin
 *   energy    0 → 1    yorgun ↔ dinç
 *   social    0 → 1    sosyal pil (bitik ↔ konuşmak istiyor)
 *
 * Ruh hali zamanla kişiliğe bağlı "baseline"a geri döner:
 *   mood += (baseline - mood) * (1 - exp(-dt * ln2 / yarıÖmür))
 * Nevrotiklik yüksekse kötü ruh hali daha uzun sürer.
 * Değer, son ayarlandığı an ("anchor") saklanır; sapma okunurken hesaplanır.
 */
window.Amor = window.Amor || {};

Amor.Mood = (() => {
  const KEYS = ['valence', 'arousal', 'energy', 'social'];
  const RANGE = { valence: [-1, 1], arousal: [0, 1], energy: [0, 1], social: [0, 1] };
  const LOG_LIMIT = 40;

  const PRESETS = {
    excited:   { valence: 0.75, arousal: 0.85, energy: 0.8, social: 0.85 },
    content:   { valence: 0.6, arousal: 0.25, energy: 0.65, social: 0.7 },
    irritated: { valence: -0.6, arousal: 0.8, energy: 0.55, social: 0.35 },
    sad:       { valence: -0.65, arousal: 0.2, energy: 0.35, social: 0.3 },
    tired:     { valence: 0.0, arousal: 0.15, energy: 0.1, social: 0.45 },
    drained:   { valence: -0.1, arousal: 0.3, energy: 0.45, social: 0.08 }
  };

  const LABELS = {
    excited:   { name: 'Coşkulu', emoji: '🤩', color: '#ff9f1c' },
    content:   { name: 'Huzurlu', emoji: '😌', color: '#2fc58e' },
    neutral:   { name: 'Nötr', emoji: '😐', color: '#9a9aab' },
    irritated: { name: 'Gergin', emoji: '😤', color: '#ff4d4f' },
    sad:       { name: 'Üzgün', emoji: '😔', color: '#5b8def' },
    tired:     { name: 'Yorgun', emoji: '🥱', color: '#8a7dbb' },
    drained:   { name: 'Sosyal pili bitik', emoji: '🪫', color: '#b07a52' }
  };

  const clamp = (k, v) => Math.max(RANGE[k][0], Math.min(RANGE[k][1], Number(v)));
  const round = v => Math.round(v * 1000) / 1000;
  const store = () => Amor.Store.state;

  function isNight() {
    const h = new Date().getHours();
    return h >= 1 && h < 7;
  }

  function baseline(c) {
    const n = c.big5.N, e = c.big5.E;
    return {
      valence: round(0.25 - 0.4 * (n - 0.5)),
      arousal: round(0.35 + 0.3 * (e - 0.5)),
      energy: Amor.Schedule ? Amor.Schedule.energyBase(c) : (isNight() ? 0.3 : 0.7), // saate göre
      social: round(0.6 + 0.3 * (e - 0.5))
    };
  }

  // Saat cinsinden yarı ömür. Sosyal pil daha hızlı dolar.
  function halfLife(c, key) {
    if (key === 'social') return 0.5;
    return 3 * (0.6 + 1.6 * c.big5.N);
  }

  function current(c) {
    const base = baseline(c);
    const st = store().moods[c.id];
    if (!st) return { values: { ...base }, baseline: base, locked: false, cause: null, updatedAt: null, source: 'baseline' };

    const values = { ...st.values };
    if (!st.locked) {
      const dtH = Math.max(0, Date.now() - st.updatedAt) / 3600000;
      KEYS.forEach(k => {
        const f = 1 - Math.exp(-dtH * Math.LN2 / halfLife(c, k));
        values[k] = round(st.values[k] + (base[k] - st.values[k]) * f);
      });
    }
    let cause = st.cause;
    // normal haline dönünce sebep artık hiçbir şeyi etkilemez
    if (cause && Math.max(...KEYS.map(k => Math.abs(values[k] - base[k]))) < 0.12) cause = null;
    return { values, baseline: base, locked: !!st.locked, cause, updatedAt: st.updatedAt, source: st.source };
  }

  function addLog(c, entry) {
    const log = store().moodLog[c.id] || [];
    log.unshift(entry);
    store().moodLog[c.id] = log.slice(0, LOG_LIMIT);
  }

  function set(c, values, opts = {}) {
    const before = current(c).values;
    const next = {};
    KEYS.forEach(k => { next[k] = round(clamp(k, values[k] ?? before[k])); });
    const cause = (opts.cause || '').trim() || null;
    store().moods[c.id] = { values: next, updatedAt: Date.now(), locked: !!opts.locked, cause, source: opts.source || 'panel' };
    if (opts.log !== false) addLog(c, { ts: Date.now(), source: opts.source || 'panel', label: label(next), after: next, cause });
    Amor.Store.save();
    return current(c);
  }

  // Sohbet olaylarının küçük etkisi. Kilitliyse dokunmaz, etiket değişirse kaydeder.
  function nudge(c, delta) {
    const cur = current(c);
    if (cur.locked) return cur;
    const next = { ...cur.values };
    Object.keys(delta).forEach(k => { if (k in next) next[k] = next[k] + delta[k]; });
    const changed = label(cur.values) !== label(next);
    return set(c, next, { cause: cur.cause, source: 'sohbet', log: changed });
  }

  function reset(c) {
    delete store().moods[c.id];
    addLog(c, { ts: Date.now(), source: 'sıfırlama', label: label(baseline(c)), after: baseline(c), cause: null });
    Amor.Store.save();
    return current(c);
  }

  function label(v) {
    let quad;
    if (v.valence >= 0.2) quad = v.arousal >= 0.55 ? 'excited' : 'content';
    else if (v.valence <= -0.2) quad = v.arousal >= 0.55 ? 'irritated' : 'sad';
    else quad = 'neutral';
    if (v.energy < 0.25 && ['neutral', 'content', 'sad'].includes(quad)) return 'tired';
    if (v.social < 0.2 && ['neutral', 'content'].includes(quad)) return 'drained';
    return quad;
  }

  // Kalıp grubu: hangi cümle havuzundan seçilecek
  function group(lab) {
    return { excited: 'pos', content: 'pos', neutral: 'neu', irritated: 'neg', sad: 'sad', tired: 'low', drained: 'low' }[lab];
  }

  // Yazışma tarzına etkisi (balon sayısı, yazma hızı, gecikme, emoji)
  function modifiers(v) {
    const lab = label(v);
    const m = { maxParts: 3, speed: 1, extraDelay: 0, flat: false, emoji: 1, askBack: 1 };
    if (lab === 'excited') Object.assign(m, { maxParts: 4, speed: 1.35, emoji: 1.4, askBack: 1.4 });
    if (lab === 'content') Object.assign(m, { emoji: 1.1 });
    if (lab === 'irritated') Object.assign(m, { maxParts: 1, speed: 0.85, extraDelay: 3, flat: true, emoji: 0, askBack: 0 });
    if (lab === 'sad') Object.assign(m, { maxParts: 2, speed: 0.8, extraDelay: 1.5, emoji: 0.3, askBack: 0.2 });
    if (lab === 'tired') Object.assign(m, { maxParts: 1, speed: 0.65, extraDelay: 2, emoji: 0.3, askBack: 0 });
    if (lab === 'drained') Object.assign(m, { maxParts: 1, speed: 0.9, extraDelay: 2.5, emoji: 0.2, askBack: 0 });
    if (v.social < 0.3) m.maxParts = Math.min(m.maxParts, 2);
    m.label = lab;
    return m;
  }

  // Uyuyorsa ya da sosyal pili bittiyse çevrimdışı
  function isOnline(c) {
    if (Date.now() < ((store().forced || {})[c.id] || 0)) return true; // zorla çevrimiçi
    if (Amor.Schedule && Amor.Schedule.status(c).state === 'sleep') return false;
    return current(c).values.social >= 0.12;
  }

  return { KEYS, PRESETS, LABELS, baseline, current, set, nudge, reset, label, group, modifiers, isOnline, halfLife };
})();
