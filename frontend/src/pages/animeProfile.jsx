import { useParams } from "react-router-dom";
import bookmarkOpen from "../components/bookmarkOpen";
import { useEffect, useState } from "react";
import { searchAnime, seachAnimeJikan } from "../kitsu";

const AnimeProfile = () => {
  const { animeName } = useParams();
  const [anime, setAnime] = useState([]);
  useEffect(() => {
    (searchAnime(animeName)
      .then(setAnime)
      .catch((err) => console.error(err)),
      console.log(anime));
  }, [animeName]);

  // const [jikan, setJikan] = useState();
  // useEffect(() => {
  //   seachAnimeJikan(animeName).then(setJikan);
  // }, []);

  return (
    <>
      <div>
        <div className="bg-accent-muted h-80 w-full z- card relative">
          <img
            src={anime[0]?.attributes.coverImage?.large}
            alt=""
            className="w-full "
          />
          <div className="max-w-320 mx-auto mt-10 bottom-0 absolute z-40 left-33">
            <h1 className="text-5xl font-extrabold">
              {anime[0]?.attributes.canonicalTitle}
            </h1>
            <div className="flex my-2 gap-2">
              <p>{(anime[0]?.attributes.rating / 10).toFixed(1)}</p>
              <p>pg-13</p>
              <p>{anime[0]?.attributes.episodeCount}</p>
            </div>

            <div className="">
              {" "}
              <button className="p-4  bg-genre-fantasy flex items-center rounded-xl">
                {bookmarkOpen()} bookmark
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="max-w-320 mx-auto flex gap-10 relative">
            <div className="p-2 w-70 h-100  bg-secondary mt-10 ">
              <img
                src={anime[0]?.attributes.posterImage?.large}
                alt=""
                className="w-full h-full inset-0 overflow-hidden object-cover"
              />
            </div>{" "}
            <div className="flex-col mt-10">
              <h3 className="text-pop-alt">description</h3>
              <p className="w-120 text-text-secondary">
                {anime[0]?.attributes.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* <div>
        <div className="bg-accent-muted h-80 w-full z- card relative">
          <img
            src={anime[0]?.attributes.coverImage?.large}
            alt=""
            className="w-full "
          />
          <div className="max-w-320 mx-auto mt-10 bottom-0 absolute z-40 left-33">
            <h1 className="text-5xl font-extrabold">
              {anime[0]?.attributes.canonicalTitle}
            </h1>
            <div className="flex my-2 gap-2">
              <p>{(anime[0]?.attributes.rating / 10).toFixed(1)}</p>
              <p>pg-13</p>
              <p>{anime[0]?.attributes.episodeCount}</p>
            </div>

            <div className="">
              {" "}
              <button className="p-4  bg-genre-fantasy flex items-center rounded-xl">
                {bookmarkOpen()} bookmark
              </button>
            </div>
          </div>
        </div>
        <div>
          <div className="max-w-320 mx-auto flex gap-10 relative">
            <div className="p-2 w-70 h-100  bg-secondary mt-10 ">
              <img
                src={anime[0]?.attributes.posterImage?.large}
                alt=""
                className="w-full h-full inset-0 overflow-hidden object-cover"
              />
            </div>{" "}
            <div className="flex-col mt-10">
              <h3 className="text-pop-alt">description</h3>
              <p className="w-120 text-text-secondary">
                {anime[0]?.attributes.description}
              </p>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default AnimeProfile;
