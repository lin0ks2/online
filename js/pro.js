/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: pro.js
 * Назначение: Экран/лист PRO-версии (разовая покупка)
 * Версия: 1.0
 * Обновлено: 2025-11-30
 * ========================================================== */

(function(root){
  'use strict';
  var A = root.App = root.App || {};

  function getUiLang(){
    try {
      var s = (A.settings && (A.settings.lang || A.settings.uiLang)) || 'ru';
      s = String(s||'').toLowerCase();
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
      badge: 'Раз і назавжди'
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
      badge: 'Раз и навсегда'
    };
  }

  var sheet = null;

        function ensureStyles(){
    if (document.getElementById('pro-sheet-style')) return;

    var css = ''
      + '.pro-sheet-overlay{position:fixed;inset:0;background:rgba(15,23,42,.65);z-index:9990;}'
      + '.pro-sheet{position:fixed;left:0;right:0;bottom:0;z-index:9991;border-radius:16px 16px 0 0;'
      + 'background:var(--card-bg,rgba(15,23,42,.98));color:var(--text-primary,#fff);box-shadow:0 -10px 40px rgba(15,23,42,.9);'
      + 'max-width:520px;margin:0 auto;padding:16px 18px 20px;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}'
      + '@media (prefers-color-scheme:light){.pro-sheet{background:var(--card-bg,#fff);color:var(--text-primary,#0f172a);}}'

      // заголовок и подзаголовок — по центру
      + '.pro-sheet__title{font-size:18px;font-weight:700;margin-bottom:4px;text-align:center;'
      + 'color:var(--accent,var(--brand,#35b6ff));}'
      + '.pro-sheet__subtitle{font-size:13px;opacity:.8;margin-bottom:12px;text-align:center;}'

      + '.pro-sheet__features-title{font-size:13px;font-weight:600;margin-bottom:6px;}'
      + '.pro-sheet__list{margin:0 0 14px;padding-left:18px;font-size:13px;}'
      + '.pro-sheet__list li{margin-bottom:4px;}'

      // КНОПКИ ВНИЗУ — по центру
      + '.pro-sheet__actions{display:flex;gap:12px;justify-content:center;margin-top:8px;}'
      + '.pro-sheet__btn{border:0;border-radius:12px;padding:9px 20px;font-size:14px;cursor:pointer;min-width:120px;}'
      + '.pro-sheet__btn--primary{background:var(--accent,var(--brand,#35b6ff));color:#fff;}'
      + '.pro-sheet__btn--ghost{background:transparent;color:inherit;border:1px solid rgba(148,163,184,.6);}'

      // БЕЙДЖ "Раз и навсегда" — без заливки, крупнее, брендовый цвет, по центру
      + '.pro-sheet__badge{display:flex;align-items:center;justify-content:center;gap:6px;font-size:13px;'
      + 'padding:0;border-radius:999px;color:inherit;margin:0 auto 10px auto;background:transparent;}'
      + '.pro-sheet__badge span{font-size:15px;}';

    var style = document.createElement('style');
    style.id = 'pro-sheet-style';
    style.textContent = css;
    document.head.appendChild(style);
  }

  function close(){
    if (!sheet) return;
    sheet.remove();
    sheet = null;
    document.body.classList.remove('pro-open');
  }

  function onBuyClick(){
    try{
      if (typeof A.unlockPro === 'function') {
        A.unlockPro();
      } else {
        window.localStorage.setItem('mm.proUnlocked','1');
      }
    }catch(e){}
    if (window.App && App.Msg && typeof App.Msg.toast === 'function') {
      App.Msg.toast('pro.already');
    } else {
      alert(t().already);
    }
    close();
    // мягкая перезагрузка, чтобы сразу подхватить PRO-контент
    try {
      setTimeout(function(){ window.location.reload(); }, 150);
    } catch(e) {}
  }

  function open(){
    ensureStyles();
    var texts = t();

    if (sheet){
      // если уже открыт — просто подсветим
      sheet.classList.add('pro-sheet--pulse');
      setTimeout(function(){ sheet && sheet.classList.remove('pro-sheet--pulse'); }, 500);
      return;
    }

    document.body.classList.add('pro-open');

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
      + '    <button type="button" class="pro-sheet__btn pro-sheet__btn--primary" data-pro-buy="1">' + texts.buy + '</button>'
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
    buyBtn && buyBtn.addEventListener('click', onBuyClick, { passive:true });
  }

  root.ProUpgrade = { open: open, close: close };

})(window);
/* ========================= Конец файла: pro.js ========================= */
