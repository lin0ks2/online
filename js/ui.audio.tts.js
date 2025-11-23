/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.audio.tts.js
 * Назначение: Озвучка текущего слова в тренере (SpeechSynthesis)
 * Версия: 1.0
 * Обновлено: 2025-11-23
 * ========================================================== */

(function () {
  'use strict';

  var A = (window.App = window.App || {});
  var wordObserver = null;

  /* ----------------------------- Проверка поддержки TTS ----------------------------- */

  function hasTTS() {
    return !!(window.speechSynthesis && window.SpeechSynthesisUtterance);
  }

  /* Язык интерфейса для текстов кнопки/aria */
  function getUiLang() {
    var s =
      (A.settings && (A.settings.lang || A.settings.uiLang)) || null;
    var attr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    var v = (s || attr || 'ru').toLowerCase();
    return v === 'uk' ? 'uk' : 'ru';
  }

  /* ISO-коды для озвучки по языку изучения */
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

  /* ----------------------------- Озвучка ----------------------------- */

  function speakText(text) {
    if (!hasTTS()) return;
    if (!text) return;

    try {
      // отменяем предыдущую озвучку
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(String(text));
      u.lang  = getTtsLang();
      u.rate  = 0.95;   // чуть медленнее
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {
      // молча игнорируем, чтобы не ломать тренер
    }
  }

  function speakCurrentWord() {
    var w = A.__currentWord || null;
    if (!w) {
      // fallback: пробуем прочитать текст из .trainer-word
      var el = document.querySelector('.trainer-word');
      var txt = el && el.textContent;
      speakText(txt);
      return;
    }

    // Берём основную форму слова
    var raw = w.wordBasic || w.word || '';
    if (!raw && w.forms && w.forms.base) {
      raw = w.forms.base;
    }
    speakText(raw);
  }

  /* ----------------------------- Рендер кнопки ----------------------------- */

  function renderAudioButton() {
    if (!hasTTS()) return; // если браузер не умеет — не показываем ничего

    var wordEl = document.querySelector('.trainer-word');
    if (!wordEl) return;

    // Удаляем старую кнопку, если была
    var oldBtn = document.querySelector('.trainer-audio-btn');
    if (oldBtn && oldBtn.parentNode) {
      oldBtn.parentNode.removeChild(oldBtn);
    }

    // Создаём новую кнопку
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'trainer-audio-btn';

    var lang = getUiLang();
    var label = (lang === 'uk')
      ? 'Озвучити слово'
      : 'Озвучить слово';

    btn.setAttribute('aria-label', label);
    btn.innerHTML = '🔊';

    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      speakCurrentWord();
    });

    // Вставляем кнопку сразу под словом
    wordEl.insertAdjacentElement('afterend', btn);
  }

  /* ----------------------------- Наблюдение за тренером ----------------------------- */

  function setupWordObserver() {
    var wordEl = document.querySelector('.trainer-word');

    if (!wordEl || typeof MutationObserver === 'undefined') {
      if (wordObserver) {
        wordObserver.disconnect();
        wordObserver = null;
      }
      // хотя бы один раз попробуем отрисовать
      renderAudioButton();
      return;
    }

    if (wordObserver) {
      wordObserver.disconnect();
      wordObserver = null;
    }

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

    // стартовый рендер
    renderAudioButton();
  }

  function setupGlobalObserver() {
    if (typeof MutationObserver === 'undefined') return;

    var obs = new MutationObserver(function (mutations) {
      var need = false;

      for (var i = 0; i < mutations.length; i++) {
        var m = mutations[i];
        if (!m.addedNodes || !m.addedNodes.length) continue;

        for (var j = 0; j < m.addedNodes.length; j++) {
          var node = m.addedNodes[j];
          if (node.nodeType !== 1) continue;

          if (node.matches && node.matches('.trainer-word')) {
            need = true;
            break;
          }
          if (node.querySelector && node.querySelector('.trainer-word')) {
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
  }

  /* ----------------------------- Публичный хук ----------------------------- */

  function init() {
    if (!hasTTS()) return; // если браузер не умеет — вообще не активируемся
    setupWordObserver();
    setupGlobalObserver();

    // опционально: вручную можно дернуть App.AudioTTS.refresh()
    (A.AudioTTS = A.AudioTTS || {}).refresh = renderAudioButton;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
