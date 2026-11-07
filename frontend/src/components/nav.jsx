import { useState, useEffect } from "react";

import Search from "./search";

import { Link, useNavigate, useLocation } from "react-router-dom";

const Nav = ({ user, loadingUser, onLogout }) => {
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  // Close the mobile menu when the page changes.

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Escape closes the menu. Lock scrolling only on mobile.

  useEffect(() => {
    if (!open) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };

    const media = window.matchMedia("(max-width: 767px)");

    const previousOverflow = document.body.style.overflow;

    const updateScrollLock = () => {
      document.body.style.overflow = media.matches
        ? "hidden"
        : previousOverflow;
    };

    updateScrollLock();

    media.addEventListener("change", updateScrollLock);

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      media.removeEventListener("change", updateScrollLock);

      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      {/* MOBILE TOP BAR */}

      <nav className="md:hidden fixed z-[999] top-0 left-0 w-full bg-primary p-4 max-[359px]:p-3">
        <div className="flex items-center justify-between">
          <h1 className="ml-3 max-[359px]:ml-1 text-2xl max-[359px]:text-xl font-bold text-text-primary flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6 max-[359px]:size-5 fill-pop-alt"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
            KANIME
          </h1>

          <button
            type="button"
            id="menu"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="navigation"
            className="flex items-center justify-center size-9 max-[359px]:size-8 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6 max-[359px]:size-5"
            >
              <path
                fillRule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE BACKDROP */}

      <div
        onClick={closeMenu}
        aria-hidden="true"
        className={`md:hidden fixed inset-0 z-[9998] bg-black/60 backdrop-blur-[3px] transition-opacity duration-300 ease-out motion-reduce:transition-none ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* MOBILE SLIDE-IN MENU + DESKTOP NAVIGATION */}

      <nav
        id="navigation"
        aria-label="Main navigation"
        className={`fixed top-0 left-0 z-[9999] h-[100dvh] w-87.5 max-w-[min(350px,100vw)] overflow-y-auto overscroll-contain bg-primary border border-secondary p-5 max-[359px]:p-2 transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 pointer-events-none"
        } md:translate-x-0 md:opacity-100 md:pointer-events-auto md:transform-none md:transition-none md:block md:relative md:h-auto md:w-full md:max-w-none md:overflow-visible md:bg-primary md:p-0`}
      >
        <div className="p-3 max-[359px]:p-2 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4 md:items-center">
          <div className="md:flex md:items-center md:gap-4">
            <h1 className="ml-3 max-[359px]:ml-0 text-2xl max-[359px]:text-xl font-bold text-text-primary flex items-center">
              <div className="flex w-full items-center justify-between gap-3 md:gap-36">
                <div className="ml-3 max-[359px]:ml-0 text-2xl max-[359px]:text-xl font-bold text-text-primary flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-6 max-[359px]:size-5 fill-pop-alt"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  KANIME
                </div>

                <button
                  type="button"
                  id="close"
                  onClick={closeMenu}
                  aria-label="Close navigation menu"
                  className="md:hidden flex items-center justify-center size-9 max-[359px]:size-8 shrink-0 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="size-7 max-[359px]:size-6"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </h1>

            <Search onSelect={closeMenu} />
          </div>

          <ul className="flex flex-col gap-2 max-[359px]:gap-1 md:flex-row md:items-center md:justify-self-center">
            <li className="p-3 max-[359px]:p-2 font-bold uppercase text-text-primary max-[359px]:text-sm">
              <Link to="./" onClick={closeMenu}>
                home
              </Link>
            </li>

            {/* <li className="p-3 font-bold uppercase text-text-primary">
              bookmarks
            </li> */}

            {user && (
              <li className="p-3 max-[359px]:p-2 font-bold uppercase text-text-primary max-[359px]:text-sm">
                <Link to="/profile" onClick={closeMenu}>
                  you
                </Link>
              </li>
            )}

            {/* <li className="p-3 font-bold uppercase text-text-primary">news</li> */}
          </ul>

          <div className="flex flex-col gap-2 max-[359px]:gap-1 md:flex-row md:items-center md:justify-self-end">
            {loadingUser ? (
              <span className="text-text-primary max-[359px]:text-sm">
                Checking session...
              </span>
            ) : user ? (
              <>
                <span className="text-text-primary max-[359px]:text-sm break-words">
                  Hi, {user.username}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    closeMenu();

                    onLogout();

                    navigate("/login/");
                  }}
                  className="w-[150px] max-[359px]:w-full rounded-2xl bg-pop-alt p-3 max-[359px]:p-2 font-bold text-text-primary max-[359px]:text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="p-3 max-[359px]:p-2 font-bold text-text-primary max-[359px]:text-sm"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMenu}
                  className="w-[150px] max-[359px]:w-full rounded-2xl bg-pop-alt p-3 max-[359px]:p-2 text-center font-bold text-text-primary max-[359px]:text-sm"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Nav;
