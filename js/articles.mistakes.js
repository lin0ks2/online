/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: articles.mistakes.js
 * Назначение: Ошибки для тренера артиклей (изолированное хранилище)
 * Принцип: 1:1 как избранное артиклей — точка истины в App.state
 * ========================================================== */

(function(){
  'use strict';
  var A = (window.App = window.App || {});

  function _uiTrainLang(){
    try{
      var s = (A.settings && (A.settings.lang || A.settings.uiLang)) || 'ru';
      return (s === 'uk' ? 'uk' : 'ru');
    }catch(e){
      return 'ru';
    }
  }

  function _ensureRoot(){
    A.state = A.state || {};
    A.state.articlesMistakes = A.state.articlesMistakes || {};
    return A.state.articlesMistakes;
  }

  function _ensureDeck(trainLang, baseDeckKey){
    var root = _ensureRoot();
    root[trainLang] = root[trainLang] || {};
    root[trainLang][baseDeckKey] = root[trainLang][baseDeckKey] || {};
    return root[trainLang][baseDeckKey];
  }

  function _normalizeBaseKey(deckKey){
    if (!deckKey) return deckKey;
    if (typeof deckKey !== 'string') return deckKey;
    if (deckKey.indexOf('mistakes:') === 0 || deckKey.indexOf('favorites:') === 0){
      var p = deckKey.split(':');
      return p.slice(2).join(':') || deckKey;
    }
    return deckKey;
  }

  function _isMistakesTraining(deckKey){
    return (typeof deckKey === 'string' && deckKey.indexOf('mistakes:') === 0);
  }

  var ArticlesMistakes = {
    push: function(deckKey, id){
      try{
        if (!id && id !== 0) return false;
        if (_isMistakesTraining(deckKey)) return false;

        var TL = _uiTrainLang();
        var baseKey = _normalizeBaseKey(deckKey) || 'de_nouns';
        var deck = _ensureDeck(TL, baseKey);

        var sid = String(id);
        if (deck[sid]) return false;

        deck[sid] = true;
        if (typeof A.saveState === 'function') A.saveState();
        return true;
      }catch(e){
        return false;
      }
    },

    list: function(trainLang, baseDeckKey){
      try{
        var deck = _ensureDeck(trainLang, baseDeckKey);
        return Object.keys(deck).map(function(k){
          var n = Number(k);
          return (isNaN(n) ? k : n);
        });
      }catch(e){
        return [];
      }
    },

    count: function(trainLang, baseDeckKey){
      try{
        var deck = _ensureDeck(trainLang, baseDeckKey);
        return Object.keys(deck).length;
      }catch(e){
        return 0;
      }
    },

    clearForDeck: function(trainLang, baseDeckKey){
      try{
        var root = _ensureRoot();
        if (root[trainLang] && root[trainLang][baseDeckKey]){
          root[trainLang][baseDeckKey] = {};
          if (typeof A.saveState === 'function') A.saveState();
        }
        return true;
      }catch(e){
        return false;
      }
    }
  };

  A.ArticlesMistakes = ArticlesMistakes;
})();
