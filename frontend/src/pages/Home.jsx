// >> KANIME REVIEW (comments only - no logic was changed)
// Legend: [FRONTEND] stays in React | [BACKEND] moves to Django | [DATABASE] stored permanently by Django
//         [CACHE] short-lived copy of outside data kept by the backend | [EXTERNAL] third-party service
//         [REMOVE LATER] delete once the backend replaces it

import { useEffect, useState } from "react";
import AnimeCard from "../components/animeCard";
import Search from "../components/search";
import Hero from "../components/hero";
// >> KANIME REVIEW: [FRONTEND - TEMPORARY] hard-coded placeholder data, used only for the age rating in Hero.
//    The real age rating is already in each slide (viewingAge). Replace this later.
import { animeList } from "../components/test";
import Genres from "../components/genre";
import {
  getTrendingAnime,
  getAnime,
  searchAnime,
  getLatestNews,
} from "../kitsu";
import AnimatedSvg from "../components/loading";
import { getAnimeNews } from "../components/animeNewsSimple";
import News from "../components/news";
import List from "../components/list";

// Lives OUTSIDE the component, so it survives leaving Home and coming back.
// Home is destroyed when you open the anime profile page; this is what
// stops everything from being fetched again when you return.

// this should go to the data base
// >> KANIME REVIEW: [FRONTEND] stays: it only stops React refetching when you navigate between pages.
//    [BACKEND + CACHE] the shared copy of anime data for ALL visitors moves to Django as a short-lived cache,
//    not a permanent [DATABASE] table (the data is Jikan's and changes constantly).
const saved = {
  trending: [],
  anime: [],
  latestNews: [],
  covers: null,
};

// this should go into the database
// >> KANIME REVIEW: [FRONTEND] stays, NOT database: translates your button labels to Jikan's spellings.
//    It never changes while the app runs and is not personal. If genre filtering moves to the backend later, this mapping moves with it, still not to the database.
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
// >> KANIME REVIEW: [FRONTEND now -> BACKEND later] reshapes external data. Later Django's catalog does this and returns this shape.
//    The few fields saved in a watchlist entry (id, name, url, ...) are what the [DATABASE] stores.
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

