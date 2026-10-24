
import { BASE_PATH } from "@/config";

const santiago = {
  id: "santiago",
  name: "Santiago de Chile",
  subtitle: "",
  quote: {
        text: "Santiago, je ne nie point ta neige, ton soleil d'avril, tes dons noirs. ",
        original: "Santiago, no niego tu nieve, tu sol de Abril, tus dones negros.  ",
        author: "Pablo Neruda",
        source: "Canta Santiago, Aún, 1969",
    },

  photos: [
    {
      id: "santiago-1",
      thumbnailSrc: `${BASE_PATH}assets/images/santiago/thumb/Gran-Torre-Santiago.webp`,
      previewSrc: `${BASE_PATH}assets/images/santiago/thumb/Gran-Torre-Santiago.webp`,
      fullSrc: `${BASE_PATH}assets/images/santiago/full/Gran-Torre-Santiago.jpg`,
      title: "Santiago de Chile",
      alt: " "
    },
     {
      id: "santiago-2",
      thumbnailSrc: `${BASE_PATH}assets/images/santiago/thumb/campanile.webp`,
      previewSrc: `${BASE_PATH}assets/images/santiago/thumb/campanile.webp`,
      fullSrc: `${BASE_PATH}assets/images/santiago/full/campanile.jpg`,
      title: "campanile",
      alt: " "
    },
]
};

export default santiago;

