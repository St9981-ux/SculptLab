const arrow='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
const arrowRight='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const plus='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let language='fr';
const t=(fr,en)=>language==='en'?en:fr;
const money=n=>n==null?t('Prix sur SculptLab','Price on SculptLab'):new Intl.NumberFormat(language==='en'?'en-IE':'fr-FR',{style:'currency',currency:'EUR',maximumFractionDigits:Number.isInteger(n)?0:2}).format(n);
const field=(record,key)=>language==='en'?(record[key+'En']||record[key]):record[key];
const finish=v=>field(v,'name');
const routePairs=[['oeuvres','works'],['atelier','studio'],['acquerir','acquire'],['mentions-legales','legal'],['cgv','terms'],['merci','thanks']];
function localizedPath(path,lang){if(lang==='en')for(const [fr,en] of routePairs)path=path.replace(new RegExp('^/'+fr+'(?=/|$)'),'/'+en);return '/'+lang+(path==='/'?'/':path)}
function routeInfo(){let path=location.pathname.replace(/\/+$/,'')||'/';const match=path.match(/^\/(fr|en)(?=\/|$)/);const lang=match?.[1]||'fr';if(match)path=path.slice(match[0].length)||'/';if(lang==='en')for(const [fr,en] of routePairs)path=path.replace(new RegExp('^/'+en+'(?=/|$)'),'/'+fr);return {path,lang}}
const href=path=>localizedPath(path,language);
const urlFor=(w,v)=>href('/oeuvres/'+w.id+'/')+'?'+t('finition','finish')+'='+encodeURIComponent(v.name);
const chosenName=()=>new URLSearchParams(location.search).get('finition')||new URLSearchParams(location.search).get('finish');
const selectedVariant=w=>w.variants.find(v=>v.name===chosenName())||w.variants.find(v=>v.name===w.default)||w.variants[0];
const editionName=e=>({open:t('Édition ouverte','Open edition'),limited:t('Édition limitée · 25 exemplaires','Limited edition · 25 pieces'),unique:t('Pièce unique · 1 exemplaire','One of a kind · 1 piece')}[e]);
const heroItems=[{id:'enigma',name:'Outremer',bg:'#e3e5dc'},{id:'io',name:'Sorbet',bg:'#dfe7eb'},{id:'zamu',name:'Corail',bg:'#e8dbe8'}];
let galleryIndex=0,galleryKey='',galleryPhotos=[],galleryWork=null,galleryVariant=null;
function switchUrl(lang){const state=routeInfo();const q=new URLSearchParams(location.search);if(q.has('finition')||q.has('finish')){const value=q.get('finition')||q.get('finish');q.delete('finition');q.delete('finish');q.set(lang==='en'?'finish':'finition',value)}return localizedPath(state.path==='/'?'/':state.path+'/',lang)+(q.size?'?'+q.toString():'')+location.hash}
function header(active=''){
 const nav=[['/collection/',t('Les œuvres','The works'),'collection'],['/atelier/',t('L’atelier','The studio'),'atelier']];
 const links=nav.map(([path,label,id])=>`<a href="${href(path)}" ${active===id?'class="active" aria-current="page"':''}>${label}</a>`).join('');
 return `<div class="shell header-shell"><header class="site-header"><a class="brand" href="${href('/')}" aria-label="${t('SculptLab — Accueil','SculptLab — Home')}">SculptLab<b>.</b></a><nav class="desktop-nav" aria-label="${t('Navigation principale','Main navigation')}">${links}</nav><div class="nav-right"><a class="nav-contact" href="${href('/contact/')}">${t('Entrons en contact','Get in touch')} ${arrow}</a><nav class="language-switch" aria-label="${t('Langue du site','Site language')}"><a href="${switchUrl('fr')}" data-language="fr" lang="fr" hreflang="fr" aria-label="Français" ${language==='fr'?'aria-current="true"':''}>FR</a><a href="${switchUrl('en')}" data-language="en" lang="en" hreflang="en" aria-label="English" ${language==='en'?'aria-current="true"':''}>EN</a></nav><button class="menu-button" aria-expanded="false" aria-controls="mobile-nav" aria-label="${t('Ouvrir le menu','Open menu')}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg></button></div><nav class="mobile-nav" id="mobile-nav" aria-label="${t('Navigation mobile','Mobile navigation')}">${links}<a href="${href('/contact/')}">${t('Contact','Contact')}</a></nav></header></div>`;
}
function signature(){return `<span class="artist-signature" role="img" aria-label="${t('Signature de l’artiste','Artist’s signature')}"></span>`}
function footer(){return `<footer class="site-footer"><div class="footer-top"><div class="footer-note">${signature()}<p>${t('Des fragments d’ailleurs.<br>Des présences à accueillir.<br>Sculptures façonnées et peintes à la main.','Fragments from elsewhere.<br>Presences to welcome.<br>Sculptures shaped and painted by hand.')}</p></div><div class="footer-links"><div><a href="${href('/collection/')}">${t('Les œuvres','The works')}</a><a href="${href('/atelier/')}">${t('L’atelier','The studio')}</a><a href="${href('/contact/')}">Contact</a></div><div><a href="mailto:info@sculptlab.fr">info@sculptlab.fr</a><a href="${href('/mentions-legales/')}">${t('Mentions légales','Legal notice')}</a><a href="${href('/cgv/')}">${t('Conditions de vente','Terms of sale')}</a><button type="button" class="footer-cookie-link" data-cookie-open aria-controls="cookie-panel">${t('Gérer les cookies','Manage cookies')}</button></div></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} SculptLab. ${t('Tous droits réservés.','All rights reserved.')}</span><span>${t('Sculptures contemporaines','Contemporary sculptures')}</span><a href="#top">${t('Retour en haut','Back to top')} ↑</a></div></footer><div id="cookie-root">${cookiePanel()}</div>`}
function closing(){return `<div class="shell"><section class="closing"><div><p class="eyebrow">${t('Une œuvre vous accompagne encore ?','Does a work still linger with you?')}</p><h2>${t('Laissons quelques mots.','Leave a few words.')}</h2></div><a href="${href('/contact/')}" class="circle-arrow" aria-label="${t('Écrire à l’atelier','Write to the studio')}">${arrow}</a></section></div>`}
function previewFinishes(w,v){const choices=[w.variants.find(c=>c.name===w.default),...w.variants.filter(c=>c.name!==w.default)].slice(0,4);if(!choices.some(c=>c.name===v.name))choices[choices.length-1]=v;return choices}
let expandedPalette=null,paletteRoute='';
const minus='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>';
function cardSwatch(w,c,v){const label=finish(c)+' — '+editionName(c.edition)+(routeInfo().path==='/'?'':' — '+money(c.price));return `<button type="button" class="work-swatch" data-card-variant="${esc(c.name)}" data-work="${w.id}" style="--swatch:${c.hex}" aria-label="${esc(label)}" title="${esc(finish(c))}" aria-pressed="${c.name===v.name}"><span aria-hidden="true"></span></button>`}
function cardFinishControls(w,v){
 const open=expandedPalette===w.id,label=(open?t('Masquer les finitions de ','Hide finishes for '):t('Voir toutes les finitions de ','Show all finishes for '))+w.name;
 return `<div class="palette-heading ${open?'is-open':''}"><div class="work-dots" role="group" aria-label="${t('Choisir la finition de','Choose a finish for')} ${w.name}">${open?`<span class="palette-count">${w.variants.length} ${t('finitions','finishes')}</span>`:previewFinishes(w,v).map(c=>cardSwatch(w,c,v)).join('')}<button type="button" class="finish-more" data-palette-toggle="${w.id}" aria-expanded="${open}" aria-controls="palette-${w.id}" aria-label="${label}" title="${label}"><span class="finish-more-mark" style="--palette:conic-gradient(${w.variants.slice(0,6).map(c=>c.hex).join(',')},${w.variants[0].hex})" aria-hidden="true">${open?minus:plus}</span></button></div></div><div class="palette-panel" id="palette-${w.id}" ${open?'':'hidden'}>${open?['open','limited','unique'].map(edition=>`<fieldset class="palette-edition" data-edition="${edition}"><legend>${editionName(edition)}</legend><div class="palette-swatches">${w.variants.filter(c=>c.edition===edition).map(c=>cardSwatch(w,c,v)).join('')}</div></fieldset>`).join(''):''}</div>`;
}
function toggleCardPalette(button){
 const id=button.dataset.paletteToggle,current=button.closest('.work-card'),previous=expandedPalette;
 if(!current||!WORKS[id])return;
 expandedPalette=previous===id?null:id;
 for(const workId of new Set([previous,id])){
  if(!workId)continue;
  const card=workId===id?current:document.querySelector('[data-card-work="'+workId+'"]'),w=WORKS[workId];
  if(card){const v=w.variants.find(v=>v.name===(cardChoices[workId]||w.default));card.querySelector('.work-finish-controls').innerHTML=cardFinishControls(w,v)}
  deferHomeSlide(workId);
 }
 current.querySelector('[data-palette-toggle]')?.focus({preventScroll:true});
}

