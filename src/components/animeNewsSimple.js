// Fetch anime news XML, pick the fields you want, return as JSON-ready objects.
// Runs in the browser through the Vite proxy (see vite.config.js, "/ann").
const FEED_URL = "/ann/all/rss.xml?ann-edition=us";
const ORIGIN = "https://www.animenewsnetwork.com";

// Grab the text inside <tag>...</tag> and strip any CDATA wrapper
const getTag = (xml, tag) => {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
};

// Grab an attribute value, e.g. getAttr(item, "media:thumbnail", "url")
const getAttr = (xml, tag, attr) => {
  const m = xml.match(new RegExp(`<${tag}\\b[^>]*\\b${attr}=["']([^"']+)["']`));
  return m ? m[1] : null;
};

// Turn escaped HTML (&lt;img ...&gt;) back into real HTML so we can search it
const decode = (s) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&");

// Make relative image URLs absolute
const absolute = (url) => {
  if (!url) return null;
  if (url.startsWith("//")) return "https:" + url;
  if (url.startsWith("/")) return ORIGIN + url;
  return url;
};

// Try every common place an RSS feed hides an image. Returns null if none.
const getImage = (item) => {
  // 1. <enclosure url="..." type="image/jpeg">  (only if it's an image)
  const enclosure = item.match(/<enclosure\b[^>]*>/)?.[0] || "";
  const fromEnclosure = /type=["']image\//.test(enclosure)
    ? getAttr(enclosure, "enclosure", "url")
    : null;

  // 2. <media:thumbnail url="..."> or <media:content url="...">
  const fromMedia =
    getAttr(item, "media:thumbnail", "url") ||
    getAttr(item, "media:content", "url");

  // 3. an <img src="..."> inside the description HTML
  const fromHtml = decode(item).match(/<img[^>]+src=["']([^"']+)["']/)?.[1];

  const found = fromEnclosure || fromMedia || fromHtml || null;
  return found ? absolute(decode(found)) : null;
};

async function getAnimeNews(limit = 10) {
  const res = await fetch(FEED_URL);
  if (!res.ok) throw new Error(`Feed request failed: ${res.status}`);
  const xml = await res.text();

  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
    .slice(0, limit)
    .map(([, item]) => ({
      title: getTag(item, "title"),
      link: getTag(item, "link"),
      summary: getTag(item, "description"),
      published: getTag(item, "pubDate"),
      author: getTag(item, "dc:creator") || getTag(item, "author") || null,
      image: getImage(item), // null when the feed has no image for this item
    }));
}

export { getAnimeNews };
