import threading
import logging
import time
import requests

logger = logging.getLogger(__name__)


BASE_URL = "https://kitsu.io/api/edge"


REQUEST_TIMEOUT = 8
MAX_ATTEMPTS = 3
REQUEST_GAP = 0.4

_request_lock = threading.Lock()
_last_request_time = 0.0


class KitsuError(Exception):
    """Raised when a Kitsu request fails."""

    pass


class KitsuNotFound(KitsuError):
    """Raised when Kitsu returns HTTP 404."""

    pass


def wait_for_request_slot():
    """
    Space out outgoing Kitsu requests.
    """

    global _last_request_time

    with _request_lock:
        now = time.monotonic()

        elapsed = now - _last_request_time
        wait_time = max(0, REQUEST_GAP - elapsed)

        if wait_time > 0:
            time.sleep(wait_time)

        _last_request_time = time.monotonic()


def kitsu_get(path, params=None):
    """
    Send a GET request to Kitsu.

    Returns:
        A Python dictionary containing the JSON response.

    Raises:
        KitsuNotFound: When Kitsu returns HTTP 404.
        KitsuError: When the request fails.
    """

    url = f"{BASE_URL}/{path.lstrip('/')}"

    headers = {"Accept": "application/vnd.api+json"}

    for attempt in range(MAX_ATTEMPTS):
        wait_for_request_slot()

        try:
            response = requests.get(
                url,
                params=params,
                headers=headers,
                timeout=REQUEST_TIMEOUT,
            )
            if response.status_code == 404:
                raise KitsuNotFound("Anime not found on Kitsu")

            if response.status_code == 429 or response.status_code >= 500:
                raise requests.exceptions.HTTPError(
                    f"Kitsu returned HTTP {response.status_code}"
                )

            if response.status_code >= 400:
                raise KitsuError(f"Kitsu returned HTTP {response.status_code}")

            data = response.json()

            if not isinstance(data, dict):
                raise KitsuError("invalid kitsu format")

            return data

        except KitsuNotFound:
            raise

        except KitsuError:
            raise

        except (requests.exceptions.RequestException, ValueError) as error:

            logger.warning(
                "Kitsu request attempt %s/%s failed: %s",
                attempt + 1,
                MAX_ATTEMPTS,
                error,
            )

            if attempt == MAX_ATTEMPTS - 1:
                raise KitsuError("Kitsu request failed after retries") from error

            time.sleep(2**attempt)
