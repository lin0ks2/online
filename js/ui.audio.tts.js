/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.audio.tts.js
 * Назначение: Озвучка текущего слова в тренере (SpeechSynthesis)
 *   - Кнопка рядом со словом
 *   - Автоозвучка при смене слова
 *   - Двойной клик по кнопке — включить/выключить звук (🔊 / 🔇)
 * Версия: 2.2 (кнопка внутри .trainer-word)
 * Обновлено: 2025-11-23
 * ========================================================== */

(function () {
  'use strict';

  var A = (window.App = window.App || {});

  var LS_KEY = 'mm.audioEnabled.v2';
  var wordObserver = null;

  // включён ли звук (по умолчанию: НЕТ, чтобы не пугать)
  var audioEnabled = loadAudioEnabled();

  function isArticlesMode() {
    try { return A.settings && A.settings.trainerKind === 'articles'; } catch (e) { return false; }
  }

  function isPrepositionsMode() {
    try { return A.settings && A.settings.trainerKind === 'prepositions'; } catch (e) { return false; }
  }

  function isReverseMode() {
    try {
      var el = document.getElementById('trainReverse');
      return !!(el && el.checked);
    } catch (e) {
      return false;
    }
  }

  // запоминаем, какое слово было озвучено автоматически, чтобы не дублировать
  var lastAutoSpokenWord = '';

  function loadAudioEnabled() {
    try {
      var v = window.localStorage.getItem(LS_KEY);
      if (v === '1') return true;   // 1 = звук ВКЛ
      if (v === '0') return false;  // 0 = звук ВЫКЛ
      return false;                 // по умолчанию: выключен
    } catch (e) {
      return false;
    }
  }

  function saveAudioEnabled() {
    try {
      window.localStorage.setItem(LS_KEY, audioEnabled ? '1' : '0');
    } catch (e) {}
  }

  function hasTTS() {
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  // ==========================================================
  // Выбор языка/голоса TTS
  // Важно: язык озвучки должен соответствовать языку текущего словаря,
  // а не "языку обучения" приложения. Иначе в EN-тренере могут звучать
  // числа и фрагменты по DE-голосу (типовой баг, который вы увидели).
  // ==========================================================

  var _voicesCache = null;
  var _voicesReady = false;

  function _loadVoices() {
    try {
      if (!window.speechSynthesis) return [];
      var v = window.speechSynthesis.getVoices ? window.speechSynthesis.getVoices() : [];
      return Array.isArray(v) ? v : [];
    } catch (e) {
      return [];
    }
  }

  function _ensureVoices() {
    if (_voicesReady && _voicesCache) return _voicesCache;
    _voicesCache = _loadVoices();
    if (_voicesCache && _voicesCache.length) _voicesReady = true;
    return _voicesCache || [];
  }

  // 2-letter lang -> reasonable default BCP47
  function _defaultLangTag(lang2) {
    switch (String(lang2 || '').toLowerCase()) {
      case 'en': return 'en-US';
      case 'de': return 'de-DE';
      case 'es': return 'es-ES';
      case 'uk': return 'uk-UA';
      case 'ru': return 'ru-RU';
      case 'fr': return 'fr-FR';
      case 'sr': return 'sr-RS';
      default:   return 'en-US';
    }
  }

  function _lang2FromDeckKey() {
    try {
      // Основной источник истины — активная дека.
      var key = (A.settings && A.settings.lastDeckKey) ? String(A.settings.lastDeckKey) : '';
      if (A.Decks && typeof A.Decks.langOfKey === 'function') {
        var l = A.Decks.langOfKey(key);
        if (l) return String(l).toLowerCase();
      }
      // Фолбэк — префикс ключа вида "en_*".
      var m = key.match(/^([a-z]{2})_/i);
      if (m && m[1]) return String(m[1]).toLowerCase();
    } catch (e) {}
    return null;
  }

  function getTtsLang() {
    // 1) Пытаемся определить язык по текущей деке
    var lang2 = _lang2FromDeckKey();
    // 2) Фолбэк — прежнее поведение (studyLang)
    if (!lang2) lang2 = (A.settings && A.settings.studyLang) ? String(A.settings.studyLang) : 'de';
    return _defaultLangTag(lang2);
  }

  function _pickVoiceForLang(langTag) {
    var voices = _ensureVoices();
    if (!voices || !voices.length) return null;

    var want = String(langTag || '').toLowerCase();
    var want2 = want.slice(0, 2);

    // 1) Exact match
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      if (!v || !v.lang) continue;
      if (String(v.lang).toLowerCase() === want) return v;
    }
    // 2) Prefix match (en-*, de-*)
    for (var j = 0; j < voices.length; j++) {
      var v2 = voices[j];
      if (!v2 || !v2.lang) continue;
      var l2 = String(v2.lang).toLowerCase();
      if (l2.slice(0, 2) === want2) return v2;
    }
    // 3) Anything
    return voices[0] || null;
  }

  function getCurrentWord() {
    // Для тренера предлогов озвучиваем ТО, что реально показано на экране.
    // Это важно, потому что после верного ответа в фразу вставляется предлог.
    try {
      if (isPrepositionsMode()) {
        var el = document.querySelector('.trainer-word');
        var t = el ? (el.textContent || '') : '';
        return String(t || '').replace(/\s+/g, ' ').trim();
      }
    } catch (e) {}

    var w = A.__currentWord || null;
    if (!w) return '';
    var raw = w.wordBasic || w.word || '';
    if (!raw && w.forms && w.forms.base) raw = w.forms.base;
    return String(raw || '').trim();
  }

  // force=true используется для ручной озвучки по кнопке (работает всегда).
  // Returns a Promise that resolves when the utterance finishes (or errors).
  // Used to delay UI transitions until the user has heard the audio.
  function speakText(text, force) {
    if (!A.isPro || !A.isPro()) return null; // озвучка только в PRO
    if (!force && !audioEnabled) return null; // авто-озвучка зависит от переключателя
    if (!hasTTS()) return null;
    if (!text) return null;

    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(String(text));
      // ВАЖНО: жёстко выбираем язык/голос по активной деке.
      // Это устраняет эффект "английский текст + немецкие цифры" при системном DE-голосе.
      u.lang  = getTtsLang();
      try {
        var v = _pickVoiceForLang(u.lang);
        if (v) u.voice = v;
      } catch (_eVoice) {}
      u.rate  = 0.95;
      u.pitch = 1.0;

      return new Promise(function (resolve) {
        var done = false;
        function finish() {
          if (done) return;
          done = true;
          resolve();
        }
        u.onend = finish;
        u.onerror = finish;
        // Some environments may not fire onend reliably after cancel;
        // keep a soft fallback so UI can't hang.
        setTimeout(finish, 6000);
        window.speechSynthesis.speak(u);
      });
    } catch (e) {
      return null;
    }
  }

  function speakCurrentWord(force) {
    var w = getCurrentWord();
    if (!w) return null;
    return speakText(w, !!force);
  }

  /* ========================================================== */

  function updateButtonIcon(btn) {
    if (!btn) return;

    if (!hasTTS() || !A.isPro || !A.isPro()) {
      btn.textContent = '🔇';
      btn.setAttribute('aria-label', 'Озвучка недоступна');
      btn.disabled = true;
      return;
    }

    if (audioEnabled) {
      btn.textContent = '🔊';
      btn.setAttribute('aria-label', 'Озвучить слово');
    } else {
      btn.textContent = '🔇';
      btn.setAttribute('aria-label', 'Озвучка выключена');
    }
  }

  function renderAudioButton() {
    if (!hasTTS()) return;

    var wordEl = document.querySelector('.trainer-word');
    if (!wordEl) return;

    // В тренере предлогов НЕ добавляем кнопку внутрь .trainer-word,
    // чтобы ничего не "прилипало" к тексту фразы.
    var hostEl = wordEl;
    if (isPrepositionsMode()) {
      hostEl = document.querySelector('.home-trainer') || wordEl;

      // если раньше кнопка уже была вставлена в .trainer-word — удаляем
      try {
        var oldInside = wordEl.querySelector('.trainer-audio-btn');
        if (oldInside) oldInside.remove();
      } catch (e) {}
    }

    // ищем кнопку в выбранном хосте
    var btn = hostEl.querySelector('.trainer-audio-btn');

    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'trainer-audio-btn';

      // одиночный клик — озвучка (если звук включён)
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!A.isPro || !A.isPro()) return;
        // Ручная озвучка работает всегда, независимо от состояния авто-озвучки.
        speakCurrentWord(true);
      });

      // двойной клик — вкл/выкл звук
      btn.addEventListener('dblclick', function (e) {
        e.preventDefault();
        if (!A.isPro || !A.isPro()) return;
        audioEnabled = !audioEnabled;
        saveAudioEnabled();
        updateButtonIcon(btn);
      });

      hostEl.appendChild(btn);
    }

    updateButtonIcon(btn);

    // Автоозвучка нового слова — только для word-trainer в прямом режиме.
    // В articles-режиме и в режиме обратного перевода автоозвучку отключаем,
    // чтобы звук не превращался в подсказку.
    if (!isArticlesMode() && !isReverseMode() && !isPrepositionsMode()) {
      var word = getCurrentWord();
      if (word && audioEnabled && word !== lastAutoSpokenWord) {
        lastAutoSpokenWord = word;
        setTimeout(function () {
          speakText(word, false);
        }, 120);
      }
    }
  }
  /* ========================================================== */

  // Следим за изменением .trainer-word и обновляем кнопку/озвучку
  function setupWordObserver() {
    var wordEl = document.querySelector('.trainer-word');

    if (!wordEl || typeof MutationObserver === 'undefined') {
      renderAudioButton();
      return;
    }

    if (wordObserver) {
      wordObserver.disconnect();
      wordObserver = null;
    }

    var lastText = wordEl.textContent || '';

    wordObserver = new MutationObserver(function () {
      var t = wordEl.textContent || '';
      if (t === lastText) return;
      lastText = t;
      renderAudioButton();
    });

    wordObserver.observe(wordEl, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // первый рендер
    renderAudioButton();
  }

  // Глобальный наблюдатель: ждём появления .trainer-word в DOM
  function setupGlobalObserver() {
    if (typeof MutationObserver === 'undefined') return;

    var obs = new MutationObserver(function (mutations) {
      var need = false;
      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (!m.addedNodes) continue;
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType !== 1) continue;
          if (n.matches && n.matches('.trainer-word')) {
            need = true;
            break;
          }
          if (n.querySelector && n.querySelector('.trainer-word')) {
            need = true;
            break;
          }
        }
        if (need) break;
      }
      if (need) {
        setupWordObserver();
      }
    });

    obs.observe(document.body, {
      childList: true,
      subtree: true
    });

    // на случай, если .trainer-word уже есть
    setupWordObserver();
  }

  function init() {
    if (!hasTTS()) return;

    // Голоса часто подгружаются асинхронно (особенно на мобильных).
    // Обновляем кэш, чтобы выбор voice по языку работал стабильно.
    try {
      if (window.speechSynthesis && 'onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = function () {
          _voicesCache = null;
          _voicesReady = false;
          _ensureVoices();
        };
      }
    } catch (_eVoicesChanged) {}

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupGlobalObserver);
    } else {
      setupGlobalObserver();
    }

    // хук для ручного обновления, если понадобится
    (A.AudioTTS = A.AudioTTS || {}).refresh = renderAudioButton;
    // публичный хелпер: озвучить произвольный текст и дождаться завершения
    A.AudioTTS.speakText = function (text, force) {
      return speakText(text, !!force);
    };
    A.AudioTTS.setEnabled = function (flag) {
      audioEnabled = !!flag;
      saveAudioEnabled();
      var btn = document.querySelector('.trainer-audio-btn');
      if (btn) updateButtonIcon(btn);
    };
    // Озвучка после верного ответа:
    // - articles trainer: всегда
    // - word trainer: только в режиме обратного перевода (чтобы не было подсказки при показе вопроса)
    A.AudioTTS.onCorrect = function () {
      if (!isArticlesMode() && !isReverseMode() && !isPrepositionsMode()) return;
      if (!A.isPro || !A.isPro()) return;
      if (!audioEnabled) return;
      try {
        var w = getCurrentWord();
        if (w) lastAutoSpokenWord = w;
      } catch (_e) {}
      return speakCurrentWord(false);
    };
  }

  init();
})();
