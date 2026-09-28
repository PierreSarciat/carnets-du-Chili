import { BASE_PATH } from '@/config';

export const regions = [
  {
    id: 'santiago',
    name: 'Santiago de Chile',

    x: 79,
    y: 42,

    anchorX: 52,
    anchorY: 40,

    title: 'Santiago de Chile',

    description: 'Lorem ipsum',

    photo_home: {
      previewSrc:
        `${BASE_PATH}assets/images/santiago/thumb/Gran-Torre-Santiago.webp`,
      alt: 'Santiago',
    },
  },

  {
    id: 'chiloe',
    name: 'Chiloé',

    x: 69,
    y: 65,

    anchorX: 36,
    anchorY: 65,

    title: 'Chiloé',

    description:
      "Ancré au sud-ouest du Chili, dans les îles éparses du Pacifique, Chiloé est un monde à part. Ici, les fjords serpentent entre des collines verdoyantes. L’archipel, bercé par l’isolement et le mystère, préserve une culture unique, où les églises en bois coloré, les maisons sur pilotis et les récits du *Caleuche* tissent une toile envoûtante entre réalité et rêve.",

    photo_home: {
      previewSrc:
        `${BASE_PATH}assets/images/chiloe/thumb/CHILOE_6.webp`,
      alt: 'CHILOÉ',
    },
  },

  {
    id: 'patagonie',
    name: 'Patagonie',

    x: 72,
    y: 75,

    anchorX: 40,
    anchorY: 10,

    title: 'Patagonie',

    description:
      "Le grand souffle du Sud : véritable continent rude et sauvage, jalonné de parcs nationaux, sa côte n'est qu'un dédale d'îles, de lagunes et de fjords.",

    photo_home: {
      previewSrc:
        `${BASE_PATH}assets/images/patagonie/thumb/PATAGONIE 35.webp`,
      alt: 'Patagonie',
    },
  },

  {
    id: 'puertowilliams',
    name: 'Puerto Williams',

    x: 77,
    y: 96,

    anchorX: 60,
    anchorY: 96,

    title: 'Puerto Williams',

    description:
      "Ville la plus australe du globe, Puerto Williams sert de point de départ pour explorer les paysages extrêmes de l’Antarctique et du cap Horn, dans une ambiance unique alliant isolement, culture maritime et panoramas à couper le souffle.",

    photo_home: {
      previewSrc:
        `${BASE_PATH}assets/images/puertowilliams/thumb/PUERTO WILLIAMS 8.webp`,
      alt: 'Puerto Williams',
    },
  },

  {
    id: 'torresdelpaine',
    name: 'Torres del Paine',

    x: 77,
    y: 86,

    anchorX: 42,
    anchorY: 200,

    title: 'TORRES DEL PAINE',

    description:
      "Célèbre pour ses tours de granit impressionnantes, ce parc national, classé au patrimoine mondial de l'UNESCO, recèle des glaciers grandioses, des rivières d'un bleu étincelant et une faune sauvage exceptionnelle.",

    photo_home: {
      previewSrc:
        `${BASE_PATH}assets/images/torresdelpaine/thumb/TORRES DEL PAINE 2.webp`,
      alt: 'TORRES DEL PAINE',
    },
  },
];