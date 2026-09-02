/* MOYAMOVA 1.11.6 — Mobile Articles Trainer shell */
(function(){
  'use strict';
  const mq=window.matchMedia?window.matchMedia('(max-width:899px)'):null;

  function mobile(){return !!(mq&&mq.matches)}
  function active(){const app=document.getElementById('app');return !!(app&&app.querySelector('.home-trainer.is-articles'))}
  function uk(){
    try{
      const v=String((window.App&&App.settings&&(App.settings.uiLang||App.settings.lang))||document.documentElement.lang||'ru').toLowerCase();
      return v.startsWith('uk');
    }catch(_){return false}
  }
  function goHome(){
    try{if(window.App&&App.Router&&typeof App.Router.routeTo==='function')App.Router.routeTo('home')}catch(_){}
  }
  function openMenu(){
    try{
      document.body.classList.add('menu-open');
      const oc=document.querySelector('.oc-root');if(oc)oc.setAttribute('aria-hidden','false')
    }catch(_){}
  }
  function ensureTools(home){
    if(!home)return;
    let tools=home.querySelector('.articles-mobile-tools');
    if(!tools){
      tools=document.createElement('section');
      tools.className='articles-mobile-tools';
      const card=home.querySelector('.home-trainer.is-articles');
      if(card&&card.nextSibling)home.insertBefore(tools,card.nextSibling);
      else if(card)home.appendChild(tools);
    }
    const U=uk();
    let tts=false;try{tts=localStorage.getItem('mm.tts.words')==='1'}catch(_){}
    if (!tools.dataset.mobileReady) {
      tools.innerHTML=
        '<button type="button" class="articles-mobile-tool'+(tts?' is-active':'')+'" data-articles-tool="tts" aria-pressed="'+String(tts)+'"><i>🔊</i><b>'+(U?'Озвучення':'Озвучка')+'</b></button>'+
        '<button type="button" class="articles-mobile-tool" data-articles-tool="skip"><i>⇄</i><b>'+(U?'Пропустити':'Пропустить')+'</b></button>'+
        '<button type="button" class="articles-mobile-tool" data-articles-tool="reveal"><i>?</i><b>'+(U?'Показати':'Показать')+'</b></button>';
      tools.dataset.mobileReady='1';
    }
  }
  function mount(){
    if(!mobile()||!active())return;
    document.documentElement.dataset.mobileShell='articles';
    const main=document.querySelector('.trainer-desktop-main');
    if(!main)return;
    let bar=main.querySelector('.mobile-articles-bar');
    if(!bar){
      bar=document.createElement('div');bar.className='mobile-articles-bar';main.insertBefore(bar,main.firstChild);
    }
    const U=uk();
    if (!bar.dataset.mobileReady) {
      bar.innerHTML=
        '<button type="button" class="mobile-articles-back" data-mobile-articles-home aria-label="'+(U?'На головну':'На главную')+'">'+
        '<span class="mobile-articles-back__arrow" aria-hidden="true">‹</span><span>'+(U?'Головна':'Главная')+'</span></button>'+
        '<strong class="mobile-articles-title">'+(U?'Тренажер артиклів':'Тренажёр артиклей')+'</strong>'+
        '<button type="button" class="mobile-articles-menu" data-mobile-articles-menu aria-label="'+(U?'Відкрити меню':'Открыть меню')+'">•••</button>';
      bar.dataset.mobileReady='1';
    }
    ensureTools(main.querySelector('.home'));
    try{if(window.MOYAMOVA_MobileNav&&typeof window.MOYAMOVA_MobileNav.sync==='function')window.MOYAMOVA_MobileNav.sync()}catch(_){}
  }

  document.addEventListener('click',function(e){
    const h=e.target&&e.target.closest?e.target.closest('[data-mobile-articles-home]'):null;
    if(h&&mobile()){e.preventDefault();goHome();return}
    const m=e.target&&e.target.closest?e.target.closest('[data-mobile-articles-menu]'):null;
    if(m&&mobile()){e.preventDefault();openMenu()}
  });

  const app=document.getElementById('app');
  if(app&&window.MutationObserver){
    let queued=false;
    new MutationObserver(function(){
      if(queued)return;
      queued=true;
      setTimeout(function(){queued=false;mount()},0);
    }).observe(app,{childList:true,subtree:true});
  }
  document.addEventListener('DOMContentLoaded',mount);
  window.addEventListener('pageshow',mount);
  if(mq){
    if(typeof mq.addEventListener==='function')mq.addEventListener('change',mount);
    else if(typeof mq.addListener==='function')mq.addListener(mount)
  }
  setTimeout(mount,0);
})();
