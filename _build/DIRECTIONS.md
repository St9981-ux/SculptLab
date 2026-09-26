# SculptLab — directions artistiques

## Finalisation pour sculptlab.fr — 26 septembre 2026

La version retenue (direction 03, commit ChatGPT `33d59a7`) remplace l'ancien site sur GitHub Pages.

- Le site est désormais à la racine du dépôt ; les scripts de génération sont dans `_build/`. `node prepare-static.mjs` écrit les pages à la racine.
- Paiement : « Finaliser ma commande » appelle directement le Worker Cloudflare existant (même zones, même prix recalculés côté serveur), puis Stripe Checkout. Les anciennes pages récapitulatives ne sont plus utilisées. Retour de Stripe : `/merci.html` → `/fr/merci/` ou `/en/thanks/`, conversion GA `purchase` uniquement avec consentement.
- Adresse de référence : `https://sculptlab.fr` (canonical, hreflang, Open Graph, sitemap).
- Ajouts : `sitemap.xml` et `robots.txt` générés, icônes PNG/ICO et `site.webmanifest` tirés du nouveau favicon, Open Graph sur toutes les pages, données structurées `ProductGroup` (44 finitions avec prix) sur les fiches et `Organization` sur l'accueil.
- Anciennes adresses (`io1.html`, `zamu2_summary.html`, `about.html`, `en/…`) : pages de redirection générées, qui conservent la couleur (`?couleur=`) ou reprennent la couleur par défaut de l'ancienne page. Les anciennes images restent à leur adresse.
- Retirés de la publication : `/mythes/` (direction 02) et `/premiere/`. Ils restent dans l'historique Git ChatGPT.
- `restore-first.mjs` et `.openai/hosting.json` (hébergement ChatGPT) ne sont pas repris.
- Référencement : titre et description propres à chaque page (FR/EN), `x-default` vers l'anglais, images de partage JPEG 1200×630, politique de retour et adresse dans les données structurées, sitemap avec images, robots.txt sans blocage, page 404. Les robots d'indexation ne sont pas redirigés par la détection de langue.

## Direction retenue — première proposition, évolutions FR / EN

La première direction claire et bleue est désormais la version principale. Le nom affiché est `SculptLab.`, la signature du pied de page est réduite et les photographies ne tournent plus au survol. Les trois récits fournis sont intégrés en français et traduits en anglais. La voix éditoriale est plus énigmatique et la citation de l’atelier reste sans attribution.

- `/fr/` : version française complète.
- `/en/` : version anglaise complète.
- `/` et les anciens liens, dont `/premiere/`, choisissent la langue d’après la préférence enregistrée, puis la langue principale du navigateur (français → FR ; autres langues → EN).
- Un lien explicite `/fr/` ou `/en/` respecte toujours la langue demandée. Le choix FR / EN est conservé localement et maintient la page et la finition consultées.
- `node prepare-static.mjs` génère les pages traduites et les accès historiques, puis vérifie les liens, les variantes, les galeries et la sélection de langue.

Les directions ci-dessous et le tag `direction-01` restent des repères historiques. `restore-first.mjs` restaure volontairement l’ancienne proposition sans ses évolutions ; il ne fait plus partie de la publication de la version retenue.

### Ajustements du 24 septembre 2026

L’agrandissement des images au survol est conservé sans rotation. Le titre d’accueil s’adapte à la largeur de sa colonne dans les deux langues. Sur mobile, un sélecteur horizontal de finitions reste directement sous la photographie ; le changement de couleur conserve la position de la page et du sélecteur. Les intitulés utilisent uniquement Io, Enigma et Za’mu avec leurs finitions, et les légendes génériques sous les images sont retirées.

La signature originale est présente sur l’accueil, dans l’atelier, au pied de page et dans le favicon. Le curseur rond d’origine est adapté au bleu et au jaune clair de la première direction. Les références géographiques décoratives sont retirées. `dist/legal.js` contient les 10 articles des CGV et les 7 rubriques des mentions légales, repris intégralement dans les deux langues depuis les textes du site d’origine ; leur lien vers les CGV est interne. Les données légales et les destinations de livraison conservent leurs indications géographiques.

