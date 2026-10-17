const API_BASE = "/accounts/";

let csrf_token = null;

// to get the csfr token
async function getCsfrToken() {
  const response = await fetch(`${API_BASE}csrf/`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("something went wrong, could not get csfr token");
  }

  const data = await response.json();
  const csrf_token = data.csrf;

  return csrf_token;
}

// a helper function that help return the data of the request
async function apiRequest(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = {
    ...options.header,
  };

  if (options.body) {
    headers["Content-type"] = "application/json";
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await getCsfrToken();
    headers["X-CSRFToken"] = token;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    method,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || data.message || JSON.stringify(data));
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
