/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: pro.js
 * Назначение: Экран/лист PRO-версии (разовая покупка)
 * Версия: 2.0
 * Обновлено: 2025-12-02
 * ========================================================== */

(function(root){
  'use strict';
  var A = root.App = root.App || {};

  /* ========================================================
   * Локализация
   * ====================================================== */

  function getUiLang(){
    try {
      var s = (A.settings && (A.settings.lang || A.settings.uiLang)) || 'ru';
      s = String(s || '').toLowerCase();
      return (s === 'uk') ? 'uk' : 'ru';
    } catch (e) {
      return 'ru';
    }
  }

  function t(){
    var uk = getUiLang() === 'uk';
    return uk ? {
      title: 'MOYAMOVA PRO',
      subtitle: 'Разове розблокування розширеного функціоналу',
      featuresTitle: 'У версію PRO входить:',
      f1: 'Розширена статистика та календар прогресу',
      f2: 'Озвучка слів і повні підказки: приклади, синоніми та антоніми',
      f3: 'Розширені режими тренування та рівні складності',
      f4: 'Повний контроль над словниками і помилками',
      buy: 'Купити PRO',
      already: 'У вас вже активована версія PRO',
      close: 'Закрити',
      badge: 'Раз і назавжди',

      chooseMethod: 'Оберіть спосіб оплати',
      paypalShort: 'PayPal',
      otherShort: 'Інші способи',
      soon: 'Скоро',
      payWithPaypal: 'Оплатити через PayPal-акаунт',
      otherDesc: 'Ми працюємо над підтримкою популярних способів оплати в різних країнах.',

      haveCode: 'У мене є код',
      enterCode: 'Введіть код активації',
      codeInvalid: 'Невірний код активації'
    } : {
      title: 'MOYAMOVA PRO',
      subtitle: 'Разовая разблокировка расширенного функционала',
      featuresTitle: 'В PRO-версию входит:',
      f1: 'Расширенная статистика и календарь прогресса',
      f2: 'Озвучка слов и полные подсказки: примеры, синонимы и антонимы',
      f3: 'Расширенные режимы тренировки и уровни сложности',
      f4: 'Полный контроль над словарями и ошибками',
      buy: 'Купить PRO',
      already: 'У вас уже активирована версия PRO',
      close: 'Закрыть',
      badge: 'Раз и навсегда',

      chooseMethod: 'Выберите способ оплаты',
      paypalShort: 'PayPal',
      otherShort: 'Другие способы',
      soon: 'Скоро',
      payWithPaypal: 'Оплатить через PayPal-аккаунт',
      otherDesc: 'Мы работаем над поддержкой популярных способов оплаты в разных странах.',

      haveCode: 'У меня есть код',
      enterCode: 'Введите код активации',
      codeInvalid: 'Неверный код активации'
    };
  }

  /* ========================================================
   * Состояние листа PRO
   * ====================================================== */

  var sheet = null;
  var paypalRendered = false;
  var currentPayPage = 0;

  /* ========================================================
   * Стили
   * ====================================================== */

  function ensureStyles(){
    if (document.getElementById('pro-sheet-style')) return;

    var css = ''
      + '.pro-sheet-overlay{position:fixed;inset:0;background:rgba(15,23,42,.6);backdrop-filter:blur(10px);z-index:9990;}'
      + '.pro-sheet{position:fixed;left:0;right:0;bottom:0;z-index:9991;border-radius:16px 16px 0 0;'
      + 'background:var(--mm-card-bg,rgba(15,23,42,.98));color:var(--mm-card-fg,#e5e7eb);box-shadow:0 -18px 45px rgba(15,23,42,.95);'
      + 'max-width:520px;margin:0 auto;padding:16px 18px 20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}'
      + '@media (prefers-color-scheme:light){.pro-sheet{background:#fff;color:#020617;}}'
      + '.pro-sheet__title{font-size:18px;font-weight:700;margin-bottom:4px;text-align:center;letter-spacing:.01em;}'
      + '.pro-sheet__subtitle{font-size:13px;opacity:.9;text-align:center;margin-bottom:10px;}'
      + '.pro-sheet__features-title{font-size:12px;font-weight:600;margin:10px 0 4px 0;text-transform:uppercase;letter-spacing:.08em;opacity:.8;text-align:center;}'
      + '.pro-sheet__list{margin:0 0 14px;padding-left:18px;font-size:13px;}'
      + '.pro-sheet__list li{margin-bottom:4px;}'
      + '.pro-sheet__actions{display:flex;gap:12px;justify-content:center;margin-top:8px;}'
      + '.pro-sheet__btn{border:0;border-radius:12px;padding:9px 20px;font-size:14px;cursor:pointer;min-width:120px;}'
      + '.pro-sheet__btn--primary{background:var(--accent,var(--brand,#35b6ff));color:#fff;}'
      + '.pro-sheet__btn--primary:hover{filter:brightness(1.05);}'
      + '.pro-sheet__btn--ghost{background:transparent;color:inherit;border:1px solid rgba(148,163,184,.6);}'
      + '.pro-sheet__btn--ghost:hover{background:rgba(15,23,42,.75);}'
      + '.pro-sheet__badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:999px;background:rgba(34,197,94,.15);color:#bbf7d0;font-size:11px;text-transform:uppercase;letter-spacing:.08em;margin:0 auto 10px auto;display:flex;justify-content:center;}'
      + '.pro-sheet__badge span{position:relative;top:1px;}'
      + '.pro-sheet__paypal{margin-top:8px;}'
      + '.pro-payments{margin-top:12px;padding-top:10px;border-top:1px solid rgba(148,163,184,.5);}'
      + '.pro-payments__header{font-size:13px;font-weight:600;margin-bottom:8px;text-align:center;}'
      + '.pro-payments__dots{display:flex;justify-content:center;gap:6px;margin-bottom:8px;}'
      + '.pro-payments__dot{width:8px;height:8px;border-radius:999px;border:0;background:rgba(148,163,184,.6);cursor:pointer;opacity:.7;}'
      + '.pro-payments__dot--active{background:var(--accent,var(--brand,#35b6ff));opacity:1;}'
      + '.pro-payments__pages{position:relative;min-height:80px;}'
      + '.pro-payments__page{display:none;font-size:13px;}'
      + '.pro-payments__page--active{display:block;}'
      + '.pro-payments__title{font-weight:600;margin-bottom:4px;}'
      + '.pro-payments__text{opacity:.9;}'
      + '.pro-payments__soon{font-size:13px;opacity:.7;text-align:center;}'
      + '.pro-payments__soon strong{font-weight:600;}'
      + '.pro-sheet__paypal{margin-top:8px;}'
      + '.pro-payments__code{margin:10px auto 0 auto;display:block;font-size:12px;border:0;'
      + 'background:transparent;color:inherit;opacity:.8;text-decoration:underline;cursor:pointer;}'
      + '.pro-payments__code:hover{opacity:1; }';

    var style = document.createElement('style');
    style.id = 'pro-sheet-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ========================================================
   * Рендер
   * ====================================================== */

  function open(){
    ensureStyles();
    var texts = t();

    if (sheet){
      try {
        var el = sheet.querySelector('.pro-sheet');
        if (el){
          el.style.transform = 'translateY(-4px)';
          setTimeout(function(){ el.style.transform=''; }, 120);
        }
      } catch(e){}
      return;
    }

    var html = ''
      + '<div class="pro-sheet-overlay" data-pro-close="1"></div>'
      + '<section class="pro-sheet" role="dialog" aria-modal="true">'
      + '  <div class="pro-sheet__badge">💎 <span>' + texts.badge + '</span></div>'
      + '  <div class="pro-sheet__title">' + texts.title + '</div>'
      + '  <div class="pro-sheet__subtitle">' + texts.subtitle + '</div>'
      + '  <div class="pro-sheet__features-title">' + texts.featuresTitle + '</div>'
      + '  <ul class="pro-sheet__list">'
      + '    <li>' + texts.f1 + '</li>'
      + '    <li>' + texts.f2 + '</li>'
      + '    <li>' + texts.f3 + '</li>'
      + '    <li>' + texts.f4 + '</li>'
      + '  </ul>'
      + '  <div class="pro-sheet__actions">'
      + '    <button type="button" class="pro-sheet__btn pro-sheet__btn--ghost" data-pro-close="1">' + texts.close + '</button>'
      + '    <button type="button" class="pro-sheet__btn pro-sheet__btn--ghost" data-pro-code="1">' + texts.haveCode + '</button>'
      + '    <button type="button" class="pro-sheet__btn pro-sheet__btn--primary" data-pro-buy="1">' + texts.buy + '</button>'
      + '  </div>'

      // блок выбора способа оплаты
      + '  <div id="pro-payments" class="pro-payments" style="display:none;">'
      + '    <div class="pro-payments__header">' + texts.chooseMethod + '</div>'
      + '    <div class="pro-payments__dots" role="tablist" aria-label="' + texts.chooseMethod + '">'
      + '      <button type="button" class="pro-payments__dot pro-payments__dot--active" data-pay-page="0" aria-label="' + texts.paypalShort + '"></button>'
      + '      <button type="button" class="pro-payments__dot" data-pay-page="1" aria-label="' + texts.otherShort + '"></button>'
      + '    </div>'
      + '    <div class="pro-payments__pages">'

      // страница 0 — PayPal
      + '      <section class="pro-payments__page pro-payments__page--active" data-pay-page="0">'
      + '        <div class="pro-payments__title">PayPal</div>'
      + '        <div class="pro-payments__text">' + texts.payWithPaypal + '</div>'
      + '        <div id="paypal-button-container" class="pro-sheet__paypal"></div>'
      + '      </section>'

      // страница 1 — другие методы (заглушка)
      + '      <section class="pro-payments__page" data-pay-page="1">'
      + '        <div class="pro-payments__title">' + texts.otherShort + '</div>'
      + '        <div class="pro-payments__text">' + texts.otherDesc + '</div>'
      + '        <div class="pro-payments__soon"><strong>' + texts.soon + '</strong></div>'
      + '      </section>'

      + '    </div>'
      + '  </div>'

      + '</section>';

    var wrap = document.createElement('div');
    wrap.innerHTML = html;
    sheet = wrap;
    document.body.appendChild(sheet);

    var closeNodes = sheet.querySelectorAll('[data-pro-close]');
    if (closeNodes && closeNodes.length) {
      closeNodes.forEach(function(node){
        node.addEventListener('click', close, { passive:true });
      });
    }

    var buyBtn = sheet.querySelector('[data-pro-buy]');
    if (buyBtn) {
      buyBtn.addEventListener('click', onBuyClick, { passive:true });
    }

    var codeBtn = sheet.querySelector('[data-pro-code]');
    if (codeBtn) {
      codeBtn.addEventListener('click', onHaveCodeClick, { passive:true });
    }
  }

  /* ========================================================
   * Обработчики
   * ====================================================== */

  function onBuyClick(){
    if (!sheet) return;
    var payments = sheet.querySelector('#pro-payments');
    if (!payments) return;

    payments.style.display = 'block';
    initPaymentsNavigation();
    initPaypalButtons();

    try {
      payments.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
  }

  function onHaveCodeClick(){
    if (!sheet) return;

    var code = root.prompt(t().enterCode || 'Введите код активации');
    if (!code) return;

    code = String(code || '').trim();
    if (!code) return;

    root.fetch('/api/pro-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code })
    })
    .then(function(resp){ return resp.json(); })
    .then(function(data){
      if (data && data.ok && root.App && typeof root.App.unlockPro === 'function') {
        root.App.unlockPro();
        close();
        if (root.UIBus && typeof root.UIBus.emit === 'function') {
          root.UIBus.emit('pro:unlocked', { via:'code' });
        }
        if (root.notify) {
          root.notify.success(t().already || 'PRO уже активирована');
        }
      } else {
        if (root.notify) {
          root.notify.error(t().codeInvalid || 'Неверный код активации');
        } else {
          root.alert(t().codeInvalid || 'Неверный код активации');
        }
      }
    })
    .catch(function(){
      if (root.notify) {
        root.notify.error('Ошибка связи с сервером');
      } else {
        root.alert('Ошибка связи с сервером');
      }
    });
  }

  function close(){
    if (!sheet) return;
    try {
      document.body.classList.remove('pro-open');
    } catch(e){}
    try {
      sheet.remove();
    } catch (e) {
      if (sheet && sheet.parentNode) sheet.parentNode.removeChild(sheet);
    }
    sheet = null;
  }

  /* ========================================================
   * Навигация по способам оплаты
   * ====================================================== */

  function initPaymentsNavigation(){
    if (!sheet) return;
    var dots = sheet.querySelectorAll('.pro-payments__dot');
    var pages = sheet.querySelectorAll('.pro-payments__page');
    if (!dots.length || !pages.length) return;

    function setPage(idx){
      currentPayPage = idx;
      dots.forEach(function(dot, i){
        if (i === idx) dot.classList.add('pro-payments__dot--active');
        else dot.classList.remove('pro-payments__dot--active');
      });
      pages.forEach(function(page, i){
        if (i === idx) page.classList.add('pro-payments__page--active');
        else page.classList.remove('pro-payments__page--active');
      });
    }

    dots.forEach(function(dot, idx){
      dot.addEventListener('click', function(){
        setPage(idx);
      }, { passive:true });
    });

    setPage(currentPayPage || 0);
  }

  /* ========================================================
   * PayPal
   * ====================================================== */

  function initPaypalButtons(){
    if (paypalRendered) return;
    if (!root.paypal || !root.paypal.Buttons) return;

    var container = document.getElementById('paypal-button-container');
    if (!container) return;

    paypalRendered = true;

    root.paypal.Buttons({
      style: {
        layout: 'horizontal',
        color: 'gold',
        shape: 'pill',
        label: 'paypal'
      },

      createOrder: function(data, actions) {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: '5.00',
              currency_code: 'EUR'
            },
            description: 'MOYAMOVA PRO'
          }]
        });
      },

      onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
          return fetch('/api/paypal-confirm', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderID })
          })
          .then(function(resp){ return resp.json(); })
          .then(function(result){
            if (result && result.ok) {
              if (root.App && typeof root.App.unlockPro === 'function') {
                root.App.unlockPro();
              }
              close();
              if (root.UIBus && typeof root.UIBus.emit === 'function') {
                root.UIBus.emit('pro:unlocked', { via:'paypal', amount: result.amount, currency: result.currency });
              }
              if (root.notify) {
                root.notify.success('PRO активирована, спасибо за поддержку!');
              }
            } else {
              if (root.notify) {
                root.notify.error('Не удалось подтвердить платёж. Напишите нам, пожалуйста.');
              }
            }
          });
        });
      },

      onError: function(err) {
        if (root.notify) {
          root.notify.error('Ошибка при инициализации PayPal. Попробуйте позже.');
        }
      }

    }).render('#paypal-button-container');
  }

  /* ========================================================
   * Публичный API
   * ====================================================== */

  root.ProUpgrade = { open: open, close: close };

})(window);
/* ========================= Конец файла: pro.js ========================= */
