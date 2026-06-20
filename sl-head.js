/* ============================================================
   SculptLab — script chargé tôt (synchrone, dans le <head>)
   1) Redirection 1ʳᵉ visite : un navigateur NON francophone arrivant
      sur une page FR est envoyé vers la version anglaise (/en/…).
      • Respecte un choix de langue déjà mémorisé (jamais de boucle)
      • Ignorée pour les robots (Google, Bing…) -> aucun impact SEO
   2) Table de traduction des coloris FR -> EN, partagée par toutes
      les pages (Acquérir, fiches produit, récapitulatifs).
   ============================================================ */
(function () {
  try {
    var p = location.pathname;
    var isEn = p.indexOf('/en/') >= 0;
    var hasChoice = false;
    try { hasChoice = !!localStorage.getItem('lang'); } catch (e) {}
    var ua = (navigator.userAgent || '');
    var isBot = /bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebook|embedly|preview|lighthouse|headless/i.test(ua);
    if (!isEn && !hasChoice && !isBot) {
      var nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
      if (nav.indexOf('fr') !== 0) {
        var f = p.substring(p.lastIndexOf('/') + 1);
        if (!f) f = 'index.html';
        location.replace('/en/' + f + location.search + location.hash);
        return;
      }
    }
  } catch (e) {}
})();

/* --- Traduction des coloris (clé = nom FR normalisé, sans accent, minuscules) --- */
window.SL_COLORS_EN = {
  // Io
  "ecarlate": "Scarlet", "pomme": "Apple", "sorbet": "Sorbet", "outremer": "Ultramarine",
  "poudre": "Powder", "arlequin": "Harlequin", "berlingot": "Candy", "cyan": "Cyan",
  // Za'mu
  "acide": "Acid", "albizia": "Albizia", "dragee": "Almond", "corail": "Coral",
  "venin": "Venom", "lagon": "Lagoon", "givre": "Frost", "plasma": "Plasma",
  "sable": "Sand", "antipode": "Antipode", "anemone": "Anemone", "parme": "Parma",
  "brume": "Mist", "primaire": "Primary",
  // Enigma
  "nova": "Nova", "glitch": "Glitch", "loop": "Loop", "vapeur": "Vapor",
  "eclipse": "Eclipse", "neon": "Neon", "echo": "Echo", "majorelle": "Majorelle",
  "soleil": "Sun", "vide": "Void", "neige": "Snow", "vague": "Wave",
  "vibe": "Vibe", "zigzag": "Zigzag", "pulse": "Pulse", "pixel": "Pixel",
  "electric": "Electric", "doodle": "Doodle", "nuit": "Night", "aube": "Dawn"
};

window.slNormColor = function (s) {
  return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
};

/* Renvoie le nom du coloris dans la langue voulue (FR = inchangé). */
window.slColorName = function (name, lang) {
  if (!name) return name;
  var l = (lang || '').toLowerCase();
  if (l.indexOf('en') !== 0) return name;
  return window.SL_COLORS_EN[window.slNormColor(name)] || name;
};
