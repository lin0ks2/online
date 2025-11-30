/* ui.audio.tts.js — версия с кнопкой в правом нижнем углу */

(function () {
  if (!window.A) window.A = {};

  var audioEnabled = true;
  var lastAutoSpokenWord = null;

  function saveAudioEnabled() {
    try {
      localStorage.setItem('audioEnabled', audioEnabled ? '1' : '0');
    } catch (e) {}
  }

  function loadAudioEnabled() {
    try {
      var v = localStorage.getItem('audioEnabled');
      audioEnabled = v !== '0';
    } catch (e) {
      audioEnabled = true;
    }
  }

  function hasTTS() {
    return !!window.speechSynthesis;
  }

  function speakText(t) {
    if (!hasTTS() || !t) return;
    var u = new SpeechSynthesisUtterance(t);
    speechSynthesis.speak(u);
  }

  function getCurrentWord() {
    var el = document.querySelector('.trainer-word');
    return el ? (el.dataset.word || el.textContent.trim()) : null;
  }

  function speakCurrentWord() {
    var w = getCurrentWord();
    if (!w) return;
    speakText(w);
  }

  function updateButtonIcon(btn) {
    if (!btn) return;
    btn.textContent = audioEnabled ? '🔊' : '🔇';
  }

  function renderAudioButton() {
    if (!hasTTS()) return;

    var wordEl = document.querySelector('.trainer-word');
    if (!wordEl) return;

    var card = wordEl.closest('.trainer-card') || wordEl;

    var btn = card.querySelector('.trainer-audio-btn');

    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'trainer-audio-btn';

      try {
        if (card && !card.style.position) {
          card.style.position = 'relative';
        }
        btn.style.position = 'absolute';
        btn.style.right = '10px';
        btn.style.bottom = '10px';
        btn.style.fontSize = '22px';
        btn.style.background = 'transparent';
        btn.style.border = '0';
        btn.style.cursor = 'pointer';
      } catch (e) {}

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!A.isPro || !A.isPro()) return;
        if (!audioEnabled) return;
        speakCurrentWord();
      });

      btn.addEventListener('dblclick', function (e) {
        e.preventDefault();
        if (!A.isPro || !A.isPro()) return;
        audioEnabled = !audioEnabled;
        saveAudioEnabled();
        updateButtonIcon(btn);
      });

      card.appendChild(btn);
    }

    updateButtonIcon(btn);

    var word = getCurrentWord();
    if (word && audioEnabled && word !== lastAutoSpokenWord) {
      lastAutoSpokenWord = word;
      setTimeout(function () {
        speakText(word);
      }, 120);
    }
  }

  loadAudioEnabled();

  A.renderAudioButton = renderAudioButton;

  document.addEventListener('trainer:wordChanged', renderAudioButton);
  document.addEventListener('DOMContentLoaded', renderAudioButton);
})();
