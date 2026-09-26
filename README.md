# SculptLab — sculptlab.fr

Site statique publié par GitHub Pages depuis la racine de ce dépôt, avec le domaine `sculptlab.fr` (fichier `CNAME`).

## Organisation

| Emplacement | Rôle |
|---|---|
| `index.html`, `fr/`, `en/`, `oeuvres/`, `acquerir/`… | Pages générées (ne pas modifier à la main) |
| `app.js`, `data.js`, `style.css`, `consent.js`, `legal.js`… | Code et contenu du site |
| `data.js` | Œuvres, finitions, éditions, prix, photos |
| `assets/` | Photos et polices du site |
| `_build/` | Génération et vérifications (non publié) |
| `worker/` + `wrangler.toml` | Service de paiement Cloudflare + Stripe (non publié ; déployé par Cloudflare) |
| `io1.html`, `en/io1.html`, `merci.html`… | Redirections des anciennes adresses (générées) |
| Images à la racine, `acquerir/*.webp`, `commander/*.webp` | Anciennes images conservées pour Google Merchant Center et les partages existants |

## Modifier et vérifier

Node.js 20 ou plus récent.

    cd _build
    npm run build     # régénère les pages FR/EN, le sitemap, robots.txt, les redirections, et lance toutes les vérifications
    npm ci && npm run dev   # aperçu local (Vite)

Toujours lancer `npm run build` après une modification de `app.js`, `data.js` ou `legal.js`, puis publier les fichiers régénérés avec le reste.

## Paiement

La page Acquérir envoie `{ sculpture, color, lang, zone, cancel_url }` au Worker
`https://sculptlab-checkout.sculptlab.workers.dev/create-checkout-session`, qui recalcule le prix côté serveur et ouvre Stripe Checkout.
Après paiement, Stripe renvoie vers `/merci.html`, qui redirige vers `/fr/merci/` ou `/en/thanks/`.
La conversion Google Analytics `purchase` n'est envoyée qu'avec le consentement du visiteur.

**À garder identiques** si un prix ou un tarif change :
- prix et éditions : `data.js` et `worker/src/index.js` (`ED_MAP`, `PRICES`, `priceFor`) ;
- zones de livraison : `SHIPPING` dans `app.js` et `ZONES` dans `worker/src/index.js`.

Le Worker affiche le montant réellement facturé ; le site n'affiche qu'une estimation.

## Historique

Cette version a été conçue avec ChatGPT (septembre 2026), puis finalisée pour sculptlab.fr : paiement direct, adresse sculptlab.fr, sitemap, icônes, redirections, données structurées, retrait des brouillons `/mythes/` et `/premiere/`.
Le journal des choix de design est dans `_build/DIRECTIONS.md`. L'historique Git complet de la phase ChatGPT est dans l'export `sculptlab-history.bundle`.