const cardChoices={};
function workCard(w){const autoplay=routeInfo().path==='/';const v=w.variants.find(v=>v.name===(cardChoices[w.id]||w.default));return `<article class="work-card" data-card-work="${w.id}" ${autoplay?`data-slideshow-root="${w.id}"`:""}><div class="work-image-wrap"><a class="work-visual" href="${urlFor(w,v)}" style="--work-bg:${w.background}" aria-label="${t('Découvrir','Discover')} ${esc(w.name+' — '+finish(v))}"><span class="eyebrow">${w.number} / ${w.name}</span><img src="${v.image}" alt="${esc(w.name+' — '+finish(v))}" width="800" height="1000" loading="lazy"><span class="circle-arrow">${arrow}</span></a></div><div class="work-info"><div><h3><a href="${urlFor(w,v)}">${w.name}</a></h3><p><span class="card-finish" aria-live="${autoplay?'off':'polite'}">${esc(finish(v))}</span></p></div>${autoplay?'':`<span class="card-price" aria-live="polite">${money(v.price)}</span>`}</div><div class="work-finish-controls">${cardFinishControls(w,v)}</div><p class="card-story">${field(w,'description')}</p><a class="text-link card-story-link" href="${urlFor(w,v)}#histoire">${t('Lire son histoire','Read its story')} ${arrow}</a></article>`}
function selectCardFinish(button){
 const w=WORKS[button.dataset.work],v=w?.variants.find(v=>v.name===button.dataset.cardVariant),card=button.closest('.work-card');
 if(!v||!card)return;
 deferHomeSlide(w.id);
 updateCardFinish(card,w,v);
 const focus=Array.from(card.querySelectorAll('[data-card-variant]')).find(b=>b.dataset.cardVariant===v.name);focus?.focus({preventScroll:true});
}
function updateCardFinish(card,w,v,animate=false){
 cardChoices[w.id]=v.name;
 const image=card.querySelector('.work-visual>img');image.src=v.image;image.alt=w.name+' — '+finish(v);if(animate)fadeSlide(image);
 card.querySelector('.work-visual').setAttribute('aria-label',t('Découvrir','Discover')+' '+w.name+' — '+finish(v));
 card.querySelector('.card-finish').textContent=finish(v);const price=card.querySelector('.card-price');if(price)price.textContent=money(v.price);
 card.querySelectorAll('a').forEach(a=>{a.href=urlFor(w,v)+(a.classList.contains('card-story-link')?'#histoire':'')});
 card.querySelector('.work-finish-controls').innerHTML=cardFinishControls(w,v);
}

