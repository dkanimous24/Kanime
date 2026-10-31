import logging
import threading
import time

from concurrent.futures import Future

import requests

# Jikan API address
BASE_URL = "https://api.jikan.moe/v4"

# Minimum spacing between requests
REQUEST_GAP = 0.4

# Maximum timeout for each HTTP request
REQUEST_TIMEOUT = 4

# Maximum number of attempts
MAX_ATTEMPTS = 1

# HTTP errors that may be temporary
RETRYABLE_STATUS_CODES = {429, 500, 502, 503, 504}

# Optional proxy for outbound requests (use if your network/ISP blocks Jikan directly).
# Example for Cloudflare WARP running locally with its SOCKS5 proxy on port 40000:
# PROXIES = {
#     "http": "socks5h://127.0.0.1:40000",
#     "https": "socks5h://127.0.0.1:40000",
# }
# Leave as None to make requests normally (no proxy).
PROXIES = None

logger = logging.getLogger(__name__)


class JikanError(Exception):
    """Raised when a Jikan request cannot be completed."""


class JikanNotFound(JikanError):
    """Raised when Jikan returns HTTP 404."""


# Protects request scheduling
_rate_lock = threading.Lock()
_next_request_time = 0.0

# Protects ongoing requests
_inflight_lock = threading.Lock()
_inflight = {}


def _wait_for_request_slot():
    """Reserve a properly spaced request start time."""

    global _next_request_time

    with _rate_lock:
        now = time.monotonic()

        start_time = max(now, _next_request_time)

        _next_request_time = start_time + REQUEST_GAP

    delay = start_time - now

    if delay > 0:
        time.sleep(delay)


def _fetch_from_jikan(path, params):
    """Perform an HTTP request with retries and a timeout."""

    url = f"{BASE_URL}/{path.lstrip('/')}"

    for attempt in range(MAX_ATTEMPTS):

        _wait_for_request_slot()

        try:
            response = requests.get(
                url, params=params, timeout=REQUEST_TIMEOUT, proxies=PROXIES
            )

        except (requests.Timeout, requests.ConnectionError) as error:

            logger.error("Jikan network failure: %s", error)

            if attempt == MAX_ATTEMPTS - 1:
                raise JikanError("Jikan is unavailable") from error

            time.sleep(2**attempt)
            continue

        # Handle HTTP 404
        if response.status_code == 404:
            raise JikanNotFound("Anime not found")

        # Handle temporary server errors
        if response.status_code in RETRYABLE_STATUS_CODES:

            logger.warning("Jikan returned HTTP %s", response.status_code)

            if attempt == MAX_ATTEMPTS - 1:
                raise JikanError("Jikan is temporarily unavailable")

            time.sleep(2**attempt)
            continue

        # Handle other HTTP errors
        if not response.ok:
            raise JikanError(f"Jikan returned HTTP {response.status_code}")

        # Convert successful response to Python data
        try:
            return response.json()

        except ValueError as error:
            raise JikanError("Jikan returned invalid JSON") from error

    raise JikanError("Jikan request failed")


def jikan_get(path, params=None):
    """Share identical requests that are already in progress."""

    params = params or {}

    # Unique identifier for this request
    key = (path, tuple(sorted(params.items())))

    # Check whether someone is already making this request
    with _inflight_lock:

        if key in _inflight:
            future = _inflight[key]
            owner = False

        else:
            future = Future()
            _inflight[key] = future
            owner = True

    # IMPORTANT: The lock has now been released!

    # Another caller is already fetching this information
    if not owner:
        return future.result()

    # This caller is responsible for fetching the data
    try:
        result = _fetch_from_jikan(path, params)

    except Exception as error:
        future.set_exception(error)
        raise

    else:
        future.set_result(result)
        return result

    finally:
        # Remove the completed request from our dictionary
        with _inflight_lock:
            _inflight.pop(key, None)
