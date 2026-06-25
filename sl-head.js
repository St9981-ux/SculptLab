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
    var loc = location;
    var path = loc.pathname;

    // 1) Déduplication d'URL : /index.html -> /  (et /en/index.html -> /en/)
    //    Évite tout contenu dupliqué ; le canonical pointe déjà vers la version sans index.html.
    if (/\/index\.html$/.test(path)) {
      loc.replace(path.replace(/index\.html$/, '') + loc.search + loc.hash);
      return;
    }

    // 2) Redirection de langue — JAMAIS pour les robots (aucun impact SEO).
    var ua = (navigator.userAgent || '');
    if (/bot|crawl|spider|slurp|bing|google|yandex|baidu|duckduck|facebook|embedly|preview|lighthouse|headless/i.test(ua)) return;

    var isEn = path.indexOf('/en/') >= 0;
    var saved = '';
    try { saved = (localStorage.getItem('lang') || '').toLowerCase(); } catch (e) {}

    // Préférence : choix mémorisé en priorité, sinon langue du navigateur
    // (tout sauf le français bascule vers l'anglais = x-default).
    var prefersEn;
    if (saved) {
      prefersEn = saved.indexOf('en') === 0;
    } else {
      var nav = (navigator.language || navigator.userLanguage || 'fr').toLowerCase();
      prefersEn = nav.indexOf('fr') !== 0;
    }

    var file = path.substring(path.lastIndexOf('/') + 1);
    if (!isEn && prefersEn) {
      // Page FR mais préférence anglaise -> version /en/ équivalente
      loc.replace('/en/' + file + loc.search + loc.hash);
    } else if (isEn && !prefersEn) {
      // Page EN mais préférence française -> version FR équivalente (racine)
      loc.replace('/' + file + loc.search + loc.hash);
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

/* --- Tarifs par édition (ouverte / limitée / unique) --- */
window.SL_PRICES = {
  io:     { open: 455, limited: 855,  unique: 1455 },
  zamu:   { open: 455, limited: 855,  unique: 1455 },
  enigma: { open: 475, limited: 925,  unique: 1695 }
};
/* Prix d'un coloris : base selon l'édition, avec exceptions Enigma plasma & electric (uniques) à 1455 € */
window.slPrice = function (sculpt, colorName, ed) {
  var P = window.SL_PRICES[sculpt];
  if (!P) return null;
  if (sculpt === 'enigma' && ed === 'unique') {
    var k = window.slNormColor(colorName);
    if (k === 'plasma' || k === 'electric') return 1455;
    if (k === 'pixel' || k === 'zigzag') return 1755;
  }
  return P[ed];
};
window.slPriceFmt = function (sculpt, colorName, ed) {
  var v = window.slPrice(sculpt, colorName, ed);
  return v == null ? '' : (v + ' €');
};
/* Clé sculpture à partir du libellé affiché (Io / Za'mu / Enigma) */
window.slSculptKey = function (label) {
  var l = (label || '').toLowerCase();
  if (l.indexOf('io') === 0) return 'io';
  if (l.indexOf('za') === 0) return 'zamu';
  if (l.indexOf('enig') === 0) return 'enigma';
  return '';
};

/* --- Payment Links Stripe (mode TEST) par langue / sculpture / coloris ---
   Clé coloris = nom FR normalisé (sans accent, minuscules), identique pour FR et EN.
   Le jeu EN pointe vers des produits Stripe dont le nom et la description sont
   en anglais (page de paiement entièrement anglaise). */
/* --- Endpoint du Worker de paiement (Checkout Sessions, transporteur adapté au pays) ---
   Vide = comportement historique (Payment Links ci-dessous, sans choix de transporteur).
   À renseigner après déploiement du Worker (voir worker/README.md), ex. :
   'https://sculptlab-checkout.<sous-domaine>.workers.dev/create-checkout-session' */
window.SL_CHECKOUT_ENDPOINT = 'https://sculptlab-checkout.sculptlab.workers.dev/create-checkout-session';
window.SL_CHECKOUT_LIVE = true; /* true = flux adaptatif actif pour tous ; false = uniquement avec ?checkout=test */

window.SL_PAYLINKS = {
  fr: {
    io: {
      sorbet:    'https://buy.stripe.com/test_eVq28t8W9gNQcYA5AIbII02',
      outremer:  'https://buy.stripe.com/test_6oUbJ32xL0OS5w86EMbII01',
      ecarlate:  'https://buy.stripe.com/test_8x228tfkx69c7Egd3abII06',
      pomme:     'https://buy.stripe.com/test_aFabJ33BPfJM2jW4wEbII07',
      poudre:    'https://buy.stripe.com/test_00wfZj5JX0OS2jWfbibII08',
      arlequin:  'https://buy.stripe.com/test_9B6dRba0d8hkgaMaV2bII09',
      berlingot: 'https://buy.stripe.com/test_00w14p4FT8hk7EggfmbII0a',
      cyan:      'https://buy.stripe.com/test_cNibJ38W9fJM9MofbibII0b'
    },
    zamu: {
      brume:     'https://buy.stripe.com/test_dRmaEZ0pD2X04s44wEbII04',
      primaire:  'https://buy.stripe.com/test_7sY00legt4149Mo8MUbII05',
      acide:     'https://buy.stripe.com/test_cNi5kF0pD414cYA8MUbII0c',
      albizia:   'https://buy.stripe.com/test_3cI28tfkxcxA7Eg6EMbII0d',
      dragee:    'https://buy.stripe.com/test_cNi00lgoB4140bO9QYbII0e',
      corail:    'https://buy.stripe.com/test_3cIcN76O18hkgaMfbibII0f',
      venin:     'https://buy.stripe.com/test_bJeaEZb4haps4s44wEbII0g',
      lagon:     'https://buy.stripe.com/test_4gMeVfa0d5583o06EMbII0h',
      givre:     'https://buy.stripe.com/test_9B64gB2xL1SW9Mo4wEbII0i',
      sable:     'https://buy.stripe.com/test_8x24gBb4hcxA3o05AIbII0j',
      antipode:  'https://buy.stripe.com/test_5kQ9AVegt9lobUwd3abII0k',
      plasma:    'https://buy.stripe.com/test_fZuaEZ7S5eFI0bO9QYbII0l',
      anemone:   'https://buy.stripe.com/test_eVqfZj7S54147Eg1ksbII0m',
      parme:     'https://buy.stripe.com/test_9B66oJ1tH1SWcYA6EMbII0n'
    },
    enigma: {
      nuit:      'https://buy.stripe.com/test_28E14pfkx69c3o0bZ6bII00',
      aube:      'https://buy.stripe.com/test_9B65kFegt9lobUw0gobII03',
      nova:      'https://buy.stripe.com/test_aFa5kFa0d8hk6Ac0gobII0o',
      glitch:    'https://buy.stripe.com/test_28EbJ33BP0OS2jWbZ6bII0p',
      loop:      'https://buy.stripe.com/test_aFadRb2xL8hk8IkbZ6bII0q',
      vapeur:    'https://buy.stripe.com/test_14A14p2xL1SW8IkaV2bII0r',
      eclipse:   'https://buy.stripe.com/test_cNi28t0pD1SWgaMfbibII0s',
      neon:      'https://buy.stripe.com/test_14A8wRdcp8hkaQs1ksbII0t',
      echo:      'https://buy.stripe.com/test_00w28t4FT1SW7Eg9QYbII0u',
      majorelle: 'https://buy.stripe.com/test_dRm6oJ2xLgNQ3o0gfmbII0v',
      soleil:    'https://buy.stripe.com/test_eVq9AVb4h69c4s45AIbII0w',
      outremer:  'https://buy.stripe.com/test_5kQ8wR2xL8hk5w86EMbII0x',
      vide:      'https://buy.stripe.com/test_28E8wRc8l69cgaMbZ6bII0y',
      neige:     'https://buy.stripe.com/test_3cI28ta0dgNQ4s4e7ebII0z',
      vague:     'https://buy.stripe.com/test_9B6cN78W9dBE7Eg7IQbII0A',
      vibe:      'https://buy.stripe.com/test_00w00l4FT5583o09QYbII0B',
      pulse:     'https://buy.stripe.com/test_bJe6oJ0pD9loaQs4wEbII0C',
      doodle:    'https://buy.stripe.com/test_aFa4gBgoB9loe2Ee7ebII0D',
      zigzag:    'https://buy.stripe.com/test_fZu7sNdcp9lo5w81ksbII0E',
      pixel:     'https://buy.stripe.com/test_eVq28ta0dgNQcYA2owbII0F',
      plasma:    'https://buy.stripe.com/test_6oU4gB7S52X05w8aV2bII0G',
      electric:  'https://buy.stripe.com/test_bJe00lc8l69c9MogfmbII0H'
    }
  },
  en: {
    io: {
      ecarlate:  'https://buy.stripe.com/test_5kQ7sN6O12X01fSfbibII0I',
      pomme:     'https://buy.stripe.com/test_14A4gB8W95580bO2owbII0J',
      sorbet:    'https://buy.stripe.com/test_bJedRb3BP1SW0bOfbibII0K',
      outremer:  'https://buy.stripe.com/test_8x2cN7goBeFI1fS6EMbII0L',
      poudre:    'https://buy.stripe.com/test_00w8wR0pD9lo9Mod3abII0M',
      arlequin:  'https://buy.stripe.com/test_4gM14p1tHdBE5w8aV2bII0N',
      berlingot: 'https://buy.stripe.com/test_dRm6oJ3BP2X00bO0gobII0O',
      cyan:      'https://buy.stripe.com/test_3cIbJ3a0d5582jWe7ebII0P'
    },
    zamu: {
      acide:     'https://buy.stripe.com/test_14A9AVc8lbtw6Ac8MUbII0Q',
      albizia:   'https://buy.stripe.com/test_dRm3cx2xLgNQ8IkfbibII0R',
      dragee:    'https://buy.stripe.com/test_5kQ7sNegt558aQse7ebII0S',
      corail:    'https://buy.stripe.com/test_5kQ4gBdcpcxA0bOd3abII0T',
      venin:     'https://buy.stripe.com/test_4gMdRb7S5558f6I5AIbII0U',
      lagon:     'https://buy.stripe.com/test_cNiaEZc8l8hkgaM4wEbII0V',
      givre:     'https://buy.stripe.com/test_9B63cxgoBgNQ3o00gobII0W',
      plasma:    'https://buy.stripe.com/test_6oU28tegt414f6I1ksbII0X',
      sable:     'https://buy.stripe.com/test_00w3cxb4h2X0gaM9QYbII0Y',
      antipode:  'https://buy.stripe.com/test_7sY4gB4FT2X06Ac6EMbII0Z',
      anemone:   'https://buy.stripe.com/test_6oUfZj3BP8hkf6I4wEbII10',
      parme:     'https://buy.stripe.com/test_14A3cx3BP9lobUw7IQbII11',
      brume:     'https://buy.stripe.com/test_bJe14p1tH9lo3o01ksbII12',
      primaire:  'https://buy.stripe.com/test_bJe28tb4h8hkbUw2owbII13'
    },
    enigma: {
      nova:      'https://buy.stripe.com/test_fZucN74FT0OSbUw5AIbII14',
      glitch:    'https://buy.stripe.com/test_cNibJ3b4h9lo1fS7IQbII15',
      loop:      'https://buy.stripe.com/test_3cIdRbb4h8hkf6IgfmbII16',
      vapeur:    'https://buy.stripe.com/test_dRm5kFfkxcxAcYAd3abII17',
      eclipse:   'https://buy.stripe.com/test_fZu5kF5JX414e2E0gobII18',
      neon:      'https://buy.stripe.com/test_00w3cxb4h1SW8Ike7ebII19',
      echo:      'https://buy.stripe.com/test_28E8wR6O1fJMbUwfbibII1a',
      majorelle: 'https://buy.stripe.com/test_9B6bJ30pDeFI9MobZ6bII1b',
      soleil:    'https://buy.stripe.com/test_00w00legtdBE6AcfbibII1c',
      outremer:  'https://buy.stripe.com/test_aFa14p4FTaps0bO6EMbII1d',
      vide:      'https://buy.stripe.com/test_eVqdRba0d9locYA4wEbII1e',
      neige:     'https://buy.stripe.com/test_14A5kFfkxaps2jWd3abII1f',
      vague:     'https://buy.stripe.com/test_28E3cxc8lgNQ4s42owbII1g',
      vibe:      'https://buy.stripe.com/test_5kQfZj2xL4145w85AIbII1h',
      zigzag:    'https://buy.stripe.com/test_bJe28t6O18hkcYAgfmbII1i',
      pulse:     'https://buy.stripe.com/test_5kQeVfb4hfJM3o08MUbII1j',
      plasma:    'https://buy.stripe.com/test_aFaeVf8W9btw6Acd3abII1k',
      pixel:     'https://buy.stripe.com/test_4gM7sN6O1eFIe2E9QYbII1l',
      electric:  'https://buy.stripe.com/test_8x2fZj5JXbtw6Ac7IQbII1m',
      doodle:    'https://buy.stripe.com/test_aFa9AV5JXcxA7Eg6EMbII1n',
      nuit:      'https://buy.stripe.com/test_fZu7sNgoBcxAgaMaV2bII1o',
      aube:      'https://buy.stripe.com/test_6oU00l5JX0OSbUw8MUbII1p'
    }
  }
};

/* Renvoie le Payment Link pour (sculpture, coloris, langue) ou null.
   On ne force PAS la locale : l'interface Stripe (champs de paiement,
   adresse de livraison, boutons) s'affiche automatiquement dans la langue
   du navigateur du client (FR, EN, DE, IT…). La langue ne sert ici qu'à
   choisir le bon jeu de produits (nom + description FR ou EN). */
window.slPayLink = function (sculpt, colorName, lang) {
  var L = (lang || '').toLowerCase().indexOf('en') === 0 ? 'en' : 'fr';
  var table = (window.SL_PAYLINKS[L] || {})[sculpt] || {};
  return table[window.slNormColor(colorName)] || null;
};
