import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

// The published site is the repository root (GitHub Pages). This script lives in _build/.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = ['consent.js', 'arrival.js', 'data.js', 'legal.js', 'privacy-ui.js', 'app.js']
  .map(n => fs.readFileSync(path.join(root, n), 'utf8'))
  .join('\n');
const languageSource = fs.readFileSync(path.join(root, 'language.js'), 'utf8');
const origin = 'https://sculptlab.fr';
const paths = [
  '/',
  '/collection/',
  '/acquerir/',
  '/atelier/',
  '/contact/',
  '/mentions-legales/',
  '/cgv/',
  '/merci/',
  ...['io', 'zamu', 'enigma'].flatMap(id => ['/oeuvres/' + id + '/', '/acquerir/' + id + '/']),
];
const pairs = [
  ['oeuvres', 'works'],
  ['atelier', 'studio'],
  ['acquerir', 'acquire'],
  ['mentions-legales', 'legal'],
  ['cgv', 'terms'],
  ['merci', 'thanks'],
];
function localized(p, lang) {
  if (lang === 'fr' && p === '/') return '/'; // the French home page is the root address (see app.js localizedPath)
  if (lang === 'en') for (const [fr, en] of pairs) p = p.replace(new RegExp('^/' + fr + '(?=/|$)'), '/' + en);
  return '/' + lang + p;
}
const routes = ['fr', 'en'].flatMap(lang => paths.map(p => localized(p, lang)));
function generate(url, search = '') {
  const app = { innerHTML: '' },
    listeners = {};
  const dummy = { classList: { remove() {}, toggle() {} }, focus() {}, scrollIntoView() {} };
  const document = {
    title: '',
    description: '',
    body: { id: '' },
    documentElement: { lang: '' },
    addEventListener(type, cb) {
      listeners[type] = cb;
    },
    getElementById: id => (id === 'app' ? app : dummy),
    querySelector: s =>
      s === 'meta[name="description"]'
        ? {
            setAttribute(k, v) {
              document.description = v;
            },
          }
        : null,
  };
  const context = vm.createContext({
    document,
    location: { pathname: url, search, hash: '', origin, href: origin + url + search },
    window: {
      scrollTo() {},
      addEventListener() {},
      matchMedia() {
        return { matches: false, addEventListener() {} };
      },
    },
    URLSearchParams,
    URL,
    Intl,
    console,
  });
  vm.runInContext(source, context);
  assert.ok(app.innerHTML && !/\bundefined\b|\bNaN\b/.test(app.innerHTML), 'Invalid render ' + url + search);
  assert.equal((app.innerHTML.match(/<h1(?:\s|>)/g) || []).length, 1, 'One main heading ' + url);
  for (const m of app.innerHTML.matchAll(/(?:src|href)="(\/[^"?#]*)/g)) {
    if (m[1].startsWith('/assets/')) assert.ok(fs.existsSync(path.join(root, m[1])), 'Missing image ' + m[1]);
    else assert.ok(routes.includes(m[1]), 'Missing route ' + m[1]);
  }
  for (const m of app.innerHTML.matchAll(/href="#([^"]+)"/g))
    assert.ok(m[1] === 'top' || app.innerHTML.includes('id="' + m[1] + '"'), 'Missing anchor ' + m[1]);
  if (url.startsWith('/en/')) {
    const copy = app.innerHTML.replace(/<[^>]+>/g, ' ');
    assert.ok(
      !/Choisir une|Les œuvres|Lire son|Édition limitée|Tous droits|Votre message|Continuer sur|Retour en haut|La collection/.test(
        copy
      ),
      'Untranslated English page ' + url
    );
  }
  return {
    html: app.innerHTML,
    title: document.title,
    description: document.description,
    lang: document.documentElement.lang,
    context,
    listeners,
  };
}
const WORKS_DATA = (() => {
  const c = vm.createContext({});
  vm.runInContext(fs.readFileSync(path.join(root, 'data.js'), 'utf8') + ';globalThis.__works=WORKS;', c);
  return c.__works;
})();
const abs = u => origin + u;
const heroImage = WORKS_DATA.enigma.variants.find(v => v.name === 'Outremer').image; // first photograph of the home page (app.js home())
const jsonLd = data =>
  '<script type="application/ld+json">' + JSON.stringify(data).replace(/</g, '\\u003c') + '</script>';
const norm = v =>
  String(v)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase();
const sameAs = ['https://www.instagram.com/sculptlab', 'https://www.facebook.com/sculptlab'];
const address = {
  '@type': 'PostalAddress',
  streetAddress: '1364 route de la Fènerie',
  postalCode: '06580',
  addressLocality: 'Pégomas',
  addressRegion: 'Alpes-Maritimes',
  addressCountry: 'FR',
};
const returnPolicy = {
  '@type': 'MerchantReturnPolicy',
  applicableCountry: 'FR',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
  merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail',
  returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
};
// 1200×630 JPEG share images (assets/og/), readable by every social network.
function ogImage(p) {
  const w = p.match(/^\/(?:oeuvres|acquerir)\/(io|zamu|enigma)\/$/);
  if (w) return '/assets/og/' + w[1] + '.jpg';
  if (p === '/collection/' || p === '/acquerir/') return '/assets/og/collection.jpg';
  if (p === '/atelier/') return '/assets/og/atelier.jpg';
  return '/assets/og/sculptlab.jpg';
}
// Metadata that depends on the page: shared preview image, indexing and structured data.
function pageMeta(p, lang) {
  const en = lang === 'en',
    work = p.match(/^\/(oeuvres|acquerir)\/(io|zamu|enigma)\/$/),
    w = work && WORKS_DATA[work[2]];
  const noindex = Boolean(work && work[1] === 'acquerir') || p === '/merci/';
  const image = ogImage(p);
  let imageAlt = en ? 'Enigma, sculpture by SculptLab' : 'Enigma, sculpture SculptLab',
    type = 'website';
  const ld = [];
  if (p === '/collection/' || p === '/acquerir/')
    imageAlt = en ? 'Io, Za’mu and Enigma, sculptures by SculptLab' : 'Io, Za’mu et Enigma, sculptures SculptLab';
  if (p === '/atelier/')
    imageAlt = en
      ? 'A sculpture being modelled in the SculptLab studio'
      : 'Une sculpture en cours de modelage dans l’atelier SculptLab';
  if (w) {
    const v = w.variants.find(x => x.name === w.default) || w.variants[0];
    imageAlt = w.name + ' — ' + (en ? v.nameEn || v.name : v.name);
    if (work[1] === 'oeuvres') {
      type = 'product';
      const page = origin + localized(p, lang),
        param = en ? 'finish' : 'finition';
      ld.push({
        '@context': 'https://schema.org',
        '@type': 'ProductGroup',
        name: w.name,
        productGroupID: w.id.toUpperCase(),
        url: page,
        description: en ? w.descriptionEn || w.description : w.description,
        image: abs(v.image),
        brand: { '@type': 'Brand', name: 'SculptLab' },
        category: 'Sculpture',
        material: en ? 'Hand-painted resin' : 'Résine peinte à la main',
        variesBy: ['https://schema.org/color'],
        height: { '@type': 'QuantitativeValue', value: 30, unitCode: 'CMT' },
        width: { '@type': 'QuantitativeValue', value: 15, unitCode: 'CMT' },
        depth: { '@type': 'QuantitativeValue', value: 15, unitCode: 'CMT' },
        hasVariant: w.variants.map(x => ({
          '@type': 'Product',
          inProductGroupWithID: w.id.toUpperCase(),
          sku: norm(w.id) + '-' + norm(x.name),
          name: w.name + ' — ' + (en ? x.nameEn || x.name : x.name),
          color: en ? x.nameEn || x.name : x.name,
          image: abs(x.image),
          offers: {
            '@type': 'Offer',
            url: page + '?' + param + '=' + encodeURIComponent(x.name),
            price: x.price.toFixed(2),
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@type': 'Organization', name: 'SculptLab' },
            hasMerchantReturnPolicy: returnPolicy,
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: { '@type': 'MonetaryAmount', value: '9.90', currency: 'EUR' },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'FR' },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 7, maxValue: 10, unitCode: 'DAY' },
                transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 4, unitCode: 'DAY' },
              },
            },
          },
        })),
      });
      ld.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Accueil', item: origin + localized('/', lang) },
          {
            '@type': 'ListItem',
            position: 2,
            name: en ? 'The works' : 'Les œuvres',
            item: origin + localized('/collection/', lang),
          },
          { '@type': 'ListItem', position: 3, name: w.name, item: page },
        ],
      });
    }
  }
  if (p === '/') {
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'SculptLab',
      alternateName: 'SculptLab.',
      url: origin + '/',
      logo: abs('/favicon-512x512.png'),
      image: abs('/assets/og/sculptlab.jpg'),
      description: en
        ? 'Contemporary resin sculptures shaped and painted by hand.'
        : 'Sculptures contemporaines en résine façonnées et peintes à la main.',
      email: 'info@sculptlab.fr',
      address: address,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'info@sculptlab.fr',
        availableLanguage: ['French', 'English'],
      },
      hasMerchantReturnPolicy: returnPolicy,
      sameAs: sameAs,
    });
    ld.push({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SculptLab',
      url: origin + '/',
      inLanguage: ['fr', 'en'],
    });
  }
  return { noindex, image, imageAlt, type, ld };
}
function html(result, p, neutral = false) {
  const meta = pageMeta(p, result.lang),
    canonicalPath = p === '/acquerir/' ? '/collection/' : p,
    url = origin + localized(canonicalPath, result.lang),
    en = result.lang === 'en',
    description = result.description.replaceAll('"', '&quot;'),
    title = result.title.replaceAll('"', '&quot;');
  return `<!doctype html>
<html lang="${result.lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${result.title}</title><meta name="description" content="${description}"><meta name="theme-color" content="#f4f4ef"><meta name="robots" content="${meta.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">
<link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"><link rel="icon" href="/favicon.ico" sizes="48x48"><link rel="apple-touch-icon" href="/apple-touch-icon-180x180.png"><link rel="manifest" href="/site.webmanifest">
<link rel="alternate" hreflang="fr" href="${origin + localized(canonicalPath, 'fr')}"><link rel="alternate" hreflang="en" href="${origin + localized(canonicalPath, 'en')}"><link rel="alternate" hreflang="x-default" href="${origin + localized(canonicalPath, 'en')}"><link rel="canonical" href="${url}">
<meta property="og:site_name" content="SculptLab"><meta property="og:type" content="${meta.type}"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}"><meta property="og:image" content="${abs(meta.image)}"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${meta.imageAlt.replaceAll('"', '&quot;')}"><meta property="og:locale" content="${en ? 'en_US' : 'fr_FR'}"><meta property="og:locale:alternate" content="${en ? 'fr_FR' : 'en_US'}"><meta name="twitter:card" content="summary_large_image">
${neutral && p !== '/' ? '' : meta.ld.map(jsonLd).join('')}
${neutral ? '<script src="/language.js"></script>' : ''}<script src="/arrival.js"></script>${p === '/' ? `<link rel="preload" href="${heroImage}" as="image" fetchpriority="high">` : ''}<link rel="preload" href="/assets/display.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/style.css"><script src="/data.js" defer></script><script src="/legal.js" defer></script><script src="/consent.js" defer></script><script src="/privacy-ui.js" defer></script><script src="/app.js" defer></script><script src="/cursor.js" defer></script></head>
<body id="top"><a class="skip-link" href="#main">${result.lang === 'en' ? 'Skip to content' : 'Aller au contenu'}</a><div id="app">${result.html}</div></body></html>`;
}
function write(route, content) {
  const file = path.join(root, route, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
for (const p of paths) {
  for (const lang of ['fr', 'en']) write(localized(p, lang), html(generate(localized(p, lang)), p));
  const fr = generate(localized(p, 'fr'));
  write(p, html(fr, p, true));
}

const works = vm.runInContext('WORKS', generate('/fr/').context);
let count = 0;
for (const w of Object.values(works))
  for (const v of w.variants)
    for (const lang of ['fr', 'en']) {
      const query = '?' + (lang === 'fr' ? 'finition' : 'finish') + '=' + encodeURIComponent(v.name);
      const product = generate(localized('/oeuvres/' + w.id + '/', lang), query);
      generate(localized('/acquerir/' + w.id + '/', lang), query);
      assert.equal(vm.runInContext('selectedVariant(WORKS.' + w.id + ').name', product.context), v.name);
      assert.ok(product.html.includes(v.image), 'Selected finish image');
      const target = vm.runInContext('switchUrl(' + JSON.stringify(lang === 'fr' ? 'en' : 'fr') + ')', product.context);
      assert.ok(
        target.startsWith(localized('/oeuvres/' + w.id + '/', lang === 'fr' ? 'en' : 'fr')),
        'Language switch keeps sculpture'
      );
      assert.equal(
        new URL(origin + target).searchParams.get(lang === 'fr' ? 'finish' : 'finition'),
        v.name,
        'Language switch keeps finish'
      );
      for (const photo of v.photos) assert.ok(fs.existsSync(path.join(root, photo.src)), 'Gallery image ' + photo.src);
      count++;
    }

function redirect(pathname, browser, stored, search = '', hash = '', storageThrows = false) {
  let result = null;
  const context = {
    location: {
      pathname,
      search,
      hash,
      replace(url) {
        result = url;
      },
    },
    navigator: { languages: [browser], language: browser },
    localStorage: {
      getItem() {
        if (storageThrows) throw Error('Unavailable');
        return stored;
      },
    },
  };
  vm.runInNewContext(languageSource, context);
  return result;
}
assert.equal(redirect('/', 'fr-FR', null), null);
assert.equal(redirect('/', 'fr-CA', null), null);
assert.equal(redirect('/', 'en-US', null), '/en/');
assert.equal(redirect('/', 'de-DE', null), '/en/');
assert.equal(redirect('/', 'ja-JP', 'fr'), null);
assert.equal(redirect('/', 'fr-FR', 'en'), '/en/');
assert.equal(redirect('/en/works/io/', 'fr-FR', 'fr'), null);
assert.equal(redirect('/fr/oeuvres/io/', 'en-US', 'en'), null);
assert.equal(
  redirect('/oeuvres/io/', 'en-GB', null, '?finition=Sorbet', '#histoire'),
  '/en/works/io/?finition=Sorbet#histoire'
);
assert.equal(redirect('/', 'fr-FR', null, '', '', true), null);
assert.equal(redirect('/', 'de-DE', null, '', '', true), '/en/');

// Real gallery handlers: the second photo changes the image without changing finish.
const g = generate('/en/works/io/', '?finish=Sorbet');
const elements = { 'product-image': {}, 'photo-status': {} };
g.context.document.getElementById = id => elements[id] || { classList: { remove() {} } };
g.context.document.querySelectorAll = () => [];
g.context.document.querySelector = () => null;
vm.runInContext('setPhoto(1)', g.context);
assert.equal(elements['product-image'].src, '/assets/iov1a.webp');
const sorbetPhotos = works.io.variants.find(v => v.name === 'Sorbet').photos.length;
assert.equal(elements['photo-status'].textContent, 'Photo 2 / ' + sorbetPhotos);
assert.equal(vm.runInContext('selectedVariant(WORKS.io).name', g.context), 'Sorbet');
vm.runInContext('setPhoto(' + sorbetPhotos + ')', g.context); // past the last view: back to the first
assert.equal(elements['product-image'].src, works.io.variants.find(v => v.name === 'Sorbet').image);

// Every mobile finish is visible in its edition, including the last unique pieces.
// Exercise every button in both languages, independently of the desktop selector.
for (const lang of ['fr', 'en'])
  for (const work of Object.values(works)) {
    const mobile = generate(localized('/oeuvres/' + work.id + '/', lang));
    const selectors = vm.runInContext(
      'mobileFinishes(WORKS.' + work.id + ',selectedVariant(WORKS.' + work.id + '))',
      mobile.context
    );
    assert.equal(
      (selectors.match(/class="mobile-variant"/g) || []).length,
      work.variants.length,
      'All mobile finishes are visible: ' + work.id
    );
    assert.equal((selectors.match(/aria-pressed="true"/g) || []).length, 1);
    assert.ok(!/<select|<details|hidden/.test(selectors), 'Mobile editions are directly visible');
    const groups = Array.from(
      selectors.matchAll(/<fieldset class="mobile-edition" data-edition="([^"]+)">([\s\S]*?)<\/fieldset>/g)
    );
    assert.deepEqual(
      groups.map(m => m[1]),
      ['open', 'limited', 'unique']
    );
    for (const [, edition, markup] of groups) {
      const variants = work.variants.filter(v => v.edition === edition);
      assert.equal(
        (markup.match(/class="mobile-variant"/g) || []).length,
        variants.length,
        'Complete edition ' + work.id + ' ' + edition
      );
      const label = vm.runInContext('editionName(' + JSON.stringify(edition) + ')', mobile.context);
      assert.ok(markup.includes('<legend>' + label + '</legend>'), 'Visible edition label');
      for (const v of variants) {
        const name = vm.runInContext('esc(' + JSON.stringify(v.name) + ')', mobile.context);
        assert.ok(markup.includes('data-variant="' + name + '"'), 'Finish in correct edition: ' + v.name);
        assert.ok(
          markup.includes('src="' + v.image.replace('/assets/', '/assets/thumbs/') + '"'),
          'Finish has its thumbnail'
        );
      }
    }
    let scrolled = false,
      focused = false,
      selected;
    mobile.context.window.scrollTo = () => {
      scrolled = true;
    };
    mobile.context.history = {
      replaceState(state, title, url) {
        const next = new URL(url, origin);
        Object.assign(mobile.context.location, { pathname: next.pathname, search: next.search, href: next.href });
      },
    };
    mobile.context.document.querySelector = () => null;
    mobile.context.document.querySelectorAll = () => [
      {
        dataset: { variant: selected.name },
        focus(options) {
          focused = options.preventScroll;
        },
      },
    ];
    for (const v of work.variants) {
      selected = v;
      focused = false;
      const button = { dataset: { work: work.id, variant: v.name }, classList: { contains: () => true } };
      mobile.listeners.click({ target: { closest: selector => (selector === '[data-variant]' ? button : null) } });
      assert.equal(vm.runInContext('selectedVariant(WORKS.' + work.id + ').name', mobile.context), v.name);
      const updated = mobile.context.document.getElementById('app').innerHTML;
      assert.ok(updated.includes('id="product-image" src="' + v.image + '"'), 'Mobile preview updates: ' + v.name);
      const summary = updated.match(/<div class="preview-selection"[^>]*>([\s\S]*?)<\/div>/)[1];
      const price = vm.runInContext('money(' + JSON.stringify(v.price) + ')', mobile.context);
      assert.ok(summary.includes(price), 'Visible preview price updates: ' + v.name);
      assert.ok(focused, 'Focus remains on selected finish');
      assert.equal(scrolled, false, 'No return to page top');
    }
  }

// Colour section of the home page: three steps whose finishes exist and are not already shown by the home loops.
const featureHome = generate('/');
const featureData = JSON.parse(
  vm.runInContext(
    'JSON.stringify({ steps: featureSteps.map((s, i) => ({ ...s, image: featureStep(i).v?.image })), loops: homeFinishNames, hero: heroItems })',
    featureHome.context
  )
);
assert.deepEqual(
  featureData.steps.map(s => s.tone),
  ['blue', 'acid', 'ink'],
  'Colour section uses the three SculptLab colours'
);
for (const s of featureData.steps) {
  assert.ok(s.image && fs.existsSync(path.join(root, s.image)), 'Colour section finish exists: ' + s.id + ' ' + s.name);
  assert.ok(
    !featureData.loops[s.id].includes(s.name) && !featureData.hero.some(h => h.id === s.id && h.name === s.name),
    'Colour section finish is not already looping on the home page: ' + s.id + ' ' + s.name
  );
}
assert.deepEqual(
  Array.from(featureHome.html.matchAll(/data-feature-image="(\d)"/g), m => m[1]),
  ['0', '1', '2'],
  'Colour section holds its three photographs'
);
assert.ok(featureHome.html.includes('Découvrir Enigma Doodle'), 'Colour section link names the first finish');
assert.ok(generate('/en/').html.includes('Discover Enigma Doodle'), 'Colour section link is translated');

// Horizontal swiping changes the featured work; vertical scrolling does not.
const featured = generate('/fr/');
const heroElements = {
  'hero-art': {},
  'hero-stage': { style: {} },
  'hero-name': {},
  'hero-finish': {},
  'hero-link': {},
};
featured.context.document.getElementById = id => heroElements[id];
featured.context.document.querySelectorAll = () => [];
const heroTarget = { closest: s => (s.includes('.hero-stage') ? {} : null) };
featured.listeners.touchstart({ target: heroTarget, touches: [{ clientX: 240, clientY: 120 }] });
featured.listeners.touchend({ changedTouches: [{ clientX: 140, clientY: 125 }] });
assert.equal(heroElements['hero-name'].textContent, 'Io');
assert.ok(heroElements['hero-link'].href.includes('/oeuvres/io/'));
featured.listeners.touchstart({ target: heroTarget, touches: [{ clientX: 240, clientY: 120 }] });
featured.listeners.touchend({ changedTouches: [{ clientX: 230, clientY: 260 }] });
assert.equal(heroElements['hero-name'].textContent, 'Io');

// Palettes reveal all finishes in place, keep one selection and preserve the image links.
function mockCard(preview, work, prices = true) {
  let focused = null;
  const nodes = {
    '.work-visual>img': {},
    '.work-visual': {
      setAttribute(k, v) {
        this[k] = v;
      },
    },
    '.card-finish': {},
    '.card-price': prices ? {} : null,
    '.work-finish-controls': {},
  };
  const links = [false, false, true].map(story => ({ classList: { contains: () => story } }));
  const swatches = work.variants.map(v => ({
    dataset: { work: work.id, cardVariant: v.name },
    focus(options) {
      focused = { name: v.name, preventScroll: options.preventScroll };
    },
    closest: s => (s === '.work-card' ? card : null),
  }));
  const toggle = {
    dataset: { paletteToggle: work.id },
    focus(options) {
      focused = { name: 'toggle', preventScroll: options.preventScroll };
    },
    closest: s => (s === '.work-card' ? card : null),
  };
  nodes['[data-palette-toggle]'] = toggle;
  const card = { querySelector: s => nodes[s] || null, querySelectorAll: s => (s === 'a' ? links : swatches) };
  return { card, nodes, links, swatches, toggle, focus: () => focused };
}
for (const lang of ['fr', 'en'])
  for (const pagePath of ['/', '/collection/'])
    for (const work of Object.values(works)) {
      const preview = generate(localized(pagePath, lang)),
        home = pagePath === '/';
      if (home) assert.ok(!/card-price|€/.test(preview.html), 'Home has no prices, including swatch labels');
      const h = mockCard(preview, work, !home);
      const press = button =>
        preview.listeners.click({
          target: {
            closest: s =>
              s === '[data-palette-toggle]' && button === h.toggle
                ? button
                : s === '[data-card-variant]' && button !== h.toggle
                  ? button
                  : null,
          },
        });
      const closed = vm.runInContext(
        'cardFinishControls(WORKS.' + work.id + ',selectedVariant(WORKS.' + work.id + '))',
        preview.context
      );
      assert.equal((closed.match(/class="work-swatch"/g) || []).length, 4);
      assert.ok(closed.includes('aria-expanded="false"'));
      assert.ok(!closed.includes('<select'), 'No dropdown');
      press(h.toggle);
      let controls = h.nodes['.work-finish-controls'].innerHTML;
      assert.ok(controls.includes('aria-expanded="true"'));
      assert.equal(h.focus().name, 'toggle');
      assert.ok(h.focus().preventScroll);
      const groups = Array.from(
        controls.matchAll(/<fieldset class="palette-edition" data-edition="([^"]+)">([\s\S]*?)<\/fieldset>/g)
      );
      assert.deepEqual(
        groups.map(g => g[1]),
        ['open', 'limited', 'unique']
      );
      for (const [, edition, markup] of groups)
        assert.equal(
          (markup.match(/class="work-swatch"/g) || []).length,
          work.variants.filter(v => v.edition === edition).length
        );
      for (const variant of work.variants) {
        press(h.swatches.find(b => b.dataset.cardVariant === variant.name));
        assert.equal(h.nodes['.work-visual>img'].src, variant.image);
        assert.equal(h.nodes['.card-finish'].textContent, lang === 'fr' ? variant.name : variant.nameEn);
        assert.equal(h.focus().name, variant.name);
        assert.ok(h.focus().preventScroll);
        controls = h.nodes['.work-finish-controls'].innerHTML;
        assert.equal(
          (controls.match(/class="work-swatch"/g) || []).length,
          work.variants.length,
          'All finishes stay visible'
        );
        assert.equal((controls.match(/aria-pressed="true"/g) || []).length, 1, 'Exactly one selected colour');
        assert.ok(controls.includes('aria-expanded="true"'), 'Palette stays open while comparing colours');
        if (home) assert.ok(!controls.includes('€'), 'Expanded home palette has no prices');
        else assert.ok(h.nodes['.card-price'].textContent, 'Collection price remains available');
        for (const link of h.links) {
          const target = new URL(link.href, origin);
          assert.equal(target.pathname, localized('/oeuvres/' + work.id + '/', lang));
          assert.equal(target.searchParams.get(lang === 'fr' ? 'finition' : 'finish'), variant.name);
        }
      }
      assert.equal(new URL(h.links[2].href, origin).hash, '#histoire');
      press(h.toggle);
      controls = h.nodes['.work-finish-controls'].innerHTML;
      assert.ok(controls.includes('aria-expanded="false"'));
      assert.equal((controls.match(/class="work-swatch"/g) || []).length, 4);
      assert.equal((controls.match(/aria-pressed="true"/g) || []).length, 1);
      assert.equal(preview.context.location.pathname, localized(pagePath, lang), 'Selection does not navigate');
    }
