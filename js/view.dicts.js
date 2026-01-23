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
      ok:      uk ? 'Слова' : 'Слова',
      articles: uk ? 'Артиклі' : 'Артикли',
      preps:   uk ? 'Прийменники' : 'Предлоги'
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

    const allKeys = (A.Decks?.builtinKeys?.() || []);
    if (!allKeys.length){
      app.innerHTML = `
        <div class="home home--fixed-card">
          <section class="card dicts-card dicts-card--fixed">
            <div class="dicts-header">
              <h3>${T.title}</h3>
            </div>
            <div class="dicts-scroll">
              <p style="opacity:.7;margin:0;">${T.empty}</p>
            </div>
          </section>
        </div>`;
      return;
    }

    // Группировка по языку
    const byLang = allKeys.reduce((acc, key)=>{
      const show = /^en_prepositions$/i.test(String(selectedKey||'').trim());
          b.style.display = show ? '' : 'none';
        }catch(_){}
      }

      
      function updatePrepositionsButton(){
        try{
          const b = document.getElementById('dicts-prepositions');
          if (!b) return;
          // Показываем кнопку пока ТОЛЬКО для английского
          const show = /^en_prepositions$/i.test(String(selectedKey||'').trim());
          b.style.display = show ? '' : 'none';
        }catch(_){}
      }

// primary sync
      updateArticlesButton();

      updatePrepositionsButton();

      const ok = document.getElementById('dicts-apply');
      if (ok){
        ok.onclick = ()=>{
          // аналитика: запуск тренера слов из экрана словарей
          try {
            if (A.Analytics && typeof A.Analytics.track === 'function') {
              A.Analytics.track('dict_apply', {
                kind: 'words',
                deck_key: String(selectedKey || ''),
                ui_lang: getUiLang(),
                learn_lang: (A.Decks && typeof A.Decks.langOfKey === 'function') ? (A.Decks.langOfKey(selectedKey) || null) : null
              });
            }
          } catch(_){ }

          try { A.settings = A.settings || {}; A.settings.trainerKind = "words"; } catch(_){}
          try {
            A.settings = A.settings || {};
            A.settings.lastDeckKey = selectedKey;
            if (typeof A.saveSettings === 'function') { A.saveSettings(A.settings); }
          } catch(_){}
          try {
            document.dispatchEvent(new CustomEvent('lexitron:deck-selected', { detail:{ key: selectedKey } }));
          } catch(_){}
          goHome();
        };
      }

      const articlesBtn = document.getElementById('dicts-articles');
      if (articlesBtn){
        articlesBtn.onclick = ()=>{
          // аналитика: запуск тренера артиклей из экрана словарей
          try {
            if (A.Analytics && typeof A.Analytics.track === 'function') {
              A.Analytics.track('dict_apply', {
                kind: 'articles',
                deck_key: String(selectedKey || ''),
                ui_lang: getUiLang(),
                learn_lang: (A.Decks && typeof A.Decks.langOfKey === 'function') ? (A.Decks.langOfKey(selectedKey) || null) : null
              });
            }
          } catch(_){ }

          try { A.settings = A.settings || {}; A.settings.trainerKind = "articles"; } catch(_){}
          try {
            A.settings = A.settings || {};
            A.settings.lastDeckKey = selectedKey;
            if (typeof A.saveSettings === "function") { A.saveSettings(A.settings); }
          } catch(_){}
          try { document.dispatchEvent(new CustomEvent("lexitron:deck-selected", { detail:{ key: selectedKey } })); } catch(_){}
          goHome();
        };
      }

      const prepsBtn = document.getElementById('dicts-prepositions');
      if (prepsBtn){
        prepsBtn.onclick = ()=>{
          // аналитика: запуск тренера предлогов из экрана словарей
          try {
            if (A.Analytics && typeof A.Analytics.track === 'function') {
              A.Analytics.track('dict_apply', {
                kind: 'prepositions',
                deck_key: String(selectedKey || ''),
                ui_lang: getUiLang(),
                learn_lang: (A.Decks && typeof A.Decks.langOfKey === 'function') ? (A.Decks.langOfKey(selectedKey) || null) : null
              });
            }
          } catch(_){ }

          // ВАЖНО: тренер предлогов работает через виртуальную колоду en_prepositions,
          // чтобы прогресс/звёзды/ошибки не смешивались с обычными словарями.
          try { A.settings = A.settings || {}; A.settings.trainerKind = "prepositions"; } catch(_){ }
          try {
            A.settings = A.settings || {};
            // запоминаем выбранную строку предлогов
            A.settings.lastPrepositionsDeckKey = selectedKey;
            // активный ключ для тренера (тот же, что выбран строкой)
            A.settings.lastDeckKey = selectedKey;
            if (typeof A.saveSettings === "function") { A.saveSettings(A.settings); }
          } catch(_){ }
          try { document.dispatchEvent(new CustomEvent("lexitron:deck-selected", { detail:{ key: selectedKey } })); } catch(_){ }
          goHome();
        };
      }

      renderFlagsUI();
    }

    // Панель флагов (для фильтрации)
    const FLAG = { en:'🇬🇧', de:'🇩🇪', fr:'🇫🇷', es:'🇪🇸', it:'🇮🇹', ru:'🇷🇺', uk:'🇺🇦', sr:'🇷🇸', pl:'🇵🇱' };
    function renderFlagsUI(){
      const box = app.querySelector('#dicts-flags');
      if (!box) return;
      box.innerHTML = '';
      langs.forEach(lang=>{
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'dict-flag' + (lang===activeLang ? ' active' : '');
        btn.dataset.lang = lang;
        btn.title = lang.toUpperCase();
        btn.textContent = FLAG[lang] || lang.toUpperCase();
        btn.addEventListener('click', ()=>{
          if (lang === activeLang) return;
          activeLang = lang;
          try { saveActiveLang(lang); } catch(_){}
          selectedKey = (byLang[activeLang] && byLang[activeLang][0]) || '';
          renderTableForLang(activeLang);
        });
        box.appendChild(btn);
      });
    }

    // Первая отрисовка
    renderTableForLang(activeLang);
  }

  /* ---------------------- modal preview ---------------------- */
  function openPreview(key){
    // аналитика: предпросмотр словаря
    try {
      if (A.Analytics && typeof A.Analytics.track === 'function') {
        A.Analytics.track('dict_preview', {
          deck_key: String(key || ''),
          ui_lang: getUiLang(),
          learn_lang: (A.Decks && typeof A.Decks.langOfKey === 'function') ? (A.Decks.langOfKey(key) || null) : null
        });
      }
    } catch(_){ }
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
