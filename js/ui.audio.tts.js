/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.audio.tts.js
 * Назначение: Озвучка текущего слова в тренере (SpeechSynthesis)
 * Версия: 1.2
 * Обновлено: 2025-11-23
 * ========================================================== */

(function () {
  'use strict';

  var A = (window.App = window.App || {});
  var wordObserver = null;

  function hasTTS() {
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  function getTtsLang() {
    var study = (A.settings && A.settings.studyLang) || 'de';
    switch (study) {
      case 'de': return 'de-DE';
      case 'en': return 'en-US';
      case 'fr': return 'fr-FR';
      case 'sr': return 'sr-RS';
      case 'es': return 'es-ES';
      default:   return 'de-DE';
    }
  }

  function getUiLang() {
    var s =
      (A.settings && (A.settings.lang || A.settings.uiLang)) || null;
    var attr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    var v = (s || attr || 'ru').toLowerCase();
    return v === 'uk' ? 'uk' : 'ru';
  }

  // --- Озвучивание текста ---
  function speakText(text) {
    if (!hasTTS() || !text) return;

    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(String(text));
      u.lang  = getTtsLang();
      u.rate  = 0.95;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // --- Озвучить текущее слово ---
  function speakCurrentWord() {
    var w = A.__currentWord;
    if (w) speakText(w.wordBasic || w.word || '');
    else {
      var el = document.querySelector('.trainer-word');
      speakText(el && el.textContent);
    }
  }

  /* ==========================================================
   * === AUDIO BUTTON POSITION BLOCK ===
   * Кнопка 🔊 вставляется СРАЗУ ПОСЛЕ .trainer-word
   * Хочешь изменить расположение — редактируй только этот блок
   * ========================================================== */
  function renderAudioButton() {
    if (!hasTTS()) return;

    // удаляем старую кнопку, если есть
    var old = document.querySelector('.trainer-audio-btn');
    if (old) old.remove();

    var wordEl = document.querySelector('.trainer-word');
    if (!wordEl) return;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'trainer-audio-btn';

    var lang = getUiLang();
    btn.setAttribute(
      'aria-label',
      lang === 'uk' ? 'Озвучити слово' : 'Озвучить слово'
    );

    btn.innerHTML = '🔊';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      speakCurrentWord();
    });

    // Вставляем кнопку сразу после слова
    wordEl.insertAdjacentElement('afterend', btn);

    // ✅ Авто-озвучивание нового слова
    setTimeout(speakCurrentWord, 120);
  }
  /* ========================================================== */

  // --- Следим за сменой слова ---
  function setupWordObserver() {
    var wordEl = document.querySelector('.trainer-word');
    if (!wordEl || typeof MutationObserver === 'undefined') {
      renderAudioButton();
      return;
    }

    if (wordObserver) wordObserver.disconnect();
    var last = wordEl.textContent || '';

    wordObserver = new MutationObserver(function () {
      var t = wordEl.textContent || '';
      if (t === last) return;
      last = t;
      renderAudioButton();
    });

    wordObserver.observe(wordEl, {
      childList: true,
      subtree: true,
      characterData: true
    });

    renderAudioButton();
  }

  // --- Отслеживание появления тренера после навигации ---
  function setupGlobalObserver() {
    if (typeof MutationObserver === 'undefined') return;

    var obs = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var nodes = mutations[i].addedNodes;
        if (!nodes) continue;
        for (var j = 0; j < nodes.length; j++) {
          var n = nodes[j];
          if (
            n.nodeType === 1 &&
            (n.matches('.trainer-word') ||
              n.querySelector?.('.trainer-word'))
          ) {
            setupWordObserver();
            return;
          }
        }
      }
    });

    obs.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    if (!hasTTS()) return;
    setupWordObserver();
    setupGlobalObserver();
    (A.AudioTTS = A.AudioTTS || {}).refresh = renderAudioButton;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
