/* Collection SculptLab. Add views to each finish’s photos array; images are loaded on demand. */
const WORKS = {
  "io": {
    "name": "Io",
    "number": "01",
    "default": "Sorbet",
    "background": "#e3e8df",
    "description": "Il est des lieux que l’on ne trouve sur aucune carte. Io semble en garder le seuil.",
    "storyTitle": "Là veille Io.",
    "story": "À l'extrême occident du monde, là où l'horizon se dissout dans le néant, s'étend une prairie qu'aucun atlas n'ose nommer. Là veille Io, génisse mythique, immobile au seuil des choses. Son regard, vaste comme l'éternité, pénètre l'âme de quiconque ose s'y aventurer. Plonger dans cette immensité, murmure-t-on, c'est se révéler tout entier, dépouillé de mensonges. Certains fuient, d'autres s'attardent… mais tous finissent par se perdre dans son silence.",
    "id": "io",
    "legacy": "io1",
    "variants": [
      {
        "name": "Écarlate",
        "hex": "#f0000a",
        "source": "acquerir/io-ecarlate.webp",
        "edition": "open",
        "image": "/assets/acquerir-io-ecarlate.webp",
        "price": 455,
        "nameEn": "Scarlet",
        "photos": [
          {
            "src": "/assets/acquerir-io-ecarlate.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Pomme",
        "hex": "#82f032",
        "source": "acquerir/io-pomme.webp",
        "edition": "open",
        "image": "/assets/acquerir-io-pomme.webp",
        "price": 455,
        "nameEn": "Apple",
        "photos": [
          {
            "src": "/assets/acquerir-io-pomme.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Sorbet",
        "hex": "#aee6b8",
        "source": "acquerir/io.webp",
        "edition": "limited",
        "image": "/assets/acquerir-io.webp",
        "price": 855,
        "nameEn": "Sorbet",
        "photos": [
          {
            "src": "/assets/acquerir-io.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          },
          {
            "src": "/assets/iov1a.webp",
            "caption": "La sculpture dans son espace",
            "captionEn": "The sculpture in its setting"
          }
        ]
      },
      {
        "name": "Outremer",
        "hex": "#1f3fb5",
        "source": "acquerir/io-b.webp",
        "edition": "limited",
        "image": "/assets/acquerir-io-b.webp",
        "price": 855,
        "nameEn": "Ultramarine",
        "photos": [
          {
            "src": "/assets/acquerir-io-b.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Poudre",
        "hex": "#c8f0f0",
        "source": "acquerir/io-poudre.webp",
        "edition": "limited",
        "image": "/assets/acquerir-io-poudre.webp",
        "price": 855,
        "nameEn": "Powder",
        "photos": [
          {
            "src": "/assets/acquerir-io-poudre.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Arlequin",
        "hex": "#00bec8",
        "source": "acquerir/io-arlequin.webp",
        "edition": "unique",
        "image": "/assets/acquerir-io-arlequin.webp",
        "price": 1455,
        "nameEn": "Harlequin",
        "photos": [
          {
            "src": "/assets/acquerir-io-arlequin.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Berlingot",
        "hex": "#e6e600",
        "source": "acquerir/io-berlingot.webp",
        "edition": "unique",
        "image": "/assets/acquerir-io-berlingot.webp",
        "price": 1455,
        "nameEn": "Candy",
        "photos": [
          {
            "src": "/assets/acquerir-io-berlingot.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Cyan",
        "hex": "#00e6e6",
        "source": "acquerir/io-cyan.webp",
        "edition": "open",
        "image": "/assets/acquerir-io-cyan.webp",
        "price": 455,
        "nameEn": "Cyan",
        "photos": [
          {
            "src": "/assets/acquerir-io-cyan.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      }
    ],
    "descriptionEn": "There are places no map can hold. Io seems to guard their threshold.",
    "storyTitleEn": "There, Io keeps watch.",
    "storyEn": "At the far western edge of the world, where the horizon dissolves into nothingness, lies a meadow no atlas dares to name. There, Io keeps watch: a mythical heifer, motionless at the threshold of things. Her gaze, as vast as eternity, reaches into the soul of anyone who dares to venture there. To plunge into that immensity, they whisper, is to reveal oneself entirely, stripped of every lie. Some flee, others linger… but all, in the end, lose themselves in her silence."
  },
  "zamu": {
    "name": "Za’mu",
    "number": "02",
    "default": "Corail",
    "background": "#ebdfe6",
    "description": "Un visage offert au jour. Un autre, peut-être, qui attend de l’autre côté.",
    "storyTitle": "Tout masque est une porte.",
    "story": "Tout ce qui est profond aime le masque, et tout masque est une porte. Ce que tu vois n'est qu'un visage offert à la lumière. L'autre, le vrai, demeure dans l'ombre et attend que le souffle du monde lui rende vie. Il ne se livre pas, il se révèle par fragments, et dans ces fragments, celui qui approche découvre que l'ombre danse, bien souvent, avec le feu des étoiles.",
    "id": "zamu",
    "legacy": "zamu1",
    "variants": [
      {
        "name": "Acide",
        "hex": "#c6e63a",
        "source": "acquerir/zamu-acide.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-acide.webp",
        "price": 455,
        "nameEn": "Acid",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-acide.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Albizia",
        "hex": "#dc1e64",
        "source": "acquerir/zamu-albizia.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-albizia.webp",
        "price": 455,
        "nameEn": "Albizia",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-albizia.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Dragée",
        "hex": "#bfe6d4",
        "source": "acquerir/zamu-dragee.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-dragee.webp",
        "price": 455,
        "nameEn": "Sugar Almond",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-dragee.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Corail",
        "hex": "#fa8200",
        "source": "acquerir/zamu-corail.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-corail.webp",
        "price": 455,
        "nameEn": "Coral",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-corail.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Venin",
        "hex": "#7b3fa0",
        "source": "acquerir/zamu-venin.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-venin.webp",
        "price": 455,
        "nameEn": "Venom",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-venin.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Lagon",
        "hex": "#00a0a0",
        "source": "acquerir/zamu-lagon.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-lagon.webp",
        "price": 455,
        "nameEn": "Lagoon",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-lagon.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Givre",
        "hex": "#c9e2ef",
        "source": "acquerir/zamu-givre.webp",
        "edition": "limited",
        "image": "/assets/acquerir-zamu-givre.webp",
        "price": 855,
        "nameEn": "Frost",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-givre.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Plasma",
        "hex": "#1f6dff",
        "source": "acquerir/zamu-plasma.webp",
        "edition": "unique",
        "image": "/assets/acquerir-zamu-plasma.webp",
        "price": 1455,
        "nameEn": "Plasma",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-plasma.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Sable",
        "hex": "#f0c88c",
        "source": "acquerir/zamu-sable.webp",
        "edition": "unique",
        "image": "/assets/acquerir-zamu-sable.webp",
        "price": 1455,
        "nameEn": "Sand",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-sable.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Antipode",
        "hex": "#1e1e1e",
        "source": "acquerir/zamu-antipode.webp",
        "edition": "unique",
        "image": "/assets/acquerir-zamu-antipode.webp",
        "price": 1455,
        "nameEn": "Antipode",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-antipode.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Anémone",
        "hex": "#db9a78",
        "source": "acquerir/zamu-anemone.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-anemone.webp",
        "price": 455,
        "nameEn": "Anemone",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-anemone.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Parme",
        "hex": "#a06ec8",
        "source": "acquerir/zamu-parme.webp",
        "edition": "open",
        "image": "/assets/acquerir-zamu-parme.webp",
        "price": 455,
        "nameEn": "Lilac",
        "photos": [
          {
            "src": "/assets/acquerir-zamu-parme.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Brume",
        "hex": "#f4c2d4",
        "source": "image2a.webp",
        "edition": "limited",
        "image": "/assets/image2a.webp",
        "price": 855,
        "nameEn": "Mist",
        "photos": [
          {
            "src": "/assets/image2a.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          },
          {
            "src": "/assets/zamuv1a.webp",
            "caption": "La sculpture dans son espace",
            "captionEn": "The sculpture in its setting"
          }
        ]
      },
      {
        "name": "Primaire",
        "hex": "#e02828",
        "source": "image2b.webp",
        "edition": "limited",
        "image": "/assets/image2b.webp",
        "price": 855,
        "nameEn": "Primary",
        "photos": [
          {
            "src": "/assets/image2b.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      }
    ],
    "descriptionEn": "A face offered to the daylight. Another, perhaps, waiting on the other side.",
    "storyTitleEn": "Every mask is a doorway.",
    "storyEn": "All that is profound loves a mask, and every mask is a doorway. What you see is only a face offered to the light. The other, the true one, remains in shadow, waiting for the breath of the world to bring it to life. It does not give itself away; it reveals itself in fragments. And in those fragments, whoever draws near discovers that shadow often dances with the fire of the stars."
  },
  "enigma": {
    "name": "Enigma",
    "number": "03",
    "default": "Outremer",
    "background": "#e1e4eb",
    "description": "Une silhouette demeure, longtemps après que les yeux se sont fermés. Quelque chose nous regarde encore.",
    "storyTitle": "Cette présence…",
    "story": "Cette présence.. Son souvenir me glace encore, même aujourd'hui. Il se dressait, imposant, avec des cornes recourbées qui découpaient la nuit comme un croissant de lune. Son œil unique me transperçait, sondant les replis les plus secrets de mon être, comme s’il en était le maître. Autour de moi, tous se prosternaient, tremblants, et moi aussi je n'ai pas pu résister. Ce n’était ni de la foi ni seulement de la peur, mais la certitude d’être face à quelque chose qui me dépassait infiniment.",
    "id": "enigma",
    "legacy": "enigma1",
    "variants": [
      {
        "name": "Nova",
        "hex": "#e682aa",
        "source": "acquerir/enigma-nova.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-nova.webp",
        "price": 475,
        "nameEn": "Nova",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-nova.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Glitch",
        "hex": "#f09678",
        "source": "acquerir/enigma-glitch.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-glitch.webp",
        "price": 475,
        "nameEn": "Glitch",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-glitch.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Loop",
        "hex": "#826ec8",
        "source": "acquerir/enigma-loop.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-loop.webp",
        "price": 475,
        "nameEn": "Loop",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-loop.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Vapeur",
        "hex": "#6e96dc",
        "source": "acquerir/enigma-vapeur.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-vapeur.webp",
        "price": 475,
        "nameEn": "Vapour",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-vapeur.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Éclipse",
        "hex": "#f0d278",
        "source": "acquerir/enigma-eclipse.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-eclipse.webp",
        "price": 475,
        "nameEn": "Eclipse",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-eclipse.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Néon",
        "hex": "#3cb4b4",
        "source": "acquerir/enigma-neon.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-neon.webp",
        "price": 475,
        "nameEn": "Neon",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-neon.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Écho",
        "hex": "#bea0d2",
        "source": "acquerir/enigma-echo.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-echo.webp",
        "price": 475,
        "nameEn": "Echo",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-echo.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Majorelle",
        "hex": "#0032aa",
        "source": "acquerir/enigma-majorelle.webp",
        "edition": "open",
        "image": "/assets/acquerir-enigma-majorelle.webp",
        "price": 475,
        "nameEn": "Majorelle",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-majorelle.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Soleil",
        "hex": "#d4af37",
        "source": "acquerir/enigma-soleil.webp",
        "edition": "limited",
        "image": "/assets/acquerir-enigma-soleil.webp",
        "price": 925,
        "nameEn": "Sun",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-soleil.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Outremer",
        "hex": "#000aaa",
        "source": "acquerir/enigma-outremer.webp",
        "edition": "limited",
        "image": "/assets/acquerir-enigma-outremer.webp",
        "price": 925,
        "nameEn": "Ultramarine",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-outremer.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Vide",
        "hex": "#141414",
        "source": "acquerir/enigma-vide.webp",
        "edition": "limited",
        "image": "/assets/acquerir-enigma-vide.webp",
        "price": 925,
        "nameEn": "Void",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-vide.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Neige",
        "hex": "#e6e6e6",
        "source": "acquerir/enigma-neige.webp",
        "edition": "limited",
        "image": "/assets/acquerir-enigma-neige.webp",
        "price": 925,
        "nameEn": "Snow",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-neige.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Vague",
        "hex": "#003caa",
        "source": "acquerir/enigma-vague.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-vague.webp",
        "price": 1695,
        "nameEn": "Wave",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-vague.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Vibe",
        "hex": "#28b4c8",
        "source": "acquerir/enigma-vibe.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-vibe.webp",
        "price": 1695,
        "nameEn": "Vibe",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-vibe.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Zigzag",
        "hex": "#e6e6dc",
        "source": "acquerir/enigma-zigzag.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-zigzag.webp",
        "price": 1755,
        "nameEn": "Zigzag",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-zigzag.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Pulse",
        "hex": "#f0d26e",
        "source": "acquerir/enigma-pulse.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-pulse.webp",
        "price": 1695,
        "nameEn": "Pulse",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-pulse.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Plasma",
        "hex": "#dc0a0a",
        "source": "acquerir/enigma-plasma.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-plasma.webp",
        "price": 1455,
        "nameEn": "Plasma",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-plasma.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Pixel",
        "hex": "#e63c78",
        "source": "acquerir/enigma-pixel.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-pixel.webp",
        "price": 1755,
        "nameEn": "Pixel",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-pixel.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Electric",
        "hex": "#f4d000",
        "source": "acquerir/enigma-electric.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-electric.webp",
        "price": 1455,
        "nameEn": "Electric",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-electric.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Doodle",
        "hex": "#e6dcd2",
        "source": "acquerir/enigma-doodle.webp",
        "edition": "unique",
        "image": "/assets/acquerir-enigma-doodle.webp",
        "price": 1695,
        "nameEn": "Doodle",
        "photos": [
          {
            "src": "/assets/acquerir-enigma-doodle.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      },
      {
        "name": "Nuit",
        "hex": "#2d2d33",
        "source": "image3a.webp",
        "edition": "limited",
        "image": "/assets/image3a.webp",
        "price": 925,
        "nameEn": "Night",
        "photos": [
          {
            "src": "/assets/image3a.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          },
          {
            "src": "/assets/enigmav1a.webp",
            "caption": "La sculpture dans son espace",
            "captionEn": "The sculpture in its setting"
          }
        ]
      },
      {
        "name": "Aube",
        "hex": "#c5b3e0",
        "source": "image3b.webp",
        "edition": "limited",
        "image": "/assets/image3b.webp",
        "price": 925,
        "nameEn": "Dawn",
        "photos": [
          {
            "src": "/assets/image3b.webp",
            "caption": "Vue de la sculpture",
            "captionEn": "Sculpture view"
          }
        ]
      }
    ],
    "descriptionEn": "A silhouette lingers, long after the eyes have closed. Something is still watching us.",
    "storyTitleEn": "That presence…",
    "storyEn": "That presence… Its memory chills me still, even today. He stood there, imposing, his curved horns cutting through the night like a crescent moon. His single eye pierced me, probing the most secret folds of my being, as though he were their master. All around me, everyone bowed, trembling, and I too could not resist. It was neither faith nor merely fear, but the certainty of standing before something infinitely beyond me."
  }
};