function home(){const w=WORKS.enigma,v=w.variants.find(c=>c.name==='Outremer');return `${header()}<main id="main" tabindex="-1" class="home-main"><div class="shell"><section class="hero"><div class="hero-copy"><span class="eyebrow">${t('Sculptures contemporaines','Contemporary sculptures')}</span><h1><span class="hero-title-line"><span>${t('L’étrange','The unknown')}</span></span> <span class="hero-title-line"><em>${t('prend forme.','takes shape.')}</em></span></h1><p>${t('Il est des présences que l’on ne rencontre<br>qu’au bord du rêve.','Some presences are encountered<br>only at the edge of dreams.')}</p><a class="button" href="${href('/collection/')}">${t('Explorer les œuvres','Explore the works')} ${arrowRight}</a></div><div class="hero-stage" id="hero-stage" data-slideshow-root="hero"><span class="hero-stage-label">${t('LA COLLECTION','THE COLLECTION')}</span><div class="hero-seal">${signature()}</div><img class="hero-art" id="hero-art" src="${v.image}" alt="${esc(w.name+' — '+finish(v))}" width="900" height="1000" fetchpriority="high"><div class="hero-caption"><a id="hero-link" href="${urlFor(w,v)}"><strong id="hero-name">Enigma</strong><span id="hero-finish">${finish(v)}</span></a><div class="hero-controls" aria-label="${t('Sculpture à la une','Featured sculpture')}">${heroItems.map((item,i)=>`<button data-hero="${i}" aria-label="${t('Afficher','Show')} ${WORKS[item.id].name}" aria-pressed="${i===0}">0${i+1}</button>`).join('')}</div></div></div><a class="button mobile-hero-link" href="${href('/collection/')}">${t('Explorer les œuvres','Explore the works')} ${arrowRight}</a></section><div class="manifesto-strip"><span>${t('SCULPTURES EN RÉSINE','RESIN SCULPTURES')}</span><span>${t('ÉDITIONS LIMITÉES & PIÈCES UNIQUES','LIMITED EDITIONS & ONE-OF-A-KIND WORKS')}</span><span>${t('FAÇONNÉES & PEINTES À LA MAIN','SHAPED & PAINTED BY HAND')}</span><a href="${href('/atelier/')}" aria-label="${t('Découvrir la fabrication','Discover the making')}">${arrow}</a></div><section class="collection-section"><div class="section-head"><div><p class="eyebrow">${t('01 — Rencontres singulières','01 — Unfamiliar encounters')}</p><h2>${t('Trois formes.<br>Des mondes à part.','Three forms.<br>Worlds of their own.')}</h2></div><a class="text-link" href="${href('/collection/')}">${t('Toute la collection','The full collection')} ${arrow}</a></div><div class="work-grid">${Object.values(WORKS).map(workCard).join('')}</div></section></div><section class="feature"><div class="feature-image"><img src="${WORKS.enigma.variants.find(v=>v.name==='Doodle').image}" alt="Enigma — Doodle" loading="lazy" width="900" height="900"></div><div class="feature-copy"><span class="eyebrow">${t('Les métamorphoses de la couleur','The transformations of colour')}</span><h2>${t('Une forme.<br>D’autres murmures.','One form.<br>Other whispers.')}</h2><p>${t('Une même silhouette, et pourtant une autre présence. La couleur déplace le souvenir, fait apparaître ce que l’on n’avait pas encore vu.','The same silhouette, and yet a different presence. Colour shifts the memory, revealing what had remained unseen.')}</p><a class="text-link" href="${urlFor(WORKS.enigma,WORKS.enigma.variants.find(v=>v.name==='Doodle'))}">${t('Découvrir Enigma Doodle','Discover Enigma Doodle')} ${arrow}</a></div></section><div class="shell"><section class="atelier-teaser"><figure><img src="/assets/about2.webp" alt="${t('Une sculpture prend forme dans l’atelier','A sculpture taking shape in the studio')}" loading="lazy" width="900" height="1000"><figcaption>${t('Le geste, avant la couleur.','The gesture, before the colour.')}</figcaption></figure><div><p class="eyebrow">${t('02 — Dans l’atelier','02 — Inside the studio')}</p><h2>${t('Ce qui revient<br>du silence.','What returns<br>from silence.')}</h2><p>${t('Une image demeure au réveil. Les mains en cherchent les contours, la matière lui prête un corps. Peu à peu, ce qui semblait lointain trouve sa place parmi nous.','An image lingers upon waking. Hands search for its contours; matter lends it a body. Little by little, what once seemed distant finds a place among us.')}</p><a class="text-link" href="${href('/atelier/')}">${t('Entrer dans l’atelier','Enter the studio')} ${arrow}</a></div></section></div>${closing()}</main>${footer()}`}
function collection(){return `${header('collection')}<main id="main" tabindex="-1" class="route-fade"><div class="shell"><section class="page-intro"><p class="eyebrow">${t('La collection','The collection')}</p><h1>${t('Choisir une<br>présence.','Choose a<br>presence.')}</h1><p>${t('Io, Za’mu, Enigma. Trois noms rapportés de lieux dont il ne reste que des fragments.','Io, Za’mu, Enigma. Three names brought back from places of which only fragments remain.')}</p></section><div class="catalog-bar"><nav class="filter-list" aria-label="${t('Accès aux œuvres','Browse the works')}"><a href="#io">Io</a><a href="#zamu">Za’mu</a><a href="#enigma">Enigma</a></nav><span>03 ${t('sculptures','sculptures')} · 44 ${t('finitions','finishes')}</span></div><section class="catalog-grid"><div class="work-grid">${Object.values(WORKS).map(w=>`<div id="${w.id}">${workCard(w)}</div>`).join('')}</div></section><section class="story-panel"><p class="eyebrow">${t('L’art de la variation','The art of variation')}</p><div><h2>${t('Une couleur change tout.','A colour changes everything.')}</h2><p>${t('Éditions ouvertes, séries limitées à 25 exemplaires ou pièces uniques. Chaque sculpture naît d’un modèle original façonné à la main, reproduit en résine puis peint individuellement.','Open editions, limited series of 25 or one-of-a-kind pieces. Each sculpture begins with an original model shaped by hand, cast in resin and individually painted.')}</p></div></section></div>${closing()}</main>${footer()}`}
function prepareGallery(w,v){const key=w.id+'|'+v.name;if(galleryKey!==key)galleryIndex=0;galleryKey=key;galleryPhotos=v.photos?.length?v.photos:[{src:v.image,caption:'Vue de la sculpture',captionEn:'Sculpture view'}];galleryIndex=Math.min(galleryIndex,galleryPhotos.length-1);galleryWork=w;galleryVariant=v;return galleryPhotos[galleryIndex]}
function mobileFinishes(w,v){
 return `<div class="mobile-finishes"><div class="mobile-finish-heading"><span>${t('Choisir une finition','Choose a finish')}</span><span class="muted">${w.variants.length} ${t('finitions','finishes')}</span></div>${['open','limited','unique'].map(ed=>`<fieldset class="mobile-edition" data-edition="${ed}"><legend>${editionName(ed)}</legend><div class="mobile-finish-options">${w.variants.filter(c=>c.edition===ed).map(c=>`<button type="button" class="mobile-variant" style="--swatch:${c.hex}" data-work="${w.id}" data-variant="${esc(c.name)}" aria-label="${esc(finish(c))} — ${editionName(c.edition)} — ${money(c.price)}" aria-pressed="${c.name===v.name}"><span class="mobile-variant-image"><img src="${c.image}" alt="" loading="lazy" width="96" height="96"></span><span>${esc(finish(c))}</span></button>`).join('')}</div></fieldset>`).join('')}</div>`;
}

const photoPrev='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6-6 6 6 6"/></svg>';
const photoNext='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m10 6 6 6-6 6"/></svg>';
function gallery(w,v){
 const photo=prepareGallery(w,v),multiple=galleryPhotos.length>1;
 return `<div class="product-gallery" role="region" aria-label="${t('Photographies de','Photographs of')} ${w.name}" tabindex="0"><div class="product-preview"><div class="product-stage" style="background:${w.background}"><span class="eyebrow">${w.name} — ${w.number}</span><img id="product-image" src="${photo.src}" alt="${esc(w.name+' — '+finish(v)+' · '+field(photo,'caption'))}" width="1000" height="1080" fetchpriority="high"><button type="button" class="zoom-button" aria-label="${t('Agrandir la sculpture','Enlarge the sculpture')}" aria-pressed="false">${plus}</button><div class="photo-arrows"><button type="button" data-photo-step="-1" aria-label="${t('Photo précédente','Previous photo')}" ${multiple?'':'disabled'}>${photoPrev}</button><button type="button" data-photo-step="1" aria-label="${t('Photo suivante','Next photo')}" ${multiple?'':'disabled'}>${photoNext}</button></div><span class="gallery-status ${multiple?'':'sr-only'}" id="photo-status" aria-live="polite">${t('Photo','Photo')} ${galleryIndex+1} / ${galleryPhotos.length}</span></div><div class="photo-thumbnails" role="group" aria-label="${t('Choisir une vue','Choose a view')}">${galleryPhotos.map((p,i)=>`<button type="button" data-photo="${i}" aria-label="${t('Afficher la vue','Show view')} ${i+1} — ${esc(field(p,'caption'))}" aria-pressed="${i===galleryIndex}"><img src="${p.src}" alt="" width="76" height="76" loading="lazy"></button>`).join('')}</div><div class="preview-selection" aria-live="polite" aria-atomic="true"><span>${esc(finish(v))}</span><strong>${money(v.price)}</strong></div></div>${mobileFinishes(w,v)}</div>`;
}

