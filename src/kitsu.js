// since everything here contains the what the user can
//  get and how whatever the user wants this will
// be the external API and will automatically be used for all request for the data base

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// JIKAN CORE
// Every Jikan call goes through jikanGet(), which gives you:
//   1. the Vite proxy ("/jikan" instead of https://api.jikan.moe)
//   2. a queue that spaces requests out (Jikan allows ~3 per second)
//   3. de-duplication (StrictMode runs effects twice; same URL = one request)
//   4. retry with backoff on 429 / 503 / 504 / network errors
// ---------------------------------------------------------------------------
const JIKAN = "/jikan/v4";
const GAP_MS = 400; // minimum time between two Jikan requests

let nextSlot = 0;

// Hands each call a start time at least GAP_MS after the previous one.
// It only schedules the START, so one hanging request can't block the rest.
const throttle = async (fn) => {
  const now = Date.now();
  const start = Math.max(now, nextSlot);
  nextSlot = start + GAP_MS;
  if (start > now) await wait(start - now);
  return fn();
};

// fetch that gives up after `ms` instead of hanging forever
const fetchWithTimeout = async (url, ms = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

const inflight = new Map(); // path -> Promise (shared by duplicate callers)

function jikanGet(path, retries = 3, delay = 1000, timeout = 8000) {
  if (inflight.has(path)) return inflight.get(path);

  const request = (async () => {
    let lastError;
    for (let i = 0; i < retries; i++) {
      try {
        const res = await throttle(() =>
          fetchWithTimeout(`${JIKAN}${path}`, timeout),
        );

        if (res.status === 429 || res.status === 503 || res.status === 504) {
          lastError = new Error(`Jikan busy (${res.status})`);
          console.warn(`[jikan] ${path} -> ${res.status}, retry ${i + 1}`);
          await wait(delay * (i + 1));
          continue;
        }
        if (!res.ok) throw new Error(`Jikan failed with status ${res.status}`);
        return await res.json();
      } catch (err) {
        lastError = err;
        const why = err.name === "AbortError" ? "timed out" : err.message;
        console.warn(`[jikan] ${path} failed (${why}), attempt ${i + 1}`);
        await wait(delay * (i + 1));
      }
    }
    throw lastError;
  })().finally(() => inflight.delete(path));

  inflight.set(path, request);
  return request;
}

// ---------------------------------------------------------------------------
// TOP ANIME (hero slides + Discover cards share this one request and cache)
// ---------------------------------------------------------------------------
const JIKAN_ANIME_CACHE_KEY = "jikan-animecard-top-cache";
const JIKAN_CACHE_MS = 30 * 60 * 1000; // 30 minutes

// stays in the front
const readAnimeCache = () => {
  try {
    return JSON.parse(localStorage.getItem(JIKAN_ANIME_CACHE_KEY));
  } catch {
    return null;
  }
};

// fetches animes from an api so should go the backend
export const getAnime = async (limit = 20) => {
  // 1. fresh cache
  const cached = readAnimeCache();
  if (cached?.data?.length && Date.now() - cached.time < JIKAN_CACHE_MS) {
    return cached.data.slice(0, limit);
  }

  // 2. live fetch
  try {
    // Keep the hero request within four seconds so a Jikan outage can't hold Home.
    const json = await jikanGet(`/top/anime?limit=${limit}`, 1, 1000, 4000);
    const data = Array.isArray(json.data) ? json.data : [];
    if (data.length > 0) {
      try {
        localStorage.setItem(
          JIKAN_ANIME_CACHE_KEY,
          JSON.stringify({ time: Date.now(), data }),
        );
      } catch {
        // storage full or blocked: ignore
      }
      return data;
    }
  } catch (err) {
    console.error("Failed to fetch anime from Jikan:", err);
  }

  // 3. live fetch failed: fall back to stale cache if there is any
  const stale = readAnimeCache();
  if (stale?.data?.length) return stale.data.slice(0, limit);

  // 4. last resort: Kitsu (already used by your search), reshaped like Jikan data
  try {
    const kitsu = await getKitsuAnime(limit);
    console.warn("[jikan] unreachable, using Kitsu fallback");
    return kitsu.map(kitsuToJikanShape);
  } catch (err) {
    console.error("Kitsu fallback failed too:", err);
  }

  return [];
};

// Makes a Kitsu anime look like a Jikan one so App.jsx's toItem() and slides
// code work unchanged. (Kitsu ids are used in place of MAL ids.)
// stay externals but used in the backend
const kitsuToJikanShape = (k) => {
  const a = k.attributes || {};
  const poster = a.posterImage?.large || a.posterImage?.original || null;
  return {
    mal_id: `kitsu-${k.id}`,
    title: a.canonicalTitle,
    title_english: a.titles?.en || a.titles?.en_us || a.canonicalTitle,
    images: { jpg: { large_image_url: poster, image_url: poster } },
    score: a.averageRating ? Number(a.averageRating) / 10 : null,
    episodes: a.episodeCount ?? null,
    synopsis: a.synopsis || "",
    aired: { from: a.startDate || "" },
    rating: a.ageRating || "PG-13",
    genres: [],
    demographics: [],
    themes: [],
    studios: [],
  };
};

// Trending = same list as Discover, so it reuses the same request + cache
// instead of hitting /top/anime a second time.
export const getTrendingAnime = () => getAnime(20);

// ---------------------------------------------------------------------------
// KITSU (search + banners). Kitsu is a different API and is not rate limited
// the same way, so it stays a direct fetch.
// ---------------------------------------------------------------------------
// this should be external and should be used in the backend
export const getKitsuAnime = async (limit = 20) => {
  const res = await fetch(
    `https://kitsu.io/api/edge/anime?filter[status]=current&sort=-userCount&page[limit]=${limit}&page[offset]=0`,
    { headers: { Accept: "application/vnd.api+json" } },
  );
  if (!res.ok) throw new Error(`Kitsu failed with status ${res.status}`);
  const result = await res.json();
  return result.data || [];
};

export const searchAnime = async (query) => {
  const res = await fetch(
    `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=10`,
  );
  if (!res.ok) {
    throw new Error("something went wrong");
  }
  const json = await res.json();
  return json.data;
};

// ---------------------------------------------------------------------------
// NEWS (with images) from Jikan
// Jikan has no "all news" endpoint, so we collect news from many anime and
// merge it. The queue above already keeps us under the rate limit.
// ---------------------------------------------------------------------------
const CACHE_KEY = "jikan-news-cache";
const CACHE_MS = 30 * 60 * 1000; // reuse results for 30 minutes

// News for specific anime ids, merged, de-duplicated, newest first
async function getJikanNews(malIds, perAnime = 3) {
  const seen = new Set();
  const results = [];

  for (const id of malIds) {
    try {
      const json = await jikanGet(`/anime/${id}/news`);
      for (const n of (json.data || []).slice(0, perAnime)) {
        if (seen.has(n.url)) continue; // same article can be tagged to several anime
        seen.add(n.url);
        results.push({
          title: n.title,
          link: n.url,
          summary: n.excerpt,
          published: n.date,
          author: n.author_username || null,
          // handles both possible shapes of the images field
          image: n.images?.jpg?.image_url || n.images?.image_url || null,
        });
      }
    } catch (err) {
      console.error(`News failed for anime ${id}`, err); // skip it, keep going
    }
  }

  return results.sort((a, b) => new Date(b.published) - new Date(a.published));
}

// Latest news across the top currently-airing anime
async function getLatestNews({
  animeCount = 15,
  perAnime = 3,
  limit = 20,
} = {}) {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (cached?.articles?.length && Date.now() - cached.time < CACHE_MS) {
      return cached.articles;
    }
  } catch {
    // no cache or unreadable: fetch fresh
  }

  const top = await jikanGet(`/top/anime?filter=airing&limit=${animeCount}`);

  const articles = (
    await getJikanNews(
      top.data.map((a) => a.mal_id),
      perAnime,
    )
  ).slice(0, limit);

  // only cache a real result, so one bad run doesn't stick for 30 minutes
  if (articles.length) {
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ time: Date.now(), articles }),
      );
    } catch {
      // storage full or blocked: ignore
    }
  }

  return articles;
}

export { getJikanNews, getLatestNews };

// const options = {
//   method: "GET",
//   headers: {
//     // 1. Fixed the host to target the specific Anime Streaming API gateway
//     "x-rapidapi-host": "anime-streaming.p.rapidapi.com",
//     "x-rapidapi-key": "", // Make sure to replace this with your real key
//   },
// };

// export const fetchStreamingLink = async () => {
//   try {
//     // 2. Fixed the target URL to point to the correct endpoint
//     const response = await fetch("https://rapidapi.com", options);

//     // 3. Added 'await' so it waits for the JSON to finish translating
//     const result = await response.json();

//     console.log(result);
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// };

export const seachAnimeJikan = async () => {
  const data = fetch(`https://api.jikan.moe/v4/anime/{id}/full`);
  const result = await data.json();
  return result;
};
// Call the function to execute it
//  fetchStreamingLink();
