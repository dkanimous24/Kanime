# KANIME — Phase 7 Threat Map

**Project:** KANIME (React frontend, Django REST Framework backend, PostgreSQL database)  
**Phase:** 7 — Security Hardening, Error Handling, Logging, and Testing  
**Status:** Initial threat map; protections must be verified through code review and tests.  
**Based on:** *KANIME Backend Study Guide, Part 7, Phase 7*, Sections 2 and 14, Step 1.

## 1. Purpose

Identify what KANIME needs to protect, how it could fail or be abused, which defenses are already part of the project, and which additional safeguards Phase 7 will implement and test.

## 2. Threat map

| Asset / component | What could go wrong | Existing defenses to verify | Phase 7 work |
|---|---|---|---|
| User accounts and passwords | Password guessing, credential stuffing, fake signups | Django password hashing, validators, generic login failures | Login/signup rate limits; monitor failures; test validation |
| Login sessions | Stolen session cookies, forged state-changing requests | Session authentication, CSRF protection, cookie settings | Audit cookie flags, session lifetime, secure headers, logout |
| Private watchlists | A user reads or deletes another user's entries | Authentication and ownership filtering | Automated cross-user list/delete tests; verify unknown entry returns 404 |
| Server resources | Floods of requests and oversized payloads | Framework validation and existing protections | Request-size limits, input constraints, throttling |
| Catalog and Jikan/Kitsu usage | Excessive requests, upstream outages, unsafe external data | Backend relay, caching, Jikan/Kitsu fallback | Catalog/search throttling, controlled failures, URL and input validation, offline tests |
| Secrets and configuration | API keys, passwords, or Django secret key leak via Git, logs, or errors | Environment-based configuration | Repository/history audit, separate production secrets, safe logging |
| Dependencies and application code | Vulnerable packages or regressions | Existing project dependencies and manual testing | Python/JavaScript vulnerability checks, automated test suite |
| PostgreSQL data | Excessive database privileges, unauthorized access, lost data | Dedicated application role, database constraints, tested backup restoration | Verify least privilege and network exposure; regression tests |
| API error responses | Internal paths, stack traces, or upstream details exposed | Existing endpoint error handling | Consistent safe error format and React error handling |
| Admin access | Unnecessary privileges or compromised admin accounts | Django admin authentication | Audit superusers and admin protections |

> **Verification note:** An item listed under “Existing defenses to verify” is not automatically certified secure. Inspect its actual implementation and test its behavior.

## 3. Highest-priority scenarios

### A. Repeated login attempts
An attacker submits many passwords against one or more accounts. Rate limits should reduce the speed of guessing and return a safe `429 Too Many Requests` response when exceeded. Failed attempts should be logged without recording passwords.

### B. Cross-user watchlist modification
An authenticated user includes another person's `user_id` in a request or tries to remove another user's bookmark. The backend must derive ownership from the authenticated session, ignore client-supplied owner IDs, and refuse unauthorized operations without exposing private records.

### C. Catalog provider outage
If Jikan fails, KANIME should serve a suitable cached result when available, or try Kitsu. If no provider or cache can supply a response, return a clean `503 Service Unavailable` and show a friendly React error state. `AnimeSnapshot` records are not automatically the catalog cache.

### D. Untrusted metadata and links
External catalog data or user-controlled values could contain malformed URLs or unsafe text. Validate sources and identifiers, restrict allowed link schemes/domains as appropriate, and render descriptions as text rather than executable HTML.

## 4. Phase 7 completion checks

- [ ] Development and production security profiles reviewed and tested
- [ ] Input validation and request-size limits verified
- [ ] Login, signup, catalog, search, and watchlist throttling verified
- [ ] Safe, consistent API errors and React error states verified
- [ ] Logging implemented without sensitive values
- [ ] Automated authentication, ownership, CSRF, database, and catalog tests passing
- [ ] All ten safe attack drills performed on KANIME-owned test systems
- [ ] Dependencies and repository secrets audited
- [ ] Pre-launch security checklist completed with any deferrals documented

## 5. Next step

**Phase 7, Step 2:** Inspect `backend/kanime_project/settings.py` (with secrets redacted), then plan separate development and production security settings without breaking local session authentication.
