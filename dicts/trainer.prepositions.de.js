/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: trainer.prepositions.de.js
 * Назначение: Данные для тренера предлогов (DE) — 40 паттернов × 5 фраз
 * Версия: 0.2
 * Обновлено: 2026-01-27
 * ========================================================== */

(function(){
  'use strict';

  var root = (window.prepositionsTrainer = window.prepositionsTrainer || {});
  root.de = {
    lang: 'de',
    totalPatterns: 40,
    variantsPerPattern: 5,

    distractorPool: ['in','auf','an','unter','über','neben','vor','hinter','zwischen','zu','nach','von','bei','mit','aus','gegenüber','für','ohne','durch','gegen','um','bis','seit'],

    patterns: [
      { id: "de_dir_01_in", answer: "in", items: ["Ich gehe ___ die Schule.", "Wir fahren ___ den Supermarkt.", "Er läuft ___ das Zimmer.", "Sie stellt die Blumen ___ die Vase.", "Leg das Handy ___ die Tasche."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_02_auf", answer: "auf", items: ["Er legt das Buch ___ den Tisch.", "Stell die Tasse ___ den Boden.", "Sie setzt sich ___ den Stuhl.", "Kletter ___ den Baum!", "Wir steigen ___ den Berg."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_03_an", answer: "an", items: ["Ich hänge das Bild ___ die Wand.", "Er stellt das Fahrrad ___ die Tür.", "Sie setzt sich ___ den Tisch.", "Wir gehen ___ den Fluss.", "Stell den Koffer ___ die Ecke."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_04_unter", answer: "unter", items: ["Sie stellt die Tasche ___ den Tisch.", "Leg das Kissen ___ den Kopf.", "Er schiebt den Stuhl ___ den Tisch.", "Wir gehen ___ die Brücke.", "Stell die Schuhe ___ das Bett."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_05_ueber", answer: "über", items: ["Er springt ___ den Zaun.", "Wir gehen ___ die Straße.", "Sie legt eine Decke ___ den Tisch.", "Die Katze klettert ___ die Mauer.", "Wir fliegen ___ den Atlantik."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_06_neben", answer: "neben", items: ["Stell den Stuhl ___ den Tisch.", "Leg das Buch ___ das Heft.", "Setz dich ___ mich.", "Park das Auto ___ den Eingang.", "Stell die Lampe ___ das Sofa."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_07_vor", answer: "vor", items: ["Stell dich ___ den Spiegel.", "Sie stellt die Kiste ___ die Tür.", "Er setzt sich ___ den Fernseher.", "Wir gehen ___ das Haus.", "Leg das Paket ___ die Garage."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_08_hinter", answer: "hinter", items: ["Stell das Fahrrad ___ das Haus.", "Er geht ___ den Vorhang.", "Die Katze springt ___ das Sofa.", "Wir fahren ___ den Bus.", "Leg den Rucksack ___ den Stuhl."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_09_zwischen", answer: "zwischen", items: ["Stell die Vase ___ die Fenster.", "Er setzt sich ___ die Kinder.", "Leg das Blatt ___ die Bücher.", "Wir stellen den Tisch ___ die Stühle.", "Setz dich ___ uns."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_dir_10_in_urlaub", answer: "in", items: ["Wir fahren ___ die Stadt.", "Sie geht ___ die Bibliothek.", "Er läuft ___ die Küche.", "Ich stecke das Ticket ___ die Jacke.", "Sie wirft den Ball ___ den Korb."], meta:{ bucket:"direction", case:"Akk" } },
      { id: "de_loc_01_in", answer: "in", items: ["Ich bin ___ der Schule.", "Das Geld ist ___ der Tasche.", "Er ist gerade ___ der Küche.", "Die Kinder spielen ___ dem Garten.", "Der Schlüssel liegt ___ der Jacke."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_02_auf", answer: "auf", items: ["Das Buch liegt ___ dem Tisch.", "Die Tasse steht ___ dem Boden.", "Er sitzt ___ dem Stuhl.", "Die Katze schläft ___ dem Sofa.", "Die Jacke liegt ___ dem Bett."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_03_an", answer: "an", items: ["Das Bild hängt ___ der Wand.", "Er steht ___ der Tür.", "Wir sitzen ___ dem Fenster.", "Das Auto steht ___ der Ecke.", "Der Laden ist ___ der Straße."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_04_unter", answer: "unter", items: ["Der Schlüssel ist ___ dem Tisch.", "Die Schuhe sind ___ dem Bett.", "Die Katze sitzt ___ der Brücke.", "Das Kabel liegt ___ dem Teppich.", "Die Tasche ist ___ dem Stuhl."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_05_ueber", answer: "über", items: ["Die Lampe hängt ___ dem Tisch.", "Die Wolken sind ___ der Stadt.", "Das Regal ist ___ dem Sofa.", "Der Bildschirm ist ___ der Tastatur.", "Die Brücke ist ___ dem Fluss."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_06_neben", answer: "neben", items: ["Der Stuhl steht ___ dem Tisch.", "Das Buch liegt ___ dem Heft.", "Er sitzt ___ mir.", "Das Auto steht ___ dem Eingang.", "Die Lampe steht ___ dem Sofa."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_07_vor", answer: "vor", items: ["Er steht ___ dem Spiegel.", "Die Kiste steht ___ der Tür.", "Wir sitzen ___ dem Fernseher.", "Das Auto steht ___ dem Haus.", "Das Paket liegt ___ der Garage."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_08_hinter", answer: "hinter", items: ["Das Fahrrad steht ___ dem Haus.", "Er steht ___ dem Vorhang.", "Die Katze ist ___ dem Sofa.", "Wir stehen ___ dem Bus.", "Der Rucksack liegt ___ dem Stuhl."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_09_zwischen", answer: "zwischen", items: ["Die Vase steht ___ den Fenstern.", "Er sitzt ___ den Kindern.", "Das Blatt liegt ___ den Büchern.", "Der Tisch steht ___ den Stühlen.", "Sie sitzt ___ uns."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_loc_10_im_buero", answer: "in", items: ["Ich bin ___ dem Büro.", "Er ist ___ der Bank.", "Sie ist ___ der Apotheke.", "Wir sind ___ dem Kino.", "Die Leute sind ___ der Warteschlange."], meta:{ bucket:"location", case:"Dat" } },
      { id: "de_dat_01_mit", answer: "mit", items: ["Ich spreche ___ dem Lehrer.", "Wir fahren ___ dem Bus.", "Sie kommt ___ ihrer Schwester.", "Er arbeitet ___ einem Team.", "Ich esse ___ meinem Freund."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_02_von", answer: "von", items: ["Wir kommen ___ der Arbeit.", "Das ist ein Geschenk ___ meiner Mutter.", "Er hat es ___ einem Kollegen.", "Sie lernt ___ der Erfahrung.", "Ich höre ___ meinen Nachbarn."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_03_zu", answer: "zu", items: ["Ich gehe ___ dem Arzt.", "Wir fahren ___ der Oma.", "Kommst du ___ der Party?", "Sie geht ___ einem Kurs.", "Er läuft ___ dem Bahnhof."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_04_bei", answer: "bei", items: ["Ich bin ___ meiner Freundin.", "Er arbeitet ___ einer Firma.", "Wir treffen uns ___ dir.", "Sie wohnt ___ den Eltern.", "Ich bleibe ___ meinem Bruder."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_05_nach", answer: "nach", items: ["Wir fahren ___ Berlin.", "Er fliegt ___ Deutschland.", "Sie geht ___ Hause.", "Ich komme ___ der Schule.", "Wir fahren ___ Zürich."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_06_aus", answer: "aus", items: ["Ich komme ___ der Schweiz.", "Er nimmt das Buch ___ der Tasche.", "Sie trinkt ___ der Flasche.", "Der Rauch kommt ___ dem Fenster.", "Ich nehme Geld ___ dem Portemonnaie."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_07_seit", answer: "seit", items: ["Ich wohne hier ___ einem Jahr.", "Er arbeitet dort ___ 2020.", "Sie kennt ihn ___ der Schule.", "Wir warten ___ einer Stunde.", "Ich lerne Deutsch ___ drei Monaten."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_08_gegenueber", answer: "gegenüber", items: ["Die Bank ist ___ der Apotheke.", "Er sitzt ___ mir.", "Der Park liegt ___ dem Haus.", "Die Haltestelle ist ___ dem Bahnhof.", "Das Café ist ___ der Schule."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_09_beim", answer: "bei", items: ["Ich warte ___ dem Eingang.", "Wir treffen uns ___ der Station.", "Er ist ___ der Arbeit.", "Sie ist ___ der Schule.", "Wir bleiben ___ dem Hotel."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_dat_10_zum", answer: "zu", items: ["Ich gehe ___ Supermarkt.", "Er fährt ___ Bahnhof.", "Wir gehen ___ Konzert.", "Sie geht ___ Universität.", "Ich bringe das ___ Nachbarn."], meta:{ bucket:"dat_only", case:"Dat" } },
      { id: "de_akk_01_fuer", answer: "für", items: ["Das Geschenk ist ___ dich.", "Danke ___ deine Hilfe.", "Ich habe Zeit ___ dich.", "Das ist gut ___ mich.", "Wir sparen ___ einen Urlaub."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_02_ohne", answer: "ohne", items: ["Ich gehe ___ meine Jacke.", "Sie kommt ___ ihren Bruder.", "Er arbeitet ___ Pause.", "Wir machen das ___ dich.", "Ich kann ___ Kaffee nicht."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_03_durch", answer: "durch", items: ["Er geht ___ den Park.", "Wir fahren ___ den Tunnel.", "Sie schaut ___ das Fenster.", "Ich lese ___ den Text.", "Die Straße geht ___ den Wald."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_04_gegen", answer: "gegen", items: ["Wir sind ___ den Plan.", "Er läuft ___ die Wand.", "Sie spielt ___ ein Team.", "Ich habe nichts ___ dich.", "Das Medikament hilft ___ den Schmerz."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_05_um", answer: "um", items: ["Wir gehen ___ den See.", "Er steht ___ die Ecke.", "Sie läuft ___ das Haus.", "Wir treffen uns ___ 8 Uhr.", "Es geht ___ eine Frage."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_06_bis", answer: "bis", items: ["Ich arbeite ___ morgen.", "Wir warten ___ nächste Woche.", "Er bleibt ___ Montag.", "Die Straße geht ___ die Stadt.", "Ich bleibe ___ neun Uhr."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_07_ueber_zeit", answer: "über", items: ["Wir sprechen ___ den Urlaub.", "Er denkt ___ das Problem nach.", "Sie lacht ___ den Witz.", "Ich freue mich ___ das Geschenk.", "Wir diskutieren ___ den Plan."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_08_unter_Leute", answer: "unter", items: ["Er mischt sich ___ die Leute.", "Sie bringt das ___ die Kinder.", "Wir teilen es ___ die Gäste.", "Er verteilt es ___ die Kollegen.", "Sie streut Zucker ___ den Kuchen."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_09_in_Stadt", answer: "in", items: ["Wir gehen ___ die Stadt.", "Er fährt ___ die Schweiz.", "Sie läuft ___ die Bibliothek.", "Ich gehe ___ die Apotheke.", "Wir gehen ___ die Bar."], meta:{ bucket:"akk_only", case:"Akk" } },
      { id: "de_akk_10_auf_Tisch", answer: "auf", items: ["Leg das Handy ___ den Tisch.", "Stell die Flasche ___ den Boden.", "Setz dich ___ den Stuhl.", "Wir stellen es ___ den Schrank.", "Sie legt die Jacke ___ das Bett."], meta:{ bucket:"akk_only", case:"Akk" } }
    ]
  };
})();
