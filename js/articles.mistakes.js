/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: articles.mistakes.js
 * Назначение: Ошибки для тренера артиклей (изолированное хранилище)
 * Версия: 1.0
 * Обновлено: 2026-01-04
 * ========================================================== */

(function(){
  'use strict';
  const A = (window.App = window.App || {});

  // Язык тренировки (ru/uk)
  function getTrainLang(){
    try{
      const s = (A.settings && (A.settings.lang || A.settings.uiLang)) || 'ru';
      return (String(s).toLowerCase() === 'uk') ? 'uk' : 'ru';
    }catch(_){ return 'ru'; }
  }

  function ensure(){
    A.articlesMistakes = A.articlesMistakes || {};
    A.articlesMistakes.buckets = A.articlesMistakes.buckets || {};
    // state mirror
    A.state = A.state || {};
    // We keep plain object structure under state.articlesMistakes
  }

  function isMistakesDeckKey(deckKey){
    return typeof deckKey === 'string' && deckKey.startsWith('mistakes:');
  }

  function makeKey(trainLang, baseDeckKey){
    return `mistakes:${trainLang}:${baseDeckKey}`;
  }

  function parseKey(key){
    if (!isMistakesDeckKey(key)) return null;
    const parts = String(key).split(':');
    if (parts.length < 3) return null;
    const trainLang = parts[1];
    const baseDeckKey = parts.slice(2).join(':');
    return { trainLang, baseDeckKey };
  }

  // Get or create a bucket for trainLang + baseDeckKey
  function _bucket(trainLang, baseDeckKey){
    ensure();
    const lang = trainLang || getTrainLang();
    const buckets = A.articlesMistakes.buckets;
    buckets[lang] = buckets[lang] || {};
    const byLang = buckets[lang];
    byLang[baseDeckKey] = byLang[baseDeckKey] || { ids: new Set(), meta: new Map() };
    return byLang[baseDeckKey];
  }

  function exportState(){
    try{
      ensure();
      const out = {};
      const buckets = (A.articlesMistakes && A.articlesMistakes.buckets) ? A.articlesMistakes.buckets : {};

      Object.keys(buckets).forEach(function(lang){
        const byLang = buckets[lang] || {};
        const outByLang = {};
        Object.keys(byLang).forEach(function(baseKey){
          const b = byLang[baseKey];
          if (!b || !b.ids || !b.ids.size) return;
          const idsArr = Array.from(b.ids || []);
          const metaPlain = {};
          if (b.meta && typeof b.meta.forEach === 'function'){
            b.meta.forEach(function(meta, id){
              if (!meta) meta = {};
              metaPlain[String(id)] = { count: meta.count|0, last: meta.last|0 };
            });
          }
          outByLang[baseKey] = { ids: idsArr, meta: metaPlain };
        });
        if (Object.keys(outByLang).length) out[lang] = outByLang;
      });
      return out;
    }catch(_){ return {}; }
  }

  function syncToState(){
    try{
      ensure();
      const plain = exportState();
      A.state = A.state || {};
      A.state.articlesMistakes = (plain && Object.keys(plain).length) ? plain : null;
      if (typeof A.saveState === 'function') A.saveState();
    }catch(_){ }
  }

  function push(baseDeckKey, wordId, opts){
    try{
      const trainLang = (opts && opts.trainLang) || getTrainLang();
      if (!baseDeckKey || wordId == null) return;
      // Do NOT collect mistakes while training mistakes deck
      if (isMistakesDeckKey(baseDeckKey)) return;

      const b = _bucket(trainLang, baseDeckKey);
      const id = String(wordId);
      b.ids.add(id);
      const cur = b.meta.get(id) || { count:0, last:0 };
      cur.count = (cur.count|0) + 1;
      cur.last  = Date.now();
      b.meta.set(id, cur);
      syncToState();
    }catch(_){ }
  }

  function removeDeck(trainLang, baseDeckKey){
    try{
      ensure();
      const lang = trainLang || getTrainLang();
      const buckets = A.articlesMistakes.buckets;
      if (buckets[lang] && buckets[lang][baseDeckKey]){
        delete buckets[lang][baseDeckKey];
        syncToState();
      }
    }catch(_){ }
  }

  function listSummary(){
    ensure();
    const out = [];
    const buckets = A.articlesMistakes.buckets || {};
    for (const lang of Object.keys(buckets)){
      const byLang = buckets[lang] || {};
      for (const baseKey of Object.keys(byLang)){
        const b = byLang[baseKey];
        out.push({
          trainLang: lang,
          baseKey: baseKey,
          mistakesKey: makeKey(lang, baseKey),
          count: (b.ids ? b.ids.size : 0)
        });
      }
    }
    return out.sort((a,b)=> (a.trainLang.localeCompare(b.trainLang) || a.baseKey.localeCompare(b.baseKey)));
  }

  function getIds(trainLang, baseDeckKey){
    const b = _bucket(trainLang, baseDeckKey);
    return Array.from(b.ids || []);
  }

  function resolveDeckForMistakesKey(mKey){
    const parsed = parseKey(mKey);
    if (!parsed) return [];
    const { trainLang, baseDeckKey } = parsed;
    const full = (A.Decks && A.Decks.resolveDeckByKey) ? (A.Decks.resolveDeckByKey(baseDeckKey) || []) : [];
    if (!full.length) return [];
    const ids = new Set(getIds(trainLang, baseDeckKey).map(String));
    return full.filter(w => ids.has(String(w.id)));
  }

  function importState(data){
    try{
      if (!data || typeof data !== 'object') return;
      ensure();
      const buckets = (A.articlesMistakes.buckets = A.articlesMistakes.buckets || {});

      Object.keys(data).forEach(function(lang){
        const byLangData = data[lang];
        if (!byLangData || typeof byLangData !== 'object') return;
        const byLang = (buckets[lang] = buckets[lang] || {});

        Object.keys(byLangData).forEach(function(baseKey){
          const item = byLangData[baseKey];
          if (!item || !Array.isArray(item.ids)) return;
          const bucket = { ids: new Set(), meta: new Map() };
          item.ids.forEach(function(id){ bucket.ids.add(String(id)); });
          if (item.meta && typeof item.meta === 'object'){
            Object.keys(item.meta).forEach(function(id){
              const m = item.meta[id] || {};
              bucket.meta.set(String(id), { count: (m.count|0), last: (m.last|0) });
            });
          }
          byLang[baseKey] = bucket;
        });
      });
      syncToState();
    }catch(_){ }
  }

  // Restore from App.state on load (backward compatible)
  try{
    if (A.state && A.state.articlesMistakes){
      importState(A.state.articlesMistakes);
    }
  }catch(_){ }

  A.ArticlesMistakes = Object.assign({}, A.ArticlesMistakes || {}, {
    makeKey: makeKey,
    parseKey: parseKey,
    listSummary: listSummary,
    push: push,
    getIds: getIds,
    removeDeck: removeDeck,
    clearForDeck: removeDeck,
    resolveDeckForMistakesKey: resolveDeckForMistakesKey,
    isMistakesDeckKey: isMistakesDeckKey,
    export: exportState,
    import: importState
  });
})();
