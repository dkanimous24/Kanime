import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { searchCatalogAnime } from "../api";
import { Link, useParams } from "react-router-dom";
const Search = ({ onSelect }) => {
  const [searchedAnime, setSearchedAnime] = useState([]);
  const [query, setQuery] = useState("");
  const [debounceQuery] = useDebounce(query, 400);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchQuery = debounceQuery.trim();
    let cancelled = false;

    if (!searchQuery) {
      setSearchedAnime([]);
      return;
    }

    // handling loading logic
    if (query) {
      setLoading(true);
    }
    if (query === "") {
      setLoading(false);
    }

    setSearchedAnime([]);

    searchCatalogAnime(searchQuery)
      .then((response) => {
        if (!cancelled) {
          console.log("Search results:", response.data);
          setSearchedAnime(response.data ?? []);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Search failed:", error);
          setSearchedAnime([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [debounceQuery, query]);

  !searchedAnime ? <p className="loader"></p> : searchedAnime;
  return (
    <>
      <div className="relative w-full my-4 md:my-0 md:max-w-md md:justify-self-center">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex items-center z-40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-5 absolute left-4 text-text-secondary pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search anime"
              enterKeyHint="search"
              className="bg-secondary text-text-primary text-base w-full border border-secondary focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/30 transition placeholder:text-text-secondary py-3 pl-11 pr-12 rounded-full"
              placeholder="Search anime..."
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="absolute right-3 p-1.5 rounded-full text-text-secondary hover:text-text-primary hover:bg-border transition cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>

        {query != "" && (
          <div className="absolute top-full left-0 right-0 mt-2 z-50 max-h-[60vh] md:max-h-[500px] overflow-y-auto [scrollbar-width:thin] bg-primary border border-secondary rounded-2xl p-2 shadow-2xl flex flex-col gap-2">
            {loading && (
              <div className="flex justify-center py-6">
                <p className="loader"></p>
              </div>
            )}

            {searchedAnime.map((search) => (
              <Link
                key={`${search.source}:${search.outside_id}`}
                to={`/animeProfile/${encodeURIComponent(search.source)}/${encodeURIComponent(search.outside_id)}`}
                onClick={() => {
                  setSearchedAnime([]);
                  setQuery("");
                  onSelect?.();
                }}
                className="flex items-center gap-3 p-3 rounded-xl bg-secondary hover:bg-border transition"
              >
                <img
                  className="w-12 h-16 rounded-lg object-cover shrink-0"
                  src={`${search.poster}`}
                  alt=""
                />
                <div className="min-w-0">
                  <h3 className="font-bold truncate">{search.title}</h3>
                  <p className="flex flex-wrap gap-x-1 text-[12px] items-center text-text-secondary">
                    <span>{search.episodes}EP |</span>
                    <span>{search.year} |</span>
                    <span className="flex items-center gap-1 text-genre-comedy">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="size-4 fill-genre-comedy"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {search.rating}
                    </span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Search;
