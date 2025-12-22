// ui.examples.highlight.de.js
// Version: rebuilt-v9
// Purpose: Highlight target German words in example sentences.
// Notes:
// - Verbs: handle separable prefixes, inflected forms, participles.
// - Reflexive verbs: match verb + sich variations.
// - Prepositions & fixed expressions: exact-match highlighting to avoid false positives.

export const highlightRulesDE = {
  meta: {
    version: "v9-rebuilt",
    date: "2025-12-22"
  },

  // =======================
  // Helpers
  // =======================
  boundaries: {
    word: "(?<![\\p{L}])(%s)(?![\\p{L}])"
  },

  // =======================
  // Verbs
  // =======================
  verbs: {
    // Generic verb forms
    base: (v) => [
      v,
      v + "e",
      v + "st",
      v + "t",
      v + "en",
      "ge" + v + "t",
      "ge" + v + "en"
    ],

    // Separable verbs: e.g. anfangen -> fängt ... an
    separable: (base, prefix) => [
      `${prefix}.*?${base}`,
      `${base}.*?${prefix}`
    ],

    // Reflexive verbs
    reflexive: (v) => [
      `${v}\\s+(mich|dich|sich|uns|euch)`,
      `(mich|dich|sich|uns|euch)\\s+${v}`
    ]
  },

  // =======================
  // Prepositions & fixed phrases
  // =======================
  prepositionsExact: [
    "in",
    "von",
    "mitten in",
    "kraft von"
  ],

  // =======================
  // Build regex for exact prepositions
  // =======================
  buildPrepositionRegex(phrase) {
    const escaped = phrase.replace(/[-/\\^$*+?.()|[\\]{}]/g, "\\$&");
    return new RegExp(`(?<!\\p{L})${escaped}(?!\\p{L})`, "giu");
  },

  // =======================
  // Main API
  // =======================
  getRegex(word, type = "auto") {
    if (type === "preposition") {
      return this.buildPrepositionRegex(word);
    }

    const forms = this.verbs.base(word);
    const pattern = forms.join("|");
    return new RegExp(`(?<!\\p{L})(${pattern})(?!\\p{L})`, "giu");
  }
};
