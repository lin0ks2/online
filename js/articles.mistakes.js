/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: articles.mistakes.js
 * Назначение: Ошибки для тренера артиклей (изолированно от words)
 * Версия: 1.0
 * ========================================================== */

(function(){
  'use strict';
  const A = (window.App = window.App || {});
  A.state = A.state || {};

  // language for training context (ru/uk) — mirrors app.mistakes.js idea
  function getTrainLang(){
    try{
      if (A.settings && (A.settings.uiLang === 'uk' || A.settings.uiLang === 'ru')) return A.settings.uiLang;
      if (A.settings && (A.settings.lang === 'uk' || A.settings.lang === 'ru')) return A.settings.lang;
    }catch(_){}
    return 'ru';
  }

  function ensureRoot(){
    if (!A.state.articlesMistakes || typeof A.state.articlesMistakes !== 'object'){
      A.state.articlesMistakes = { ru:{}, uk:{} };
    }
    if (!A.state.articlesMistakes.ru) A.state.articlesMistakes.ru = {};
    if (!A.state.articlesMistakes.uk) A.state.articlesMistakes.uk = {};
    return A.state.articlesMistakes;
  }

  function ensureDeckBucket(trainLang, baseDeckKey){
    const root = ensureRoot();
    const tl = (trainLang === 'uk') ? 'uk' : 'ru';
    root[tl][baseDeckKey] = root[tl][baseDeckKey] || { ids: [], meta: {} };
    return root[tl][baseDeckKey];
  }

  function isMistakesDeckKey(deckKey){
    return typeof deckKey === 'string' && deckKey.startsWith('mistakes:');
  }

  function uniqPush(arr, v){
    const s = String(v);
    for (let i=0;i<arr.length;i++){ if (String(arr[i])===s) return; }
    arr.push(s);
  }

  function push(baseDeckKey, wordId, opts){
    try{
      if (!baseDeckKey || wordId == null) return;
      // Не копим ошибки во время тренировки словаря ошибок
      if (isMistakesDeckKey(baseDeckKey)) return;

      const trainLang = (opts && opts.trainLang) || getTrainLang();
      const b = ensureDeckBucket(trainLang, baseDeckKey);
      const id = String(wordId);

      uniqPush(b.ids, id);
      b.meta[id] = b.meta[id] || { ts: Date.now() };

      try { if (A.saveState) A.saveState(); } catch(_){}
    }catch(_){}
  }

  function getIds(trainLang, baseDeckKey){
    try{
      const root = ensureRoot();
      const tl = (trainLang === 'uk') ? 'uk' : 'ru';
      const b = root[tl] && root[tl][baseDeckKey];
      return b && Array.isArray(b.ids) ? b.ids.slice() : [];
    }catch(_){ return []; }
  }

  function count(trainLang, baseDeckKey){
    return getIds(trainLang, baseDeckKey).length;
  }

  function clearForDeck(trainLang, baseDeckKey){
    try{
      const root = ensureRoot();
      const tl = (trainLang === 'uk') ? 'uk' : 'ru';
      if (root[tl] && root[tl][baseDeckKey]){
        root[tl][baseDeckKey] = { ids: [], meta: {} };
        try { if (A.saveState) A.saveState(); } catch(_){}
      }
    }catch(_){}
  }

  // Used by bridge: resolve virtual deck key
  function resolveDeckForMistakesKey(virtualKey){
    try{
      const parts = String(virtualKey||'').split(':'); // mistakes:<tl>:<baseKey>
      if (parts.length < 3) return [];
      const tl = parts[1];
      const base = parts[2];
      const ids = new Set(getIds(tl, base).map(String));
      const full = (A.Decks && A.Decks.resolveDeckByKey) ? (A.Decks.resolveDeckByKey(base) || []) : [];
      if (!ids.size) return [];
      return full.filter(w => ids.has(String(w.id)));
    }catch(_){ return []; }
  }

  function exportData(){
    try{
      return JSON.parse(JSON.stringify(ensureRoot()));
    }catch(_){
      return { ru:{}, uk:{} };
    }
  }

  function importData(data){
    try{
      if (!data || typeof data !== 'object') return;
      // sanitize
      const out = { ru:{}, uk:{} };
      for (const tl of ['ru','uk']){
        if (!data[tl] || typeof data[tl] !== 'object') continue;
        for (const dk of Object.keys(data[tl])){
          const b = data[tl][dk];
          const ids = (b && Array.isArray(b.ids)) ? b.ids.map(String) : [];
          const meta = (b && b.meta && typeof b.meta === 'object') ? b.meta : {};
          out[tl][dk] = { ids, meta };
        }
      }
      A.state.articlesMistakes = out;
      try { if (A.saveState) A.saveState(); } catch(_){}
    }catch(_){}
  }

  A.ArticlesMistakes = {
    push,
    getIds,
    count,
    clearForDeck,
    resolveDeckForMistakesKey,
    export: exportData,
    import: importData,
  };
})();