### Ajustements de l’accueil et des finitions

La composition d’accueil s’adapte désormais à la hauteur de l’écran d’ordinateur. Le monogramme remplace le compteur dans le coin supérieur droit du cadre de l’œuvre et devient le seul signe graphique du bloc de présentation du pied de page. Le curseur rond utilise de petits SVG natifs, sans bordure ni élément animé suivant la souris.

Les pastilles des cartes permettent de prévisualiser toutes les finitions de Io, Za’mu et Enigma : photographie, intitulé, prix et liens vers la fiche sont mis à jour ensemble. Les choix sont conservés lors des changements de langue. Le repère des vignettes sélectionnées utilise la couleur de la finition. Les vérifications couvrent les changements de couleur sur les cartes et sur mobile, les galeries, les liens et les deux langues.

## Direction 01 — Galerie pop

### Bandeau compact, texte d’origine — 26 septembre 2026

À la demande de l’utilisateur, le bandeau reprend exactement « Nous utilisons des cookies pour améliorer votre expérience. En savoir plus. » avec les deux boutons « Refuser » et « OK ». La version anglaise reprend « We use cookies to improve your experience. Learn more. » et « Decline » / « OK ». Le titre, les catégories, la personnalisation et l’enregistrement détaillé sont supprimés. Une ligne compacte sur ordinateur, un court texte suivi des deux boutons sur smartphone, des marges réduites et aucune ombre remplacent le panneau précédent. Les boutons conservent une zone tactile de 44 px.

Le lien du pied de page rouvre ce même bandeau pour changer de décision. La gestion du consentement Analytics, son expiration et la suppression des cookies au retrait restent inchangées. Les contrôles FR / EN couvrent les deux seules actions, leur texte et le retrait après réouverture.

### Bandeau de consentement et Analytics d’origine — 26 septembre 2026

L’audit de `https://sculptlab.fr/`, `site.js` et `sl-head.js` a identifié Google Analytics `G-7BNG9RNN76`, la préférence `lang` et les deux anciens indicateurs `cookiesAccepted` / `cookiesRefused`. La nouvelle version reprend le même identifiant Analytics, avec un consentement limité à la mesure d’audience. Les consentements publicitaires et Google signals restent désactivés. Les anciens indicateurs sans date ni finalités précises ne sont pas assimilés à un nouvel accord.

Le bandeau FR / EN propose « Tout refuser », « Tout accepter » et « Personnaliser ». Les deux premiers boutons ont le même traitement visuel. La mesure d’audience n’est pas cochée par défaut. La présentation compacte laisse la page utilisable, attend la fin de l’apparition à l’accueil et s’adapte aux écrans étroits avec une hauteur limitée et un défilement interne. « Gérer les cookies » est accessible dans chaque pied de page et dans un complément aux mentions légales ; les textes d’origine des CGV et mentions légales restent intacts.

`dist/consent.js` ne charge aucune ressource Google avant un accord explicite valable. `sculptlab-consent` conserve séparément l’acceptation ou le refus, sa date, sa version et une échéance de six mois calendaires. Le choix est appliqué après rechargement et synchronisé entre onglets. Au retrait ou à l’expiration, le mécanisme documenté `ga-disable-G-7BNG9RNN76` désactive les envois, le consentement Analytics est refusé et les cookies `_ga` / `_ga_7BNG9RNN76` sont supprimés sur l’hôte et ses variantes de domaine. Aucun cookie de paiement ou d’authentification n’est supprimé. Les préférences fonctionnelles de langue et d’animation restent indépendantes.

La configuration Analytics limite la durée des cookies à la validité restante du choix et ne prolonge pas leur échéance à chaque visite. Elle conserve le suivi de navigation automatique de la propriété Google, sans ajouter de vues manuelles qui pourraient le doubler. Le réglage de mesure améliorée de cette propriété n’a pas été modifié ni inspecté dans le compte Google.

