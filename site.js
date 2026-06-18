/* ============================================================
   SculptLab — Comportements communs (chargé sur toutes les pages)
   • Détection de langue navigateur -> classe sur <body> (bannière .fr/.en)
   • Bannière de consentement cookies (RGPD / Consent Mode v2)
     - Accepter : mémorise + gtag consent 'granted'
     - Refuser  : mémorise + ne déclenche rien
   Le défaut de consentement ('denied') est défini inline dans le <head>
   AVANT le chargement de gtag ; ce fichier ne gère que la mise à jour.
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
  // Langue d'affichage de la bannière = choix mémorisé (localStorage 'lang') en priorité,
  // sinon langue de la page (<html lang>). Suit aussi la bascule FR/EN.
  function applyLang(l) {
    var en = (l === 'en');
    document.body.classList.toggle('lang-en', en);
    document.body.classList.toggle('lang-fr', !en);
  }
  var saved = (localStorage.getItem('lang') || '').toLowerCase();
  var lang = saved || (document.documentElement.lang || 'fr').toLowerCase();
  applyLang(lang.indexOf('en') === 0 ? 'en' : 'fr');

  // Suivre le sélecteur de langue (FR · EN), desktop + mobile
  ['btn-fr', 'btn-fr-mobile'].forEach(function (id) {
    var b = document.getElementById(id); if (b) b.addEventListener('click', function () { applyLang('fr'); });
  });
  ['btn-en', 'btn-en-mobile'].forEach(function (id) {
    var b = document.getElementById(id); if (b) b.addEventListener('click', function () { applyLang('en'); });
  });

  var banner = document.getElementById('cookie-banner');
  if (!banner) return;

  // Afficher la bannière si aucun choix n'a encore été fait
  if (!localStorage.getItem('cookiesAccepted') && !localStorage.getItem('cookiesRefused')) {
    banner.style.display = 'flex';
    setTimeout(function () { banner.classList.add('show'); }, 50);
  }

  function hide() {
    banner.classList.remove('show');
    setTimeout(function () { banner.style.display = 'none'; }, 400);
  }

  var accept = document.getElementById('close-cookie-banner');
  if (accept) accept.addEventListener('click', function () {
    localStorage.setItem('cookiesAccepted', 'true');
    if (typeof gtag === 'function') {
      gtag('consent', 'update', {
        ad_storage: 'granted', ad_user_data: 'granted',
        ad_personalization: 'granted', analytics_storage: 'granted'
      });
    }
    hide();
  });

  var refuse = document.getElementById('refuse-cookie-banner');
  if (refuse) refuse.addEventListener('click', function () {
    localStorage.setItem('cookiesRefused', 'true');
    hide();
  });
});

/* ============================================================
   Curseur personnalisé — anneau turquoise (desktop uniquement)
   • S'affiche PAR-DESSUS le curseur natif (aucune perte de précision)
   • Grossit / se remplit au survol des éléments interactifs
   • Désactivé sur tactile et si "réduire les animations"
   ============================================================ */
(function () {
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion) return;

  var style = document.createElement('style');
  style.textContent =
    '.sl-cursor{position:fixed;top:0;left:0;width:26px;height:26px;border:2px solid #64eecd;' +
    'border-radius:50%;background:transparent;pointer-events:none;z-index:99999;opacity:0;' +
    'transition:width .18s ease,height .18s ease,background-color .18s ease,opacity .25s ease;' +
    'will-change:transform}' +
    '.sl-cursor.is-hover{width:42px;height:42px;background:rgba(100,238,205,.18)}' +
    '.sl-cursor.is-down{width:20px;height:20px;background:rgba(100,238,205,.35)}';
  document.head.appendChild(style);

  var ring = document.createElement('div');
  ring.className = 'sl-cursor';
  ring.setAttribute('aria-hidden', 'true');
  (document.body || document.documentElement).appendChild(ring);

  var x = window.innerWidth / 2, y = window.innerHeight / 2, rx = x, ry = y, shown = false;
  document.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY;
    if (!shown) { ring.style.opacity = '1'; shown = true; }
  }, { passive: true });

  (function loop() {
    rx += (x - rx) * 0.22;
    ry += (y - ry) * 0.22;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();

  var interactive = 'a,button,input,textarea,select,label,summary,[role="button"],[onclick],.buy-button,.artwork-order';
  document.addEventListener('mouseover', function (e) {
    if (e.target.closest && e.target.closest(interactive)) ring.classList.add('is-hover');
  }, { passive: true });
  document.addEventListener('mouseout', function (e) {
    if (e.target.closest && e.target.closest(interactive)) ring.classList.remove('is-hover');
  }, { passive: true });
  document.addEventListener('mousedown', function () { ring.classList.add('is-down'); }, { passive: true });
  document.addEventListener('mouseup', function () { ring.classList.remove('is-down'); }, { passive: true });
  document.addEventListener('mouseleave', function () { ring.style.opacity = '0'; shown = false; }, { passive: true });
})();
