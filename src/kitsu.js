const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Top anime cache for Jikan
const JIKAN_ANIME_CACHE_KEY = "jikan-animecard-top-cache";
const JIKAN_CACHE_MS = 30 * 60 * 1000; // 30 minutes

async function fetchJikanWithRetry(url, retries = 3, delay = 800) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429 || res.status === 504 || res.status === 503) {
        await wait(delay * (i + 1));
        continue;
      }
      if (!res.ok) throw new Error(`Jikan failed with status ${res.status}`);
      const json = await res.json();
      if (json.data && Array.isArray(json.data)) {
        return json.data;
      }
      throw new Error(json.message || "Invalid Jikan data received");
    } catch (err) {
      if (i === retries - 1) throw err;
      await wait(delay * (i + 1));
    }
  }
  return [];
}

export const getTrendingAnime = async () => {
  try {
    const res = await fetch("https://api.jikan.moe/v4/top/anime");
    if (!res.ok) throw new Error(`Jikan failed with status ${res.status}`);
    const result = await res.json();
    return result.data || [];
  } catch (err) {
    console.warn("Failed to fetch trending anime from Jikan:", err);
    return [];
  }
};

// Fetch anime exclusively from Jikan API for AnimeCard
export const getAnime = async (limit = 20) => {
  // Check localStorage cache first
  try {
    const cached = JSON.parse(localStorage.getItem(JIKAN_ANIME_CACHE_KEY));
    if (
      cached &&
      Date.now() - cached.time < JIKAN_CACHE_MS &&
      cached.data?.length
    ) {
      return cached.data.slice(0, limit);
    }
  } catch {
    // ignore cache read error
  }

  // Fetch directly from Jikan with retry
  try {
    const data = await fetchJikanWithRetry(
      `https://api.jikan.moe/v4/top/anime?limit=${limit}`,
      3,
      800,
    );
    if (data && data.length > 0) {
      try {
        localStorage.setItem(
          JIKAN_ANIME_CACHE_KEY,
          JSON.stringify({ time: Date.now(), data }),
        );
      } catch {
        // ignore storage quota error
      }
      return data;
    }
  } catch (err) {
    console.error("Failed to fetch anime from Jikan for AnimeCard:", err);
  }

  // If live fetch failed, return any cached data even if older
  try {
    const cached = JSON.parse(localStorage.getItem(JIKAN_ANIME_CACHE_KEY));
    if (cached?.data?.length) {
      return cached.data.slice(0, limit);
    }
  } catch {
    // ignore
  }

  return [];
};

// Fetch anime using Kitsu API (kept for other components if needed)
export const getKitsuAnime = async (limit = 20) => {
  const res = await fetch(
    `https://kitsu.io/api/edge/anime?filter[status]=current&sort=-userCount&page[limit]=${limit}&page[offset]=0`,
    {
      headers: {
        Accept: "application/vnd.api+json",
      },
    },
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
  const data = json.data;
  return data;
};

// Latest anime news WITH images, from Jikan (MyAnimeList).
// Jikan has no "all news" endpoint, so we collect news from many anime and merge it.
// Jikan allows ~3 requests/second (60/minute), so we pause between calls and cache.

const CACHE_KEY = "jikan-news-cache";
const CACHE_MS = 30 * 60 * 1000; // reuse results for 30 minutes

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status}): ${url}`);
  return res.json();
}

// News for specific anime ids, merged, de-duplicated, newest first
async function getJikanNews(malIds, perAnime = 3) {
  const seen = new Set();
  const results = [];

  for (const id of malIds) {
    try {
      const json = await fetchJson(`https://api.jikan.moe/v4/anime/${id}/news`);
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
    await wait(400); // stay under Jikan's rate limit
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
    if (cached && Date.now() - cached.time < CACHE_MS) return cached.articles;
  } catch {
    // no cache or unreadable: fetch fresh
  }

  const top = await fetchJson(
    `https://api.jikan.moe/v4/top/anime?filter=airing&limit=${animeCount}`,
  );
  await wait(400);

  const articles = (
    await getJikanNews(
      top.data.map((a) => a.mal_id),
      perAnime,
    )
  ).slice(0, limit);

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ time: Date.now(), articles }),
    );
  } catch {
    // storage full or blocked: ignore
  }

  return articles;
}

export { getJikanNews, getLatestNews };
