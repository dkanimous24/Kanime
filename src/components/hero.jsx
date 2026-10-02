import { useState, useEffect } from "react";
import { sharpenImage } from "./helpers";

const cache = new Map(); // url -> sharpened data URL

const SharpImage = ({ url, alt, className }) => {
  const [src, setSrc] = useState(cache.get(url) || url); // original shows first

  useEffect(() => {
    if (cache.has(url)) {
      setSrc(cache.get(url));
      return;
    }
    setSrc(url);
    let cancelled = false;

    sharpenImage(url, 0.5)
      .then((canvas) => {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        cache.set(url, dataUrl);
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {}); // on failure, the original stays

    return () => {
      cancelled = true;
    };
  }, [url]);

  return <img src={src} alt={alt} className={className} />;
};

// Icons live outside the component: they never change, so there's no
// reason to rebuild them on every render.
const BookmarkOpen = () => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="size-7 w-[25px]"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
      />
    </svg>
    <p>bookmark</p>
  </>
);

const BookmarkClosed = () => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-7 w-[25px]"
    >
      <path
        fillRule="evenodd"
        d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
        clipRule="evenodd"
      />
    </svg>
    <p>bookmarked</p>
  </>
);

const Hero = ({ slides, animeList, bookmarked, onToggle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // null = not sliding, "next" / "prev" = gliding
  const [direction, setDirection] = useState(null);

  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  const nextIndex = (currentSlide + 1) % slides.length;

  // Bookmark state is derived from App's shared state, keyed by name.
  // Each slide has its own entry, and Discover cards stay in sync.
  const current = slides[currentSlide];
  const isBookmarked = !!bookmarked[current.name];

  const nextSlide = () => {
    if (direction) return; // ignore clicks while sliding
    setDirection("next");
  };

  const prevSlide = () => {
    if (direction) return;
    setDirection("prev");
  };

  // Glide finished: change the images and snap the row back to rest.
  const handleTransitionEnd = () => {
    if (direction === "next") setCurrentSlide(nextIndex);
    if (direction === "prev") setCurrentSlide(prevIndex);
    setDirection(null);
  };

  // 0 = showing PREV box, -100 = CURRENT (resting), -200 = NEXT
  let x = -100;
  if (direction === "next") x = -200;
  if (direction === "prev") x = 0;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide]);

  return (
    <>
      <div
        className="hero h-[100%]  before:bg-primary before:absolute before:left-[0px]  before:blur-xl md:before:blur-2xl
        before:w-[40%] md:before:w-[25%] before:shrink-0 before:h-full before:scale-305 md:before:scale-205 before:z-50  before:opacity-[20%];
}"
      >
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex w-screen shrink-0"
          style={{
            transform: `translateX(${x}vw)`,
            transition: direction ? "transform 300ms ease-in-out" : "none",
          }}
        >
          {/* Box 1 - previous */}
          <div className="h-[400px] w-full shrink-0">
            <SharpImage
              url={slides[prevIndex].url}
              alt="previous slide"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Box 2 - current */}
          <div className="h-[400px] w-full shrink-0">
            <SharpImage
              url={slides[currentSlide].url}
              alt="current slide"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Box 3 - next */}
          <div className="h-[400px] w-full shrink-0">
            <SharpImage
              url={slides[nextIndex].url}
              alt="next slide"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        {/* Arrows stay outside the moving row */}
        <div
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-3 z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 stroke-pop-alt w-[50px] h-[50px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </div>

        <div
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-3 z-[99999999]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 stroke-pop-alt w-[50px] h-[50px]"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>

        <div className="absolute md:top-[24px] top-[86px] sm:justify-self-center md:justify-self-start justify-self-center md:left-[64px] right-0 z-[999] flex gap-2 p-3">
          <div className="flex flex-col">
            <div className="flex gap-2 text-text-secondary items-center">
              <p className="px-3 py-1 md:px-5 md:py-1 rounded-[5px] bg-genre-shonen uppercase text-primary font-extrabold md:text-[16px] text-[10px]">
                Trending
              </p>
              <p className="text-xs md:text-[16px]">{current.episodes} EP</p>
              <p className="text-xs md:text-[16px]">
                {current.genres.slice(0, 3).map((genre) => (
                  <span key={genre}> • {genre}</span>
                ))}
              </p>
            </div>
            <div>
              <h1 className="md:text-6xl md:mt-[32px] mb-[36px]  mt-[100] font-bold text-4xl">
                {current.name.length > 50 ? (
                  <p className="text-4xl">
                    {current.name.slice(0, 25)}
                    <br></br>{" "}
                    <span className="text-text-muted">
                      {current.name.slice(25)}
                    </span>{" "}
                  </p>
                ) : (
                  current.name
                )}
              </h1>
              <div className="flex gap-2 mb-[10px] items-center">
                <p className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className=" size-4 md:size-5 fill-genre-comedy inline mb-1"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <b className="md:text-[16px] text-xs text-genre-comedy">
                    {current.rating.toFixed(1)}
                  </b>
                </p>
                <p className="text-text-secondary md:text-[16px] text-xs">
                  {current.year.slice(0, 4)} •
                </p>
                <p className="text-text-secondary md:text-[16px] uppercase text-[10px]">
                  {current.studio} •
                </p>
                <p className="text-text-secondary md:text-[16px] text-[10px]">
                  {animeList[currentSlide].viewingAge}
                </p>
              </div>
              <div className="md:w-125 w-75  md:text-left text-xs md:text-[16px] text-text-secondary">
                {current.description.length > 140
                  ? current.description.split(" ").slice(0, 15).join(" ") +
                    "..."
                  : current.description}
              </div>
            </div>
            <div className="flex gap-2 mt-[24px] ">
              <button className="md:py-5 md:px-10 px-2 py-3  hover:bg-genre-drama transition duration-100 ease-in  bg-pop-alt rounded-xl flex items-center text-primary font-bold">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8 stroke-primary"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                  />
                </svg>
                <p className="text-xs md:text-xl">Watch Now</p>
              </button>

              {/* Passes the slide's full anime object (current.item) up to App */}
              <button
                onClick={() => onToggle(current.item)}
                className="md:py-5 md:px-10 px-2 py-3  border-2 transition duration-100 ease-in hover:bg-text-muted bg-transparent hover:border-text-muted border-text-primary rounded-xl flex items-center"
              >
                {isBookmarked ? <BookmarkClosed /> : <BookmarkOpen />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