function product(w){const v=selectedVariant(w);return `${header('collection')}<main id="main" tabindex="-1" class="route-fade"><div class="shell"><nav class="breadcrumbs" aria-label="${t('Fil d’Ariane','Breadcrumbs')}"><a href="${href('/collection/')}">${t('Les œuvres','The works')}</a> &nbsp;/&nbsp; ${w.name} &nbsp;/&nbsp; ${esc(finish(v))}</nav><section class="product"><div class="product-heading"><h1>${w.name}</h1><div class="product-subline"><span>${esc(finish(v))}</span><span class="price">${money(v.price)}</span></div></div>${gallery(w,v)}<div class="product-details"><p class="product-description">${field(w,'description')}</p><a class="text-link story-jump" href="#histoire">${t('Lire l’histoire de','Read the story of')} ${w.name} ↓</a><div class="desktop-finishes"><div class="variant-heading"><span>${t('Choisir une finition','Choose a finish')}</span><strong>${esc(finish(v))}</strong></div>${['open','limited','unique'].map(ed=>`<div class="variant-group"><p class="eyebrow">${editionName(ed)}</p><div class="variant-options" role="group" aria-label="${editionName(ed)}">${w.variants.filter(c=>c.edition===ed).map(c=>`<button class="variant" style="--swatch:${c.hex}" data-work="${w.id}" data-variant="${esc(c.name)}" title="${esc(finish(c))} — ${money(c.price)}" aria-label="${esc(finish(c))} — ${money(c.price)}" aria-pressed="${c.name===v.name}"><img src="${c.image}" alt="" loading="lazy" width="65" height="65"></button>`).join('')}</div></div>`).join('')}</div><a href="${href('/acquerir/'+w.id+'/')}?${t('finition','finish')}=${encodeURIComponent(v.name)}" class="button blue purchase-button">${t('Acquérir cette œuvre','Acquire this work')} ${arrowRight}</a><p class="delivery-note">${t('Expédition protégée et soignée','Careful, protective shipping')}</p><details class="detail-accordion" open><summary>${t('L’œuvre en détail','About the work')}</summary><div class="specs"><span>${t('Matière','Material')}</span><span>${t('Résine peinte à la main','Hand-painted resin')}</span><span>${t('Dimensions','Dimensions')}</span><span>${t('H. 30 × L. 15 × P. 15 cm','H. 30 × W. 15 × D. 15 cm')}</span><span>${t('Édition','Edition')}</span><span>${v.edition==='limited'?t('25 exemplaires numérotés','25 numbered pieces'):v.edition==='unique'?t('Pièce unique','One of a kind'):t('Édition ouverte','Open edition')}</span>${v.edition!=='open'?`<span>${t('Authenticité','Authenticity')}</span><span>${t('Certificat fourni','Certificate included')}</span>`:''}</div></details><details class="detail-accordion"><summary>${t('Livraison & retours','Shipping & returns')}</summary><div>${t('Livraison annoncée sous 7 à 10 jours ouvrés en France métropolitaine et 10 à 15 jours ouvrés à l’international, selon la destination. Expédition sécurisée et assurée. Vous disposez de 14 jours après réception pour demander un échange ou un remboursement.','Estimated delivery: 7–10 business days within mainland France and 10–15 business days internationally, depending on the destination. Secure, insured shipping. You have 14 days after receipt to request an exchange or a refund.')}<br><a href="${href('/cgv/')}" class="text-link">${t('Consulter les conditions de vente','Read the terms of sale')}</a></div></details><details class="detail-accordion"><summary>${t('Une question sur cette sculpture ?','A question about this sculpture?')}</summary><div>${t('Une couleur vous retient, une présence vous intrigue ?','Does a colour hold your attention, a presence stir your curiosity?')}<br><a href="${href('/contact/')}?oeuvre=${encodeURIComponent(w.name+' — '+finish(v))}" class="text-link">${t('Écrire à l’atelier','Write to the studio')} ${arrow}</a></div></details></div></section><section class="story-panel" id="histoire"><p class="eyebrow">${t('L’histoire de','The story of')} ${w.name}</p><div><h2>${field(w,'storyTitle')}</h2><p class="sculpture-story">${esc(field(w,'story'))}</p></div></section><section class="collection-section"><div class="section-head"><div><p class="eyebrow">${t('Poursuivre la rencontre','Continue the encounter')}</p><h2>${t('D’autres présences.','Other presences.')}</h2></div><a href="${href('/collection/')}" class="text-link">${t('La collection','The collection')} ${arrow}</a></div><div class="work-grid related-grid">${Object.values(WORKS).filter(x=>x.id!==w.id).map(workCard).join('')}</div></section></div></main>${footer()}`}

