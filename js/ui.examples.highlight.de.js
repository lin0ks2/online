/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.examples.highlight.de.js
 * Назначение: Языко-специфичная подсветка слов в примерах (немецкий)
 * Подключается после ui.examples.hints.js и дополняет базовую логику.
 * ========================================================== */

(function (root) {
  'use strict';

  var A = root.App = root.App || {};
  A.ExampleHighlight = A.ExampleHighlight || {};

  /**
   * Специальные правила подсветки для немецкого.
   *
   * @param {string} raw    - исходное предложение (DE)
   * @param {Object} word   - объект слова из тренажёра
   * @param {string} deckKey - ключ деки (de_verbs, de_nouns, ...)
   * @param {string} lemma  - базовая форма (последнее слово из word.word)
   * @returns {{index:number,length:number}|null}
   */
  A.ExampleHighlight.de = function (raw, word, deckKey, lemma) {
    if (!raw || !word || !lemma) return null;

    var deckType = detectDeckType(deckKey);
    var forms = buildGermanForms(lemma, word, deckType);
    if (!forms || !forms.length) return null;

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      if (!form) continue;

      var re = new RegExp('\\b' + escapeRegExp(form) + '\\b', 'i');
      var m = raw.match(re);
      if (m) {
        return { index: m.index, length: m[0].length };
      }
    }

    return null;
  };

  function detectDeckType(deckKey) {
    if (!deckKey) return 'other';
    var k = String(deckKey).toLowerCase();

    // Порядок важен: сначала более специфичные группы.
    if (k.indexOf('verb') !== -1 || k.indexOf('verben') !== -1) return 'verb';
    if (k.indexOf('noun') !== -1 || k.indexOf('moun') !== -1 || k.indexOf('nomen') !== -1 || k.indexOf('substantiv') !== -1) return 'noun';
    if (k.indexOf('adj') !== -1 || k.indexOf('adjektiv') !== -1 || k.indexOf('adjective') !== -1) return 'adj';

    // Предлоги / Präpositionen
    if (k.indexOf('prep') !== -1 || k.indexOf('preposition') !== -1 || k.indexOf('praep') !== -1 || k.indexOf('präpo') !== -1 || k.indexOf('praeposition') !== -1 || k.indexOf('präposition') !== -1 || k.indexOf('предлог') !== -1) {
      return 'prep';
    }

  // =========================================================================
  // БАЗОВЫЕ ПРАВИЛА ПО ЧАСТЯМ РЕЧИ (base rules)
  //   VERB  - спряжения/времена/Partizip II, сильные/нерегулярные, separable.
  //   NOUN  - Plural/Genitiv/умлаут.
  //   ADJ   - Komparativ/Superlativ/склонения.
  //   PREP  - точное совпадение (включая многословные выражения).
  // =========================================================================

  // =========================================================================
  // ИСКЛЮЧЕНИЯ (exceptions) — добавляются точечно, строго аддитивно.
  // Структура: EXCEPTIONS_BY_DECK[deckType] = [{ lemma:'...', forms:[...]}]
  // =========================================================================
  var EXCEPTIONS_BY_DECK = {
    verb: [],
    noun: [],
    adj: [],
    prep: [],
    other: []
  };



    return 'other';
  }

  // Очень грубое определение стема глагола
  function guessVerbStem(lemma) {
    var s = String(lemma || '');
    if (!s) return s;

    // глаголы на -ieren: studieren -> studier-
    if (s.length > 6 && s.slice(-6) === 'ieren') {
      return s.slice(0, -3); // studier
    }

    if (s.length > 4 && s.slice(-2) === 'en') return s.slice(0, -2);
    if (s.length > 3 && s.slice(-1) === 'n')  return s.slice(0, -1);
    return s;
  }

  function buildGermanForms(lemma, word, deckType) {
    var forms = [];
    var base = String(lemma || '').trim();
    if (!base) return forms;

    // 1) Ручные формы для совсем неправильных глаголов / существительных
    if (word && Array.isArray(word.deForms)) {
      word.deForms.forEach(function (f) {
        var v = String(f || '').trim();
        if (v) forms.push(v);
      });
    }

    // 2) Автоматические формы
    if (deckType === 'verb') {
      var stem = guessVerbStem(base);

      // настоящее время (очень грубо)
      forms.push(
        stem + 'e',   // ich
        stem + 'st',  // du
        stem + 't',   // er/sie/es
        stem + 'en',  // wir
        stem + 't',   // ihr
        stem + 'en'   // sie/Sie
      );

      // претерит слабых глаголов
      forms.push(
        stem + 'te',
        stem + 'test',
        stem + 'te',
        stem + 'ten',
        stem + 'tet',
        stem + 'ten'
      );

      // Partizip II (упрощённо, без учёта сильных глаголов)
      if (base.slice(-6) !== 'ieren') {
        forms.push('ge' + stem + 't');
      }
    } else if (deckType === 'noun') {
      var n = base;

      // очень грубые множественные/падежные окончания
      forms.push(
        n + 'e',
        n + 'en',
        n + 'er',
        n + 'n',
        n + 's'
      );
    } else {
      // Если тип деки неизвестен, пробуем немного универсальных окончаний
      var u = base;
      forms.push(
        u + 'e',
        u + 'en',
        u + 'n',
        u + 's'
      );
    }

    // 3) Всегда добавляем базовую форму
    forms.push(base);

    // Убираем дубликаты (без учёта регистра)
    var seen = Object.create(null);
    var out = [];
    for (var i = 0; i < forms.length; i++) {
      var f = String(forms[i] || '').trim();
      if (!f) continue;
      var key = f.toLowerCase();
      if (seen[key]) continue;
      seen[key] = true;
      out.push(f);
    }

    return out;
  }

  function escapeRegExp(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Нормализация леммы с учётом части речи.
  // Важно: для PREP мы не используем аргумент lemma (он часто уже "обрезан" до последнего слова),
  // а берём исходное wordObj.word целиком.
  function normalizeLemma(lemma, wordObj, deckType) {
    var raw = '';
    if (deckType === 'prep' && wordObj && wordObj.word) {
      raw = String(wordObj.word);
    } else {
      raw = (lemma != null) ? String(lemma) : '';
    }

    raw = raw.trim();

    // убрать служебные скобки вроде "(sich)"
    raw = raw.replace(/\s*\([^\)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();

    return raw;
  }


})(window);
