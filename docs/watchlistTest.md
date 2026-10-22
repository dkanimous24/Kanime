# KANIME — Watchlist Test Record

## Functional tests

| Test                                    | Result |
| --------------------------------------- | ------ |
| Retrieve saved bookmarks from Django    | Passed |
| Add a bookmark from React               | Passed |
| Remove a bookmark                       | Passed |
| Update the AnimeCard bookmark indicator | Passed |
| Update the Hero bookmark indicator      | Passed |

## Failure-handling tests

| Test                                                      | Result |
| --------------------------------------------------------- | ------ |
| Stop Django and attempt to bookmark                       | Passed |
| Prevent the bookmark indicator from showing false success | Passed |
| Display a useful connection error                         | Passed |
| Log out in one tab and bookmark in another                | Passed |
| Reject a bookmark request after session invalidation      | Passed |
| Recognize an expired session and redirect to login        | Passed |

## Tests still needed

- Confirm that User A cannot read User B's watchlist.
- Confirm that User A cannot delete User B's bookmark.
- Verify duplicate POST behavior.
- Verify invalid input responses.
- Verify missing bookmark DELETE behavior.

## Notes

- Django session cookies provide authentication.
- CSRF protection is required for state-changing requests.
- React receives the watchlist through the API.
- Django and the database own the persistent bookmark data.
