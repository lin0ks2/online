// js/analytics.js
// Лёгкая обёртка над GA4 + события тренировок
(function () {
  'use strict';

  var A = (window.App = window.App || {});

  function hasGA() {
    return typeof window.gtag === 'function';
  }

  function safeTrack(eventName, params) {
    if (!hasGA()) return;
    try {
      window.gtag('event', eventName, params || {});
    } catch (e) {
      // no-op
    }
  }

  function safeSetUserProps(props) {
    if (!hasGA()) return;
    try {
      window.gtag('set', 'user_properties', props || {});
    } catch (e) {
      // no-op
    }
  }

  function detectAppMode() {
    try {
      if (
        window.matchMedia &&
        window.matchMedia('(display-mode: standalone)').matches
      ) {
        return 'pwa';
      }
      if (window.navigator && window.navigator.standalone) {
        return 'pwa';
      }
    } catch (_) {}
    return 'web';
  }

  function nowMs() {
    return Date.now ? Date.now() : new Date().getTime();
  }

  // ----------------- состояние тренировки -----------------

  var trainingState = {
    active: false,
    startedAt: null,
    lastHeartbeatAt: null,
    learnLang: null,
    uiLang: null,
    deckKey: null,
    appMode: null,
    heartbeatTimer: null
  };

  // интервал heartbeat в миллисекундах (можно 30000–60000)
  var HEARTBEAT_INTERVAL = 40000;

  function clearHeartbeatTimer() {
    if (trainingState.heartbeatTimer) {
      clearInterval(trainingState.heartbeatTimer);
      trainingState.heartbeatTimer = null;
    }
  }

  function startHeartbeatLoop() {
    clearHeartbeatTimer();
    if (!trainingState.active) return;

    trainingState.lastHeartbeatAt = nowMs();

    trainingState.heartbeatTimer = setInterval(function () {
      if (!trainingState.active) {
        clearHeartbeatTimer();
        return;
      }
      var now = nowMs();
      var elapsedSec = Math.round((now - trainingState.startedAt) / 1000);

      safeTrack('training_heartbeat', {
        learn_lang: trainingState.learnLang || null,
        ui_lang: trainingState.uiLang || null,
        deck_key: trainingState.deckKey || null,
        app_mode: trainingState.appMode || null,
        elapsed_sec: elapsedSec
      });

      trainingState.lastHeartbeatAt = now;
    }, HEARTBEAT_INTERVAL);
  }

  // ----------------- публичный API -----------------

  function setUserProps(baseProps) {
    baseProps = baseProps || {};

    var merged = {
      learn_lang: baseProps.learn_lang || trainingState.learnLang || null,
      ui_lang: baseProps.ui_lang || trainingState.uiLang || null,
      app_mode: baseProps.app_mode || trainingState.appMode || detectAppMode()
    };

    trainingState.learnLang = merged.learn_lang;
    trainingState.uiLang = merged.ui_lang;
    trainingState.appMode = merged.app_mode;

    safeSetUserProps(merged);
  }

  function updateUserProps(partial) {
    partial = partial || {};
    setUserProps({
      learn_lang: partial.learn_lang || trainingState.learnLang || null,
      ui_lang: partial.ui_lang || trainingState.uiLang || null,
      app_mode: partial.app_mode || trainingState.appMode || detectAppMode()
    });
  }

  function track(eventName, params) {
    safeTrack(eventName, params);
  }

  /**
   * Начало тренировки.
   * opts:
   *  - learnLang: 'de' / 'en' ...
   *  - uiLang: 'ru' / 'uk'
   *  - deckKey: 'de_verbs' и т.п.
   */
  function trainingStart(opts) {
    opts = opts || {};

    // если уже активна тренировка и словарь не поменялся — не дублируем
    if (trainingState.active && trainingState.deckKey === opts.deckKey) {
      return;
    }

    // если была активная — сначала завершить
    if (trainingState.active) {
      trainingEnd({ reason: 'restart' });
    }

    trainingState.active = true;
    trainingState.startedAt = nowMs();
    trainingState.lastHeartbeatAt = trainingState.startedAt;
    trainingState.learnLang = opts.learnLang || trainingState.learnLang || null;
    trainingState.uiLang = opts.uiLang || trainingState.uiLang || null;
    trainingState.deckKey = opts.deckKey || null;
    trainingState.appMode = detectAppMode();

    // сразу выставим user props
    setUserProps({
      learn_lang: trainingState.learnLang,
      ui_lang: trainingState.uiLang,
      app_mode: trainingState.appMode
    });

    safeTrack('training_start', {
      learn_lang: trainingState.learnLang || null,
      ui_lang: trainingState.uiLang || null,
      deck_key: trainingState.deckKey || null,
      app_mode: trainingState.appMode || null
    });

    startHeartbeatLoop();
  }

  /**
   * Завершение тренировки.
   * opts:
   *  - reason: 'route_change' / 'blur' / 'manual' / 'restart'
   */
  function trainingEnd(opts) {
    opts = opts || {};
    if (!trainingState.active) return;

    var endedAt = nowMs();
    var durationSec = Math.round((endedAt - trainingState.startedAt) / 1000);

    clearHeartbeatTimer();

    safeTrack('training_end', {
      learn_lang: trainingState.learnLang || null,
      ui_lang: trainingState.uiLang || null,
      deck_key: trainingState.deckKey || null,
      app_mode: trainingState.appMode || null,
      duration_sec: durationSec,
      reason: opts.reason || null
    });

    trainingState.active = false;
    trainingState.startedAt = null;
    trainingState.lastHeartbeatAt = null;
    trainingState.deckKey = null;
    // язык/режим оставляем — они ещё актуальны для user props
  }

  // опционально можно дергать вручную из кода, если нужно моментально "пингнуть"
  function trainingPing(extraParams) {
    if (!trainingState.active) return;
    var now = nowMs();
    var elapsedSec = Math.round((now - trainingState.startedAt) / 1000);

    var params = extraParams || {};
    params.learn_lang = trainingState.learnLang || null;
    params.ui_lang = trainingState.uiLang || null;
    params.deck_key = trainingState.deckKey || null;
    params.app_mode = trainingState.appMode || null;
    params.elapsed_sec = elapsedSec;

    safeTrack('training_heartbeat', params);
    trainingState.lastHeartbeatAt = now;
  }

  // ----------------- интеграция с видимостью вкладки -----------------

  // если приложение сворачивают — аккуратно завершим сессию тренировки
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'hidden') {
        if (trainingState.active) {
          trainingEnd({ reason: 'hidden' });
        }
      }
    });
  }

  // ----------------- экспорт -----------------

  A.Analytics = {
    track: track,
    setUserProps: setUserProps,
    updateUserProps: updateUserProps,
    detectAppMode: detectAppMode,
    trainingStart: trainingStart,
    trainingEnd: trainingEnd,
    trainingPing: trainingPing
  };
})();
