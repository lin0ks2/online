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

    const uk=()=>String((A.settings&&(A.settings.uiLang||A.settings.lang))||document.documentElement.dataset.lang||'ru').toLowerCase()==='uk';
    const txt=()=>uk()?{
      settings:'Налаштування',title:'Налаштування',subtitle:'Основні параметри застосунку',
      interface:'Інтерфейс',language:'Мова застосунку',ru:'Російська',ua:'Українська',
      learning:'Навчання',level:'Режим складності',normal:'Звичайний',hard:'Складний',
      data:'Дані',backup:'Резервна копія',export:'Експорт',import:'Імпорт',
      app:'Застосунок',updates:'Оновлення',check:'Перевірити оновлення',version:'Версія програми'
    }:{
      settings:'Настройки',title:'Настройки',subtitle:'Основные параметры приложения',
      interface:'Интерфейс',language:'Язык приложения',ru:'Русский',ua:'Украинский',
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

    function renderSettings(shell){
      const main=mainOf(shell);
      if(!main) return;
      const T=txt();

      // Preserve current screen; routing away will rebuild it normally.
      if(!main.dataset.settingsSaved){
        main.__mmPreviousHTML=main.innerHTML;
        main.dataset.settingsSaved='1';
      }

      const lang=String(document.documentElement.dataset.lang || (A.settings&&(A.settings.lang||A.settings.uiLang)) || 'ru').toLowerCase();
      const hard=String(document.documentElement.dataset.level||'normal')==='hard';

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
          // Existing burger toggle semantics: checked = RU, unchecked = UK.
          syncProxy('langToggle', val==='ru');
          document.documentElement.dataset.lang=val;
          try{
            A.settings=A.settings||{};
            A.settings.lang=val; A.settings.uiLang=val;
            if(A.saveSettings) A.saveSettings(A.settings);
          }catch(_){}
          try{ document.dispatchEvent(new Event('lexitron:ui-lang-changed')); }catch(_){}
          renderSettings(shell);
        };
      });

      main.querySelectorAll('[data-level-value]').forEach(btn=>{
        btn.onclick=()=>{
          const hard=btn.dataset.levelValue==='hard';
          syncProxy('levelToggle', hard);
          document.documentElement.dataset.level=hard?'hard':'normal';
          // Existing app logic already reads data-level/local control; persist a direct fallback too.
          try{ localStorage.setItem('mm.level',hard?'hard':'normal'); }catch(_){}
          renderSettings(shell);
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
        if(!nav||nav.querySelector('[data-desktop-settings]')) return;
        const T=txt();
        const sep=document.createElement('div');
        sep.className='desktop-settings-nav-sep';
        const btn=document.createElement('button');
        btn.type='button';
        btn.dataset.desktopSettings='1';
        btn.innerHTML='⚙ <span>'+T.settings+'</span>';
        btn.addEventListener('click',()=>renderSettings(side.closest('.dashboard,.trainer-desktop-shell,.desktop-pages-shell')));
        nav.appendChild(sep);
        nav.appendChild(btn);
      });
    }

    const mo=new MutationObserver(()=>requestAnimationFrame(inject));
    mo.observe(app,{childList:true,subtree:true});
    window.addEventListener('resize',inject);
    document.addEventListener('lexitron:ui-lang-changed',()=>requestAnimationFrame(inject));
    requestAnimationFrame(inject);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
