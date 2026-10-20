import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// https://vite.dev/config/

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Anime News Network RSS
      "/ann": {
        target: "https://www.animenewsnetwork.com",
        changeOrigin: true,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
          Accept: "application/rss+xml, application/xml, text/xml, */*",
        },
        rewrite: (path) => path.replace(/^\/ann/, ""),
      },

      // Jikan (MyAnimeList) API: the browser talks to localhost, Vite talks to Jikan.
      // No CORS, and extensions/ad blockers can't see a cross-site request.
      "/jikan": {
        target: "https://api.jikan.moe",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/jikan/, ""),
      },
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },

      "/accounts": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
