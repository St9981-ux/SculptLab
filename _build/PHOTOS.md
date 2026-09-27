# Photographies des sculptures

Les galeries sont définies dans `data.js`, dans le tableau `photos` de chaque finition. Cela évite de montrer une autre couleur comme s’il s’agissait d’un angle de la pièce choisie.

Pour ajouter une vue, déposer une photographie optimisée dans `assets/`, puis ajouter un objet au tableau :

```js
{
  src: '/assets/io-sorbet-profil.webp',
  caption: 'Vue de profil',
  captionEn: 'Side view'
}
```

Cet exemple illustre le format ; le fichier doit être ajouté avant de référencer cette adresse. `image` reste la photographie principale de la finition dans les cartes et dans le récapitulatif d’acquisition. La signature SL accompagne les informations de l’œuvre dans ce même bloc. Le tableau `photos` alimente uniquement la galerie de la fiche Œuvres, avec toutes les variantes.

Chaque galerie affiche les miniatures disponibles et les flèches précédent / suivant de part et d’autre de la photo. À partir de deux photos, ces flèches deviennent actives. Pour une seule photo, elles restent discrètes et inactives. Les miniatures restent juste sous la photo, y compris sur téléphone. Les flèches du clavier et le balayage horizontal sur mobile permettent également de changer de vue. Aucun diaporama automatique et aucune rotation au survol. Les photos supplémentaires sont chargées à la demande ; les miniatures sont chargées paresseusement.

Les photos existantes en situation sont associées uniquement aux finitions correspondantes : Io Sorbet, Za’mu Brume et Enigma Nuit.

## Vues provisoires (27 septembre 2026)

Chaque sculpture a cinq vues provisoires, en blanc, ajoutées à la galerie de toutes ses finitions après la photo de la finition : `assets/vue-io-1.webp` à `vue-io-5.webp`, `vue-zamu-1…5`, `vue-enigma-1…5`, dans l’ordre face, trois quarts, profil, dos (ou autre côté), en situation. Elles portent `"placeholder": true` dans `data.js` et ne sont pas envoyées au sitemap.

Pour mettre les vraies photos : remplacer chaque fichier en gardant son nom (image carrée, 1600 px ou plus conseillés, WebP qualité 95 ; ne pas compresser davantage : les textures deviennent floues), ajuster si besoin la légende (`caption` / `captionEn`, utilisée pour le texte alternatif), retirer `"placeholder": true`, puis lancer `python3 _build/make-thumbs.py` et `npm run build`.

Après modification, créer les miniatures avec `python3 _build/make-thumbs.py` (400 px, qualité 90, dans `assets/thumbs/`), puis exécuter `npm run build` dans `_build/` pour vérifier les références et régénérer les pages FR / EN.
