import bookmarkClosed from "./bookmarkClosed";
import bookmarkOpen from "./bookmarkOpen";
import { getGenreTailwind } from "./helpers";

const AnimeCard = ({ animes, bookmarked, onToggle }) => {
  // return [false,false,false......,false]
  return (
    <>
      {animes.map((anime, i) => (
        <div key={anime.id || anime.name || i} className="card relative">
          <img
            src={anime.url}
            className="w-full h-full object-cover"
            alt={anime.name}
          />
          <div className="">
            <div className="flex flex-col text-left absolute bottom-3 left-3 z-20">
              <span className="text-genre-comedy font-bold text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-4 fill-genre-comedy inline mb-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                    clipRule="evenodd"
                  />
                </svg>
                {anime.rating}
              </span>
              <div className="">
                <p className="font-bold">{anime.name}</p>
              </div>
              <p className="text-text-secondary">EP•{anime.episodes}</p>
            </div>
          </div>

          <div
            className="p-[6px] absolute rounded-[7px] bg-primary right-4 top-4 "
            onClick={() => onToggle(anime.name)}
          >
            {bookmarked[anime.name] ? bookmarkClosed() : bookmarkOpen()}
          </div>

          <div
            className={`absolute p-[8px] left-4 top-4 text-xs rounded-[10px] ${getGenreTailwind(anime.genre)} uppercase text-primary font-bold`}
          >
            {anime.genre || "shonen"}
          </div>
        </div>
      ))}
    </>
  );
};

export default AnimeCard;
