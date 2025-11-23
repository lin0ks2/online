/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.trainer.audio.js
 * Назначение: Озвучка текущего слова в тренере
 *  - Кнопка рядом со словом
 *  - Автоозвучка при смене слова
 *  - Двойной клик по кнопке — включить/выключить озвучку
 * Версия: 2.0
 * Обновлено: 2025-11-23
 * ========================================================== */

(function (root) {
  'use strict';

  var doc = root.document;

  // ВКЛ/ВЫКЛ озвучки пользователем (двойной тап по кнопке)
  var audioEnabled = true;

  // Последнее озвученное слово, чтобы не дублировать
  var lastSpokenWord = '';

  // ---------------------------------------------------------
  // Вспомогательные функции
  // ---------------------------------------------------------

  // Текущее слово из App, если есть; иначе — из .trainer-word
  function getCurrentWordText() {
    // 1) Пытаемся взять из App.__currentWord.word (как в подсказках)
    try {
      if (root.App && root.App.__currentWord && root.App.__currentWord.word) {
        var w = String(root.App.__currentWord.word || '').trim();
        if (w) return w;
      }
    } catch (_) { /* ignore */ }

    // 2) Фолбэк: первая текстовая нода inside .trainer-word
    var el = doc.querySelector('.trainer-word');
    if (!el) return '';

    var firstText = '';
    for (var i = 0; i < el.childNodes.length; i++) {
      var node = el.childNodes[i];
      if (node.nodeType === 3) { // TEXT_NODE
        firstText = (node.nodeValue || '').trim();
        if (firstText) break;
      }
    }

    if (!firstText) {
      // если вдруг нет отдельной текстовой ноды, берём текст
      // целиком и выкидываем возможные эмодзи/служебные символы
      firstText = (el.textContent || '').trim();
    }

    // Слово у нас всегда одно: на всякий случай забираем первую "группу"
    return firstText.split(/\s+/)[0] || '';
  }

  // Реальное произнесение текста
  function speakText(text) {
    if (!text || !audioEnabled) return;

    // Используем Web Speech API — ОС сама решает, воспроизводить ли звук.
    if (!('speechSynthesis' in root)) return;

    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'de-DE';

    try {
      root.speechSynthesis.cancel();
    } catch (_) { /* ignore */ }

    root.speechSynthesis.speak(u);
  }

  function speakCurrentWord() {
    var word = getCurrentWordText();
    if (!word) return;
    lastSpokenWord = word;
    speakText(word);
  }

  // ---------------------------------------------------------
  // Кнопка озвучки рядом со словом
  // ---------------------------------------------------------

  function updateButtonIcon(btn) {
    if (!btn) return;

    if (audioEnabled) {
      btn.textContent = '🔊';
      btn.setAttribute('aria-label', 'Прослушать произношение');
    } else {
      btn.textContent = '🔇';
      btn.setAttribute('aria-label', 'Озвучка выключена');
    }
  }

  function ensureAudioButton() {
    var wordEl = doc.querySelector('.trainer-word');
    if (!wordEl) return;

    var btn = wordEl.querySelector('.trainer-audio-btn');
    if (!btn) {
      btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'trainer-audio-btn';

      // обработчик одиночного / двойного клика
      var lastTapTime = 0;
      btn.addEventListener('click', function () {
        var now = Date.now();
        var delta = now - lastTapTime;
        lastTapTime = now;

        // Простое определение double tap: два клика за < 300 мс
        if (delta > 0 && delta < 300) {
          // double tap — переключаем режим
          audioEnabled = !audioEnabled;
          updateButtonIcon(btn);
          return;
        }

        // single tap — озвучиваем слово (если звук не выключен)
        if (audioEnabled) {
          speakCurrentWord();
        }
      });

      wordEl.appendChild(btn);
    }

    updateButtonIcon(btn);
  }

  // ---------------------------------------------------------
  // Автоозвучка при смене слова
  // ---------------------------------------------------------

  function autoSpeakIfChanged() {
    var word = getCurrentWordText();
    if (!word) return;
    if (word === lastSpokenWord) return;

    lastSpokenWord = word;

    if (audioEnabled) {
      speakText(word);
    }
  }

  function setupWordObserver() {
    if (!('MutationObserver' in root)) {
      // без MutationObserver — просто один раз попробуем
      ensureAudioButton();
      autoSpeakIfChanged();
      return;
    }

    var wordEl = doc.querySelector('.trainer-word');
    if (!wordEl) {
      return;
    }

    // Первый прогон
    ensureAudioButton();
    autoSpeakIfChanged();

    var obs = new MutationObserver(function () {
      // при любой смене содержимого .trainer-word:
      ensureAudioButton();
      autoSpeakIfChanged();
    });

    obs.observe(wordEl, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // ---------------------------------------------------------
  // Инициализация
  // ---------------------------------------------------------

  function init() {
    if (doc.readyState === 'loading') {
      doc.addEventListener('DOMContentLoaded', setupWordObserver, { once: true });
    } else {
      setupWordObserver();
    }
  }

  init();

  // Public API, если вдруг пригодится
  root.TrainerAudio = root.TrainerAudio || {};
  root.TrainerAudio.speakCurrentWord = speakCurrentWord;
  root.TrainerAudio.setEnabled = function (enabled) {
    audioEnabled = !!enabled;
    // обновим иконку, если кнопка уже есть
    var btn = doc.querySelector('.trainer-audio-btn');
    if (btn) updateButtonIcon(btn);
  };

})(window);
/* ========================= Конец файла: ui.trainer.audio.js ========================= */
