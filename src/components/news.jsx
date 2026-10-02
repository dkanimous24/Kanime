import { getNewsType } from "./newsType";

// Turns a date string into "5m ago", "3h ago" or "2d ago".
// Uses the full date + timezone, so it's correct across days and zones.
const timeAgo = (published) => {
  const then = new Date(published);
  if (isNaN(then)) return ""; // unparseable date: show nothing

  const mins = Math.floor((Date.now() - then.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const News = ({ news }) => {
  return (
    <div className="flex flex-col gap-2">
      {news.map((item) => (
        <a key={item.link} href={item.link}>
          <div className="bg-secondary p-3 flex gap-2 rounded-2xl border border-elevated relative hover:border-2 hover:border-pop-alt transition duration-100 ease-in">
            <div className="w-20 h-36 bg-primary shrink-0">
              {/* only render an image if the article actually has one */}
              {item.image && (
                <img
                  src={item.image}
                  alt=""
                  className="h-full w-full object-cover"
                />
              )}
            </div>

            <div className="mt-10 p-2">
              <h2 className="uppercase text-genre-adventure">
                {getNewsType(item.title)}
                <span className="text-text-muted lowercase">
                  {" "}
                  • {timeAgo(item.published)}
                </span>
              </h2>

              <h3 className="text-[16px]">{item.title}</h3>
              <p className="text-sm text-text-secondary">{item.summary}...</p>

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
        </a>
      ))}
    </div>
  );
};

export default News;
