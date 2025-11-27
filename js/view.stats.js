/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: view.stats.js
 * Назначение: Экран статистики
 * Версия: 1.0
 * Обновлено: 2025-11-17
 * ========================================================== */

(function () {
  'use strict';
  const A = (window.App = window.App || {});

  /* ---------------------- helpers ---------------------- */

  function getUiLang() {
    const s = (A.settings && (A.settings.lang || A.settings.uiLang)) || 'ru';
    return String(s).toLowerCase() === 'uk' ? 'uk' : 'ru';
  }

  function t() {
    const uk = getUiLang() === 'uk';
    const i = (A.i18n && A.i18n()) || null;
    return {
      title: (i && i.statsTitle) || (uk ? 'Статистика' : 'Статистика'),
      coreTitle: uk ? 'Основні частини мови' : 'Основные части речи',
      otherTitle: uk ? 'Інші частини мови' : 'Другие части речи',
      activityTitle: uk ? 'Активність' : 'Активность',
      activityNoData: uk
        ? 'Ще немає даних про активність — продовжуйте тренуватися, і тут з’являться кола за днями.'
        : 'Пока нет данных об активности — продолжайте тренироваться, и здесь появятся кружки по дням.',
      activityLegendCaption: uk
        ? 'Останні 30 днів'
        : 'Последние 30 дней',
      activityLegendLow: uk
        ? 'Легкий день'
        : 'Лёгкий день',
      activityLegendMid: uk
        ? 'Стабільно'
        : 'Стабильно',
      activityLegendHigh: uk
        ? 'Дуже активно'
        : 'Очень активно',
      placeholderTitle: uk ? 'Активність і якість' : 'Активность и качество',
      placeholderText: uk
        ? 'Тут пізніше з’явиться статистика за часом у застосунку, регулярністю та якістю запам’ятовування.'
        : 'Здесь позже появится статистика по времени в приложении, регулярности и качеству запоминания.',
      learnedLangShort: function (learned, total) {
        return uk
          ? 'Вивчено ' + learned + ' з ' + total + ' слів'
          : 'Выучено ' + learned + ' из ' + total + ' слов';
      },
      decksSummary: function (started, completed, totalDecks) {
        return uk
          ? 'Словників: ' +
              totalDecks +
              ' • розпочато: ' +
              started +
              ' • завершено: ' +
              completed
          : 'Словарей: ' +
              totalDecks +
              ' • начато: ' +
              started +
              ' • завершено: ' +
              completed;
      },
      // fallback на случай, если не нашли имя словаря
      fallbackPosName: function (pos) {
        const uk = getUiLang() === 'uk';
        const mapRu = {
          nouns: 'Существительные',
          verbs: 'Глаголы',
          adjectives: 'Прилагательные',
          adverbs: 'Наречия',
          pronouns: 'Местоимения',
          numerals: 'Числительные',
          particles: 'Частицы',
          prepositions: 'Предлоги',
          conjunctions: 'Союзы',
          interjections: 'Междометия',
        };
        const mapUk = {
          nouns: 'Іменники',
          verbs: 'Дієслова',
          adjectives: 'Прикметники',
          adverbs: 'Прислівники',
          pronouns: 'Займенники',
          numerals: 'Числівники',
          particles: 'Частки',
          prepositions: 'Прийменники',
          conjunctions: 'Сполучники',
          interjections: 'Вигуки',
        };
        const map = uk ? mapUk : mapRu;
        return map[pos] || pos;
      },
    };
  }

  function clamp01(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }

  function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    const d = [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(' ');

    return d;
  }

  /* ---------------------- подготовка данных ---------------------- */

  function groupStatsByLang(stats) {
    const byLang = {};
    stats.forEach(function (deckStat) {
      if (!deckStat.lang) return;
      const lang = deckStat.lang;
      if (!byLang[lang]) {
        byLang[lang] = {
          lang: lang,
          decks: [],
          totalWords: 0,
          learnedWords: 0,
        };
      }
      byLang[lang].decks.push(deckStat);
      byLang[lang].totalWords += deckStat.totalWords || 0;
      byLang[lang].learnedWords += deckStat.learnedWords || 0;
    });
    return Object.keys(byLang)
      .sort()
      .map(function (lang) {
        return byLang[lang];
      });
  }

  function splitPosBuckets(langStat) {
    const corePos = ['nouns', 'verbs', 'adjectives', 'adverbs'];
    const buckets = {};
    langStat.decks.forEach(function (deck) {
      const pos = deck.pos || 'other';
      if (!buckets[pos]) {
        buckets[pos] = {
          pos: pos,
          totalWords: 0,
          learnedWords: 0,
          decks: [],
        };
      }
      buckets[pos].decks.push(deck);
      buckets[pos].totalWords += deck.totalWords || 0;
      buckets[pos].learnedWords += deck.learnedWords || 0;
    });

    const core = [];
    const other = [];
    Object.keys(buckets).forEach(function (pos) {
      const b = buckets[pos];
      if (corePos.indexOf(pos) !== -1) {
        core.push(b);
      } else {
        other.push(b);
      }
    });

    core.sort(function (a, b) {
      return (b.totalWords || 0) - (a.totalWords || 0);
    });
    other.sort(function (a, b) {
      return (b.totalWords || 0) - (a.totalWords || 0);
    });

    return { core: core, other: other };
  }

  /* ---------------------- кольца ---------------------- */

  function renderRing(total, learned) {
    const size = 58;
    const strokeWidthBg = 6;
    const strokeWidthFg = 6;
    const radius = (size - strokeWidthFg) / 2;
    const center = size / 2;
    const progress = total > 0 ? clamp01(learned / total) : 0;

    const bgPath = describeArc(center, center, radius, 0, 359.999);
    const endAngle = 359.999 * progress;
    const fgPath =
      progress > 0
        ? describeArc(center, center, radius, 0, endAngle)
        : '';

    return (
      '<svg viewBox="0 0 ' +
      size +
      ' ' +
      size +
      '" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="' +
      bgPath +
      '" fill="none" stroke="rgba(148, 163, 184, 0.35)" stroke-width="' +
      strokeWidthBg +
      '" stroke-linecap="round" />' +
      (fgPath
        ? '<path d="' +
          fgPath +
          '" fill="none" stroke="#0ea5e9" stroke-width="' +
          strokeWidthFg +
          '" stroke-linecap="round" />'
        : '') +
      '</svg>'
    );
  }

  function renderRingSet(buckets, texts, variant) {
    if (!buckets || !buckets.length) {
      return '<div class="stats-ring-set stats-ring-set--empty"></div>';
    }

    const isCore = variant === 'core';

    const ringsHtml = buckets
      .map(function (bucket) {
        const total = bucket.totalWords || 0;
        const learned = bucket.learnedWords || 0;
        const progress = total > 0 ? clamp01(learned / total) : 0;
        const percent = Math.round(progress * 100);

        const label =
          percent + '%' + (isCore ? '' : '<br><span>' + (bucket.posName || '') + '</span>');

        return (
          '<div class="stats-ring">' +
          renderRing(total, learned) +
          '<div class="stats-ring__label">' +
          label +
          '</div>' +
          '</div>'
        );
      })
      .join('');

    const legendHtml = buckets
      .map(function (bucket) {
        const total = bucket.totalWords || 0;
        const learned = bucket.learnedWords || 0;
        const progress = total > 0 ? clamp01(learned / total) : 0;
        const percent = Math.round(progress * 100);

        return (
          '<div class="stats-ring-legend__item">' +
          '<span class="stats-ring-legend__label">' +
          (bucket.posName || '') +
          '</span>' +
          '<span class="stats-ring-legend__value">' +
          learned +
          ' / ' +
          total +
          ' (' +
          percent +
          '%)' +
          '</span>' +
          '</div>'
        );
      })
      .join('');

    return (
      '<div class="stats-ring-set ' +
      (isCore ? 'stats-ring-set--core' : '') +
      '">' +
      '<div class="stats-ring-set__rings">' +
      ringsHtml +
      '</div>' +
      '<div class="stats-ring-legend">' +
      legendHtml +
      '</div>' +
      '</div>'
    );
  }

  /* ---------------------- АКТИВНОСТЬ (круглые точки) ----------- */

  // Ожидаемый формат, если когда-нибудь реализуем:
  // App.Stats.getDailyActivity(lang) -> [
  //   { date: '2025-11-10', learned: 12, reviewed: 40, seconds: 600 },
  //   ...
  // ]
  function getDailyActivitySeries(lang) {
    const Stats = A.Stats;
    if (!Stats || typeof Stats.getDailyActivity !== 'function') {
      return [];
    }

    const raw = Stats.getDailyActivity(lang) || [];
    const now = new Date();
    const cutoff = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 29
    ).getTime();

    const series = [];

    raw.forEach(function (item) {
      const t = new Date(item.date).getTime();
      if (isNaN(t) || t < cutoff) return;
      series.push({
        date: item.date,
        learned: Number(item.learned || 0),
        reviewed: Number(item.reviewed || 0),
        seconds: Number(item.seconds || 0),
      });
    });

    series.sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    return series;
  }

  function renderActivitySection(lang, texts) {
    const series = getDailyActivitySeries(lang);

    if (!series.length) {
      return (
        '<section class="stats-section stats-section--activity">' +
        '<h2 class="stats-subtitle">' +
        texts.activityTitle +
        '</h2>' +
        '<p class="stats-placeholder stats-placeholder--activity">' +
        texts.activityNoData +
        '</p>' +
        '</section>'
      );
    }

    // Превращаем метрики в «интенсивность» точки
    var scores = series.map(function (d) {
      var learned = Number(d.learned || 0);
      var reviewed = Number(d.reviewed || 0);
      var seconds = Number(d.seconds || 0);
      // простая эвристика: учёт, повторения и время
      return learned * 4 + reviewed * 1 + seconds / 60;
    });

    var max = scores.reduce(function (m, v) {
      return v > m ? v : m;
    }, 0);
    if (max <= 0) {
      // есть записи, но всё нули — считаем как «есть, но слабая активность»
      max = 1;
    }

    var dotsHtml = series
      .map(function (d, idx) {
        var s = scores[idx];
        var ratio = s / max;
        var lvl = 0;
        if (ratio >= 0.75) lvl = 3;
        else if (ratio >= 0.5) lvl = 2;
        else if (ratio >= 0.25) lvl = 1;
        else lvl = 0;

        var title =
          (d.date || '') +
          (d.learned || d.reviewed || d.seconds
            ? ' — +' +
              (d.learned || 0) +
              ' / ' +
              (d.reviewed || 0) +
              ' / ' +
              Math.round((d.seconds || 0) / 60) +
              ' мин'
            : '');

        // каждые 7 дней начинаем новую строку (новая «неделя»)
        var weekBreak = '';
        if (idx > 0 && idx % 7 === 0) {
          weekBreak = '<div class="stats-activity-week-break"></div>';
        }

        return (
          weekBreak +
          '<div class="stats-activity-dot stats-activity-dot--lvl' +
          lvl +
          '"' +
          (title
            ? ' title="' + title.replace(/"/g, '&quot;') + '"'
            : '') +
          '></div>'
        );
      })
      .join('');

    var legendHtml =
      '<div class="stats-activity-legend">' +
      '<span class="stats-activity-legend__caption">' +
      texts.activityLegendCaption +
      '</span>' +
      '<div class="stats-activity-legend__scale">' +
      '<span class="stats-activity-legend__item">' +
      '<span class="stats-activity-dot stats-activity-dot--lvl1"></span>' +
      '<span>' +
      texts.activityLegendLow +
      '</span>' +
      '</span>' +
      '<span class="stats-activity-legend__item">' +
      '<span class="stats-activity-dot stats-activity-dot--lvl2"></span>' +
      '<span>' +
      texts.activityLegendMid +
      '</span>' +
      '</span>' +
      '<span class="stats-activity-legend__item">' +
      '<span class="stats-activity-dot stats-activity-dot--lvl3"></span>' +
      '<span>' +
      texts.activityLegendHigh +
      '</span>' +
      '</span>' +
      '</div>' +
      '</div>';

    return (
      '<section class="stats-section stats-section--activity">' +
      '<h2 class="stats-subtitle">' +
      texts.activityTitle +
      '</h2>' +
      '<div class="stats-activity-grid">' +
      dotsHtml +
      '</div>' +
      legendHtml +
      '</section>'
    );
  }

  /* ---------------------- карточки по языкам ---------------------- */

  function renderLangCards(langStats, texts, activeLangCode) {
    if (!langStats.length) {
      return '<p class="stats-placeholder">—</p>';
    }

    var activeLang = activeLangCode || langStats[0].lang;

    const items = langStats
      .map(function (langStat) {
        const total = langStat.totalWords || 0;
        const learned = langStat.learnedWords || 0;
        const langCode = langStat.lang;
        const isActive = langCode === activeLang;

        let started = 0;
        let completed = 0;
        langStat.decks.forEach(function (d) {
          if (d.learnedWords > 0) started += 1;
          if (d.totalWords > 0 && d.learnedWords >= d.totalWords)
            completed += 1;
        });

        const split = splitPosBuckets(langStat);
        const coreSetHtml = renderRingSet(split.core, texts, 'core');
        const otherSetHtml = renderRingSet(split.other, texts, 'other');

        return (
          '<article class="stats-lang-card' +
          (isActive ? ' is-active' : '') +
          '" data-lang="' +
          langCode +
          '">' +
          '<header class="stats-lang-card__header">' +
          '<div class="stats-lang-card__title-block">' +
          '<div class="stats-lang-card__lang-name">' +
          langCode.toUpperCase() +
          '</div>' +
          '<div class="stats-lang-card__progress-line">' +
          texts.learnedLangShort(learned, total) +
          '</div>' +
          '<div class="stats-lang-card__decks-line">' +
          texts.decksSummary(started, completed, langStat.decks.length) +
          '</div>' +
          '</div>' +
          '<div class="stats-lang-card__flag">' +
          (A.renderLangFlag ? A.renderLangFlag(langCode, 32) : '') +
          '</div>' +
          '</header>' +
          '<div class="stats-lang-card__divider"></div>' +
          '<div class="stats-lang-card__rings">' +
          '<h3 class="stats-subsubtitle">' +
          texts.coreTitle +
          '</h3>' +
          coreSetHtml +
          '</div>' +
          '<div class="stats-lang-card__rings">' +
          '<h3 class="stats-subsubtitle">' +
          texts.otherTitle +
          '</h3>' +
          otherSetHtml +
          '</div>' +
          '</article>'
        );
      })
      .join('');

    return '<div class="stats-lang-list">' + items + '</div>';
  }

  /* ---------------------- странички статистики ---------------------- */

  function renderStatsPages(langStats, texts, activeLang) {
    const track =
      '<div class="stats-pages__track">' +
      '<div class="stats-page stats-page--langs">' +
      renderLangCards(langStats, texts, activeLang) +
      '</div>' +
      '<div class="stats-page stats-page--placeholder">' +
      '<h2 class="stats-subtitle">' +
      texts.placeholderTitle +
      '</h2>' +
      '<p class="stats-placeholder">' +
      texts.placeholderText +
      '</p>' +
      '</div>' +
      '<div class="stats-page stats-page--activity">' +
      renderActivitySection(activeLang, texts) +
      '</div>' +
      '</div>';

    const indicator =
      '<div class="stats-pages-indicator">' +
      '<button class="stats-page-dot is-active" data-page="0"></button>' +
      '<button class="stats-page-dot" data-page="1"></button>' +
      '<button class="stats-page-dot" data-page="2"></button>' +
      '</div>';

    return (
      '<div class="stats-pages">' + track + '</div>' + indicator
    );
  }

  function attachStatsPagesBehavior(rootEl) {
    const track = rootEl.querySelector('.stats-pages__track');
    const dots = Array.prototype.slice.call(
      rootEl.querySelectorAll('.stats-page-dot')
    );
    if (!track || !dots.length) return;

    function setPage(idx) {
      const clamped = Math.max(0, Math.min(dots.length - 1, idx));
      track.style.transform = 'translateX(-' + clamped * 100 + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === clamped);
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        setPage(idx);
      });
    });
  }

  /* ---------------------- основной рендер ---------------------- */

  function renderStatsView(container) {
    const texts = t();
    const Stats = A.Stats;
    if (!Stats || typeof Stats.getDeckStats !== 'function') {
      container.innerHTML =
        '<p class="stats-placeholder">Статистика пока недоступна.</p>';
      return;
    }

    const deckStats = Stats.getDeckStats() || [];
    const langStats = groupStatsByLang(deckStats);

    const activeLang =
      (A.settings && A.settings.currentLang) ||
      (langStats[0] && langStats[0].lang) ||
      'de';

    const html =
      '<section class="stats-card">' +
      '<h1 class="stats-title">' +
      texts.title +
      '</h1>' +
      renderStatsPages(langStats, texts, activeLang) +
      '</section>';

    container.innerHTML = html;

    attachStatsPagesBehavior(container);

    const langCards = Array.prototype.slice.call(
      container.querySelectorAll('.stats-lang-card')
    );
    langCards.forEach(function (card) {
      card.addEventListener('click', function () {
        const lang = card.getAttribute('data-lang');
        if (!lang) return;

        langCards.forEach(function (c) {
          c.classList.toggle('is-active', c === card);
        });

        const statsPages = container.querySelector('.stats-pages');
        if (!statsPages) return;
        const newHtml = renderStatsPages(langStats, texts, lang);
        const temp = document.createElement('div');
        temp.innerHTML = newHtml;
        const newPages = temp.querySelector('.stats-pages');
        const newIndicator = temp.querySelector('.stats-pages-indicator');

        const oldPages = container.querySelector('.stats-pages');
        const oldIndicator = container.querySelector(
          '.stats-pages-indicator'
        );
        if (oldPages && newPages && oldPages.parentNode) {
          oldPages.parentNode.replaceChild(newPages, oldPages);
        }
        if (oldIndicator && newIndicator && oldIndicator.parentNode) {
          oldIndicator.parentNode.replaceChild(newIndicator, oldIndicator);
        }

        attachStatsPagesBehavior(container);
      });
    });
  }

  A.renderStatsView = renderStatsView;
})();
