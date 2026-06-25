# SculptLab — Worker de paiement (transporteur adapté au pays)

Petit endpoint serverless (Cloudflare Workers) qui crée une **Stripe Checkout
Session** en choisissant le **transporteur** et le **tarif de port** selon la
**zone de livraison** choisie par le client. Le prix de la sculpture est
recalculé côté serveur (jamais envoyé par le navigateur).

```
Page récap (GitHub Pages)  →  POST /create-checkout-session  →  Stripe Checkout
   { sculpture, color, lang, zone }            { url }
```

## Grille zones → transporteur → port

| Zone (`zone`) | Pays | Transporteur | Port |
|---|---|---|---|
| `fr`   | FR, MC | UPS Standard | 9,90 € |
| `eu`   | BE, LU, DE, NL, IT, ES, PT, AT, IE | DHL Express | 19,90 € |
| `chuk` | CH, GB | DHL Express | 29,90 € |
| `na`   | US, CA | UPS Standard | 49,90 € |

Pour changer un prix / un transporteur / un pays : éditer l'objet `ZONES` dans
`src/index.js`, puis redéployer (`npm run deploy`).

## Déploiement (mode test)

Prérequis : Node 18+, un compte **Cloudflare** (gratuit), ta **clé secrète
Stripe de test** (`sk_test_…`, dans Dashboard → Développeurs → Clés API).

```bash
cd worker
npm install                       # installe wrangler localement
npx wrangler login                # ouvre le navigateur, autorise Cloudflare
npx wrangler secret put STRIPE_SECRET_KEY   # coller la clé sk_test_…
npx wrangler deploy               # déploie ; note l'URL .workers.dev affichée
```

Le déploiement affiche une URL du type
`https://sculptlab-checkout.<ton-sous-domaine>.workers.dev`.

## Brancher le site

Dans `sl-head.js`, renseigner l'endpoint (racine du Worker + le chemin) :

```js
window.SL_CHECKOUT_ENDPOINT = 'https://sculptlab-checkout.<sous-domaine>.workers.dev/create-checkout-session';
```

Tant que cette constante est **vide**, le site garde l'ancien comportement
(Payment Links, sans choix de transporteur) — aucune régression.
Une fois renseignée, les pages récapitulatif affichent le **sélecteur de zone**
et passent par le Worker.

## Tester

Carte de test Stripe : `4242 4242 4242 4242`, date future, CVC quelconque.
Vérifier qu'en changeant de zone, le transporteur et le port changent au
checkout, et qu'après paiement on arrive sur `/merci.html`.

## Passage en production (plus tard)

1. `npx wrangler secret put STRIPE_SECRET_KEY` avec la clé **live** (`sk_live_…`).
2. Garder le même endpoint (ou un Worker dédié prod).
3. Les origines autorisées (CORS) couvrent déjà `sculptlab.fr`, `*.github.io`
   et `localhost` (voir `isAllowedOrigin` dans `src/index.js`).
