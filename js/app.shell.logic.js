/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: app.shell.logic.js
 * Назначение: Логика оболочки приложения и переходов между экранами
 * Версия: 1.0
 * Обновлено: 2025-11-17
 * ========================================================== */

(function () {
  'use strict';

  // Высоты header/footer для offcanvas
  function updateHFVars() {
    const h = document.querySelector('.header');
    const f = document.querySelector('.app-footer');
    const rs = document.documentElement.style;

    const hh = h ? Math.round(h.getBoundingClientRect().height) : 0;
    const fh = f ? Math.round(f.getBoundingClientRect().height) : 0;

    rs.setProperty('--header-h', hh + 'px');
    rs.setProperty('--footer-h', fh + 'px');
  }
  window.addEventListener('load', updateHFVars);
  window.addEventListener('resize', updateHFVars);

  const burger  = document.getElementById('btnMenu');
  const ocRoot  = document.querySelector('.oc-root');
  const ocPanel = document.querySelector('.oc-panel');
  const overlay = document.querySelector('.oc-overlay');

  function openMenu(){
    document.body.classList.add('menu-open');
    if (ocRoot) ocRoot.setAttribute('aria-hidden','false');
    updateHFVars();
  }
  function closeMenu(){
    document.body.classList.remove('menu-open');
    if (ocRoot) ocRoot.setAttribute('aria-hidden','true');
  }
  function toggleMenu(){
    if (document.body.classList.contains('menu-open')) closeMenu();
    else openMenu();
  }

  if (burger) burger.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', closeMenu);

  // Делегирование кликов в offcanvas
  if (ocPanel) {
    ocPanel.addEventListener('click', function(e){
      const btn = e.target && e.target.closest ? e.target.closest('[data-action]') : null;
      if (!btn) return;
      const action = btn.getAttribute('data-action');
      if (!action) return;
      if (actionsMap[action]) actionsMap[action]();
    });
  }

  // ==========================================================
  // ЭТАП 1: всегда Donate, PRO-активация отключена
  // ==========================================================
  function applyProButtonState(){
    try {
      // нижняя кнопка ПРО/донат
      var btn = document.querySelector(
        '.actions-row-bottom .action-btn[data-action="pro"], ' +
        '.actions-row-bottom .action-btn[data-action="donate"]'
      );
      if (btn) {
        // Всегда Donate (Web/PWA). Точку "pro" сохраняем как action,
        // но UI её больше не показывает.
        btn.dataset.action = 'donate';
        btn.textContent = '💰';
        btn.setAttribute('aria-label', 'Поддержать проект');
      }

      // бейдж PRO в шапке сейчас не используем
      var badge = document.querySelector('.header-pro-badge');
      if (badge) badge.classList.remove('is-visible');
    } catch(_) {}
  }

  // Версия приложения (app.core.js → App.APP_VER)
  (function(){
    function renderVersion(){
      var el = document.getElementById('appVersion');
      if (el) {
        var v = (window.App && App.APP_VER) || null;
        if (v) el.textContent = v;
      }
      // после загрузки App обновляем состояние кнопки PRO/донат
      applyProButtonState();
    }
    if (!(window.App && App.APP_VER)) {
      window.addEventListener('load', renderVersion);
    } else {
      renderVersion();
    }
  })();

  // ==========================================================
  // Actions map
  // ==========================================================
  const actionsMap = {
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
        s.onload = () =>
          window.Donate && window.Donate.open && window.Donate.open();
        document.head.appendChild(s);
      } else {
        window.Donate.open();
      }
    },

    share() {
      const data = { title: 'MOYAMOVA', url: location.href };
      try {
        if (navigator.share) navigator.share(data);
        else {
          navigator.clipboard && navigator.clipboard.writeText && navigator.clipboard.writeText(location.href);
        }
      } catch(_) {}
      try { closeMenu(); } catch (_) {}
    },

    contact() {
      location.href = 'mailto:peiko.oleh@gmail.com';
      try { closeMenu(); } catch (_) {}
    },

    // Прочие действия могут быть добавлены в других версиях оболочки
  };

})();
