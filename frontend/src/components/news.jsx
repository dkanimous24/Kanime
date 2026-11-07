import { useEffect, useRef, useState } from "react";
import { getNewsType } from "./newsType";
import { safeUrl } from "../utils/safeUrl";

// Turns a date string into "5m ago", "3h ago" or "2d ago".
const timeAgo = (published) => {
  const then = new Date(published);
  if (isNaN(then)) return "";

  const mins = Math.floor((Date.now() - then.getTime()) / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
};

// Clamps the summary to 3 lines on mobile and shows a hint only if it was cut.
const Summary = ({ text }) => {
  const ref = useRef(null);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // FIX: re-check whenever the text's own size changes (fonts loading, layout settling,
    // rotation, container resize), not just on window resize and first mount.
    const check = () => setClamped(el.scrollHeight > el.clientHeight + 1);

    check();

    const observer = new ResizeObserver(check);
    observer.observe(el);
    document.fonts?.ready.then(check);

    return () => observer.disconnect();
  }, [text]);

  return (
    <>
      <p
        ref={ref}
        className="text-sm text-text-secondary line-clamp-3 sm:line-clamp-none"
      >
        {text}...
      </p>
      {clamped && (
        <span className="block sm:hidden text-sm text-pop-alt">
          ...see full article
        </span>
      )}
    </>
  );
};

const News = ({ news, isLoading }) => {
  // Loader while the request is in flight
  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center px-4 py-16 sm:py-24">
        <div className="loader" />
      </div>
    );
  }

  // Request finished but nothing came back
  if (!news || news.length === 0) {
    return (
      <p className="px-4 py-16 text-center text-text-secondary sm:py-24">
        No news right now. Try again later.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 sm:px-0 pb-8">
      {news.map((item, index) => {
        const newsUrl = safeUrl(item.link);
        const imageUrl = safeUrl(item.image);

        const content = (
          <div className="bg-secondary p-3 lg:w-215  flex gap-2 rounded-2xl border border-elevated relative hover:border-2 hover:border-pop-alt transition duration-100 ease-in">
            <div className="w-16 sm:w-20 h-36 bg-primary shrink-0">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="mt-10 p-2 min-w-0 break-words">
              <h2 className="uppercase text-genre-adventure">
                {getNewsType(item.title)}
                <span className="text-text-muted lowercase">
                  {" "}
                  • {timeAgo(item.published)}
                </span>
              </h2>

              <h3 className="text-[16px]">{item.title}</h3>

              <Summary text={item.summary} />

              <div className="absolute top-5 right-5 p-1 rounded-[5px] bg-primary opacity-75">
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
                    d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                  />
                </svg>
              </div>
            </div>
          </div>
        );

        return newsUrl ? (
          <a
            key={item.link ?? index}
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {content}
          </a>
        ) : (
          <div key={item.link ?? index}>{content}</div>
        );
      })}
    </div>
  );
};

export default News;
