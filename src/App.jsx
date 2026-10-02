import { useEffect, useState } from "react";
import "./App.css";
import Nav from "./components/nav";
import AnimeCard from "./components/animeCard";
import Search from "./components/search";
import Hero from "./components/hero";
import { animeList } from "./components/test";
import Genres from "./components/genre";
import {
  getTrendingAnime,
  getAnime,
  searchAnime,
  getLatestNews,
} from "./kitsu";
import AnimatedSvg from "./components/loading";
import { getAnimeNews } from "./components/animeNewsSimple";
import News from "./components/news";
import List from "./components/list";

const LABEL_MAP = {
  shonen: ["shounen"],
  shojou: ["shoujo"],
  "slice of life": ["slice of life"],
  adventure: ["adventure"],
  romance: ["romance"],
  comedy: ["comedy"],
  fantasy: ["fantasy"],
  isekai: ["isekai"],
  drama: ["drama"],
};

// ONE shape for every anime, used by the Discover cards, the hero bookmark
// and the saved list. Because the hero and Discover build the same object
// (same name key), a bookmark made in one place shows up in the other.
const toItem = (a) => ({
  id: a.mal_id,
  url:
    a.images?.webp?.large_image_url ||
    a.images?.jpg?.large_image_url ||
    a.images?.webp?.image_url ||
    a.images?.jpg?.image_url,
  name: a.title_english || a.title || "Untitled",
  rating: a.score ? Number(a.score).toFixed(1) : "N/A",
  episodes: a.episodes ?? "?",
  genre: a.genres?.[0]?.name || a.demographics?.[0]?.name || "Shonen",
  tags: [
    ...(a.genres ?? []),
    ...(a.demographics ?? []),
    ...(a.themes ?? []),
  ].map((g) => g.name.toLowerCase()),
});

function App() {
  const genres = [
    "all",
    "shonen",
    "shojou",
    "slice of life",
    "adventure",
    "romance",
    "comedy",
    "fantasy",
    "isekai",
    "drama",
  ];

  const [selected, setSelected] = useState("all");

  // Bookmarks: { "Naruto": { ...full anime object }, ... }
  // Loaded from localStorage once, on first render.
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarks"));
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  });

  // Save every time bookmarks change.
  useEffect(() => {
    try {
      localStorage.setItem("bookmarks", JSON.stringify(bookmarked));
    } catch {
      // storage full or blocked: ignore, bookmarks just won't persist
    }
  }, [bookmarked]);

  // Takes the whole anime object. Adds it if missing, removes it if present.
  const toggleBookmark = (item) =>
    setBookmarked((prev) => {
      const next = { ...prev };
      if (next[item.name]) delete next[item.name];
      else next[item.name] = item;
      return next;
    });

  const [trendingAnime, setTrendingAnime] = useState([]);
  const [anime, setAnime] = useState([]);
  const [news, setNews] = useState([]);
  const [latestNews, setLatestNews] = useState([]);
  const [covers, setCovers] = useState(null);

  useEffect(() => {
    setTimeout(() => getTrendingAnime().then(setTrendingAnime), 1000);
  }, []);

  useEffect(() => {
    getAnime(20).then(setAnime);
  }, []);

  useEffect(() => {
    (async () => {
      getAnimeNews()
        .then(setNews)
        .catch((err) => console.error(err));
    })();
  }, []);

  useEffect(() => {
    getLatestNews({ animeCount: 15 })
      .catch(() => []) // Jikan down: treat as no results
      .then((articles) => (articles.length ? articles : getAnimeNews(20)))
      .then(setLatestNews)
      .catch(console.error);
  }, []);

  // Once trending arrives, search Kitsu for each title's banner.
  // Must stay ABOVE the early return below (hooks run on every render).
  useEffect(() => {
    if (trendingAnime.length === 0) return;
    let cancelled = false;

    Promise.all(
      trendingAnime.slice(0, 3).map(async (a) => {
        try {
          const results = await searchAnime(a.title_english || a.title);
          const cover = results[0]?.attributes?.coverImage;
          return [a.mal_id, cover?.original || cover?.large || null];
        } catch {
          return [a.mal_id, null];
        }
      }),
    ).then((pairs) => {
      if (!cancelled) setCovers(Object.fromEntries(pairs));
    });

    return () => {
      cancelled = true;
    };
  }, [trendingAnime]);

  const slides = trendingAnime.slice(0, 3).map((a) => ({
    url:
      covers?.[a.mal_id] || // 1. Kitsu banner (wide, best for the hero)
      a.trailer?.images?.maximum_image_url || // 2. trailer thumbnail
      a.images?.webp?.large_image_url || // 3. poster
      a.images?.jpg?.large_image_url,
    description: a.synopsis || "",
    year: a.aired?.from || "",
    name: a.title_english || a.title || "Untitled",
    rating: a.score ?? "N/A",
    viewingAge: a.rating || "PG-13",
    // The object that gets saved when you bookmark this slide.
    // Same shape as a Discover card, so List works for both.
    genres: [...(a.genres ?? []), ...(a.demographics ?? [])].map((g) => g.name),
    item: toItem(a),
    studio: a.studios?.[0]?.name || "Unknown",
    episodes: a.episodes ?? "?",
  }));

  if (slides.length === 0 || covers === null)
    return (
      <>
        <div className="flex flex-row justify-self-center absolute transform translate-x-[1/2] w-124 h-125 translate-y-[1/2] mt-[10%]">
          <div className="">
            <AnimatedSvg />
            <p className="justify-self-center absolute top-80"> Loading...</p>
          </div>
        </div>
      </>
    );

  const animes = anime.map(toItem);

  const filteredAnimes =
    selected === "all"
      ? animes
      : animes.filter((a) =>
          a.tags.some((t) =>
            (
              LABEL_MAP[selected.toLowerCase()] ?? [selected.toLowerCase()]
            ).includes(t),
          ),
        );

  // Comes straight from saved data, so it survives refreshes and
  // doesn't depend on what the API returns today.
  const bookmarkedAnimes = Object.values(bookmarked);

  return (
    <>
      <Nav />
      <header>
        <Hero
          slides={slides}
          animeList={animeList}
          bookmarked={bookmarked}
          onToggle={toggleBookmark}
        />
        <Search />
      </header>
      <div className=" sm:max-w-[300px] justify-self-center mx-auto md:max-w-[1200px] md:mx-auto mt-[64px]">
        <Genres genres={genres} selected={selected} onSelected={setSelected} />
        <h1 className="md:text-4xl md:font-bold my-6 mt-24 md:mt-4 text-2xl p-4 text-center md:text-left">
          Discover your favorite anime
        </h1>
        <section className="grid grid-cols-2 md:grid-cols-5 sm:grid-cols-1 gap-4 p-3 mb-[48px] mt-6 md:mt-0 min-h-[200px]">
          {animes.length > 0 ? (
            <AnimeCard
              animes={filteredAnimes}
              bookmarked={bookmarked}
              onToggle={toggleBookmark}
            />
          ) : (
            <div className="col-span-full flex justify-center items-center py-12">
              <span className="loader"></span>
            </div>
          )}
        </section>

        <h1 className="md:text-4xl text-2xl p-4 text-center md:text-left font-bold">
          Anime News
        </h1>
        <section className="md:font-bold my-6 mmt-5 md:mt-4 md:flex gap-3">
          {latestNews.length !== 0 ? (
            <News news={latestNews.slice(0, 3)} />
          ) : (
            <span className="loader"></span>
          )}
          <List list={bookmarkedAnimes} />
        </section>
      </div>
    </>
  );
}

export default App;
