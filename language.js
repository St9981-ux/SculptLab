/* Explicit language URLs win. A visitor's manual choice is saved locally. */
(() => {
  if (/^\/(fr|en)(\/|$)/.test(location.pathname)) return;
  // Search engines, testing tools and link previews read the page as published (French), without a language redirect.
  if (
    /bot|crawl|spider|slurp|google|lighthouse|facebookexternalhit|embedly|preview/i.test(
      (typeof navigator !== 'undefined' && navigator.userAgent) || ''
    )
  )
    return;
  let saved;
  try {
    saved = localStorage.getItem('sculptlab-language');
  } catch {}
  const preferred = (navigator.languages?.[0] || navigator.language || 'en').toLowerCase();
  const language = ['fr', 'en'].includes(saved)
    ? saved
    : preferred === 'fr' || preferred.startsWith('fr-')
      ? 'fr'
      : 'en';
  let path = location.pathname || '/';
  // The root address is the French home page itself: French visitors stay there.
  if (language === 'fr' && path === '/') return;
  if (language === 'en')
    path = path
      .replace(/^\/oeuvres(?=\/|$)/, '/works')
      .replace(/^\/atelier(?=\/|$)/, '/studio')
      .replace(/^\/acquerir(?=\/|$)/, '/acquire')
      .replace(/^\/mentions-legales(?=\/|$)/, '/legal')
      .replace(/^\/cgv(?=\/|$)/, '/terms')
      .replace(/^\/merci(?=\/|$)/, '/thanks');
  location.replace('/' + language + path + location.search + location.hash);
})();
