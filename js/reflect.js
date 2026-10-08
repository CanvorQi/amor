/*
 * Amor - Yansıtma (onaylayıcı cevap)
 * ----------------------------------
 * Kullanıcının cümlesindeki fiili ve önündeki kelimeleri bulup 2. şahsa çevirir:
 *   "bugün arkadaşımla sinemaya gittim"  -> "arkadaşınla sinemaya gittin"   (past)
 *   "yarın sınava gireceğim"              -> "yarın sınava gireceksin"       (fut)
 *   "çok yorgunum ya"                     -> "çok yorgunsun"                 (state)
 *   "annem bugün hastalandı"              -> "annen bugün hastalandı"        (3. şahıs + iyelik)
 * Cümle kalıpları js/data/reflect.js'te; motor (engine.js) uygun olanı seçer.
 */
window.Amor = window.Amor || {};

Amor.Reflect = (() => {
  const low = s => String(s).toLocaleLowerCase('tr');
  // harf dışını at, sondaki uzatmayı topla: "gittimmm!" -> "gittim"
  const clean = w => low(w).replace(/[^\p{L}]/gu, '').replace(/(\p{L})\1{2,}$/u, '$1');
  const lastV = w => (low(w).match(/[aeıioöuü]/g) || ['e']).pop();
  const sIn = v => ({ a: 'sın', ı: 'sın', e: 'sin', i: 'sin', o: 'sun', u: 'sun', ö: 'sün', ü: 'sün' }[v]);
  const QUESTION = /^m[ıiuü](s[ıiuü]n|y[ıiuü]m|y[ıiuü]z|s[ıiuü]n[ıiuü]z)?$/;

  let OWNED_RE = null, OWNED_PL = null;
  const owned = () => OWNED_RE || (OWNED_RE = new RegExp(
    `^(${Amor.REFLECT_OWNED.join('|')})(l[ae]r)?([ıiuü])?m(l[ae]|[ıiuü]n|[ıiuü]|[ae]|[dt][ae]n|[dt][ae])?$`));
  const ownedPl = () => OWNED_PL || (OWNED_PL = new RegExp(`^(${Amor.REFLECT_OWNED.join('|')})([ıiuü])?m(l[ae]r.*)$`));

  // "annemle" -> "annenle", "bana" -> "sana"; değişmediyse null
  function swap(w) {
    if (Amor.REFLECT_PRONOUNS[w]) return Amor.REFLECT_PRONOUNS[w];
    const m = w.match(owned());
    if (m) return `${m[1]}${m[2] || ''}${m[3] || ''}n${m[4] || ''}`;
    // "annemlerle" -> "annenlerle"
    const k = w.match(ownedPl());
    return k ? `${k[1]}${k[2] || ''}n${k[3]}` : null;
  }

  // 1. şahıs fiil / durum -> 2. şahıs. Dönen: { w, tense, neg, tone? } | null
  function verb(w) {
    if (w.length < 4 || Amor.REFLECT_SKIP.includes(w) || Amor.REFLECT_DROP.includes(w)) return null;
    let m;
    // şimdiki: yapıyorum -> yapıyorsun, yapıyoruz -> yapıyorsunuz, yapıyom -> yapıyon
    if ((m = w.match(/^(.+yor)(um|uz)$/))) return { w: m[1] + (m[2] === 'um' ? 'sun' : 'sunuz'), tense: 'prog', neg: /m[ıiuü]yor$/.test(m[1]) };
    if ((m = w.match(/^(.+yo)m$/))) return { w: m[1] + 'n', tense: 'prog', neg: /m[ıiuü]yo$/.test(m[1]) };
    // gelecek: yapacağım -> yapacaksın, gideceğiz -> gideceksiniz
    if ((m = w.match(/^(.+)([ae])c[ae][ğg][ıi](m|z)$/))) {
      const a = m[2] === 'a';
      return { w: `${m[1]}${m[2]}c${m[2]}k${a ? 'sın' : 'sin'}${m[3] === 'z' ? (a ? 'ız' : 'iz') : ''}`, tense: 'fut', neg: /m[ae]y$/.test(m[1]) };
    }
    // konuşma dili gelecek: yapıcam -> yapıcan, gelcem -> gelcen
    if (w.length >= 5 && (m = w.match(/^(.+c[ae])m$/))) return { w: m[1] + 'n', tense: 'fut', neg: /m[ae]y[ıi]?c[ae]$/.test(m[1]) };
    // -mış: yorulmuşum -> yorulmuşsun
    if ((m = w.match(/^(.+m[ıiuü]ş)([ıiuü])m$/))) return { w: m[1] + sIn(m[2]), tense: 'mis', neg: /m[ae]m[ıiuü]ş$/.test(m[1]) };
    // gereklilik: gitmeliyim -> gitmelisin
    if ((m = w.match(/^(.+m[ae]l[ıi])y?([ıi])m$/))) return { w: m[1] + sIn(m[2]), tense: 'must' };
    // durum sıfatı: yorgunum -> yorgunsun, hastayım -> hastasın
    for (const tone of ['good', 'bad', 'any']) {
      const adj = Amor.REFLECT_STATES[tone].find(a => new RegExp(`^${a}y?[ıiuü]m$`).test(w));
      if (adj) return { w: adj + sIn(lastV(adj)), tense: 'state', tone: tone === 'any' ? null : tone };
    }
    // bulunma: evdeyim -> evdesin
    if ((m = w.match(/^(.+[dt][ae])y([ıi])m$/))) return { w: m[1] + sIn(m[2]), tense: 'state' };
    // olumsuz geniş: sevmem -> sevmezsin, yapamam -> yapamazsın
    if (w.length >= 5 && (m = w.match(/^(.+)m([ae])m$/))) return { w: `${m[1]}m${m[2]}z${m[2] === 'a' ? 'sın' : 'sin'}`, tense: 'neg', neg: true };
    // geniş: yaparım -> yaparsın, gelirim -> gelirsin ("arkadaşlarım" değil)
    if (!/l[ae]r[ıi]m$/.test(w) && (m = w.match(/^(.+[aeıiuü]r)([ıiuü])m$/))) return { w: m[1] + sIn(m[2]), tense: 'habit' };
    // geçmiş: gittim -> gittin, yaptık -> yaptınız
    if ((m = w.match(/^(.+[dt]([ıiuü]))(m|k)$/))) {
      return { w: m[3] === 'm' ? m[1] + 'n' : `${m[1]}n${m[2]}z`, tense: 'past', neg: /m[ae][dt][ıi]$/.test(m[1]) };
    }
    return null;
  }

  // 3. şahıs fiil (iyelikli öznede): "annem geldi", "başım ağrıyor"
  function verb3(w) {
    if (w.length < 4) return null;
    if (/yor$/.test(w)) return { w, tense: 'prog', neg: /m[ıiuü]yor$/.test(w) };
    if (/[ae]c[ae]k$/.test(w)) return { w, tense: 'fut' };
    if (/m[ıiuü]ş$/.test(w)) return { w, tense: 'mis' };
    if (/[dt][ıiuü]$/.test(w)) return { w, tense: 'past', neg: /m[ae][dt][ıi]$/.test(w) };
    return null;
  }

  function toneOf(w) {
    const T = Amor.REFLECT_TONE;
    return T.bad.some(s => w.startsWith(s)) ? 'bad' : T.good.some(s => w.startsWith(s)) ? 'good' : null;
  }

  // Bir cümleciği çöz: { x, tense, tone } | null
  function clause(text) {
    const words = text.split(/\s+/).map(clean).filter(Boolean)
      .filter((w, i, a) => !(/^d[ae]$/.test(w) && ['ben', 'biz'].includes(a[i - 1]))); // "ben de" -> atılır
    if (!words.length || words.some(w => QUESTION.test(w))) return null;
    const DROP = Amor.REFLECT_DROP;
    // fiil genelde sondadır; son 3 kelimeye bakar ("yoruldum ya", "uyuyamadım bütün gece")
    for (let i = words.length - 1; i >= Math.max(0, words.length - 3); i--) {
      if (DROP.includes(words[i])) continue;
      const before = words.slice(0, i).filter(w => !DROP.includes(w)).slice(-3);
      const v = verb(words[i]);
      if (v) {
        if (!before.length && v.tense !== 'state' && (Amor.REFLECT_ALONE.includes(words[i]) || words[i].length < 7)) return null;
        const x = [...before.map(w => swap(w) || w), v.w].join(' ');
        return { x, tense: v.neg ? 'neg' : v.tense, tone: v.tone || toneOf(words[i]) };
      }
      // iyelikli özne + 3. şahıs fiil
      const v3 = verb3(words[i]);
      if (v3 && before.some(w => swap(w) && !Amor.REFLECT_PRONOUNS[w])) {
        const x = [...before.map(w => swap(w) || w), v3.w].join(' ');
        return { x, tense: v3.neg ? 'neg' : v3.tense, tone: toneOf(words[i]) };
      }
    }
    return null;
  }

  // Mesajdaki son uygun cümlecik; soru cümleleri atlanır
  function analyze(raw) {
    const sentences = (String(raw).match(/[^.!?\n]+[.!?\n]*/g) || []).filter(s => !s.trim().endsWith('?'));
    for (let i = sentences.length - 1; i >= 0; i--) {
      const parts = sentences[i].split(/,|;|\s(?:ve|ama|fakat|ancak|çünkü|cunku)\s/i);
      for (let j = parts.length - 1; j >= 0; j--) {
        const r = clause(parts[j]);
        if (r) return r;
      }
    }
    return null;
  }

  return { analyze };
})();
