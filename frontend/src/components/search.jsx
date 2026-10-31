import { useDebounce } from "use-debounce";
import { useEffect, useState } from "react";
import { searchCatalogAnime } from "../api";
import { Link, useParams } from "react-router-dom";
const Search = () => {
  const [searchedAnime, setSearchedAnime] = useState([]);
  const [query, setQuery] = useState("");
  const [debounceQuery] = useDebounce(query, 400);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const searchQuery = debounceQuery.trim();
  //   let cancelled = false;
  //   if (!searchQuery) {
  //     setSearchedAnime([]);
  //     return;
  //   }

  //   setSearchedAnime([]);

  //   searchCatalogAnime(searchQuery)
  //     .then((response) => {
  //       if (!cancelled) {
  //         setSearchedAnime(response.data ?? []);
  //       }
  //     })
  //     .catch(console.error);

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [debounceQuery]);

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
      <div className="justify-self-center mt-[98px] md:ml-15 absolute  lg:right-250 lg:top-[-85px] md:right-0 md:top-100 top-78">
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="relative items-center z-40">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              //   value=""
              className="bg-secondary text-text-primary md:w-100 lg:w-90 w-87.5  border border-secondary focus:outline-none focus:border-[#8B5CF6] placeholder:text-text-secondary p-3 rounded-2xl"
              placeholder="search for your binge worthy anime"
            />
            <button
              type="submit"
              className="bg-pop-alt p-[6px] rounded-4xl absolute  my-2 right-4  bottom-0 justify-self-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6 w-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </button>
          </div>
        </form>

        {loading ? (
          <div className="bg-primary h-50">
            <p className="loader my-15 ml-38 "></p>
          </div>
        ) : (
          <></>
        )}

        <div
          className={` ${query ? "overflow-y-scroll scrollbar-thumb-pop-alt [scrollbar-width:thin]  scrollbar-track-secondary" : ""}   relative z-50 max-h-[500px] `}
        >
          {query != ""
            ? searchedAnime.map((search) => (
                <Link
                  key={`${search.source}:${search.outside_id}`}
                  to={`/animeProfile/${encodeURIComponent(search.source)}/${encodeURIComponent(search.outside_id)}`}
                  onClick={() => {
                    setSearchedAnime([]);
                    setQuery("");
                  }}
                >
                  <div className="min-h-36 bg-secondary rounded-2xl max-w-100 p-4 relative z-30">
                    <div className="min-h-30 bg-border w-[95%]  rounded-2xl mx-auto my-auto">
                      <div className="relative flex gap-2">
                        <div className="w-15 h-20 bg-secondary mt-5 ml-2">
                          <img
                            className="w-full h-full"
                            src={`${search.poster}`}
                            alt=""
                          />
                        </div>
                        <div>
                          <h3 className="font-bold mt-10 ">{search.title}</h3>
                          <p className="flex text-[12px] items-center text-text-secondary">
                            <span>{search.episodes}EP |</span>
                            <span>{search.year} |</span>
                            <span className="flex items-center text-genre-comedy">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                class=" size-4 md:size-5 fill-genre-comedy inline mb-1"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                                  clip-rule="evenodd"
                                />
                              </svg>
                              {search.rating}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            : null}
        </div>
      </div>
    </>
  );
};

export default Search;
