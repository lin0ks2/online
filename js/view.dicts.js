/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: view.dicts.js
 * Назначение: Экран словарей
 * Версия: 1.2
 * Обновлено: 2025-11-17
 * ========================================================== */

(function(){
  'use strict';
  const A = (window.App = window.App || {});

  /* ---------------------- helpers ---------------------- */
  function getUiLang(){
    const s = (A.settings && (A.settings.lang || A.settings.uiLang)) || 'ru';
    return (String(s).toLowerCase() === 'uk') ? 'uk' : 'ru';
  }

  function t(){
    const uk = getUiLang() === 'uk';
    return {
      title:   uk ? 'Словники' : 'Словари',
      preview: uk ? 'Переглянути' : 'Предпросмотр',
      empty:   uk ? 'Словників не знайдено' : 'Словари не найдены',
      word:    uk ? 'Слово' : 'Слово',
      trans:   uk ? 'Переклад' : 'Перевод',
      close:   uk ? 'Закрити' : 'Закрыть',
      // This button starts the default word trainer
      ok:      uk ? 'Вчити слова' : 'Учить слова',
      articles: uk ? 'Вчити артиклі' : 'Учить артикли'
    };
  }

  // подсветка активной кнопки в футере
  function setFooterActive(name){
    try{
      const footer = document.querySelector('footer.app-footer');
      if (!footer) return;
      footer.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
      const btn = footer.querySelector(`.nav-btn[data-action="${name}"]`);
      if (btn) btn.classList.add('active');
    }catch(_){}
  }

  /* ---------------------- render list ---------------------- */
  
  function renderDictList(){
    const app = document.getElementById('app');
    if (!app) return;
    const T = t();

    const allKeysAll = (A.Decks?.builtinKeys?.() || []);
    if (!allKeysAll.length){
      app.innerHTML = `<div class="home"><section class="card"><h3>${T.title}</h3><p>${T.empty}</p></section></div>`;
      return;
    }

    const isLP = (k)=> String(k||'').toLowerCase().endsWith('_lernpunkt');

    const lpKeysAll   = allKeysAll.filter(isLP);
    const mainKeysAll = allKeysAll.filter(k=>!isLP(k));

    // ---------------------- pager (page 0 / page 1) ----------------------
    function loadActivePage(){
      try{
        const v = (A.settings && typeof A.settings.dictsPage === 'number') ? A.settings.dictsPage : 0;
        return (v === 1) ? 1 : 0;
      }catch(_){ return 0; }
    }
    function saveActivePage(i){
      try{ A.settings = A.settings || {}; A.settings.dictsPage = (i === 1) ? 1 : 0; if (typeof A.saveSettings === 'function') A.saveSettings(A.settings); }catch(_){}
    }
    let activePage = loadActivePage();

    // ---------------------- main page: languages ----------------------
    const byLang = mainKeysAll.reduce((acc, key)=>{
      const lang = (A.Decks.langOfKey && A.Decks.langOfKey(key)) || '';
      if (!lang) return acc;
      (acc[lang] || (acc[lang] = [])).push(key);
      return acc;
    }, {});

    const langs = Object.keys(byLang).sort();

    function loadActiveLang(){
      try{
        const saved = (A.settings && A.settings.dictsLang) || '';
        if (saved && byLang[saved]?.length) return saved;
      }catch(_){}
      return langs[0] || '';
    }
    function saveActiveLang(lang){
      try { A.settings = A.settings || {}; A.settings.dictsLang = lang; if (typeof A.saveSettings === 'function') A.saveSettings(A.settings); } catch(_){}
    }
    let activeLang = loadActiveLang();

    // selected keys (separately per page)
    function loadSelectedKeyMain(){
      try{
        const saved = (A.settings && A.settings.dictsSelectedKeyMain) || (A.settings && A.settings.lastDeckKey) || '';
        if (saved && byLang[activeLang]?.includes(saved)) return saved;
      }catch(_){}
      return (byLang[activeLang] && byLang[activeLang][0]) || '';
    }
    function saveSelectedKeyMain(key){
      try{ A.settings = A.settings || {}; A.settings.dictsSelectedKeyMain = key; if (typeof A.saveSettings === 'function') A.saveSettings(A.settings); }catch(_){}
    }
    function loadSelectedKeyLP(){
      try{
        const saved = (A.settings && A.settings.dictsSelectedKeyLP) || (A.settings && A.settings.lastDeckKey) || '';
        if (saved && lpKeysAll.includes(saved)) return saved;
      }catch(_){}
      return lpKeysAll[0] || '';
    }
    function saveSelectedKeyLP(key){
      try{ A.settings = A.settings || {}; A.settings.dictsSelectedKeyLP = key; if (typeof A.saveSettings === 'function') A.saveSettings(A.settings); }catch(_){}
    }

    let selectedKeyMain = loadSelectedKeyMain();
    let selectedKeyLP   = loadSelectedKeyLP();

    // ---------------------- build UI ----------------------
    const page0Title = T.title;
    const page1Title = 'LearnPunkt';

    app.innerHTML = `
      <div class="home">
        <section class="card dicts-card">
          <div class="stats-pages">
            <div class="stats-page ${activePage===0?'is-active':''}" data-page="0">
              <div class="dicts-header">
                <h3>${page0Title}</h3>
                <div id="dicts-flags" class="dicts-flags"></div>
              </div>

              <table class="dicts-table" data-scope="main">
                <tbody></tbody>
              </table>

              <div class="dicts-actions">
                <button type="button" class="btn-primary" id="dicts-apply-main">${T.ok}</button>
                <button type="button" class="btn-primary" id="dicts-articles-main" style="display:none">${T.articles}</button>
              </div>
            </div>

            <div class="stats-page ${activePage===1?'is-active':''}" data-page="1">
              <div class="dicts-header">
                <h3>${page1Title}</h3>
                <div id="dicts-flags-lp" class="dicts-flags"></div>
              </div>

              <table class="dicts-table" data-scope="lp">
                <tbody></tbody>
              </table>

              <div class="dicts-actions">
                <button type="button" class="btn-primary" id="dicts-apply-lp">${T.ok}</button>
                <button type="button" class="btn-primary" id="dicts-articles-lp" style="display:none">${T.articles}</button>
              </div>
            </div>
          </div>

          <div class="dicts-page-dots" style="width:100%;display:flex;justify-content:center;align-items:center;gap:10px;margin:10px 0 2px;">
            <button type="button" class="stats-page-dot ${activePage===0?'is-active':''}" data-page="0" aria-label="Page 1"></button>
            <button type="button" class="stats-page-dot ${activePage===1?'is-active':''}" data-page="1" aria-label="Page 2"></button>
          </div>
        </section>
      </div>`;

    // ---------------------- pager logic ----------------------
    function setActivePage(i){
      activePage = (i === 1) ? 1 : 0;
      saveActivePage(activePage);
      app.querySelectorAll('.stats-page').forEach(p=>p.classList.remove('is-active'));
      const p = app.querySelector(`.stats-page[data-page="${activePage}"]`);
      if (p) p.classList.add('is-active');

      app.querySelectorAll('.dicts-page-dots .stats-page-dot').forEach(b=>b.classList.remove('is-active'));
      const d = app.querySelector(`.dicts-page-dots .stats-page-dot[data-page="${activePage}"]`);
      if (d) d.classList.add('is-active');
    }

    const dotsBox = app.querySelector('.dicts-page-dots');
    if (dotsBox){
      dotsBox.addEventListener('click', (e)=>{
        const b = e.target.closest('.stats-page-dot');
        if (!b) return;
        const i = (b.dataset.page|0);
        setActivePage(i);
      });
    }

    // ---------------------- rendering rows ----------------------
    function renderRows(keys, selectedKey){
      return (keys || []).map(key=>{
        const deck = A.Decks.resolveDeckByKey(key) || [];
        const flag = A.Decks.flagForKey(key);
        const name = A.Decks.resolveNameByKey(key);
        const isSel = (key === selectedKey);
        return `
          <tr class="dict-row${isSel ? ' is-selected' : ''}" data-key="${key}">
            <td class="t-center">${flag}</td>
            <td>${name}</td>
            <td class="t-center">${deck.length}</td>
            <td class="t-center">
              <span class="dicts-preview" title="${T.preview}" data-key="${key}" role="button" aria-label="${T.preview}">👁‍🗨</span>
            </td>
          </tr>`;
      }).join('');
    }

    function updateArticlesButton(buttonId, key){
      try{
        const b = document.getElementById(buttonId);
        if (!b) return;
        const hasPlugin = !!(A.ArticlesTrainer && A.ArticlesCard);
        const k = String(key || '').toLowerCase();
        const show = hasPlugin && k.startsWith('de_nouns');
        b.style.display = show ? '' : 'none';
      }catch(_){}
    }

    // main table
    function renderMain(){
      if (!langs.length){
        const tbody = app.querySelector('.dicts-table[data-scope="main"] tbody');
        if (tbody) tbody.innerHTML = '';
        return;
      }
      const keys = byLang[activeLang] || [];
      if (!keys.includes(selectedKeyMain)) selectedKeyMain = keys[0] || '';
      const tbody = app.querySelector('.dicts-table[data-scope="main"] tbody');
      if (tbody) tbody.innerHTML = renderRows(keys, selectedKeyMain);
      updateArticlesButton('dicts-articles-main', selectedKeyMain);
      renderFlagsUI();
    }

    // learnpunkt table
    function renderLP(){
      const tbody = app.querySelector('.dicts-table[data-scope="lp"] tbody');
      if (!lpKeysAll.length){
        if (tbody) tbody.innerHTML = '';
        // show empty info
        const box = app.querySelector('#dicts-flags-lp');
        if (box) box.innerHTML = `<span class="dicts-flag is-active">🇩🇪</span>`;
        updateArticlesButton('dicts-articles-lp', '');
        return;
      }
      if (!lpKeysAll.includes(selectedKeyLP)) selectedKeyLP = lpKeysAll[0] || '';
      if (tbody) tbody.innerHTML = renderRows(lpKeysAll, selectedKeyLP);
      const box = app.querySelector('#dicts-flags-lp');
      if (box) box.innerHTML = `<span class="dicts-flag is-active">🇩🇪</span>`;
      updateArticlesButton('dicts-articles-lp', selectedKeyLP);
    }

    // flags UI on main page (language filter)
    const FLAG = { en:'🇬🇧', de:'🇩🇪', fr:'🇫🇷', es:'🇪🇸', it:'🇮🇹', ru:'🇷🇺', uk:'🇺🇦', sr:'🇷🇸', pl:'🇵🇱' };
    function renderFlagsUI(){
      const box = app.querySelector('#dicts-flags');
      if (!box) return;
      box.innerHTML = '';
      langs.forEach(lang=>{
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'dicts-flag' + (lang === activeLang ? ' is-active' : '');
        b.textContent = FLAG[lang] || lang.toUpperCase();
        b.onclick = ()=>{
          if (lang === activeLang) return;
          activeLang = lang;
          saveActiveLang(activeLang);
          // keep selection consistent
          selectedKeyMain = loadSelectedKeyMain();
          renderMain();
        };
        box.appendChild(b);
      });
    }

    // ---------------------- actions (OK / Articles) ----------------------
    function applySelection(key){
      // Switch to the default word trainer
      try { A.settings = A.settings || {}; A.settings.trainerKind = "words"; } catch(_){ }
      try {
        A.settings = A.settings || {};
        A.settings.lastDeckKey = key;
        if (typeof A.saveSettings === 'function') A.saveSettings(A.settings);
      } catch(_){}
      try { document.dispatchEvent(new CustomEvent('lexitron:deck-selected', { detail:{ key } })); } catch(_){}
      goHome();
    }

    function applyArticles(key){
      try { A.settings = A.settings || {}; A.settings.trainerKind = "articles"; } catch(_){ }
      try {
        A.settings = A.settings || {};
        A.settings.lastDeckKey = key;
        if (typeof A.saveSettings === "function") A.saveSettings(A.settings);
      } catch(_){}
      try { document.dispatchEvent(new CustomEvent("lexitron:deck-selected", { detail:{ key } })); } catch(_){}
      goHome();
    }

    const okMain = document.getElementById('dicts-apply-main');
    if (okMain) okMain.onclick = ()=>{ if (selectedKeyMain) applySelection(selectedKeyMain); };

    const okLP = document.getElementById('dicts-apply-lp');
    if (okLP) okLP.onclick = ()=>{ if (selectedKeyLP) applySelection(selectedKeyLP); };

    const artMain = document.getElementById('dicts-articles-main');
    if (artMain) artMain.onclick = ()=>{ if (selectedKeyMain) applyArticles(selectedKeyMain); };

    const artLP = document.getElementById('dicts-articles-lp');
    if (artLP) artLP.onclick = ()=>{ if (selectedKeyLP) applyArticles(selectedKeyLP); };

    // ---------------------- table interactions ----------------------
    function attachTableHandlers(scope){
      const tbody = app.querySelector(`.dicts-table[data-scope="${scope}"] tbody`);
      if (!tbody) return;

      tbody.addEventListener('click', (e)=>{
        const eye = e.target.closest('.dicts-preview');
        if (eye){
          e.stopPropagation();
          openPreview(eye.dataset.key);
          return;
        }

        const row = e.target.closest('.dict-row');
        if (!row) return;
        const key = row.dataset.key;
        if (!key) return;

        if (scope === 'main'){
          selectedKeyMain = key;
          saveSelectedKeyMain(selectedKeyMain);
          tbody.querySelectorAll('.dict-row').forEach(r=> r.classList.remove('is-selected'));
          row.classList.add('is-selected');
          updateArticlesButton('dicts-articles-main', selectedKeyMain);
          return;
        }

        selectedKeyLP = key;
        saveSelectedKeyLP(selectedKeyLP);
        tbody.querySelectorAll('.dict-row').forEach(r=> r.classList.remove('is-selected'));
        row.classList.add('is-selected');
        updateArticlesButton('dicts-articles-lp', selectedKeyLP);
      });
    }

    attachTableHandlers('main');
    attachTableHandlers('lp');

    // initial rendering
    renderMain();
    renderLP();

    // ensure pager state is applied (in case DOM differs)
    setActivePage(activePage);
  }


  /* ---------------------- modal preview ---------------------- */
  function openPreview(key){
    const T = t();
    const deck = A.Decks.resolveDeckByKey(key) || [];
    const name = A.Decks.resolveNameByKey(key);
    const flag = A.Decks.flagForKey(key);
    const lang = getUiLang();

    const rows = deck.map((w,i)=>`
      <tr>
        <td>${i+1}</td>
        <td>${w.word || w.term || ''}</td>
        <td>${lang === 'uk' ? (w.uk || w.translation_uk || '') 
                             : (w.ru || w.translation_ru || '')}</td>
      </tr>`).join('');

    const wrap = document.createElement('div');
    wrap.className = 'mmodal is-open';
    wrap.innerHTML = `
      <div class="mmodal__overlay"></div>
      <div class="mmodal__panel" role="dialog" aria-modal="true">
        <div class="mmodal__header">
          <h3>${flag} ${name}</h3>
          <button class="mmodal__close" aria-label="${T.close}">✕</button>
        </div>
        <div class="mmodal__body">
          <table class="dict-table">
            <thead><tr><th>#</th><th>${T.word}</th><th>${T.trans}</th></tr></thead>
            <tbody>${rows || `<tr><td colspan="3" style="opacity:.6">${T.empty}</td></tr>`}</tbody>
          </table>
        </div>
      </div>`;
    document.body.appendChild(wrap);

    const close = ()=>wrap.remove();
    wrap.querySelector('.mmodal__overlay').onclick = close;
    wrap.querySelector('.mmodal__close').onclick = close;
  }

  /* ---------------------- export ---------------------- */
  A.ViewDicts = { mount: function(){ try{ if (A.stopAllTrainers) A.stopAllTrainers('view:dicts'); }catch(_){} return renderDictList(); } };

})();
/* ========================= Конец файла: view.dicts.js ========================= */