// ============================================================================
// STEP 2A: Home.jsx receives the lifted state via props from App.jsx
// ============================================================================
// - `bookmarked`: shared dictionary object passed down from App.jsx
// - `toggleBookmark`: shared updater function passed down from App.jsx
// >> KANIME REVIEW: [FRONTEND] page component. Bookmarks will arrive from the backend through the API instead of App's local copy.
function Home({ bookmarked, toggleBookmark }) {
  // this should go into database anything related to genres
  // >> KANIME REVIEW: [FRONTEND] stays: a fixed menu of filter buttons is screen configuration, not database data.
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

  // >> KANIME REVIEW: [REMOVE LATER] once the backend exists the [DATABASE] is the source of truth.
  //    A second copy in the browser can disagree with it.
  // Sync to localStorage as backup whenever bookmarks change
  useEffect(() => {
    try {
      // books marks stored should stay in the data base
      localStorage.setItem("bookmarks", JSON.stringify(bookmarked));
    } catch {
      // storage full or blocked: ignore, bookmarks just won't persist
    }
  }, [bookmarked]);

  // Every piece of data starts from the cache (empty on the very first visit)
  // >> KANIME REVIEW: [FRONTEND] the state variable stays. The DATA comes from a [BACKEND] trending endpoint (cached),
  //    not stored permanently in the [DATABASE].
  const [trendingAnime, setTrendingAnime] = useState(saved.trending); //trending anime should be inside the database
  const [anime, setAnime] = useState(saved.anime); //moved to the backend
  const [latestNews, setLatestNews] = useState(saved.latestNews); //stays in frontend
  const [covers, setCovers] = useState(saved.covers);

  // Trending and Discover now share ONE Jikan request (see kitsu.js), and every
  // Jikan call is queued and spaced out there, so no setTimeout is needed here.
  // If we already have cached trending data we are "done" straight away,
  // so the loading screen never shows when you come back to Home.
  const [trendingDone, setTrendingDone] = useState(saved.trending.length > 0);

  useEffect(() => {
    // >> KANIME REVIEW: [FRONTEND] decides WHEN to ask; [BACKEND] answers. getTrendingAnime will become a request to your own endpoint.
    if (saved.trending.length) return; // already cached
    getTrendingAnime()
      .then((data) => {
        saved.trending = data;
        setTrendingAnime(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setTrendingDone(true));
  }, []);

  useEffect(() => {
    if (saved.anime.length) return;
    // >> KANIME REVIEW: [BACKEND] same: this call becomes a request to the backend's anime list endpoint.
    getAnime(20).then((data) => {
      saved.anime = data;
      setAnime(data);
    });
  }, []);

  // Fetch news only for the visible section; avoid the unused duplicate ANN prefetch.
  useEffect(() => {
    if (saved.latestNews.length) return;
    // >> KANIME REVIEW: [FRONTEND for now -> BACKEND later] this triggers many Jikan calls per visitor (see kitsu.js).
    getLatestNews({ animeCount: 15 })
      .catch(() => []) // Jikan down: treat as no results
      .then((articles) => (articles.length ? articles : getAnimeNews(20)))
      .then((data) => {
        saved.latestNews = data;
        setLatestNews(data);
      })
      .catch(console.error);
  }, []);

  // >> KANIME REVIEW: [BACKEND later] enriching data with Kitsu banners is catalog work: do it once on the server,
  //    cache it, and send React ready-made cover URLs (today every visitor makes these calls).
  // Once trending arrives, search Kitsu for each title's banner.
  // Must stay ABOVE the early return below (hooks run on every render).
  useEffect(() => {
    if (trendingAnime.length === 0 || saved.covers) return;
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
      const result = Object.fromEntries(pairs);
      saved.covers = result; // keep it even if this component unmounted
      if (!cancelled) setCovers(result);
    });

    return () => {
      cancelled = true;
    };
  }, [trendingAnime]);

  // can stay in the frontend
  // >> KANIME REVIEW: [FRONTEND] agreed: shaping data for the hero slider is presentation.
  const slides = trendingAnime.slice(0, 3).map((a) => ({
    url:
      covers?.[a.mal_id] || // 1. Kitsu banner (wide, best for the hero)
      a.trailer?.images?.maximum_image_url || // 2. trailer thumbnail
      a.images?.webp?.large_image_url || // 3. poster
      a.images?.jpg?.large_image_url,
    description: a.synopsis || "",
    year: a.aired?.from || "",
    name: a.title_english || a.title || "Untitled",
    rating: Number(a.score) || 0, // hero calls .toFixed(1), so keep it a number
    viewingAge: a.rating || "PG-13",
    // The object that gets saved when you bookmark this slide.
    // Same shape as a Discover card, so List works for both.
    genres: [...(a.genres ?? []), ...(a.demographics ?? [])].map((g) => g.name),
    item: toItem(a),
    studio: a.studios?.[0]?.name || "Unknown",
    episodes: a.episodes ?? "?",
  }));

  // >> KANIME REVIEW: [FRONTEND] display shape.
  const animes = anime.map(toItem);

  // >> KANIME REVIEW: [FRONTEND] filtering 20 items on screen is fine. Only move to a [BACKEND] query if lists become large.
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
  // >> KANIME REVIEW: [DATABASE -> BACKEND -> FRONTEND] this list will come from the watchlist endpoint, owned by the logged-in user.
  const bookmarkedAnimes = Object.values(bookmarked);

  return (
    <>
      <header>
        {/* Keep the rest of Home usable while the external anime request runs. */}
        {slides.length > 0 ? (
          <Hero
            slides={slides}
            animeList={animeList}
            bookmarked={bookmarked}
            onToggle={toggleBookmark}
          />
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-text-secondary">
            {trendingDone ? (
              <p>Featured anime is temporarily unavailable.</p>
            ) : (
              <>
                <AnimatedSvg />
                <p>Loading featured anime...</p>
              </>
            )}
          </div>
        )}
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

export default Home;
