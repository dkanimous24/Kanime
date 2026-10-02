/**
 * Loads an image from a URL and returns a sharpened version.
 * @param {string} url - image URL (server must allow CORS if on another domain)
 * @param {number} amount - strength, 0 (none) to ~2 (strong). Default 0.6
 * @returns {Promise<HTMLCanvasElement>} resolves to a canvas with the sharpened image
 */
export function sharpenImage(url, amount = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // needed for cross-domain images

    img.onerror = () => reject(new Error("Could not load image: " + url));

    img.onload = () => {
      try {
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const src = ctx.getImageData(0, 0, w, h); // throws if canvas is tainted (no CORS)
        const out = ctx.createImageData(w, h);
        const s = src.data;
        const d = out.data;

        const center = 1 + 4 * amount; // kernel sums to 1, so brightness is preserved
        const side = -amount;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 4;

            // Copy edge pixels unchanged
            if (x === 0 || y === 0 || x === w - 1 || y === h - 1) {
              d[i] = s[i];
              d[i + 1] = s[i + 1];
              d[i + 2] = s[i + 2];
              d[i + 3] = s[i + 3];
              continue;
            }

            for (let c = 0; c < 3; c++) {
              const v =
                s[i + c] * center +
                s[i - 4 + c] * side + // left
                s[i + 4 + c] * side + // right
                s[i - w * 4 + c] * side + // up
                s[i + w * 4 + c] * side; // down
              d[i + c] = Math.min(255, Math.max(0, v));
            }
            d[i + 3] = s[i + 3]; // keep alpha
          }
        }

        ctx.putImageData(out, 0, 0);
        resolve(canvas);
      } catch (err) {
        reject(err);
      }
    };

    img.src = url;
  });
}
const GENRE_COLORS = {
  // Demographics
  shonen: "#f87171",
  shoujo: "#ff6b9d",
  seinen: "#64748b",
  josei: "#a78bfa",
  kodomo: "#fbbf24",
  // Genres
  action: "#ef4444",
  adventure: "#fb923c",
  comedy: "#facc15",
  drama: "#a78bfa",
  fantasy: "#7c5cff",
  isekai: "#8b5cf6",
  mecha: "#38bdf8",
  mystery: "#4c6ef5",
  psychological: "#6b7280",
  romance: "#ff6b9d",
  scifi: "#22d3ee",
  "slice-of-life": "#4ade80",
  sports: "#34d399",
  supernatural: "#c084fc",
  horror: "#52525b",
  thriller: "#dc2626",
  ecchi: "#f472b6",
  harem: "#fb7185",
};

/**
 * Returns Tailwind classes for a given genre.
 * @param {string} genre - e.g. "shonen", "slice-of-life"
 * @param {"bg"|"text"|"border"|"ring"} type - which utility you want
 * @param {boolean} hover - whether to include a hover state
 * @returns {string} Tailwind class string
 */
export function getGenreTailwind(genre, type = "bg") {
  if (!genre) return "";
  const slug = genre.trim().toLowerCase().replace(/\s+/g, "-");
  return `${type}-genre-${slug}`;
}
