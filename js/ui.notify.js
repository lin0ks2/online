/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: ui.notify.js
 * Назначение: Единая точка текстов и уведомлений (тосты, confirm)
 * Обновлено: 2025-12-01
 * ========================================================== */
(function(){
  'use strict';
  var App = window.App = window.App || {};
  App.Msg = App.Msg || {};

  // Локализованный словарь сообщений
  var DICT = {
    ru: {
      // PRO
      'pro.already': 'PRO-версия уже активирована ✨',
      'pro.purchased': 'PRO-версия активирована, спасибо за поддержку! ✨',

      // Legal / factory reset
      'legal.reset_warning': 'Все данные (прогресс, настройки, избранное) будут удалены, приложение вернётся к начальной настройке.',
      'legal.reset_confirm': 'Сбросить данные и начать заново?',

      // Ошибки / системные
      'error.no_decks': 'Нет словарей для старта тренировки.'
    },
    uk: {
      'pro.already': 'PRO-версія вже активована ✨',
      'pro.purchased': 'PRO-версія активована, дякуємо за підтримку! ✨',

      'legal.reset_warning': 'Усі дані (прогрес, налаштування, обране) будуть видалені, застосунок повернеться до початкового стану.',
      'legal.reset_confirm': 'Скинути дані й почати заново?',

      'error.no_decks': 'Немає словників для старту тренування.'
    },
    en: {
      'pro.already': 'PRO version is already active ✨',
      'pro.purchased': 'PRO version activated, thank you for your support! ✨',

      'legal.reset_warning': 'All data (progress, settings, favorites) will be erased and the app will be reset.',
      'legal.reset_confirm': 'Reset data and start over?',

      'error.no_decks': 'No decks available to start training.'
    }
  };

  function getLang(){
    try {
      if (App.getUiLang && typeof App.getUiLang === 'function') {
        var l = App.getUiLang();
        if (l) return String(l).slice(0,2).toLowerCase();
      }
    } catch(_){}

    try {
      var htmlLang = (document.documentElement && document.documentElement.lang) || '';
      if (htmlLang) return String(htmlLang).slice(0,2).toLowerCase();
    } catch(_){}

    return 'ru';
  }

  function msg(key){
    var lang = getLang();
    var table = DICT[lang] || DICT.ru;
    if (table && Object.prototype.hasOwnProperty.call(table, key)) {
      return table[key];
    }
    if (DICT.ru && Object.prototype.hasOwnProperty.call(DICT.ru, key)) {
      return DICT.ru[key];
    }
    return key;
  }

  // Достаём текст по ключу
  App.Msg.text = msg;

  // Тост: показывает краткое уведомление в едином стиле
  App.Msg.toast = function(keyOrText, ms){
    var text;
    if (typeof keyOrText === 'string' && (DICT.ru[keyOrText] || DICT.uk[keyOrText] || DICT.en[keyOrText])) {
      text = msg(keyOrText);
    } else {
      text = String(keyOrText || '');
    }

    try {
      if (window.MoyaUpdates && typeof MoyaUpdates.setToast === 'function') {
        MoyaUpdates.setToast(text, ms || 2600);
        return;
      }
    } catch(_){}

    try { window.alert(text); } catch(_){}
  };

  // Подтверждение действия: пока использует стандартный confirm,
  // но текст централизован в DICT
  App.Msg.confirm = function(keyOrText){
    var text;
    if (typeof keyOrText === 'string' && (DICT.ru[keyOrText] || DICT.uk[keyOrText] || DICT.en[keyOrText])) {
      text = msg(keyOrText);
    } else {
      text = String(keyOrText || '');
    }

    try {
      return window.confirm(text);
    } catch(_){
      return false;
    }
  };

})();