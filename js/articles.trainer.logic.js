/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: articles.trainer.logic.js
 * Назначение: Логика упражнения "Учить артикли" (каркас).
 *   - выбор слова (de_nouns)
 *   - проверка ответа der/die/das
 *   - режимы тренировки (копируются из базового тренера позже)
 *   - уведомление UI (card shell) через простой viewModel
 *
 * Принципы:
 *   - модуль автономный, ничего не ломает без явного start()
 *   - не трогает избранное/ошибки базового тренера
 *   - прогресс и статистика — отдельные модули
 *
 * Статус: каркас (MVP)
 * Версия: 0.1
 * Обновлено: 2026-01-01
 * ========================================================== */

(function () {
  'use strict';

  var A = (window.App = window.App || {});

  var ALLOWED = { der: true, die: true, das: true };

  var active = false;
  var deckKey = '';
  var mode = 'default';
  var currentWord = null;
  var lastWordId = '';
  var _state = { lastSeen: {} }; // local per-mode state (recency, anti-repeat)


  function norm(s) {
    return String(s || '').trim().toLowerCase();
  }

  function parseArticle(raw) {
    raw = String(raw || '').trim();
    var m = raw.match(/^(der|die|das)\s+/i);
    return m ? norm(m[1]) : '';
  }

  function stripArticle(raw) {
    raw = String(raw || '').trim();
    return raw.replace(/^(der|die|das)\s+/i, '').trim();
  }

  function getDeck() {
    try {
      if (A.Decks && typeof A.Decks.resolveDeckByKey === 'function') {
        return A.Decks.resolveDeckByKey(deckKey) || [];
      }
    } catch (e) {}
    return [];
  }

  function tTranslation(w) {
    // В каркасе просто используем ту же логику, что и базовый тренер,
    // если она доступна через home.js helper tWord (он не публичный).
    // Поэтому здесь делаем максимально безопасно: ru -> uk -> ''
    if (!w) return '';
    var ui = '';
    try { ui = (A.settings && A.settings.uiLang) || ''; } catch (e) {}
    if (String(ui).toLowerCase() === 'uk') return String(w.uk || w.ua || w.ru || '').trim();
    return String(w.ru || w.uk || '').trim();
  }

  
  function pickNextWord() {
    var deckKey = _deckKey || 'de_nouns';
    var deck = getDeck();
    if (!deck || !deck.length) return null;

    // --- Articles version of getDeckSlice() from обычного тренера ---
    var setSize = (A.Trainer && typeof A.Trainer.getSetSize === 'function') ? (A.Trainer.getSetSize() || 40) : 40;
    var totalSets = Math.max(1, Math.ceil(deck.length / setSize));

    // текущий сет (используем тот же индекс, что и в обычном тренере)
    var idx = 0;
    try { idx = (A.Trainer && typeof A.Trainer.getBatchIndex === 'function') ? (Number(A.Trainer.getBatchIndex(deckKey)) || 0) : 0; } catch(e){ idx = 0; }
    if (idx < 0) idx = 0;
    if (idx >= totalSets) idx = totalSets - 1;

    function isLearnedArticle(w){
      try {
        var sMax = (A.ArticlesProgress && typeof A.ArticlesProgress.starsMax === 'function') ? (A.ArticlesProgress.starsMax() || 5) : 5;
        var s = (A.ArticlesProgress && typeof A.ArticlesProgress.getStars === 'function') ? (Number(A.ArticlesProgress.getStars(deckKey, w.id)) || 0) : 0;
        s = Math.max(0, Math.min(sMax, s));
        return s >= sMax;
      } catch(e){ return false; }
    }

    function isWholeDeckLearned(){
      try {
        var sMax = (A.ArticlesProgress && typeof A.ArticlesProgress.starsMax === 'function') ? (A.ArticlesProgress.starsMax() || 5) : 5;
        for (var i=0;i<deck.length;i++){
          var w = deck[i];
          if (!w) continue;
          var s = (A.ArticlesProgress && typeof A.ArticlesProgress.getStars === 'function') ? (Number(A.ArticlesProgress.getStars(deckKey, w.id)) || 0) : 0;
          if (Math.max(0, Math.min(sMax, s)) < sMax) return false;
        }
        return true;
      } catch(e){ return false; }
    }

    function sliceFor(iSet){
      var start = iSet * setSize;
      var end = Math.min(deck.length, start + setSize);
      return deck.slice(start, end);
    }

    // если сет полностью выучен по артиклям — автопереход по кругу (1:1 с обычным тренером)
    function isCurrentSetComplete(iSet){
      try {
        var sl = sliceFor(iSet);
        if (!sl.length) return false;
        for (var i=0;i<sl.length;i++){
          if (!isLearnedArticle(sl[i])) return false;
        }
        return true;
      } catch(e){ return false; }
    }

    if (isCurrentSetComplete(idx)) {
      var nextIdx = (idx + 1) % totalSets;
      try { if (A.Trainer && typeof A.Trainer.setBatchIndex === 'function') A.Trainer.setBatchIndex(nextIdx, deckKey); } catch(e){}
      idx = nextIdx;
    }

    var slice = sliceFor(idx);
    var eligible = [];
    for (var i=0;i<slice.length;i++){
      var w = slice[i];
      if (!w) continue;
      var a = parseArticle(w.word || w.term || w.de || '');
      if (ALLOWED[a] && !isLearnedArticle(w)) eligible.push(w);
    }
    if (!eligible.length) {
      if (isWholeDeckLearned()) eligible = slice.slice();
      else {
        // пробуем следующий сет
        var nidx = (idx + 1) % totalSets;
        try { if (A.Trainer && typeof A.Trainer.setBatchIndex === 'function') A.Trainer.setBatchIndex(nidx, deckKey); } catch(e){}
        var ns = sliceFor(nidx);
        eligible = ns.filter(function(w){ return w && !isLearnedArticle(w); });
        if (!eligible.length) eligible = ns.slice();
      }
    }

    // --- Weighted sampling 1:1 по идее, но на ArticlesProgress + lastSeenArticles ---
    _state = _state || {};
    _state.lastSeen = _state.lastSeen || {};
    var now = Date.now();

    // настройка частоты появления выученных (берём существующую из обычного тренера)
    var learnedRepeat = 0;
    try {
      learnedRepeat = Number((A.settings && (A.settings.learnedRepeat || A.settings.learned_repeat)) || 0);
      if (!Number.isFinite(learnedRepeat)) learnedRepeat = 0;
    } catch(e){ learnedRepeat = 0; }

    function weightFor(w){
      try {
        var sMax = (A.ArticlesProgress && typeof A.ArticlesProgress.starsMax === 'function') ? (A.ArticlesProgress.starsMax() || 5) : 5;
        var s = (A.ArticlesProgress && typeof A.ArticlesProgress.getStars === 'function') ? (Number(A.ArticlesProgress.getStars(deckKey, w.id)) || 0) : 0;
        s = Math.max(0, Math.min(sMax, s));

        var base = 1;

        // выученные — почти исключаем, но допускаем согласно learnedRepeat (как в обычном тренере)
        if (s >= sMax) {
          if (learnedRepeat <= 0) return 0.0001;
          base *= Math.max(0.0001, learnedRepeat);
        }

        // чем меньше звёзд — тем чаще (квадратично)
        var miss = (sMax - s);
        base *= (1 + miss * miss);

        // давность показа
        var last = Number(_state.lastSeen[String(w.id)] || 0) || 0;
        var age = now - last;
        if (last > 0) {
          if (age < 8 * 1000) base *= 0.05;
          else if (age < 20 * 1000) base *= 0.15;
          else if (age < 60 * 1000) base *= 0.35;
          else base *= 1.0;
        }

        // защита от повтора подряд
        if (lastWordId && String(w.id) === String(lastWordId)) base *= 0.01;

        return Math.max(0.0001, base);
      } catch(e){
        return 1;
      }
    }

    var total = 0;
    var weights = [];
    for (var k=0;k<eligible.length;k++){
      var w = eligible[k];
      var ww = weightFor(w);
      weights[k] = ww;
      total += ww;
    }
    if (total <= 0) {
      // fallback
      var pick = eligible[Math.floor(Math.random() * eligible.length)];
      return pick || null;
    }

    var r = Math.random() * total;
    for (var k2=0;k2<eligible.length;k2++){
      r -= weights[k2];
      if (r <= 0) return eligible[k2];
    }
    return eligible[Math.floor(Math.random() * eligible.length)] || null;
  }


  function buildViewModel() {
    var w = currentWord;
    var raw = w ? (w.word || w.term || w.de || '') : '';
    var correct = parseArticle(raw);
    return {
      active: active,
      deckKey: deckKey,
      mode: mode,
      wordId: w ? w.id : '',
      wordDisplay: stripArticle(raw),
      translation: tTranslation(w),
      promptKey: 'choose_article',
      promptRu: 'Выберите артикль',
      promptUk: 'Оберіть артикль',
      options: ['der', 'die', 'das'],
      correct: correct
    };
  }

  function notifyUpdate() {
    // Кард-шелл может подписаться на это событие.
    try {
      if (window.UIBus && typeof window.UIBus.emit === 'function') {
        window.UIBus.emit('articles:update', buildViewModel());
      }
    } catch (e) {}
  }

  function start(k, m) {
    deckKey = String(k || '').trim();
    mode = String(m || 'default');
    active = true;

    // статистика сессии
    try { if (A.ArticlesStats && A.ArticlesStats.startSession) A.ArticlesStats.startSession(); } catch (e) {}

    currentWord = pickNextWord();
    lastWordId = currentWord ? String(currentWord.id) : '';
    notifyUpdate();
  }

  function stop() {
    active = false;
    deckKey = '';
    mode = 'default';
    currentWord = null;
    lastWordId = '';
    try { if (A.ArticlesStats && A.ArticlesStats.endSession) A.ArticlesStats.endSession(); } catch (e) {}
    notifyUpdate();
  }

  function next() {
    if (!active) return;
    currentWord = pickNextWord();
    lastWordId = currentWord ? String(currentWord.id) : '';
    notifyUpdate();
  }

  function answer(article) {
    if (!active || !currentWord) return { ok: false, correct: '' };
    var raw = currentWord.word || currentWord.term || currentWord.de || '';
    var correct = parseArticle(raw);
    var picked = norm(article);
    var ok = picked === correct;

    try {
      if (A.ArticlesProgress && typeof A.ArticlesProgress.onAnswer === 'function') {
        A.ArticlesProgress.onAnswer(deckKey, currentWord.id, ok);
      }
    } catch (e) {}

    try {
      if (A.ArticlesStats && typeof A.ArticlesStats.onAnswer === 'function') {
        A.ArticlesStats.onAnswer(ok);
      }
    } catch (e) {}
    try {
      // recency + anti-repeat state (по аналогии с обычным тренером)
      _state = _state || {};
      _state.lastSeen = _state.lastSeen || {};
      _state.lastSeen[String(currentWord.id)] = Date.now();
      lastWordId = String(currentWord.id);
    } catch(_) {}


    return { ok: ok, correct: correct };
  }

  A.ArticlesTrainer = {
    isActive: function () { return !!active; },
    start: start,
    stop: stop,
    next: next,
    answer: answer,
    getViewModel: buildViewModel,
    getCorrectArticle: function(){ try { var raw = currentWord && (currentWord.word || currentWord.term || currentWord.de) || ''; return parseArticle(raw); } catch(_){ return ''; } },
    // helpers (можно использовать из UI)
    _stripArticle: stripArticle,
    _parseArticle: parseArticle
  };
})();
