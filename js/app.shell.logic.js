/* ==========================================================
   app.shell.logic.js
   ----------------------------------------------------------
   Shell logic: menu open/close, bottom actions, i18n helpers,
   and small UI state updates.
   ========================================================== */
(() => {
  'use strict';

  const root = document.documentElement;

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------
  function qs(sel, el) {
    return (el || document).querySelector(sel);
  }
  function qsa(sel, el) {
    return Array.from((el || document).querySelectorAll(sel));
  }

  // ----------------------------------------------------------
  // Menu open/close (off-canvas)
  // ----------------------------------------------------------
  const ocPanel = qs('#oc-panel');
  const ocOverlay = qs('#oc-overlay');
  const ocBtn = qs('#oc-btn');

  function openMenu() {
    if (!ocPanel) return;
    ocPanel.classList.add('is-open');
    if (ocOverlay) ocOverlay.classList.add('is-open');
    root.classList.add('oc-open');
  }

  function closeMenu() {
    if (!ocPanel) return;
    ocPanel.classList.remove('is-open');
    if (ocOverlay) ocOverlay.classList.remove('is-open');
    root.classList.remove('oc-open');
  }

  function toggleMenu() {
    if (!ocPanel) return;
    if (ocPanel.classList.contains('is-open')) closeMenu();
    else openMenu();
  }

  if (ocBtn) ocBtn.addEventListener('click', toggleMenu);
  if (ocOverlay) ocOverlay.addEventListener('click', closeMenu);

  // Swipe-to-close (simple)
  (function setupSwipeToClose() {
    let startX = null;
    if (!ocPanel) return;
    ocPanel.addEventListener(
      'touchstart',
      (e) => {
        if (!e.touches || !e.touches.length) return;
        startX = e.touches[0].clientX;
      },
      { passive: true }
    );
    ocPanel.addEventListener(
      'touchend',
      (e) => {
        if (startX === null) return;
        const endX = (e.changedTouches && e.changedTouches[0] && e.changedTouches[0].clientX) || startX;
        const dx = endX - startX;
        startX = null;
        // swipe right-to-left closes (panel on the right)
        if (dx > 40) {
          closeMenu();
        }
      },
      { passive: true }
    );
  })();

  // ----------------------------------------------------------
  // Language / i18n (lightweight)
  // ----------------------------------------------------------
  function getLang() {
    try {
      if (window.App && App.settings && App.settings.lang) return App.settings.lang;
    } catch (_) {}
    return 'ru';
  }

  function i18nText(key) {
    try {
      const lang = getLang();
      if (window.I18N && I18N[lang] && I18N[lang][key]) return I18N[lang][key];
      if (window.I18N && I18N.ru && I18N.ru[key]) return I18N.ru[key];
    } catch (_) {}
    return '';
  }

  // ----------------------------------------------------------
  // Bottom button state (PRO/Donate) — patched for Stage 1
  // ----------------------------------------------------------
  function applyProButtonState(){
    try {
      // ЭТАП 1: PRO-активация отключена → всегда показываем Donate в Web/PWA
      // (точка расширения для будущей интеграции Google Play Billing)
      var btn = document.querySelector(
        '.actions-row-bottom .action-btn[data-action="pro"], ' +
        '.actions-row-bottom .action-btn[data-action="donate"]'
      );

      // Всегда Donate
      if (btn) {
        btn.dataset.action = 'donate';
        btn.textContent = '💰';
        btn.setAttribute('aria-label', 'Поддержать проект');
      }

      // Бейдж PRO в шапке сейчас не используем
      var badge = document.querySelector('.header-pro-badge');
      if (badge) badge.classList.remove('is-visible');
    } catch(_) {}
  }

  // ----------------------------------------------------------
  // Version label
  // ----------------------------------------------------------
  function renderVersion() {
    const el = qs('#app-version');
    if (!el) return;
    try {
      const v = (window.App && App.APP_VER) ? App.APP_VER : '';
      if (v) el.textContent = v;
    } catch (_) {}
  }

  // ----------------------------------------------------------
  // Actions (menu buttons)
  // ----------------------------------------------------------
  let actionsMap = {
    guide() {
      // Экран "Инструкция" реализован в js/view.guide.js (объект Guide)
      try {
        if (window.Guide && typeof window.Guide.open === 'function') {
          window.Guide.open();
        } else if (window.App && App.Guide && typeof App.Guide.open === 'function') {
          App.Guide.open();
        } else {
          console.warn('Guide module not found');
        }
      } catch (e) {
        console.warn('guide open error', e);
      }
      // закрываем меню так же, как для остальных действий
      try { closeMenu(); } catch (_) {}
    },

    export() {
      try {
        if (window.App && typeof App.exportAll === 'function') App.exportAll();
      } catch (e) {
        console.warn('export error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    import() {
      try {
        if (window.App && typeof App.openImport === 'function') App.openImport();
      } catch (e) {
        console.warn('import error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    reset() {
      try {
        if (window.App && typeof App.factoryReset === 'function') App.factoryReset();
      } catch (e) {
        console.warn('reset error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    stats() {
      try {
        if (window.App && App.Router && typeof App.Router.routeTo === 'function') App.Router.routeTo('stats');
      } catch (e) {
        console.warn('stats route error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    dicts() {
      try {
        if (window.App && App.Router && typeof App.Router.routeTo === 'function') App.Router.routeTo('dicts');
      } catch (e) {
        console.warn('dicts route error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    fav() {
      try {
        if (window.App && App.Router && typeof App.Router.routeTo === 'function') App.Router.routeTo('fav');
      } catch (e) {
        console.warn('fav route error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    mistakes() {
      try {
        if (window.App && App.Router && typeof App.Router.routeTo === 'function') App.Router.routeTo('mistakes');
      } catch (e) {
        console.warn('mistakes route error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    home() {
      try {
        if (window.App && App.Router && typeof App.Router.routeTo === 'function') App.Router.routeTo('home');
      } catch (e) {
        console.warn('home route error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    theme() {
      try {
        if (window.App && typeof App.toggleTheme === 'function') App.toggleTheme();
      } catch (e) {
        console.warn('theme error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    lang() {
      try {
        if (window.App && typeof App.toggleLang === 'function') App.toggleLang();
      } catch (e) {
        console.warn('lang error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    legal() {
      try {
        if (window.App && App.Legal && typeof App.Legal.open === 'function') {
          App.Legal.open();
        } else if (window.Legal && typeof window.Legal.open === 'function') {
          window.Legal.open();
        } else {
          console.warn('Legal module not found');
        }
      } catch (e) {
        console.warn('legal error', e);
      }
      try { closeMenu(); } catch (_) {}
    },

    pro() {
      // NO-OP
      // PRO-активация временно отключена.
      // Точка сохранена для будущей интеграции Google Play Billing.
      return;
    },

    donate() {
      if (!window.Donate) {
        const s = document.createElement('script');
        s.src = './js/donate.js';
        s.onload = () => {
          if (window.Donate && typeof window.Donate.open === 'function') {
            window.Donate.open();
          }
        };
        document.head.appendChild(s);
      } else {
        if (typeof window.Donate.open === 'function') {
          window.Donate.open();
        }
      }
    },

    contact() {
      location.href = 'mailto:peiko.oleh@gmail.com';
    }
  };

  // ----------------------------------------------------------
  // Bind handlers
  // ----------------------------------------------------------
  // Menu buttons
  qsa('.oc-actions .action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      (actionsMap[act] || function () {})();
      // close menu for most actions
      try { closeMenu(); } catch (_) {}
    });
  });

  // Bottom actions row
  qsa('.actions-row-bottom .action-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.action;
      (actionsMap[act] || function () {})();
    });
  });

  // ----------------------------------------------------------
  // Init
  // ----------------------------------------------------------
  try { renderVersion(); } catch (_) {}
  try { applyProButtonState(); } catch (_) {}

  // expose for other modules if needed
  try {
    if (window.App) {
      App.Shell = App.Shell || {};
      App.Shell.applyProButtonState = applyProButtonState;
      App.Shell.openMenu = openMenu;
      App.Shell.closeMenu = closeMenu;
      App.Shell.toggleMenu = toggleMenu;
    }
  } catch (_) {}
})();