function atelier(){return `${header('atelier')}<main id="main" tabindex="-1" class="route-fade"><div class="shell"><section class="atelier-hero"><div><p class="eyebrow">${t('D’un lieu à l’autre','From one place to another')}</p><h1>${t('L’imaginaire.<br>La main.<br><em>La trace.</em>','The imagined.<br>The hand.<br><em>The trace.</em>')}</h1><p>${t('Certains voyages ne laissent aucune adresse. On en rapporte un visage, la courbe d’une corne, l’impression d’avoir été regardé. Les sculptures commencent là : dans ce qui persiste lorsque le reste s’efface.','Some journeys leave no address behind. We bring back a face, the curve of a horn, the feeling of having been watched. The sculptures begin there: in what persists when everything else fades.')}</p></div><figure><img src="/assets/about1.webp" alt="${t('Une sculpture avant sa mise en couleur','A sculpture before colour is applied')}" width="900" height="1100" fetchpriority="high"><figcaption>${t('Avant la couleur, une présence.','Before colour, a presence.')}</figcaption></figure></section></div><section class="atelier-quote"><blockquote>${t('« J’ai arpenté des terres que le temps a oubliées, des contrées effacées de la mémoire des hommes, et d’autres encore vierges de tout nom. »','“I have wandered through lands that time has forgotten, realms erased from human memory, and others untouched by any name.”')}</blockquote>${signature()}</section><div class="shell"><section class="process"><div class="section-head"><div><p class="eyebrow">${t('Du souvenir à la matière','From memory to matter')}</p><h2>${t('Donner un corps<br>à ce qui demeure.','Give a body<br>to what remains.')}</h2></div></div><div class="process-grid"><article class="process-card"><p class="eyebrow">${t('01 / Modeler','01 / Shape')}</p><h3>${t('Retrouver un contour.','Recover a contour.')}</h3><p>${t('Le modèle original se façonne à la main. Un volume en appelle un autre, jusqu’à ce qu’une silhouette semble reconnaître sa propre forme.','The original model is shaped by hand. One volume calls for another, until a silhouette seems to recognise its own form.')}</p></article><article class="process-card"><p class="eyebrow">${t('02 / Reproduire','02 / Cast')}</p><h3>${t('Faire durer l’écho.','Let the echo endure.')}</h3><p>${t('Le modèle est reproduit en résine. Éditions ouvertes, séries limitées et pièces uniques prolongent la rencontre sous différentes formes.','The model is cast in resin. Open editions, limited series and one-of-a-kind pieces allow the encounter to continue in different forms.')}</p></article><article class="process-card"><p class="eyebrow">${t('03 / Peindre','03 / Paint')}</p><h3>${t('Changer la lumière.','Change the light.')}</h3><p>${t('Spray, aérographe, pinceau. Chaque sculpture est peinte à la main. Une couleur apparaît, et le souvenir n’est déjà plus tout à fait le même.','Spray, airbrush, brush. Each sculpture is painted by hand. A colour appears, and already the memory is not quite the same.')}</p></article></div></section><section class="atelier-teaser"><figure><img src="/assets/about2.webp" alt="${t('Travail de la matière dans l’atelier','Working with the material in the studio')}" loading="lazy" width="900" height="1000"><figcaption>${t('Le temps du geste.','The time of the gesture.')}</figcaption></figure><div><p class="eyebrow">${t('Io, Za’mu, Enigma','Io, Za’mu, Enigma')}</p><h2>${t('Des mondes<br>à accueillir.','Worlds<br>to welcome.')}</h2><p>${t('Io, Za’mu et Enigma ne livrent pas tout. Ils gardent quelque chose du lieu d’où ils viennent. Il suffit parfois de vivre auprès d’une œuvre pour entendre ce qu’elle taisait.','Io, Za’mu and Enigma do not reveal everything. They keep something of the place they came from. Sometimes, living beside a work is enough to hear what it had left unspoken.')}</p><a href="${href('/collection/')}" class="text-link">${t('Rencontrer les sculptures','Meet the sculptures')} ${arrow}</a></div></section></div>${closing()}</main>${footer()}`}
function contact(){const subject=new URLSearchParams(location.search).get('oeuvre')||'';return `${header()}<main id="main" tabindex="-1" class="route-fade"><div class="shell"><section class="contact-page"><div><p class="eyebrow">${t('D’un rivage à l’autre','From one shore to another')}</p><h1>${t('Quelques<br>mots.','A few<br>words.')}</h1><p>${t('Une œuvre vous intrigue, une couleur vous retient ? Vous pouvez laisser ici quelques mots.','Does a work intrigue you, a colour hold your attention? You can leave a few words here.')}</p><a class="contact-email" href="mailto:info@sculptlab.fr">info@sculptlab.fr</a><img class="contact-art" src="${WORKS.zamu.variants.find(v=>v.name==='Corail').image}" alt="${t('Za’mu — Corail','Za’mu — Coral')}" width="350" height="350"></div><form class="contact-form" id="contact-form" action="https://formsubmit.co/info@sculptlab.fr" method="POST"><input type="hidden" name="_subject" value="${t('Nouveau message depuis SculptLab','New message from SculptLab')}"><input type="hidden" name="_captcha" value="false"><input type="hidden" name="_template" value="table"><input type="text" class="contact-honey" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true"><label for="contact-name">${t('Votre nom','Your name')}</label><input id="contact-name" name="name" autocomplete="name" placeholder="${t('Comment vous appelez-vous ?','What is your name?')}" required maxlength="100"><label for="contact-email">${t('Votre e-mail','Your email')}</label><input id="contact-email" name="email" type="email" autocomplete="email" placeholder="${t('vous@exemple.fr','you@example.com')}" required maxlength="254"><label for="contact-message">${t('Votre message','Your message')}</label><textarea id="contact-message" name="message" placeholder="${t('Je vous écris à propos de…','I am writing about…')}" required maxlength="5000">${subject?esc(t('Bonjour, je souhaiterais en savoir plus sur ','Hello, I would like to know more about ')+subject+'.'):''}</textarea><button type="submit" class="button blue">${t('Envoyer mon message','Send my message')} ${arrowRight}</button><p class="contact-status" id="contact-status" role="status" aria-live="polite"></p></form></section></div></main>${footer()}`}
// Same zones, carriers and rates as the payment Worker (worker/src/index.js, ZONES). The Worker remains the authority on prices.
const SHIPPING=[{zone:'fr',fr:'France & Monaco',en:'France & Monaco',provider:'UPS Standard',price:9.9},{zone:'eu',fr:'Union européenne',en:'European Union',provider:'DHL Express',price:19.9},{zone:'europe',fr:'Europe hors UE',en:'Europe outside the EU',provider:'DHL Express',price:29.9},{zone:'na',fr:'Amérique du Nord',en:'North America',provider:'UPS Standard',price:49.9},{zone:'world',fr:'Reste du monde',en:'Rest of the world',provider:'DHL Express',price:89.9}];
const CHECKOUT_ENDPOINT='https://sculptlab-checkout.sculptlab.workers.dev/create-checkout-session';
function checkout(w){const v=selectedVariant(w);return `${header('collection')}<main id="main" tabindex="-1" class="route-fade"><div class="shell"><section class="checkout-wrap"><nav class="checkout-steps" aria-label="${t('Étapes de commande','Order steps')}"><a href="${urlFor(w,v)}">${t('01 — L’œuvre','01 — The work')}</a><strong>${t('02 — Récapitulatif','02 — Summary')}</strong><span>${t('03 — Paiement sécurisé','03 — Secure payment')}</span></nav><h1>${t('Une présence<br>à accueillir.','A presence<br>to welcome.')}</h1><div class="checkout"><div><div class="order-art"><figure class="order-portrait"><img src="${v.image}" alt="${esc(w.name+' — '+finish(v))}" width="400" height="500"></figure><div class="order-identification"><p class="eyebrow">SCULPTLAB — ${w.number}</p><h2>${w.name}</h2><p>${esc(finish(v))}<br>${editionName(v.edition)}</p>${signature()}</div></div><p class="order-info">${t('Sculpture en résine peinte à la main.<br>H. 30 × L. 15 × P. 15 cm.','Hand-painted resin sculpture.<br>H. 30 × W. 15 × D. 15 cm.')}</p><a href="${urlFor(w,v)}" class="text-link">${t('Modifier la finition','Change the finish')} ${arrow}</a></div><div class="order-summary"><h2>${t('Votre œuvre','Your work')}</h2><div class="order-row"><span>${w.name} — ${esc(finish(v))}</span><span>${money(v.price)}</span></div><label for="shipping">${t('Destination de livraison','Shipping destination')}</label><select id="shipping" data-price="${v.price==null?'':v.price}">${SHIPPING.map((s,i)=>`<option value="${i}">${s[language]} · ${money(s.price)}</option>`).join('')}</select><div class="order-row"><span id="shipping-provider">UPS Standard</span><span id="shipping-price">${money(9.9)}</span></div><div class="order-row total"><span>${t('Total estimé','Estimated total')}</span><span id="order-total">${v.price==null?t('À confirmer','To be confirmed'):money(v.price+9.9)}</span></div><button type="button" class="button blue checkout-button" id="checkout-button" data-work="${w.id}" data-variant="${esc(v.name)}">${checkoutLabel()}</button><p class="checkout-status" id="checkout-status" role="status" aria-live="polite"></p><p class="form-note muted">${t('Paiement sécurisé par Stripe. L’adresse de livraison et le montant final, port compris, sont confirmés sur la page de paiement.','Secure payment by Stripe. The delivery address and the final amount, shipping included, are confirmed on the payment page.')}</p><details class="detail-accordion"><summary>${t('Expédition & authenticité','Shipping & authenticity')}</summary><div>${t('Emballage protégé et soigné. Expédition sécurisée et assurée. Les éditions limitées sont numérotées et accompagnées d’un certificat d’authenticité.','Careful, protective packaging. Secure, insured shipping. Limited editions are numbered and come with a certificate of authenticity.')}</div></details></div></div></section></div></main>${footer()}`}
function checkoutLabel(){return t('Finaliser ma commande','Complete my order')+' '+arrow}
let checkoutPending=false;
function setCheckoutBusy(busy){
 const button=document.getElementById('checkout-button'),select=document.getElementById('shipping');
 if(button){button.disabled=busy;button.innerHTML=busy?t('Ouverture du paiement sécurisé…','Opening secure payment…'):checkoutLabel();if(busy)button.setAttribute('aria-busy','true');else button.removeAttribute('aria-busy')}
 if(select)select.disabled=busy;
}
// Creates a Stripe Checkout Session through the Worker. The Worker recomputes the price server-side.
async function startCheckout(button){
 if(checkoutPending)return;
 const w=WORKS[button.dataset.work],v=w?.variants.find(c=>c.name===button.dataset.variant),select=document.getElementById('shipping');
 const zone=SHIPPING[Number(select?select.value:0)]?.zone,status=document.getElementById('checkout-status');
 if(!w||!v||!zone)return;
 checkoutPending=true;setCheckoutBusy(true);
 if(status){status.textContent='';delete status.dataset.state}
 const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(CHECKOUT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sculpture:w.id,color:v.name,lang:language,zone,cancel_url:location.href}),signal:controller.signal});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||typeof result.url!=='string'||!/^https:\/\//.test(result.url))throw new Error(result.error||'Checkout unavailable');
  window.clearTimeout(timeout);
  location.assign(result.url);
 }catch{
  window.clearTimeout(timeout);checkoutPending=false;setCheckoutBusy(false);
  const current=document.getElementById('checkout-status');
  if(current){current.dataset.state='error';current.textContent=t('Le paiement n’a pas pu s’ouvrir. Aucun montant n’a été débité. Réessayez dans un instant ou écrivez à info@sculptlab.fr.','The payment page could not be opened. You have not been charged. Please try again in a moment or write to info@sculptlab.fr.')}
 }
}
const checkoutSession=()=>{const id=new URLSearchParams(location.search).get('session_id')||'';return /^cs_[A-Za-z0-9_]{8,}$/.test(id)?id:''};
function thanks(){const ref=checkoutSession();return `${header()}<main id="main" tabindex="-1" class="route-fade"><div class="shell"><section class="page-intro thanks-page"><p class="eyebrow">${t('Commande confirmée','Order confirmed')}</p><h1>${t('Merci.','Thank you.')}</h1><p>${t('Votre commande est confirmée. SculptLab vous remercie chaleureusement ! Un e-mail de confirmation vous a été envoyé.','Your order is confirmed. SculptLab thanks you warmly! A confirmation e-mail has been sent to you.')}</p>${ref?`<p class="thanks-reference muted">${t('Référence : ','Reference: ')}<span>${esc(ref)}</span></p>`:''}<p>${t('Une question sur votre commande ? Écrivez à','A question about your order? Write to')} <a class="thanks-mail" href="mailto:info@sculptlab.fr">info@sculptlab.fr</a>.</p><a class="text-link" href="${href('/collection/')}">${t('Revenir aux œuvres','Return to the works')} ${arrow}</a></section></div></main>${footer()}`}
// GA4 conversion: one purchase event per Checkout session, only with analytics consent.
function trackPurchase(){
 const id=checkoutSession();
 if(!id||routeInfo().path!=='/merci'||window.sculptlabConsent?.getChoice()?.analytics!==true||typeof window.gtag!=='function')return;
 let done=null;try{done=window.localStorage.getItem('sl_purchase_'+id)}catch{}
 if(done)return;
 window.gtag('event','purchase',{transaction_id:id,currency:'EUR'});
 try{window.localStorage.setItem('sl_purchase_'+id,'1')}catch{}
}
function legal(type){const terms=type==='cgv',sections=LEGAL[terms?'cgv':'legal'][language];return `${header()}<main id="main" tabindex="-1" class="route-fade"><article class="legal"><p class="eyebrow">SculptLab.</p><h1>${terms?t('Conditions<br>de vente.','Terms<br>of sale.'):t('Mentions<br>légales.','Legal<br>notice.')}</h1>${sections.map(section=>`<section><h2>${esc(section.title)}</h2><p>${section.body}</p></section>`).join('')}${terms?'':cookieLegalDetails()}</article></main>${footer()}`}

