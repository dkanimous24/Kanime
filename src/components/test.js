import naruto from "../assets/images/naruto.avif";
import tokyoGhoul from "../assets/images/Tokyo-Ghoul.avif";
import jujutsuKaisen from "../assets/images/jujutsu-kaisen.webp";

export const animeList = [
  {
    id: 1,
    name: "Naruto",
    year: 2002,
    img: naruto,
    description:
      "A young outcast ninja dreams of becoming Hokage, the leader of his village, while battling powerful rivals and the demon fox sealed inside him.",
    rating: 8.3,
    viewingAge: "13+",
    studio: "Studio Pierrot",
    type: "Shonen",
    genre: ["Action", "Adventure", "Fantasy"],
    episodes: 220,
  },
  {
    id: 2,
    name: "Tokyo Ghoul",
    year: 2014,
    img: tokyoGhoul,
    description:
      "After a fateful encounter, college student Ken Kaneki becomes half-ghoul and must survive in a hidden world of flesh-eating monsters.",
    rating: 7.8,
    viewingAge: "17+",
    studio: "Studio Pierrot",
    type: "Seinen",
    genre: ["Action", "Horror", "Supernatural"],
    episodes: 12,
  },
  {
    id: 3,
    name: "Jujutsu Kaisen",
    year: 2020,
    img: jujutsuKaisen,
    description:
      "Yuji Itadori swallows a cursed object to save his friends and joins a school of sorcerers who fight deadly curses.",
    rating: 8.6,
    viewingAge: "16+",
    studio: "MAPPA",
    type: "Shonen",
    genre: ["Action", "Dark Fantasy", "Supernatural"],
    episodes: 24,
  },
];

export default animeList;
