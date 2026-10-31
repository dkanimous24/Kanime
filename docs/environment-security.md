# KANIME — Environment Security Configuration

**Project:** KANIME (React + Django REST Framework + PostgreSQL)  
**Phase:** 7 — Security Hardening  
**Step:** 2 — Development vs. Production Security Settings  
**Status:** Local configuration checks passed; production deployment not yet verified  
**Last reviewed:** 2026-10-30

## 1. Purpose

Use one Django codebase with environment-dependent settings. Development should support local HTTP debugging, while production must reject unsafe configurations and require secure transport and cookies.

## 2. Environment selection

- `DJANGO_ENV=development` for local work.
- `DJANGO_ENV=production` for deployment.
- `IS_PRODUCTION` is true only when `DJANGO_ENV` equals `production`.
- Invalid environment names raise an error.
- `DEBUG` is loaded as a Boolean from environment variables.
- The `.env` file is private and must not be committed to source control.

## 3. Configuration matrix

| Setting | Development | Production | Notes |
|---|---|---|---|
| `DEBUG` | `True` | `False` | Production startup rejects `DEBUG=True`. |
| `ALLOWED_HOSTS` | `localhost`, `127.0.0.1` | Explicit real API hostname(s) | Production startup rejects missing host list and `*`. |
| `SECURE_SSL_REDIRECT` | `False` | `True` | Requires correct HTTPS/proxy setup. |
| `SESSION_COOKIE_SECURE` | `False` | `True` | HTTPS-only session cookie in production. |
| `SESSION_COOKIE_HTTPONLY` | `True` | `True` | JavaScript cannot read session cookie. |
| `SESSION_COOKIE_SAMESITE` | `Lax` | `Lax` (subject to deployment design) | Reassess if frontend and API are cross-site. |
| `CSRF_COOKIE_SECURE` | `False` | `True` | HTTPS-only CSRF cookie in production. |
| `CSRF_COOKIE_HTTPONLY` | `False` | `False` | Compatible with React reading the CSRF cookie; reassess if token comes from another source. |
| `CSRF_COOKIE_SAMESITE` | `Lax` | `Lax` (subject to deployment design) | Must match real frontend/API origin arrangement. |
| `SECURE_CONTENT_TYPE_NOSNIFF` | `True` | `True` | Sends content-type protection header. |
| `X_FRAME_OPTIONS` | `DENY` | `DENY` | Prevents framing. |
| `SECURE_HSTS_SECONDS` | `0` | `0` for now | Enable only after production HTTPS is confirmed and rollout planned. |
| `SECRET_KEY` | Private random development key | Separate private random production key | No `django-insecure-` prefix; never expose or commit. |
| `MAILERS['default']` | Console backend | SMTP backend selected | SMTP credentials/provider not yet configured or tested. |
| Cache | `LocMemCache` | Shared cache required for reliable distributed throttling | Production shared cache not yet configured. |

## 4. Existing protections retained

- `SecurityMiddleware`, `CsrfViewMiddleware`, `SessionMiddleware`, and `AuthenticationMiddleware` remain enabled.
- Session-based authentication with CSRF headers is retained.
- CORS allowed origins and CSRF trusted origins are loaded from environment variables.
- PostgreSQL connection values are loaded from environment variables.
- Django password validators remain enabled.

## 5. Production startup guards

KANIME rejects these configurations during settings initialization:

1. `DJANGO_ENV=production` with `DEBUG=True`.
2. `DJANGO_ENV=production` with no explicitly configured `ALLOWED_HOSTS`.
3. `DJANGO_ENV=production` with `ALLOWED_HOSTS=*`.

These guards are useful but do **not** validate the complete production deployment or every potentially unsafe hostname pattern.

## 6. Verified local tests

| Test | Observed result |
|---|---|
| `python manage.py check` in development | `System check identified no issues (0 silenced).` |
| Development settings inspection | HTTPS redirect `False`; session and CSRF secure flags `False`; HSTS `0`. |
| Production with `DEBUG=True` | Rejected by configuration guard (user confirmed). |
| Production with `ALLOWED_HOSTS=*` | Rejected with `ImproperlyConfigured`. |
| `check --deploy` with original secret | Reported `security.W009`. |
| `check --deploy` after replacing secret | `security.W009` no longer appeared. |
| Simulated production with `DEBUG=False` and explicit hostname | `python manage.py check` passed. |
| Simulated production settings inspection | Production environment, HTTPS redirect and secure cookies all `True`; HSTS `0`. |
| Return to development | `python manage.py check` passed. |

**Note:** The `check --deploy` command was run against development settings, so warnings about HTTPS, cookies, HSTS, and DEBUG were expected. The console email backend produced `mail.E001` under the deployment checker. A clean production `check --deploy` has **not** yet been demonstrated.

## 7. Remaining production tasks

- [ ] Set a real production hostname and exact React/CORS/CSRF origins.
- [ ] Set a separate, strong production `SECRET_KEY` and keep it in a secure secrets store.
- [ ] Configure real HTTPS, reverse proxy and secure request detection; test redirects without loops.
- [ ] Decide whether frontend and API are same-site; validate `SameSite`, cookie, CORS, and CSRF behavior end-to-end.
- [ ] Introduce HSTS gradually **after** HTTPS is confirmed; assess subdomains before including them.
- [ ] Configure and verify production SMTP or another supported mail delivery backend.
- [ ] Configure shared caching for production rate limits and multi-worker behavior.
- [ ] Run `python manage.py check --deploy` with actual production-equivalent settings and resolve applicable warnings/errors.
- [ ] Test login, logout, CSRF, and watchlist ownership in a production-like environment.
- [ ] Confirm `.env` is ignored by Git; audit repository history for exposed secrets.
- [ ] Consider startup validation that production cannot silently use development-only services or secrets.

## 8. Safety notes

- `python manage.py check` passing means Django found no issues in its standard system checks; it is not proof of production readiness.
- Do not run a local HTTP React flow against simulated HTTPS-only production cookies and assume login should work.
- Do not publish secret keys, database passwords, session cookies, or CSRF tokens in documentation or screenshots.
- Rotating Django `SECRET_KEY` can invalidate sessions and signed values.

## 9. Next phase

Proceed to **Phase 7, Step 3: Input Validation**. Before deployment, return to the remaining production tasks in Section 7.
