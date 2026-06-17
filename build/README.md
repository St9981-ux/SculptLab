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
  présent dans chaque page (éléments `data-i18n`).
- Corrige les chemins d'assets (`../`), passe la langue par défaut à l'anglais,
  ajuste canonical / Open Graph / locale vers `/en/`.
- Renseigne les méta SEO anglaises (title/description/keywords/OG/Twitter)
  depuis `build/en_meta.json`.

## Ajouter / modifier les méta SEO anglaises
Éditer `build/en_meta.json` (une entrée par page) puis relancer le build.

Pages générées : index, about, contact, purchase, io1, io2, zamu1, zamu2,
enigma1, enigma2. (cgv, mentions_legales, *_summary n'ont pas de version EN.)
