/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: prepositions.trainer.logic.js
 * Назначение: Логика/адаптер колоды для тренера предлогов (EN сейчас, DE позже)
 * Версия: 0.1
 * Обновлено: 2026-01-23
 * ========================================================== */

(function(){
  'use strict';

  var A = (window.App = window.App || {});
  A.Prepositions = A.Prepositions || {};

  // Prepositions decks:
  // - legacy/visible dictionary deck:   en_prepositions
  // - safe trainer entry/deck key:      en_prepositions_trainer
  // We treat BOTH as prepositions-capable keys.
  function isPrepositionsDeckKey(key){
    return /^([a-z]{2})_prepositions(?:_trainer)?$/i.test(String(key||'').trim());
  }

  function langOfPrepositionsKey(key){
    var m = String(key||'').trim().match(/^([a-z]{2})_prepositions(?:_trainer)?$/i);
    return m ? m[1].toLowerCase() : null;
  }

  function getData(lang){
    try {
      var d = (window.prepositionsTrainer && window.prepositionsTrainer[lang]) || null;
      return d && d.patterns && d.patterns.length ? d : null;
    } catch(_){
      return null;
    }
  }

  // Кэшируем развёрнутую колоду (150 карточек) по языку.
  var __cacheDeckByLang = {};

  function buildExpandedDeck(lang){
    var data = getData(lang);
    if (!data) return [];

    var deck = [];
    var patterns = data.patterns || [];
    var V = Math.max(1, Number(data.variantsPerPattern || 5));

    // Важно: 5 сетов × 30 упражнений
    // Представление: каждая "карточка" = (patternId) + (конкретная фраза для этого сета),
    // при этом id повторяется по сетам, но внутри сета уникален.
    for (var v=0; v<V; v++){
      for (var i=0; i<patterns.length; i++){
        var p = patterns[i];
        if (!p || !p.id) continue;
        var items = Array.isArray(p.items) ? p.items : [];
        var sentence = String(items[v] || items[0] || '').trim();
        if (!sentence) continue;

        deck.push({
          id: String(p.id),
          // term (верхняя строка) — фраза с пропуском
          de: sentence,
          // корректный ответ (предлог)
          _prepCorrect: String(p.answer || '').trim(),
          // язык для выбора отвлекалок
          _prepLang: lang
        });
      }
    }
    return deck;
  }

  function getDeckForKey(key){
    if (!isPrepositionsDeckKey(key)) return [];
    var lang = langOfPrepositionsKey(key) || 'en';
    if (__cacheDeckByLang[lang]) return __cacheDeckByLang[lang].slice();
    var deck = buildExpandedDeck(lang);
    __cacheDeckByLang[lang] = deck.slice();
    return deck;
  }

  function getDistractorPool(lang){
    var data = getData(lang);
    var pool = (data && Array.isArray(data.distractorPool)) ? data.distractorPool.slice() : [];
    // last resort fallback
    if (!pool.length) pool = ['at','on','in','to','from','for','with','by','about','of'];
    // unique normalized
    var seen = {};
    var out = [];
    for (var i=0; i<pool.length; i++){
      var s = String(pool[i] || '').trim();
      if (!s) continue;
      var k = s.toLowerCase();
      if (seen[k]) continue;
      seen[k] = true;
      out.push(s);
    }
    return out;
  }

  // Публичное API
  A.Prepositions.isPrepositionsDeckKey = isPrepositionsDeckKey;
  A.Prepositions.langOfPrepositionsKey = langOfPrepositionsKey;
  A.Prepositions.getDeckForKey = getDeckForKey;
  A.Prepositions.getDistractorPool = getDistractorPool;

})();
