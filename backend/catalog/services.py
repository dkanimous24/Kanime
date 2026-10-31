from catalog.clients.jikan import jikan_get
from .clients.kitsu import kitsu_get
from catalog.cache_service import make_cache_key, get_or_fetch
from catalog.adapters import adapt_jikan, adapt_kitsu


def fetch_trending_from_jikan():
    """
    Fetch trending anime from Jikan
    and convert it into KANIME's format.
    """

    response = jikan_get("top/anime", params={"filter": "airing", "limit": 20})

    anime_list = response.get("data") or []

    adapted_anime = [adapt_jikan(anime) for anime in anime_list]

    return adapted_anime


def get_trending_anime():
    """
    Retrieve trending anime using our caching system.
    """

    key = make_cache_key("trending")

    result = get_or_fetch(
        key=key,
        category="trending",
        fetch_function=fetch_trending_from_jikan,
        fallback_function=fetch_trending_from_kitsu,
    )
    return result


def fetch_top_from_jikan():
    """
    Fetch the highest-rated anime from Jikan
    and convert them into KANIME's format.
    """

    response = jikan_get("top/anime", params={"limit": 20})

    anime_list = response.get("data") or []

    adapted_anime = [adapt_jikan(anime) for anime in anime_list]

    return adapted_anime


def get_top_anime():
    """
    Retrieve top-rated anime using our caching system.
    """
    key = make_cache_key("top")

    result = get_or_fetch(
        key=key,
        category="top",
        fetch_function=fetch_top_from_jikan,
        fallback_function=fetch_top_from_kitsu,
    )
    return result


def fetch_search_from_jikan(query):
    """
    Search Jikan for anime matching the query
    and convert the results into KANIME's format.
    """

    response = jikan_get("anime", params={"q": query, "limit": 20})

    anime_list = response.get("data")

    adapted_anime = [adapt_jikan(anime) for anime in anime_list]

    return adapted_anime


def search_anime(query: str):
    """
    Search for anime using our caching system.
    """

    # Clean the search query

    query = str(query).strip().lower()

    if not query:
        return {"data": [], "stale": False}

    key = make_cache_key("search", query)

    # Check cache or fetch new results
    results = get_or_fetch(
        key=key,
        category="search",
        fetch_function=lambda: fetch_search_from_jikan(query),
        fallback_function=lambda: fetch_search_from_kitsu(query),
    )

    return results


def fetch_anime_details_from_jikan(outside_id):
    """
    Retrieve one anime from Jikan and adapt it.
    """

    response = jikan_get(f"anime/{outside_id}/full")

    anime = response.get("data")

    if anime is None:
        raise ValueError("jikan returned no anime data")

    return adapt_jikan(anime)


def fetch_anime_details_from_kitsu(outside_id):
    """
    Retrieve one anime from kitsu and adapt it.
    """

    response = kitsu_get(f"anime/{outside_id}")

    anime = response.get("data")

    if anime is None:
        raise ValueError("kitsu returned no anime data")

    return adapt_kitsu(anime)


def get_anime_details(source, outside_id):
    """
    Retrieve one anime using our caching system.
    """
    providers = {
        "jikan": fetch_anime_details_from_jikan,
        "kitsu": fetch_anime_details_from_kitsu,
    }

    source = str(source).strip().lower()
    outside_id = str(outside_id).strip().lower()

    if source not in providers:
        raise ValueError("inputed wrong anime source")

    if not outside_id:
        raise ValueError("Anime ID cannot be empty")

    key = make_cache_key("details", f"{source}:{outside_id}")

    fetch_function = providers[source]

    results = get_or_fetch(
        key=key,
        category="details",
        fetch_function=lambda: fetch_function(outside_id),
    )

    return results


def fetch_search_from_kitsu(query):
    """
    Search for anime using Kitsu.

    Returns a list of anime in KANIME's standard format.
    """
    response = kitsu_get("anime", params={"filter[text]": query, "page[limit]": 20})

    anime_list = response.get("data") or []

    adapted_amime = [adapt_kitsu(anime) for anime in anime_list]

    return adapted_amime


def fetch_trending_from_kitsu():
    response = kitsu_get("anime", params={"sort": "popularityRank", "page[limit]": 20})

    anime_list = response.get("data") or []

    return [adapt_kitsu(anime) for anime in anime_list]


def fetch_top_from_kitsu():
    response = kitsu_get("anime", params={"sort": "ratingRank", "page[limit]": 20})

    anime_list = response.get("data") or []

    return [adapt_kitsu(anime) for anime in anime_list]
