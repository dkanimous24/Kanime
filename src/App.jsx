import { useState, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Nav from "./components/nav";
import Home from "./pages/Home";
import AnimeProfile from "./pages/animeProfile";
import Profile from "./pages/profile";
import { getCurrentUser, logout as logoutRequest } from "./api";
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
function App() {
  const [user, setUser] = useState(null);
  const Navigate = useNavigate();
  const [loadingUser, setLoadingUser] = useState(true);
  // Shared state: initialized from localStorage so bookmarks persist across reloads
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bookmarks"));
      return saved && typeof saved === "object" ? saved : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    getCurrentUser()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoadingUser(false));
  }, []);

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
  // Whenever `bookmarked` changes (from Home OR Profile), sync it to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bookmarks", JSON.stringify(bookmarked));
    } catch {
      // ignore storage errors
    }
  }, [bookmarked]);

  // Handler to toggle an anime's bookmark status (add if missing, remove if present)
  const toggleBookmark = (item) =>
    setBookmarked((prev) => {
      const next = { ...prev };
      if (next[item.name]) delete next[item.name];
      else next[item.name] = item;
      return next;
    });

  return (
    <>
      <Nav user={user} loadingUser={loadingUser} onLogout={handleLogout} />
      <Routes>
        {/* STEP 2A: Pass the lifted state and handler down to Home via props */}
        <Route
          path="/"
          element={
            <Home bookmarked={bookmarked} toggleBookmark={toggleBookmark} />
          }
        />
        <Route path="/animeProfile/:animeName" element={<AnimeProfile />} />
        {/* STEP 2B: Pass the lifted state and handler down to Profile via props */}
        <Route
          path="/profile"
          element={
            loadingUser ? (
              <>
                <p>checking profile...</p>
              </>
            ) : user ? (
              <Profile
                bookmarked={bookmarked}
                toggleBookmark={toggleBookmark}
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