// Titles and descriptions shown by search engines and link previews (one per page and language).
function pageSeo(path,title,description){
 const works=Object.values(WORKS),prices=works.flatMap(w=>w.variants.map(v=>v.price)).filter(n=>n!=null),finishes=works.reduce((n,w)=>n+w.variants.length,0);
 const pages={
  '/':[t('SculptLab — Sculptures contemporaines peintes à la main','SculptLab — Hand-painted contemporary sculptures'),t('Io, Za’mu et Enigma : sculptures contemporaines en résine façonnées et peintes à la main dans les Alpes-Maritimes. Éditions limitées et pièces uniques.','Io, Za’mu and Enigma: contemporary resin sculptures shaped and painted by hand in the South of France. Limited editions and one-of-a-kind pieces.')],
  '/collection':[t('Collection de sculptures en résine — SculptLab','Resin sculpture collection — SculptLab'),t(`Trois sculptures en résine peinte à la main, ${finishes} finitions : édition ouverte dès ${money(Math.min(...prices))}, édition limitée à 25 exemplaires et pièces uniques.`,`Three hand-painted resin sculptures in ${finishes} finishes: open edition from ${money(Math.min(...prices))}, limited editions of 25 and one-of-a-kind pieces.`)],
  '/atelier':[t('L’atelier — Sculptures faites main | SculptLab','The studio — Handmade sculptures | SculptLab'),t('Dans l’atelier SculptLab, chaque sculpture est modelée à la main, reproduite en résine puis peinte au spray, à l’aérographe et au pinceau.','In the SculptLab studio, each sculpture is modelled by hand, cast in resin, then painted with spray, airbrush and brush.')],
  '/contact':[t('Contact — SculptLab, sculptures contemporaines','Contact — SculptLab, contemporary sculptures'),t('Une question sur une sculpture, une finition ou une livraison ? Écrivez à SculptLab avec le formulaire ou à info@sculptlab.fr.','A question about a sculpture, a finish or delivery? Write to SculptLab with the form or at info@sculptlab.fr.')],
  '/mentions-legales':[t('Mentions légales — SculptLab','Legal notice — SculptLab'),t('Mentions légales de SculptLab : éditeur du site, hébergeur, propriété intellectuelle, données personnelles et cookies.','SculptLab legal notice: site publisher, host, intellectual property, personal data and cookies.')],
  '/cgv':[t('Conditions générales de vente — SculptLab','Terms of sale — SculptLab'),t('Conditions générales de vente SculptLab : prix, commande, paiement, livraison, droit de rétractation de 14 jours et garanties.','SculptLab terms of sale: prices, orders, payment, delivery, 14-day right of withdrawal and warranties.')],
  '/merci':[t('Merci — SculptLab','Thank you — SculptLab'),t('Confirmation de votre commande SculptLab.','Confirmation of your SculptLab order.')]
 };
 pages['/acquerir']=pages['/collection'];
 if(pages[path])return {title:pages[path][0],description:pages[path][1]};
 const m=path.match(/^\/(oeuvres|acquerir)\/(io|zamu|enigma)$/);
 if(!m)return {title,description};
 const w=WORKS[m[2]],v=selectedVariant(w),own=w.variants.map(x=>x.price).filter(n=>n!=null),picked=w.variants.some(x=>x.name===chosenName());
 if(m[1]==='acquerir')return {title:t('Acquérir ','Acquire ')+w.name+' '+finish(v)+' — SculptLab',description};
 return {
  title:(picked?w.name+' '+finish(v):w.name)+t(' — Sculpture en résine peinte à la main | SculptLab',' — Hand-painted resin sculpture | SculptLab'),
  description:picked
   ?t(`${w.name} ${finish(v)}, sculpture contemporaine en résine peinte à la main (H. 30 cm). ${editionName(v.edition)}, ${money(v.price)}. ${w.variants.length} finitions au choix.`,`${w.name} ${finish(v)}, a contemporary hand-painted resin sculpture (H. 30 cm). ${editionName(v.edition)}, ${money(v.price)}. ${w.variants.length} finishes to choose from.`)
   :t(`${w.name}, sculpture contemporaine en résine peinte à la main (H. 30 cm). ${w.variants.length} finitions en édition ouverte, limitée ou pièce unique, de ${money(Math.min(...own))} à ${money(Math.max(...own))}.`,`${w.name}, a contemporary hand-painted resin sculpture (H. 30 cm). ${w.variants.length} finishes in open or limited edition or one of a kind, from ${money(Math.min(...own))} to ${money(Math.max(...own))}.`)
 };
}
function render({scroll=true}={}){
 const state=routeInfo();language=state.lang;const path=state.path;let html,title,description=t('Sculptures contemporaines façonnées et peintes à la main. Découvrez les histoires de Io, Za’mu et Enigma.','Contemporary sculptures shaped and painted by hand. Discover the stories of Io, Za’mu and Enigma.');
 if(paletteRoute!==path){expandedPalette=null;paletteRoute=path}
 if(path==='/'){heroActive=0;html=home();title=t('SculptLab — L’étrange prend forme','SculptLab — The unknown takes shape')}
 else if(path==='/collection'||path==='/acquerir'){html=collection();title=t('La collection — SculptLab','The collection — SculptLab')}
 else if(path==='/atelier'){html=atelier();title=t('L’atelier — SculptLab','The studio — SculptLab')}
 else if(path==='/contact'){html=contact();title='Contact — SculptLab'}
 else if(path==='/merci'){html=thanks();title=t('Merci — SculptLab','Thank you — SculptLab')}
 else if(path==='/mentions-legales'||path==='/cgv'){html=legal(path.slice(1));title=path==='/cgv'?t('Conditions de vente — SculptLab','Terms of sale — SculptLab'):t('Mentions légales — SculptLab','Legal notice — SculptLab')}
 else{const match=path.match(/^\/(oeuvres|acquerir)\/(io|zamu|enigma)$/);if(match){const w=WORKS[match[2]],v=selectedVariant(w);html=match[1]==='oeuvres'?product(w):checkout(w);title=w.name+' — '+finish(v)+' · SculptLab';description=field(w,'description')}else{html=header()+`<main id="main" tabindex="-1" class="shell"><section class="page-intro"><p class="eyebrow">404</p><h1>${t('Hors cadre.','Beyond the frame.')}</h1><p>${t('Cette page n’existe pas.','This page does not exist.')}</p><a class="text-link" href="${href('/collection/')}">${t('Revenir aux œuvres','Return to the works')} ${arrow}</a></section></main>`+footer();title=t('Page introuvable — SculptLab','Page not found — SculptLab')}}
 ({title,description}=pageSeo(path,title,description));
 document.getElementById('app').innerHTML=html;document.title=title;document.documentElement.lang=language;document.body.id='top';
 document.querySelector('meta[name="description"]')?.setAttribute('content',description);
 const pagePath=path==='/'?'/':path+'/',canonicalPath=pagePath==='/acquerir/'?'/collection/':pagePath;
 document.querySelector('link[rel="canonical"]')?.setAttribute('href',location.origin+localizedPath(canonicalPath,language));
 for(const lang of ['fr','en'])document.querySelector('link[hreflang="'+lang+'"]')?.setAttribute('href',location.origin+localizedPath(canonicalPath,lang));
 document.querySelector('link[hreflang="x-default"]')?.setAttribute('href',location.origin+localizedPath(canonicalPath,'en'));
 document.querySelector('.skip-link')?.replaceChildren(document.createTextNode(t('Aller au contenu','Skip to content')));

 if(scroll){if(location.hash)document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();else window.scrollTo({top:0,behavior:'instant'})}else document.getElementById('main')?.classList.remove('route-fade');
 setupHomeSlides();
 window.sculptlabArrival?.start();
 window.sculptlabConsent?.start();
 trackPurchase();
 scheduleCookiePrompt();
 if(contactPending)setContactBusy(document.getElementById('contact-form'),true);
}
function setPhoto(index){if(!galleryPhotos.length)return;galleryIndex=(index+galleryPhotos.length)%galleryPhotos.length;const photo=galleryPhotos[galleryIndex],image=document.getElementById('product-image');if(!image)return;image.src=photo.src;image.alt=galleryWork.name+' — '+finish(galleryVariant)+' · '+field(photo,'caption');document.getElementById('photo-status').textContent=t('Photo','Photo')+' '+(galleryIndex+1)+' / '+galleryPhotos.length;document.querySelectorAll('[data-photo]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.photo)===galleryIndex)));const zoom=document.querySelector('.zoom-button');if(zoom){zoom.setAttribute('aria-pressed','false');zoom.setAttribute('aria-label',t('Agrandir la sculpture','Enlarge the sculpture'));zoom.closest('.product-stage').classList.remove('zoom')}}
function chooseProductFinish(w,v,source){
 if(!w||!v)return;
 history.replaceState({},'',urlFor(w,v));render({scroll:false});
 const selector=source==='mobile'?'.mobile-variant':'.variant';
 const focus=Array.from(document.querySelectorAll(selector)).find(b=>b.dataset.variant===v.name);
 focus?.focus({preventScroll:true});
}
function setHero(index,animate=false){
 const i=(index+heroItems.length)%heroItems.length,item=heroItems[i],w=WORKS[item.id],v=w.variants.find(c=>c.name===item.name),image=document.getElementById('hero-art');
 if(!image)return;heroActive=i;image.src=v.image;image.alt=w.name+' — '+finish(v);if(animate)fadeSlide(image);
 document.getElementById('hero-stage').style.background=item.bg;document.getElementById('hero-name').textContent=w.name;
 document.getElementById('hero-finish').textContent=finish(v);document.getElementById('hero-link').href=urlFor(w,v);
 document.querySelectorAll('[data-hero]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.hero)===i)));
}
// Simple home loops. Manual choices restart the countdown; hovering never stops it.
const reducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)');
const homeFinishNames={io:['Sorbet','Outremer','Arlequin','Écarlate'],zamu:['Primaire','Corail','Plasma','Dragée'],enigma:['Outremer','Éclipse','Doodle','Néon']};
let homeSlides=[],homeSlideTimer=null;
function deferHomeSlide(id){const slide=homeSlides.find(s=>s.id===id);if(slide){slide.nextAt=Date.now()+slide.delay;slide.revision++}}
function fadeSlide(image){if(!reducedMotion?.matches)image.animate?.([{opacity:0},{opacity:1}],{duration:650,easing:'ease-out'})}
function slideIsVisible(slide){const frame=slide.root.querySelector('.work-visual')||slide.root,rect=frame.getBoundingClientRect();return Math.min(rect.bottom,window.innerHeight)-Math.max(rect.top,0)>=Math.min(160,rect.height*.35)}
function slideIsPaused(slide){return document.hidden||Boolean(document.querySelector('.menu-button[aria-expanded="true"]'))||expandedPalette===slide.id}

function advanceHomeSlide(slide){
 const revision=slide.revision,nextIndex=(heroActive+1)%heroItems.length;
 const w=slide.id==='hero'?WORKS[heroItems[nextIndex].id]:WORKS[slide.id];
 const sequence=homeFinishNames[w.id],current=cardChoices[w.id]||w.default;
 const name=slide.id==='hero'?heroItems[nextIndex].name:sequence[(sequence.indexOf(current)+1)%sequence.length];
 const v=w.variants.find(v=>v.name===name),preload=new window.Image();slide.pending=true;
 preload.onload=()=>{
  slide.pending=false;slide.nextAt=Date.now()+slide.delay;
  if(!homeSlides.includes(slide)||slide.revision!==revision||slideIsPaused(slide)||!slideIsVisible(slide))return;
  if(slide.id==='hero')setHero(nextIndex,true);else updateCardFinish(slide.root,w,v,true);
 };
 preload.onerror=()=>{slide.pending=false;slide.nextAt=Date.now()+slide.delay};
 preload.src=v.image;
}
function tickHomeSlides(){const now=Date.now();for(const slide of homeSlides){if(slideIsPaused(slide)||!slideIsVisible(slide)){slide.nextAt=now+slide.delay;continue}if(!slide.pending&&now>=slide.nextAt)advanceHomeSlide(slide)}}
function setupHomeSlides(){
 if(homeSlideTimer!==null)window.clearInterval(homeSlideTimer);homeSlideTimer=null;homeSlides=[];
 if(routeInfo().path!=='/'||typeof window.setInterval!=='function')return;
 homeSlides=Array.from(document.querySelectorAll('[data-slideshow-root]')).map((root,i)=>({root,id:root.dataset.slideshowRoot,delay:6000+i*900,nextAt:Date.now()+6000+i*900,pending:false,revision:0}));
 homeSlideTimer=window.setInterval(tickHomeSlides,500);
}
let heroActive=0;
document.addEventListener('click',event=>{
 const target=event.target;
 if(handleCookieClick(target))return;
 const pay=target.closest('#checkout-button');if(pay){startCheckout(pay);return}
 const menu=target.closest('.menu-button');if(menu){const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?t('Fermer le menu','Close menu'):t('Ouvrir le menu','Open menu'));document.getElementById('mobile-nav').classList.toggle('open',open);return}
 const openMenu=document.querySelector('.menu-button[aria-expanded="true"]');if(openMenu&&!target.closest('.site-header')){openMenu.setAttribute('aria-expanded','false');openMenu.setAttribute('aria-label',t('Ouvrir le menu','Open menu'));document.getElementById('mobile-nav').classList.remove('open')}
 const photo=target.closest('[data-photo]');if(photo){setPhoto(Number(photo.dataset.photo));return}
 const step=target.closest('[data-photo-step]');if(step){setPhoto(galleryIndex+Number(step.dataset.photoStep));return}
 const hero=target.closest('[data-hero]');if(hero){deferHomeSlide('hero');setHero(Number(hero.dataset.hero));return}
 const paletteToggle=target.closest('[data-palette-toggle]');if(paletteToggle){toggleCardPalette(paletteToggle);return}
 const cardSwatch=target.closest('[data-card-variant]');if(cardSwatch){selectCardFinish(cardSwatch);return}
 const variant=target.closest('[data-variant]');if(variant){const w=WORKS[variant.dataset.work],v=w.variants.find(c=>c.name===variant.dataset.variant);chooseProductFinish(w,v,variant.classList.contains('mobile-variant')?'mobile':'desktop');return}
 const zoom=target.closest('.zoom-button');if(zoom){const on=zoom.getAttribute('aria-pressed')!=='true';zoom.setAttribute('aria-pressed',String(on));zoom.setAttribute('aria-label',on?t('Réduire la sculpture','Reduce the sculpture'):t('Agrandir la sculpture','Enlarge the sculpture'));zoom.closest('.product-stage').classList.toggle('zoom',on);return}
 const link=target.closest('a');if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.target==='_blank'||link.hasAttribute('download'))return;
 const next=new URL(link.href,location.href);if(next.origin!==location.origin||!['http:','https:'].includes(next.protocol)||!/^\/(fr|en)(\/|$)/.test(next.pathname))return;
 if(link.dataset.language){try{localStorage.setItem('sculptlab-language',link.dataset.language)}catch{}}
 if(next.pathname===location.pathname&&next.search===location.search&&next.hash)return;
 event.preventDefault();const isLanguage=Boolean(link.dataset.language);const form=document.getElementById('contact-form');const draft=isLanguage&&form?Object.fromEntries(['name','email','message'].map(name=>[name,form.elements.namedItem(name).value])):null;
 const shipping=isLanguage?document.getElementById('shipping')?.value:null;
 history.pushState({},'',next.pathname+next.search+next.hash);render({scroll:!isLanguage});
 if(draft){const form=document.getElementById('contact-form');if(form)for(const [name,value] of Object.entries(draft))form.elements.namedItem(name).value=value}
 if(shipping!=null){const select=document.getElementById('shipping');if(select){select.value=shipping;updateShipping(select)}}
 if(isLanguage)document.querySelector('[data-language="'+language+'"]')?.focus({preventScroll:true});else document.getElementById('main')?.focus({preventScroll:true});
});
function updateShipping(select){const s=SHIPPING[Number(select.value)],base=select.dataset.price;document.getElementById('shipping-provider').textContent=s.provider;document.getElementById('shipping-price').textContent=money(s.price);document.getElementById('order-total').textContent=base===''?t('À confirmer','To be confirmed'):money(Number(base)+s.price)}
document.addEventListener('change',e=>{if(e.target.id==='shipping')updateShipping(e.target)});
let contactPending=false;
function setContactBusy(form,busy){
 if(!form)return;
 const button=form.querySelector('button[type="submit"]');button.disabled=busy;
 button.innerHTML=busy?t('Envoi en cours…','Sending…'):t('Envoyer mon message','Send my message')+' '+arrowRight;
 form.querySelectorAll('input:not([type="hidden"]),textarea').forEach(field=>field.disabled=busy);
 if(busy)form.setAttribute('aria-busy','true');else form.removeAttribute('aria-busy');
}
async function submitContact(form){
 if(contactPending||!form.reportValidity())return;
 const data=new FormData(form);if(data.get('_honey'))return;
 const controller=new AbortController(),timeout=window.setTimeout(()=>controller.abort(),20000);
 contactPending=true;setContactBusy(form,true);
 form.querySelector('#contact-status').textContent='';
 try{
  const response=await fetch('https://formsubmit.co/ajax/info@sculptlab.fr',{method:'POST',headers:{Accept:'application/json'},body:data,signal:controller.signal});
  const result=await response.json();
  if(!response.ok||![true,'true'].includes(result.success))throw new Error('Submission not accepted');
  const current=document.getElementById('contact-form')||form,status=current.querySelector('#contact-status');
  current.reset();status.dataset.state='success';status.textContent=t('Votre message a bien été envoyé. Merci.','Your message has been sent. Thank you.');
 }catch{
  const current=document.getElementById('contact-form')||form,status=current.querySelector('#contact-status');
  status.dataset.state='error';status.textContent=t('L’envoi n’a pas pu être confirmé. Votre texte est conservé. Réessayez ou écrivez à info@sculptlab.fr.','We could not confirm that your message was sent. Your text has been kept. Try again or email info@sculptlab.fr.');
 }finally{
  window.clearTimeout(timeout);contactPending=false;setContactBusy(form,false);
  const current=document.getElementById('contact-form');if(current&&current!==form)setContactBusy(current,false);
 }
}
document.addEventListener('submit',e=>{if(e.target.id!=='contact-form')return;e.preventDefault();return submitContact(e.target)});

