/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: app.shell.view.js
 * Назначение: Отрисовка шапки, футера и оболочки приложения
 * Версия: 1.0
 * Обновлено: 2025-11-17
 * ========================================================== */

(function () {
  'use strict';

  var root = document.getElementById('moya-shell-root') || document.body;
  if (!root) return;

  // Env gate for TWA. TWA should be launched with start_url like: /?twa=1
  // In TWA we must not show any external payment/donation entry points.
  var isTwa = false;
  try {
    isTwa = String(location.search || '').indexOf('twa=1') !== -1;
  } catch (_) {
    isTwa = false;
  }

  var donateBtnHtml = isTwa
   var donateBtnHtml = isTwa
  ? '<button class="action-btn action-btn--stub" type="button" disabled aria-label="🙂">🙂</button>'
  : '<button class="action-btn" data-action="donate" aria-label="Поддержать проект">💰</button>';

  // Показываем расширенные настройки только в установленном режиме (PWA/TWA).
  // В браузере места меньше, и UX становится хрупким.
  function isPwaOrTwaRunmode(){
    // Android TWA: start_url adds ?twa=1
    if (isTwa) return true;
    try {
      // Современный способ
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) return true;
    } catch(_){ }
    try {
      // iOS-специфика (старые версии)
      if (typeof window.navigator !== 'undefined' && window.navigator.standalone === true) return true;
    } catch(_){ }
    try {
      // Фолбэк: если ядро уже проставило атрибут
      var rm = String(document.documentElement.getAttribute('data-runmode') || document.documentElement.dataset.runmode || '').toLowerCase();
      if (rm === 'pwa') return true;
    } catch(_){ }
    return false;
  }

  var showPwaMenuTools = isPwaOrTwaRunmode();

  var pwaMenuHtml = showPwaMenuTools ? (
    '' +
    '<div class="mm-prefs-wrap">' +
    '<div class="menu-item mm-prefs mm-prefs-focus">' +
      '<div class="menu-label mm-prefs-title" data-i18n="menuFocus">Концентрация</div>' +
      '<div class="mm-prefs-grid mm-prefs-grid-2">' +
        '<label class="mm-check"><input type="checkbox" id="focusSets"><span data-i18n="focusSets">Сеты</span></label>' +
        '<label class="mm-check"><input type="checkbox" id="focusContext"><span data-i18n="focusContext">Контекст</span></label>' +
      '</div>' +
    '</div>' +

    '<div class="menu-item mm-prefs mm-prefs-training">' +
      '<div class="menu-label mm-prefs-title" data-i18n="menuTrainingMode">Режим тренировки</div>' +
      '<div class="mm-prefs-grid">' +
        '<div class="mm-prefs-row">' +
          '<div class="mm-prefs-left" data-i18n="trainTranslate">Перевод</div>' +
          '<label class="mm-check mm-check-compact"><input type="checkbox" id="trainReverse"><span data-i18n="trainReverse">Обратный</span></label>' +
        '</div>' +
        '<div class="mm-prefs-row">' +
          '<div class="mm-prefs-left" data-i18n="trainSetsNav">Переход по сетам</div>' +
          '<label class="mm-check mm-check-compact"><input type="checkbox" id="trainAutostep"><span data-i18n="trainAuto">Авто</span></label>' +
        '</div>' +
      '</div>' +
	    '</div>' +
	    '</div>'
  ) : '';

  root.innerHTML =
    '<header class="header">' +
      '<div class="brand">' +
        '<a class="brand-link" href="./" aria-label="Главная" data-i18n-aria="ariaHome">' +
          '<img src="./img/logo_64.png" alt="MOYAMOVA">' +
          '<h1 class="brand-title">MOYAMOVA</h1>' +
          '' +
        '</a>' +
      '</div>' +
      '<button id="btnMenu" class="burger" aria-label="Меню" data-i18n-aria="ariaMenu">☰</button>' +
    '</header>' +

    '<main id="app" class="content"></main>' +

    '<div class="oc-root" aria-hidden="true">' +
      '<div class="oc-overlay" data-close="overlay"></div>' +
      '<aside class="oc-panel" role="menu" aria-label="Меню">' +
        '<div class="oc-header">' +
          '<button class="oc-back" aria-label="Назад" data-close="back" data-i18n-aria="ariaBack">←</button>' +
          '<div class="oc-title">Меню</div>' +
          '<button class="oc-close" aria-label="Закрыть" data-close="close" data-i18n-aria="ariaClose">✕</button>' +
        '</div>' +

        '<div class="oc-body">' +
          '<div class="menu-item theme-toggle">' +
            '<div class="menu-label" data-i18n="menuTheme">Тема</div>' +
            '<div class="theme-switch">' +
              '<span class="theme-label light" role="img" aria-label="Светлая тема">☀️</span>' +
              '<label class="switch">' +
                '<input type="checkbox" id="themeToggle" aria-label="Переключить тему">' +
                '<span class="slider"></span>' +
              '</label>' +
              '<span class="theme-label dark" role="img" aria-label="Тёмная тема">🌙</span>' +
            '</div>' +
          '</div>' +

          '<div class="menu-item lang-toggle">' +
            '<div class="menu-label" data-i18n="menuUiLang">Язык интерфейса</div>' +
            '<div class="lang-switch">' +
              '<span class="lang-label left" role="img" aria-label="Русский">🇷🇺</span>' +
              '<label class="switch">' +
                '<input type="checkbox" id="langToggle" aria-label="Переключить язык интерфейса">' +
                '<span class="slider"></span>' +
              '</label>' +
              '<span class="lang-label right" role="img" aria-label="Українська">🇺🇦</span>' +
            '</div>' +
          '</div>' +

          '<div class="menu-item level-toggle">' +
            '<div class="menu-label" data-i18n="menuLevel">Режим сложности</div>' +
            '<div class="level-switch">' +
              '<span class="level-label left" role="img" aria-label="Обычный уровень">🐣</span>' +
              '<label class="switch">' +
                '<input type="checkbox" id="levelToggle" aria-label="Переключить уровень сложности">' +
                '<span class="slider"></span>' +
              '</label>' +
              '<span class="level-label right" role="img" aria-label="Сложный уровень">🦅</span>' +
            '</div>' +
          '</div>' +

          pwaMenuHtml +

          '<div class="menu-item backup-tools">' +
            '<div class="menu-label" data-i18n="menuBackup">Резервное копирование</div>' +
            '<div class="backup-row">' +
              '<button type="button" class="backup-btn" data-action="export" data-i18n="btnExport">Экспорт</button>' +
              '<button type="button" class="backup-btn" data-action="import" data-i18n="btnImport">Импорт</button>' +
            '</div>' +
          '</div>' +

          '<div class="menu-item updates-check">' +
            '<div class="menu-label" data-i18n="menuUpdates">Обновления</div>' +
            '<div class="updates-row">' +
              '<button class="primary-btn" id="btnCheckUpdates" data-i18n="btnCheckUpdates">Проверить обновления</button>' +
            '</div>' +
          '</div>' +

          '<div class="menu-item app-version" aria-live="polite">' +
            '<div class="menu-label" data-i18n="menuAppVersion">Версия приложения</div>' +
            '<div class="app-version-value" id="appVersion">—</div>' +
          '</div>' +
        '</div>' +

        '<div class="actions-row-bottom" role="group" aria-label="Быстрые действия">' +
          '<button class="action-btn" data-action="guide"   aria-label="Инструкция" data-i18n-aria="ariaGuide">📘</button>' +
          donateBtnHtml +
          '<button class="action-btn" data-action="contact" aria-label="Связаться">✉️</button>' +
          '<button class="action-btn" data-action="share"   aria-label="Поделиться">🔗</button>' +
          '<button class="action-btn" data-action="legal"   aria-label="Юридическая информация">⚖️</button>' +
        '</div>' +
      '</aside>' +
    '</div>' +

    '<footer class="app-footer" role="navigation" aria-label="Основная навигация">' +
      '<button class="nav-btn active" data-action="home" aria-label="Главная">' +
        '<span class="nav-icon" data-icon="home"></span>' +
      '</button>' +
      '<button class="nav-btn" data-action="dicts" aria-label="Словари" data-i18n-aria="ariaDicts">' +
        '<span class="nav-icon" data-icon="book"></span>' +
      '</button>' +
      '<button class="nav-btn" data-action="fav" aria-label="Избранное" data-i18n-aria="ariaFav">' +
        '<span class="nav-icon" data-icon="star"></span>' +
      '</button>' +
      '<button class="nav-btn" data-action="mistakes" aria-label="Мои ошибки" data-i18n-aria="ariaMistakes">' +
        '<span class="nav-icon" data-icon="warning"></span>' +
      '</button>' +
      '<button class="nav-btn" data-action="stats" aria-label="Статистика" data-i18n-aria="ariaStats">' +
        '<span class="nav-icon" data-icon="stats"></span>' +
      '</button>' +
    '</footer>' +

    '<div class="rotate-lock" role="dialog" aria-modal="true" aria-live="polite">' +
      '<div class="rotate-card">' +
        '<div class="rotate-emoji" aria-hidden="true">📱</div>' +
        '<div class="rotate-title" data-title-key="rotateToPortraitTitle" data-title-fallback="Поверните устройство">' +
          'Поверните устройство' +
        '</div>' +
        '<div class="rotate-text" data-title-key="rotateToPortraitText" data-title-fallback="Доступен только портретный режим. Пожалуйста, используйте приложение вертикально.">' +
          'Доступен только портретный режим. Пожалуйста, используйте приложение вертикально.' +
        '</div>' +
      '</div>' +
    '</div>';

  /* ===================== Hidden dictionaries gate (Beta mode) ===================== */
  function __mm_isBetaEnabled(){
    try { return localStorage.getItem('mm_beta') === '1'; } catch(_){ return false; }
  }
  function __mm_setBetaEnabled(v){
    try { localStorage.setItem('mm_beta', v ? '1' : '0'); } catch(_){}
  }
  function __mm_toast(msg){
    try { if (window.App && App.Msg && typeof App.Msg.toast === 'function') { App.Msg.toast(String(msg||''), 2200); return; } } catch(_){}
    try { console.log('[MoyaMova]', msg); } catch(_){}
  }

  // 7 taps on "App version" menu item toggles Beta mode (shows hidden dictionaries)
  (function __mm_initBetaTapOnVersion(){
    var el = document.querySelector('.menu-item.app-version');
    if (!el) return;

    var taps = 0;
    var timer = null;
    function reset(){
      taps = 0;
      if (timer) { clearTimeout(timer); timer = null; }
    }

    el.addEventListener('click', function(){
      taps += 1;
      if (timer) clearTimeout(timer);
      timer = setTimeout(reset, 1800);

      if (taps >= 7){
        reset();
        var next = !__mm_isBetaEnabled();
        __mm_setBetaEnabled(next);
        __mm_toast(next ? 'Beta mode: ON' : 'Beta mode: OFF');
        // Reload to re-render dictionaries list cleanly
        try { location.reload(); } catch(_){}
      }
    }, { passive: true });
  })();

})();
/* ========================= Конец файла: app.shell.view.js ========================= */
