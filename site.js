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
  // Langue du navigateur -> classe sur <body> (pilote l'affichage .fr/.en de la bannière)
  var userLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
  document.body.classList.add(userLang.indexOf('fr') === 0 ? 'lang-fr' : 'lang-en');

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
