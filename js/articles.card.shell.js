/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: articles.card.shell.js
 * Назначение: UI карточка упражнения "Учить артикли" (каркас).
 *
 * Требования:
 *   - элементы "хрома" (звёзды, сердце, режим, озвучка) остаются
 *     на тех же местах, что и в базовой карточке
 *   - слово отображается тем же стилем/размером, но БЕЗ артикуля
 *   - перевод (второй строкой) пока показываем, позже можно отключить
 *   - 3 кнопки: der / die / das
 *   - озвучка: не используется (кнопка disabled + перечёркнута)
 *   - сердце: видно, но disabled
 *
 * Статус: каркас (MVP)
 * Версия: 0.1
 * Обновлено: 2026-01-01
 * ========================================================== */

(function () {
  'use strict';

  var A = (window.App = window.App || {});

  var SHOW_TRANSLATION = true;

  var mounted = false;
  var rootEl = null;
  var snapshotHTML = '';
  var unsubs = [];

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function ensureBusOn() {
    if (!window.UIBus || typeof window.UIBus.on !== 'function') return null;
    return window.UIBus;
  }

  function setAudioDisabled(wordEl) {
    // ui.audio.tts.js вставляет кнопку внутрь .trainer-word
    // Мы оставляем её видимой, но делаем "disabled" + визуально перечёркнутой.
    if (!wordEl) return;
    var btn = wordEl.querySelector('.trainer-audio-btn');
    if (!btn) {
      btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'trainer-audio-btn';
      wordEl.appendChild(btn);
    }
    btn.disabled = true;
    btn.textContent = '🔇';
    btn.setAttribute('aria-label', 'Озвучка недоступна');
    btn.classList.add('is-disabled');
    btn.classList.add('is-crossed');
  }

  function setHeartDisabled(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
    btn.classList.add('is-disabled');
  }

  function render(vm) {
    if (!mounted || !rootEl || !vm) return;

    // На каркасе мы используем ту же разметку .home-trainer из home.js.
    var starsBox = qs('.trainer-stars', rootEl);
    var heartBtn = qs('#favBtn', rootEl);
    var wordEl = qs('.trainer-word', rootEl);
    var subtitleEl = qs('.trainer-subtitle', rootEl);
    var answersEl = qs('.answers-grid', rootEl);

    // хром
    setHeartDisabled(heartBtn);
    setAudioDisabled(wordEl);

    // заголовок вопроса
    if (subtitleEl) {
      var uiLang = '';
      try { uiLang = (A.settings && A.settings.uiLang) || ''; } catch (e) {}
      subtitleEl.textContent = (String(uiLang).toLowerCase() === 'uk') ? (vm.promptUk || 'Оберіть артикль') : (vm.promptRu || 'Выберите артикль');
    }

    // слово + перевод
    if (wordEl) {
      // важно: слово без артикуля
      wordEl.textContent = String(vm.wordDisplay || '').trim();
      // audio btn будет добавлен заново/сверху в setAudioDisabled()
      setAudioDisabled(wordEl);
    }

    // вторичная строка перевода
    var trEl = qs('.trainer-translation', rootEl);
    if (SHOW_TRANSLATION) {
      if (!trEl) {
        trEl = document.createElement('p');
        trEl.className = 'trainer-translation';
        // вставляем сразу после .trainer-word
        if (wordEl && wordEl.parentNode) {
          wordEl.parentNode.insertBefore(trEl, wordEl.nextSibling);
        } else {
          rootEl.insertBefore(trEl, rootEl.firstChild);
        }
      }
      trEl.textContent = String(vm.translation || '').trim();
    } else {
      if (trEl && trEl.parentNode) trEl.parentNode.removeChild(trEl);
    }

    // звёзды: пока просто оставляем от базового рендера, позже подключим ArticlesProgress.
    // (В каркасе не трогаем, чтобы не ломать базовый компонент.)
    if (starsBox && A.ArticlesProgress && vm.wordId) {
      try {
        var max = (A.ArticlesProgress.starsMax && A.ArticlesProgress.starsMax()) || 5;
        var have = (A.ArticlesProgress.getStars && A.ArticlesProgress.getStars(vm.deckKey, vm.wordId)) || 0;
        // используем drawStarsTwoPhase из home.js нельзя (не публичная функция),
        // поэтому в каркасе — простая отрисовка.
        var html = '';
        for (var i = 0; i < max; i++) {
          html += '<span class="star' + (i < have ? ' full' : '') + '" aria-hidden="true">★</span>';
        }
        starsBox.innerHTML = html;
      } catch (e) {}
    }

    // ответы
    if (answersEl) {
      answersEl.innerHTML = '';
      var opts = vm.options || ['der', 'die', 'das'];

      var solved = false;
      var ADV_DELAY = 750;

      function lockAll(correctArticle) {
        try {
          var btns = answersEl.querySelectorAll('.answer-btn');
          btns.forEach(function(btn){
            btn.disabled = true;
            var a = btn.getAttribute('data-article');
            if (a && String(a) === String(correctArticle)) btn.classList.add('is-correct');
            else btn.classList.add('is-dim');
          });
        } catch(e) {}
        // блокируем "не знаю" так же, как в обычном тренере
        try {
          var idkBtn = qs('.idk-btn', rootEl);
          if (idkBtn) idkBtn.disabled = true;
        } catch(e) {}
      }

      opts.forEach(function(article){
        var b = document.createElement('button');
        b.className = 'answer-btn';
        b.textContent = String(article);
        b.setAttribute('data-article', String(article));
        b.onclick = function(){
          if (solved) return;
          try {
            solved = true;
            var res = (A.ArticlesTrainer && typeof A.ArticlesTrainer.answer === 'function')
              ? A.ArticlesTrainer.answer(article)
              : { ok:false, correct:'' };

            if (res && res.ok) {
              b.classList.add('is-correct');
              lockAll(res.correct || article);
              // переход как в обычном тренере
              setTimeout(function(){ try { if (window.UIBus) UIBus.emit('articles:update'); } catch(_){} }, 0);
              setTimeout(function(){ try { if (A.ArticlesTrainer && A.ArticlesTrainer.next) A.ArticlesTrainer.next(); } catch(e) {} }, ADV_DELAY);
              return;
            }

            b.classList.add('is-wrong');
            b.disabled = true;
            lockAll((res && res.correct) ? res.correct : '');
            setTimeout(function(){ try { if (window.UIBus) UIBus.emit('articles:update'); } catch(_){} }, 0);
            setTimeout(function(){ try { if (A.ArticlesTrainer && A.ArticlesTrainer.next) A.ArticlesTrainer.next(); } catch(e) {} }, ADV_DELAY);
          } catch (e) {}
        };
        answersEl.appendChild(b);
      });

      // "Не знаю" — 1:1 с обычным тренером
      try {
        var idkBtn2 = qs('.idk-btn', rootEl);
        if (idkBtn2) {
          idkBtn2.disabled = false;
          idkBtn2.onclick = function(){
            if (solved) return;
            solved = true;
            var correct = '';
            try { correct = (A.ArticlesTrainer && A.ArticlesTrainer.getCorrectArticle) ? A.ArticlesTrainer.getCorrectArticle() : ''; } catch(e) {}
            if (correct) {
              var cb = answersEl.querySelector('.answer-btn[data-article="' + String(correct) + '"]');
              if (cb) cb.classList.add('is-correct');
            }
            lockAll(correct);
            // аналитика: пинг при "не знаю"
            try { if (A.Analytics && typeof A.Analytics.trainingPing === 'function') A.Analytics.trainingPing({ kind:'articles', event:'idk' }); } catch(_){}
            setTimeout(function(){ try { if (window.UIBus) UIBus.emit('articles:update'); } catch(_){} }, 0);
            setTimeout(function(){ try { if (A.ArticlesTrainer && A.ArticlesTrainer.next) A.ArticlesTrainer.next(); } catch(e) {} }, ADV_DELAY);
          };
        }
      } catch(e) {}
    }
    }
  }

  function mount(root) {
    if (mounted) return;
    rootEl = root || qs('.home-trainer');
    if (!rootEl) return;

    snapshotHTML = rootEl.innerHTML;
    mounted = true;
    rootEl.classList.add('is-articles');

    // подписка на обновления от тренера
    var bus = ensureBusOn();
    if (bus) {
      var off = bus.on('articles:update', function (vm) {
        render(vm);
      });
      if (typeof off === 'function') unsubs.push(off);
    }

    // первичная отрисовка, если тренер уже активен
    try {
      if (A.ArticlesTrainer && A.ArticlesTrainer.getViewModel) {
        render(A.ArticlesTrainer.getViewModel());
      }
    } catch (e) {}
  }

  function unmount() {
    if (!mounted || !rootEl) return;
    mounted = false;
    try {
      while (unsubs.length) {
        var fn = unsubs.pop();
        try { fn(); } catch (e) {}
      }
    } catch (e) {}

    rootEl.classList.remove('is-articles');
    if (snapshotHTML) rootEl.innerHTML = snapshotHTML;
    snapshotHTML = '';
    rootEl = null;
  }

  A.ArticlesCard = {
    mount: mount,
    unmount: unmount,
    render: render,
    setShowTranslation: function (v) { SHOW_TRANSLATION = !!v; }
  };
})();
