/* MOYAMOVA 1.12.3 — Mobile Prepositions Trainer shell */
(function(){
  'use strict';

  const mq=window.matchMedia?window.matchMedia('(max-width:899px)'):null;

  function mobile(){return !!(mq&&mq.matches)}
  function active(){
    const app=document.getElementById('app');
    return !!(app&&app.querySelector('.home-trainer.home-trainer--preps'));
  }
  function uk(){
    try{
      const v=String((window.App&&App.settings&&(App.settings.uiLang||App.settings.lang))||document.documentElement.lang||'ru').toLowerCase();
      return v.startsWith('uk');
    }catch(_){return false}
  }

  function goHome(){
    try{
      if(window.App&&App.Router&&typeof App.Router.routeTo==='function')App.Router.routeTo('home');
    }catch(_){}
  }

  function openMenu(){
    try{
      document.body.classList.add('menu-open');
      const oc=document.querySelector('.oc-root');
      if(oc)oc.setAttribute('aria-hidden','false');
    }catch(_){}
  }

  function syncTtsButton(){
    const btn=document.querySelector('.preps-mobile-tools [data-preps-tool="tts"]');
    if(!btn)return;
    let on=false;
    try{on=localStorage.getItem('mm.tts.words')==='1'}catch(_){}
    btn.classList.toggle('is-active',on);
    btn.setAttribute('aria-pressed',String(on));
  }

  function ensureTools(home){
    if(!home)return;
    let tools=home.querySelector('.preps-mobile-tools');
    if(!tools){
      tools=document.createElement('section');
      tools.className='preps-mobile-tools trainer-quickbar';
      const card=home.querySelector('.home-trainer.home-trainer--preps');
      if(card&&card.nextSibling)home.insertBefore(tools,card.nextSibling);
      else if(card)home.appendChild(tools);
    }

    const U=uk();
    let tts=false;
    try{tts=localStorage.getItem('mm.tts.words')==='1'}catch(_){}

    tools.innerHTML=
      '<button type="button" class="trainer-qbtn'+(tts?' is-active':'')+'" data-preps-tool="tts" aria-pressed="'+String(tts)+'" title="'+(U?'Увімкнути або вимкнути озвучення':'Включить или выключить озвучку')+'">'+
        '<span class="trainer-qico qico-word" aria-hidden="true">🔊</span>'+
        '<span class="trainer-qlabel">'+(U?'Озвучення':'Озвучка')+'</span>'+
      '</button>'+
      '<button type="button" class="trainer-qbtn" data-preps-tool="skip" title="'+(U?'Перейти до наступного завдання':'Перейти к следующему заданию')+'">'+
        '<span class="trainer-qico qico-reverse" aria-hidden="true">⇄</span>'+
        '<span class="trainer-qlabel">'+(U?'Пропустити':'Пропустить')+'</span>'+
      '</button>'+
      '<button type="button" class="trainer-qbtn" data-preps-tool="reveal" title="'+(U?'Показати правильний прийменник':'Показать правильный предлог')+'">'+
        '<span class="trainer-qico qico-focus" aria-hidden="true">?</span>'+
        '<span class="trainer-qlabel">'+(U?'Показати':'Показать')+'</span>'+
      '</button>';

    syncTtsButton();
  }

  function mount(){
    if(!mobile()||!active())return;

    document.documentElement.dataset.mobileShell='prepositions';

    const main=document.querySelector('.trainer-desktop-main');
    if(!main)return;

    let bar=main.querySelector('.mobile-preps-bar');
    if(!bar){
      bar=document.createElement('div');
      bar.className='mobile-preps-bar';
      main.insertBefore(bar,main.firstChild);
    }

    const U=uk();
    const html=
      '<button type="button" class="mobile-preps-back" data-mobile-preps-home aria-label="'+(U?'На головну':'На главную')+'">'+
        '<span class="mobile-preps-back__arrow" aria-hidden="true">‹</span><span>'+(U?'Головна':'Главная')+'</span>'+
      '</button>'+
      '<strong class="mobile-preps-title">'+(U?'Тренажер прийменників':'Тренажёр предлогов')+'</strong>'+
      '<button type="button" class="mobile-preps-menu" data-mobile-preps-menu aria-label="'+(U?'Відкрити меню':'Открыть меню')+'">•••</button>';

    if(bar.innerHTML!==html)bar.innerHTML=html;

    const home=main.querySelector('.home');
    if(home&&!home.querySelector('.preps-mobile-tools'))ensureTools(home);
    else syncTtsButton();

    try{
      if(window.MOYAMOVA_MobileNav&&typeof window.MOYAMOVA_MobileNav.sync==='function'){
        window.MOYAMOVA_MobileNav.sync();
      }
    }catch(_){}
  }

  function clickExistingIdk(){
    const card=document.querySelector('.home-trainer.home-trainer--preps');
    if(!card)return false;
    const idk=card.querySelector('.idk-btn');
    if(idk){idk.click();return true}
    return false;
  }

  function nextViaTrainer(){
    try{
      const A=window.App||{};
      if(A.Prepositions&&typeof A.Prepositions.next==='function'){A.Prepositions.next();return true}
      if(A.PrepositionsTrainer&&typeof A.PrepositionsTrainer.next==='function'){A.PrepositionsTrainer.next();return true}
      if(A.Trainer&&typeof A.Trainer.next==='function'){A.Trainer.next();return true}
    }catch(_){}
    return false;
  }

  document.addEventListener('click',function(e){
    const h=e.target&&e.target.closest?e.target.closest('[data-mobile-preps-home]'):null;
    if(h&&mobile()){e.preventDefault();goHome();return}

    const m=e.target&&e.target.closest?e.target.closest('[data-mobile-preps-menu]'):null;
    if(m&&mobile()){e.preventDefault();openMenu();return}

    const tool=e.target&&e.target.closest?e.target.closest('[data-preps-tool]'):null;
    if(!tool||!mobile()||document.documentElement.dataset.mobileShell!=='prepositions')return;

    const action=tool.getAttribute('data-preps-tool');

    if(action==='tts'){
      e.preventDefault();
      let next=true;
      try{next=localStorage.getItem('mm.tts.words')!=='1'}catch(_){}
      try{localStorage.setItem('mm.tts.words',next?'1':'0')}catch(_){}
      try{
        const A=window.App||{};
        if(A.AudioTTS&&typeof A.AudioTTS.refreshIndicators==='function')A.AudioTTS.refreshIndicators();
        if(next&&A.AudioTTS&&typeof A.AudioTTS.speakText==='function'){
          const sentence=document.querySelector('.home-trainer.home-trainer--preps .trainer-word');
          if(sentence)A.AudioTTS.speakText(String(sentence.textContent||''),false,{noVoice:true});
        }
      }catch(_){}
      syncTtsButton();
      return;
    }

    if(action==='skip'){
      e.preventDefault();
      if(nextViaTrainer())return;
      // Fallback to existing hidden "Не знаю" flow only if no dedicated next API exists.
      clickExistingIdk();
      return;
    }

    if(action==='reveal'){
      e.preventDefault();
      // Existing prepositions IDK/reveal semantics are reused.
      clickExistingIdk();
      return;
    }
  });

  const app=document.getElementById('app');
  function schedule(){
    [0,60,180,420].forEach(function(ms){setTimeout(mount,ms)});
  }

  if(app&&window.MutationObserver){
    new MutationObserver(schedule).observe(app,{childList:true,subtree:false});
  }

  document.addEventListener('DOMContentLoaded',schedule);
  window.addEventListener('pageshow',schedule);

  if(mq){
    if(typeof mq.addEventListener==='function')mq.addEventListener('change',schedule);
    else if(typeof mq.addListener==='function')mq.addListener(schedule);
  }

  schedule();
})();
