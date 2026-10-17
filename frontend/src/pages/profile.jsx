import { Link } from "react-router-dom";
import AnimeCard from "../components/animeCard";

// ============================================================================
// STEP 3: RECEIVING AND USING LIFTED STATE IN Profile.jsx
// ============================================================================
// Instead of creating a separate bookmarks state here in Profile.jsx (which wouldn't know
// about bookmarks added on the Home page), Profile receives:
//   1. `bookmarked`: the shared dictionary object { [animeName]: animeObject }
//   2. `toggleBookmark`: the shared function to add/remove bookmarks
//
// These were passed down as props from App.jsx:
//   <Profile bookmarked={bookmarked} toggleBookmark={toggleBookmark} />
const Profile = ({ bookmarked = {}, toggleBookmark, user }) => {
  // Convert the `bookmarked` object map into an array of anime items
  // so we can loop over them and render cards.
  // Example: { "Naruto": {...}, "One Piece": {...} } -> [{...}, {...}]
  const bookmarkedList = Object.values(bookmarked);

  return (
    <>
      <div className="max-w-320 mx-auto px-4 md:px-10 mb-20">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mt-8">
            yoo, {user.username}-kun
          </h1>
          <p className="text-text-secondary mt-2">{user.email}</p>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-semibold mt-12 mb-6">
            Here are your bookmarks ({bookmarkedList.length})
          </h2>

          {/* Bookmarks Display Container */}
          <div className="w-full min-h-[320px] p-6 bg-secondary border border-elevated rounded-2xl">
            {bookmarkedList.length === 0 ? (
              // Empty State: Shown when the user has not bookmarked any anime yet
              <div className="flex flex-col items-center justify-center min-h-[260px] text-center gap-3">
                <p className="text-text-secondary text-lg">
                  You haven't bookmarked any anime yet.
                </p>
                <p className="text-text-muted text-sm max-w-md">
                  Explore anime on the Home page and tap the bookmark icon on
                  any card to save it here.
                </p>
                <Link
                  to="/"
                  className="mt-3 px-6 py-2.5 bg-pop-alt text-primary font-bold rounded-xl hover:opacity-90 transition duration-150"
                >
                  Discover Anime
                </Link>
              </div>
            ) : (
              // Render bookmarked anime cards using the reusable AnimeCard component.
              // Notice how passing `toggleBookmark` here allows the user to unbookmark
              // an anime directly from their profile page too!
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <AnimeCard
                  animes={bookmarkedList}
                  bookmarked={bookmarked}
                  onToggle={toggleBookmark}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
