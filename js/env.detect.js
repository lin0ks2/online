/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: env.detect.js
 * Назначение: Пометить <html> классами is-pwa / is-ios-safari
 *             для корректной работы overrides.css
 * Обновлено: 2025-11-21
 * ========================================================== */

(function () {
  var docEl = document.documentElement;
  var ua = navigator.userAgent || "";

  var isIOS = /iPhone|iPad|iPod/i.test(ua);

  // PWA / standalone (iOS + Android + desktop)
  var isStandalone =
    (window.matchMedia &&
      window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;

  if (isStandalone) {
    docEl.classList.add('is-pwa');
  }

  // iOS Safari (не Chrome, не Firefox, не PWA-контейнер)
  var isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  var isChromeIOS = /CriOS/i.test(ua);
  var isFirefoxIOS = /FxiOS/i.test(ua);

  if (isIOS && isSafari && !isChromeIOS && !isFirefoxIOS) {
    docEl.classList.add('is-ios-safari');
  }
})();
