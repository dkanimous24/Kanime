import { useState, useEffect, use } from "react";
import { Route, Routes, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import Nav from "./components/nav";
import Home from "./pages/Home";
import AnimeProfile from "./pages/animeProfile";
import Profile from "./pages/profile";
import {
  getCurrentUser,
  logout as logoutRequest,
  getWatchlist,
  deleteWatchlist,
  addWatchlist,
} from "./api";
import SignUp from "./pages/signUp";
import Login from "./pages/login";

function BackendStatus() {
  const [connected, setConnected] = useState("checking");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then(() => setConnected("connected successfuly"))
      .catch((err) => {
        console.error(err);
        setConnected("FAILED");
      });
  }, []);

  return (
    <>
      <p>Backend :{connected}</p>
    </>
  );
}

// ============================================================================
// STEP 1: LIFTING STATE UP TO App.jsx
// ============================================================================
// Why lift state here?
// Both Home.jsx (where users bookmark anime) and Profile.jsx (where users view bookmarks)
// need access to the exact SAME bookmark data.
// In React, sibling components cannot pass state directly sideways to each other.
// Therefore, we "lift" the shared state (`bookmarked`) and its updater (`toggleBookmark`)
// up to their closest common parent component: `App.jsx`.
function getAnimeKey(source, outsideId) {
  return `${source}:${outsideId}`;
}

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [loadingUser, setLoadingUser] = useState(true);
  // Shared state: initialized from localStorage so bookmarks persist across reloads
  const [bookmarked, setBookmarked] = useState({});
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [bookmarkBusy, setBookmarkBusy] = useState(false);
  const [bookmarkError, setBookmarkError] = useState("");

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    let canceled = false;
    if (loadingUser) return;

    if (!user) {
      setBookmarked({});
      setLoadingBookmarks(false);
      return;
    }

    setLoadingBookmarks(true);
    setBookmarked({});

    async function loadWatchlist() {
      try {
        const entries = await getWatchlist();
        const bookmark = {};

        for (const entry of entries) {
          const key = getAnimeKey(entry.source, entry.outside_id);
          bookmark[key] = {
            ...entry,
            name: entry.title,
            url: entry.poster_url,
            episodes: entry.episode ?? "?",
          };
        }

        if (!canceled) {
          setBookmarked(bookmark);
        }
      } catch (err) {
        if (!canceled) console.log("failed to load watchlist", err);
      } finally {
        setLoadingBookmarks(false);
      }
    }
    loadWatchlist();
    return () => {
      canceled = true;
    };
  }, [user?.id, loadingUser]);

  const handleAuthenticated = (userData) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await logoutRequest();
      setUser(null);
    } catch (err) {
      console.error("failed to logout", err);
    }
  };

  const toggleBookmarks = async (item) => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (loadingBookmarks || bookmarkBusy) return;

    const source = item.source ?? "jikan";
    const outside_id = item.outside_id ?? item.mal_id;

    if (!outside_id) {
      console.error("cannot book without anime ID", item);
      return;
    }

    const key = getAnimeKey(source, outside_id);
    setBookmarkBusy(true);

    try {
      if (bookmarked[key]) {
        await deleteWatchlist(source, String(outside_id));

        setBookmarked((prev) => {
          const updated = { ...prev };
          delete updated[key];
          return updated;
        });
      } else {
        const saveEntry = await addWatchlist({
          source,
          outside_id: String(outside_id),
          title: item.title ?? item.name,
          poster_url: item.poster_url ?? item.url ?? "",
          episode:
            Number.isInteger(Number(item.episode ?? item.episodes)) &&
            (item.episode ?? item.episodes) != "?"
              ? Number(item.episode ?? item.episodes)
              : null,
        });

        setBookmarked((prev) => ({
          ...prev,
          [key]: {
            ...saveEntry,
            id: saveEntry.outside_id,
            name: saveEntry.title,
            url: saveEntry.poster_url,
            episodes: saveEntry.episode ?? "?",
          },
        }));
      }
    } catch (error) {
      console.error("bookmark operation failed", error);

      let sessionExpired = error.status === 401;

      if (error.status === 403) {
        try {
          // Ask Django whether this browser is still logged in.
          const data = await getCurrentUser();

          // Your /accounts/me/ endpoint returns { user: ... }
          sessionExpired = !data.user;
        } catch (authError) {
          // Only treat a confirmed authentication failure
          // as an expired session.
          sessionExpired = authError.status === 401 || authError.status === 403;
        }
      }

      if (sessionExpired) {
        setUser(null);
        setBookmarked({});

        setBookmarkError("Your session has expired. Please log in again.");

        navigate("/login");
        return;
      }

      setBookmarkError("Unable to update your bookmark. Please try again.");
    }
  };

  return (
    <>
      {bookmarkError && (
        <div
          role="alert"
          className="fixed top-5 right-5 z-[9999] bg-genre-comedy text-white p-4 rounded-lg shadow-lg"
        >
          <p>{bookmarkError}</p>

          <button
            onClick={() => setBookmarkError("")}
            className="mt-2 underline"
          >
            Dismiss
          </button>
        </div>
      )}
      <Nav user={user} loadingUser={loadingUser} onLogout={handleLogout} />
      <Routes>
        {/* STEP 2A: Pass the lifted state and handler down to Home via props */}
        <Route
          path="/"
          element={
            <Home bookmarked={bookmarked} toggleBookmark={toggleBookmarks} />
          }
        />
        <Route path="/animeProfile/:animeName" element={<AnimeProfile />} />
        {/* STEP 2B: Pass the lifted state and handler down to Profile via props */}
        <Route
          path="/profile"
          element={
            loadingUser || loadingBookmarks ? (
              <>
                <p>checking profile...</p>
              </>
            ) : user ? (
              <Profile
                bookmarked={bookmarked}
                toggleBookmark={toggleBookmarks}
                user={user}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/signup"
          element={<SignUp onAuthenticated={handleAuthenticated} />}
        />
        <Route
          path="/login"
          element={<Login onAuthenticated={handleAuthenticated} />}
        />
      </Routes>
      <BackendStatus />
    </>
  );
}

export default App;