`node prepare-static.mjs` et `verify-consent.mjs` vérifient les décisions FR / EN, la réouverture, le refus par défaut, le retrait, l’expiration, le stockage indisponible, les choix périmés et les cookies effacés. Les appels Analytics sont simulés dans ces tests : aucun événement de test n’est envoyé au compte. L’aperçu supervisé étant indisponible, le rendu mobile n’a pas été inspecté en navigateur.

### L’apparition à l’arrivée — 26 septembre 2026

La première arrivée sur l’accueil d’une session dévoile la sculpture par une ouverture elliptique, pendant que le titre entre en deux temps. La sculpture ne tourne pas et ne se déplace pas. Le menu, les liens et les boutons restent disponibles, sans écran d’attente ni bouton « Entrer ». L’animation de la sculpture dure 1,25 s sur ordinateur et 1,1 s sur mobile ; la signature conserve sa place.

`dist/arrival.js` prépare cet effet avant le premier affichage puis le lance lorsque la photographie est prête. Un toucher, un clic, une touche ou un défilement l’arrête immédiatement. L’effet ne se répète pas au retour sur l’accueil, au changement de langue ou au rechargement pendant la même session. Les préférences de mouvement réduit, les liens avec ancre et les retours depuis le cache du navigateur affichent directement la composition. Une photographie lente, un stockage bloqué ou une initialisation interrompue ne peuvent maintenir le contenu masqué. Aucun média ni dépendance n’est ajouté.

Les contrôles de génération vérifient ce cycle en français et en anglais, ainsi que les interactions existantes. L’infrastructure d’aperçu supervisé reste indisponible : cette publication n’a pas fait l’objet d’une inspection visuelle animée en navigateur.

### Pastilles sans contour — 26 septembre 2026

Les pastilles de finition, y compris le bouton multicolore, sont désormais des aplats sans bordure ni ombre intérieure. Le cercle de sélection est remplacé par un petit trait sombre sous la couleur active. La navigation au clavier utilise ce même repère, un peu plus large et bleu pour distinguer le focus. Les dimensions des couleurs et les zones tactiles de 44 px sur mobile sont conservées ; le déploiement par édition reste inchangé.

### Accueil sans prix et palette déployable — 26 septembre 2026

Les prix sont retirés des cartes de l’accueil, y compris des libellés accessibles des couleurs. Ils restent présents dans la collection, sur les fiches et dans les récapitulatifs d’achat.

La pastille multicolore est désormais un bouton « + » qui déploie les pastilles de toutes les finitions à l’intérieur de la carte. La liste native est supprimée. La palette complète remplace les quatre aperçus et organise chaque couleur une seule fois dans son édition ; une seule pastille porte donc l’état sélectionné. Le bouton devient « − » pour refermer. Une palette reste ouverte pendant les comparaisons et Échap permet de la fermer. Ouvrir celle d’une autre sculpture ferme la précédente.

Le défilement de la sculpture concernée attend la fermeture de sa palette, afin de ne pas modifier une couleur pendant le choix. L’image, le nom et le lien vers l’œuvre suivent chaque sélection. La palette se replie sur plusieurs lignes sur téléphone. Les contrôles vérifient les 44 finitions FR/EN sur l’accueil et la collection, l’absence de prix sur l’accueil, l’ouverture/fermeture et le maintien du choix pendant la comparaison.

### Sélection unique et signature intégrée — 25 septembre 2026

Le « + » multicolore ne reçoit plus aucun cercle au clic. Le cercle de sélection est réservé à la couleur active. La navigation au clavier dispose d’un petit trait sous le « + », activé seulement après Tab et retiré dès une interaction au pointeur.

