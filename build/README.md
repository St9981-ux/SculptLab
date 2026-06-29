# Build du site anglais (en/)

Les pages du dossier `en/` sont **générées** à partir des pages FR à la racine.
Ne pas éditer `en/*.html` à la main : modifier la page FR puis régénérer.

## Régénérer après toute modification d'une page FR
```bash
python3 build/build_en.py
```

## Ce que fait le build (source unique = pages FR)
- Copie la structure + le CSS + l'en-tête depuis la page FR (jamais de désync).
- Pré-rend les textes anglais depuis le dictionnaire `translations.en` déjà
  présent dans chaque page (éléments `data-i18n`, y compris contenu multi-lignes).
- Traduit les attributs `alt` statiques (FR→EN) et les blocs JSON-LD.
- Corrige les chemins d'assets (`../`), passe la langue par défaut à l'anglais,
  ajuste canonical / Open Graph / locale vers `/en/` (les pages `*2` pointent
  leur canonical vers `/en/*1`).
- Renseigne les méta SEO anglaises (title/description/keywords/OG/Twitter)
  depuis `build/en_meta.json`.

La redirection de langue et la déduplication `/index.html` ne sont PAS gérées
par le build : elles sont centralisées et bot-safe dans `sl-head.js`.

## Menus de navigation (source unique)
Les menus mobile et desktop proviennent de `build/partials/mobile-menu.html`
et `build/partials/header-menu.html`. Le build les réinjecte dans les pages FR
(en place) **et** dans les pages `en/`. Pour modifier un menu : éditer le
partial puis relancer `python3 build/build_en.py` (opération idempotente).

## Ajouter / modifier les méta SEO anglaises
Éditer `build/en_meta.json` (une entrée par page) puis relancer le build.

Pages générées (18) : index, about, contact, purchase, io1, io2, zamu1, zamu2,
enigma1, enigma2, cgv, mentions_legales, et les 6 `*_summary`.

## Vérifier la cohérence des prix / du port
Les prix, éditions et tarifs de port sont **dupliqués** (par nécessité) entre :
- `sl-head.js` (prix + éditions, affichage),
- `sl-checkout.js` (montants de port, affichage),
- `worker/src/index.js` (prix + éditions + port, facturation côté serveur).

Pour éviter qu'un prix **affiché** diffère du prix **débité**, lancer après toute
modification de prix/port :
```bash
python3 build/check_pricing.py
```
Le script affiche `✓` si tout concorde, sinon il liste les écarts et sort en
erreur (code 1). À lancer avant de déployer.
