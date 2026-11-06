const API_ORIGIN = import.meta.env.VITE_API_URL || "";

const API_BASE = `${API_ORIGIN}/accounts/`;

let csrf_token = null;

// to get the csfr token
async function getCsfrToken() {
  if (csrf_token) {
    return csrf_token;
  }

  const response = await fetch(`${API_BASE}csrf/`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = new Error("Could not get CSRF token");
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  csrf_token = data.csrf;

  return csrf_token;
}

// a helper function that help return the data of the request
async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    ...options.headers,
  };

  if (options.body) {
    headers["Content-type"] = "application/json";
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await getCsfrToken();
    headers["X-CSRFToken"] = token;
  }

  const url = path.startsWith("/")
    ? `${API_ORIGIN}${path}`
    : `${API_BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected JSON but received ${contentType || "unknown content type"} ` +
        `from ${response.url} (HTTP ${response.status})`,
    );
  }

  const data = await response.json();
  if (!response.ok) {
    const error = new Error(
      data.detail || data.message || JSON.stringify(data),
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

// thes exported data will return data depending on the request
export function signup(username, email, password) {
  return apiRequest("signup/", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });
}

export function login(username, password) {
  return apiRequest("login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}
export function logout() {
  return apiRequest("logout/", {
    method: "POST",
  });
}

export function getCurrentUser() {
  return apiRequest("me/");
}

// GET function to get all saved anime of a particular user
export function getWatchlist() {
  return apiRequest("/api/watchlist/");
}

// POST function to add a new bookmark to the watchlist
export function addWatchlist(anime) {
  return apiRequest("/api/watchlist/", {
    method: "POST",
    body: JSON.stringify(anime),
  });
}

//  DELETE function to delete a new bookmark to the watchlist
export function deleteWatchlist(source, outside_id) {
  return apiRequest(
    `/api/watchlist/${encodeURIComponent(source)}/${encodeURIComponent(outside_id)}/`,
    {
      method: "DELETE",
    },
  );
}

// Get trending anime
export function getCatalogTrending() {
  return apiRequest("/api/catalog/trending/");
}

// Get top-rated anime
export function getCatalogTop() {
  return apiRequest("/api/catalog/top/");
}

// Search for anime
export function searchCatalogAnime(query) {
  return apiRequest(`/api/catalog/search/?q=${encodeURIComponent(query)}`);
}

// Get individual anime details
export function getCatalogAnimeDetails(source, outside_id) {
  return apiRequest(
    `/api/catalog/anime/${encodeURIComponent(source)}/${encodeURIComponent(outside_id)}/`,
  );
}
