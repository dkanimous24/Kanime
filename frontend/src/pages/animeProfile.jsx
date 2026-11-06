import { useParams } from "react-router-dom";
import bookmarkOpen from "../components/bookmarkOpen";
import { useEffect, useState } from "react";
import { getCatalogAnimeDetails } from "../api";
import bookmarkClosed from "../components/bookmarkClosed";

const AnimeProfile = ({ bookmarked, toggleBookmark }) => {
  const { source, outside_id } = useParams();

  console.log("Anime source:", source);
  console.log("Anime ID:", outside_id);

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getCatalogAnimeDetails(source, outside_id)
      .then((res) => {
        if (!cancelled) {
          setAnime(res.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Anime details failed", err);
          setError("Unable to load anime details.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [source, outside_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <p className="text-text-secondary text-lg animate-pulse">
          Loading anime details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <p className="text-error text-lg">{error}</p>
      </div>
    );
  }

  if (!anime) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <p className="text-text-secondary">Anime not found.</p>
      </div>
    );
  }

  const bookmarkItem = {
    id: anime.outside_id,
    source: anime.source,
    outside_id: anime.outside_id,
    name: anime.title,
    title: anime.title,
    url: anime.poster,
    episodes: anime.episodes,
  };

  const isBookmarked = !!bookmarked[`${anime.source}:${anime.outside_id}`];

  return (
    <>
      <div className="min-h-screen bg-primary text-text-primary pb-20">
        {/* ANIME COVER SECTION */}
        <div className="relative w-full h-125 md:h-85 sm:h-100 lg:h-115 overflow-hidden bg-secondary">
          <img
            src={anime.cover || anime.poster}
            alt={anime.title}
            className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-[1.02] "
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-primary via-primary/60 to-primary/20"></div>

          {/* Anime title and information */}
          <div className="absolute inset-0 flex items-end">
            <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-8 sm:pb-12">
              <div className="max-w-4xl">
                <p className="text-accent text-xs sm:text-sm font-bold uppercase tracking-[0.2em] mb-3">
                  Anime Details
                </p>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight drop-shadow-lg">
                  {anime.title}
                </h1>

                {/* Anime metadata */}
                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <span className="flex items-center gap-2 bg-warning/10 border border-warning/20 text-warning px-3 py-1.5 rounded-lg text-sm font-semibold">
                    ★{" "}
                    {anime.score != null
                      ? Number(anime.score).toFixed(1)
                      : "N/A"}
                  </span>

                  <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-sm text-text-primary">
                    {anime.age_rating ?? "N/A rating"}
                  </span>

                  <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-sm text-text-primary">
                    {anime.episodes ?? "?"} Episodes
                  </span>

                  <span className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-sm text-text-primary">
                    {anime.year || "Unknown year"}
                  </span>
                </div>

                {/* Bookmark button */}
                <div className="mt-6">
                  <button
                    onClick={() => {
                      toggleBookmark(bookmarkItem);
                    }}
                    className="flex items-center justify-center gap-3 bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-xl shadow-lg shadow-accent/15 transition-all duration-300 hover:-translate-y-1 hover:shadow-accent/30 cursor-pointer"
                  >
                    {isBookmarked ? bookmarkClosed() : bookmarkOpen()}

                    {isBookmarked ? "In Your Watchlist" : "Add to Watchlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row items-start gap-6 lg:gap-8 mt-6 lg:mt-8">
            {/* ANIME POSTER */}
            <div className="w-48 sm:w-56 md:w-60 lg:w-68 shrink-0 mx-auto md:mx-0">
              <div className="rounded-2xl overflow-hidden border border-border bg-secondary shadow-2xl shadow-black/40 transition-transform duration-300 hover:scale-[1.02]">
                <img
                  src={anime.poster}
                  alt={anime.title}
                  className="w-full aspect-2/3 object-cover"
                />
              </div>
            </div>

            {/* ANIME DESCRIPTION */}
            <div className="flex-1 w-full min-w-0">
              <div className="bg-secondary/80 border border-border rounded-2xl p-5 sm:p-7 lg:p-8 shadow-lg shadow-black/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-1 h-7 bg-accent rounded-full"></div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                    Synopsis
                  </h2>
                </div>

                <p className="text-text-secondary text-sm sm:text-base leading-7 sm:leading-8 whitespace-pre-line">
                  {anime.synopsis || "No description available for this anime."}
                </p>
              </div>

              {/* ADDITIONAL INFORMATION */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                <div className="bg-secondary border border-border rounded-xl p-4 transition-colors duration-300 hover:bg-elevated">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
                    Rating
                  </p>

                  <p className="text-warning text-lg font-bold">
                    ★{" "}
                    {anime.score != null
                      ? Number(anime.score).toFixed(1)
                      : "N/A"}
                  </p>
                </div>

                <div className="bg-secondary border border-border rounded-xl p-4 transition-colors duration-300 hover:bg-elevated">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
                    Episodes
                  </p>

                  <p className="text-text-primary text-lg font-bold">
                    {anime.episodes ?? "Unknown"}
                  </p>
                </div>

                <div className="bg-secondary border border-border rounded-xl p-4 transition-colors duration-300 hover:bg-elevated">
                  <p className="text-text-muted text-xs uppercase tracking-wider mb-2">
                    Release Year
                  </p>

                  <p className="text-text-primary text-lg font-bold">
                    {anime.year || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnimeProfile;
