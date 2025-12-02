/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: paypal.sandbox.js
 * Назначение: Тестовая PayPal-кнопка (sandbox, без активации PRO)
 * Версия: 0.1.0
 * Обновлено: 2025-12-02
 * ========================================================== */

(function () {
  'use strict';

  function initSandboxPaypal() {
    // Проверяем, загружен ли SDK
    if (typeof paypal === 'undefined') {
      console.warn('[PayPal] SDK not loaded');
      return;
    }

    var container = document.getElementById('paypal-button-container');
    if (!container) {
      // Контейнер не найден — просто выходим тихо
      return;
    }

    paypal.Buttons({
      // Сумма и описание тестовой покупки
      createOrder: function (data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: { value: '5.00' } // тестовая цена PRO, sandbox
          }]
        });
      },

      // Успешное подтверждение оплаты в sandbox
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (details) {
          console.log('[PayPal sandbox] Payment successful:', details);
          alert('Sandbox-оплата прошла успешно. PRO пока НЕ активируем — это тест.');
        });
      },

      // Ошибка в процессе оплаты
      onError: function (err) {
        console.error('[PayPal sandbox] Error:', err);
        alert('Ошибка PayPal (sandbox). Подробности в консоли браузера.');
      }
    }).render('#paypal-button-container');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSandboxPaypal);
  } else {
    initSandboxPaypal();
  }
})();
