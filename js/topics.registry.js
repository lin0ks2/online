/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: topics.registry.js
 * Назначение: Нормализация тем (topics) + алиасы + UI label helpers
 * Версия: 1.0
 * Обновлено: 2026-01-22
 * ========================================================== */

(function () {
  'use strict';

  const A = (window.App = window.App || {});
  A.Topics = A.Topics || {};

  // Минимальный набор алиасов: добавляем по мере выявления дублей в UI.
  const ALIASES = Object.freeze({
    // format variants are handled by normalize(); semantic aliases go here:
    everyday_life: 'daily_life',
  });

  function _safeStr(x) {
    return String(x == null ? '' : x);
  }

  /**
   * Приводит "сырую" тему к каноническому id:
   * - trim
   * - lower
   * - пробелы/дефисы -> "_"
   * - удаление лишних символов
   * - схлопывание "__"
   */
  function normalizeTopic(raw) {
    let s = _safeStr(raw).trim();
    if (!s) return '';
    s = s.toLowerCase();

    // unify separators to underscore
    s = s.replace(/[-\s]+/g, '_');

    // drop characters that are unsafe for ids
    s = s.replace(/[^a-z0-9_]/g, '');

    // collapse underscores
    s = s.replace(/_+/g, '_').replace(/^_+|_+$/g, '');

    if (!s) return '';
    // apply semantic aliasing
    if (ALIASES[s]) s = ALIASES[s];
    return s;
  }

  function humanizeTopicId(topicId) {
    const s = _safeStr(topicId).trim();
    if (!s) return '';
    // daily_life -> Daily life
    const t = s.replace(/_+/g, ' ');
    return t.charAt(0).toUpperCase() + t.slice(1);
  }

  /**
   * Возвращает label для UI. Сейчас — humanize по id.
   * В будущем сюда можно добавить локализованные названия (RU/UK) по topicId.
   */
  function label(topicId /*, uiLang */) {
    return humanizeTopicId(topicId);
  }

  A.Topics.ALIASES = ALIASES;
  A.Topics.normalize = normalizeTopic;
  A.Topics.humanize = humanizeTopicId;
  A.Topics.label = label;

})();
