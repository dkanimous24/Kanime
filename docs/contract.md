# api contract list v1

| endpoint      | purpose                                 | who can call it                                                                                     | what it should contain                                                                                                |
| ------------- | --------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| api/signup    | to register the user                    | automatically called in the browser or system                                                       | should contain user information                                                                                       |
| api/login     | to login the user                       | automatically called after the user has signed in or called if the user what to login automatically | should contain user information and user token once the user has been both authorized and authenticated               |
| api/watchlist | to save whatever the user want to watch | only called by the user when they want to save an anime                                             | should contain what the anime information so as to save it the database such as anime name,id,title,posterImage e.t.c |

# How the Endpoints Will Actually Look (Good and Bad Responses)

## 1. `api/accounts/login`

**Request:** `POST`

**Response:**

- `200 OK` — Login successful, session is stored in the database.
- `400 Bad Request` — Empty parameters.
- `401 Unauthorized` — Invalid username or password.

---

## 2. `api/accounts/signup`

**Request:** `POST`

**Response:**

- `201 Created` — Signup successful, session is stored in the database.
- `400 Bad Request` — Empty parameters.

---

## 3. `api/accounts/me`

**Request:** `GET`

**Response:**

- `201` — Returns user information since the user is authorised.
- `401 Unauthorized` — Unauthorised.

---

## 4. `api/accounts/csfr`

**Request:** `GET`

**Response:**

- `200 OK` — The token is made available, commonly in a JSON response, with the CSRF cookie set.

---

## 5. `api/accounts/logout`

**Request:** `POST`

**Response:**

- `204 No Content` — Logout succeeded. There is no response body.
- `403 Forbidden` — The request failed CSRF protection, for example.

## CSFR mechanism

how it will be implemented is basically

1. react ask django to provide a csfr token
2. django give browser the token and returns it response header
3. the token is stored in a token when a making a protected request
4. django validates if it fails django rejects it and return a 403 forbidden message

## Signup Validation Rules

Django must enforce the following rules when a user creates a Kanime account:

1. **Unique username:** A username must not already belong to another account.
2. **Unique email:** An email address must not already belong to another account.
3. **Valid email format:** The supplied email must have a valid email format.
4. **Password strength:** The password must meet the configured Django password validation requirements.
5. **Required fields:** The `username`, `email`, and `password` fields must be provided and must not be empty.
6. **Password confirmation:** If the signup form includes `confirm_password`, it must match `password`. The confirmation value is not stored in the database.

### Error Responses

- `400 Bad Request` — A required field is missing, the email format is invalid, the username or email is already taken, the password is too weak, or the password confirmation does not match.

### Security Rules

- Passwords must be hashed using Django's password-handling system; they must never be stored as plain text.
- Django must enforce validation even if React has already validated the form.
- Error responses must not expose passwords or password hashes.

## Watchlist API

### GET `/api/watchlist/`

**Purpose:** Retrieve the authenticated user's saved anime.

**Request method:** GET

**Expected responses:**

- `200 OK` — Returns the user's watchlist as JSON.
- Authentication failure — Request is rejected when the user is not logged in. Our current DRF setup may return `403 Forbidden`.

### POST `/api/watchlist/`

**Purpose:** Add an anime to the authenticated user's watchlist.

**Request method:** POST

**Example request:**

```json
{
  "source": "jikan",
  "outside_id": "20",
  "title": "Naruto",
  "poster_url": "https://example.com/naruto.jpg",
  "episode": 220
}
```

**Expected responses:**

- `201 Created` — Anime successfully added.
- `200 OK` — Anime already exists in the user's watchlist, if supported by the view.
- `400 Bad Request` — Invalid submitted data.
- `403 Forbidden` — Authentication, permission, or CSRF check failed.

### DELETE `/api/watchlist/<source>/<outside_id>/`

**Purpose:** Remove an anime from the authenticated user's watchlist.

**Request method:** DELETE

**Expected responses:**

- `204 No Content` — Bookmark successfully removed.
- `403 Forbidden` — Authentication or permission check failed.
- `404 Not Found` — Bookmark does not exist for the current user, if the view uses this behavior.

### Authentication

Watchlist requests use Django session-cookie authentication.

POST and DELETE requests require CSRF protection.

Every watchlist operation must be scoped to the currently authenticated user.

# Phase 6 — Anime Catalog API Contract

## Step 1: Update the API Contract

### Overview

The catalog API allows React to retrieve anime information through the Django backend instead of communicating directly with Jikan or Kitsu.

