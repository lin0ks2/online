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

  // новый ключ, чтобы не конфликтовать со старой кривой логикой
  var LS_KEY = 'mm.audioEnabled.v2';
  var wordObserver = null;

  // включён ли звук (по умолчанию: НЕТ, чтобы не пугать)
  var audioEnabled = loadAudioEnabled();

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

  function getTtsLang() {
    var study = (A.settings && A.settings.studyLang) || 'de';
    switch (study) {
      case 'de':
        return 'de-DE';
      case 'en':
        return 'en-US';
      case 'fr':
        return 'fr-FR';
      case 'sr':
        return 'sr-RS';
      default:
        return 'de-DE';
    }
  }

  function findWordElement() {
    try {
      var root = document.querySelector('.trainer-word');
      if (!root) return null;
      var el = root.querySelector('[data-role="word-text"]');
      return el || root;
    } catch (e) {
      return null;
    }
  }

  function getCurrentWord() {
    var el = findWordElement();
    if (!el) return '';
    var txt = '';
    if (el.dataset && el.dataset.word) {
      txt = el.dataset.word;
    } else {
      txt = el.textContent || '';
    }
    txt = String(txt || '').trim();
    // обрезаем служебные символы, если вдруг есть
    return txt.replace(/\s+/g, ' ');
  }

  function speakText(text) {
    if (!A.isPro || !A.isPro()) return; // озвучка только в PRO
    if (!audioEnabled) return;          // звук выключен пользователем
    if (!hasTTS()) return;
    if (!text) return;

    try {
      window.speechSynthesis.cancel();
      var u = new window.SpeechSynthesisUtterance(String(text));
      u.lang = getTtsLang();
      u.rate = 0.95;
      u.pitch = 1.0;
      window.speechSynthesis.speak(u);
    } catch (e) {
      // молча глотаем, озвучка — необязательная фича
    }
  }

  function handleWordMutation() {
    var word = getCurrentWord();
    if (word && audioEnabled && word !== lastAutoSpokenWord) {
      lastAutoSpokenWord = word;
      setTimeout(function () {
        speakText(word);
      }, 120);
    }
  }

  function startObservingWord() {
    try {
      if (wordObserver) {
        wordObserver.disconnect();
        wordObserver = null;
      }

      var target = findWordElement();
      if (!target || !window.MutationObserver) return;

      wordObserver = new MutationObserver(function () {
        handleWordMutation();
      });

      wordObserver.observe(target, {
        childList: true,
        characterData: true,
        subtree: true
      });

      // начальный вызов — на случай, если слово уже отрисовано
      handleWordMutation();
    } catch (e) {
      // не критично
    }
  }

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

  function createAudioButton() {
    var root = document.querySelector('.trainer-word');
    if (!root) return null;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'trainer-audio-btn';
    btn.setAttribute('data-role', 'audio-tts');
    btn.style.marginLeft = '6px';

    updateButtonIcon(btn);

    // одиночный клик — озвучка текущего слова (если включено)
    btn.addEventListener('click', function () {
      if (!audioEnabled) return;
      var w = getCurrentWord();
      if (w) speakText(w);
    });

    // двойной клик — переключение режима (🔊 / 🔇)
    btn.addEventListener('dblclick', function (e) {
      e.preventDefault();
      audioEnabled = !audioEnabled;
      saveAudioEnabled();
      updateButtonIcon(btn);
      if (!audioEnabled) {
        try {
          window.speechSynthesis && window.speechSynthesis.cancel();
        } catch (e2) {}
      } else {
        // если только что включили — можно мягко озвучить текущее слово
        var w = getCurrentWord();
        if (w) speakText(w);
      }
    });

    return btn;
  }

  function renderAudioButton() {
    try {
      var root = document.querySelector('.trainer-word');
      if (!root) return;

      var existing = root.querySelector('.trainer-audio-btn');
      if (existing) {
        updateButtonIcon(existing);
      } else {
        var btn = createAudioButton();
        if (btn) {
          // вставим после текста слова
          root.appendChild(btn);
        }
      }
    } catch (e) {
      // не критично
    }
  }

  function init() {
    if (!hasTTS()) return;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        renderAudioButton();
        startObservingWord();
      });
    } else {
      renderAudioButton();
      startObservingWord();
    }

    // хук для ручного обновления, если понадобится
    (A.AudioTTS = A.AudioTTS || {}).refresh = renderAudioButton;
    A.AudioTTS.setEnabled = function (flag) {
      audioEnabled = !!flag;
      saveAudioEnabled();
      var btn = document.querySelector('.trainer-audio-btn');
      if (btn) updateButtonIcon(btn);
    };
  }

  init();
})();
