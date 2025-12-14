/* ==========================================================================
 * Языковой модуль подсветки примеров — немецкий (de)
 * Контракт:
 *   App.ExampleHighlight.de(raw, wordObj, deckKey, lemma) -> { index, length } | null
 *
 * Здесь НЕТ работы с DOM: модуль только ищет позицию подсвечиваемого фрагмента.
 * Все грамматические правила для немецкого языка собраны в этом файле.
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
   * @param {string} deckKey - ключ активной деки (de_verbs, de_nouns, de_adj...)
   * @param {string} lemma   - базовая форма (последнее слово из wordObj.word)
   * @returns {{index:number,length:number}|null}
   */
  A.ExampleHighlight.de = function (raw, wordObj, deckKey, lemma) {
    if (!raw || !wordObj) return null;

    // Нормализуем предложение в NFC, чтобы ü/ö/ä/ß совпадали по длине и индексам
    var rawStr = String(raw);
    var rawNorm = normalizeNfc(rawStr);
    var rawLower = rawNorm.toLocaleLowerCase('de-DE');

    // 1) Нормализуем "лемму" безопасно (учёт "(sich)")
    var base = pickLemma(lemma, wordObj);
    if (!base) return null;

    base = normalizeNfc(base);
    var deckType = detectDeckType(deckKey);

    // 2) Если отделяемый глагол — пробуем найти split-форму (verb ... prefix)
    //    ВАЖНО: ваш контракт подсвечивает один фрагмент, поэтому подсвечиваем VERB-часть.
    if (deckType === 'verb') {
      var sepTry = splitSeparableVerb(base);
      if (sepTry && sepTry.base && sepTry.prefix) {
        var splitHit = findSeparableSplit(rawLower, base, sepTry);
        if (splitHit) return splitHit;
      }
    }

    // 3) Обычный поиск: набор возможных форм для поиска (включая лемму)
    var forms = buildGermanForms(base, wordObj, deckType);
    if (!forms || !forms.length) return null;

    for (var i = 0; i < forms.length; i++) {
      var form = forms[i];
      if (!form) continue;

      var formNorm = normalizeNfc(String(form));
      var formLower = formNorm.toLocaleLowerCase('de-DE');

      var idx = indexOfWord(rawLower, formLower);
      if (idx === -1) continue;

      return { index: idx, length: formLower.length };
    }

    return null;
  };

  // ---------------------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ -----------------------

  function normalizeNfc(str) {
    try { return String(str).normalize('NFC'); }
    catch (e) { return String(str); }
  }

  function detectDeckType(deckKey) {
    if (!deckKey) return 'other';
    var k = String(deckKey).toLowerCase();
    if (k.indexOf('verb') !== -1) return 'verb';
    if (k.indexOf('noun') !== -1) return 'noun';
    if (k.indexOf('adj') !== -1 || k.indexOf('adjekt') !== -1) return 'adj';
    return 'other';
  }

  // Из wordObj.word вида "bewerben (sich)" берём "bewerben"
  function pickLemma(lemma, wordObj) {
    var base = (lemma && String(lemma).trim()) || '';

    if (!base && wordObj && wordObj.word) {
      base = String(wordObj.word).trim();
    }

    if (!base) return '';

    // Убираем "(sich)" и лишние пробелы
    base = base.replace(/\s*\(sich\)\s*/ig, ' ').trim();

    // Если остались артикли/служебные слова в начале — это не ломает,
    // но для деки глаголов/прилагательных берём последнее "слово"
    var parts = base.split(/\s+/);
    if (!parts.length) return '';

    // Если пользователь передал lemma корректно — оно обычно уже однословное.
    // Но если это "der Service" — последнее слово "Service" подходит для подсветки.
    return parts[parts.length - 1];
  }

  // "Своё" понятие буквы для немецкого (чтобы обходиться без \b и проблем с ß)
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

      if (beforeOk && afterOk) return idx;
      from = idx + 1;
    }
    return -1;
  }

  // ------------------- ОТДЕЛЯЕМЫЕ ГЛАГОЛЫ -------------------

  // Разбор отделяемого глагола: aufstehen -> { prefix:"auf", base:"stehen" }
  function splitSeparableVerb(lemma) {
    // порядок важен: более длинные приставки должны идти раньше коротких
    var prefixes = [
      'auseinander','zusammen','weiter','zurück',
      'voraus','zurecht', // добавлено под скрины: "setzt ... voraus", "fällt ... (nicht) ein", "komm ... zurecht"
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

  // Снять неотделяемую приставку (er-, be-, ver-, ent-, emp-, zer-, miss- ...)
  function stripNonSeparablePrefix(lemma) {
    var s = String(lemma || '').trim();
    var prefs = ['be','er','ver','zer','ent','emp','miss','ge'];
    for (var i = 0; i < prefs.length; i++) {
      var p = prefs[i];
      if (s.length > p.length + 2 && s.indexOf(p) === 0) {
        return s.slice(p.length);
      }
    }
    return s;
  }

  // Находим split-форму: VERB ... PREFIX (подсвечиваем VERB)
  function findSeparableSplit(rawLower, fullLemma, sep) {
    // 1) если приставка не встречается отдельным словом — нет смысла
    var pLower = normalizeNfc(sep.prefix).toLocaleLowerCase('de-DE');
    if (indexOfWord(rawLower, pLower) === -1) return null;

    // 2) строим формы для BASE, включая сильные/модальные (на базе)
    var baseForms = buildVerbForms(sep.base);
    baseForms = baseForms.concat(extraVerbForms(sep.base)); // сильные + модальные + частные кейсы

    // 3) ищем любую форму базы, после которой в пределах окна есть prefix
    var windowMax = 60; // достаточно для A1–A2 примеров
    for (var i = 0; i < baseForms.length; i++) {
      var f = normalizeNfc(String(baseForms[i] || '')).toLocaleLowerCase('de-DE');
      if (!f) continue;

      var vIdx = indexOfWord(rawLower, f);
      if (vIdx === -1) continue;

      var searchFrom = vIdx + f.length;
      var slice = rawLower.slice(searchFrom, Math.min(rawLower.length, searchFrom + windowMax));
      var pInSlice = indexOfWord(slice, pLower);

      if (pInSlice !== -1) {
        return { index: vIdx, length: f.length };
      }
    }

    return null;
  }

  // ===================== СИЛЬНЫЕ/ОСОБЫЕ ФОРМЫ (микро-словарь) =====================

  // e -> i / ie (2/3 л. Präsens)
  var STRONG_E_MAP = {
    'treten':   ['tritt'],
    'geben':    ['gibst','gibt','gib'],         // + "gib" под "Bitte gib ... weiter."
    'nehmen':   ['nimmst','nimmt'],
    'sprechen': ['sprichst','spricht'],
    'vergessen':['vergisst'],
    'lesen':    ['liest'],
    'essen':    ['isst'],
    'helfen':   ['hilfst','hilft'],
    'sehen':    ['siehst','sieht'],
    'brechen':  ['brichst','bricht'],
    'bewerben': ['bewirbst','bewirbt']          , // под "Sie bewirbt sich ...",
    'werfen':   ['wirfst','wirft'],
    'schmelzen':['schmilzt','schmilzt']
  };

  // a -> ä (2/3 л. Präsens)
  var STRONG_A_MAP = {
    'waschen': ['wäschst','wäscht'],
    'fahren':  ['fährst','fährt'],
    'laufen':  ['läufst','läuft'],
    'tragen':  ['trägst','trägt'],
    'wachsen': ['wächst'],
    'stoßen':  ['stößt'],
    'blasen':  ['bläst'],
    'fallen':  ['fällst','fällt']               , // под "Mir fällt ... ein.",
    'geraten': ['gerätst','gerät'],
    'raten':   ['rätst','rät'],
    'beraten': ['berätst','berät'],
    'halten': ['hältst','hält'],
    'enthalten': ['enthältst','enthält']

  };

  // Модальные — отдельный набор (нерегулярные)
  var MODAL_MAP = {
    'müssen': ['muss','musst','müssen','müsst'],
    'dürfen': ['darf','darfst','dürfen','dürft'],
    'wollen': ['will','willst','wollen','wollt'],
    'mögen':  ['mag','magst','mögen','mögt']
  };

  // Полностью нерегулярные Präsens-формы (частые глаголы)
  var IRREG_PRESENT_MAP = {
    'können': ['kann','kannst','können','könnt'],
    'wissen': ['weiß','weißt','wissen','wisst']
  };

  // Инсепарабельные приставки (НЕ отделяются, но наследуют сильные формы корня)
  var INSEPARABLE_PREFIXES = ['be','ge','er','ver','zer','ent','emp','miss'];

  // Нерегулярные Partizip II, которые нельзя вывести из стема
  var IRREG_PART2_MAP = {
    'gelingen': ['gelungen'],
    'kommen':   ['gekommen'],
    'fahren':   ['gefahren'],
    'schließen':['geschlossen'],
    'ziehen':   ['gezogen'],
    'stehen':   ['gestanden'],
    'sein':     ['gewesen']

  };

  // Если глагол вида "er"+"geben" или "ent"+"sprechen" —
  // наследуем сильные формы корня и добавляем приставку.
  function prefixedStrongForms(lemma) {
    lemma = String(lemma || '').trim();
    if (!lemma) return [];

    for (var i = 0; i < INSEPARABLE_PREFIXES.length; i++) {
      var p = INSEPARABLE_PREFIXES[i];
      if (lemma.indexOf(p) !== 0) continue;

      var rest = lemma.slice(p.length); // geben из ergeben, sprechen из entsprechen
      if (!rest) continue;

      var out = [];

      if (STRONG_E_MAP[rest]) {
        for (var a = 0; a < STRONG_E_MAP[rest].length; a++) out.push(p + STRONG_E_MAP[rest][a]);
      }
      if (STRONG_A_MAP[rest]) {
        for (var b = 0; b < STRONG_A_MAP[rest].length; b++) out.push(p + STRONG_A_MAP[rest][b]);
      }
      if (MODAL_MAP[rest]) {
        for (var c = 0; c < MODAL_MAP[rest].length; c++) out.push(p + MODAL_MAP[rest][c]);
      }
      if (IRREG_PART2_MAP[rest]) {
        for (var d = 0; d < IRREG_PART2_MAP[rest].length; d++) out.push(p + IRREG_PART2_MAP[rest][d]);
      }

      return out;
    }

    return [];
  }

  // Дополнительные формы, которые нужно уметь получить и для base отделяемых глаголов
  function extraVerbForms(lemma) {
    var out = [];
    lemma = String(lemma || '').trim();

    // 0) полностью нерегулярные Präsens-формы
    var ip = IRREG_PRESENT_MAP[lemma];
    if (ip) out = out.concat(ip);

    // 1) модальные
    var m = MODAL_MAP[lemma];
    if (m) out = out.concat(m);

    // 2) сильные
    var se = STRONG_E_MAP[lemma];
    if (se) out = out.concat(se);

    var sa = STRONG_A_MAP[lemma];
    if (sa) out = out.concat(sa);

    // 3) сильные с инсепарабельной приставкой (ergeben, entsprechen, ...)
    out = out.concat(prefixedStrongForms(lemma));

    // 4) Partizip II нерегулярный
    var p2 = IRREG_PART2_MAP[lemma];
    if (p2) out = out.concat(p2);

    return out;
  }

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
      // Модальные/сильные/нерегулярные (как лемма)
      forms = forms.concat(extraVerbForms(base));


      // Фолбэк: если в примере опущена неотделяемая приставка (например, \"erlösen\" vs \"löst\")
      var stripped = stripNonSeparablePrefix(base);
      if (stripped && stripped !== base) {
        forms = forms.concat(buildVerbForms(stripped));
        forms = forms.concat(extraVerbForms(stripped));
        forms.push(stripped);
      }

      // Проверяем на отделяемый глагол
      var sep = splitSeparableVerb(base);
      if (sep && sep.base) {
        // формы базы (stehen/geben/fahren/setzen ...)
        forms = forms.concat(buildVerbForms(sep.base));
        forms = forms.concat(extraVerbForms(sep.base)); // ВАЖНО: сильные/модальные/нерегулярные на базе
        // Infinitiv mit \"zu\": aus+zu+schalten => auszuschalten
        var baseInf = toInfinitive(sep.base);
        if (baseInf) forms.push(sep.prefix + 'zu' + baseInf);


        // Для Partizip II: приставка + formPart2 (zugestellt, abgemeldet, vorbereitet ...)
        // Берём все Partizip II из базовых форм и добавляем приставку
        var baseForms = buildVerbForms(sep.base).concat(extraVerbForms(sep.base));
        for (var bf = 0; bf < baseForms.length; bf++) {
          var form = String(baseForms[bf] || '');
          var fl = normalizeNfc(form).toLocaleLowerCase('de-DE');
          if (/^ge.+(t|en)$/.test(fl) || /.+(t|en)$/.test(fl)) {
            // не идеал, но безопасно для "zu"+"gestellt" => "zugestellt", "ab"+"gefahren" => "abgefahren"
            forms.push(sep.prefix + form);
          }
        }
      }

      // Формы самой леммы (на случай если в примере она слитная)
      forms = forms.concat(buildVerbForms(base));

    } else if (deckType === 'noun') {
      forms = forms.concat(buildNounForms(base));
    } else if (deckType === 'adj') {
      forms = forms.concat(buildAdjForms(base));
    }

    // Всегда добавляем базовую форму
    forms.push(base);

    // Убираем дубли и пустые
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
      isIeren = true;
      stem = l.slice(0, -3); // убираем только "en"
    } else if (l.length > 4 && l.slice(-2) === 'en') {
      stem = l.slice(0, -2);
    } else if (l.length > 3 && l.slice(-1) === 'n') {
      stem = l.slice(0, -1);
    }

    // Императивные формы (грубо, но безопасно)
    forms.push(stem);
    forms.push(stem + 'e');

    // Präsens (грубая модель)
    forms.push(stem + 'e', stem + 'st', stem + 't', stem + 'en', stem + 't', stem + 'en');


    // -eln: ich zweifle (без -e-), du zweifelst, er zweifelt
    if (/eln$/i.test(l) && /el$/i.test(stem)) {
      var noE = stem.slice(0, -2) + 'l';
      forms.push(noE + 'e', noE + 'st', noE + 't');
    }

    // Präteritum (для слабых)
    forms.push(stem + 'te', stem + 'test', stem + 'te', stem + 'ten', stem + 'tet', stem + 'ten');

    // Partizip II
    var prefixesNoGe = ['be','ge','er','ver','zer','ent','emp','miss'];
    var hasNoGePrefix = false;
    for (var i = 0; i < prefixesNoGe.length; i++) {
      if (l.indexOf(prefixesNoGe[i]) === 0) { hasNoGePrefix = true; break; }
    }

    if (isIeren) {
      forms.push(stem + 't'); // studiert
    } else {
      if (hasNoGePrefix) forms.push(stem + 't');
      else forms.push('ge' + stem + 't');
    }

    // Варианты со вставным -e-
    forms = expandEpentheticE(forms);

    return forms;
  }

  function expandEpentheticE(list) {
    var out = list.slice();
    var suffixes = ['st','t','te','ten','tet'];
    for (var i = 0; i < list.length; i++) {
      var f = String(list[i] || '');
      for (var s = 0; s < suffixes.length; s++) {
        var suf = suffixes[s];
        if (f.length > suf.length + 1 && endsWith(f, suf)) {
          var st = f.slice(0, -suf.length);
          var candidate = st + 'e' + suf;
          if (out.indexOf(candidate) === -1) out.push(candidate);
        }
      }
    }
    return out;
  }

  function endsWith(str, suf) {
    var s = String(str);
    var n = String(suf || '');
    if (n.length > s.length) return false;
    return s.slice(-n.length) === n;
  }


  // Привести к инфинитиву (на практике для баз отделяемых глаголов)
  function toInfinitive(v) {
    var s = String(v || '').trim();
    if (!s) return '';
    // если уже выглядит как инфинитив
    if (/(en|n)$/i.test(s)) return s;
    // если передали стем — пробуем восстановить
    return s + 'en';
  }

  // -------------------------- СУЩЕСТВИТЕЛЬНЫЕ ---------------------------

  function buildNounForms(lemma) {
    var forms = [];
    var n = String(lemma || '').trim();
    if (!n) return forms;
    forms.push(n + 'e', n + 'en', n + 'er', n + 'n', n + 's');
    return forms;
  }

  // --------------------------- ПРИЛАГАТЕЛЬНЫЕ ---------------------------

  function buildAdjForms(lemma) {
    var forms = [];
    var a = String(lemma || '').trim();
    if (!a) return forms;
    forms.push(a + 'e', a + 'en', a + 'em', a + 'er', a + 'es');
    return forms;
  }

})(window);
