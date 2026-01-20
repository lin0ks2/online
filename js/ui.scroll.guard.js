document.documentElement.setAttribute('data-sg-enabled', '1');
/* ==========================================================
   Проект: MOYAMOVA
   Файл: ui.scroll.guard.js
   Назначение: iOS PWA/TWA — блокировка rubber-band overscroll
              с сохранением прокрутки только внутри разрешенных
              скролл-контейнеров (карточки списков, бургер,
              legal/guide страницы и т.п.).
   Стратегия:
     - В standalone режиме на iOS перехватываем touchmove.
     - Разрешаем скролл только в контейнерах, которые:
         a) явно помечены data-scroll-allow="1" ИЛИ
         b) совпадают с allowSelectors.
     - И дополнительно: скролл разрешается только если
       контейнер реально может скроллиться в направлении жеста
       (иначе гасим, чтобы не было bounce и белой полосы).
   ========================================================== */

(function(){
  'use strict';

  var CFG = {
    // Контейнеры, где скролл допустим: словари/списки, бургер, контентные страницы, модалки.
    allowSelectors: [
      '.dicts-scroll',
      '.oc-body',
      '.legal-modal-body',
      '.setup-modal-body',
      '.mm-modal-body',
      '.page-scroll',
      '.guide-scroll',
      '.donate-scroll',
      '[data-scroll-allow="1"]'
    ].join(','),
    // Порог, чтобы не ловить шум.
    deltaThresholdPx: 2
  };

  function isIOS(){
    return /iP(hone|od|ad)/.test(navigator.userAgent || '');
  }

  function isStandalone(){
    try {
      // iOS PWA: matchMedia/display-mode and navigator.standalone.
      // Project-specific: also respect html[data-runmode] for hybrid shells.
      var dm = !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
      var ns = (navigator.standalone === true);
      var rm = '';
      try { rm = (document.documentElement && (document.documentElement.getAttribute('data-runmode') || '')) || ''; } catch(_){ rm=''; }
      rm = String(rm || '').toLowerCase();

      // Accept both PWA and wrapper runmodes.
      var rmOk = (rm === 'pwa' || rm === 'twa' || rm === 'standalone' || rm === 'app');
      return dm || ns || rmOk;
    } catch(e){
      return false;
    }
  }

  function shouldEnable(){
    // Только iOS + standalone/PWA/TWA + touch.
    if (!isIOS()) return false;
    if (!isStandalone()) return false;
    if (!('ontouchstart' in window)) return false;
    return true;
  }

  function closestAllowed(el){
    if (!el || el === document) return null;
    if (el.closest) {
      var hit = el.closest(CFG.allowSelectors);
      return hit || null;
    }
    // Fallback (очень старые движки) — ручной проход.
    while (el && el !== document.documentElement) {
      try {
        if (el.matches && el.matches(CFG.allowSelectors)) return el;
      } catch(e){}
      el = el.parentElement;
    }
    return null;
  }

  function canScroll(el){
    // Есть ли вообще скролл.
    return el && (el.scrollHeight - el.clientHeight) > 1;
  }

  function canScrollInDirection(el, deltaY){
    // deltaY > 0: палец вниз => контент должен идти вверх => scrollTop должен быть > 0
    // deltaY < 0: палец вверх => контент вниз => должна быть возможность увеличить scrollTop
    if (!el) return false;
    var top = el.scrollTop;
    var maxTop = el.scrollHeight - el.clientHeight;
    if (maxTop < 1) return false;
    if (deltaY > 0) return top > 0;
    if (deltaY < 0) return top < (maxTop - 1);
    return false;
  }

  // Активный жест
  var touchStartY = 0;
  var touchActive = false;

  function onTouchStart(e){
    if (!e || !e.touches || e.touches.length !== 1) {
      touchActive = false;
      return;
    }
    touchActive = true;
    touchStartY = e.touches[0].clientY;
  }

  function onTouchMove(e){
    if (!touchActive) return;
    if (!e || !e.touches || e.touches.length !== 1) return;

    var y = e.touches[0].clientY;
    var deltaY = y - touchStartY;
    if (Math.abs(deltaY) < CFG.deltaThresholdPx) return;

    var target = e.target;
    var allowed = closestAllowed(target);

    // Если не находим разрешенного контейнера — гасим всегда.
    if (!allowed) {
      e.preventDefault();
      return;
    }

    // Если контейнер вообще не скроллится — гасим, чтобы не было bounce.
    if (!canScroll(allowed)) {
      e.preventDefault();
      return;
    }

    // Если контейнер у края и жест тянет дальше — гасим bounce.
    if (!canScrollInDirection(allowed, deltaY)) {
      e.preventDefault();
      return;
    }

    // Иначе — разрешаем, скролл пойдет внутри allowed.
  }

  function onTouchEnd(){
    touchActive = false;
  }

  function init(){
    if (!shouldEnable()) return;
    // Важно: passive:false, иначе preventDefault не сработает.
    // Capture-phase is important on iOS to win against native scroll start.
    document.addEventListener('touchstart', onTouchStart, { passive: true,  capture: true });
    document.addEventListener('touchmove',  onTouchMove,  { passive: false, capture: true });
    document.addEventListener('touchend',   onTouchEnd,   { passive: true,  capture: true });
    document.addEventListener('touchcancel',onTouchEnd,   { passive: true,  capture: true });
  }

  // Авто-инициализация
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Экспорт для отладки/настройки (если потребуется)
  window.MMScrollGuard = {
    init: init,
    cfg: CFG
  };
})();
