/* ==========================================================
 * MOYAMOVA 1.10.8 — Guide / Instruction V3
 * Desktop: unified MOYAMOVA shell. Mobile: clean standalone guide.
 * ========================================================== */
(function(root){
  'use strict';

  function A(){ return root.App || (root.App={}); }
  function app(){ return document.getElementById('app'); }
  function uk(){
    try{
      const a=A();
      const raw=String((a.settings&&(a.settings.uiLang||a.settings.lang))||document.documentElement.lang||'ru').toLowerCase();
      return raw==='uk'||raw==='ua'||raw.startsWith('uk-');
    }catch(_){ return false; }
  }
  function langOf(key){
    try{
      const a=A();
      return (a.Decks&&a.Decks.langOfKey&&a.Decks.langOfKey(key)) || String(key||'').split('_')[0] || 'de';
    }catch(_){ return 'de'; }
  }
  function currentLearnLang(){
    try{
      const a=A();
      const k=(a.Trainer&&a.Trainer.getDeckKey&&a.Trainer.getDeckKey())||(a.settings&&a.settings.lastDeckKey)||'de';
      return langOf(k);
    }catch(_){ return 'de'; }
  }
  function languageName(lg){
    return ({de:'Deutsch',en:'English',sr:'Srpski',es:'Español',fr:'Français'})[lg]||String(lg||'').toUpperCase();
  }
  function navCounts(lg){
    const a=A(); let mistakes=0,favs=0;
    try{
      const xs=(a.Mistakes&&a.Mistakes.listSummary?a.Mistakes.listSummary():[])||[];
      mistakes=xs.filter(x=>langOf(x.baseKey)===lg).reduce((n,x)=>n+Number(x.count||0),0);
    }catch(_){}
    try{
      const xs=(a.Favorites&&a.Favorites.list?a.Favorites.list():[])||[];
      favs=xs.filter(x=>langOf(x.dictKey)===lg).length;
    }catch(_){}
    return {mistakes,favs};
  }
  function route(action){
    try{
      const a=A();
      if(a.Router&&typeof a.Router.routeTo==='function'){ a.Router.routeTo(action); return; }
    }catch(_){}
    try{
      const btn=document.querySelector('.app-footer .nav-btn[data-action="'+action+'"]');
      if(btn) btn.click();
    }catch(_){}
  }

  function T(){
    if(uk()) return {
      title:'Інструкція',
      sub:'Усе необхідне для роботи з MOYAMOVA',
      start:'Почніть звідси',
      flow:['Оберіть словник','Тренуйтеся','Отримуйте зірки','Повторюйте складне'],
      cards:[
        ['◎','Як проходить навчання',
          'MOYAMOVA допомагає поступово запам’ятовувати слова та мовні конструкції. Виберіть мову і словник, відкрийте тренажер та займайтеся невеликими підходами.',
          'Слова розділені на невеликі сети. За правильні відповіді слово отримує зірки. Коли набрано необхідну кількість зірок, воно вважається вивченим. Помилкові відповіді сповільнюють прогрес і допомагають частіше повертатися до складних слів.'],
        ['▤','Режими тренування',
          'Слова — основний режим для вивчення слів і перекладів. Виберіть правильний варіант із чотирьох відповідей.',
          'Артиклі — тренування німецьких іменників та їхнього роду: der, die або das. Прийменники — вибір відповідного прийменника в реченні; після правильної відповіді він підставляється у пропуск.'],
        ['⚙','Панель тренування',
          'Auto автоматично переходить до наступного завдання після відповіді. Reverse змінює напрямок запитання та перекладу там, де режим це підтримує.',
          'Focus прибирає другорядні елементи та залишає тільки тренування. Кнопки озвучення в нижній панелі дозволяють керувати вимовою слів і прикладів.'],
        ['♡','Помилки та Вибране',
          'Слова, у яких ви помиляєтеся, автоматично зберігаються в розділі «Помилки». Використовуйте його для окремого повторення складного матеріалу.',
          'Натисніть ♡ на картці слова, щоб додати його до Вибраного. Так можна створити власний список слів для повторення. Лічильники в боковому меню показують поточну кількість.'],
        ['▥','Прогрес і статистика',
          'Розділ «Статистика» показує ваш прогрес за словниками та частинами мови, активність навчання і результати спеціальних тренажерів.',
          'Прогрес зберігається автоматично. На Головній можна швидко продовжити останній словник і побачити загальний стан навчання.'],
        ['⬇','Дані та робота офлайн',
          'MOYAMOVA створена як локальний застосунок. Після завантаження необхідних файлів основні функції доступні без постійного підключення до інтернету.',
          'Навчальний прогрес зберігається на вашому пристрої. Використовуйте резервну копію в Налаштуваннях перед очищенням браузера, перевстановленням застосунку або перенесенням даних.']
      ],
      note:'Ваш прогрес належить вам — не забувайте час від часу створювати резервну копію.',
      back:'Назад до налаштувань',
      nav:{home:'Головна',trainer:'Тренажер',dicts:'Словники',mistakes:'Помилки',fav:'Обране',stats:'Статистика',settings:'Налаштування'}
    };
    return {
      title:'Инструкция',
      sub:'Всё необходимое для работы с MOYAMOVA',
      start:'Начните отсюда',
      flow:['Выберите словарь','Тренируйтесь','Получайте звёзды','Повторяйте сложное'],
      cards:[
        ['◎','Как проходит обучение',
          'MOYAMOVA помогает постепенно запоминать слова и языковые конструкции. Выберите язык и словарь, откройте тренажёр и занимайтесь небольшими подходами.',
          'Слова разделены на небольшие сеты. За правильные ответы слово получает звёзды. Когда набрано необходимое количество звёзд, оно считается выученным. Ошибочные ответы замедляют прогресс и помогают чаще возвращаться к сложным словам.'],
        ['▤','Режимы тренировки',
          'Слова — основной режим для изучения слов и переводов. Выберите правильный вариант из четырёх ответов.',
          'Артикли — тренировка немецких существительных и их рода: der, die или das. Предлоги — выбор подходящего предлога в предложении; после правильного ответа он подставляется в пропуск.'],
        ['⚙','Панель тренировки',
          'Auto автоматически переходит к следующему заданию после ответа. Reverse меняет направление вопроса и перевода там, где режим это поддерживает.',
          'Focus убирает второстепенные элементы и оставляет только тренировку. Кнопки озвучки в нижней панели позволяют управлять произношением слов и примеров.'],
        ['♡','Ошибки и Избранное',
          'Слова, в которых вы ошибаетесь, автоматически сохраняются в разделе «Ошибки». Используйте его для отдельного повторения сложного материала.',
          'Нажмите ♡ на карточке слова, чтобы добавить его в Избранное. Так можно создать собственный список слов для повторения. Счётчики в боковом меню показывают текущее количество.'],
        ['▥','Прогресс и статистика',
          'Раздел «Статистика» показывает ваш прогресс по словарям и частям речи, активность обучения и результаты специальных тренажёров.',
          'Прогресс сохраняется автоматически. На Главной можно быстро продолжить последний словарь и увидеть общий статус обучения.'],
        ['⬇','Данные и работа офлайн',
          'MOYAMOVA создана как локальное приложение. После загрузки необходимых файлов основные функции доступны без постоянного подключения к интернету.',
          'Учебный прогресс хранится на вашем устройстве. Используйте резервную копию в Настройках перед очисткой браузера, переустановкой приложения или переносом данных.']
      ],
      note:'Ваш прогресс принадлежит вам — не забывайте иногда создавать резервную копию.',
      back:'Назад к настройкам',
      nav:{home:'Главная',trainer:'Тренажёр',dicts:'Словари',mistakes:'Ошибки',fav:'Избранное',stats:'Статистика',settings:'Настройки'}
    };
  }

  function sideHtml(t,lg,c){
    const ver=(A().APP_VER||'1.10.8');
    return '<aside class="dash-side guide-side">'+
      '<div class="dash-brand"><img src="./img/logo_64.png" alt=""><div><strong>MOYAMOVA</strong><span>'+languageName(lg)+'</span></div></div>'+
      '<nav>'+
        '<button data-guide-route="home">⌂ <span>'+t.nav.home+'</span></button>'+
        '<button data-guide-route="trainer">▶ <span>'+t.nav.trainer+'</span></button>'+
        '<button data-guide-route="dicts">▤ <span>'+t.nav.dicts+'</span></button>'+
        '<button data-guide-route="mistakes">△ <span>'+t.nav.mistakes+'</span>'+(c.mistakes?'<b class="desktop-nav-count">'+c.mistakes+'</b>':'')+'</button>'+
        '<button data-guide-route="fav">♡ <span>'+t.nav.fav+'</span>'+(c.favs?'<b class="desktop-nav-count">'+c.favs+'</b>':'')+'</button>'+
        '<button data-guide-route="stats">▥ <span>'+t.nav.stats+'</span></button>'+
        '<div class="guide-side-sep"></div>'+
        '<button class="is-active" data-guide-route="settings">⚙ <span>'+t.nav.settings+'</span></button>'+
      '</nav>'+
      '<div class="dash-side-foot">v'+ver+' · Offline <i></i></div>'+
    '</aside>';
  }

  function cardsHtml(t){
    return t.cards.map((c,i)=>
      '<details class="guide-v3-card"'+(i===0?' open':'')+'>'+
        '<summary><i>'+c[0]+'</i><span><b>'+c[1]+'</b><small>'+c[2]+'</small></span><em>⌄</em></summary>'+
        '<div class="guide-v3-body"><p>'+c[2]+'</p><p>'+c[3]+'</p></div>'+
      '</details>'
    ).join('');
  }

  function contentHtml(t){
    return '<header class="guide-v3-head"><div><span>MOYAMOVA</span><h1>'+t.title+'</h1><p>'+t.sub+'</p></div>'+
      '<button class="guide-v3-back" data-guide-back>← '+t.back+'</button></header>'+
      '<section class="guide-v3-start"><div class="guide-v3-start-title"><i>✓</i><div><b>'+t.start+'</b><span>MOYAMOVA</span></div></div>'+
      '<div class="guide-v3-flow">'+t.flow.map((x,i)=>'<div><i>'+(i+1)+'</i><span>'+x+'</span>'+(i<t.flow.length-1?'<em>→</em>':'')+'</div>').join('')+'</div></section>'+
      '<section class="guide-v3-grid">'+cardsHtml(t)+'</section>'+
      '<aside class="guide-v3-note">💡 '+t.note+'</aside>';
  }

  function mount(){
    const el=app(); if(!el) return;
    const t=T(), lg=currentLearnLang(), counts=navCounts(lg);
    const desktop=!!(root.matchMedia&&root.matchMedia('(min-width:900px)').matches);

    if(desktop){
      el.innerHTML='<div class="guide-v3-shell">'+sideHtml(t,lg,counts)+'<main class="guide-v3-main">'+contentHtml(t)+'</main></div>';
    }else{
      el.innerHTML='<main class="guide-v3-mobile">'+contentHtml(t)+'</main>';
    }

    el.querySelectorAll('[data-guide-route]').forEach(btn=>btn.addEventListener('click',()=>route(btn.getAttribute('data-guide-route'))));
    el.querySelector('[data-guide-back]')?.addEventListener('click',()=>route('settings'));
    try{
      document.querySelectorAll('.app-footer .nav-btn').forEach(b=>b.classList.remove('active'));
    }catch(_){}
  }

  if(!root.__moyaGuideV3LangBind){
    root.__moyaGuideV3LangBind=true;
    document.addEventListener('lexitron:ui-lang-changed',()=>{
      try{ if(app()&&app().querySelector('.guide-v3-shell,.guide-v3-mobile')) mount(); }catch(_){}
    });
  }

  root.Guide={open:mount};
  A().ViewGuide={mount};
})(window);
