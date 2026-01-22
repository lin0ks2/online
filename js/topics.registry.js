/* Topics registry + normalization (canonical 16 topics)
   Used by filters (levels + topics). Keeps UI stable by collapsing noisy raw topics
   into a short canonical set, with aliases and heuristics. */

(function(){
  'use strict';

  const A = (window.App = window.App || {});

  // Canonical topics (16). IDs are stable and language-agnostic.
  const CANON = [
    { id:'basic',        labels:{ ru:'Базовое',            uk:'Базове',                 en:'Basic' } },
    { id:'people',       labels:{ ru:'Люди',               uk:'Люди',                   en:'People' } },
    { id:'family',       labels:{ ru:'Семья',              uk:"Сім'я",                  en:'Family' } },
    { id:'home',         labels:{ ru:'Дом',                uk:'Дім',                    en:'Home' } },
    { id:'food',         labels:{ ru:'Еда и напитки',      uk:'Їжа і напої',            en:'Food & drinks' } },
    { id:'shopping',     labels:{ ru:'Покупки и деньги',   uk:'Покупки і гроші',        en:'Shopping & money' } },
    { id:'travel',       labels:{ ru:'Путешествия',        uk:'Подорожі',               en:'Travel' } },
    { id:'city',         labels:{ ru:'Город',              uk:'Місто',                  en:'City' } },
    { id:'work',         labels:{ ru:'Работа',             uk:'Робота',                 en:'Work' } },
    { id:'study',        labels:{ ru:'Учёба',              uk:'Навчання',               en:'Study' } },
    { id:'health',       labels:{ ru:'Здоровье',           uk:"Здоров'я",               en:'Health' } },
    { id:'time',         labels:{ ru:'Время и распорядок', uk:'Час і розпорядок',       en:'Time & routine' } },
    { id:'numbers',      labels:{ ru:'Числа',              uk:'Числа',                  en:'Numbers' } },
    { id:'communication',labels:{ ru:'Общение',            uk:'Спілкування',            en:'Communication' } },
    { id:'nature',       labels:{ ru:'Природа',            uk:'Природа',                en:'Nature' } },
    { id:'technology',   labels:{ ru:'Технологии',         uk:'Технології',             en:'Technology' } },
  ];

  const CANON_IDS = Object.create(null);
  CANON.forEach(t => { CANON_IDS[t.id] = true; });

  // Explicit aliases (normalized string -> canonical id).
  // Keep this list short; heuristics below cover the rest.
  const ALIASES = Object.assign(Object.create(null), {
    // basic / time
    'daily':'time',
    'daily life':'time',
    'daily routine':'time',
    'routine':'time',
    'basic':'basic',
    'basic verbs':'basic',

    // study / grammar
    'alphabet':'study',
    'classroom':'study',
    'adverbs':'study',
    'conjunctions':'study',
    'demonstrative':'study',

    // family / people
    'children':'family',
    'people':'people',

    // city / travel
    'city':'city',
    'countries':'travel',

    // shopping
    'clothes':'shopping',
    'banking':'shopping',

    // work / tech
    'admin':'work',
    'administration':'work',
    'company':'work',
    'business':'work',
    'bureaucracy':'work',
    'dev':'technology',
    'devops':'technology',
    'api':'technology',
    'data':'technology',
    'database':'technology',
    'design':'technology',
    'architecture':'technology',
    'construction':'technology',
    'backup':'technology',

    // nature
    'animals':'nature',
    'biology':'nature',
    'chemistry':'nature',

    // health
    'body':'health',
    'care':'health',
  });

  // Tags that are too abstract/linguistic to be meaningful in a user-facing "Topics" filter.
  // We intentionally DO NOT map them to any canonical topic to avoid noisy matches.
  const BLACKLIST = new Set([
    // semantic/logic tags often used as meta-categories
    'abstract','general','common','misc','other','miscellaneous','unknown',
    'addition','absence','degree','quantity','quality','comparison','contrast','cause','condition','certainty','negation','relation','purpose','reason',
    'process','state','attribute','intensity','measure','part','whole','direction','location',
    // overly broad UI/ops tags
    'update','updates','system','meta','test',
  ]);

  // If a tag matches these patterns, treat it as non-user-facing and ignore it.
  const BLACKLIST_RX = [
    // Pure parts of speech / grammar meta-categories (too broad as a "topic")
    /^(noun|verb|adjective|adverb|pronoun|preposition|conjunction|article|determiner|interjection|numeral|particle)s?$/,
    // very generic property tags
    /^(easy|hard|basic|advanced)$/,
  ];

  function _normKey(s){
    return String(s || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[._-]+/g, ' ')
      .replace(/[’'"]/g, '')
      .replace(/[(){}[\],:;!?]/g, '')
      .trim();
  }

  // Heuristic mapping for unknown/noisy topic tags
  function _heuristic(key){
    if (!key) return null;

    // family / people
    if (/(family|children|child|parent|mother|father|brother|sister|son|daughter)/.test(key)) return 'family';
    if (/(people|person|human|customer|client)/.test(key)) return 'people';

    // home
    if (/(home|house|room|kitchen|bath|bed|furniture|garden)/.test(key)) return 'home';

    // food
    if (/(food|drink|restaurant|cafe|coffee|tea|water|cook|cooking|meal)/.test(key)) return 'food';

    // shopping / money
    if (/(shop|shopping|store|market|price|money|bank|payment|card|cash|clothes|wear)/.test(key)) return 'shopping';

    // travel / transport / geography
    if (/(travel|trip|journey|holiday|vacation|airport|train|bus|tram|metro|ticket|hotel|country|countries|border)/.test(key)) return 'travel';

    // city
    if (/(city|town|street|address|station)/.test(key)) return 'city';

    // work
    if (/(work|job|office|company|business|admin|administration|bureaucracy|career)/.test(key)) return 'work';

    // study / grammar / language
    if (/(study|school|class|classroom|lesson|alphabet|grammar|adverb|conjunction|pronoun|noun|verb|article|tense)/.test(key)) return 'study';

    // health
    if (/(health|body|care|doctor|medicine|ill|disease)/.test(key)) return 'health';

    // time
    if (/(time|day|week|month|year|daily|routine)/.test(key)) return 'time';

    // numbers
    if (/(number|numbers|count|math|percent|quarter|half)/.test(key)) return 'numbers';

    // communication
    if (/(communication|customer care|support|speak|talk|say|greet|greeting|colloquial|dialog|phone|email|message)/.test(key)) return 'communication';

    // nature
    if (/(nature|animal|animals|biology|chemistry|plant|tree|river|sea|mountain|weather)/.test(key)) return 'nature';

    // technology
    if (/(tech|technology|computer|software|hardware|data|database|api|devops|dev|design|architecture|construction|backup|cloud)/.test(key)) return 'technology';

    return null;
  }

  function normalizeTopic(raw){
    if (raw == null) return null;

    // If already canonical
    const direct = _normKey(raw);
    if (!direct) return null;
    if (CANON_IDS[direct]) return direct;

    // Explicit aliases
    // Ignore non-user-facing tags
    if (BLACKLIST.has(direct)) return null;
    for (const rx of BLACKLIST_RX) { if (rx.test(direct)) return null; }

    // Explicit aliases
    if (ALIASES[direct]) return ALIASES[direct];

    // Heuristics
    const h = _heuristic(direct);
    if (h && CANON_IDS[h]) return h;

    // Try singular/plural simple fallback
    const singular = direct.endsWith('s') ? direct.slice(0, -1) : direct;
    if (ALIASES[singular]) return ALIASES[singular];
    const hs = _heuristic(singular);
    if (hs && CANON_IDS[hs]) return hs;

    return null;
  }

  function label(topicId, uiLang){
    const id = String(topicId || '').trim();
    const t = CANON.find(x => x.id === id);
    if (!t) return id || '';
    const lang = (uiLang || A.settings?.uiLang || A.settings?.lang || 'ru').toLowerCase();
    return t.labels[lang] || t.labels.en || id;
  }

  function orderedIds(){
    return CANON.map(t => t.id);
  }

  function list(uiLang){
    return CANON.map(t => ({ id: t.id, label: (t.labels[(uiLang||'').toLowerCase()] || t.labels.en || t.id) }));
  }

  A.Topics = Object.assign(A.Topics || {}, {
    normalize: normalizeTopic,
    label,
    order: orderedIds,
    list,
    aliases: ALIASES,
    canon: CANON
  });
})();
