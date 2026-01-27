/* ==========================================================
 * Проект: MOYAMOVA
 * Файл: trainer.prepositions.en.js
 * Назначение: Данные для тренера предлогов (EN) — 30 паттернов × 5 фраз
 * Версия: 0.1
 * Обновлено: 2026-01-23
 * ========================================================== */

(function(){
  'use strict';

  // Глобальный контейнер данных тренера предлогов
  // Важно: не используем i18n EN — интерфейс RU/UK.
  var root = (window.prepositionsTrainer = window.prepositionsTrainer || {});
  root.en = {
    lang: 'en',
    totalPatterns: 80,
    variantsPerPattern: 5,
    // Базовый пул предлогов-отвлекалок (уникальные подписи на кнопках — обязательны).
    distractorPool: [
      'at','on','in','to','from','for','with','without','about','of','by',
      'under','over','between','among','through','during','before','after',
      'until','since','into','onto','across','around','in front of','next to','near','inside','outside'
    ],
    patterns: [
      {
        id: "prep_01_at_time",
        answer: "at",
        items: ["I'll meet you ___ 5 pm.", "The train arrives ___ noon.", "She usually wakes up ___ 6:30.", "The store closes ___ midnight.", "We start the lesson ___ 9 o\u2019clock."]
      },
      {
        id: "prep_02_on_day",
        answer: "on",
        items: ["I work from home ___ Mondays.", "We have a meeting ___ Friday.", "Her birthday is ___ April 12th.", "The concert is ___ Saturday night.", "The package arrived ___ Tuesday."]
      },
      {
        id: "prep_03_in_month",
        answer: "in",
        items: ["We travel ___ August.", "He was born ___ 1998.", "The project ends ___ two weeks.", "Flowers bloom ___ spring.", "I\u2019ll call you ___ a minute."]
      },
      {
        id: "prep_04_in_place",
        answer: "in",
        items: ["She lives ___ London.", "There\u2019s a key ___ my bag.", "He is ___ the kitchen right now.", "I left my phone ___ the car.", "The kids are playing ___ the garden."]
      },
      {
        id: "prep_05_on_surface",
        answer: "on",
        items: ["Your book is ___ the desk.", "There\u2019s a photo ___ the wall.", "Put the cup ___ the table.", "He sat ___ the sofa.", "The sticker is ___ the laptop."]
      },
      {
        id: "prep_06_at_place",
        answer: "at",
        items: ["I\u2019m ___ the bus stop.", "Let\u2019s meet ___ the entrance.", "She\u2019s ___ work right now.", "He stayed ___ home yesterday.", "We\u2019re ___ the airport early."]
      },
      {
        id: "prep_07_to_destination",
        answer: "to",
        items: ["We\u2019re going ___ the cinema.", "She moved ___ Canada last year.", "Send this email ___ me, please.", "He walked ___ the station.", "I\u2019m flying ___ Berlin tomorrow."]
      },
      {
        id: "prep_08_from_origin",
        answer: "from",
        items: ["This gift is ___ my sister.", "I\u2019m ___ Ukraine.", "The train comes ___ Zurich.", "He borrowed the book ___ the library.", "She got a message ___ her boss."]
      },
      {
        id: "prep_09_for_purpose",
        answer: "for",
        items: ["This tool is ___ cutting paper.", "I\u2019m studying English ___ work.", "We saved money ___ a new phone.", "She went there ___ a job interview.", "I bought flowers ___ my mom."]
      },
      {
        id: "prep_10_with_company",
        answer: "with",
        items: ["I\u2019m going ___ my friends.", "He lives ___ his parents.", "Can you come ___ me?", "She works ___ a great team.", "We had dinner ___ our neighbors."]
      },
      {
        id: "prep_11_without",
        answer: "without",
        items: ["I can\u2019t work ___ coffee.", "He left ___ saying goodbye.", "Please don\u2019t start ___ me.", "She drove ___ a map.", "They did it ___ help."]
      },
      {
        id: "prep_12_about_topic",
        answer: "about",
        items: ["We talked ___ the plan.", "I read an article ___ AI.", "She asked me ___ your trip.", "He knows a lot ___ history.", "Let\u2019s think ___ the next step."]
      },
      {
        id: "prep_13_of_possession",
        answer: "of",
        items: ["The color ___ the car is red.", "A piece ___ cake, please.", "The end ___ the movie was surprising.", "The door ___ the house is open.", "The name ___ the street is on the sign."]
      },
      {
        id: "prep_14_by_agent",
        answer: "by",
        items: ["The book was written ___ Orwell.", "The project was finished ___ our team.", "The window was broken ___ a ball.", "The song was sung ___ her.", "The decision was made ___ the manager."]
      },
      {
        id: "prep_15_under",
        answer: "under",
        items: ["The cat is ___ the table.", "Keep the passport ___ your pillow.", "The shoes are ___ the bed.", "He hid ___ the bridge.", "There\u2019s a cable ___ the desk."]
      },
      {
        id: "prep_16_over",
        answer: "over",
        items: ["A lamp hangs ___ the table.", "There\u2019s a bridge ___ the river.", "He put a jacket ___ his shirt.", "We talked for ___ an hour.", "The plane flew ___ the city."]
      },
      {
        id: "prep_17_between",
        answer: "between",
        items: ["The bank is ___ the caf\u00e9 and the pharmacy.", "She sat ___ Anna and Mark.", "Choose ___ tea and coffee.", "There\u2019s a line ___ the two points.", "We split the work ___ the three of us."]
      },
      {
        id: "prep_18_among",
        answer: "among",
        items: ["He felt comfortable ___ friends.", "The secret spread ___ the students.", "There was excitement ___ the crowd.", "She walked ___ the trees.", "It\u2019s popular ___ young people."]
      },
      {
        id: "prep_19_through",
        answer: "through",
        items: ["We walked ___ the park.", "Light came ___ the window.", "He read ___ the document.", "The tunnel goes ___ the mountain.", "She looked ___ the photos."]
      },
      {
        id: "prep_20_during",
        answer: "during",
        items: ["No phones ___ the meeting.", "It rained ___ the night.", "I met her ___ my vacation.", "He slept ___ the flight.", "We were quiet ___ the exam."]
      },
      {
        id: "prep_21_before",
        answer: "before",
        items: ["Wash your hands ___ dinner.", "Call me ___ you leave.", "He arrived ___ everyone else.", "I always check the address ___ sending.", "Let\u2019s finish this ___ Monday."]
      },
      {
        id: "prep_22_after",
        answer: "after",
        items: ["We\u2019ll go out ___ work.", "She felt better ___ the break.", "Call me ___ you arrive.", "He went home ___ the lesson.", "I\u2019ll reply ___ lunch."]
      },
      {
        id: "prep_23_until",
        answer: "until",
        items: ["Wait here ___ I come back.", "The shop is open ___ 8 pm.", "He worked ___ midnight.", "Stay ___ the end.", "We talked ___ sunrise."]
      },
      {
        id: "prep_24_since",
        answer: "since",
        items: ["I\u2019ve known her ___ 2020.", "He has lived here ___ April.", "She hasn\u2019t called ___ last week.", "We\u2019ve been friends ___ school.", "Nothing changed ___ then."]
      },
      {
        id: "prep_25_into",
        answer: "into",
        items: ["She walked ___ the room.", "Pour the water ___ the glass.", "He got ___ the car.", "The cat jumped ___ the box.", "They ran ___ the house."]
      },
      {
        id: "prep_26_onto",
        answer: "onto",
        items: ["The child climbed ___ the chair.", "He stepped ___ the platform.", "Put the files ___ the desk.", "The cat jumped ___ the sofa.", "She moved ___ the stage."]
      },
      {
        id: "prep_27_across",
        answer: "across",
        items: ["We walked ___ the street.", "There\u2019s a store ___ the road.", "He ran ___ the field.", "They swam ___ the lake.", "The message spread ___ the country."]
      },
      {
        id: "prep_28_around",
        answer: "around",
        items: ["We sat ___ the fire.", "She looked ___ the room.", "The kids ran ___ the house.", "There are trees ___ the lake.", "Let\u2019s walk ___ the block."]
      },
      {
        id: "prep_29_in_front_of",
        answer: "in front of",
        items: ["He parked ___ the building.", "She stood ___ the mirror.", "The taxi stopped ___ the hotel.", "I\u2019ll wait ___ the station.", "The sign is ___ the shop."]
      },
      {
        id: "prep_30_next_to",
        answer: "next to",
        items: ["Sit ___ me.", "The pharmacy is ___ the bank.", "My desk is ___ the window.", "He lives ___ a park.", "Put the chair ___ the table."]
      }

      ,      {
        id: "prep_31_by_transport",
        answer: "by",
        items: ["I usually go to work ___ bus.", "She traveled ___ train.", "We went there ___ car.", "He came ___ taxi.", "They prefer to commute ___ bike."]
      }
      ,      {
        id: "prep_32_on_device",
        answer: "on",
        items: ["I saw it ___ my phone.", "The file is saved ___ your computer.", "He watched the video ___ his tablet.", "Please sign in ___ this device.", "The meeting link is ___ the app."]
      }
      ,      {
        id: "prep_33_in_language",
        answer: "in",
        items: ["Can you say it ___ English?", "The email was written ___ German.", "She answered ___ Spanish.", "Please speak ___ French.", "The instructions are ___ Italian."]
      }
      ,      {
        id: "prep_34_for_duration",
        answer: "for",
        items: ["I stayed there ___ two days.", "He has worked here ___ five years.", "We talked ___ an hour.", "She was away ___ a week.", "I waited ___ 20 minutes."]
      }
      ,      {
        id: "prep_35_with_tool",
        answer: "with",
        items: ["Cut it ___ a knife.", "Write it ___ a pen.", "He opened the box ___ a key.", "She fixed it ___ a screwdriver.", "Mix it ___ a spoon."]
      }
      ,      {
        id: "prep_36_without_permission",
        answer: "without",
        items: ["Don't leave ___ permission.", "He entered ___ knocking.", "She signed the form ___ reading it.", "They started ___ me.", "I can't do it ___ you."]
      }
      ,      {
        id: "prep_37_into_change",
        answer: "into",
        items: ["Turn the music ___ a ringtone.", "She changed the idea ___ a plan.", "He translated the text ___ English.", "They converted the room ___ an office.", "The discussion turned ___ an argument."]
      }
      ,      {
        id: "prep_38_onto_public",
        answer: "onto",
        items: ["He posted the photo ___ Instagram.", "Upload the document ___ the portal.", "She saved it ___ the cloud.", "Copy the files ___ the USB drive.", "He moved the project ___ GitHub."]
      }
      ,      {
        id: "prep_39_across_difference",
        answer: "across",
        items: ["The quality varies ___ brands.", "The rule is the same ___ the country.", "Prices changed ___ Europe.", "The rumor spread ___ the office.", "We have issues ___ teams."]
      }
      ,      {
        id: "prep_40_between_two_times",
        answer: "between",
        items: ["The meeting is ___ 2 and 3 pm.", "I'll be free ___ 6 and 7.", "The shop is busiest ___ 5 and 6.", "The call lasted ___ 10 and 11.", "Traffic is heavy ___ 8 and 9."]
      }
      ,      {
        id: "prep_41_among_group",
        answer: "among",
        items: ["She is popular ___ her classmates.", "He felt safe ___ colleagues.", "This tradition is common ___ locals.", "There is confusion ___ new users.", "The topic spread ___ friends."]
      }
      ,      {
        id: "prep_42_through_process",
        answer: "through",
        items: ["I learned it ___ practice.", "We solved it ___ teamwork.", "He got the job ___ hard work.", "She improved ___ daily training.", "They succeeded ___ persistence."]
      }
      ,      {
        id: "prep_43_during_event",
        answer: "during",
        items: ["No talking ___ the movie.", "He fell asleep ___ the lecture.", "I met him ___ the conference.", "She called me ___ the dinner.", "We laughed ___ the game."]
      }
      ,      {
        id: "prep_44_before_deadline",
        answer: "before",
        items: ["Submit it ___ Friday.", "Please arrive ___ 8 am.", "Finish the task ___ the deadline.", "Check your work ___ sending it.", "Let's meet ___ noon."]
      }
      ,      {
        id: "prep_45_after_event",
        answer: "after",
        items: ["I'll call you ___ the meeting.", "She left ___ the interview.", "We went home ___ the party.", "He started working ___ lunch.", "They cleaned up ___ dinner."]
      }
      ,      {
        id: "prep_46_since_point",
        answer: "since",
        items: ["I've lived here ___ 2019.", "He has been sick ___ Monday.", "We've been waiting ___ noon.", "She's known him ___ childhood.", "Nothing happened ___ then."]
      }
      ,      {
        id: "prep_47_until_point",
        answer: "until",
        items: ["Stay here ___ I return.", "We're open ___ 9 pm.", "He waited ___ the bus arrived.", "Keep going ___ the end.", "I'll work ___ midnight."]
      }
      ,      {
        id: "prep_48_at_address",
        answer: "at",
        items: ["She lives ___ 12 Baker Street.", "Send it ___ my email address.", "You can reach me ___ this number.", "Meet me ___ Gate 3.", "I'm ___ the main entrance."]
      }
      ,      {
        id: "prep_49_in_front_of_object",
        answer: "in front of",
        items: ["He stood ___ the door.", "The car stopped ___ the house.", "Wait ___ the station.", "She parked ___ the supermarket.", "The sign is ___ the building."]
      }
      ,      {
        id: "prep_50_next_to_object",
        answer: "next to",
        items: ["Sit ___ the window.", "The hotel is ___ the museum.", "My phone is ___ my keys.", "Put the bag ___ the chair.", "The café is ___ the bank."]
      }
      ,      {
        id: "prep_51_near_place",
        answer: "near",
        items: ["There's a park ___ my house.", "I'll wait ___ the entrance.", "She lives ___ the river.", "We stayed ___ the airport.", "He works ___ the city center."]
      }
      ,      {
        id: "prep_52_inside_container",
        answer: "inside",
        items: ["The wallet is ___ my bag.", "There's a note ___ the box.", "Keep it ___ your pocket.", "The keys are ___ the drawer.", "The cat is ___ the house."]
      }
      ,      {
        id: "prep_53_outside_place",
        answer: "outside",
        items: ["I'll wait ___ the building.", "They're standing ___ the shop.", "It's холодно ___ today.", "Leave your shoes ___ the room.", "There's a bike ___ the door."]
      }
      ,      {
        id: "prep_54_under_pressure",
        answer: "under",
        items: ["He's ___ a lot of stress.", "The project is ___ review.", "She's ___ pressure at work.", "The city is ___ construction.", "We're ___ tight deadlines."]
      }
      ,      {
        id: "prep_55_over_period",
        answer: "over",
        items: ["Sales increased ___ the year.", "We met several times ___ the summer.", "He improved ___ time.", "They talked ___ the weekend.", "It happened ___ the last month."]
      }
      ,      {
        id: "prep_56_about_person",
        answer: "about",
        items: ["Tell me ___ your boss.", "We're worried ___ him.", "I'm thinking ___ the trip.", "She's excited ___ the news.", "He complains ___ the weather."]
      }
      ,      {
        id: "prep_57_of_material",
        answer: "of",
        items: ["This table is made ___ wood.", "A ring ___ gold.", "A bottle ___ water.", "A cup ___ tea.", "A sheet ___ paper."]
      }
      ,      {
        id: "prep_58_by_deadline",
        answer: "by",
        items: ["Finish it ___ tomorrow.", "Please reply ___ 6 pm.", "I'll be there ___ Monday.", "The report is due ___ Friday.", "Pay it ___ the end of the month."]
      }
      ,      {
        id: "prep_59_to_recipient",
        answer: "to",
        items: ["Give it ___ her.", "Explain it ___ me.", "Send the file ___ the team.", "Talk ___ your manager.", "Write ___ customer support."]
      }
      ,      {
        id: "prep_60_from_source",
        answer: "from",
        items: ["I got it ___ a colleague.", "She learned it ___ a book.", "We heard it ___ the news.", "He copied it ___ the website.", "I received a call ___ the bank."]
      }
      ,      {
        id: "prep_61_in_timeframe",
        answer: "in",
        items: ["I'll be ready ___ 10 minutes.", "The package will arrive ___ two days.", "We'll finish ___ a week.", "Call me ___ an hour.", "He'll return ___ a moment."]
      }
      ,      {
        id: "prep_62_on_holiday",
        answer: "on",
        items: ["She's ___ vacation this week.", "He's ___ a business trip.", "They're ___ holiday in Spain.", "I'm ___ leave today.", "We're ___ a break right now."]
      }
      ,      {
        id: "prep_63_at_event",
        answer: "at",
        items: ["See you ___ the party.", "He spoke ___ the conference.", "She laughed ___ the joke.", "We met ___ the workshop.", "They performed ___ the festival."]
      }
      ,      {
        id: "prep_64_in_order",
        answer: "in",
        items: ["Write the steps ___ order.", "Put the files ___ alphabetical order.", "We'll do it ___ two parts.", "Read it ___ sections.", "Sort them ___ groups."]
      }
      ,      {
        id: "prep_65_between_options",
        answer: "between",
        items: ["Choose ___ these two designs.", "Decide ___ tea and coffee.", "There's a big difference ___ them.", "We split the money ___ us.", "She can't decide ___ staying or leaving."]
      }
      ,      {
        id: "prep_66_around_time",
        answer: "around",
        items: ["Let's meet ___ 7 pm.", "He arrived ___ midnight.", "I'll call you ___ lunchtime.", "She woke up ___ 6.", "It happened ___ the same time."]
      }
      ,      {
        id: "prep_67_across_communication",
        answer: "across",
        items: ["The message came ___ clearly.", "His point didn't come ___.", "I'm trying to get it ___.", "She got her idea ___ well.", "The joke didn't come ___."]
      }
      ,      {
        id: "prep_68_through_channel",
        answer: "through",
        items: ["Contact us ___ email.", "I heard about it ___ a friend.", "We booked it ___ the website.", "Send it ___ the app.", "He found the job ___ LinkedIn."]
      }
      ,      {
        id: "prep_69_under_age",
        answer: "under",
        items: ["Kids ___ 12 pay less.", "It's not allowed for people ___ 18.", "The ticket is free for children ___ 6.", "He started coding when he was ___ 10.", "Students ___ 16 need permission."]
      }
      ,      {
        id: "prep_70_over_limit",
        answer: "over",
        items: ["It costs ___ $100.", "The temperature is ___ 30°C.", "The video has ___ a million views.", "He waited ___ two hours.", "We talked for ___ three hours."]
      }
      ,      {
        id: "prep_71_inside_topic",
        answer: "about",
        items: ["The book is ___ economics.", "We talked ___ the budget.", "I'm curious ___ the result.", "She asked ___ your plans.", "He wrote ___ his experience."]
      }
      ,      {
        id: "prep_72_without_cost",
        answer: "without",
        items: ["You can cancel ___ a fee.", "He did it ___ any help.", "We solved it ___ extra tools.", "She left ___ paying.", "They agreed ___ hesitation."]
      }
      ,      {
        id: "prep_73_into_accident",
        answer: "into",
        items: ["I ran ___ an old friend.", "He bumped ___ the wall.", "She crashed ___ a tree.", "We looked ___ the issue.", "He got ___ trouble."]
      }
      ,      {
        id: "prep_74_onto_movement",
        answer: "onto",
        items: ["He jumped ___ the bus.", "The cat climbed ___ the roof.", "She stepped ___ the boat.", "Put it ___ the shelf.", "He moved ___ the next topic."]
      }
      ,      {
        id: "prep_75_in_front_of_line",
        answer: "in front of",
        items: ["Don't stand ___ me in line.", "He stopped ___ the camera.", "She spoke ___ the audience.", "The kids ran ___ the teacher.", "Park ___ the garage."]
      }
      ,      {
        id: "prep_76_next_to_compare",
        answer: "next to",
        items: ["Next ___ this, mine is small.", "Put your name ___ mine.", "Add the note ___ the date.", "The icon is ___ the title.", "Sit ___ the aisle."]
      }
      ,      {
        id: "prep_77_near_time",
        answer: "near",
        items: ["The store opens ___ 9.", "We're getting ___ the end.", "It's ___ impossible.", "He was ___ tears.", "The deadline is ___."]
      }
      ,      {
        id: "prep_78_inside_abstract",
        answer: "inside",
        items: ["There's a conflict ___ the team.", "We had issues ___ the project.", "Keep it ___ the company.", "It's not allowed ___ this group.", "He felt calm ___."]
      }
      ,      {
        id: "prep_79_outside_scope",
        answer: "outside",
        items: ["That's ___ my control.", "It's ___ the scope.", "They live ___ the city.", "This is ___ our plan.", "It's ___ the rules."]
      }
      ,      {
        id: "prep_80_at_moment",
        answer: "at",
        items: ["I'm busy ___ the moment.", "She's not home ___ the moment.", "He's working ___ the moment.", "We're meeting ___ the moment.", "I can't talk ___ the moment."]
      }
    ]
  };
})();