document.addEventListener('pointerdown',()=>document.documentElement.classList.remove('keyboard-navigation'),{passive:true});
document.addEventListener('keydown',e=>{if(e.key==='Tab')document.documentElement.classList.add('keyboard-navigation');if(e.key==='Escape'){if(cookiePanelOpen&&e.target.closest('#cookie-panel')){closeCookiePanel();e.preventDefault();return}if(expandedPalette){const toggle=document.querySelector('[data-palette-toggle="'+expandedPalette+'"]');if(toggle){toggleCardPalette(toggle);e.preventDefault();return}}const menu=document.querySelector('.menu-button[aria-expanded="true"]');if(menu){menu.click();menu.focus()}}if(e.target.closest('.product-gallery')&&!e.target.closest('select,input,textarea')&&['ArrowLeft','ArrowRight'].includes(e.key)&&galleryPhotos.length>1){e.preventDefault();setPhoto(galleryIndex+(e.key==='ArrowRight'?1:-1))}});
let touchStart=null;
document.addEventListener('touchstart',e=>{if(e.target.closest('.product-stage,.hero-stage')&&e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY,hero:Boolean(e.target.closest('.hero-stage'))};else touchStart=null},{passive:true});
document.addEventListener('touchend',e=>{if(touchStart&&e.changedTouches.length){const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>55&&Math.abs(dx)>Math.abs(dy)*1.5){if(touchStart.hero){deferHomeSlide('hero');setHero(heroActive+(dx<0?1:-1));}else if(galleryPhotos.length>1)setPhoto(galleryIndex+(dx<0?1:-1))}}touchStart=null},{passive:true});
window.sculptlabConsent?.onChange(choice=>{if(!choice){cookieDismissed=false;scheduleCookiePrompt()}else{if(cookiePanelOpen)renderCookiePanel();if(choice.analytics)trackPurchase()}});
window.addEventListener('pageshow',event=>{if(event.persisted){checkoutPending=false;setCheckoutBusy(false)}});
window.addEventListener('popstate',()=>render());
render();
