let cookiePanelOpen=false,cookiePromptTimer=null,cookieDismissed=false,cookieReturnFocus=null;
function cookiePanel(){
 return `<section id="cookie-panel" class="cookie-panel" role="region" aria-label="${t('Préférences de cookies','Cookie preferences')}" tabindex="-1" ${cookiePanelOpen?'':'hidden'}><p class="cookie-copy">${t('Nous utilisons des cookies pour améliorer votre expérience.','We use cookies to improve your experience.')} <a data-cookie-info href="${href('/mentions-legales/')}#cookie-details">${t('En savoir plus','Learn more')}</a>.</p><div class="cookie-actions"><button type="button" class="cookie-choice" data-cookie-action="reject">${t('Refuser','Decline')}</button><button type="button" class="cookie-choice" data-cookie-action="accept">OK</button></div></section>`;
}
function renderCookiePanel(){const root=document.querySelector('#cookie-root');if(root)root.innerHTML=cookiePanel()}
function showCookiePanel(button){
 cookieReturnFocus=button||null;cookiePanelOpen=true;
 renderCookiePanel();if(button)document.getElementById('cookie-panel')?.focus({preventScroll:true});
}
function closeCookiePanel(){
 cookiePanelOpen=false;cookieDismissed=true;renderCookiePanel();
 const target=cookieReturnFocus?.isConnected?cookieReturnFocus:document.getElementById('main');target?.focus({preventScroll:true});cookieReturnFocus=null;
}
function scheduleCookiePrompt(){
 if(cookiePromptTimer!==null)window.clearTimeout(cookiePromptTimer);cookiePromptTimer=null;
 if(cookiePanelOpen||cookieDismissed||window.sculptlabConsent?.getChoice()||typeof window.setTimeout!=='function')return;
 cookiePromptTimer=window.setTimeout(()=>{cookiePromptTimer=null;if(!window.sculptlabConsent?.getChoice()&&!cookieDismissed)showCookiePanel()},routeInfo().path==='/'?1700:200);
}
function handleCookieClick(target){
 const open=target.closest('[data-cookie-open]');if(open){showCookiePanel(open);return true}
 const action=target.closest('[data-cookie-action]');
 if(action){
  const allowed=action.dataset.cookieAction==='accept';closeCookiePanel();window.sculptlabConsent?.save(allowed);
  return true;
 }
 if(target.closest('[data-cookie-info]')){cookiePanelOpen=false;cookieDismissed=true;renderCookiePanel()}
 return false;
}
function cookieLegalDetails(){return `<div id="cookie-details" class="cookie-legal-details"><h3>${t('Vos préférences de cookies','Your cookie preferences')}</h3><p>${t('La mesure d’audience utilise le compte Google Analytics de SculptLab. La balise Google est chargée uniquement après votre accord ; les fonctions publicitaires sont désactivées. Les cookies Analytics (_ga et _ga_7BNG9RNN76) sont limités à six mois et supprimés sur ce site lorsque vous retirez votre accord.','Audience measurement uses SculptLab’s Google Analytics account. The Google tag loads only after you agree; advertising features are disabled. Analytics cookies (_ga and _ga_7BNG9RNN76) are limited to six months and removed from this site when you withdraw consent.')}</p><p>${t('Votre acceptation ou votre refus est mémorisé pendant six mois. Les préférences fonctionnelles de langue et d’animation restent indépendantes de la mesure d’audience. Le formulaire de contact transmet vos informations à FormSubmit uniquement lorsque vous l’envoyez ; le paiement est traité par Stripe dans le parcours de commande.','Your acceptance or refusal is remembered for six months. Functional language and animation preferences remain independent of audience measurement. The contact form sends your information to FormSubmit only when you submit it; payment is handled by Stripe during checkout.')}</p><button type="button" class="text-link" data-cookie-open aria-controls="cookie-panel">${t('Gérer les cookies','Manage cookies')}</button></div>`}