An API contract defines:

- Which endpoints React can call.
- Which HTTP methods each endpoint accepts.
- What information React must send.
- What JSON structure Django returns.
- Which HTTP status codes indicate success or failure.

All catalog endpoints are **public**, meaning users do not need to log in to browse anime.

Watchlist endpoints remain protected because bookmarks belong to individual users.

---

## A. Catalog Endpoints

| Method | Endpoint                        | Purpose                                 | Authentication |
| ------ | ------------------------------- | --------------------------------------- | -------------- |
| GET    | `/api/catalog/trending/`        | Retrieve featured anime for the Hero    | Public         |
| GET    | `/api/catalog/top/`             | Retrieve anime for the Discover section | Public         |
| GET    | `/api/catalog/search/?q=naruto` | Search for anime by title               | Public         |
| GET    | `/api/catalog/anime/jikan/20/`  | Retrieve the details of one anime       | Public         |

### 1. GET `/api/catalog/trending/`

**Purpose:** Retrieve trending anime for the Hero section.

**Request method:** `GET`

**Authentication:** Not required.

**Successful response:** `200 OK`

Returns a list of anime in KANIME's standardized format, including cover images when available.

### 2. GET `/api/catalog/top/`

**Purpose:** Retrieve anime for the Discover section.

**Request method:** `GET`

**Authentication:** Not required.

**Successful response:** `200 OK`

Returns a list of top anime using the same standardized format as the trending endpoint.

### 3. GET `/api/catalog/search/?q=naruto`

**Purpose:** Search for anime using a title or keyword.

**Request method:** `GET`

**Authentication:** Not required.

**Query parameter:**

- `q` — The search keyword.

**Example request:**

`GET /api/catalog/search/?q=naruto`

**Expected responses:**

- `200 OK` — Returns matching anime.
- `400 Bad Request` — Search query is missing, too short, or too long.
- `503 Service Unavailable` — External anime services are unavailable and no cached response exists.

Search queries will be trimmed and validated. Results will contain at most 10 anime.

### 4. GET `/api/catalog/anime/{source}/{outside_id}/`

**Purpose:** Retrieve detailed information about one anime.

**Request method:** `GET`

**Authentication:** Not required.

**Path parameters:**

- `source` — The external anime provider, such as `jikan` or `kitsu`.
- `outside_id` — The anime's unique identifier within that provider.

**Example request:**

`GET /api/catalog/anime/jikan/20/`

**Expected responses:**

- `200 OK` — Returns the anime details.
- `400 Bad Request` — Invalid source or malformed anime ID.
- `404 Not Found` — The anime does not exist.
- `503 Service Unavailable` — External services are unavailable and no usable cached data exists.

---

## B. Standard Anime Data Structure

Jikan and Kitsu return anime information in different formats.

Django will use adapters to convert their responses into one consistent structure.

### Example Anime Object

```json
{
  "source": "jikan",
  "outside_id": "20",
  "title": "Naruto",
  "poster": "https://example.com/poster.jpg",
  "cover": null,
  "synopsis": "A young ninja dreams of becoming Hokage.",
  "episodes": 220,
  "score": 8.0,
  "year": 2002,
  "age_rating": "PG-13",
  "studio": "Pierrot",
  "genres": ["action", "adventure"]
}
```

> **Note:** This is an illustrative JSON object, not a live API response.

### Field Definitions

| Field        | Data Type        | Description                             |
| ------------ | ---------------- | --------------------------------------- |
| `source`     | String           | External provider supplying the anime   |
| `outside_id` | String           | Anime ID within the external provider   |
| `title`      | String           | Anime display name                      |
| `poster`     | String or null   | Vertical anime poster URL               |
| `cover`      | String or null   | Wide banner image URL                   |
| `synopsis`   | String or null   | Anime description                       |
| `episodes`   | Integer or null  | Number of episodes                      |
| `score`      | Number or null   | Anime rating on a consistent 0–10 scale |
| `year`       | Integer or null  | Release year                            |
| `age_rating` | String or null   | Audience classification                 |
| `studio`     | String or null   | Animation studio                        |
| `genres`     | Array of strings | Anime genres in lowercase               |

### Important Identification Rule

Every anime is identified by the combination of:

`(source, outside_id)`

For example:

- `("jikan", "20")`
- `("kitsu", "20")`

These identifiers do not necessarily represent the same anime.

Using both fields prevents identification conflicts between providers.

---

## C. Standard API Response Structure

Catalog responses will contain:

