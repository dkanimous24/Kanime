import { useState, useEffect, useReducer, useCallback } from "react";
import { sharpenImage } from "./helpers";

const cache = new Map(); // url -> sharpened data URL

const SharpImage = ({ url, alt, className }) => {
  // Re-render trigger only: src is derived from the cache every render, so a
  // slot never shows a stale image for one frame when the slides shift.
  const [, rerender] = useReducer((n) => n + 1, 0);
  const src = cache.get(url) ?? url; // original shows first

  useEffect(() => {
    if (cache.has(url)) return;
    let cancelled = false;

    sharpenImage(url, 0.5)
      .then((canvas) => {
        cache.set(url, canvas.toDataURL("image/jpeg", 0.92));
        if (!cancelled) rerender();
      })
      .catch(() => {}); // on failure, the original stays

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      decoding="async"
      className={className}
    />
  );
};

// Motion that answers a user action: text settles in after a slide change,
// and the bookmark icon pops when toggled. Both respect reduced motion.
// (Move this into your global CSS if you prefer.)
const heroStyles = `
@keyframes hero-in {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
@keyframes bookmark-pop {
  0%   { transform: scale(0.75); }
  55%  { transform: scale(1.25); }
  100% { transform: scale(1); }
}
.hero-in { animation: hero-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both; }
.bookmark-pop { animation: bookmark-pop 340ms cubic-bezier(0.34, 1.56, 0.64, 1); }
@media (prefers-reduced-motion: reduce) {
  .hero-in, .bookmark-pop { animation: none; }
}
`;

// Icons live outside the component: they never change, so there's no
// reason to rebuild them on every render.
const BookmarkOpen = ({ pop }) => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`size-7 w-[25px] ${pop ? "bookmark-pop" : ""}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
      />
    </svg>
    <p className="text-xs md:text-xl">bookmark</p>
  </>
);

const BookmarkClosed = ({ pop }) => (
  <>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`size-7 w-[25px] ${pop ? "bookmark-pop" : ""}`}
    >
      <path
        fillRule="evenodd"
        d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z"
        clipRule="evenodd"
      />
    </svg>
    <p className="text-xs md:text-xl">bookmarked</p>
  </>
);

// Break long titles at a word boundary instead of mid-word.
const splitTitle = (name) => {
  const i = name.lastIndexOf(" ", 28);
  const at = i > 10 ? i : 25;
  return [name.slice(0, at), name.slice(at).trim()];
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary";

const Hero = ({ slides, animeList, bookmarked, onToggle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // null = not sliding, "next" / "prev" = gliding
  const [direction, setDirection] = useState(null);

  // Only true after the user toggles, so the pop never plays on slide change.
  const [popped, setPopped] = useState(false);

  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
  const nextIndex = (currentSlide + 1) % slides.length;

  // Bookmark state is derived from App's shared state, keyed by name.
  // Each slide has its own entry, and Discover cards stay in sync.
  const current = slides[currentSlide];
  const animeKey = `${current.item.source}:${current.item.outside_id}`;
  const isBookmarked = !!bookmarked[animeKey];

  // Stable callbacks: ignore input while a glide is already running.
  const nextSlide = useCallback(() => setDirection((d) => d ?? "next"), []);
  const prevSlide = useCallback(() => setDirection((d) => d ?? "prev"), []);

  // Glide finished: change the images and snap the row back to rest.
  const handleTransitionEnd = (e) => {
    // Ignore transitions bubbling up from children.
    if (e.target !== e.currentTarget || e.propertyName !== "transform") return;
    if (direction === "next") setCurrentSlide(nextIndex);
    if (direction === "prev") setCurrentSlide(prevIndex);
    setDirection(null);
    setPopped(false);
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

  const [titleTop, titleRest] =
    current.name.length > 50 ? splitTitle(current.name) : [];

  return (
    <>
      <style>{heroStyles}</style>
      <div
        className="hero h-[100%] before:bg-primary before:absolute before:left-[0px] before:blur-xl md:before:blur-2xl
        before:w-[40%] md:before:w-[25%] before:shrink-0 before:h-full before:scale-305 md:before:scale-205 before:z-50 before:opacity-[20%]"
      >
        <div
          onTransitionEnd={handleTransitionEnd}
          className="flex w-screen shrink-0 will-change-transform"
          style={{
            transform: `translateX(${x}vw)`,
            transition: direction
              ? "transform 420ms cubic-bezier(0.32, 0.72, 0, 1)"
              : "none",
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

        {/* Dark gradient: solid on the text side, fading out to reveal the art on the right */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-primary via-primary/60 via-55% to-transparent md:via-45%" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-linear-to-t from-primary via-primary/40 to-transparent" />

        {/* Arrows stay outside the moving row */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className={`group absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-3 z-50 select-none cursor-pointer transition duration-200 hover:bg-primary/40 hover:backdrop-blur-sm active:scale-95 ${focusRing}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 stroke-pop-alt w-[50px] h-[50px] drop-shadow-md opacity-80 transition duration-200 group-hover:opacity-100 group-hover:-translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className={`group absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-3 z-[99999999] select-none cursor-pointer transition duration-200 hover:bg-primary/40 hover:backdrop-blur-sm active:scale-95 ${focusRing}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 stroke-pop-alt w-[50px] h-[50px] drop-shadow-md opacity-80 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        <div className="absolute md:top-[24px] top-[86px] sm:justify-self-center md:justify-self-start justify-self-center md:left-16 right-0 z-999 flex gap-2 p-3">
          {/* key = slide index, so the text settles in on every slide change */}
          <div key={currentSlide} className="hero-in flex flex-col">
            <div className="flex gap-3 text-text-secondary items-center">
              <p className="px-3 py-1 md:px-5 md:py-1 rounded-md bg-genre-shonen uppercase tracking-wider text-primary font-extrabold md:text-[16px] text-[10px]">
                Trending
              </p>
              <p className="text-xs md:text-[16px] tabular-nums">
                {current.episodes} EP
              </p>
              <p className="text-xs md:text-[16px]">
                {current.genres.slice(0, 3).map((genre) => (
                  <span key={genre}> • {genre}</span>
                ))}
              </p>
            </div>
            <div>
              {/* Fluid size: 32px on small phones, scaling smoothly up to 60px.
                  Words never split mid-word; lines wrap only between words and balance. */}
              <h1
                className={`mt-3 md:mt-[32px] mb-7 md:mb-[36px] max-w-[min(88vw,36rem)] font-bold ${current.name.length > 20 ? "text-[clamp(2rem,1.2rem+3.4vw,2.75rem)]" : "text-[clamp(2rem,1.2rem+3.4vw,3.75rem)]"} tracking-tight leading-[1.08] text-balance break-normal hyphens-none [overflow-wrap:normal] [text-shadow:0_2px_16px_rgb(0_0_0/0.45)]`}
              >
                {titleTop ? (
                  <span className="block">
                    {titleTop}
                    <br /> <span className="text-text-muted">{titleRest}</span>
                  </span>
                ) : (
                  current.name
                )}
              </h1>
              <div className="flex gap-3 mb-4 items-center">
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
                  <b className="md:text-[16px] text-xs text-genre-comedy tabular-nums">
                    {current.rating.toFixed(1)}
                  </b>
                </p>
                <p className="text-text-secondary md:text-[16px] text-xs tabular-nums">
                  {current.year.slice(0, 4)} •
                </p>
                <p className="text-text-secondary md:text-[16px] uppercase tracking-wide text-[10px]">
                  {current.studio} •
                </p>
                <p className="text-text-secondary md:text-[16px] text-[10px]">
                  {animeList[currentSlide]?.viewingAge}
                </p>
              </div>
              <div className="md:w-125 w-75 md:text-left text-xs md:text-[16px] leading-relaxed text-pretty text-text-secondary max-w-full">
                {current.description.length > 140
                  ? current.description.split(" ").slice(0, 15).join(" ") + "…"
                  : current.description}
              </div>
            </div>
            <div className="flex gap-3 mt-7 md:mt-[32px]">
              <button
                type="button"
                className={`group md:py-5 md:px-10 px-5 py-3.5 gap-2 bg-pop-alt hover:bg-genre-drama rounded-xl flex items-center text-primary font-bold cursor-pointer shadow-lg shadow-black/20 transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97] ${focusRing}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8 stroke-primary transition-transform duration-150 group-hover:translate-x-0.5"
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
                type="button"
                onClick={() => {
                  onToggle(current.item);
                  setPopped(true);
                }}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                className={`md:py-5 md:px-10 px-5 py-3.5 gap-2 border-2 bg-white/5 backdrop-blur-sm border-text-primary hover:bg-text-muted hover:border-text-muted rounded-xl flex items-center cursor-pointer transition duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] ${focusRing}`}
              >
                {isBookmarked ? (
                  <BookmarkClosed pop={popped} />
                ) : (
                  <BookmarkOpen pop={popped} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
