
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
      id: "santiago-campanile",
      thumbnailSrc: `${BASE_PATH}assets/images/santiago/thumb/campanile.webp`,
      previewSrc: `${BASE_PATH}assets/images/santiago/thumb/campanile.webp`,
      fullSrc: `${BASE_PATH}assets/images/santiago/full/campanile.jpeg`,
      title: "Santiago de Chile campanile",
      alt: "Santiago de Chile campanile"
    },
    {
      id: "santiago-gran-torre-santiago",
      thumbnailSrc: `${BASE_PATH}assets/images/santiago/thumb/Gran-Torre-Santiago.webp`,
      previewSrc: `${BASE_PATH}assets/images/santiago/thumb/Gran-Torre-Santiago.webp`,
      fullSrc: `${BASE_PATH}assets/images/santiago/full/Gran-Torre-Santiago.jpeg`,
      title: "Santiago de Chile Gran-Torre-Santiago",
      alt: "Santiago de Chile Gran-Torre-Santiago"
    },
  ]
};

export default santiago;