- `data` — The requested anime information.
- `stale` — Whether the response contains an older emergency cached copy.

### Example: Trending Anime Response

**Request:**

`GET /api/catalog/trending/`

**Response: `200 OK`**

```json
{
  "data": [
    {
      "source": "jikan",
      "outside_id": "20",
      "title": "Naruto",
      "poster": "https://example.com/poster.jpg",
      "cover": null,
      "synopsis": "...",
      "episodes": 220,
      "score": 8.0,
      "year": 2002,
      "age_rating": "PG-13",
      "studio": "Pierrot",
      "genres": ["action", "adventure"]
    }
  ],
  "stale": false
}
```

### Understanding the `stale` Field

| Value   | Meaning                                                                 |
| ------- | ----------------------------------------------------------------------- |
| `false` | Data is fresh or still within its normal cache lifetime                 |
| `true`  | Data is an older cached copy served because the external service failed |

### List Responses

The following endpoints return an array inside `data`:

- `/api/catalog/trending/`
- `/api/catalog/top/`
- `/api/catalog/search/`

### Details Response

The anime details endpoint returns one anime object inside `data`.

```json
{
  "data": {
    "source": "jikan",
    "outside_id": "20",
    "title": "Naruto",
    "poster": "https://example.com/poster.jpg",
    "cover": null,
    "synopsis": "...",
    "episodes": 220,
    "score": 8.0,
    "year": 2002,
    "age_rating": "PG-13",
    "studio": "Pierrot",
    "genres": ["action", "adventure"]
  },
  "stale": false
}
```

---

## D. Error Responses

The API should return meaningful HTTP status codes when requests fail.

### Standard Error Format

```json
{
  "detail": "Anime service is temporarily unavailable."
}
```

### HTTP Status Codes

| Status Code               | Meaning                      | When It Happens                                       |
| ------------------------- | ---------------------------- | ----------------------------------------------------- |
| `200 OK`                  | Successful request           | Fresh, cached, or stale anime data returned           |
| `400 Bad Request`         | Invalid input                | Invalid search query, unknown source, or malformed ID |
| `404 Not Found`           | Anime not found              | Requested anime does not exist                        |
| `503 Service Unavailable` | External service unavailable | Jikan/Kitsu failed and no usable cached copy exists   |
| `429 Too Many Requests`   | Rate limit exceeded          | Reserved for visitor rate limiting in Phase 7         |

### Failure-Handling Rules

1. Check the cache before contacting external services.
2. Return fresh cached data immediately when available.
3. If fresh data is unavailable, attempt to retrieve data from Jikan.
4. If Jikan fails, check for a usable stale cached copy.
5. If no stale copy exists, attempt the Kitsu fallback where supported.
6. If all available sources fail, return `503 Service Unavailable`.
7. Never expose an unhandled exception or crash the application because an upstream service failed.

---

## E. Updated Watchlist Request

### POST `/api/watchlist/`

**Purpose:** Add an anime to the authenticated user's watchlist.

**Authentication:** Required.

**CSRF protection:** Required.

### Previous Request Format

Previously, React submitted the anime's details directly:

```json
{
  "source": "jikan",
  "outside_id": "20",
  "title": "Naruto",
  "poster_url": "https://example.com/poster.jpg",
  "episode": 220
}
```

### New Request Format — Phase 6

React will send only the anime's source and external ID:

```json
{
  "source": "jikan",
  "outside_id": "20"
}
```

### Updated Backend Workflow

1. Django authenticates the user.
2. Django validates the CSRF token and permissions.
3. Django validates `source` and `outside_id`.
4. Django retrieves the anime's real details through the catalog service.
5. Django rejects an anime that does not exist.
6. Django creates or updates the `AnimeSnapshot` using trusted catalog information.
7. Django finds or creates the user's `WatchlistEntry`.
8. Django returns the saved watchlist entry.

### Security Rule

**Never trust anime titles, poster URLs, or episode counts submitted by the browser when creating an AnimeSnapshot.**

The backend must retrieve these values from its catalog service.

This prevents users from creating fake anime snapshots or inserting untrusted poster links.

### Important Implementation Note

The existing React watchlist request should **not be changed yet**.

This new request format will be implemented in **Phase 6, Step 9**, after the catalog details endpoint is working.

---

## Implementation Status

**Current phase:** Phase 6 — Anime Catalog

**Current step:** Step 1 — Update API Contract

**Status:** Planned contract; implementation and testing pending.

The endpoints, JSON structures, and behaviors described above define the intended implementation. They must be verified against the Django code as development progresses.
