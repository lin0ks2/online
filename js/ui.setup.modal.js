/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.setup.modal.js
 * Назначение: Мастер начальной настройки (язык, словарь, согласия)
 * Версия: 1.0
 * Обновлено: 2025-11-17
 * ========================================================== */

(function (root) {
  'use strict';

  // Hidden dictionaries gate (Beta mode). By default hide Serbian (sr) from setup.
  function __mm_isBetaEnabled(){
    try { return localStorage.getItem('mm_beta') === '1'; } catch(_){ return false; }
  }



  var doc = root.document;

  // Ключи StartupManager
  var LS_UI_LANG       = 'lexitron.uiLang';
  var LS_STUDY_LANG    = 'lexitron.studyLang';
  var LS_DECK_KEY      = 'lexitron.deckKey';
  var LS_LEGACY_ACTIVE = 'lexitron.activeKey';
  var LS_SETUP_DONE    = 'lexitron.setupDone';

  // Вспомогательные ключи
  var LS_TOS_ACCEPTED = 'mm.tosAccepted';
  var LS_GA_CHOICE    = 'mm.gaChoice'; // 'granted' / 'denied'

  /* ---------------------------------------
   * LocalStorage helpers
   * ------------------------------------ */

  function lsGet(key, def) {
    try {
      var v = root.localStorage.getItem(key);
      return v === null ? def : v;
    } catch (e) {
      return def;
    }
  }

  function lsSet(key, val) {
    try {
      root.localStorage.setItem(key, val);
    } catch (e) {
      // ignore
    }
  }

  function lsRemove(key) {
    try {
      root.localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  }

  /* ---------------------------------------
   * State
   * ------------------------------------ */

  var state = {
    uiLang: 'ru',
    studyLang: 'de',
    level: 'normal',
    tosAccepted: false,
    gaAccepted: false
  };

  function initStateFromStorage() {
  var ui = lsGet(LS_UI_LANG, 'ru');
  if (ui !== 'ru' && ui !== 'uk') ui = 'ru';
  state.uiLang = ui;

  var studyDefault = (STUDY_LANGS[0] && STUDY_LANGS[0].code) || 'de';
  var study = lsGet(LS_STUDY_LANG, studyDefault);

  var allowedStudy = STUDY_LANGS.map(function (it) { return it.code; });
  if (allowedStudy.indexOf(study) === -1) {
    study = studyDefault;
  }
  state.studyLang = study;

  state.level = 'normal';

  state.tosAccepted = lsGet(LS_TOS_ACCEPTED, '') === '1';
  state.gaAccepted  = lsGet(LS_GA_CHOICE, '') === 'granted';
}

  /* ---------------------------------------
   * Texts
   * ------------------------------------ */

  function t() {
    var ru = state.uiLang !== 'uk';

    if (ru) {
      return {
        title: 'MOYAMOVA — тренажёр слов',
        subtitle: 'Карточки для изучения языков — работает офлайн.',
        intro:
          'Учите и повторяйте иностранные слова по карточкам, отслеживайте прогресс. Без регистрации и интернета.',
        uiLabel: 'Язык интерфейса',
        studyLabel: 'Язык, который вы хотите изучать',
        levelLabel: 'Режим сложности',
        normalTitle: 'Обычный режим',
        hardTitle: 'Сложный режим',
        note: 'Все эти настройки можно изменить позже в меню.',
        start: 'Старт',
        langRu: 'Русский',
        langUk: 'Украинский',
        tosLabel: 'Я принимаю условия использования приложения.',
        gaLabel:
          'Разрешаю анонимную статистику использования.'
      };
    }

    return {
      title: 'MOYAMOVA — тренажер слів',
      subtitle: 'Картки для вивчення мов — працює офлайн.',
      intro:
        'Вивчайте й повторюйте іноземні слова за картками та відстежуйте прогрес. Без реєстрації та інтернету.',
      uiLabel: 'Мова інтерфейсу',
      studyLabel: 'Мова, яку ви хочете вивчати',
      levelLabel: 'Режим складності',
      normalTitle: 'Звичайний режим',
      hardTitle: 'Складний режим',
      note: 'Усі ці налаштування можна змінити пізніше в меню.',
      start: 'Старт',
      langRu: 'Російська',
      langUk: 'Українська',
      tosLabel: 'Я приймаю умови використання застосунку.',
      gaLabel:
        'Дозволяю анонімну статистику використання.'
    };
  }

    // Полный список поддерживаемых языков обучения (мастер-список)
  var STUDY_LANGS_MASTER = [
    { code: 'de', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'en', flag: '🇬🇧', label: 'English' },
    { code: 'fr', flag: '🇫🇷', label: 'Français' },
    { code: 'sr', flag: '🇷🇸', label: 'Srpski' },
    { code: 'es', flag: '🇪🇸', label: 'Español' }
  ];

  // Определяем, для каких языков реально есть словари (по window.decks)
  function detectAvailableStudyLangCodes() {
    try {
      var decks = (root.decks || window.decks || {});
      var langs = [];
      for (var key in decks) {
        if (!decks.hasOwnProperty(key)) continue;
        var arr = decks[key];
        if (!Array.isArray(arr) || !arr.length) continue;

        // ключ вида "de_verbs" -> "de"
        var lang = String(key).split('_')[0].toLowerCase();
        if (lang && langs.indexOf(lang) === -1) {
          langs.push(lang);
        }
      }
      if (langs.length) return langs;
    } catch (_) {}

    // Фолбэк: если по какой-то причине ничего не нашли —
    // считаем, что доступны все языки из мастер-списка
    return STUDY_LANGS_MASTER.map(function (it) { return it.code; });
  }

  // Итоговый список языков для мастера, отфильтрованный по реально доступным словарям
  var STUDY_LANGS = (function () {
    var available = detectAvailableStudyLangCodes();
    return STUDY_LANGS_MASTER.filter(function (item) {
      if (item.code === 'sr' && !__mm_isBetaEnabled()) return false;
      return available.indexOf(item.code) !== -1;
    });
  })();

  /* ---------------------------------------
   * DOM helpers
   * ------------------------------------ */

  function createOverlayIfNeeded() {
    var existing = doc.querySelector('[data-setup-overlay]');
    if (existing) return existing;

    var overlay = doc.createElement('div');
    overlay.className = 'setup-overlay';
    overlay.setAttribute('data-setup-overlay', '1');

    overlay.innerHTML = [
      '<div class="setup-backdrop"></div>',
      '<div class="setup-modal">',
      '  <div class="setup-modal__inner">',
      '    <div class="setup-header">',
      '      <h2 class="setup-title" data-setup-title></h2>',
      '      <p class="setup-subtitle" data-setup-subtitle></p>',
      '      <p class="setup-intro" data-setup-intro></p>',
      '    </div>',
      '    <div class="setup-section">',
      '      <div class="setup-section__label" data-setup-ui-label></div>',
      '      <div class="setup-mode-toggle setup-mode-toggle--lang" data-setup-ui-flags></div>',
      '    </div>',
      '    <div class="setup-section">',
      '      <div class="setup-section__label" data-setup-study-label></div>',
      '      <div class="setup-flags-row" data-setup-study-flags></div>',
      '    </div>',
      '    <div class="setup-section">',
      '      <div class="setup-section__label" data-setup-level-label></div>',
      '      <div class="setup-mode-toggle" data-setup-level-toggle></div>',
      '    </div>',
      '    <div class="setup-consent" data-setup-consent></div>',
      '    <p class="setup-note" data-setup-note></p>',
      '    <div class="setup-footer">',
      '      <button type="button" class="setup-start-btn" data-setup-start></button>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');

    doc.body.appendChild(overlay);
    return overlay;
  }

  /* UI language — segmented control */

  function renderUiLangToggle(rootEl) {
    if (!rootEl) return;

    var msgs = t();
    var current = state.uiLang === 'uk' ? 'uk' : 'ru';

    rootEl.innerHTML = '';

    var langs = [
      { code: 'ru', flag: '🇷🇺', label: msgs.langRu },
      { code: 'uk', flag: '🇺🇦', label: msgs.langUk }
    ];

    langs.forEach(function (lang) {
      var isActive = lang.code === current;

      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className =
        'setup-mode-btn setup-mode-btn--lang' +
        (isActive ? ' is-active' : '');
      btn.setAttribute('data-lang', lang.code);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.setAttribute('aria-label', lang.label);

      btn.innerHTML =
        '<span aria-hidden="true">' +
        lang.flag +
        '</span><span>' +
        lang.label +
        '</span>';

      btn.addEventListener('click', function () {
        if (state.uiLang === lang.code) return;
        state.uiLang = lang.code;
        lsSet(LS_UI_LANG, state.uiLang);
        renderAll();
      });

      rootEl.appendChild(btn);
    });
  }

  /* Study language — только флаги */

  function renderStudyLangFlags(rootEl) {
    if (!rootEl) return;

    rootEl.innerHTML = '';

    STUDY_LANGS.forEach(function (item) {
      var isActive = item.code === state.studyLang;

      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className =
        'setup-flag-btn' + (isActive ? ' is-active' : '');
      btn.setAttribute('data-lang', item.code);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      btn.setAttribute('aria-label', item.label);

      btn.innerHTML =
        '<span class="setup-flag-btn__flag" aria-hidden="true">' +
        item.flag +
        '</span>';

      btn.addEventListener('click', function () {
        if (state.studyLang === item.code) return;
        state.studyLang = item.code;
        lsSet(LS_STUDY_LANG, state.studyLang);
        renderStudyLangFlags(rootEl);
      });

      rootEl.appendChild(btn);
    });
  }

  /* Difficulty toggle — 🐣 / 🦅 */

  function renderLevelToggle(rootEl) {
    if (!rootEl) return;

    var msgs = t();
    rootEl.innerHTML = '';

    var configs = [
      {
        code: 'normal',
        label: msgs.normalTitle,
        icon: '🐣'
      },
      {
        code: 'hard',
        label: msgs.hardTitle,
        icon: '🦅'
      }
    ];

    configs.forEach(function (cfg) {
      var isActive = cfg.code === state.level;

      var btn = doc.createElement('button');
      btn.type = 'button';
      btn.className =
        'setup-mode-btn' + (isActive ? ' is-active' : '');
      btn.setAttribute('data-level', cfg.code);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');

      btn.innerHTML =
        '<span aria-hidden="true">' +
        cfg.icon +
        '</span><span>' +
        cfg.label +
        '</span>';

      btn.addEventListener('click', function () {
        if (state.level === cfg.code) return;
        state.level = cfg.code;
        renderLevelToggle(rootEl);
      });

      rootEl.appendChild(btn);
    });
  }

  /* ---------------------------------------
   * Consents (TOS + GA)
   * ------------------------------------ */

  function attachCheckboxHandlers(wrapper, input, onChange) {
    if (!wrapper || !input) return;

    wrapper.addEventListener('click', function (ev) {
      ev.preventDefault();
      var checked = !wrapper.classList.contains('setup-checkbox--checked');
      if (checked) {
        wrapper.classList.add('setup-checkbox--checked');
      } else {
        wrapper.classList.remove('setup-checkbox--checked');
      }
      input.checked = checked;
      if (onChange) onChange(checked);
    });
  }

  function renderConsents(rootEl) {
  if (!rootEl) return;
  var msgs = t();

  rootEl.innerHTML = [
    '<label class="setup-checkbox" data-setup-tos-wrapper>',
    '  <input type="checkbox" data-setup-tos>',
    '  <span class="setup-checkbox__box"></span>',
    '  <span class="setup-checkbox__label onboarding-terms-text" data-setup-tos-label></span>',
    '</label>',
    '<label class="setup-checkbox" data-setup-ga-wrapper>',
    '  <input type="checkbox" data-setup-ga>',
    '  <span class="setup-checkbox__box"></span>',
    '  <span class="setup-checkbox__label" data-setup-ga-label></span>',
    '</label>'
  ].join('');

  var tosWrapper = rootEl.querySelector('[data-setup-tos-wrapper]');
  var tosInput   = rootEl.querySelector('[data-setup-tos]');
  var tosLabel   = rootEl.querySelector('[data-setup-tos-label]');
  var gaWrapper  = rootEl.querySelector('[data-setup-ga-wrapper]');
  var gaInput    = rootEl.querySelector('[data-setup-ga]');
  var gaLabel    = rootEl.querySelector('[data-setup-ga-label]');

  // Лейбл TOS — текст, но теперь с классом onboarding-terms-text
  if (tosLabel) {
    tosLabel.textContent = msgs.tosLabel;
  }
  if (gaLabel) {
    gaLabel.textContent = msgs.gaLabel;
  }

  // initial states
  if (state.tosAccepted && tosWrapper) {
    tosWrapper.classList.add('setup-checkbox--checked');
  }
  if (state.gaAccepted && gaWrapper) {
    gaWrapper.classList.add('setup-checkbox--checked');
  }
  if (tosInput) tosInput.checked = state.tosAccepted;
  if (gaInput) gaInput.checked   = state.gaAccepted;

  // handlers
  attachCheckboxHandlers(tosWrapper, tosInput, function (checked) {
    state.tosAccepted = checked;
    lsSet(LS_TOS_ACCEPTED, checked ? '1' : '');
    updateStartDisabled();
  });

  attachCheckboxHandlers(gaWrapper, gaInput, function (checked) {
    state.gaAccepted = checked;
  });
}

  /* ---------------------------------------
   * GA consent integration
   * ------------------------------------ */

  function applyGaChoice(granted) {
    lsSet(LS_GA_CHOICE, granted ? 'granted' : 'denied');

    if (root.GAConsent && typeof root.GAConsent.applyChoice === 'function') {
      try {
        root.GAConsent.applyChoice(granted);
        return;
      } catch (e) {
        // ignore
      }
    }

    try {
      if (root.gtag && typeof root.gtag === 'function') {
        root.gtag('consent', 'update', {
          analytics_storage: granted ? 'granted' : 'denied'
        });
      }
    } catch (e) {
      // ignore
    }
  }

  /* ---------------------------------------
   * Deck resolution for selected studyLang
   * ------------------------------------ */

  function resolveDeckForStudyLang() {
    var lang = state.studyLang;
    if (!lang) return null;

    try {
      if (root.StartupManager && StartupManager._util) {
        var util = StartupManager._util;

        if (typeof util.firstNonEmptyForLang === 'function') {
          var key = util.firstNonEmptyForLang(lang);
          if (key) return key;
        }
        if (typeof util.firstForLang === 'function') {
          return util.firstForLang(lang);
        }
      }
    } catch (e) {
      // ignore
    }

    return null;
  }

  /* ---------------------------------------
   * Render root
   * ------------------------------------ */

  function renderAll() {
    var overlay = createOverlayIfNeeded();
    var msgs = t();

    overlay.querySelector('[data-setup-title]').textContent    = msgs.title;
    overlay.querySelector('[data-setup-subtitle]').textContent = msgs.subtitle;
    overlay.querySelector('[data-setup-intro]').textContent    = msgs.intro;
    overlay.querySelector('[data-setup-ui-label]').textContent     = msgs.uiLabel;
    overlay.querySelector('[data-setup-study-label]').textContent  = msgs.studyLabel;
    overlay.querySelector('[data-setup-level-label]').textContent  = msgs.levelLabel;
    overlay.querySelector('[data-setup-note]').textContent         = msgs.note;

    var startBtn = overlay.querySelector('[data-setup-start]');
    startBtn.textContent = msgs.start;

    renderUiLangToggle(
      overlay.querySelector('[data-setup-ui-flags]')
    );
    renderStudyLangFlags(
      overlay.querySelector('[data-setup-study-flags]')
    );
    renderLevelToggle(
      overlay.querySelector('[data-setup-level-toggle]')
    );
    renderConsents(overlay.querySelector('[data-setup-consent]'));
    updateStartDisabled();
  }

  function updateStartDisabled() {
    var overlay = doc.querySelector('[data-setup-overlay]');
    if (!overlay) return;
    var btn = overlay.querySelector('[data-setup-start]');
    if (!btn) return;
    btn.disabled = !state.tosAccepted;
  }

  /* ---------------------------------------
   * Show / hide & apply
   * ------------------------------------ */

  function openModal() {
    try { if (root.App && root.App.stopAllTrainers) root.App.stopAllTrainers('setup:open'); } catch(_){ }
    initStateFromStorage();
    renderAll();

    var overlay = createOverlayIfNeeded();
    overlay.classList.add('is-open');

    try {
      doc.dispatchEvent(new CustomEvent('lexitron:setup'));
    } catch (e) {
      // ignore
    }

    var startBtn = overlay.querySelector('[data-setup-start]');
    if (!startBtn._setupBound) {
      startBtn._setupBound = true;
      startBtn.addEventListener('click', onStart);
    }
  }

  function closeModal() {
    var overlay = doc.querySelector('[data-setup-overlay]');
    if (overlay) {
      overlay.classList.remove('is-open');
    }
  }

  function applyToAppSettings() {
    var A = root.App;
    if (!A) return;

    if (!A.settings) {
      A.settings = {};
    }

    A.settings.uiLang    = state.uiLang;
    A.settings.studyLang = state.studyLang;
    A.settings.level     = state.level === 'hard' ? 'hard' : 'normal';

     if (typeof A.saveSettings === 'function') {
    A.saveSettings();
  }
}

  function onStart() {
  if (!state.tosAccepted) {
    return;
  }

  // 1) сохраняем выбор языка интерфейса и языка обучения
  lsSet(LS_UI_LANG,    state.uiLang);
  lsSet(LS_STUDY_LANG, state.studyLang);

  // 2) подбираем стартовую деку под язык обучения
  var deckKey = resolveDeckForStudyLang();
  if (deckKey) {
    lsSet(LS_DECK_KEY,      deckKey);
    lsSet(LS_LEGACY_ACTIVE, deckKey);
  }

  // 3) TOS и GA
  lsSet(LS_TOS_ACCEPTED, '1');
  applyGaChoice(state.gaAccepted);

  // 4) внутренние настройки приложения (на всякий случай)
  applyToAppSettings();

  // 4a) Аккуратно синхронизируем базовые настройки (в т.ч. level) в k_settings_v1_3_1
  try {
    var LS_SETTINGS = 'k_settings_v1_3_1';
    var raw = localStorage.getItem(LS_SETTINGS);
    var base = {};
    if (raw) {
      try { base = JSON.parse(raw) || {}; } catch(_) { base = {}; }
    }

    // Обновляем только то, чем управляет мастер
    base.uiLang    = state.uiLang;
    base.studyLang = state.studyLang;
    base.level     = state.level === 'hard' ? 'hard' : 'normal';

    localStorage.setItem(LS_SETTINGS, JSON.stringify(base));
  } catch(_) {}
    
  // 5) помечаем, что мастер пройден
  lsSet(LS_SETUP_DONE, 'true');

  // 6) закрываем мастер
 // closeModal();

  // 7) КРИТИЧНО: даём приложению стартануть "с нуля"
  //    уже с новыми настройками из localStorage.
  root.location.reload();
}
  /* ---------------------------------------
   * Public API
   * ------------------------------------ */

  var SetupModal = {
    build: function () {
      openModal();
    },
    open: function () {
      openModal();
    },
    reset: function () {
      lsRemove(LS_TOS_ACCEPTED);
      lsRemove(LS_GA_CHOICE);
      lsRemove(LS_SETUP_DONE);
      openModal();
    }
  };

  root.SetupModal = SetupModal;

})(window);
/* ========================= Конец файла: ui.setup.modal.js ========================= */
