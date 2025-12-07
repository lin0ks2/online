/* ==========================================================================
 * Языковой модуль подсветки примеров — немецкий (de)
 * Контракт:
 *   App.ExampleHighlight.de(raw, wordObj, deckKey, lemma) -> { index, length } | null
 *
 * Здесь НЕТ работы с DOM: модуль только ищет позицию подсвечиваемого фрагмента.
 * ========================================================================== */
(function (root) {
  'use strict';

  var A = root.App = root.App || {};
  A.ExampleHighlight = A.ExampleHighlight || {};

  /**
   * Главный обработчик подсветки для немецкого
   *
   * @param {string} raw     - исходное предложение (как есть из словаря)
   * @param {object} wordObj - объект слова из словаря
   * @param {string} deckKey - ключ активной деки (de_verbs, de_nouns...)
   * @param {string} lemma   - базовая форма (последнее слово из wordObj.word)
   * @returns {{index:number,length:number}|null}
   */
  A.ExampleHighlight.de = function (raw, wordObj, deckKey, lemma) {
    if (!raw || !wordObj) return null;

    // Нормализуем предложение в NFC, чтобы ü/ö/ä/ß совпадали по длине и индексам
    var rawStr = String(raw);
    var rawNorm = normalizeNfc(rawStr);
    var rawLower = rawNorm.toLocaleLowerCase('de-DE');

    var base = (lemma && String(lemma).trim()) ||
               (wordObj.word ? String(wordObj.word).trim().split(/\s+/).pop() : '');
    if (!base) return null;

    var deckType = detectDeckType(deckKey);

    // Собираем набор возможных форм для поиска
    var forms = buildGermanForms(base, wordObj, deckType);
    if (!forms || !forms.length) return null;

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      if (!form) continue;

      // Нормализуем форму так же, как предложение
      var formNorm = normalizeNfc(String(form));
      var formLower = formNorm.toLocaleLowerCase('de-DE');

      var idx = indexOfWord(rawLower, formLower);
      if (idx === -1) continue;

      // Индексы в rawLower и rawNorm совпадают по длине
      return { index: idx, length: formLower.length };
    }

    return null;
  };

  // ---------------------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ -----------------------

  function normalizeNfc(str) {
    try {
      return str.normalize('NFC');
    } catch (e) {
      return str;
    }
  }

  function detectDeckType(deckKey) {
    if (!deckKey) return 'other';
    var k = String(deckKey).toLowerCase();
    if (k.indexOf('verb') !== -1) return 'verb';
    if (k.indexOf('noun') !== -1) return 'noun';
    return 'other';
  }

  // "Своё" понятие буквы для немецкого (чтобы обходиться без \\b и проблем с ß)
  function isLetter(ch) {
    return /[A-Za-zÄÖÜäöüß]/.test(ch);
  }

  // Ищем form как цельное слово внутри rawLower (оба — уже lowercased)
  function indexOfWord(rawLower, formLower) {
    var from = 0;
    while (from <= rawLower.length - formLower.length) {
      var idx = rawLower.indexOf(formLower, from);
      if (idx === -1) return -1;

      var before = idx - 1;
      var after = idx + formLower.length;

      var beforeOk = (before < 0) || !isLetter(rawLower.charAt(before));
      var afterOk  = (after >= rawLower.length) || !isLetter(rawLower.charAt(after));

      if (beforeOk && afterOk) {
        return idx;
      }

      from = idx + 1;
    }
    return -1;
  }

  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Разбор отделяемого глагола: aufstehen -> { prefix:"auf", base:"stehen" }
  function splitSeparableVerb(lemma) {
    // порядок важен: более длинные приставки (zurück) должны идти раньше коротких (zu)
    var prefixes = [
      'zurück','zusammen','weiter','auseinander',
      'ab','an','auf','aus','bei','ein','mit','nach','vor','weg','zu',
      'fest','los','her','hin','um'
    ];
    lemma = String(lemma || '');
    for (var i = 0; i < prefixes.length; i++) {
      var p = prefixes[i];
      if (lemma.length > p.length + 2 && lemma.indexOf(p) === 0) {
        return { prefix: p, base: lemma.slice(p.length) };
      }
    }
    return null;
  }

  // ===================== СИЛЬНЫЕ ГЛАГОЛЫ (микро-словарь) =====================

  // e -> i / ie (2/3 л. Präsens)
  var STRONG_E_MAP = {
    'treten':   ['tritt'],
    'geben':    ['gibst','gibt'],
    'lesen':    ['liest'],
    'essen':    ['isst'],
    'helfen':   ['hilfst','hilft'],
    'nehmen':   ['nimmst','nimmt'],
    'sprechen': ['sprichst','spricht'],
    'vergessen':['vergisst'],
    'sehen':    ['siehst','sieht'],
    'brechen':  ['brichst','bricht']
  };

  // a -> ä (2/3 л. Präsens)
  var STRONG_A_MAP = {
    'waschen': ['wäschst','wäscht'],
    'fahren':  ['fährst','fährt'],
    'laufen':  ['läufst','läuft'],
    'schlafen':['schläfst','schläft'],
    'tragen':  ['trägst','trägt'],
    'wachsen': ['wächst'],
    'stoßen':  ['stößt'],
    'blasen':  ['bläst']
  };

  // Нерегулярные Partizip II, которые нельзя вывести из стема
  var IRREG_PART2_MAP = {
    'gelingen': ['gelungen']
  };

  // Строим набор форм для немецкого слова в зависимости от части речи
  function buildGermanForms(lemma, wordObj, deckType) {
    var forms = [];
    var base = String(lemma || '').trim();
    if (!base) return forms;

    // 0) Ручные формы (если когда-нибудь появятся в словаре)
    if (wordObj && Array.isArray(wordObj.deForms)) {
      for (var i = 0; i < wordObj.deForms.length; i++) {
        var f = String(wordObj.deForms[i] || '').trim();
        if (f) forms.push(f);
      }
    }

    if (deckType === 'verb') {
      // Проверяем на отделяемый глагол: на уровне основы (stehen, ziehen ...)
      var sep = splitSeparableVerb(base);
      if (sep && sep.base) {
        forms = forms.concat(buildVerbForms(sep.base));
      }

      // Формы самой леммы
      forms = forms.concat(buildVerbForms(base));

      // Сильные глаголы — точечные формы Präsens с чередованием гласной
      var strongE = STRONG_E_MAP[base];
      if (strongE) forms = forms.concat(strongE);

      var strongA = STRONG_A_MAP[base];
      if (strongA) forms = forms.concat(strongA);

      // Особые Partizip II
      var irrP2 = IRREG_PART2_MAP[base];
      if (irrP2) forms = forms.concat(irrP2);

    } else if (deckType === 'noun') {
      forms = forms.concat(buildNounForms(base));
    }

    // 3) Всегда добавляем базовую форму
    forms.push(base);

    // 4) Убираем дубли и пустые
    var seen = Object.create(null);
    var out = [];
    for (var j = 0; j < forms.length; j++) {
      var val = String(forms[j] || '').trim();
      if (!val) continue;
      var key = normalizeNfc(val).toLocaleLowerCase('de-DE');
      if (seen[key]) continue;
      seen[key] = true;
      out.push(val);
    }
    return out;
  }

  // -------------------------- ГЛАГОЛЫ -----------------------------------

  function buildVerbForms(lemma) {
    var forms = [];
    var l = String(lemma || '').trim();
    if (!l) return forms;

    var isIeren = false;
    var stem = l;

    if (l.length > 6 && l.slice(-6) === 'ieren') {
      // studieren -> studier
      isIeren = true;
      stem = l.slice(0, -3); // убираем только "en"
    } else if (l.length > 4 && l.slice(-2) === 'en') {
      stem = l.slice(0, -2);
    } else if (l.length > 3 && l.slice(-1) === 'n') {
      stem = l.slice(0, -1);
    }

    // Императивные формы (очень грубо, но безопасно)
    // z.B. grüßen -> "grüß", "grüße"; bewegen -> "beweg", "bewege"
    forms.push(stem);
    forms.push(stem + 'e');

    // Настоящее время (грубая модель)
    var pres = [
      stem + 'e',
      stem + 'st',
      stem + 't',
      stem + 'en',
      stem + 't',
      stem + 'en'
    ];
    forms = forms.concat(pres);

    // Претерит слабых глаголов
    var prat = [
      stem + 'te',
      stem + 'test',
      stem + 'te',
      stem + 'ten',
      stem + 'tet',
      stem + 'ten'
    ];
    forms = forms.concat(prat);

    // Partizip II
    var prefixesNoGe = ['be','ge','er','ver','zer','ent','emp','miss'];
    var hasNoGePrefix = false;
    for (var i = 0; i < prefixesNoGe.length; i++) {
      if (l.indexOf(prefixesNoGe[i]) === 0) {
        hasNoGePrefix = true;
        break;
      }
    }

    if (isIeren) {
      forms.push(stem + 't'); // studiert, interessiert
    } else {
      if (hasNoGePrefix) {
        forms.push(stem + 't');    // z.B. "bewegt", "verstanden" частично
      } else {
        forms.push('ge' + stem + 't');
      }
    }

    // Добавляем варианты с "вставным" -e- (öffnen -> öffnet, verbinden -> verbindet)
    forms = expandEpentheticE(forms);

    return forms;
  }

  // Для форм на -st/-t/-te/-ten/-tet добавляем вариант с дополнительным "e"
  // machst -> machest (редко, но безопасно), verbindst -> verbindest, verbindt -> verbindet, öffnt -> öffнет
  function expandEpentheticE(list) {
    var out = list.slice();
    var suffixes = ['st','t','te','ten','tet'];
    for (var i = 0; i < list.length; i++) {
      var f = String(list[i] || '');
      for (var s = 0; s < suffixes.length; s++) {
        var suf = suffixes[s];
        if (f.length > suf.length + 1 && endsWith(f, suf)) {
          var stem = f.slice(0, -suf.length);
          var candidate = stem + 'e' + suf;
          if (out.indexOf(candidate) === -1) {
            out.push(candidate);
          }
        }
      }
    }
    return out;
  }

  function endsWith(str, suf) {
    var s = String(str);
    var n = String(suf);
    if (n.length > s.length) return false;
    return s.slice(-n.length) === n;
  }

  // ------------------------- СУЩЕСТВИТЕЛЬНЫЕ ----------------------------

  function buildNounForms(lemma) {
    var forms = [];
    var n = String(lemma || '').trim();
    if (!n) return forms;

    // простые окончания множественного / падежей
    forms.push(
      n + 'e',
      n + 'en',
      n + 'er',
      n + 'n',
      n + 's'
    );

    return forms;
  }

})(window);
