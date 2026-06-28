/* ============================================================
   SculptLab — Checkout dynamique (pages _summary)
   Sélecteur « zone de livraison » (mondial) + Stripe Checkout
   Session créée par le Worker (transporteur + port adaptés au pays).
   Le tableau récapitulatif affiche le port choisi et un TOTAL
   = prix de la sculpture + livraison.

   • Actif seulement si window.SL_CHECKOUT_ENDPOINT est renseigné ET
     (window.SL_CHECKOUT_LIVE === true OU URL avec ?checkout=test).
   • Cartes radio (et non <select>) pour respecter le curseur du site.
   • Bouton réinitialisé au retour navigateur (cache bfcache).
   ============================================================ */
(function () {
  var ENDPOINT = window.SL_CHECKOUT_ENDPOINT || '';
  var btn = document.querySelector('a.payment-button');
  if (!btn || !ENDPOINT) return;

  var LIVE = (window.SL_CHECKOUT_LIVE === true);
  var TESTFLAG = /[?&]checkout=test\b/.test(location.search) ||
    (function () { try { return localStorage.getItem('sl_checkout_test') === '1'; } catch (e) { return false; } })();
  if (!LIVE && !TESTFLAG) return;
  if (TESTFLAG) { try { localStorage.setItem('sl_checkout_test', '1'); } catch (e) {} }

  /* Détection sculpture / coloris / langue (aligné sur site.js) */
  var DEFAULT_COLOR = {
    io1: 'Sorbet', io2: 'Outremer',
    zamu1: 'Brume', zamu2: 'Primaire',
    enigma1: 'Nuit', enigma2: 'Aube'
  };
  function pageKey() {
    return (location.pathname.split('/').pop() || '').toLowerCase().replace('_summary.html', '');
  }
  function sculptFromKey(k) {
    if (k.indexOf('enigma') === 0) return 'enigma';
    if (k.indexOf('zamu') === 0) return 'zamu';
    if (k.indexOf('io') === 0) return 'io';
    return '';
  }
  function curLang() {
    if (location.pathname.indexOf('/en/') >= 0) return 'en';
    var l = (localStorage.getItem('lang') || document.documentElement.lang || 'fr').toLowerCase();
    return l.indexOf('en') === 0 ? 'en' : 'fr';
  }
  function color() {
    var p = new URLSearchParams(location.search).get('couleur');
    return p || DEFAULT_COLOR[pageKey()] || '';
  }

  /* Zones (AFFICHAGE ; le Worker fait foi sur prix/transporteur/pays).
     num = montant numérique du port, identique au Worker (amount/100). */
  var ZONES = {
    fr:     { fr: 'France & Monaco',            en: 'France & Monaco',            carrier: 'UPS Standard', amount: '9,90 €',  num: 9.90 },
    eu:     { fr: 'Union européenne',           en: 'European Union',             carrier: 'DHL Express',  amount: '19,90 €', num: 19.90 },
    europe: { fr: 'Europe hors UE',             en: 'Non-EU Europe',              carrier: 'DHL Express',  amount: '29,90 €', num: 29.90 },
    na:     { fr: 'Amérique du Nord',           en: 'North America',              carrier: 'UPS Standard', amount: '49,90 €', num: 49.90 },
    latam:  { fr: 'Amérique latine & Caraïbes', en: 'Latin America & Caribbean',  carrier: 'DHL Express',  amount: '74,90 €', num: 74.90 },
    asia:   { fr: 'Asie, Océanie & Moyen-Orient', en: 'Asia, Oceania & Middle East', carrier: 'DHL Express', amount: '74,90 €', num: 74.90 },
    world:  { fr: 'Afrique & reste du monde',   en: 'Africa & rest of world',     carrier: 'DHL Express',  amount: '84,90 €', num: 84.90 }
  };
  var ORDER = ['fr', 'eu', 'europe', 'na', 'latam', 'asia', 'world'];

  /* --- Prix de la sculpture (via slPrice de sl-head.js), repli sur la cellule --- */
  function productPrice() {
    var s = sculptFromKey(pageKey());
    var raw = color();
    var ck = window.slNormColor ? window.slNormColor(raw) : raw.toLowerCase();
    var ed = (window.SL_ED_MAP && window.SL_ED_MAP[s]) ? window.SL_ED_MAP[s][ck] : null;
    var p = (window.slPrice && ed) ? window.slPrice(s, raw, ed) : null;
    if (p == null) {
      var c0 = document.querySelector('.order-summary-table td.price-column');
      if (c0) p = parseFloat(c0.textContent.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    }
    return p || 0;
  }
  function fmtEur(v) {
    var r = Math.round(v * 100) / 100;
    var s = (Math.abs(r % 1) < 0.005) ? String(Math.round(r)) : r.toFixed(2).replace('.', ',');
    return s + ' €';
  }

  /* --- Sélecteur de zone en cartes radio --- */
  var wrap = document.createElement('div'); wrap.className = 'ship-zone';
  var lab = document.createElement('div'); lab.className = 'ship-zone-label';
  var opts = document.createElement('div'); opts.className = 'ship-zone-opts'; opts.setAttribute('role', 'radiogroup');
  var radios = {};
  ORDER.forEach(function (z, i) {
    var opt = document.createElement('label'); opt.className = 'ship-zone-opt' + (i === 0 ? ' selected' : '');
    var input = document.createElement('input'); input.type = 'radio'; input.name = 'sl-ship-zone'; input.value = z;
    if (i === 0) input.checked = true;
    var d = document.createElement('span'); d.className = 'dot'; d.setAttribute('aria-hidden', 'true');
    var txt = document.createElement('span'); txt.className = 'ship-zone-opt-text';
    opt.appendChild(input); opt.appendChild(d); opt.appendChild(txt);
    opts.appendChild(opt);
    radios[z] = { input: input, opt: opt, txt: txt };
    input.addEventListener('change', function () { selectZone(z); });
  });
  wrap.appendChild(lab); wrap.appendChild(opts);
  btn.parentNode.insertBefore(wrap, btn);

  function selectedZone() {
    for (var z in radios) if (radios[z].input.checked) return z;
    return ORDER[0];
  }
  function selectZone(z) {
    ORDER.forEach(function (k) { radios[k].opt.classList.toggle('selected', k === z); });
    updateTable();
  }
  /* Met à jour la ligne Livraison + le Total (sculpture + port) + le libellé */
  function updateTable() {
    var z = ZONES[selectedZone()]; if (!z) return;
    var cells = document.querySelectorAll('.order-summary-table td.price-column');
    if (cells.length >= 3) {
      cells[1].removeAttribute('data-i18n');
      cells[1].textContent = z.carrier + ' · ' + z.amount;
      cells[2].removeAttribute('data-i18n');
      cells[2].textContent = fmtEur(productPrice() + z.num);
    }
    var totalLabel = document.querySelector('.order-summary-table tr:last-child td:first-child');
    if (totalLabel) { totalLabel.removeAttribute('data-i18n'); totalLabel.textContent = 'Total'; }
  }
  function renderLabels() {
    var L = curLang();
    lab.textContent = L === 'en' ? 'Shipping destination' : 'Destination de livraison';
    ORDER.forEach(function (z) {
      var zz = ZONES[z];
      radios[z].txt.textContent = (L === 'en' ? zz.en : zz.fr) + ' — ' + zz.carrier + ' · ' + zz.amount;
    });
    updateTable();
  }

  /* Rafraîchir au changement de langue (après le script de coloris/prix) */
  if (typeof window.setLanguage === 'function') {
    var prev = window.setLanguage;
    window.setLanguage = function (l) { prev(l); renderLabels(); };
  }
  ['btn-fr', 'btn-en', 'btn-fr-mobile', 'btn-en-mobile'].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function () { setTimeout(renderLabels, 0); });
  });
  /* Rendu initial APRÈS le script inline de coloris/prix (qui tourne au DOMContentLoaded) */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(renderLabels, 0); });
  } else {
    setTimeout(renderLabels, 0);
  }

  /* --- Bouton « Finaliser ma commande » : interception + reset robuste --- */
  var busy = false;
  var savedLabel = null;
  function resetBtn() {
    busy = false;
    btn.style.pointerEvents = '';
    btn.style.opacity = '';
    if (savedLabel !== null) { btn.textContent = savedLabel; savedLabel = null; }
  }
  window.addEventListener('pageshow', function () { resetBtn(); });

  btn.addEventListener('click', function (e) {
    e.preventDefault();
    if (busy) return;

    var sculpt = sculptFromKey(pageKey());
    var col = color();
    var zone = selectedZone();
    var fallback = btn.getAttribute('href');

    if (!sculpt || !col || !zone) {
      if (fallback) window.location.href = fallback;
      return;
    }

    busy = true;
    var L = curLang();
    savedLabel = btn.textContent;
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.7';
    btn.textContent = L === 'en' ? 'Redirecting…' : 'Redirection…';

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sculpture: sculpt, color: col, lang: L, zone: zone, cancel_url: location.href })
    })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, d: d }; }); })
      .then(function (res) {
        if (res.ok && res.d && res.d.url) { window.location.href = res.d.url; return; }
        throw new Error((res.d && res.d.error) || 'checkout_failed');
      })
      .catch(function () {
        resetBtn();
        if (fallback && fallback.indexOf('http') === 0) {
          window.location.href = fallback;
        } else {
          alert(L === 'en'
            ? 'Payment temporarily unavailable. Please try again.'
            : 'Paiement momentanément indisponible. Merci de réessayer.');
        }
      });
  });
})();
