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
   Curseur personnalisé — remplace la souris par un rond plein (desktop)
   • Rond turquoise ; devient rose au-dessus des zones turquoise
   • Suit le pointeur exactement (clics précis, curseur natif masqué)
   • Grossit au survol des éléments interactifs, se contracte au clic
   • Désactivé sur tactile et si "réduire les animations"
   ============================================================ */
(function () {
  var finePointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!finePointer || reduceMotion) return;

  var style = document.createElement('style');
  style.textContent =
    'html.sl-cursor-active, html.sl-cursor-active *{cursor:none !important}' +
    '.sl-cursor{position:fixed;top:0;left:0;width:16px;height:16px;border-radius:50%;' +
    'background:#64eecd;pointer-events:none;z-index:99999;opacity:0;' +
    'transition:width .15s ease,height .15s ease,background-color .15s ease,opacity .25s ease;' +
    'will-change:transform}' +
    '.sl-cursor.is-hover{width:28px;height:28px}' +
    '.sl-cursor.is-down{width:12px;height:12px}' +
    '.sl-cursor.on-turq{background:#ff007f}';
  document.head.appendChild(style);

  var dot = document.createElement('div');
  dot.className = 'sl-cursor';
  dot.setAttribute('aria-hidden', 'true');
  (document.body || document.documentElement).appendChild(dot);
  document.documentElement.classList.add('sl-cursor-active');

  var shown = false;
  var interactive = 'a,button,input,textarea,select,label,summary,[role="button"],[onclick],.buy-button,.artwork-order';
  var turquoise = '.section-turquoise,.about-closing';

  document.addEventListener('mousemove', function (e) {
    var x = e.clientX, y = e.clientY;
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
    if (!shown) { dot.style.opacity = '1'; shown = true; }
    var el = document.elementFromPoint(x, y);
    if (el && el.closest) {
      dot.classList.toggle('on-turq', !!el.closest(turquoise));
      dot.classList.toggle('is-hover', !!el.closest(interactive));
    }
  }, { passive: true });

  document.addEventListener('mousedown', function () { dot.classList.add('is-down'); }, { passive: true });
  document.addEventListener('mouseup', function () { dot.classList.remove('is-down'); }, { passive: true });
  document.addEventListener('mouseleave', function () { dot.style.opacity = '0'; shown = false; }, { passive: true });
})();
