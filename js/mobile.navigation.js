/* MOYAMOVA 1.11.3 — Mobile navigation migration layer.
 * Home is migrated first. Other screens keep the legacy mobile shell until
 * their dedicated mobile redesign is approved.
 */
(function () {
  'use strict';

  const mq = window.matchMedia ? window.matchMedia('(max-width: 899px)') : null;
  const docEl = document.documentElement;

  function uiLang() {
    try {
      if (window.App && App.settings && App.settings.uiLang) return App.settings.uiLang;
      return localStorage.getItem('uiLang') || localStorage.getItem('mm.uiLang') || 'ru';
    } catch (_) {
      return 'ru';
    }
  }

  function isMobile() {
    return !!(mq && mq.matches);
  }

  function isHomeMounted() {
    const app = document.getElementById('app');
    if (!app) return false;
    return !!app.querySelector('.dashboard');
  }

  function syncShell() {
    const home = isMobile() && isHomeMounted();
    if (home) docEl.dataset.mobileShell = 'home';
    else if (docEl.dataset.mobileShell === 'home') delete docEl.dataset.mobileShell;

    const btn = document.getElementById('btnMenu');
    if (btn) {
      if (home) {
        const uk = uiLang() === 'uk';
        btn.setAttribute('aria-label', uk ? 'Налаштування' : 'Настройки');
        btn.setAttribute('title', uk ? 'Налаштування' : 'Настройки');
      } else {
        btn.removeAttribute('title');
      }
    }

    // Close a legacy drawer if Home was mounted while it was open.
    if (home && document.body.classList.contains('menu-open')) {
      document.body.classList.remove('menu-open');
      const oc = document.querySelector('.oc-root');
      if (oc) oc.setAttribute('aria-hidden', 'true');
    }
  }

  // Capture before the legacy burger listener. On migrated Home the same
  // physical control opens Settings directly instead of the side drawer.
  document.addEventListener('click', function (e) {
    if (!isMobile() || docEl.dataset.mobileShell !== 'home') return;
    const btn = e.target && e.target.closest ? e.target.closest('#btnMenu') : null;
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === 'function') e.stopImmediatePropagation();

    try {
      if (window.App && App.Router && typeof App.Router.routeTo === 'function') {
        App.Router.routeTo('settings');
      }
    } catch (_) {}
  }, true);

  const app = document.getElementById('app');
  if (app && window.MutationObserver) {
    new MutationObserver(syncShell).observe(app, { childList: true, subtree: false });
  }

  if (mq) {
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', syncShell);
    else if (typeof mq.addListener === 'function') mq.addListener(syncShell);
  }

  window.addEventListener('pageshow', syncShell);
  window.addEventListener('resize', syncShell);
  document.addEventListener('DOMContentLoaded', syncShell);
  setTimeout(syncShell, 0);
})();
