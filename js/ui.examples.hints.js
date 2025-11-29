/* =====================================================================
 *  Проект: MOYAMOVA
 *  Файл: ui.examples.hints.js
 *  Назначение: Зона подсказок (примеры / синонимы / антонимы)
 *  Версия: новая многостраничная версия, 2025
 * ===================================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------------
  //  Глобальные переменные модуля (сессия)
  // ---------------------------------------------------------------
  let currentTab = 'examples';   // 'examples' | 'synonyms' | 'antonyms'
  let translationVisible = false;
  let wrongAttempts = 0;

  // ---------------------------------------------------------------
  //  Основной вход: рендер при смене слова
  // ---------------------------------------------------------------
  document.addEventListener('lexitron:trainer-word-changed', function () {
    wrongAttempts = 0;
    translationVisible = false;
    renderAll();
  });

  // ---------------------------------------------------------------
  //  Обработка кликов по ответам (правильный/неправильный/"не знаю")
  // ---------------------------------------------------------------
  document.addEventListener('lexitron:answer-clicked', function (evt) {
    const type = evt.detail?.type;
    if (!type) return;

    if (type === 'correct') {
      translationVisible = true;
      renderBody(); // обновляем
    } else if (type === 'wrong') {
      wrongAttempts += 1;
      if (wrongAttempts >= 2) {
        translationVisible = true;
        renderBody();
      }
    } else if (type === 'dontknow') {
      translationVisible = true;
      renderBody();
    }
  });

  // ---------------------------------------------------------------
  //  Точка рендера всего блока
  // ---------------------------------------------------------------
  function renderAll() {
    renderHeader();
    renderBody();
  }

  // ---------------------------------------------------------------
  //  Доступ к DOM
  // ---------------------------------------------------------------
  function getBodyNode() {
    return document.getElementById('hintsBody');
  }
  function getHeaderLabelNode() {
    return document.getElementById('hintsTabLabel');
  }
  function getPagerNode() {
    return document.getElementById('hintsPager');
  }

  // ---------------------------------------------------------------
  //  Вычисления по слову
  // ---------------------------------------------------------------
  function getWord() {
    return window.A?.__currentWord || null;
  }

  function getLearnLang() {
    return window.App?.settings?.learnLang || 'ru';
  }

  function getExamples(word) {
    return Array.isArray(word.examples) ? word.examples : [];
  }

  function getSynonyms(word) {
    if (!word) return { l2: [], l1: [] };
    const ll = getLearnLang();

    const l2 =
      word.deSynonyms ||
      word.enSynonyms ||
      [];

    const l1 =
      ll === 'uk'
        ? (word.ukSynonyms || word.ruSynonyms || [])
        : (word.ruSynonyms || word.ukSynonyms || []);

    return { l2, l1 };
  }

  function getAntonyms(word) {
    if (!word) return { l2: [], l1: [] };
    const ll = getLearnLang();

    const l2 =
      word.deAntonyms ||
      word.enAntonyms ||
      [];

    const l1 =
      ll === 'uk'
        ? (word.ukAntonyms || word.ruAntonyms || [])
        : (word.ruAntonyms || word.ukAntonyms || []);

    return { l2, l1 };
  }

  // ---------------------------------------------------------------
  //  Рендер заголовка
  // ---------------------------------------------------------------
  function renderHeader() {
    const headerLabel = getHeaderLabelNode();
    const pager = getPagerNode();
    if (!headerLabel || !pager) return;

    // Названия вкладок (i18n)
    const labels = {
      examples: getI18n('hints.tab.examples') || 'Примеры',
      synonyms: getI18n('hints.tab.synonyms') || 'Синонимы',
      antonyms: getI18n('hints.tab.antonyms') || 'Антонимы',
    };

    headerLabel.textContent = labels[currentTab];

    // Индикаторы
    pager.innerHTML = '';

    ['examples', 'synonyms', 'antonyms'].forEach((tab) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hints-dot' + (tab === currentTab ? ' is-active' : '');
      btn.dataset.tab = tab;

      btn.addEventListener('click', () => {
        currentTab = tab;
        renderHeader();
        renderBody();
      });

      pager.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------
  //  Рендер содержимого
  // ---------------------------------------------------------------
  function renderBody() {
    const body = getBodyNode();
    if (!body) return;

    const word = getWord();
    if (!word) {
      body.innerHTML = '';
      return;
    }

    if (currentTab === 'examples') {
      renderExamplesTab(word, body);
    } else if (currentTab === 'synonyms') {
      renderSynonymsTab(word, body);
    } else if (currentTab === 'antonyms') {
      renderAntonymsTab(word, body);
    }
  }

  // ---------------------------------------------------------------
  //  Вкладка: Примеры
  // ---------------------------------------------------------------
  function renderExamplesTab(word, body) {
    const exs = getExamples(word);
    if (!exs.length) {
      body.innerHTML = `<div class="hint-empty">${getI18n('hints.nodata.examples') || 'Для этого слова нет примеров.'}</div>`;
      return;
    }

    const ex = exs[0];
    const l2 = ex.L2 || ex.de || ex.deu || '';
    const tr = selectTranslation(ex);

    const trHtml = translationVisible
      ? `<p class="hint-tr">${escape(tr)}</p>`
      : `<p class="hint-tr hidden">${escape(tr)}</p>`;

    body.innerHTML = `
      <div class="hint-item">
        <p class="hint-l2">${escape(l2)}</p>
        ${tr ? trHtml : ''}
      </div>
    `;
  }

  // ---------------------------------------------------------------
  //  Вкладка: Синонимы
  // ---------------------------------------------------------------
  function renderSynonymsTab(word, body) {
    const { l2, l1 } = getSynonyms(word);

    if (!l2.length && !l1.length) {
      body.innerHTML = `<div class="hint-empty">${getI18n('hints.nodata.synonyms') || 'Для этого слова нет синонимов.'}</div>`;
      return;
    }

    let html = '';

    (l2 || []).forEach((s) => {
      html += blockItem(s, selectTranslationForSingle(s));
    });

    (l1 || []).forEach((s) => {
      html += blockItem(s, s);
    });

    body.innerHTML = html;
  }

  // ---------------------------------------------------------------
  //  Вкладка: Антонимы
  // ---------------------------------------------------------------
  function renderAntonymsTab(word, body) {
    const { l2, l1 } = getAntonyms(word);

    if (!l2.length && !l1.length) {
      body.innerHTML = `<div class="hint-empty">${getI18n('hints.nodata.antonyms') || 'Для этого слова нет антонимов.'}</div>`;
      return;
    }

    let html = '';

    (l2 || []).forEach((s) => {
      html += blockItem(s, selectTranslationForSingle(s));
    });

    (l1 || []).forEach((s) => {
      html += blockItem(s, s);
    });

    body.innerHTML = html;
  }

  // ---------------------------------------------------------------
  //  Генератор блока (L2 сверху, перевод снизу)
  // ---------------------------------------------------------------
  function blockItem(l2text, trtext) {
    const trHtml = translationVisible
      ? `<p class="hint-tr">${escape(trtext || '')}</p>`
      : `<p class="hint-tr hidden">${escape(trtext || '')}</p>`;

    return `
      <div class="hint-item">
        <p class="hint-l2">${escape(l2text)}</p>
        ${trHtml}
      </div>
    `;
  }

  // ---------------------------------------------------------------
  //  Выбор перевода для примера
  // ---------------------------------------------------------------
  function selectTranslation(ex) {
    const ll = getLearnLang();
    if (ll === 'uk') return ex.uk || ex.ru || '';
    return ex.ru || ex.uk || '';
  }

  // Перевод для одного слова (синоним/антоним) — заглушка под словарь
  function selectTranslationForSingle(s) {
    return ''; // реальный перевод даётся из L1 массивов — здесь пусто
  }

  // ---------------------------------------------------------------
  //  Хелперы
  // ---------------------------------------------------------------
  function escape(str) {
    return (str || '').replace(/[&<>"']/g, function (m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m];
    });
  }

  function getI18n(key) {
    return window.I18N?.[window.App?.settings?.uiLang || 'ru']?.[key];
  }

})();
