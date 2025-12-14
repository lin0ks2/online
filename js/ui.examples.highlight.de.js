/* ============================================================
 * ui.examples.highlight.de.js
 * German-specific highlighting rules (single-file strategy)
 * Priority:
 * 1) Modal verbs
 * 2) Reflexive verbs (sich)
 * 3) Separable verbs
 * 4) Strong verb explicit forms
 * 5) Fallback: exact match
 * ============================================================ */

/* ------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------ */

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findAndWrap(text, forms, cssClass) {
  if (!forms || !forms.length) return null;

  for (var i = 0; i < forms.length; i++) {
    var f = forms[i];
    var re = new RegExp('\\b' + escapeRegExp(f) + '\\b', 'i');
    if (re.test(text)) {
      return text.replace(re, function (m) {
        return '<span class="' + cssClass + '">' + m + '</span>';
      });
    }
  }
  return null;
}

/* ------------------------------------------------------------
 * 1. MODAL VERBS (highest priority)
 * ------------------------------------------------------------ */

var MODAL_VERBS = {
  'müssen': ['muss', 'musst', 'müssen', 'müsst'],
  'dürfen': ['darf', 'darfst', 'dürfen', 'dürft'],
  'wollen': ['will', 'willst', 'wollen', 'wollt'],
  'mögen':  ['mag', 'magst', 'mögen', 'mögt']
};

function highlightModalVerb(text, word) {
  var forms = MODAL_VERBS[word];
  if (!forms) return null;
  return findAndWrap(text, forms, 'ex-hl');
}

/* ------------------------------------------------------------
 * 2. REFLEXIVE VERBS (sich)
 * ------------------------------------------------------------ */

var REFLEXIVE_PRONOUNS = ['mich', 'dich', 'sich', 'uns', 'euch'];

function isReflexive(word) {
  return /\(sich\)/i.test(word);
}

function baseVerbFromReflexive(word) {
  return word.replace(/\s*\(sich\)/i, '').trim();
}

function buildReflexiveForms(base) {
  // simple Präsens stem-based (A1–A2 sufficient)
  var stem = base.replace(/en$/, '');
  return [
    stem + 'e',
    stem + 'st',
    stem + 't',
    stem + 'en'
  ];
}

function highlightReflexiveVerb(text, word) {
  if (!isReflexive(word)) return null;

  var base = baseVerbFromReflexive(word);
  var forms = buildReflexiveForms(base);

  // we highlight the VERB, not the pronoun
  return findAndWrap(text, forms, 'ex-hl');
}

/* ------------------------------------------------------------
 * 3. SEPARABLE VERBS
 * ------------------------------------------------------------ */

var SEPARABLE_PREFIXES = [
  'auf','ein','aus','mit','vor','weiter','zurück'
];

function isSeparable(word) {
  for (var i = 0; i < SEPARABLE_PREFIXES.length; i++) {
    if (word.startsWith(SEPARABLE_PREFIXES[i])) return true;
  }
  return false;
}

function splitSeparable(word) {
  for (var i = 0; i < SEPARABLE_PREFIXES.length; i++) {
    var p = SEPARABLE_PREFIXES[i];
    if (word.startsWith(p)) {
      return {
        prefix: p,
        base: word.slice(p.length)
      };
    }
  }
  return null;
}

function buildSeparableForms(word) {
  var parts = splitSeparable(word);
  if (!parts) return [];

  var stem = parts.base.replace(/en$/, '');
  return [
    stem + 'e',
    stem + 'st',
    stem + 't',
    stem + 'en'
  ];
}

function highlightSeparableVerb(text, word) {
  if (!isSeparable(word)) return null;

  var parts = splitSeparable(word);
  if (!parts) return null;

  var forms = buildSeparableForms(word);
  var prefix = parts.prefix;

  // pattern: verb ... prefix
  for (var i = 0; i < forms.length; i++) {
    var re = new RegExp(
      '\\b(' + escapeRegExp(forms[i]) + ')\\b([\\s\\S]{0,40}?)\\b(' +
        escapeRegExp(prefix) +
        ')\\b',
      'i'
    );

    if (re.test(text)) {
      return text.replace(re, function (_, v, mid, p) {
        return (
          '<span class="ex-hl">' + v + '</span>' +
          mid +
          '<span class="ex-hl">' + p + '</span>'
        );
      });
    }
  }
  return null;
}

/* ------------------------------------------------------------
 * 4. STRONG VERB EXPLICIT FORMS (from screenshots)
 * ------------------------------------------------------------ */

var STRONG_VERBS = {
  'einfallen': ['fällt', 'fällst'],
  'weitergeben': ['gibt', 'gibst', 'geben'],
  'voraussetzen': ['setzt', 'setze', 'setzen']
};

function highlightStrongVerb(text, word) {
  var forms = STRONG_VERBS[word];
  if (!forms) return null;
  return findAndWrap(text, forms, 'ex-hl');
}

/* ------------------------------------------------------------
 * 5. FALLBACK (exact match only)
 * ------------------------------------------------------------ */

function highlightExact(text, word) {
  return findAndWrap(text, [word], 'ex-hl');
}

/* ------------------------------------------------------------
 * MAIN ENTRY
 * ------------------------------------------------------------ */

function highlightExample(text, wordObj) {
  if (!text || !wordObj || !wordObj.word) return text;

  var word = wordObj.word;

  // 1. Modal verbs
  var res = highlightModalVerb(text, word);
  if (res) return res;

  // 2. Reflexive verbs
  res = highlightReflexiveVerb(text, word);
  if (res) return res;

  // 3. Separable verbs
  res = highlightSeparableVerb(text, word);
  if (res) return res;

  // 4. Strong verbs
  res = highlightStrongVerb(text, word);
  if (res) return res;

  // 5. Exact fallback
  res = highlightExact(text, word);
  if (res) return res;

  return text;
}
