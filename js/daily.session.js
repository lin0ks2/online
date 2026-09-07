/* ==========================================================
 * MOYAMOVA — Daily Session / «Сегодня»
 * First production-safe iteration: builds a short adaptive queue
 * from existing progress + mistakes and reuses the existing trainer.
 * ========================================================== */
(function(){
  'use strict';
  const A = window.App || (window.App = {});
  const MAX = 30;
  const TARGET = 25;
  let active = null;

  function uiLang(){
    try { return String((A.settings && (A.settings.uiLang || A.settings.lang)) || 'ru').toLowerCase()==='uk' ? 'uk' : 'ru'; }
    catch(_){ return 'ru'; }
  }
  function langOfKey(k){
    try { return (A.Decks && A.Decks.langOfKey && A.Decks.langOfKey(k)) || String(k||'').split('_')[0] || 'de'; }
    catch(_){ return String(k||'').split('_')[0] || 'de'; }
  }
  function currentLang(){
    try {
      const k=(A.settings&&A.settings.lastDeckKey)||'';
      const lg=langOfKey(k);
      if(lg) return lg;
    } catch(_){}
    return 'de';
  }
  function baseKeys(lg){
    try{
      const all=(window.DeckLoader&&DeckLoader.availableKeys)?DeckLoader.availableKeys():[];
      return all.filter(k=>langOfKey(k)===lg && !/_lernpunkt$/i.test(k) && !/^favorites:|^mistakes:|_trainer$/i.test(k));
    }catch(_){ return []; }
  }
  function starKey(id,key){ return A.starKey ? A.starKey(id,key) : `${key}:${id}`; }
  function starOf(key,w){
    try { return Number((A.state&&A.state.stars&&A.state.stars[starKey(w.id,key)])||0)||0; }
    catch(_){ return 0; }
  }
  function seenOf(key,w){
    try { return Number((A.state&&A.state.lastSeen&&A.state.lastSeen[starKey(w.id,key)])||0)||0; }
    catch(_){ return 0; }
  }
  function mistakeInfo(trainLang,key,id){
    try{
      const b=A.mistakes&&A.mistakes.buckets&&A.mistakes.buckets[trainLang]&&A.mistakes.buckets[trainLang][key];
      if(!b||!b.ids||!b.ids.has(String(id))) return null;
      return (b.meta&&b.meta.get&&b.meta.get(String(id))) || {count:1,last:0};
    }catch(_){ return null; }
  }
  function cloneForDaily(w,key,type){
    const c=Object.assign({},w);
    c._dailySourceKey=key;
    c._dailySourceType=type;
    c._dailyOriginalId=w.id;
    // Daily mixes several source decks; make UI ids collision-proof while
    // keeping the canonical id for progress/mistakes/favorites.
    c.id=key+'::'+String(w.id);
    return c;
  }
  function uniquePush(out,seen,item){
    if(!item) return false;
    const k=String(item._dailySourceKey||'')+'::'+String(item.id);
    if(seen.has(k)) return false;
    seen.add(k); out.push(item); return true;
  }
  function shuffle(arr){
    const a=arr.slice();
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); const t=a[i];a[i]=a[j];a[j]=t; }
    return a;
  }

  function preview(lg){
    lg=lg||currentLang();
    const tl=uiLang();
    const keys=baseKeys(lg);
    let started=0, learned=0, mistakes=0, total=0;
    const mx=(A.Trainer&&A.Trainer.starsMax)?A.Trainer.starsMax():5;
    keys.forEach(key=>{
      try{
        const e=window.DeckLoader&&DeckLoader.getEntry?DeckLoader.getEntry(key):null;
        total+=e?Number(e.count||0):0;
      }catch(_){}
      try{
        const prefix=key+':';
        Object.keys((A.state&&A.state.stars)||{}).forEach(sk=>{
          if(String(sk).indexOf(prefix)!==0) return;
          const s=Number(A.state.stars[sk]||0)||0;
          if(s>0) started++;
          if(s>=mx) learned++;
        });
      }catch(_){}
      try{
        const b=A.mistakes&&A.mistakes.buckets&&A.mistakes.buckets[tl]&&A.mistakes.buckets[tl][key];
        mistakes+=b&&b.ids?b.ids.size:0;
      }catch(_){}
    });
    const newAvail=Math.max(0,total-started);
    const reviewAvail=Math.max(0,started-learned);
    let m=Math.min(5,mistakes);
    let n=newAvail?Math.min(started===0?12:8,newAvail):0;
    if(newAvail && started>0) n=Math.max(Math.min(5,newAvail),n);
    let r=Math.min(15,Math.max(0,TARGET-m-n),reviewAvail);
    let sum=m+n+r;
    if(sum<TARGET && newAvail>n){ const add=Math.min(TARGET-sum,newAvail-n,12-n); n+=Math.max(0,add); sum=m+n+r; }
    if(sum<TARGET && reviewAvail>r){ const add=Math.min(TARGET-sum,reviewAvail-r,15-r); r+=Math.max(0,add); sum=m+n+r; }
    if(sum===0 && total>0){ n=Math.min(12,total); sum=n; }
    const minutes=Math.max(3,Math.round(sum*0.28));
    return {lang:lg,review:r,newWords:n,mistakes:m,total:Math.min(MAX,sum),minutes};
  }

  async function loadDeck(key){
    try{
      if(window.DeckLoader&&typeof DeckLoader.load==='function') return await DeckLoader.load(key);
      return (A.Decks&&A.Decks.resolveDeckByKey)?(A.Decks.resolveDeckByKey(key)||[]):[];
    }catch(_){ return []; }
  }

  async function build(lg){
    lg=lg||currentLang();
    const tl=uiLang();
    const plan=preview(lg);
    const keys=baseKeys(lg);
    const last=(A.settings&&A.settings.lastDeckKey)||'';
    keys.sort((a,b)=>(a===last?-1:b===last?1:0));

    const mistakes=[]; const reviews=[]; const fresh=[];
    for(const key of keys){
      const deck=await loadDeck(key);
      for(const w of deck){
        if(!w||w.id==null) continue;
        const mi=mistakeInfo(tl,key,w.id);
        const s=starOf(key,w);
        if(mi){ mistakes.push({w,key,count:Number(mi.count||1),last:Number(mi.last||0)}); continue; }
        if(s>0 && s<5) reviews.push({w,key,s,last:seenOf(key,w)});
        else if(s<=0) fresh.push({w,key,last:seenOf(key,w)});
      }
    }
    mistakes.sort((a,b)=>(b.count-a.count)||(b.last-a.last));
    reviews.sort((a,b)=>(a.last-b.last)||(a.s-b.s));
    fresh.sort((a,b)=>((a.key===last?-1:0)-(b.key===last?-1:0))||(a.last-b.last));

    const out=[]; const seen=new Set();
    shuffle(mistakes.slice(0,Math.max(plan.mistakes,8))).slice(0,plan.mistakes).forEach(x=>uniquePush(out,seen,cloneForDaily(x.w,x.key,'mistake')));
    reviews.slice(0,plan.review).forEach(x=>uniquePush(out,seen,cloneForDaily(x.w,x.key,'review')));
    fresh.slice(0,plan.newWords).forEach(x=>uniquePush(out,seen,cloneForDaily(x.w,x.key,'new')));

    // Fill a short session without violating the 30-card ceiling.
    const fill=[...reviews.slice(plan.review),...fresh.slice(plan.newWords),...mistakes.slice(plan.mistakes)];
    for(const x of fill){
      if(out.length>=Math.min(MAX,Math.max(12,plan.total))) break;
      uniquePush(out,seen,cloneForDaily(x.w,x.key,x.s!=null?'review':(x.count!=null?'mistake':'new')));
    }

    // Interleave categories so new words are present throughout the session.
    const groups={mistake:[],review:[],new:[]};
    out.forEach(w=>(groups[w._dailySourceType]||groups.review).push(w));
    groups.mistake=shuffle(groups.mistake); groups.review=shuffle(groups.review); groups.new=shuffle(groups.new);
    const mixed=[];
    while(mixed.length<out.length){
      if(groups.review.length) mixed.push(groups.review.shift());
      if(groups.new.length) mixed.push(groups.new.shift());
      if(groups.review.length) mixed.push(groups.review.shift());
      if(groups.mistake.length) mixed.push(groups.mistake.shift());
      if(groups.new.length) mixed.push(groups.new.shift());
    }
    return {queue:mixed.slice(0,MAX),plan:{lang:lg,review:mixed.filter(w=>w._dailySourceType==='review').length,newWords:mixed.filter(w=>w._dailySourceType==='new').length,mistakes:mixed.filter(w=>w._dailySourceType==='mistake').length,total:mixed.length,minutes:Math.max(3,Math.round(mixed.length*0.28))}};
  }

  async function start(lg){
    if(active&&active.queue&&active.queue.length) return false;
    const built=await build(lg||currentLang());
    if(!built.queue.length) return false;
    const returnKey=(A.settings&&A.settings.lastDeckKey)||built.queue[0]._dailySourceKey;
    active={key:'daily:'+built.plan.lang,queue:built.queue,done:new Set(),returnKey,plan:built.plan,startedAt:Date.now()};
    try{
      A.settings=A.settings||{}; A.settings.trainerKind='words';
      if(typeof A.saveSettings==='function') A.saveSettings(A.settings);
    }catch(_){}
    if(A.Trainer&&typeof A.Trainer.setCustomDeck==='function') A.Trainer.setCustomDeck(active.key,active.queue,{silent:true});
    try{ document.dispatchEvent(new CustomEvent('lexitron:daily-start',{detail:built.plan})); }catch(_){}
    return true;
  }
  function isDailyKey(k){ return /^daily:[a-z]{2}$/i.test(String(k||'')); }
  function resolve(k){ return active&&String(k)===active.key ? active.queue : []; }
  function sourceKey(word,fallback){ return (word&&word._dailySourceKey)||fallback; }
  function sourceId(word,fallback){ return (word&&word._dailyOriginalId!=null)?word._dailyOriginalId:fallback; }
  function sampleNextIndex(deck){
    if(!active||!deck||!deck.length) return 0;
    for(let i=0;i<deck.length;i++){
      const w=deck[i]; const token=String(w._dailySourceKey||'')+'::'+String(w.id);
      if(!active.done.has(token)) return i;
    }
    return 0;
  }
  function markDone(word){
    if(!active||!word) return;
    active.done.add(String(word._dailySourceKey||'')+'::'+String(word.id));
  }
  function progress(){ return active?{done:active.done.size,total:active.queue.length,plan:active.plan}:null; }
  function isComplete(){ return !!(active&&active.queue.length&&active.done.size>=active.queue.length); }
  function finish(){
    if(!active) return null;
    const old=active; active=null;
    try{ if(A.Trainer&&typeof A.Trainer.setDeckKey==='function'&&old.returnKey) A.Trainer.setDeckKey(old.returnKey,{silent:true}); }catch(_){}
    try{ document.dispatchEvent(new CustomEvent('lexitron:daily-finish',{detail:old.plan})); }catch(_){}
    return old.plan;
  }
  function current(){ return active; }

  A.DailySession={preview,build,start,isDailyKey,resolve,sourceKey,sourceId,sampleNextIndex,markDone,progress,isComplete,finish,current};
})();
