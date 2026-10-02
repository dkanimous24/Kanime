import { useEffect, useState } from "react";
import { searchAnime } from "../kitsu";

const Search = () => {
  const [searchedAnime, setSearchedAnime] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    searchAnime(query).then(setSearchedAnime);
  }, [query]);

  !searchedAnime ? <p>loading...</p> : searchedAnime;
  return (
    <>
      <div className="justify-self-center mt-[98px] md:ml-15 absolute  lg:right-50 lg:top-[-85px] md:right-0 md:top-100 top-78">
        <form>
          <div className="relative items-center z-40">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              //   value=""
              className="bg-secondary text-text-primary md:w-100 lg:w-90 w-[350px]  border-1 border-secondary focus:outline-none focus:border-[#8B5CF6] placeholder:text-text-secondary p-3 rounded-2xl"
              placeholder="search for your binge worthy anime"
            />
            <button
              type="submit"
              className="bg-pop-alt p-[6px] rounded-4xl absolute  my-2 right-[1rem]  bottom-0 justify-self-center"
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
        <div
          className={` ${query ? "overflow-y-scroll" : ""}   relative z-50 max-h-[500px] `}
        >
          {query != ""
            ? searchedAnime.map((search) => (
                <div className="min-h-36 bg-secondary rounded-2xl p-4 relative z-30">
                  <div className="min-h-30 bg-border w-[95%]  rounded-2xl mx-auto my-auto">
                    <div className="relative flex gap-2">
                      <div className="w-15 h-20 bg-secondary mt-5 ml-2">
                        <img
                          className="w-full h-full"
                          src={`${search.attributes.posterImage?.small}`}
                          alt=""
                        />
                      </div>
                      <h3 className="font-bold block ml-20 absolute top-12 ">
                        {search.attributes.canonicalTitle}
                      </h3>
                      <p className="flex absolute  left-20 top-18 text-[12px] items-center text-text-secondary">
                        <span>{search.attributes.episodeCount}EP |</span>
                        <span>{search.attributes.createdAt.slice(0, 4)} |</span>
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
                          {(search.attributes.averageRating / 10).toFixed(1)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))
            : null}
        </div>
      </div>
    </>
  );
};

export default Search;
