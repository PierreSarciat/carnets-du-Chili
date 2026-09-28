
import { BASE_PATH } from "@/config";

const santiago = {
  id: "santiago",
  name: "Santiago de Chile",
  subtitle: "",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit.Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",

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

