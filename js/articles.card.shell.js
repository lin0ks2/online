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

  // IMPORTANT: перевод отключён полностью по ТЗ (вторая строка убирается).

  var mounted = false;
  var rootEl = null;
  var snapshotHTML = '';
  var unsubs = [];

  // Поведение ответов должно совпадать с базовым тренером (home.js):
  // - неправильный ответ: подсветка + disable только нажатой кнопки
  // - штраф/статистика применяются 1 раз на слово (логика в ArticlesTrainer)
  // - правильный ответ: блокируем все кнопки + is-correct + is-dim
  // - переход к следующему слову с тем же таймингом
  var uiState = { wordId: '', solved: false, layout: null };
  var ADV_DELAY = 750;

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

  function paintStars(deckKey, wordId) {
    try {
      if (!rootEl) return;
      var starsBox = qs('.trainer-stars', rootEl);
      if (!starsBox || !A.ArticlesProgress || !wordId) return;
      var max = (A.ArticlesProgress.starsMax && A.ArticlesProgress.starsMax()) || 5;
      var have = (A.ArticlesProgress.getStars && A.ArticlesProgress.getStars(deckKey, wordId)) || 0;
      var html = '';
      for (var i = 0; i < max; i++) {
        html += '<span class="star' + (i < have ? ' full' : '') + '" aria-hidden="true">★</span>';
      }
      starsBox.innerHTML = html;
    } catch (e) {}
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

    // Перевод убран полностью по ТЗ
    var trEl = qs('.trainer-translation', rootEl);
    if (trEl && trEl.parentNode) trEl.parentNode.removeChild(trEl);

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
      // сброс UI-состояния при смене слова
      if (String(uiState.wordId) !== String(vm.wordId || '')) {
        uiState.wordId = String(vm.wordId || '');
        uiState.solved = false;
        uiState.layout = null;
      }

      answersEl.innerHTML = '';
      var base = vm.options || ['der','die','das'];

      // 4 кнопки: 3 артикля + 1 пустая. Расклад фиксируем на слово, чтобы не "прыгал" при перерендерах.
      if (!uiState.layout) {
        // случайно выбираем позицию пустой кнопки и перемешиваем артикли
        var articles = base.slice(0, 3);
        for (var si = articles.length - 1; si > 0; si--) {
          var sj = Math.floor(Math.random() * (si + 1));
          var tmp = articles[si]; articles[si] = articles[sj]; articles[sj] = tmp;
        }
        var emptyIndex = Math.floor(Math.random() * 4);
        var layout = new Array(4);
        var ai = 0;
        for (var bi = 0; bi < 4; bi++) {
          if (bi === emptyIndex) layout[bi] = '';
          else layout[bi] = String(articles[ai++] || '');
        }
        uiState.layout = layout;
      }

      for (var j = 0; j < 4; j++) {
        var article = String(uiState.layout[j] || '');
        var b = document.createElement('button');
        b.className = 'answer-btn';
        b.textContent = article;
        b.setAttribute('data-article', article);

        // пустая кнопка: оставляем пустой текст, делаем disabled
        if (!article) {
          b.disabled = true;
          b.classList.add('is-empty');
          b.setAttribute('aria-disabled', 'true');
        }

        // КЛИКИ обрабатываются единым делегированным слушателем (см. mount)
        answersEl.appendChild(b);
      }
    }
  }

  function mount(root) {
    // В SPA разметка .home-trainer может пересоздаваться при навигации.
    // Если мы уже смонтированы в старый DOM-узел — нужно перемонтироваться.
    var nextRoot = root || qs('.home-trainer');
    if (mounted) {
      try {
        if (!rootEl || (rootEl && rootEl.isConnected === false) || (nextRoot && rootEl !== nextRoot)) {
          unmount();
        } else {
          return;
        }
      } catch (_e) {
        // на всякий случай — не блокируем монтирование
      }
    }
    rootEl = nextRoot;
    if (!rootEl) return;

    snapshotHTML = rootEl.innerHTML;
    mounted = true;
    rootEl.classList.add('is-articles');

    // Делегированный обработчик ответов (один раз на mount)
    var onRootClick = function (e) {
      try {
        var btn = e && e.target && e.target.closest ? e.target.closest('.answers-grid .answer-btn') : null;
        if (!btn) return;
        if (btn.disabled) return;
        if (uiState.solved) return;

        var picked = btn.getAttribute('data-article') || btn.textContent || '';
        if (!String(picked || '').trim()) return;
        var vm = (A.ArticlesTrainer && A.ArticlesTrainer.getViewModel) ? A.ArticlesTrainer.getViewModel() : null;
        var res = (A.ArticlesTrainer && A.ArticlesTrainer.answer) ? A.ArticlesTrainer.answer(picked) : { ok:false, correct:'', applied:false };

        if (res.ok) {
          uiState.solved = true;
          btn.classList.add('is-correct');
          var all = rootEl.querySelectorAll('.answers-grid .answer-btn');
          all.forEach(function (b) {
            b.disabled = true;
            if (b !== btn) b.classList.add('is-dim');
          });
          if (vm) paintStars(vm.deckKey, vm.wordId);
          setTimeout(function () {
            try { if (A.ArticlesTrainer && A.ArticlesTrainer.next) A.ArticlesTrainer.next(); } catch (e) {}
          }, ADV_DELAY);
          return;
        }

        // wrong
        btn.classList.add('is-wrong');
        btn.disabled = true;
        if (res.applied && vm) paintStars(vm.deckKey, vm.wordId);
      } catch (e) {}
    };
    rootEl.addEventListener('click', onRootClick, { passive: true });
    unsubs.push(function () {
      try { if (rootEl) rootEl.removeEventListener('click', onRootClick); } catch (e) {}
    });

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
    render: render
  };
})();