Sur Acquérir, la signature SL est placée sous les informations de l’œuvre, sur le même alignement que son titre et sa finition. Sa teinte vert graphite s’accorde au fond clair. Elle suit le contenu sur ordinateur et téléphone, sans placement absolu ni chevauchement de la sculpture. La page garde son image unique ; les galeries restent sur Œuvres.

### Récapitulatif signé et focus de la palette — 25 septembre 2026

Le grand contour bleu entourant la zone du sélecteur est supprimé. Au clavier, le focus se limite à un fin cercle sombre autour de la petite pastille, comme pour les autres couleurs.

La page Acquérir retrouve sa présentation antérieure : une seule image de la finition choisie avec son texte, complétée par la signature SL en bas de cette image. La galerie et ses flèches restent exclusivement sur la fiche Œuvres. Les vérifications contrôlent cette distinction pour les 44 finitions en français et en anglais.

### Simplification du défilement, formulaire et galeries — 25 septembre 2026

Les commandes pause/reprise ont été retirées. Le survol ne bloque plus le défilement sur ordinateur. Un choix manuel remet simplement le délai à zéro avant la reprise de la boucle. La réduction des animations supprime le fondu mais conserve le changement des images. Les pastilles ordinaires et la pastille multicolore « + » ont toutes un diamètre de 16 px ; le « + » n’a plus de disque intérieur ni de surdimensionnement.

Le formulaire reprend le service FormSubmit trouvé dans `https://sculptlab.fr/contact.html`, avec le destinataire `info@sculptlab.fr`, le sujet, le format de message et le champ anti-spam d’origine. L’envoi AJAX reste sur la page. Une confirmation n’est affichée qu’après acceptation explicite par le service. Les erreurs et délais dépassés conservent le texte, et les doubles clics sont bloqués. Les réponses sont testées avec un service simulé : aucun e-mail de test n’a été envoyé et la réception réelle n’a pas été vérifiée.

Les fiches et les récapitulatifs d’acquisition partagent la galerie de chaque finition. Flèches rondes gauche/droite au milieu de l’image, compteur et miniatures à proximité immédiate. La photo reste visible pendant le choix des finitions sur téléphone. Quand une seule photo existe, les flèches restent discrètes et inactives ; l’ajout des prochains angles les active automatiquement. Les vues fictives « À venir » du site d’origine ne sont pas reprises.

Les contrôles couvrent les 26 pages, 44 finitions FR/EN, la boucle sous le pointeur, les galeries des fiches et acquisitions, et les réponses de succès/erreur du formulaire. L’aperçu supervisé reste indisponible.

### Défilement de l’accueil et accès aux finitions — 25 septembre 2026

L’accueil fait défiler les trois sculptures dans l’ordre 01 → 02 → 03 → 01, toutes les six secondes environ. Les cartes de Io, Za’mu et Enigma alternent chacune entre quatre finitions choisies, avec des rythmes légèrement décalés. Les images suivantes sont chargées avant leur affichage. Les défilements se suspendent hors écran, dans un onglet masqué, au survol et au focus. Chaque image dispose d’une commande pause/reprise. Un choix manuel arrête le défilement concerné ; la préférence de réduction des animations désactive l’automatisme. Les pages de fiche et d’achat restent sans défilement automatique.

Chaque palette compacte se termine par une pastille multicolore « + », qui ouvre la liste complète des finitions regroupées par édition. Les fiches mobiles gardent toutes leurs vignettes et leurs trois éditions visibles.

Le bouton d’achat devient « Finaliser ma commande » / « Complete my order ». Le formulaire de contact prépare toujours un e-mail via la messagerie du visiteur ; son texte précise qu’il faut y confirmer l’envoi. Aucun service d’envoi direct n’est connecté et aucun e-mail de test n’a été envoyé.

Les vérifications couvrent la boucle de l’accueil, les liens des cartes, les pauses, la priorité des choix manuels, le changement de page pendant le chargement d’une image, la réduction des animations et la composition du brouillon d’e-mail FR/EN. Le service d’aperçu supervisé reste indisponible.

