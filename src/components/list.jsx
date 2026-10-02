import bookmarkOpen from "./bookmarkOpen";

const List = ({ list }) => {
  return (
    <>
      <div className="bg-secondary border border-elevated p-3 max-w-[500px] rounded-2xl">
        <div className="p-4">
          <div className="flex mb-2">
            <div className="scale-[1.35] mt-1">{bookmarkOpen()}</div>
            <h1>My list</h1>
          </div>
          <p className="text-text-secondary text-[14px] font-extralight ">
            all your bookmarks will be stored here
          </p>
        </div>
        <div className="flex flex-col p-2 gap-2 overflow-y-scroll max-h-90 scrollbar-thumb-pop-alt [scrollbar-width:thin]  scrollbar-track-primary">
          {list.map((anime) => (
            <>
              <div
                key={anime.name}
                className="bg-primary flex gap-3 p-3 border border-elevated hover:border-pop-alt transition duration-100 ease-in rounded-2xl relative"
              >
                <div className="w-7 h-7 mt-2 bg-pop rounded-[5px] ">
                  <img src={anime.url} alt="" />
                </div>
                <div className="flex flex-col">
                  <b>{anime.name}</b>
                  <p className="text-text-muted text-sm ">
                    EP {anime.episodes}
                  </p>
                </div>
                <div className="p-2 bg-secondary rounded-full ml-40 align-center absolute right-2 top-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                    />
                  </svg>
                </div>
              </div>
            </>
          ))}
        </div>
        <button className="justify-self-center p-2 ml-2 mt-3 bg-pop-alt md:w-106 max-w-106 rounded-xl active:bg">
          Open bookmarks
        </button>
      </div>
    </>
  );
};

export default List;
