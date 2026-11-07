import { useState, useEffect, useReducer, useCallback, useRef } from "react";

import { sharpenImage } from "./helpers";

const cache = new Map(); // url -> sharpened data URL

const SharpImage = ({ url, alt, className }) => {
  const [, rerender] = useReducer((n) => n + 1, 0);

  const src = cache.get(url) ?? url;

  useEffect(() => {
    if (cache.has(url)) return;

    let cancelled = false;

    sharpenImage(url, 0.5)
      .then((canvas) => {
        cache.set(url, canvas.toDataURL("image/jpeg", 0.92));

        if (!cancelled) rerender();
      })
      .catch(() => {});

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

// Hero animations
const heroStyles = `
  @keyframes hero-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }

    to {
      opacity: 1;
      transform: none;
    }
  }

  @keyframes bookmark-pop {
    0% {
      transform: scale(0.75);
    }

    55% {
      transform: scale(1.25);
    }

    100% {
      transform: scale(1);
    }
  }

  @keyframes toast-in {
    from {
      opacity: 0;
      transform: translateY(20px) scale(0.96);
    }

    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .hero-in {
    animation: hero-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  .bookmark-pop {
    animation: bookmark-pop 340ms cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .toast-in {
    animation: toast-in 350ms cubic-bezier(0.22, 1, 0.36, 1) both;
  }

  @media (prefers-reduced-motion: reduce) {
    .hero-in,
    .bookmark-pop,
    .toast-in {
      animation: none;
    }
  }
`;

// Bookmark icons
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

// Break long titles
const splitTitle = (name) => {
  const i = name.lastIndexOf(" ", 28);
  const at = i > 10 ? i : 25;

  return [name.slice(0, at), name.slice(at).trim()];
};

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-text-primary";

// Coming Soon Toast
const ComingSoonToast = ({ onClose }) => (
  <div
    role="status"
    aria-live="polite"
    className="
      toast-in
      fixed
      bottom-5
      left-1/2
      -translate-x-1/2
      z-[200]
      w-[calc(100%-2rem)]
      max-w-[390px]
      rounded-2xl
      border
      border-white/15
      bg-[#111827]/95
      backdrop-blur-xl
      shadow-[0_20px_60px_rgba(0,0,0,0.45)]
      overflow-hidden
    "
  >
    <div className="flex items-center gap-3 p-4">
      {/* Icon */}
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-xl
          bg-amber-400/10
          border
          border-amber-400/20
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="size-6 text-amber-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72m-12-7.5h9a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3Z"
          />
        </svg>
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-white font-bold text-sm sm:text-base">
          Streaming Coming Soon!
        </p>

        <p className="text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
          We're working on it. Stay tuned!
        </p>
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="
          shrink-0
          self-start
          rounded-lg
          p-1.5
          text-gray-400
          hover:text-white
          hover:bg-white/10
          transition-colors
          cursor-pointer
          focus-visible:outline-2
          focus-visible:outline-amber-400
        "
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="size-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    {/* Accent line */}
    <div className="h-[2px] w-full bg-gradient-to-r from-amber-400 via-amber-500/60 to-transparent" />
  </div>
);

const Hero = ({ slides, animeList, bookmarked, onToggle }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // null = not sliding
  const [direction, setDirection] = useState(null);

  // Bookmark pop animation
  const [popped, setPopped] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  const toastTimer = useRef(null);

  const handleWatchNow = () => {
    setShowToast(true);

    // Restart the timer on repeated clicks
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    toastTimer.current = setTimeout(() => {
      setShowToast(false);
      toastTimer.current = null;
    }, 3000);
  };

  const closeToast = () => {
    setShowToast(false);

    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const prevIndex = (currentSlide - 1 + slides.length) % slides.length;

  const nextIndex = (currentSlide + 1) % slides.length;

  const current = slides[currentSlide];

  const animeKey = `${current.item.source}:${current.item.outside_id}`;

  const isBookmarked = !!bookmarked[animeKey];

  // Carousel navigation
  const nextSlide = useCallback(() => setDirection((d) => d ?? "next"), []);

  const prevSlide = useCallback(() => setDirection((d) => d ?? "prev"), []);

  const handleTransitionEnd = (e) => {
    if (e.target !== e.currentTarget || e.propertyName !== "transform") {
      return;
    }

    if (direction === "next") {
      setCurrentSlide(nextIndex);
    }

    if (direction === "prev") {
      setCurrentSlide(prevIndex);
    }

    setDirection(null);
    setPopped(false);
  };

  let x = -100;

  if (direction === "next") x = -200;
  if (direction === "prev") x = 0;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [nextSlide, prevSlide]);

  const [titleTop, titleRest] =
    current.name.length > 50 ? splitTitle(current.name) : [];

  return (
    <>
      <style>{heroStyles}</style>

      <div
        className="
          hero relative w-full
          h-[420px] sm:h-[480px] md:h-[400px]
          overflow-hidden
          bg-primary
          before:bg-primary
          before:absolute
          before:left-0
          before:blur-xl
          md:before:blur-2xl
          before:w-[40%]
          md:before:w-[25%]
          before:shrink-0
          before:h-full
          before:scale-305
          md:before:scale-205
          before:z-50
          before:opacity-[20%]
        "
      >
        {/* CAROUSEL IMAGES */}
        {/* FIX: images are clipped 2px above the hero's bottom edge (bottom-0.5), so no row of
            the poster can ever touch the edge; the hero's bg-primary fills those 2px */}
        <div className="absolute inset-x-0 top-0 bottom-0.5 overflow-hidden">
          <div
            onTransitionEnd={handleTransitionEnd}
            className="flex w-full shrink-0 will-change-transform"
            style={{
              transform: `translateX(${x}%)`,
              transition: direction
                ? "transform 420ms cubic-bezier(0.32, 0.72, 0, 1)"
                : "none",
            }}
          >
            {/* Previous slide */}
            {/* FIX: was h-[360px] on mobile, which left a gap at the bottom while sliding back */}
            <div className="h-[560px] sm:h-[480px] md:h-[400px] w-full shrink-0">
              <SharpImage
                url={slides[prevIndex].url}
                alt="previous slide"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Current slide */}
            <div className="h-[560px] sm:h-[480px] md:h-[400px] w-full shrink-0">
              <SharpImage
                url={slides[currentSlide].url}
                alt="current slide"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Next slide */}
            <div className="h-[560px] sm:h-[480px] md:h-[400px] w-full shrink-0">
              <SharpImage
                url={slides[nextIndex].url}
                alt="next slide"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* DARK GRADIENTS */}
        <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-r from-primary via-primary/60 via-55% to-transparent md:via-45%" />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-linear-to-t from-primary via-primary/40 to-transparent" />

        {/* PREVIOUS ARROW */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className={`group absolute left-1 md:left-0 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full p-2 md:p-3 z-[100] select-none cursor-pointer transition duration-200 hover:bg-primary/40 hover:backdrop-blur-sm active:scale-95 ${focusRing}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7 md:w-[50px] md:h-[50px] stroke-pop-alt drop-shadow-md opacity-80 transition duration-200 group-hover:opacity-100 group-hover:-translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>

        {/* NEXT ARROW */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className={`group absolute right-1 md:right-0 bottom-4 md:bottom-auto md:top-1/2 md:-translate-y-1/2 rounded-full p-2 md:p-3 z-[100] select-none cursor-pointer transition duration-200 hover:bg-primary/40 hover:backdrop-blur-sm active:scale-95 ${focusRing}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-7 md:w-[50px] md:h-[50px] stroke-pop-alt drop-shadow-md opacity-80 transition duration-200 group-hover:opacity-100 group-hover:translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>

        {/* HERO INFORMATION */}
        <div className="absolute top-[86px] md:top-[24px] left-0 right-0 md:left-16 z-[60] flex gap-2 px-4 md:p-3">
          <div
            key={currentSlide}
            className={`hero-in flex flex-col min-w-0 w-full md:w-auto ${
              current.name.length < 20 ? "md:mr-5" : "md:ml-10"
            }`}
          >
            {/* TRENDING AND GENRES */}
            <div className="flex flex-wrap gap-2 md:gap-3 text-text-secondary items-center">
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

            {/* ANIME TITLE */}
            <div>
              <h1
                className={`mt-3 md:mt-[32px] mb-5 md:mb-[36px] max-w-[min(88vw,36rem)] font-bold ${
                  current.name.length > 20
                    ? "text-[clamp(2rem,1.2rem+3.4vw,2.75rem)]"
                    : "text-[clamp(2rem,1.2rem+3.4vw,3.75rem)]"
                } tracking-tight leading-[1.08] text-balance break-normal hyphens-none [overflow-wrap:anywhere] md:[overflow-wrap:normal] [text-shadow:0_2px_16px_rgb(0_0_0/0.45)]`}
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

              {/* ANIME METADATA */}
              <div className="flex flex-wrap gap-2 md:gap-3 mb-4 items-center">
                <p className="flex gap-1 items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="size-4 md:size-5 fill-genre-comedy inline mb-1"
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

              {/* DESCRIPTION */}
              <div className="md:w-125 w-full md:text-left text-xs md:text-[16px] leading-relaxed text-pretty text-text-secondary max-w-full">
                {current.description.length > 140
                  ? current.description.split(" ").slice(0, 15).join(" ") + "…"
                  : current.description}
              </div>
            </div>

            {/* HERO BUTTONS */}
            <div className="flex flex-wrap gap-2 md:gap-3 mt-5 md:mt-[32px]">
              {/* WATCH NOW */}
              <button
                type="button"
                onClick={handleWatchNow}
                className={`group md:py-5 md:px-10 px-4 py-3 md:gap-2 gap-1 bg-pop-alt hover:bg-genre-drama rounded-xl flex items-center text-primary font-bold cursor-pointer shadow-lg shadow-black/20 transition duration-150 ease-out hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.97] ${focusRing}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6 md:size-8 stroke-primary transition-transform duration-150 group-hover:translate-x-0.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                  />
                </svg>

                <p className="text-xs md:text-xl whitespace-nowrap">
                  Watch Now
                </p>
              </button>

              {/* BOOKMARK */}
              <button
                type="button"
                onClick={() => {
                  onToggle(current.item);
                  setPopped(true);
                }}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                className={`md:py-5 md:px-10 px-4 py-3 md:gap-2 gap-1 border-2 bg-white/5 backdrop-blur-sm border-text-primary hover:bg-text-muted hover:border-text-muted rounded-xl flex items-center cursor-pointer transition duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] ${focusRing}`}
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

      {/* TOAST OUTSIDE HERO TO AVOID CLIPPING */}
      {showToast && <ComingSoonToast onClose={closeToast} />}
    </>
  );
};

export default Hero;
