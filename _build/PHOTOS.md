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

Les photos existantes en situation sont associées uniquement aux finitions correspondantes : Io Sorbet, Za’mu Brume et Enigma Nuit. Aucune vue fictive n’est utilisée.

Après modification, exécuter `npm run build` dans `_build/` pour vérifier les références et régénérer les pages FR / EN.
