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

  // Поведение ответов должно совпадать 1:1 с базовым тренером:
  // - штраф за неправильный ответ только один раз на слово
  // - после правильного ответа ввод блокируется и идём дальше
  var solved = false;
  var penalized = false;

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
    try { ui = (A.settings && (A.settings.lang || A.settings.uiLang)) || ''; } catch (e) {}
    if (String(ui).toLowerCase() === 'uk') return String(w.uk || w.ua || w.ru || '').trim();
    return String(w.ru || w.uk || '').trim();
  }

  function pickNextWord() {
    // 1:1 с базовым тренером: берём deck slice (учитывает активный набор/батч)
    // и выбираем индекс через sampleNextIndexWeighted(), если доступно.
    var slice = [];
    try {
      if (A.Trainer && typeof A.Trainer.getDeckSlice === 'function') {
        slice = A.Trainer.getDeckSlice(deckKey) || [];
      }
    } catch (e) {}

    // fallback: полный deck
    if (!slice || !slice.length) {
      slice = getDeck();
    }
    if (!slice || !slice.length) return null;

    function pickIndex(arr) {
      try {
        if (A.Trainer && typeof A.Trainer.sampleNextIndexWeighted === 'function') {
          return A.Trainer.sampleNextIndexWeighted(arr);
        }
      } catch (e) {}
      return Math.floor(Math.random() * arr.length);
    }

    var tries = 24;
    while (tries-- > 0) {
      var idx = pickIndex(slice);
      var w = slice[idx];
      if (!w) continue;
      if (String(w.id) === String(lastWordId)) continue;
      var a = parseArticle(w.word || w.term || w.de);
      if (!ALLOWED[a]) continue;
      return w;
    }

    // последний шанс: линейный проход
    for (var i = 0; i < slice.length; i++) {
      var ww = slice[i];
      if (!ww) continue;
      var aa = parseArticle(ww.word || ww.term || ww.de);
      if (!ALLOWED[aa]) continue;
      if (String(ww.id) === String(lastWordId)) continue;
      return ww;
    }
    return slice[0] || null;
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

    solved = false;
    penalized = false;

    // статистика сессии
    try { if (A.ArticlesStats && A.ArticlesStats.startSession) A.ArticlesStats.startSession(); } catch (e) {}

    currentWord = pickNextWord();
    lastWordId = currentWord ? String(currentWord.id) : '';
    try { A.__currentWord = currentWord; } catch(e) {}
    notifyUpdate();
  }

  function stop() {
    active = false;
    deckKey = '';
    mode = 'default';
    currentWord = null;
    lastWordId = '';
    solved = false;
    penalized = false;
    try { A.__currentWord = null; } catch(e) {}
    try { if (A.ArticlesStats && A.ArticlesStats.endSession) A.ArticlesStats.endSession(); } catch (e) {}
    notifyUpdate();
  }

  function next() {
    if (!active) return;
    currentWord = pickNextWord();
    lastWordId = currentWord ? String(currentWord.id) : '';
    try { A.__currentWord = currentWord; } catch(e) {}
    solved = false;
    penalized = false;
    notifyUpdate();
  }

  function answer(article) {
    if (!active || !currentWord) return { ok: false, correct: '' };
    var raw = currentWord.word || currentWord.term || currentWord.de || '';
    var correct = parseArticle(raw);
    var picked = norm(article);
    var ok = picked === correct;

    // IMPORTANT: начисление/штраф только 1 раз на слово (как в home.js)
    var applied = false;
    if (ok) {
      if (!solved) {
        solved = true;
        applied = true;
      }
    } else {
      if (!penalized) {
        penalized = true;
        applied = true;
      }
    }

    if (applied) {
      try {
        if (A.ArticlesProgress && typeof A.ArticlesProgress.onAnswer === 'function') {
          A.ArticlesProgress.onAnswer(deckKey, currentWord.id, ok, { mode: mode });
        }
      } catch (e) {}

      try {
        if (A.ArticlesStats && typeof A.ArticlesStats.onAnswer === 'function') {
          A.ArticlesStats.onAnswer(ok);
        }
      } catch (e) {}
    }

    return { ok: ok, correct: correct, applied: applied };
  }

  A.ArticlesTrainer = {
    isActive: function () { return !!active; },
    start: start,
    stop: stop,
    next: next,
    answer: answer,
    getViewModel: buildViewModel,
    getCurrentWord: function(){ return currentWord; },
    // helpers (можно использовать из UI)
    _stripArticle: stripArticle,
    _parseArticle: parseArticle
  };
})();