// Opening another palette closes the previous one; Escape closes and restores focus.
const palettes = generate('/fr/');
const paletteCards = Object.fromEntries(Object.values(works).map(w => [w.id, mockCard(palettes, w, false)]));
palettes.context.document.querySelector = s =>
  Object.entries(paletteCards)
    .flatMap(([id, h]) => [
      [`[data-card-work="${id}"]`, h.card],
      [`[data-palette-toggle="${id}"]`, h.toggle],
    ])
    .find(([selector]) => selector === s)?.[1] || null;
for (const id of ['io', 'enigma'])
  palettes.listeners.click({
    target: { closest: s => (s === '[data-palette-toggle]' ? paletteCards[id].toggle : null) },
  });
assert.ok(paletteCards.io.nodes['.work-finish-controls'].innerHTML.includes('aria-expanded="false"'));
assert.ok(paletteCards.enigma.nodes['.work-finish-controls'].innerHTML.includes('aria-expanded="true"'));
palettes.listeners.keydown({ key: 'Escape', target: { closest: () => null }, preventDefault() {} });
assert.ok(paletteCards.enigma.nodes['.work-finish-controls'].innerHTML.includes('aria-expanded="false"'));
assert.equal(paletteCards.enigma.focus().name, 'toggle');

// Home autoplay loops even under a desktop pointer; manual actions reset its countdown.
const auto = generate('/fr/');
let clock = 0,
  timer = null,
  timerCleared = false;
