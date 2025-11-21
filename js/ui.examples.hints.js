/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.examples.hints.js
 * Назначение: Вывод примера использования текущего слова
 *            в зоне .home-hints под сетами
 * Версия: 1.1
 * Обновлено: 2025-11-21
 * ========================================================== */

(function () {
  'use strict';

  const A = (window.App = window.App || {});

  /* ----------------------------- Вспомогательные функции ----------------------------- */

  // Язык интерфейса: ru / uk
  function getUiLang() {
    const s = (A.settings && (A.settings.lang || A.settings.uiLang)) || null;
    const attr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    const v = (s || attr || 'ru').toLowerCase();
    return (v === 'uk') ? 'uk' : 'ru';
  }

  // Экранируем HTML
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Экранируем для RegExp
  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Подсвечиваем целевое слово в немецком примере (только точное совпадение леммы)
  function highlightSentence(sentence, wordObj) {
    if (!sentence) return '';
    const raw = String(sentence);

    // исходное немецкое слово из словаря
    const w = wordObj && wordObj.word ? String(wordObj.word) : '';
    const lemma = w.trim().split(/\s+/).pop(); // отбрасываем артикль у существительных
    if (!lemma) return escapeHtml(raw);

    const pattern = new RegExp('\\b' + escapeRegExp(lemma) + '\\b', 'i');
    const m = raw.match(pattern);
    if (!m) {
      // если точного совпадения нет – просто вернём экранированный текст без подсветки
      return escapeHtml(raw);
    }

    const idx = m.index;
    const match = m[0];
    const before = raw.slice(0, idx);
    const after  = raw.slice(idx + match.length);

    return (
      escapeHtml(before) +
      '<span class="hint-word">' + escapeHtml(match) + '</span>' +
      escapeHtml(after)
    );
  }

  // Обеспечиваем наличие заголовка "Пример использования / Приклад вживання"
  function ensureTitle(section) {
    const bodyEl = section.querySelector('#hintsBody');
    if (!bodyEl) return;

    let titleEl = section.querySelector('.hints-title');
    if (!titleEl) {
      titleEl = document.createElement('div');
      titleEl.className = 'hints-title';
      section.insertBefore(titleEl, bodyEl);
    }

    const lang = getUiLang();
    titleEl.textContent = (lang === 'uk')
      ? 'Приклад вживання'
      : 'Пример использования';
  }

  /* ----------------------------- Основной рендер ----------------------------- */

  function renderExampleHint() {
    const section = document.querySelector('.home-hints');
    const body = document.getElementById('hintsBody');
    if (!section || !body) return;

    ensureTitle(section);

    const word = A.__currentWord;
    if (!word || !Array.isArray(word.examples) || !word.examples.length) {
      body.innerHTML = '';
      return;
    }

    const ex = word.examples[0] || {};
    const de = ex.L2 || ex.de || ex.deu || '';
    if (!de) {
      body.innerHTML = '';
      return;
    }

    const uiLang = getUiLang();
    const tr = (uiLang === 'uk')
      ? (ex.uk || ex.ru || '')
      : (ex.ru || ex.uk || '');

    const deHtml = highlightSentence(de, word);
    const trHtml = escapeHtml(tr);

    // ВАЖНО: по умолчанию показываем только немецкий пример,
    // перевод скрыт (CSS: display:none), кликом по примеру — показываем.
    body.innerHTML =
      '<div class="hint-example">' +
        '<p class="hint-de">' + deHtml + '</p>' +
        (trHtml
          ? '<p class="hint-tr">' + trHtml + '</p>'
          : '') +
      '</div>';
  }

  /* ----------------------------- Инициализация / подписки ----------------------------- */

  // Клик по немецкому примеру — показать/скрыть перевод
  function attachClickHandler() {
    document.addEventListener('click', function (evt) {
      const deEl = evt.target.closest('.hint-de');
      if (!deEl) return;

      const root = deEl.closest('.hint-example');
      if (!root) return;

      const trEl = root.querySelector('.hint-tr');
      if (!trEl) return;

      trEl.classList.toggle('is-visible');
    });
  }

  function setupObserver() {
    const wordEl = document.querySelector('.trainer-word');
    if (!wordEl || typeof MutationObserver === 'undefined') {
      renderExampleHint();
      return;
    }

    let last = wordEl.textContent || '';
    const obs = new MutationObserver(function () {
      const t = wordEl.textContent || '';
      if (t === last) return;
      last = t;
      renderExampleHint();
    });

    obs.observe(wordEl, { childList: true, subtree: true, characterData: true });

    // первый рендер для уже выведенного слова
    renderExampleHint();
  }

  function init() {
    attachClickHandler();

    // ждём появления trainer-word (home уже смонтирован и отрисован)
    if (document.querySelector('.trainer-word')) {
      setupObserver();
      return;
    }

    const maxMs = 5000;
    const start = Date.now();
    const timer = setInterval(function () {
      if (document.querySelector('.trainer-word')) {
        clearInterval(timer);
        setupObserver();
        return;
      }
      if (Date.now() - start > maxMs) {
        clearInterval(timer);
      }
    }, 150);

    // ручной вызов на всякий случай
    (A.HintsExamples = A.HintsExamples || {}).refresh = renderExampleHint;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
