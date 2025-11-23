/* ==========================================================
 * Озвучка слова: кнопка + автоозвучка
 * ========================================================== */

(function (root) {
  'use strict';

  var doc = root.document;
  var lastSpoken = '';

  // ---- ТЕКУЩЕЕ СЛОВО И ПРОИЗНОШЕНИЕ ------------------------

  function getCurrentWordText() {
    var el = doc.querySelector('.trainer-word');
    if (!el) return '';
    return (el.textContent || '').trim();
  }

  // эта функция у тебя уже была — используй свою реализацию
  function speakText(text) {
    if (!text) return;

    // пример через Web Speech (если у тебя свой speakWord – оставь его)
    if (!('speechSynthesis' in root)) return;

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';
    root.speechSynthesis.cancel();
    root.speechSynthesis.speak(u);
  }

  function speakCurrentWord() {
    var text = getCurrentWordText();
    if (!text) return;
    speakText(text);
  }

  // ---- РИСУЕМ КНОПКУ И КЛАДЁМ ЕЁ ВНУТРЬ .trainer-word -----

  function ensureAudioButton() {
    var wordEl = doc.querySelector('.trainer-word');
    if (!wordEl) return;

    // ищем существующую кнопку
    var btn = doc.querySelector('.trainer-audio-btn');

    if (!btn) {
      btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'trainer-audio-btn';
      btn.setAttribute('type', 'button');
      btn.setAttribute('aria-label', 'Прослушать произношение');

      // иконка — пока emoji, потом можно заменить на SVG
      btn.textContent = '🔊';

      btn.addEventListener('click', function () {
        speakCurrentWord();
      });
    }

    // ВАЖНО: кладём кнопку ВНУТРЬ заголовка, сразу после текста
    if (!wordEl.contains(btn)) {
      wordEl.appendChild(btn);
    }
  }

  // ---- АВТООЗВУЧКА ПРИ СМЕНЕ СЛОВА -------------------------

  function autoSpeakOnChange(newText) {
    newText = (newText || '').trim();
    if (!newText || newText === lastSpoken) return;
    lastSpoken = newText;
    speakText(newText);
  }

  function setupWordObserver() {
    if (!('MutationObserver' in root)) {
      return;
    }

    var wordEl = doc.querySelector('.trainer-word');
    if (!wordEl) return;

    var lastText = (wordEl.textContent || '').trim();

    var obs = new MutationObserver(function () {
      var current = (wordEl.textContent || '').trim();
      if (current === lastText) return;
      lastText = current;

      ensureAudioButton();       // держим кнопку при слове
      autoSpeakOnChange(current); // автоозвучка
    });

    obs.observe(wordEl, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // первый запуск
    ensureAudioButton();
    autoSpeakOnChange(lastText);
  }

  // ---- ИНИЦИАЛИЗАЦИЯ ---------------------------------------

  function init() {
    // ждём, пока DOM и тренер появятся
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', setupWordObserver, { once: true });
    } else {
      setupWordObserver();
    }
  }

  init();

  // на всякий случай экспортируем ручной вызов
  root.TrainerAudio = root.TrainerAudio || {};
  root.TrainerAudio.speakCurrentWord = speakCurrentWord;

})(window);