auto.context.Date = class extends Date {
  static now() {
    return clock;
  }
};
const pendingImages = [];
auto.context.window.Image = class {
  set src(value) {
    this.url = value;
    pendingImages.push(this);
  }
};
auto.context.window.innerHeight = 900;
auto.context.window.setInterval = cb => {
  timer = cb;
  return 1;
};
auto.context.window.clearInterval = () => {
  timerCleared = true;
  timer = null;
};
const rect = { top: 50, bottom: 450, height: 400, width: 300 };
const autoNodes = { 'hero-art': {}, 'hero-stage': { style: {} }, 'hero-name': {}, 'hero-finish': {}, 'hero-link': {} };
const autoCards = Object.fromEntries(
  Object.values(works).map(w => {
    const nodes = {
      '.work-visual>img': {},
      '.work-visual': {
        getBoundingClientRect: () => rect,
        setAttribute(k, v) {
          this[k] = v;
        },
      },
      '.card-finish': {},
      '.card-price': null,
      '.work-finish-controls': {},
    };
    const links = [{ classList: { contains: () => false } }, { classList: { contains: () => true } }];
    const toggle = { dataset: { paletteToggle: w.id }, focus() {}, closest: () => card };
    nodes['[data-palette-toggle]'] = toggle;
    const card = {
      dataset: { slideshowRoot: w.id },
      nodes,
      links,
      hovered: true,
      querySelector: s => nodes[s] || null,
      querySelectorAll: s =>
        s === 'a' ? links : w.variants.map(v => ({ dataset: { cardVariant: v.name }, focus() {} })),
      contains: () => false,
      matches() {
        return this.hovered;
      },
    };
    return [w.id, card];
  })
);
const heroRoot = {
  dataset: { slideshowRoot: 'hero' },
  querySelector: () => null,
  getBoundingClientRect: () => rect,
  contains: () => false,
  matches: () => true,
};
auto.context.document.getElementById = id => autoNodes[id];
auto.context.document.querySelector = () => null;
auto.context.document.querySelectorAll = s =>
  s === '[data-slideshow-root]' ? [heroRoot, ...Object.values(autoCards)] : [];
