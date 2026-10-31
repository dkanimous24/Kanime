import hashlib
import logging

from typing import Callable

from django.conf import settings
from django.core.cache import cache

from catalog.clients.jikan import JikanError, JikanNotFound
from .clients.kitsu import KitsuError

logger = logging.getLogger(__name__)


def make_cache_key(category, identifier=""):
    normalized_identifier = str(identifier).strip().lower()
    raw_key = f"{category}:{normalized_identifier}"
    digest = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    return f"catalog:{category}:{digest}"


def save_to_cache(key, data, category):
    fresh_ttl = settings.CATALOG_TTL[category]
    stale_ttl = settings.CATALOG_TTL["stale"]

    cache.set(f"{key}:fresh", data, timeout=fresh_ttl)
    cache.set(f"{key}:stale", data, timeout=stale_ttl)
    logger.info("CACHE SAVE: %s", key)


def get_or_fetch(key, category, fetch_function, fallback_function=None):
    """
    Return fresh cached data when available.

    If fresh data is missing:
    - Fetch new data.
    - Return stale data during temporary Jikan failures.
    - Raise JikanNotFound when the anime does not exist.
    """

    fresh_key = f"{key}:fresh"
    stale_key = f"{key}:stale"

    # Step 1: Check fresh cache
    fresh_data = cache.get(fresh_key)

    if fresh_data is not None:
        logger.info("CACHE HIT: %s", key)

        return {"data": fresh_data, "stale": False}

    logger.info("CACHE MISS: %s", key)

    # Step 2: Fetch new data
    try:
        new_data = fetch_function()

    # Step 3: Handle missing anime
    except JikanNotFound:
        logger.warning("ANIME NOT FOUND: %s", key)

        raise

    # Step 4: Handle temporary Jikan failures
    except JikanError:
        logger.warning("UPSTREAM FAILURE: %s", key)

        stale_data = cache.get(stale_key)

        if stale_data is not None:
            logger.warning("STALE CACHE HIT: %s", key)

            return {"data": stale_data, "stale": True}

        logger.error("NO STALE CACHE AVAILABLE: %s", key)

        if fallback_function is not None:
            logger.info("USING KITSU TO FIND ANIME %s", key)
            try:
                fallback_data = fallback_function()

            except KitsuError as error:
                logger.error("KITSU FALLBACK FAILED: %s", key)
                raise JikanError("Both anime providers are unavailable") from error
            save_to_cache(key, fallback_data, category)
            return {"data": fallback_data, "stale": False}

        raise

    # Step 5: Save successful results
    save_to_cache(key, new_data, category)

    return {"data": new_data, "stale": False}
