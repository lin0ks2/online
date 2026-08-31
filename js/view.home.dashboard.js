/* ==========================================================
 * MOYAMOVA — Home Dashboard
 * Version: 1.7.0
 * ========================================================== */
(function(){
  'use strict';
  const A = window.App || (window.App = {});

  const POS_ORDER = ['nouns','verbs','adjectives','adverbs','pronouns','prepositions','conjunctions','particles','numbers'];
  const POS_ICON = {nouns:'●',verbs:'↗',adjectives:'✦',adverbs:'⚡',pronouns:'◉',prepositions:'⌖',conjunctions:'↗',particles:'·',numbers:'#'};
  const POS_RU = {nouns:'Существительные',verbs:'Глаголы',adjectives:'Прилагательные',adverbs:'Наречия',pronouns:'Местоимения',prepositions:'Предлоги',conjunctions:'Союзы',particles:'Частицы',numbers:'Числительные'};
  const POS_UK = {nouns:'Іменники',verbs:'Дієслова',adjectives:'Прикметники',adverbs:'Прислівники',pronouns:'Займенники',prepositions:'Прийменники',conjunctions:'Сполучники',particles:'Частки',numbers:'Числівники'};

  function uk(){ return String((A.settings && (A.settings.uiLang || A.settings.lang)) || 'ru').toLowerCase() === 'uk'; }
  function esc(s){ return A.escapeHtml ? A.escapeHtml(String(s == null ? '' : s)) : String(s == null ? '' : s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
  function langOf(k){ try { return A.Decks && A.Decks.langOfKey ? A.Decks.langOfKey(k) : String(k||'').split('_')[0]; } catch(_){ return 'de'; } }
  function posOf(k){ const m=String(k||'').match(/^[a-z]{2}_([a-z]+)/i); return m ? m[1].toLowerCase() : ''; }
  function isLp(k){ return /_lernpunkt$/i.test(String(k||'')); }
  function baseKeys(){ try { return (A.Decks && A.Decks.builtinKeys ? A.Decks.builtinKeys() : []).filter(k=>!isLp(k)); } catch(_){ return []; } }
  function currentLang(){
    let k='';
    try { k=(A.Trainer&&A.Trainer.getDeckKey&&A.Trainer.getDeckKey()) || (A.settings&&A.settings.lastDeckKey) || ''; } catch(_){}
    const lg=langOf(k);
    if (lg && baseKeys().some(x=>langOf(x)===lg)) return lg;
    const saved=A.settings && (A.settings.dictsLang || A.settings.dictsLangFilter);
    if (saved && baseKeys().some(x=>langOf(x)===saved)) return saved;
    return baseKeys().some(x=>langOf(x)==='de') ? 'de' : (langOf(baseKeys()[0]) || 'de');
  }
  function languageName(lg){ const m={de:'Deutsch',en:'English',sr:'Srpski'}; return m[lg] || String(lg||'').toUpperCase(); }
  function starValue(key,w){ try { return Number((A.state&&A.state.stars&&A.state.stars[A.starKey(w.id,key)])||0); } catch(_){ return 0; } }
  function statsForKey(key){
    const deck=(A.Decks&&A.Decks.resolveDeckByKey) ? (A.Decks.resolveDeckByKey(key)||[]) : [];
    const mx=(A.Trainer&&A.Trainer.starsMax) ? A.Trainer.starsMax() : 5;
    let learned=0, started=0, stars=0;
    deck.forEach(w=>{ const s=Math.max(0,Math.min(mx,starValue(key,w))); stars+=s; if(s>=mx) learned++; if(s>0) started++; });
    return {total:deck.length,learned,started,stars,maxStars:deck.length*mx,pct:deck.length?Math.round(learned*100/deck.length):0};
  }
  function langStats(lg){
    const keys=baseKeys().filter(k=>langOf(k)===lg);
    return keys.reduce((a,k)=>{ const s=statsForKey(k); a.total+=s.total;a.learned+=s.learned;a.started+=s.started;a.stars+=s.stars;a.maxStars+=s.maxStars;return a;},{total:0,learned:0,started:0,stars:0,maxStars:0});
  }
  function mistakeCount(lg){
    try { return (A.Mistakes&&A.Mistakes.listSummary?A.Mistakes.listSummary():[]).filter(x=>langOf(x.baseKey)===lg).reduce((n,x)=>n+(x.count||0),0); } catch(_){ return 0; }
  }
  function favoriteCount(lg){
    try { return (A.Favorites&&A.Favorites.list?A.Favorites.list():[]).filter(x=>langOf(x.dictKey)===lg).length; } catch(_){ return 0; }
  }
  function lastKeyForLang(lg){
    let k=(A.settings&&A.settings.lastDeckKey)||'';
    if(k && langOf(k)===lg && !/^(favorites|mistakes):/.test(k)) return k;
    return baseKeys().find(x=>langOf(x)===lg) || baseKeys()[0] || '';
  }
  function posLabel(pos){ return (uk()?POS_UK:POS_RU)[pos] || pos; }
  function setFooterActive(action){ document.querySelectorAll('.app-footer .nav-btn').forEach(b=>b.classList.toggle('active',b.getAttribute('data-action')===action)); }
  function route(action){ try { if(A.Router&&A.Router.routeTo) A.Router.routeTo(action); } catch(_){} }
  function startDeck(key){
    if(!key) return;
    try { A.settings=A.settings||{}; A.settings.lastDeckKey=key; A.settings.trainerKind='words'; A.saveSettings&&A.saveSettings(A.settings); } catch(_){}
    try { A.Trainer&&A.Trainer.setDeckKey&&A.Trainer.setDeckKey(key); } catch(_){}
    try { document.dispatchEvent(new CustomEvent('lexitron:deck-selected',{detail:{key}})); } catch(_){}
    route('trainer');
  }
  function quickMode(mode){
    try {
      const setToggle=(id,val)=>{ const el=document.getElementById(id); if(el){ el.checked=!!val; try{ el.dispatchEvent(new Event('change',{bubbles:true})); }catch(_){} } };
      if(mode==='auto'){ localStorage.setItem('mm.train.autostep','1'); setToggle('trainAutostep',true); }
      if(mode==='reverse'){ localStorage.setItem('mm.train.reverse','1'); setToggle('trainReverse',true); }
      if(mode==='focus'){
        localStorage.setItem('mm.focus.hideSets','1'); localStorage.setItem('mm.focus.hideContext','1');
        setToggle('focusSets',true); setToggle('focusContext',true);
      }
    } catch(_){}
    startDeck(lastKeyForLang(currentLang()));
  }
  function circle(p){ return `<div class="dash-ring" style="--p:${Math.max(0,Math.min(100,p||0))}"><span>${p||0}%</span></div>`; }

  function mount(){
    const app=document.getElementById('app'); if(!app) return;
    const lg=currentLang(); const ls=langStats(lg); const last=lastKeyForLang(lg); const lastS=statsForKey(last);
    const started=Math.max(0,ls.started-ls.learned); const mistakes=mistakeCount(lg); const favs=favoriteCount(lg);
    const overall=ls.total?Math.round(ls.learned*100/ls.total):0;
    const keys=baseKeys().filter(k=>langOf(k)===lg).sort((a,b)=>POS_ORDER.indexOf(posOf(a))-POS_ORDER.indexOf(posOf(b)));
    const POS=uk()?POS_UK:POS_RU;
    const T=uk()?{
      hello:'Готові вчитися?',sub:'Послідовність важливіша за інтенсивність.',overall:'Загальний прогрес',mastered:'Освоєно',inprogress:'У процесі',stars:'Зірок зароблено',continue:'Продовжити навчання',quick:'Швидкий старт',auto:'Авто',reverse:'Зворотний',focus:'Фокус',decks:'Словники за частинами мови',all:'Усі словники',errors:'Помилки',favorites:'Вибране',stats:'Статистика',dicts:'Словники',home:'Головна',trainer:'Тренажер',settings:'Налаштування',words:'слів',continueBtn:'Продовжити',tip:'Порада: краще трохи щодня, ніж багато зрідка.'
    }:{
      hello:'Готовы учиться?',sub:'Регулярность важнее интенсивности.',overall:'Общий прогресс',mastered:'Освоено',inprogress:'В процессе',stars:'Звёзд заработано',continue:'Продолжить обучение',quick:'Быстрый старт',auto:'Авто',reverse:'Обратный',focus:'Фокус',decks:'Словари по частям речи',all:'Все словари',errors:'Ошибки',favorites:'Избранное',stats:'Статистика',dicts:'Словари',home:'Главная',trainer:'Тренажёр',settings:'Настройки',words:'слов',continueBtn:'Продолжить',tip:'Совет: лучше понемногу каждый день, чем много изредка.'
    };
    const cards=keys.map(k=>{ const s=statsForKey(k), p=posOf(k); return `<button class="dash-deck" data-deck="${esc(k)}"><div class="dash-deck-top"><span class="dash-pos-icon">${POS_ICON[p]||'•'}</span><strong>${esc(POS[p]||p)}</strong></div>${circle(s.pct)}<div class="dash-deck-count">${s.learned} / ${s.total}</div></button>`; }).join('');

    app.innerHTML=`<div class="dashboard" data-lang="${esc(lg)}">
      <aside class="dash-side">
        <div class="dash-brand"><img src="./img/logo_64.png" alt=""><div><strong>MOYAMOVA</strong><span>${esc(languageName(lg))}</span></div></div>
        <nav>
          <button class="is-active" data-route="home">⌂ <span>${T.home}</span></button>
          <button data-route="trainer">▶ <span>${T.trainer}</span></button>
          <button data-route="dicts">▤ <span>${T.dicts}</span></button>
          <button data-route="mistakes">△ <span>${T.errors}</span><b>${mistakes||''}</b></button>
          <button data-route="fav">☆ <span>${T.favorites}</span><b>${favs||''}</b></button>
          <button data-route="stats">▥ <span>${T.stats}</span></button>
        </nav>
        <div class="dash-side-foot">v${esc(A.APP_VER||'1.7.0')} · Offline <i></i></div>
      </aside>
      <section class="dash-main">
        <header class="dash-head"><div><div class="dash-eyebrow">${esc(languageName(lg))}</div><h2>${T.hello} 👋</h2><p>${T.sub}</p></div><button class="dash-settings" data-open-menu aria-label="${T.settings}">⚙</button></header>
        <div class="dash-metrics">
          <article><span>${T.overall}</span>${circle(overall)}<b>${ls.learned} / ${ls.total}</b></article>
          <article><span>${T.mastered}</span><div class="dash-big dash-green">✓</div><b>${ls.learned}</b><small>${T.words}</small></article>
          <article><span>${T.inprogress}</span><div class="dash-big dash-blue">◫</div><b>${started}</b><small>${T.words}</small></article>
          <article><span>${T.stars}</span><div class="dash-big dash-gold">★</div><b>${Math.round(ls.stars)}</b><small>${ls.maxStars?Math.round(ls.stars*100/ls.maxStars):0}%</small></article>
        </div>
        <article class="dash-continue">
          <div class="dash-continue-copy"><span class="dash-section-label">${T.continue}</span><h3>${esc(A.Decks&&A.Decks.resolveNameByKey?A.Decks.resolveNameByKey(last):last)}</h3><div class="dash-progress"><i style="width:${lastS.pct}%"></i></div><p>${lastS.learned} / ${lastS.total} ${T.words} · ${lastS.pct}%</p></div>
          <div class="dash-flashcards"><span>${esc((A.Decks.resolveDeckByKey(last)[0]||{}).word||'Wort')}</span><small>★ ${Math.round(lastS.stars)} / ${lastS.maxStars}</small></div>
          <button class="dash-primary" data-continue>${T.continueBtn} →</button>
        </article>
        <section class="dash-block"><div class="dash-title"><h3>${T.quick}</h3></div><div class="dash-quick"><button data-mode="auto"><i>▶</i><b>${T.auto}</b></button><button data-mode="reverse"><i>↔</i><b>${T.reverse}</b></button><button data-mode="focus"><i>◎</i><b>${T.focus}</b></button></div></section>
        <section class="dash-block"><div class="dash-title"><h3>${T.decks}</h3><button data-route="dicts">${T.all} →</button></div><div class="dash-decks">${cards}</div></section>
        <div class="dash-bottom"><button data-route="mistakes"><span>△</span><div><b>${T.errors}</b><small>${mistakes} ${T.words}</small></div><em>→</em></button><button data-route="fav"><span>☆</span><div><b>${T.favorites}</b><small>${favs} ${T.words}</small></div><em>→</em></button></div>
        <div class="dash-tip">💡 ${T.tip}</div>
      </section>
    </div>`;

    app.querySelectorAll('[data-route]').forEach(el=>el.addEventListener('click',()=>route(el.getAttribute('data-route'))));
    app.querySelector('[data-continue]')?.addEventListener('click',()=>startDeck(last));
    app.querySelectorAll('[data-deck]').forEach(el=>el.addEventListener('click',()=>startDeck(el.getAttribute('data-deck'))));
    app.querySelectorAll('[data-mode]').forEach(el=>el.addEventListener('click',()=>quickMode(el.getAttribute('data-mode'))));
    app.querySelector('[data-open-menu]')?.addEventListener('click',()=>document.getElementById('btnMenu')?.click());
    setFooterActive('home');
  }

  A.HomeDashboard={mount,startDeck};
})();
