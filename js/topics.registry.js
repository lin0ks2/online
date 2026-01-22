/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: topics.registry.js
 * Назначение: Нормализация тем (topics) + aliases + UI labels
 * Версия: 1.0
 * Обновлено: 2026-01-22
 * ========================================================== */

(function () {
  'use strict';

  const A = (window.App = window.App || {});
  A.Topics = A.Topics || {};

  // Minimal, safe aliases for semantic merges.
  // Add items gradually when you see obvious duplicates in UI.
  const ALIASES = {
    // everyday_life: 'daily_life',
  };

  function _toString(v){
    try { return String(v == null ? '' : v); } catch(_){ return ''; }
  }

  function normalize(raw){
    let s = _toString(raw).trim();
    if (!s) return '';
    // unify separators
    s = s.replace(/[\s\-]+/g, '_');
    // drop non word chars except underscore
    s = s.replace(/[^a-zA-Z0-9_]/g, '');
    s = s.toLowerCase();
    s = s.replace(/_+/g, '_').replace(/^_+|_+$/g,'');
    if (!s) return '';
    if (Object.prototype.hasOwnProperty.call(ALIASES, s)) return ALIASES[s];
    return s;
  }

  // Default label: humanize id.
  // Later можно заменить на полноценную локализацию topicId → {ru,uk,de}.
  function label(topicId, uiLang){
    const id = normalize(topicId);
    if (!id) return '';
    // humanize: daily_life -> Daily life
    const txt = id.replace(/_/g,' ');
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  A.Topics.ALIASES = ALIASES;
  A.Topics.normalize = normalize;
  A.Topics.label = label;
})();
