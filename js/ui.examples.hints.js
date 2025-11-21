/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.examples.hints.js
 * Назначение: Пример использования текущего слова
 *            в зоне .home-hints под сетами
 * Версия: 1.3 (глобальный observer, без подсветки форм)
 * Обновлено: 2025-11-21
 * ========================================================== */

(function () {
  'use strict';

  const A = (window.App = window.App || {});

  let isRendering = false; // защита от циклов MutationObserver

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
    if (isRendering) return;
    isRendering = true;

    try {
      const section = document.querySelector('.home-hints');
      const body = document.getElementById('hintsBody');
      if (!section || !body) {
        isRendering = false;
        return;
      }

      ensureTitle(section);

      const word = A.__currentWord;
      if (!word || !Array.isArray(word.examples) || !word.examples.length) {
        body.innerHTML = '';
        isRendering = false;
        return;
      }

      const ex = word.examples[0] || {};
      const de = ex.L2 || ex.de || ex.deu || '';
      if (!de) {
        body.innerHTML = '';
        isRendering = false;
        return;
      }

      const uiLang = getUiLang();
      const tr = (uiLang === 'uk')
        ? (ex.uk || ex.ru || '')
        : (ex.ru || ex.uk || '');

      const deHtml = escapeHtml(de);
      const trHtml = escapeHtml(tr);

      // По умолчанию показываем только немецкий пример,
      // перевод скрыт (CSS: display:none), кликом по примеру — показываем.
      body.innerHTML =
        '<div class="hint-example">' +
          '<p class="hint-de">' + deHtml + '</p>' +
          (trHtml
            ? '<p class="hint-tr">' + trHtml + '</p>'
            : '') +
        '</div>';
    } finally {
      isRendering = false;
    }
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

  // Глобальный observer: следим за тем, появилось ли на экране
  // комбо "home-hints + trainer-word + App.__currentWord"
  function setupGlobalObserver() {
    const observer = new MutationObserver(function () {
      const hasHome = document.querySelector('.home-hints');
      const trainer = document.querySelector('.trainer-word');
      if (!hasHome || !trainer || !A.__currentWord) return;

      // как только все три сущности на месте — перерисовываем подсказку
      renderExampleHint();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // первый рендер на стартовом экране
    renderExampleHint();
  }

  function init() {
    attachClickHandler();
    setupGlobalObserver();

    // ручной вызов на всякий случай, если понадобится
    (A.HintsExamples = A.HintsExamples || {}).refresh = renderExampleHint;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
