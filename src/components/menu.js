export const menu = document.querySelector("#menu");
export const close = document.querySelector("#close");
export const nav = document.getElementById("navigation");

export const openMenu = () => {
  menu.addEventListener("click", () => {
    nav.classList.toggle("hidden");
  });
};

export const closeMenu = () => {
  close.addEventListener("click", () => {
    nav.classList.toggle("hidden");
  });
};