vm.runInContext('setupHomeSlides()', auto.context);
function advance(ms) {
  clock += ms;
  timer?.();
  for (const image of pendingImages.splice(0)) image.onload();
}
advance(6000);
assert.equal(autoNodes['hero-name'].textContent, 'Io');
advance(6000);
assert.equal(autoNodes['hero-name'].textContent, 'Za’mu');
for (const w of Object.values(works)) {
  const card = autoCards[w.id],
    chosen = vm.runInContext('cardChoices.' + w.id, auto.context),
    v = w.variants.find(v => v.name === chosen);
  assert.notEqual(v.name, w.default, 'Each card automatically previews another finish');
  assert.equal(card.nodes['.work-visual>img'].src, v.image);
  assert.equal(card.nodes['.card-finish'].textContent, v.name);
  assert.equal(
    new URL(card.links[0].href, origin).searchParams.get('finition'),
    v.name,
    'Card link follows the displayed finish'
  );
  assert.ok(
    card.nodes['.work-finish-controls'].innerHTML.includes('finish-more-mark'),
    'Multicolour + remains available'
  );
}
advance(6000);
assert.equal(autoNodes['hero-name'].textContent, 'Enigma', '03 loops back to 01');
assert.ok(!auto.html.includes('slideshow-toggle'), 'No unsolicited pause controls');
const manual = works.enigma.variants.find(v => v.name === 'Pixel');
const autoToggle = autoCards.enigma.querySelector('[data-palette-toggle]');
auto.listeners.click({ target: { closest: s => (s === '[data-palette-toggle]' ? autoToggle : null) } });
const autoChoice = { dataset: { work: 'enigma', cardVariant: manual.name }, closest: () => autoCards.enigma };
auto.listeners.click({ target: { closest: s => (s === '[data-card-variant]' ? autoChoice : null) } });
advance(12000);
assert.equal(
  autoCards.enigma.nodes['.work-visual>img'].src,
  manual.image,
  'Image stays stable while the palette is open'
);
auto.listeners.click({ target: { closest: s => (s === '[data-palette-toggle]' ? autoToggle : null) } });
advance(4000);
assert.equal(autoCards.enigma.nodes['.work-visual>img'].src, manual.image, 'Manual choice gets time to be seen');
advance(6000);
assert.notEqual(autoCards.enigma.nodes['.work-visual>img'].src, manual.image, 'Loop resumes without an extra control');
const snapshot = JSON.stringify(autoNodes);
auto.context.document.hidden = true;
advance(12000);
assert.equal(JSON.stringify(autoNodes), snapshot, 'Hidden tab stays idle');
auto.context.document.hidden = false;
rect.top = 1000;
rect.bottom = 1400;
advance(12000);
assert.equal(JSON.stringify(autoNodes), snapshot, 'Offscreen slides stay idle');
rect.top = 50;
rect.bottom = 450;
vm.runInContext('reducedMotion.matches=true;setupHomeSlides()', auto.context);
assert.equal(typeof timer, 'function', 'Reduced motion uses still changes, without animation');
assert.ok(timerCleared);
advance(6000);
assert.notEqual(JSON.stringify(autoNodes), snapshot);
vm.runInContext('reducedMotion.matches=false;setupHomeSlides()', auto.context);
const beforeNavigation = JSON.stringify(autoNodes);
clock += 12000;
timer();
assert.ok(pendingImages.length > 0);
auto.context.location.pathname = '/fr/contact/';
vm.runInContext('setupHomeSlides()', auto.context);
for (const image of pendingImages.splice(0)) image.onload();
assert.equal(JSON.stringify(autoNodes), beforeNavigation, 'Late image loads cannot update a different page');
assert.equal(timer, null, 'Navigation cleans up the timer');

