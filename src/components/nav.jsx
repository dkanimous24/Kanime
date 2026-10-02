import { useState } from "react";
import { closeMenu, openMenu, close, menu, nav } from "./menu";
const Nav = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <nav className="md:hidden  absolute z-[999] top-0 w-full bg-primary p-4">
        <div className="grid grid-cols-2 justify-between">
          <h1 className="ml-3 text-2xl font-bold text-text-primary flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6 fill-pop-alt"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
            KANIME
          </h1>

          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            id="menu"
            onClick={() => setOpen(true)}
            className="size-6 justify-self-end relative z-[999999999999]"
          >
            <path
              fillRule="evenodd"
              d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </nav>

      <nav
        id="navigation"
        className={`absolute z-[999999999] h-[100vh] fixed w-[350px] ${open === true ? "block" : "hidden"} md:block bg-primary border border-secondary p-5 md:relative md:h-auto md:w-full md:bg-primary md:p-0`}
      >
        <div className="p-3 md:grid md:grid-cols-3 md:items-center">
          <h1 className="ml-3 text-2xl font-bold text-text-primary flex items-center">
            <div className="flex gap-36">
              <div className="ml-3 text-2xl font-bold text-text-primary flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-6 fill-pop-alt"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
                KANIME
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                id="close"
                onClick={() => setOpen(false)}
                className="size-7 md:hidden"
              >
                <path
                  fillRule="evenodd"
                  d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </h1>

          <ul className="flex flex-col gap-2 md:flex-row md:items-center md:justify-self-center">
            <li className="p-3 font-bold uppercase text-text-primary">home</li>
            <li className="p-3 font-bold uppercase text-text-primary">
              bookmarks
            </li>
            {/* <li className="p-3 font-bold uppercase text-text-primary">news</li> */}
          </ul>

          <button className="w-[150px] rounded-2xl bg-pop-alt p-3 font-bold text-text-primary md:justify-self-end">
            sign up
          </button>
        </div>
      </nav>
    </>
  );
};

export default Nav;
