# KANIME --- Phase 7 Security Audit & Deployment Handoff

**Review date:** 2 November 2026\
**Project:** KANIME (React frontend, Django REST Framework backend,
PostgreSQL)\
**Status:** **Ready to BEGIN deployment configuration; NOT YET cleared
for public production release.**

## 1. Executive assessment

KANIME has completed its main local development, React--Django
integration, security-hardening work, and the local security audit
activities described below. Signup, login, catalog search, and watchlist
were reported working in the browser.

**Decision: Proceed to Phase 8 --- Deployment.** The production-only
checks below are deployment tasks, not prerequisites for starting
deployment. Public release must wait until those checks pass. This
document is an evidence-based handoff, not a certification of production
security.

## 2. Section 12 security checklist

  -------------------------------------------------------------------------------
  Requirement             Current assessment      Evidence / remaining work
  ----------------------- ----------------------- -------------------------------
  DEBUG off               **Partially verified**  Production-mode settings loaded
                                                  with `DEBUG=False`; generic
                                                  live error page not checked.

  SECRET_KEY unique and   **Partially verified**  Both keys configured, 50
  private                                         characters; local fingerprint
                                                  comparison showed dev and
                                                  production keys differ.
                                                  Gitleaks found no recognizable
                                                  secrets; production secret
                                                  storage still to verify.

  ALLOWED_HOSTS           **Partially verified**  Production settings reject
  restricted                                      missing ALLOWED_HOSTS; real
                                                  production domain allowlist
                                                  pending.

  HTTPS enforced          **Deployment check**    Configure TLS and HTTP-to-HTTPS
                                                  redirect on live host.

  Cookies secure,         **Deployment check**    Inspect live browser cookie
  HttpOnly, sensible                              flags.
  SameSite                                        

  CSRF active             **Verified locally**    Missing CSRF token rejected;
                                                  prior tests passed.

  CORS exact              **Partially verified**  Environment-based settings
                                                  exist; actual production origin
                                                  allowlist pending.

  Endpoints locked by     **Partially verified**  Authenticated watchlist and
  default                                         unauthorized cases tested;
                                                  complete logged-out endpoint
                                                  audit pending.

  Ownership enforced      **Verified locally**    Watchlist user-isolation tests
                                                  passed.

  Rate limits active      **Verified in tests;    Login/signup throttle tests
                          production check        passed and 429 tested;
                          pending**               production shared
                                                  cache/rate-limit behavior
                                                  pending.

  Validation strict       **Partially verified**  Invalid inputs tested;
                                                  oversized payload behavior not
                                                  fully verified.

  Errors safe             **Verified locally**    Safe responses for expected
                                                  errors and unexpected 500
                                                  tested; live error-page check
                                                  pending.

  Logs clean              **Review pending**      Review representative
                                                  production logs for passwords,
                                                  session IDs, keys, and other
                                                  sensitive data.

  Dependencies current    **Partially verified**  Python `pip-audit`: no known
                                                  vulnerabilities;
                                                  `npm audit --omit=dev`: 0; full
                                                  npm audit: 6 moderate
                                                  development reports tied to
                                                  minimatch/ESLint, unresolved.

  Database least          **Verified for local    `kanime_app` not superuser;
  privilege and private   role/network;           CREATEDB, CREATEROLE,
                          production check        REPLICATION, BYPASSRLS all
                          pending**               false; PostgreSQL
                                                  `listen_addresses=localhost`;
                                                  production role, firewall, and
                                                  network still to review.

  Backups restorable      **Partially verified**  Fresh `kanime_backup.dump`
                                                  created (41,576 bytes).
                                                  Existing `kanime_restore_test`
                                                  had 21 migrations, 9 users, 20
                                                  anime snapshots, 29 watchlist
                                                  entries; this demonstrates an
                                                  earlier populated restore but
                                                  does **not** verify the newly
                                                  created backup was restored.

  Admin protected         **Partially verified**  One active superuser/staff
                                                  account with usable password;
                                                  password strength and
                                                  production admin access
                                                  restrictions not independently
                                                  verified.

  All tests pass          **Verified previously** 14 Django automated tests
                                                  reported passing before this
                                                  handoff; rerun as part of
                                                  release checks.
  -------------------------------------------------------------------------------

## 3. Completed audit evidence

-   **Python packages:** `python -m pip_audit` reported no known
    vulnerabilities.
-   **React production packages:** `npm audit --omit=dev` reported 0
    vulnerabilities.
-   **React full audit:** 6 moderate reports involving
    `minimatch@10.2.6` and ESLint dependency chain. No forced upgrades
    performed; assess and remediate or document an explicit exception
    before release.
-   **Repository history:** `gitleaks git . --redact` scanned 25 commits
    (\~2.95 MB) and reported no leaks. This does not prove no secrets
    exist anywhere.
-   **Django configuration:** `python manage.py check` reported no
    issues after PostgreSQL was restricted to localhost.
-   **Database account:** `kanime_app` has no superuser, createdb,
    createrole, replication, or bypass-RLS attributes. Other
    object-level privileges still require review.
-   **Database network (local):** `SHOW listen_addresses` returned
    `localhost`, and Django connects to `localhost`.
-   **Backup:** A custom-format PostgreSQL dump exists; previous
    restore-test database contains migration records and application
    data.
-   **Admin:** One active superuser and staff account, with a usable
    password.
-   **Automated tests:** 14 tests previously passed, including
    authentication, CSRF, ownership, throttling, and catalog checks.

## 4. Phase 8 --- Deployment release gates

Before opening KANIME to real users:

1.  Provision hosting, production PostgreSQL, environment secrets, and a
    production-appropriate shared cache for throttling.
2.  Configure domain-specific `ALLOWED_HOSTS`, exact CORS origins, HTTPS
    redirect, HSTS when appropriate, and secure session/CSRF cookies.
3.  Confirm `DEBUG=False` and that real error pages and API failures
    reveal no stack traces or secrets.
4.  Audit every endpoint logged out; test CSRF, ownership, rate limits,
    malformed requests, and oversized payloads on the deployed system.
5.  Verify production database credentials have minimum necessary object
    privileges and that network/firewall rules block public database
    access.
6.  Verify protected admin access, strong unique administrator
    credentials, and logging that excludes credentials and tokens.
7.  Restore a **fresh** backup into an isolated database and validate
    expected tables/data; establish a backup schedule and recovery
    procedure.
8.  Review the six moderate development-dependency advisories; upgrade
    safely or record a reasoned exception.
9.  Rerun all automated tests and production deployment checks; record
    date, environment, and outcomes.

## 5. Release decision and next phase

**Approved to start Phase 8: Deployment setup and verification.**

**Not yet approved for public production launch.** That decision depends
on completing and recording the deployment release gates above. The
deferred checks are expected work *during deployment*, not a reason to
postpone beginning deployment.

**Next action:** Choose hosting and design the production deployment
architecture for React, Django, PostgreSQL, and caching.
