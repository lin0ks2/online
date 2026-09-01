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
    const APP_URL='https://moyamova.online/';
    const VIBER_URL='https://invite.viber.com/?g2=AQAitGq4muZQCVW44K1Z4aR%2FP9VDM2%2Bso14cyg3Ec1e7mt%2BTaLbs5S1UdHZCU%2Fy5';
    const PAYPAL_URL='https://www.paypal.com/donate/?hosted_button_id=KFBR8BW5ZZTQ4';

    const uk=()=>String((A.settings&&(A.settings.uiLang||A.settings.lang))||document.documentElement.dataset.lang||'ru').toLowerCase()==='uk';
    const txt=()=>uk()?{
      settings:'Налаштування',title:'Налаштування',subtitle:'Основні параметри застосунку',
      interface:'Інтерфейс',language:'Мова застосунку',ru:'Російська',ua:'Українська',
      theme:'Тема',light:'Світла',dark:'Темна',
      learning:'Навчання',level:'Режим складності',normal:'Звичайний',hard:'Складний',
      data:'Дані',backup:'Резервна копія',export:'Експорт',import:'Імпорт',
      app:'Застосунок',updates:'Оновлення',check:'Перевірити оновлення',version:'Версія програми',
      share:'Поділитися',viber:'Viber-група',qr:'QR-код',support:'Підтримка проєкту',
      supportText:'Допоможіть розвивати MOYAMOVA',paypal:'Підтримати через PayPal',
      about:'Про застосунок',guide:'Інструкція',guideText:'Як працюють тренування, режими та прогрес',
      openGuide:'Відкрити інструкцію',copyDone:'Посилання скопійовано',shareTitle:'Поділитися MOYAMOVA',
      aboutTitle:'Про MOYAMOVA',aboutText:'Офлайн-тренажер слів без реєстрації. Ваш прогрес зберігається тільки на цьому пристрої.'
    }:{
      settings:'Настройки',title:'Настройки',subtitle:'Основные параметры приложения',
      interface:'Интерфейс',language:'Язык приложения',ru:'Русский',ua:'Украинский',
      theme:'Тема',light:'Светлая',dark:'Тёмная',
      learning:'Обучение',level:'Режим сложности',normal:'Обычный',hard:'Сложный',
      data:'Данные',backup:'Резервная копия',export:'Экспорт',import:'Импорт',
      app:'Приложение',updates:'Обновления',check:'Проверить обновления',version:'Версия программы',
      share:'Поделиться',viber:'Viber-группа',qr:'QR-код',support:'Поддержка проекта',
      supportText:'Помогите развивать MOYAMOVA',paypal:'Поддержать через PayPal',
      about:'О приложении',guide:'Инструкция',guideText:'Как работают тренировки, режимы и прогресс',
      openGuide:'Открыть инструкцию',copyDone:'Ссылка скопирована',shareTitle:'Поделиться MOYAMOVA',
      aboutTitle:'О MOYAMOVA',aboutText:'Офлайн-тренажёр слов без регистрации. Ваш прогресс хранится только на этом устройстве.'
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


    function notify(message){
      try{
        if(window.App&&App.Notify&&typeof App.Notify.show==='function') return App.Notify.show(message);
      }catch(_){}
      try{ alert(message); }catch(_){}
    }

    function openExternal(url){
      try{ window.open(url,'_blank','noopener,noreferrer'); }catch(_){ location.href=url; }
    }

    async function shareApp(){
      const T=txt();
      try{
        if(navigator.share){
          await navigator.share({title:'MOYAMOVA',text:T.shareTitle,url:APP_URL});
          return;
        }
      }catch(_){}
      try{
        await navigator.clipboard.writeText(APP_URL);
        notify(T.copyDone);
      }catch(_){
        try{ window.prompt(T.shareTitle,APP_URL); }catch(__){}
      }
    }

    function openGuide(){
      try{
        if(window.Guide&&typeof window.Guide.open==='function') return window.Guide.open();
        if(window.App&&App.Guide&&typeof App.Guide.open==='function') return App.Guide.open();
      }catch(_){}
    }

    function renderAbout(shell){
      const main=mainOf(shell);
      if(!main) return;
      settingsOpen=false;
      const T=txt();
      main.innerHTML=`
        <div class="desktop-about">
          <header class="desktop-settings__head">
            <div class="desktop-settings__eyebrow">MOYAMOVA</div>
            <h2>${T.aboutTitle}</h2>
            <p>${T.aboutText}</p>
          </header>
          <section class="desktop-about__hero">
            <div class="desktop-about__mark">M</div>
            <div>
              <strong>MOYAMOVA</strong>
              <span>${T.version}: ${(A.APP_VER||'—')}</span>
            </div>
          </section>
          <section class="desktop-settings__card desktop-about__guide">
            <div>
              <div class="desktop-settings__section-title">${T.guide}</div>
              <strong>${T.guide}</strong>
              <p>${T.guideText}</p>
            </div>
            <button type="button" class="desktop-settings__button desktop-settings__button--primary" data-about-guide>${T.openGuide}</button>
          </section>
          <div class="desktop-about__grid">
            <button type="button" class="desktop-service-card" data-about-share><span>↗</span><strong>${T.share}</strong></button>
            <button type="button" class="desktop-service-card" data-about-viber><span>◉</span><strong>${T.viber}</strong></button>
            <button type="button" class="desktop-service-card" data-about-paypal><span>P</span><strong>PayPal</strong></button>
          </div>
        </div>`;
      main.querySelector('[data-about-guide]').onclick=openGuide;
      main.querySelector('[data-about-share]').onclick=shareApp;
      main.querySelector('[data-about-viber]').onclick=()=>openExternal(VIBER_URL);
      main.querySelector('[data-about-paypal]').onclick=()=>openExternal(PAYPAL_URL);
      shell.querySelectorAll('.dash-side nav button,.trainer-side nav button,.desktop-pages-side nav button').forEach(b=>b.classList.remove('is-active'));
      const aboutBtn=shell.querySelector('[data-desktop-about]');
      if(aboutBtn) aboutBtn.classList.add('is-active');
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
          <header class="desktop-settings__head desktop-settings__head--tools">
            <div>
              <div class="desktop-settings__eyebrow">MOYAMOVA</div>
              <h2>${T.title}</h2>
              <p>${T.subtitle}</p>
            </div>
            <div class="desktop-settings__tools">
              <button type="button" class="desktop-tool-btn" data-settings-action="share" title="${T.share}">↗</button>
              <button type="button" class="desktop-tool-btn" data-settings-action="viber" title="${T.viber}">◉</button>
              <button type="button" class="desktop-tool-btn" data-settings-action="qr" title="${T.qr}">▦</button>
            </div>
          </header>

          <div class="desktop-settings__popover" data-settings-popover hidden></div>

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

          <section class="desktop-support-card">
            <div class="desktop-support-card__paypal">P</div>
            <div class="desktop-support-card__copy">
              <small>${T.support}</small>
              <strong>${T.supportText}</strong>
            </div>
            <button type="button" class="desktop-settings__button desktop-settings__button--paypal" data-settings-action="paypal">${T.paypal}</button>
          </section>
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


      const popover=main.querySelector('[data-settings-popover]');
      function showPopover(type){
        if(!popover) return;
        if(type==='qr'){
          popover.innerHTML=`<div class="desktop-qr-popover"><strong>${T.qr}</strong><img src="./img/moyamova-share-qr.png" alt="QR"><span>${APP_URL}</span></div>`;
        }else if(type==='viber'){
          popover.innerHTML=`<div class="desktop-viber-popover"><strong>${T.viber}</strong><p>${uk()?'Приєднуйтесь до групи для спілкування та підтримки.':'Присоединяйтесь к группе для общения и поддержки.'}</p><button type="button" class="desktop-settings__button desktop-settings__button--viber">${uk()?'Перейти в групу':'Перейти в группу'}</button></div>`;
          popover.querySelector('button').onclick=()=>openExternal(VIBER_URL);
        }
        popover.hidden=false;
      }
      main.querySelector('[data-settings-action="share"]').onclick=shareApp;
      main.querySelector('[data-settings-action="viber"]').onclick=()=>showPopover('viber');
      main.querySelector('[data-settings-action="qr"]').onclick=()=>showPopover('qr');
      main.querySelector('[data-settings-action="paypal"]').onclick=()=>openExternal(PAYPAL_URL);

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

          const about=document.createElement('button');
          about.type='button';
          about.dataset.desktopAbout='1';
          about.innerHTML='ⓘ <span>'+T.about+'</span>';
          about.addEventListener('click',()=>renderAbout(side.closest('.dashboard,.trainer-desktop-shell,.desktop-pages-shell')));
          nav.appendChild(about);
        }else{
          const span=btn.querySelector('span');
          if(span) span.textContent=txt().settings;
          const about=nav.querySelector('[data-desktop-about] span');
          if(about) about.textContent=txt().about;
        }

        const shell=side.closest('.dashboard,.trainer-desktop-shell,.desktop-pages-shell');
        if(settingsOpen && shell && !mainOf(shell).querySelector('.desktop-settings')){
          requestAnimationFrame(()=>renderSettings(shell));
        }
      });
    }

    document.addEventListener('click',e=>{
      const b=e.target&&e.target.closest&&e.target.closest('.dash-side nav button,.trainer-side nav button,.desktop-pages-side nav button');
      if(b && !b.hasAttribute('data-desktop-settings') && !b.hasAttribute('data-desktop-about')) settingsOpen=false;
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
