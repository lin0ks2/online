/* ==========================================================
 * MOYAMOVA 1.8.3 — Desktop Settings
 * Desktop presentation only; existing application controls/APIs
 * remain the source of truth.
 * ========================================================== */
(function(){
  'use strict';

  function boot(){
    const A=window.App||(window.App={});
    const app=document.getElementById('app');
    if(!app){ setTimeout(boot,25); return; }

    let settingsOpen=false;
    let settingsBusy=false;

    const uk=()=>String((A.settings&&(A.settings.uiLang||A.settings.lang))||document.documentElement.dataset.lang||'ru').toLowerCase()==='uk';
    const txt=()=>uk()?{
      settings:'Налаштування',title:'Налаштування',subtitle:'Основні параметри застосунку',
      interface:'Інтерфейс',language:'Мова застосунку',ru:'Російська',ua:'Українська',
      theme:'Тема',light:'Світла',dark:'Темна',
      learning:'Навчання',level:'Режим складності',normal:'Звичайний',hard:'Складний',
      data:'Дані',backup:'Резервна копія',export:'Експорт',import:'Імпорт',
      app:'Застосунок',updates:'Оновлення',check:'Перевірити оновлення',version:'Версія програми'
    }:{
      settings:'Настройки',title:'Настройки',subtitle:'Основные параметры приложения',
      interface:'Интерфейс',language:'Язык приложения',ru:'Русский',ua:'Украинский',
      theme:'Тема',light:'Светлая',dark:'Тёмная',
      learning:'Обучение',level:'Режим сложности',normal:'Обычный',hard:'Сложный',
      data:'Данные',backup:'Резервная копия',export:'Экспорт',import:'Импорт',
      app:'Приложение',updates:'Обновления',check:'Проверить обновления',version:'Версия программы'
    };

    function currentShell(){
      return app.querySelector('.dashboard,.trainer-desktop-shell,.desktop-pages-shell');
    }
    function mainOf(shell){
      return shell && shell.querySelector('.dash-main,.trainer-desktop-main,.desktop-pages-main');
    }

    function syncProxy(inputId, checked){
      const el=document.getElementById(inputId);
      if(!el) return;
      if(el.checked!==checked){
        el.checked=checked;
        el.dispatchEvent(new Event('change',{bubbles:true}));
      }else{
        el.dispatchEvent(new Event('change',{bubbles:true}));
      }
    }

    function syncDesktopNavLabels(shell){
      if(!shell) return;
      const T=uk()
        ? {home:'Головна',trainer:'Тренажер',dicts:'Словники',mistakes:'Помилки',fav:'Обране',stats:'Статистика',settings:'Налаштування'}
        : {home:'Главная',trainer:'Тренажёр',dicts:'Словари',mistakes:'Ошибки',fav:'Избранное',stats:'Статистика',settings:'Настройки'};
      const map={home:T.home,trainer:T.trainer,dicts:T.dicts,mistakes:T.mistakes,fav:T.fav,stats:T.stats};
      shell.querySelectorAll('[data-trainer-route],[data-desktop-route]').forEach(btn=>{
        const key=btn.getAttribute('data-trainer-route')||btn.getAttribute('data-desktop-route');
        const span=btn.querySelector('span');
        if(span && map[key]) span.textContent=map[key];
      });
      const sb=shell.querySelector('[data-desktop-settings] span');
      if(sb) sb.textContent=T.settings;
    }

    function renderSettings(shell){
      if(settingsBusy) return;
      const main=mainOf(shell);
      if(!main) return;
      settingsOpen=true;
      const T=txt();

      // Preserve current screen; routing away will rebuild it normally.
      if(!main.dataset.settingsSaved){
        main.__mmPreviousHTML=main.innerHTML;
        main.dataset.settingsSaved='1';
      }

      const lang=String(document.documentElement.dataset.lang || (A.settings&&(A.settings.lang||A.settings.uiLang)) || 'ru').toLowerCase();
      const hard=String(document.documentElement.dataset.level||'normal')==='hard';
      const dark=document.documentElement.getAttribute('data-theme')==='dark';

      main.innerHTML=`
        <div class="desktop-settings">
          <header class="desktop-settings__head">
            <div>
              <div class="desktop-settings__eyebrow">MOYAMOVA</div>
              <h2>${T.title}</h2>
              <p>${T.subtitle}</p>
            </div>
          </header>

          <div class="desktop-settings__grid">
            <section class="desktop-settings__card">
              <div class="desktop-settings__section-title">${T.interface}</div>
              <div class="desktop-settings__row">
                <div><strong>${T.language}</strong></div>
                <div class="desktop-segment" data-setting="language">
                  <button type="button" data-lang-value="ru" class="${lang==='ru'?'active':''}">
                    <img src="./img/flags/ru.svg" alt="">${T.ru}
                  </button>
                  <button type="button" data-lang-value="uk" class="${lang==='uk'?'active':''}">
                    <img src="./img/flags/uk.svg" alt="">${T.ua}
                  </button>
                </div>
              </div>
              <div class="desktop-settings__row desktop-settings__row--secondary">
                <div><strong>${T.theme}</strong></div>
                <div class="desktop-segment" data-setting="theme">
                  <button type="button" data-theme-value="light" class="${!dark?'active':''}">☀ ${T.light}</button>
                  <button type="button" data-theme-value="dark" class="${dark?'active':''}">☾ ${T.dark}</button>
                </div>
              </div>
            </section>

            <section class="desktop-settings__card">
              <div class="desktop-settings__section-title">${T.learning}</div>
              <div class="desktop-settings__row">
                <div><strong>${T.level}</strong></div>
                <div class="desktop-segment" data-setting="level">
                  <button type="button" data-level-value="normal" class="${!hard?'active':''}">${T.normal}</button>
                  <button type="button" data-level-value="hard" class="${hard?'active':''}">${T.hard}</button>
                </div>
              </div>
            </section>

            <section class="desktop-settings__card">
              <div class="desktop-settings__section-title">${T.data}</div>
              <div class="desktop-settings__row">
                <div>
                  <strong>${T.backup}</strong>
                </div>
                <div class="desktop-settings__actions">
                  <button type="button" class="desktop-settings__button" data-settings-action="export">↓ ${T.export}</button>
                  <button type="button" class="desktop-settings__button" data-settings-action="import">↑ ${T.import}</button>
                </div>
              </div>
            </section>

            <section class="desktop-settings__card">
              <div class="desktop-settings__section-title">${T.app}</div>
              <div class="desktop-settings__row">
                <div>
                  <strong>${T.updates}</strong>
                  <small>${T.version}: <b>${(A.APP_VER||'—')}</b></small>
                </div>
                <button type="button" class="desktop-settings__button desktop-settings__button--primary" data-settings-action="updates">${T.check}</button>
              </div>
            </section>
          </div>
        </div>`;

      shell.querySelectorAll('.dash-side nav button,.trainer-side nav button,.desktop-pages-side nav button')
        .forEach(b=>b.classList.remove('is-active'));
      const sb=shell.querySelector('[data-desktop-settings]');
      if(sb) sb.classList.add('is-active');

      main.querySelectorAll('[data-lang-value]').forEach(btn=>{
        btn.onclick=()=>{
          const val=btn.dataset.langValue;
          const before=String((A.settings&&(A.settings.uiLang||A.settings.lang))||document.documentElement.dataset.lang||'ru').toLowerCase();
          if(before===val) return;

          settingsOpen=true;

          // Desktop: change language IN PLACE. Do not trigger home.js langToggle,
          // because its canonical mobile handler reroutes the current screen and
          // caused visible shaking + expensive full-page rebuilds.
          try{
            A.settings=A.settings||{};
            A.settings.lang=val;
            A.settings.uiLang=val;
            if(A.saveSettings) A.saveSettings(A.settings);
          }catch(_){}

          document.documentElement.dataset.lang=val;
          document.documentElement.setAttribute('lang',val);

          // Keep the hidden/mobile control synchronized WITHOUT firing its route handler.
          const legacy=document.getElementById('langToggle');
          if(legacy) legacy.checked=(val==='uk');

          // Update only the desktop shell + settings card.
          syncDesktopNavLabels(shell);
          try{ if(A.applyI18nTitles) A.applyI18nTitles(document); }catch(_){}
          try{ document.dispatchEvent(new CustomEvent('lexitron:ui-lang-changed',{detail:{lang:val,desktop:true}})); }catch(_){}

          renderSettings(shell);
        };
      });

      main.querySelectorAll('[data-theme-value]').forEach(btn=>{
        btn.onclick=()=>{
          const val=btn.dataset.themeValue;
          const el=document.getElementById('themeToggle');
          if(el){
            el.checked=(val==='dark');
            el.dispatchEvent(new Event('change',{bubbles:true}));
          }else{
            try{
              localStorage.setItem('ui-theme',val);
              if(val==='dark') document.documentElement.setAttribute('data-theme','dark');
              else document.documentElement.removeAttribute('data-theme');
            }catch(_){}
          }
          renderSettings(shell);
        };
      });

      main.querySelectorAll('[data-level-value]').forEach(btn=>{
        btn.onclick=()=>{
          const wantHard=btn.dataset.levelValue==='hard';
          const el=document.getElementById('levelToggle');
          if(!el) return;

          const currentHard=String(document.documentElement.dataset.level||'normal')==='hard';
          if(currentHard===wantHard) return;

          settingsOpen=true;
          // IMPORTANT: use the original levelToggle change handler.
          // It performs the existing "progress in current set" check,
          // shows confirmModeChangeSet(), and clears the current set only
          // after explicit approval.
          el.checked=wantHard;
          el.dispatchEvent(new Event('change',{bubbles:true}));

          // The original handler is async. Reflect its final accepted/cancelled
          // state after it settles rather than forcing the requested value.
          setTimeout(()=>{
            const actual=String((A.settings&&A.settings.level)||document.documentElement.dataset.level||'normal')==='hard';
            el.checked=actual;
            const currentShell=currentShell();
            if(settingsOpen && currentShell) renderSettings(currentShell);
          },350);
        };
      });

      main.querySelector('[data-settings-action="export"]').onclick=()=>{
        try{ if(A.Backup&&A.Backup.export) A.Backup.export(); }catch(_){}
      };
      main.querySelector('[data-settings-action="import"]').onclick=()=>{
        try{ if(A.Backup&&A.Backup.import) A.Backup.import(); }catch(_){}
      };
      main.querySelector('[data-settings-action="updates"]').onclick=async(e)=>{
        const btn=e.currentTarget;
        if(!window.MoyaUpdates||!MoyaUpdates.check) return;
        btn.disabled=true;
        try{ await MoyaUpdates.check(); }finally{ btn.disabled=false; }
      };
    }

    function inject(){
      if(!window.matchMedia('(min-width:900px)').matches) return;
      document.querySelectorAll('.dashboard .dash-side,.trainer-desktop-shell .trainer-side,.desktop-pages-shell .desktop-pages-side').forEach(side=>{
        const nav=side.querySelector('nav');
        if(!nav) return;
        let btn=nav.querySelector('[data-desktop-settings]');
        if(!btn){
          const T=txt();
          const sep=document.createElement('div');
          sep.className='desktop-settings-nav-sep';
          btn=document.createElement('button');
          btn.type='button';
          btn.dataset.desktopSettings='1';
          btn.innerHTML='⚙ <span>'+T.settings+'</span>';
          btn.addEventListener('click',()=>renderSettings(side.closest('.dashboard,.trainer-desktop-shell,.desktop-pages-shell')));
          nav.appendChild(sep);
          nav.appendChild(btn);
        }else{
          const span=btn.querySelector('span');
          if(span) span.textContent=txt().settings;
        }

        const shell=side.closest('.dashboard,.trainer-desktop-shell,.desktop-pages-shell');
        if(settingsOpen && shell && !mainOf(shell).querySelector('.desktop-settings')){
          requestAnimationFrame(()=>renderSettings(shell));
        }
      });
    }

    document.addEventListener('click',e=>{
      const b=e.target&&e.target.closest&&e.target.closest('.dash-side nav button,.trainer-side nav button,.desktop-pages-side nav button');
      if(b && !b.hasAttribute('data-desktop-settings')) settingsOpen=false;
    },true);

    let injectRaf=0;
    function scheduleInject(){
      if(injectRaf) return;
      injectRaf=requestAnimationFrame(()=>{
        injectRaf=0;
        inject();
      });
    }

    // Route changes replace app-level children. Watching the entire subtree was
    // unnecessarily expensive because trainer/stats mutate many descendants.
    const mo=new MutationObserver(scheduleInject);
    mo.observe(app,{childList:true,subtree:false});
    window.addEventListener('resize',scheduleInject);
    document.addEventListener('lexitron:ui-lang-changed',()=>{ if(!settingsOpen) requestAnimationFrame(inject); });
    requestAnimationFrame(inject);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
