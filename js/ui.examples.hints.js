/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.examples.hints.js
 * Назначение: Пример использования текущего слова
 *            в зоне .home-hints под сетами (примеры/синонимы/антонимы)
 * Версия: 3.0 (многовкладочная зона + общая логика показа перевода)
 * Обновлено: 2025-11-29
 * ========================================================== */

(function () {
  'use strict';

  const A = (window.App = window.App || {});

  let wordObserver = null;   // наблюдатель за .trainer-word
  let wrongAttempts = 0;     // счётчик неверных ответов для текущего слова
  let currentTab = 'examples'; // 'examples' | 'synonyms' | 'antonyms' — запоминаем на сессию

  /* ----------------------------- Вспомогательные функции ----------------------------- */

  // Язык интерфейса: ru / uk
  function getUiLang() {
    const s = (A.settings && (A.settings.lang || A.settings.uiLang)) || null;
    const attr = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    const v = (s || attr || 'ru').toLowerCase();
    return (v === 'uk') ? 'uk' : 'ru';
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      })[m] || m;
    });
  }

  function escapeRegExp(str) {
    return String(str || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Подсветка тренируемого слова внутри предложения
  function highlightSentence(raw, wordObj) {
    if (!raw || !wordObj) return escapeHtml(raw);

    const w = wordObj && wordObj.word ? String(wordObj.word) : '';
    const lemma = w.trim().split(/\s+/).pop(); // отбрасываем артикль у существительных
    if (!lemma) return escapeHtml(raw);

    const re = new RegExp('\\b' + escapeRegExp(lemma) + '\\b', 'i');
    const m = raw.match(re);
    if (!m) {
      // нет точного совпадения — просто текст без подсветки
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

  // Названия вкладок
  function getTabLabels() {
    const lang = getUiLang();
    if (lang === 'uk') {
      return {
        examples: 'Приклад',
        synonyms: 'Синоніми',
        antonyms: 'Антоніми'
      };
    }
    return {
      examples: 'Пример',
      synonyms: 'Синонимы',
      antonyms: 'Антонимы'
    };
  }

  // Тексты "нет данных"
  function getNoDataText(kind) {
    const lang = getUiLang();
    if (lang === 'uk') {
      if (kind === 'examples') return 'Для цього слова немає прикладів.';
      if (kind === 'synonyms') return 'Для цього слова немає синонімів.';
      if (kind === 'antonyms') return 'Для цього слова немає антонімів.';
      return '';
    }
    // ru
    if (kind === 'examples') return 'Для этого слова нет примеров.';
    if (kind === 'synonyms') return 'Для этого слова нет синонимов.';
    if (kind === 'antonyms') return 'Для этого слова нет антонимов.';
    return '';
  }

  // Выбор массивов синонимов/антонимов по языкам
  function getSynonyms(word) {
    if (!word) return { de: [], l1: [] };

    const uiLang = getUiLang();
    const de = Array.isArray(word.deSynonyms) ? word.deSynonyms : [];
    const ru = Array.isArray(word.ruSynonyms) ? word.ruSynonyms : [];
    const uk = Array.isArray(word.ukSynonyms) ? word.ukSynonyms : [];

    const l1 = (uiLang === 'uk') ? uk : ru;
    return { de, l1 };
  }

  function getAntonyms(word) {
    if (!word) return { de: [], l1: [] };

    const uiLang = getUiLang();
    const de = Array.isArray(word.deAntonyms) ? word.deAntonyms : [];
    const ru = Array.isArray(word.ruAntonyms) ? word.ruAntonyms : [];
    const uk = Array.isArray(word.ukAntonyms) ? word.ukAntonyms : [];

    const l1 = (uiLang === 'uk') ? uk : ru;
    return { de, l1 };
  }

  /* ----------------------------- Заголовок + вкладки ----------------------------- */

  function ensureHeader(section) {
    const bodyEl = section.querySelector('#hintsBody');
    if (!bodyEl) return null;

    let header = section.querySelector('.hints-header');
    if (!header) {
      header = document.createElement('div');
      header.className = 'hints-header';

      const titleEl = document.createElement('div');
      titleEl.className = 'hints-title';
      titleEl.id = 'hintsTabLabel';

      const pager = document.createElement('div');
      pager.className = 'hints-pager';
      pager.id = 'hintsPager';

      header.appendChild(titleEl);
      header.appendChild(pager);

      section.insertBefore(header, bodyEl);
    }

    return header;
  }

  function updateHeader(section) {
    const header = ensureHeader(section);
    if (!header) return;

    const labels = getTabLabels();

    const titleEl = header.querySelector('#hintsTabLabel');
    const pager   = header.querySelector('#hintsPager');
    if (!titleEl || !pager) return;

    // текст заголовка
    titleEl.textContent = labels[currentTab] || labels.examples;

    // индикаторы
    pager.innerHTML = '';

    ['examples', 'synonyms', 'antonyms'].forEach(function (tab) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'hints-dot' + (tab === currentTab ? ' is-active' : '');
      btn.dataset.tab = tab;

      btn.addEventListener('click', function () {
        currentTab = tab;        // запоминаем выбор на сессию
        renderExampleHint();     // перерисовываем содержимое под текущий таб
      });

      pager.appendChild(btn);
    });
  }

  /* ----------------------------- Основной рендер ----------------------------- */

  function renderExamplesTab(word, body) {
    const examples = Array.isArray(word.examples) ? word.examples : [];
    if (!examples.length) {
      body.innerHTML = '<div class="hint-example"><p class="hint-tr is-visible">'
        + escapeHtml(getNoDataText('examples'))
        + '</p></div>';
      return;
    }

    // берём только один основной пример (как раньше)
    const ex  = examples[0] || {};
    const de  = ex.L2 || ex.de || ex.deu || '';
    if (!de) {
      body.innerHTML = '<div class="hint-example"><p class="hint-tr is-visible">'
        + escapeHtml(getNoDataText('examples'))
        + '</p></div>';
      return;
    }

    const uiLang = getUiLang();
    const tr = (uiLang === 'uk')
      ? (ex.uk || ex.ru || '')
      : (ex.ru || ex.uk || '');

    const deHtml = highlightSentence(de, word);
    const trHtml = escapeHtml(tr);

    body.innerHTML =
      '<div class="hint-example">' +
        '<p class="hint-de">' + deHtml + '</p>' +
        (trHtml ? '<p class="hint-tr">' + trHtml + '</p>' : '') +
      '</div>';
  }

  function renderSynonymsTab(word, body) {
    const syn = getSynonyms(word);
    const de  = (syn.de || []).filter(Boolean);
    const l1  = (syn.l1 || []).filter(Boolean);

    if (!de.length && !l1.length) {
      body.innerHTML = '<div class="hint-example"><p class="hint-tr is-visible">'
        + escapeHtml(getNoDataText('synonyms'))
        + '</p></div>';
      return;
    }

    // Строим как "пример": сверху немецкий список, снизу переводный список
    const top = de.join(', ');
    const bottom = l1.join(', ');

    body.innerHTML =
      '<div class="hint-example">' +
        (top ? '<p class="hint-de">' + escapeHtml(top) + '</p>' : '') +
        (bottom ? '<p class="hint-tr">' + escapeHtml(bottom) + '</p>' : '') +
      '</div>';
  }

  function renderAntonymsTab(word, body) {
    const ant = getAntonyms(word);
    const de  = (ant.de || []).filter(Boolean);
    const l1  = (ant.l1 || []).filter(Boolean);

    if (!de.length && !l1.length) {
      body.innerHTML = '<div class="hint-example"><p class="hint-tr is-visible">'
        + escapeHtml(getNoDataText('antonyms'))
        + '</p></div>';
      return;
    }

    const top = de.join(', ');
    const bottom = l1.join(', ');

    body.innerHTML =
      '<div class="hint-example">' +
        (top ? '<p class="hint-de">' + escapeHtml(top) + '</p>' : '') +
        (bottom ? '<p class="hint-tr">' + escapeHtml(bottom) + '</p>' : '') +
      '</div>';
  }

  function renderExampleHint() {
    const body = document.getElementById('hintsBody');
    if (!body) return;

    const section = body.closest('.home-hints');
    if (!section) return;

    updateHeader(section);

    const word = A.__currentWord;
    if (!word) {
      body.innerHTML = '';
      return;
    }

    // активная вкладка — одна на всю сессию
    if (currentTab === 'examples') {
      renderExamplesTab(word, body);
    } else if (currentTab === 'synonyms') {
      renderSynonymsTab(word, body);
    } else if (currentTab === 'antonyms') {
      renderAntonymsTab(word, body);
    } else {
      // fallback на примеры
      renderExamplesTab(word, body);
    }
  }

  /* ----------------------------- Автопоказ + прокрутка перевода ----------------------------- */

  // Прокрутка внутри окна подсказок, если перевод вылез за нижнюю границу
  function ensureTranslationVisible(trEl) {
    const body = document.getElementById('hintsBody');
    if (!body || !trEl) return;

    const bodyRect = body.getBoundingClientRect();
    const trRect   = trEl.getBoundingClientRect();

    // Уже полностью виден — ничего не крутим
    if (trRect.top >= bodyRect.top && trRect.bottom <= bodyRect.bottom) {
      return;
    }

    // Если нижний край ушёл вниз — прокручиваем так, чтобы он оказался в зоне видимости
    const delta = trRect.bottom - bodyRect.bottom;
    body.scrollTop += delta + 14; // небольшой запас
  }

  // Показ перевода (для всех блоков в активной вкладке)
  function showTranslation() {
    const body = document.getElementById('hintsBody');
    if (!body) return;

    const trs = body.querySelectorAll('.hint-tr');
    if (!trs.length) return;

    trs.forEach(function (trEl) {
      trEl.classList.add('is-visible');
    });

    // следим, чтобы нижний не спрятался под скролл
    ensureTranslationVisible(trs[trs.length - 1]);
  }

  /* ----------------------------- Наблюдение за тренером ----------------------------- */

  // локальный observer за .trainer-word — как в 1.2
  function setupWordObserver() {
    if (wordObserver) {
      try { wordObserver.disconnect(); } catch (_) {}
      wordObserver = null;
    }

    const wordEl = document.querySelector('.home-trainer .trainer-word');
    if (!wordEl) return;

    let last = wordEl.textContent || '';

    wordObserver = new MutationObserver(function () {
      const t = wordEl.textContent || '';
      if (t === last) return;
      last = t;

      // новое слово → сбрасываем счётчик неверных попыток
      wrongAttempts = 0;

      // и возвращаем скролл подсказок в начало
      const body = document.getElementById('hintsBody');
      if (body) body.scrollTop = 0;

      // перерисовываем блок подсказок под текущую вкладку
      renderExampleHint();
    });

    wordObserver.observe(wordEl, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Наблюдаем за домом, чтобы при возврате на home заново навесить observer
  function setupGlobalHomeObserver() {
    const obs = new MutationObserver(function () {
      const homeTrainer = document.querySelector('.home-trainer .trainer-word');
      if (!homeTrainer) return;

      // как только снова появился тренер — настраиваем observer
      let needSetup = !wordObserver;
      if (!needSetup && homeTrainer) {
        // если уже есть observer, но элемент сменился — тоже перепривязываем
        needSetup = true;
      }

      if (needSetup) {
        setupWordObserver();
      }
    });

    obs.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* ----------------------------- Обработка кликов ----------------------------- */

  function attachClickHandlers() {
    document.addEventListener('click', function (evt) {
      const target = evt.target;

      // 1) Клик по немецкому примеру — показать/скрыть перевод вручную
      const deEl = target.closest('.hint-de');
      if (deEl) {
        const root = deEl.closest('.hint-example');
        if (!root) return;

        const trEl = root.querySelector('.hint-tr');
        if (!trEl) return;

        const willShow = !trEl.classList.contains('is-visible');

        trEl.classList.toggle('is-visible');

        if (willShow) {
          ensureTranslationVisible(trEl);
        }

        return;
      }

      // 2) Клик по ответу/«Не знаю» → логика 2 ошибок и автопоказ перевода
      const answersGrid = document.querySelector('.home-trainer .answers-grid');
      const idkBtn      = document.querySelector('.home-trainer .idk-btn');

      if (!answersGrid && !idkBtn) return;

      const ansBtn = target.closest('.answers-grid button');
      const isIdk  = idkBtn && target.closest('.idk-btn');

      // 2.1) Клик по варианту ответа
      if (ansBtn && answersGrid && answersGrid.contains(ansBtn)) {
        const isCorrect = ansBtn.classList.contains('is-correct');
        const isWrong   = ansBtn.classList.contains('is-wrong');

        // корректный ответ → сразу показываем перевод
        if (isCorrect) {
          setTimeout(showTranslation, 0);
          return;
        }

        // неправильный ответ → считаем попытки, на 2-й показываем перевод
        if (isWrong) {
          wrongAttempts += 1;
          if (wrongAttempts >= 2) {
            setTimeout(showTranslation, 0);
          }
        }

        return;
      }

      // 2.2) Клик по "Не знаю" → как раньше, сразу показываем перевод
      if (isIdk) {
        setTimeout(showTranslation, 0);
        return;
      }
    });
  }

  /* ----------------------------- Инициализация ----------------------------- */

  function init() {
    attachClickHandlers();
    setupWordObserver();       // следим за сменой слова в тренере
    setupGlobalHomeObserver(); // восстанавливаем observer после навигации

    // ручной хук, если понадобится
    (A.HintsExamples = A.HintsExamples || {}).refresh = renderExampleHint;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
