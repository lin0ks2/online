/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: trainer.prepositions.de.js
 * Назначение: Демо-данные для тренера предлогов (DE) — 4 корзины × 4 паттерна (MVP)
 * Версия: 0.1-demo
 * Обновлено: 2026-01-26
 * ========================================================== */

(function(){
  'use strict';

  // Глобальный контейнер данных тренера предлогов
  var root = (window.prepositionsTrainer = window.prepositionsTrainer || {});
  root.de = {
    lang: 'de',
    totalPatterns: 16,
    variantsPerPattern: 1,

    // Пул предлогов-отвлекалок (уникальные подписи на кнопках — обязательны)
    distractorPool: [
      'in','auf','an','unter','über','neben','vor','hinter','zwischen',
      'zu','nach','von','bei','mit',
      'für','ohne','durch','gegen','um','aus'
    ],

    // ВАЖНО (вариант A): пользователь выбирает ТОЛЬКО предлог,
    // но фраза уже содержит "правильную" форму (артикль/местоимение),
    // чтобы запоминалась связка предлог+форма автоматически.

    // Корзины (пока скрыты в UI; meta оставляем на будущее):
    // 1) direction (куда? Bewegung) -> Akkusativ
    // 2) location (где? Ort) -> Dativ
    // 3) dat_only (всегда Dativ)
    // 4) akk_only (всегда Akkusativ)
    patterns: [
      // --- 1) direction -> Akk ---
      { id: "de_prep_dir_01_in",    answer: "in",    items: ["Ich gehe ___ die Schule."],          meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_prep_dir_02_auf",   answer: "auf",   items: ["Er legt das Buch ___ den Tisch."],  meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_prep_dir_03_an",    answer: "an",    items: ["Ich hänge das Bild ___ die Wand."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_prep_dir_04_unter", answer: "unter", items: ["Sie stellt die Tasche ___ den Tisch."], meta:{ bucket:"direction", case:"Akk" } },

      // --- 2) location -> Dat ---
      { id: "de_prep_loc_01_in",  answer: "in",   items: ["Ich bin ___ der Schule."],            meta:{ bucket:"location", case:"Dat" } },
      { id: "de_prep_loc_02_auf", answer: "auf",  items: ["Das Buch liegt ___ dem Tisch."],     meta:{ bucket:"location", case:"Dat" } },
      { id: "de_prep_loc_03_an",  answer: "an",   items: ["Das Bild hängt ___ der Wand."],      meta:{ bucket:"location", case:"Dat" } },
      { id: "de_prep_loc_04_unter", answer: "unter", items: ["Der Schlüssel ist ___ dem Tisch."], meta:{ bucket:"location", case:"Dat" } },

      // --- 3) dat-only ---
      { id: "de_prep_dat_01_mit",  answer: "mit", items: ["Ich spreche ___ dem Lehrer."],       meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_prep_dat_02_von",  answer: "von", items: ["Wir kommen ___ der Arbeit."],        meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_prep_dat_03_zu",   answer: "zu",  items: ["Ich gehe ___ dem Arzt."],            meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_prep_dat_04_bei",  answer: "bei", items: ["Ich bin ___ meiner Freundin."],      meta:{ bucket:"dat_only", case:"Dat" } },

      // --- 4) akk-only ---
      { id: "de_prep_akk_01_für",    answer: "für",    items: ["Das Geschenk ist ___ dich."],   meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_prep_akk_02_ohne",   answer: "ohne",   items: ["Ich gehe ___ meine Jacke."],    meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_prep_akk_03_durch",  answer: "durch",  items: ["Er geht ___ den Park."],        meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_prep_akk_04_gegen",  answer: "gegen",  items: ["Wir sind ___ den Plan."],       meta:{ bucket:"akk_only", case:"Akk" } }
    ]
  };
})();
