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

## Sécurité / anti-fraude

Le Worker est volontairement restrictif sur les paiements (paniers à forte
valeur) :

- **Moyens de paiement en liste blanche** (`payment_method_types` dans
  `src/index.js`) : `card`, `link`, `bancontact`, `eps`. Bancontact/EPS sont des
  redirections bancaires authentifiées (quasi aucun chargeback possible) et ne
  s'affichent qu'aux clients concernés. **Klarna/BNPL et les méthodes hors zone
  (kakao_pay, naver_pay, payco, blik, samsung_pay…) sont exclus** car elles
  augmentent le risque de litige « non reçu ». Pour ajouter une méthode :
  compléter ce tableau **et** l'activer dans Dashboard → Réglages → Moyens de
  paiement.
- **3D Secure forcé** sur toutes les cartes (`request_three_d_secure: 'any'`) :
  l'authentification forte fait basculer la responsabilité d'une fraude sur la
  banque émettrice, y compris pour les cartes hors UE.
- **Adresse de facturation obligatoire** + collecte du téléphone + livraison
  limitée aux pays de la zone choisie (contrôles AVS côté Stripe).

À compléter dans le **Dashboard Stripe** (non gérable par le code) :
Radar → ajouter des règles (bloquer si risque « highest », mettre en revue si
risque « elevated », bloquer si CVC ou code postal échoue).

## Webhook de confirmation de commande

Le worker expose aussi `POST /webhook` : Stripe l'appelle après chaque
paiement, c'est la **confirmation fiable** (indépendante du retour du client
sur `/merci.html`). La signature est vérifiée (HMAC-SHA256) ; sur
`checkout.session.completed` payé, un récap de commande est envoyé vers
`ORDER_NOTIFY_URL` si défini.

**Mise en place :**
1. Dashboard Stripe → **Développeurs → Webhooks → Add endpoint**
   - URL : `https://sculptlab-checkout.<sous-domaine>.workers.dev/webhook`
   - Événement : `checkout.session.completed`
   - Copier le **signing secret** affiché (`whsec_…`).
2. L'ajouter au worker **en type Secret (chiffré)** :
   - Dashboard Cloudflare → worker → Settings → Variables and Secrets →
     `STRIPE_WEBHOOK_SECRET` = `whsec_…` (type **Secret**, pas Texte), ou
     `npx wrangler secret put STRIPE_WEBHOOK_SECRET`.
3. (Optionnel) Pour être notifié à chaque commande, ajouter `ORDER_NOTIFY_URL`
   = l'URL d'un webhook **Discord** ou **Slack** (le message est compatible avec
   les deux). Sans cette variable, le webhook vérifie et répond 200 sans notifier.

> ⚠️ Toujours mettre `STRIPE_SECRET_KEY` et `STRIPE_WEBHOOK_SECRET` en type
> **Secret (chiffré)**. Une variable en clair est réécrite/vidée à chaque
> déploiement Wrangler — un Secret chiffré, jamais.

## Passage en production (plus tard)

1. `npx wrangler secret put STRIPE_SECRET_KEY` avec la clé **live** (`sk_live_…`).
2. Garder le même endpoint (ou un Worker dédié prod).
3. Les origines autorisées (CORS) couvrent déjà `sculptlab.fr`, `*.github.io`
   et `localhost` (voir `isAllowedOrigin` dans `src/index.js`).
