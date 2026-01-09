/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: app.filters.js
 * Назначение: Фильтры и подготовка trainableDeck (уровни/темы/сортировка)
 * Версия: 1.0
 * Обновлено: 2026-01-09
 * ========================================================== */

(function () {
  'use strict';

  const A = (window.App = window.App || {});
  A.Filters = A.Filters || {};

    const STORAGE_PREFIX_LEVELS = 'mm.filters.levels.'; // + <studyLang>
  const STORAGE_PREFIX_TOPICS = 'mm.filters.topics.'; // + <studyLang>
  const _cache = {
    levelsByStudyLang: Object.create(null),
  };

  function safeJsonParse(s, fallback) {
    try { return JSON.parse(s); } catch (_) { return fallback; }
  }

  function uniq(arr) {
    const out = [];
    const seen = new Set();
    for (const x of (arr || [])) {
      const v = String(x || '').trim();
      if (!v) continue;
      if (seen.has(v)) continue;
      seen.add(v);
      out.push(v);
    }
    return out;
  }

  function normalizeLevel(level) {
    const s = String(level || '').trim().toUpperCase();
    if (!s) return '';
    // normalize "A 1" / "A-1" -> "A1"
    const m = s.match(/^([ABC])\s*[-_ ]?\s*(\d)$/i);
    if (m) return (m[1].toUpperCase() + String(m[2]));
    // allow C1/C2 etc
    const m2 = s.match(/^([A-Z])\s*(\d)$/);
    if (m2) return (m2[1] + m2[2]);
    return s.replace(/\s+/g, '');
  }

  function sortLevels(levels) {
    const order = { A: 1, B: 2, C: 3, D: 4 };
    return (levels || []).slice().sort((a, b) => {
      const A1 = String(a || '').toUpperCase();
      const B1 = String(b || '').toUpperCase();
      const ma = A1.match(/^([A-Z])(\d)$/);
      const mb = B1.match(/^([A-Z])(\d)$/);
      if (ma && mb) {
        const oa = order[ma[1]] || 99;
        const ob = order[mb[1]] || 99;
        if (oa !== ob) return oa - ob;
        return Number(ma[2]) - Number(mb[2]);
      }
      return A1.localeCompare(B1);
    });
  }

  function getStudyLangFromDeckKey(deckKey) {
    try {
      if (A.Decks && typeof A.Decks.langOfKey === 'function') {
        return A.Decks.langOfKey(deckKey) || null;
      }
    } catch (_) {}
    try {
      const s = localStorage.getItem('lexitron.studyLang');
      if (s) return String(s).trim().toLowerCase();
    } catch (_) {}
    return null;
  }

    function storageKeyLevels(studyLang) {
    return STORAGE_PREFIX_LEVELS + String(studyLang || 'xx').toLowerCase();
  }
  function storageKeyTopics(studyLang) {
    return STORAGE_PREFIX_TOPICS + String(studyLang || 'xx').toLowerCase();
  }

    function getState(studyLang) {
    const lang = String(studyLang || 'xx').toLowerCase();
    // Levels: support legacy payload in mm.filters.levels.<lang>
    let rawL = null;
    try { rawL = localStorage.getItem(storageKeyLevels(lang)); } catch (_) {}
    const dataL = safeJsonParse(rawL, null) || {};
    const enabledL = !!dataL.enabled;
    const selectedL = uniq((dataL.selected || []).map(normalizeLevel)).filter(Boolean);

    // Topics: reserved for future Stage 2 (kept for forward-compat)
    let rawT = null;
    try { rawT = localStorage.getItem(storageKeyTopics(lang)); } catch (_) {}
    const dataT = safeJsonParse(rawT, null) || {};
    const enabledT = !!dataT.enabled;
    const selectedT = uniq((dataT.selected || []).map(v => String(v || '').trim()).filter(Boolean));

    return {
      studyLang: lang,
      levels: { enabled: enabledL, selected: selectedL },
      topics: { enabled: enabledT, selected: selectedT },
    };
  }

    function setStateLevels(studyLang, state) {
    const lang = String(studyLang || 'xx').toLowerCase();
    const k = storageKeyLevels(lang);
    const enabled = !!(state && state.enabled);
    const selected = uniq(((state && state.selected) || []).map(normalizeLevel)).filter(Boolean);
    const payload = JSON.stringify({ enabled, selected });
    try { localStorage.setItem(k, payload); } catch (_) {}
  }

  function setStateTopics(studyLang, state) {
    const lang = String(studyLang || 'xx').toLowerCase();
    const k = storageKeyTopics(lang);
    const enabled = !!(state && state.enabled);
    const selected = uniq(((state && state.selected) || []).map(v => String(v || '').trim()).filter(Boolean));
    const payload = JSON.stringify({ enabled, selected });
    try { localStorage.setItem(k, payload); } catch (_) {}
  }
  }

    function reset(studyLang) {
    setStateLevels(studyLang, { enabled: false, selected: [] });
    // Stage 2: topics
    setStateTopics(studyLang, { enabled: false, selected: [] });
  }

  function setLevels(studyLang, selectedLevels) {
    const sel = uniq((selectedLevels || []).map(normalizeLevel)).filter(Boolean);
    if (!sel.length) {
      setStateLevels(studyLang, { enabled: false, selected: [] });
      return;
    }
    setStateLevels(studyLang, { enabled: true, selected: sel });
  }

  function collectLevels(words) {
    const out = [];
    for (const w of (words || [])) {
      const lv = normalizeLevel(w && w.level);
      if (!lv) continue;
      out.push(lv);
    }
    return sortLevels(uniq(out));
  }

  function collectLevelsForStudyLang(studyLang) {
    const lang = String(studyLang || '').toLowerCase();
    if (!lang) return [];
    if (_cache.levelsByStudyLang[lang]) return _cache.levelsByStudyLang[lang].slice();
    const all = [];
    try {
      const decks = (window.decks || {});
      for (const k in decks) {
        if (!Object.prototype.hasOwnProperty.call(decks, k)) continue;
        const dk = String(k || '').toLowerCase();
        if (!dk.startsWith(lang + '_')) continue;
        const arr = decks[k] || [];
        for (const w of arr) {
          const lv = normalizeLevel(w && w.level);
          if (lv) all.push(lv);
        }
      }
    } catch (_) {}
    const res = sortLevels(uniq(all));
    _cache.levelsByStudyLang[lang] = res.slice();
    return res;
  }

    function applyLevels(words, state) {
    const levels = (state && state.levels) ? state.levels : (state || { enabled:false, selected:[] });
    const st = levels || { enabled: false, selected: [] };
    if (!st.enabled || !st.selected || !st.selected.length) {
      // Без фильтра: возвращаем всё, включая слова без level
      return (words || []).slice();
    }
    const allow = new Set((st.selected || []).map(normalizeLevel).filter(Boolean));
    const out = [];
    for (const w of (words || [])) {
      const lv = normalizeLevel(w && w.level);
      // По ТЗ: слова без уровня появляются ТОЛЬКО при "Без фильтра"
      if (!lv) continue;
      if (allow.has(lv)) out.push(w);
    }
    return out;
  }

  function applyArticlesOnly(words) {
    const out = [];
    for (const w of (words || [])) {
      const raw = String((w && (w.word || w.term || w.de)) || '').trim().toLowerCase();
      if (raw.startsWith('der ') || raw.startsWith('die ') || raw.startsWith('das ')) out.push(w);
    }
    return out;
  }

  function getTrainableDeck(deckKey, opts) {
    const mode = (opts && opts.mode) || 'words'; // 'words' | 'articles'
    const studyLang = getStudyLangFromDeckKey(deckKey) || (A.settings && A.settings.dictsLangFilter) || null;
        const st = getState(studyLang || 'xx');

    let raw = [];
    try {
      raw = (A.Decks && typeof A.Decks.resolveDeckByKey === 'function') ? (A.Decks.resolveDeckByKey(deckKey) || []) : [];
    } catch (_) { raw = []; }

    let out = applyLevels(raw, st);

    if (mode === 'articles') {
      out = applyArticlesOnly(out);
    }
    return out;
  }

  function summaryText(uiLang, studyLang) {
            const st = getState(studyLang || 'xx');
    const lv = (st && st.levels) ? st.levels : st;
    if (!lv || !lv.enabled || !lv.selected || !lv.selected.length) return '';
    return lv.selected.join(', ');

  }

  // Public API
  A.Filters.normalizeLevel = normalizeLevel;
  A.Filters.getStudyLangFromDeckKey = getStudyLangFromDeckKey;
  A.Filters.getState = getState;
    A.Filters.setLevels = setLevels;
  // Stage 2 (topics) API placeholders
  A.Filters.setTopics = function(studyLang, selectedTopics){
    const sel = uniq((selectedTopics || []).map(v => String(v || '').trim()).filter(Boolean));
    if (!sel.length) { setStateTopics(studyLang, { enabled:false, selected:[] }); return; }
    setStateTopics(studyLang, { enabled:true, selected: sel });
  };
  A.Filters.reset = reset;
  A.Filters.collectLevels = collectLevels;
  A.Filters.collectLevelsForStudyLang = collectLevelsForStudyLang;
  A.Filters.getTrainableDeck = getTrainableDeck;
  A.Filters.summaryText = summaryText;

})();
