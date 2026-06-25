/* ============================================================
   SculptLab — Checkout dynamique (pages _summary)
   Sélecteur « zone de livraison » + envoi vers une Stripe Checkout
   Session créée par le Worker (transporteur + port adaptés au pays).

   • Actif seulement si window.SL_CHECKOUT_ENDPOINT est renseigné ET
     (window.SL_CHECKOUT_LIVE === true OU URL avec ?checkout=test).
     Sinon : aucun changement, le bouton garde son Payment Link.
   • Sélecteur en cartes radio (et non <select> natif) pour respecter
     le curseur personnalisé du site (rond vert).
   • Bouton réinitialisé au retour navigateur (cache bfcache).
   ============================================================ */
(function () {
  var ENDPOINT = window.SL_CHECKOUT_ENDPOINT || '';
  var btn = document.querySelector('a.payment-button');
  if (!btn || !ENDPOINT) return;

  /* Déploiement progressif : pendant la phase de test, le nouveau flux ne
     s'active que si window.SL_CHECKOUT_LIVE === true, OU si l'URL contient
     ?checkout=test (mémorisé ensuite). Sinon : repli sur le Payment Link. */
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

  /* Zones (AFFICHAGE seulement ; le Worker fait foi sur prix/transporteur/pays) */
  var ZONES = {
    fr:   { fr: 'France & Monaco',      en: 'France & Monaco',  carrier: 'UPS Standard', amount: '9,90 €' },
    eu:   { fr: 'Union européenne', en: 'European Union',   carrier: 'DHL Express',  amount: '19,90 €' },
    chuk: { fr: 'Suisse & Royaume-Uni', en: 'Switzerland & UK', carrier: 'DHL Express',  amount: '29,90 €' },
    na:   { fr: 'Amérique du Nord', en: 'North America',    carrier: 'UPS Standard', amount: '49,90 €' }
  };
  var ORDER = ['fr', 'eu', 'chuk', 'na'];

  /* --- Sélecteur de zone en cartes radio (inséré avant le bouton) --- */
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
    updateShippingRow();
  }
  function updateShippingRow() {
    var zz = ZONES[selectedZone()];
    if (!zz) return;
    var cell = document.querySelector('td[data-i18n="summary.shippingFree"]');
    if (cell) { cell.removeAttribute('data-i18n'); cell.textContent = zz.carrier + ' · ' + zz.amount; }
  }
  function renderLabels() {
    var L = curLang();
    lab.textContent = L === 'en' ? 'Shipping destination' : 'Destination de livraison';
    ORDER.forEach(function (z) {
      var zz = ZONES[z];
      radios[z].txt.textContent = (L === 'en' ? zz.en : zz.fr) + ' — ' + zz.carrier + ' · ' + zz.amount;
    });
    updateShippingRow();
  }

  /* Rafraîchir au changement de langue */
  if (typeof window.setLanguage === 'function') {
    var prev = window.setLanguage;
    window.setLanguage = function (l) { prev(l); renderLabels(); };
  }
  ['btn-fr', 'btn-en', 'btn-fr-mobile', 'btn-en-mobile'].forEach(function (id) {
    var b = document.getElementById(id);
    if (b) b.addEventListener('click', function () { setTimeout(renderLabels, 0); });
  });
  renderLabels();

  /* --- Bouton « Finaliser ma commande » : interception + reset robuste --- */
  var busy = false;
  var savedLabel = null;
  function resetBtn() {
    busy = false;
    btn.style.pointerEvents = '';
    btn.style.opacity = '';
    if (savedLabel !== null) { btn.textContent = savedLabel; savedLabel = null; }
  }
  /* Réinitialise le bouton quand la page est restaurée depuis le cache
     navigateur (bouton « Précédent » depuis Stripe) — sinon il reste figé
     sur « Redirection… » et non cliquable. */
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
