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