### Correction du sélecteur mobile — 25 septembre 2026

Les fiches mobiles montrent à nouveau toutes les finitions : 8 pour Io, 14 pour Za’mu et 22 pour Enigma. Les trois éditions sont affichées en sections ouvertes, avec le nom et la photo de chaque finition. La grille compte trois colonnes sur petit téléphone et quatre à partir de 480 px. La photo principale, la finition choisie et son prix restent visibles pendant le défilement des variantes. Les cartes de collection conservent leurs quatre couleurs rapides pour ne pas recréer une accumulation de pastilles.

La vérification de génération exige désormais que chaque finition figure dans son édition mobile ; elle exerce aussi les 44 choix en français et en anglais et vérifie l’image, le prix, le focus et l’absence de retour en haut de page. Le service d’aperçu reste indisponible : ces contrôles ne constituent pas une vérification visuelle sur téléphone.

### Raffinements du 25 septembre 2026 — priorité au smartphone

Le curseur reprend le cercle dessiné en CSS du site d’origine : tailles paires de 16, 28 et 12 pixels, suivi direct de la souris, sans bordure ni image de curseur. Il est désactivé sur tactile et en mode de réduction des animations. La signature du pied de page retrouve le vert clair.

Les cartes affichent quatre couleurs rapides, accompagnées d’un sélecteur natif donnant accès à toutes les finitions, regroupées par édition. Une couleur choisie dans la liste apparaît parmi les aperçus. Sur mobile, les fiches présentent le nom et le prix avant la photo, puis quatre vignettes et le même accès à toutes les finitions ; une sélection ne provoque aucun retour en haut de page.

L’accueil mobile est plus compact, accepte le balayage entre les trois œuvres et conserve un bouton de collection sous la photo. Navigation mobile fixe pendant le défilement, commandes tactiles agrandies, tailles de caractères adaptées, formulaires sans zoom automatique iOS, espaces de lecture et prise en compte des zones sûres. Les récits et documents légaux restent intégraux.

`npm run build` génère et vérifie les 26 pages FR/EN, 88 combinaisons finition/langue, sélections, galeries et gestes. `npm run dev` sert les pages statiques avec Vite pour les prochaines vérifications visuelles, sans l’ajouter aux fichiers publiés. Le service de navigateur supervisé était indisponible lors de cette modification ; aucun contrôle visuel dans le navigateur n’a pu être effectué.

Première proposition approuvée. Sauvegarde exacte au commit `2d55c38d6582fbc5139604f0786f04e3e974e597`, conservé par le tag `direction-01` et la branche `direction-01-galerie-pop`.

La première proposition est conservée intégralement dans Git. Le tag et la branche permettent de la retrouver à l’identique. L’adresse `/premiere/` suit désormais les évolutions de la version retenue. `node restore-first.mjs` permet uniquement de restaurer l’ancien état depuis le commit d’origine et vérifie son contenu historique.

## Direction 02 — Au seuil de l’invisible

Exploration sur la branche `direction-02-mythes`, accessible sous `/mythes/`. Typographie littéraire, compositions nocturnes et récits originaux des sculptures. Les deux directions partagent les photographies d’origine, mais possèdent leurs propres pages, styles, données de présentation et scripts.

Les commandes sont finalisées sur sculptlab.fr et le contact prépare un e-mail. Aucun paiement ni envoi de message n’est simulé.

## Direction 03 — Retour à l’identité SculptLab

Branche `direction-03-origines`. Proposition antérieure inspirée de la direction de sculptlab.fr : turquoise, jaune, rose et bleu clair, signature originale, typographie Jost et sculptures détourées. Navigation explicite, trois rencontres colorées, textes originaux complets dans les fiches et finitions nommées.

13 pages, avec une présentation adaptée aux écrans mobiles. `node prepare-static.mjs` prépare les pages et vérifie les 44 finitions, leurs récapitulatifs, les images et les liens internes. Les versions précédentes restent conservées dans leurs branches respectives.