// Galleries belong to work pages; acquisition pages keep one signed portrait.
for (const lang of ['fr', 'en'])
  for (const work of Object.values(works))
    for (const v of work.variants) {
      for (const base of ['oeuvres', 'acquerir']) {
        const page = generate(
          localized('/' + base + '/' + work.id + '/', lang),
          '?finish=' + encodeURIComponent(v.name)
        );
        if (base === 'acquerir') {
          assert.ok(
            !/product-gallery|photo-thumbnails|data-photo-step/.test(page.html),
            'No gallery in the order summary'
          );
          const portrait = page.html.match(/<figure class="order-portrait">([\s\S]*?)<\/figure>/)[1];
          assert.equal((portrait.match(/<img /g) || []).length, 1, 'One order image');
          assert.ok(portrait.includes('src="' + v.image + '"'), 'Order portrait follows the selected finish');
          const identification = page.html.match(/<div class="order-identification">([\s\S]*?)<\/div>/)[1];
          assert.ok(identification.includes('artist-signature'), 'Signature belongs to the work identification');
          continue;
        }
        assert.equal((page.html.match(/id="product-image"/g) || []).length, 1, 'One primary gallery');
        const thumbnails = page.html.match(/<div class="photo-thumbnails"[\s\S]*?<\/div>/)[0];
        assert.equal(
          (thumbnails.match(/data-photo="/g) || []).length,
          v.photos.length,
          'Every supplied angle has a thumbnail'
        );
        for (const photo of v.photos) assert.ok(thumbnails.includes(photo.src.replace('/assets/', '/assets/thumbs/')));
        const controls = page.html.match(/<div class="photo-arrows">([\s\S]*?)<\/div>/)[1];
        assert.equal((controls.match(/data-photo-step=/g) || []).length, 2);
        assert.equal(
          (controls.match(/disabled/g) || []).length,
          v.photos.length === 1 ? 2 : 0,
          'Navigation is active when another view exists'
        );
      }
    }

// Provider responses are simulated: these checks never send real email.
for (const lang of ['fr', 'en'])
  for (const outcome of ['success', 'rejected', 'network']) {
    const contact = generate(localized('/contact/', lang));
    const values = {
      name: 'Camille Test',
      email: 'visiteur@example.test',
      message: 'Bonjour, Io & Za’mu ?\nMerci !',
      _honey: '',
    };
    const button = { innerHTML: 'Send', disabled: false },
      status = { dataset: {}, textContent: '' },
      inputs = Object.keys(values).map(name => ({ name, disabled: false }));
    let resets = 0,
      calls = 0,
      request,
      finishRequest,
      timeoutCleared = false;
    const form = {
      id: 'contact-form',
      reportValidity: () => true,
      querySelector: s => (s === '#contact-status' ? status : button),
      querySelectorAll: () => inputs,
      reset() {
        resets++;
      },
      setAttribute() {},
      removeAttribute() {},
    };
    contact.context.document.getElementById = id => (id === 'contact-form' ? form : null);
    contact.context.FormData = class {
      constructor() {
        this.values = { ...values };
      }
      get(key) {
        return this.values[key];
      }
    };
    contact.context.AbortController = AbortController;
    contact.context.window.setTimeout = () => 1;
    contact.context.window.clearTimeout = () => {
      timeoutCleared = true;
    };
    contact.context.fetch = (url, options) => {
      calls++;
      request = { url, options };
      return new Promise((resolve, reject) => {
        finishRequest = () =>
          outcome === 'network'
            ? reject(Error('Network unavailable'))
            : resolve({ ok: true, json: async () => ({ success: outcome === 'success' ? 'true' : false }) });
      });
    };
    const first = contact.listeners.submit({ target: form, preventDefault() {} });
    assert.ok(button.disabled);
    assert.ok(inputs.every(i => i.disabled));
    await contact.listeners.submit({ target: form, preventDefault() {} });
    assert.equal(calls, 1, 'Double taps do not send twice');
    assert.equal(request.url, 'https://formsubmit.co/ajax/info@sculptlab.fr');
    assert.equal(request.options.method, 'POST');
    assert.equal(request.options.body.get('message'), values.message);
    assert.equal(request.options.body.get('email'), values.email);
    assert.ok(
      contact.html.includes('action="https://formsubmit.co/info@sculptlab.fr" method="POST"'),
      'Original provider remains the native fallback'
    );
    finishRequest();
    await first;
    assert.equal(status.dataset.state, outcome === 'success' ? 'success' : 'error');
    assert.equal(resets, outcome === 'success' ? 1 : 0, 'Failed requests preserve the message');
    assert.ok(!button.disabled);
    assert.ok(inputs.every(i => !i.disabled));
    assert.ok(timeoutCleared);
    assert.ok(
      status.textContent.includes(
        lang === 'fr' ? (outcome === 'success' ? 'envoyé' : 'conservé') : outcome === 'success' ? 'sent' : 'kept'
      )
    );
    const checkout = generate(localized('/acquerir/io/', lang));
    assert.ok(checkout.html.includes(lang === 'fr' ? 'Finaliser ma commande' : 'Complete my order'));
    assert.ok(
      checkout.html.includes('id="checkout-button"') && !/_summary\.html/.test(checkout.html),
      'Order button uses the payment Worker, not the old summary pages'
    );
  }

for (const lang of ['fr', 'en'])
  for (const [, route, sections] of [
    ['cgv', '/cgv/', 10],
    ['legal', '/mentions-legales/', 7],
  ]) {
    const page = generate(localized(route, lang));
    const article = page.html.match(/<article class="legal">([\s\S]*?)<\/article>/)[1];
    assert.equal((article.match(/<h2>/g) || []).length, sections, 'Complete legal document');
    assert.ok(!/https?:\/\/(?:www\.)?sculptlab\.fr/.test(article), 'Legal content stays on this site');
  }

const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
assert.ok(!/rotate\(/.test(css), 'No image rotation');
for (const u of css.matchAll(/url\(['"]?(\/[^'")]+)/g))
  assert.ok(fs.existsSync(path.join(root, u[1])), 'Missing CSS asset');

// Arrival lifecycle: one session, immediate interaction, slow images and reduced motion.
const arrivalSource = fs.readFileSync(path.join(root, 'arrival.js'), 'utf8');
function arrivalHarness({
  pathname = '/fr/',
  reduced = false,
  complete = true,
  storage = new Map(),
  storageBlocked = false,
  supported = true,
  hash = '',
} = {}) {
  const classes = new Set(),
    timers = new Map(),
    events = {},
    imageEvents = {};
  let sequence = 0;
  const image = {
    complete,
    naturalWidth: complete ? 900 : 0,
    addEventListener(type, fn) {
      imageEvents[type] = fn;
    },
    removeEventListener(type, fn) {
      if (imageEvents[type] === fn) delete imageEvents[type];
    },
  };
  const document = {
    hidden: false,
    documentElement: {
      classList: {
        add(...names) {
          names.forEach(n => classes.add(n));
        },
        remove(...names) {
          names.forEach(n => classes.delete(n));
        },
      },
    },
    querySelector: () => image,
    addEventListener(type, fn) {
      events[type] = fn;
    },
  };
  const media = {
    matches: reduced,
    addEventListener(type, fn) {
      events.motion = fn;
    },
  };
  const window = {
    CSS: { supports: () => supported },
    matchMedia: () => media,
    scrollY: 0,
    sessionStorage: {
      getItem: key => {
        if (storageBlocked) throw Error('Blocked');
        return storage.get(key);
      },
      setItem(key, value) {
        if (storageBlocked) throw Error('Blocked');
        storage.set(key, value);
      },
    },
    setTimeout(fn, delay) {
      const id = ++sequence;
      timers.set(id, { fn, delay });
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    },
    addEventListener(type, fn) {
      events[type] = fn;
    },
  };
  const location = { pathname, hash };
  vm.runInNewContext(arrivalSource, { window, document, location });
  const start = () => window.sculptlabArrival.start();
  const expire = () => {
    for (const [id, timer] of [...timers]) {
      if (timers.has(id)) {
        timers.delete(id);
        timer.fn();
      }
    }
  };
  return { classes, timers, events, imageEvents, media, window, document, location, storage, start, expire };
}
for (const pathname of ['/fr/', '/en/']) {
  const a = arrivalHarness({ pathname });
  assert.ok(a.classes.has('arrival-pending'), 'Prepared before first paint');
  a.start();
  assert.ok(a.classes.has('arrival-playing'));
  assert.ok(!a.classes.has('arrival-pending'));
  assert.equal([...a.timers.values()][0].delay, 1450, 'Brief, bounded animation');
  a.expire();
  assert.equal(a.classes.size, 0, 'No animation styles remain afterwards');
  a.start();
  assert.equal(a.classes.size, 0, 'Returning home does not repeat the entrance');
  const reload = arrivalHarness({ pathname, storage: a.storage });
  reload.start();
  assert.equal(reload.classes.size, 0, 'Refresh and language changes respect the session');
}
for (const options of [{ reduced: true }, { supported: false }, { pathname: '/fr/collection/' }, { hash: '#io' }]) {
  const a = arrivalHarness(options);
  a.start();
  assert.equal(a.classes.size, 0, 'Direct rendering when animation should be skipped');
  assert.equal(a.timers.size, 0);
}
for (const event of ['pointerdown', 'touchstart', 'wheel', 'keydown', 'scroll']) {
  const a = arrivalHarness();
  a.start();
  a.events[event]({});
  assert.equal(a.classes.size, 0, 'Interaction ends the effect immediately');
  assert.equal(a.timers.size, 0);
}
const waiting = arrivalHarness({ complete: false });
waiting.start();
assert.ok(waiting.classes.has('arrival-pending'));
const lateLoad = waiting.imageEvents.load;
waiting.location.pathname = '/fr/contact/';
waiting.start();
lateLoad();
assert.equal(waiting.classes.size, 0, 'Late photo cannot animate another page');
const slow = arrivalHarness({ complete: false });
slow.start();
slow.expire();
assert.equal(slow.classes.size, 0, 'Slow or failed imagery never holds the page');
assert.equal(Object.keys(slow.imageEvents).length, 0);
const loaded = arrivalHarness({ complete: false });
loaded.start();
loaded.imageEvents.load();
assert.ok(loaded.classes.has('arrival-playing'), 'Reveal begins when the photograph arrives');
loaded.media.matches = true;
loaded.events.motion();
assert.equal(loaded.classes.size, 0, 'Changing reduced-motion preference stops the effect');
const brokenApp = arrivalHarness();
brokenApp.expire();
assert.equal(brokenApp.classes.size, 0, 'Static content remains available if application initialisation fails');
const blocked = arrivalHarness({ storageBlocked: true });
blocked.start();
blocked.expire();
blocked.start();
assert.equal(blocked.classes.size, 0, 'Blocked storage still remembers within the page');
const restored = arrivalHarness();
restored.start();
restored.events.pageshow({ persisted: true });
assert.equal(restored.classes.size, 0, 'History cache restores an unobscured page');
console.log(
  'Arrival checked in FR/EN: once per session, image readiness, instant interaction, navigation cleanup, reduced motion and static fallback.'
);
for (const lang of ['fr', 'en']) {
  const consent = generate(localized('/', lang));
  consent.context.document.createElement = () => ({});
  consent.context.document.head = { appendChild() {} };
  const read = code => vm.runInContext(code, consent.context);
  read('showCookiePanel()');
  assert.ok(!read('cookiePanel()').includes('tabindex="-1" hidden'));
  assert.equal((read('cookiePanel()').match(/<button /g) || []).length, 2, 'Exactly the two original choices');
  assert.ok(!/customize|cookie-options|<h2/.test(read('cookiePanel()')), 'No expanded settings or heading');
  const click = action =>
    consent.listeners.click({
      target: { closest: s => (s === '[data-cookie-action]' ? { dataset: { cookieAction: action } } : null) },
    });
  click('reject');
  assert.equal(read('window.sculptlabConsent.getChoice().analytics'), false, 'Refuser / Decline saves a refusal');
  read('showCookiePanel()');
  click('accept');
  assert.equal(read('window.sculptlabConsent.getChoice().analytics'), true);
  assert.equal(read('cookiePanelOpen'), false);
  read('showCookiePanel({isConnected:true,focus(){}})');
  click('reject');
  assert.equal(
    read('window.sculptlabConsent.getChoice().analytics'),
    false,
    'Reopening permits withdrawal with the same Refuser button'
  );
  read('showCookiePanel()');
  consent.listeners.keydown({
    key: 'Escape',
    target: { closest: s => (s === '#cookie-panel' ? {} : null) },
    preventDefault() {},
  });
  assert.equal(read('window.sculptlabConsent.getChoice().analytics'), false, 'Escape never grants consent');
  assert.ok(consent.html.includes('data-cookie-open'), 'Every footer exposes the settings');
  assert.ok(consent.html.includes(lang === 'fr' ? 'Refuser' : 'Decline'));
  assert.ok(consent.html.includes('data-cookie-action="accept">OK</button>'));
  assert.ok(
    consent.html.includes(
      lang === 'fr'
        ? 'Nous utilisons des cookies pour améliorer votre expérience.'
        : 'We use cookies to improve your experience.'
    )
  );
}
await import('./verify-consent.mjs');

// ---------- Publication files for sculptlab.fr (GitHub Pages) ----------
// Sitemap: indexable FR/EN pages with their language alternates (order pages, the /acquerir/ duplicate and the thank-you page are excluded).
function sitemapImages(p) {
  const m = p.match(/^\/oeuvres\/(io|zamu|enigma)\/$/);
  if (!m) return '';
  const w = WORKS_DATA[m[1]];
  // Temporary placeholder views ("placeholder": true in data.js) are not submitted to search engines.
  return [
    ...new Set(w.variants.flatMap(v => [v.image, ...(v.photos || []).filter(x => !x.placeholder).map(x => x.src)])),
  ]
    .map(src => `<image:image><image:loc>${origin + src}</image:loc></image:image>`)
    .join('');
}
const indexable = paths.filter(p => !/^\/acquerir\//.test(p) && p !== '/merci/');
// Date of the last change to the site's content, from Git when available (otherwise the build date).
const lastmod = (() => {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', 'app.js', 'data.js', 'legal.js', 'style.css'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out)) return out;
  } catch {}
  return new Date().toISOString().slice(0, 10);
})();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${indexable.flatMap(p => ['fr', 'en'].map(lang => `<url><loc>${origin + localized(p, lang)}</loc><lastmod>${lastmod}</lastmod><xhtml:link rel="alternate" hreflang="fr" href="${origin + localized(p, 'fr')}"/><xhtml:link rel="alternate" hreflang="en" href="${origin + localized(p, 'en')}"/><xhtml:link rel="alternate" hreflang="x-default" href="${origin + localized(p, 'en')}"/>${sitemapImages(p)}</url>`)).join('\n')}
</urlset>
`;
fs.writeFileSync(path.join(root, 'sitemap.xml'), sitemap);
fs.writeFileSync(
  path.join(root, 'robots.txt'),
  `User-agent: *
Allow: /

Sitemap: ${origin}/sitemap.xml
Sitemap: ${origin}/sitemap-anciennes-adresses.xml
`
);

// Former addresses of sculptlab.fr (sitemap, Google, Merchant Center, Stripe return): each one sends visitors to its new page.
// Product pages keep the chosen colour (?couleur=…); without one they show the colour the old page showed by default.
const oldDefaults = {
  io1: ['io', 'Sorbet'],
  io2: ['io', 'Outremer'],
  zamu1: ['zamu', 'Brume'],
  zamu2: ['zamu', 'Primaire'],
  enigma1: ['enigma', 'Nuit'],
  enigma2: ['enigma', 'Aube'],
};
const legacyPages = {
  'about.html': '/atelier/',
  'contact.html': '/contact/',
  'purchase.html': '/collection/',
  'cgv.html': '/cgv/',
  'mentions_legales.html': '/mentions-legales/',
};
for (const [key, [id, colour]] of Object.entries(oldDefaults)) {
  legacyPages[key + '.html'] = { path: '/oeuvres/' + id + '/', id, colour };
  legacyPages[key + '_summary.html'] = { path: '/acquerir/' + id + '/', id, colour };
}
function legacyPage(target, lang, script, fallback) {
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><title>SculptLab</title><meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="canonical" href="${origin + fallback.split('?')[0]}"><meta http-equiv="refresh" content="0; url=${fallback}">
<script>${script}</script></head>
<body style="font:16px/1.6 Arial,sans-serif;background:#f4f4ef;color:#18191a;padding:40px"><p>${lang === 'en' ? 'This page has moved:' : 'Cette page a changé d’adresse :'} <a href="${fallback}">${origin + fallback}</a></p></body></html>
`;
}
let legacyCount = 0;
const formerAddresses = [];
for (const lang of ['fr', 'en'])
  for (const [file, entry] of Object.entries(legacyPages)) {
    const p = typeof entry === 'string' ? entry : entry.path,
      target = localized(p, lang);
    let script, fallback;
    if (typeof entry === 'string') {
      fallback = target;
      script = `location.replace(${JSON.stringify(target)}+location.hash)`;
    } else {
      const names = WORKS_DATA[entry.id].variants.map(v => v.name),
        param = lang === 'en' ? 'finish' : 'finition';
      fallback = target + '?' + param + '=' + encodeURIComponent(entry.colour);
      script = `(function(){var q=new URLSearchParams(location.search),n=function(s){return String(s||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().trim()},names=${JSON.stringify(names)},wanted=n(q.get('couleur')||q.get('finition')||q.get('finish')),colour=${JSON.stringify(entry.colour)};for(var i=0;i<names.length;i++)if(n(names[i])===wanted)colour=names[i];location.replace(${JSON.stringify(target)}+'?${param}='+encodeURIComponent(colour)+location.hash)})()`;
    }
    const file_ = path.join(root, lang === 'en' ? 'en' : '', file);
    fs.writeFileSync(file_, legacyPage(target, lang, script, fallback));
    legacyCount++;
    if (!file.endsWith('_summary.html')) formerAddresses.push(origin + (lang === 'en' ? '/en/' : '/') + file);
    assert.ok(fs.existsSync(path.join(root, target, 'index.html')), 'Legacy target exists ' + target);
  }
// /fr/ was the French home page's address from 26 to 27 September 2026: it now leads to the root address.
fs.mkdirSync(path.join(root, 'fr'), { recursive: true });
fs.writeFileSync(
  path.join(root, 'fr', 'index.html'),
  legacyPage('/', 'fr', `location.replace('/'+location.search+location.hash)`, '/')
);
legacyCount++;
// Stripe returns to /merci.html?session_id=…&lang=… (success_url in worker/src/index.js).
fs.writeFileSync(
  path.join(root, 'merci.html'),
  legacyPage(
    '/fr/merci/',
    'fr',
    `(function(){var q=new URLSearchParams(location.search),en=/^en/i.test(q.get('lang')||''),id=q.get('session_id');location.replace((en?'/en/thanks/':'/fr/merci/')+(id?'?session_id='+encodeURIComponent(id):''))})()`,
    '/fr/merci/'
  )
);
legacyCount++;

// Migration of 26 September 2026: the former addresses, so that search engines revisit them quickly and follow their
// redirections. Remove this file and its line in robots.txt once Search Console shows the new pages indexed (2–3 months).
fs.writeFileSync(
  path.join(root, 'sitemap-anciennes-adresses.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${formerAddresses.map(u => `<url><loc>${u}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}
</urlset>
`
);

routes.push('/fr/page-introuvable/', '/en/page-introuvable/'); // its language switch points to the same unknown address
const notFound = generate('/fr/page-introuvable/');
fs.writeFileSync(
  path.join(root, '404.html'),
  html(notFound, '/')
    .replace(/<link rel="(?:alternate|canonical)"[^>]*>/g, '')
    .replace(/<meta property="og:url"[^>]*>/, '')
    .replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex">')
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '')
);
assert.ok(notFound.html.includes('404'), '404 page renders');

// Search checks on indexable pages: unique, reasonably sized titles and descriptions; consistent language alternates.
const seen = { title: new Map(), description: new Map() };
for (const p of indexable)
  for (const lang of ['fr', 'en']) {
    const file = path.join(root, localized(p, lang), 'index.html'),
      page = fs.readFileSync(file, 'utf8');
    const title = page.match(/<title>([^<]*)<\/title>/)[1],
      description = page.match(/<meta name="description" content="([^"]*)"/)[1];
    assert.ok(title.length >= 15 && title.length <= 70, 'Title length ' + title.length + ' ' + localized(p, lang));
    assert.ok(
      description.length >= 70 && description.length <= 170,
      'Description length ' + description.length + ' ' + localized(p, lang)
    );
    for (const [kind, value] of [
      ['title', title],
      ['description', description],
    ]) {
      assert.ok(
        !seen[kind].has(value),
        'Duplicate ' + kind + ': ' + localized(p, lang) + ' = ' + seen[kind].get(value)
      );
      seen[kind].set(value, localized(p, lang));
    }
    assert.ok(
      page.includes(`<link rel="canonical" href="${origin + localized(p, lang)}">`),
      'Self canonical ' + localized(p, lang)
    );
    assert.ok(
      page.includes(`hreflang="x-default" href="${origin + localized(p, 'en')}"`),
      'x-default ' + localized(p, lang)
    );
    assert.ok(page.includes('index,follow,max-image-preview:large'), 'Indexable ' + localized(p, lang));
    assert.equal((page.match(/<h1[\s>]/g) || []).length, 1, 'One h1 ' + localized(p, lang));
    const og = page.match(/og:image" content="https:\/\/sculptlab\.fr([^"]+)"/)[1];
    assert.ok(fs.existsSync(path.join(root, og)), 'Share image ' + og);
  }

// Site and payment service must agree: the Worker charges what the site displays (prices, editions, shipping zones).
{
  const workerSource = fs
    .readFileSync(path.join(root, 'worker', 'src', 'index.js'), 'utf8')
    .replace(/export default[\s\S]*$/, '');
  const worker = vm.createContext({});
  vm.runInContext(workerSource + ';globalThis.__w={ED_MAP,ZONES,priceFor,norm};', worker);
  const { ED_MAP, ZONES, priceFor, norm } = worker.__w;
  for (const w of Object.values(WORKS_DATA)) {
    const keys = new Set();
    for (const v of w.variants) {
      const key = norm(v.name);
      keys.add(key);
      assert.equal(ED_MAP[w.id]?.[key], v.edition, `Worker edition for ${w.id} ${v.name}`);
      assert.equal(priceFor(w.id, key, v.edition), v.price, `Worker price for ${w.id} ${v.name}`);
    }
    assert.deepEqual(
      [...keys].sort(),
      Object.keys(ED_MAP[w.id]).sort(),
      `Same finishes on the site and in the Worker: ${w.id}`
    );
  }
  const shipping = vm.runInContext('SHIPPING', generate('/fr/').context);
  assert.deepEqual(
    Array.from(shipping, s => s.zone),
    Object.keys(ZONES),
    'Same shipping zones on the site and in the Worker'
  );
  for (const s of shipping) {
    assert.equal(Math.round(s.price * 100), ZONES[s.zone].amount, 'Shipping price ' + s.zone);
    assert.equal(s.provider, ZONES[s.zone].carrier, 'Carrier ' + s.zone);
  }
  console.log(
    'Payment service checked: 44 finish prices and 5 shipping zones identical on the site and in the Worker.'
  );
}

// Final checks on everything that will be published.
const published = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name.startsWith('_') || ['node_modules', 'worker'].includes(e.name)) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (/\.(html|js|css|xml|txt|webmanifest)$/.test(e.name)) published.push(f);
  }
})(root);
for (const f of published) {
  const text = fs.readFileSync(f, 'utf8');
  assert.ok(!/chatgpt\.site|cohmanon/.test(text), 'Former ChatGPT address left in ' + path.relative(root, f));
  for (const m of text.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) JSON.parse(m[1]);
}
assert.ok(
  !fs.existsSync(path.join(root, 'premiere')) && !fs.existsSync(path.join(root, 'mythes')),
  'Drafts are not published'
);
for (const f of [
  'CNAME',
  'favicon.ico',
  'favicon-32x32.png',
  'apple-touch-icon-180x180.png',
  'favicon-192x192.png',
  'favicon-512x512.png',
  'site.webmanifest',
])
  assert.ok(fs.existsSync(path.join(root, f)), 'Missing ' + f);
assert.equal(fs.readFileSync(path.join(root, 'CNAME'), 'utf8').trim(), 'sculptlab.fr');
console.log(
  `Publication: sitemap (${indexable.length * 2} URLs), robots.txt, ${legacyCount} former addresses redirected, structured data parsed, no ChatGPT address left.`
);
console.log(
  `${paths.length * 2} translated pages and ${count} finish/language combinations checked. All 44 mobile finishes and their 3 edition groups, finish selection without scrolling, language detection, legacy links, galleries and assets validated.`
);
