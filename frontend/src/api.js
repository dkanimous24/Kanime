const API_BASE = "/accounts/";

let csrf_token = null;

// to get the csfr token
async function getCsfrToken() {
  const response = await fetch(`${API_BASE}csrf/`, {
    credentials: "include",
  });

  if (!response.ok) {
    const error = new Error("Could not get CSRF token");
    error.status = response.status;
    throw error;
  }

  const data = await response.json();
  const csrf_token = data.csrf;

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

  const url = path.startsWith("/") ? path : `${API_BASE}${path}`;

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
