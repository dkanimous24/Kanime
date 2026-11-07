import bookmarkClosed from "./bookmarkClosed";
import bookmarkOpen from "./bookmarkOpen";
import { getGenreTailwind } from "./helpers";
import { Link } from "react-router-dom";

// Set this to your page background colour (6-digit hex)
const PAGE_BG = "#0b0b14";

const AnimeCard = ({ animes, bookmarked, onToggle }) => {
  return (
    <>
      {animes.map((anime, i) => {
        const isBookmarked = bookmarked[`${anime.source}:${anime.outside_id}`];

        return (
          <div
            key={anime.id || anime.name || i}
            // "card" keeps your gradient; the rest is the new shell
            className="card group relative overflow-hidden rounded-xl shadow-lg sm:rounded-2xl shadow-black/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <Link
              to={`/animeProfile/${encodeURIComponent(anime.source)}/${encodeURIComponent(anime.outside_id)}`}
              className="block h-full w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <img
                src={anime.url}
                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                alt={anime.name}
                loading="lazy"
              />

              {/* Gradient overlay in your page colour: softens on hover, never disappears */}
              <div
                className="pointer-events-none absolute inset-0 z-10 opacity-100 transition-opacity duration-300 group-hover:opacity-70"
                style={{
                  background: `linear-gradient(to top, ${PAGE_BG}f2 0%, ${PAGE_BG}80 40%, transparent 100%)`,
                }}
              />

              {/* Info */}
              <div className="absolute bottom-2 left-2 right-2 z-20 flex flex-col gap-0.5 text-left sm:bottom-3 sm:left-3 sm:right-3 sm:gap-1">
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-black/40 px-1.5 py-0.5 text-xs font-bold sm:px-2 sm:text-sm text-genre-comedy backdrop-blur-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-3 fill-genre-comedy sm:size-4"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {anime.rating}
                </span>

                <p className="line-clamp-2 text-sm font-bold leading-tight sm:text-base drop-shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
                  {anime.name}
                </p>
                <p className="text-xs text-text-secondary sm:text-sm">
                  EP•{anime.episodes}
                </p>
              </div>

              {/* Bookmark: glass button */}
              <button
                type="button"
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                aria-pressed={!!isBookmarked}
                className="absolute right-2 top-2 z-30 grid place-items-center rounded-lg border border-white/20 bg-black/40 p-1 sm:right-3 sm:top-3 sm:rounded-xl sm:p-[7px] [&>svg]:size-4 sm:[&>svg]:size-5 backdrop-blur-md transition-all duration-200 hover:scale-110 hover:bg-black/60 active:scale-95"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle(anime);
                }}
              >
                {isBookmarked ? bookmarkClosed() : bookmarkOpen()}
              </button>

              {/* Genre pill */}
              <div
                className={`absolute left-2 top-2 z-30 max-w-[60%] truncate rounded-full px-2 py-0.5 text-[9px] sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[11px] font-bold uppercase tracking-wide text-primary shadow-md ${getGenreTailwind(anime.genre)}`}
              >
                {anime.genre || "shonen"}
              </div>
            </Link>
          </div>
        );
      })}
    </>
  );
};

export default AnimeCard;
