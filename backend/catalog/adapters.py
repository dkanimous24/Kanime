def adapt_jikan(anime):
    """Convert one Jikan anime into KANIME's standard format."""

    images = anime.get("images") or {}
    jpg = images.get("jpg") or {}

    titles = anime.get("titles") or []

    english_title = anime.get("title_english")

    if not english_title:
        english_title = next(
            (item.get("title") for item in titles if item.get("type") == "English"),
            None,
        )

    studios = anime.get("studios") or []
    genres = anime.get("genres") or []

    return {
        "source": "jikan",
        "outside_id": str(anime["mal_id"]),
        "title": english_title or anime.get("title") or "Unknown",
        "poster": jpg.get("large_image_url") or jpg.get("image_url"),
        "cover": (
            anime.get("trailer", {}).get("images", {}).get("maximum_image_url")
            if anime.get("trailer") and anime["trailer"].get("images")
            else None
        ),
        "synopsis": anime.get("synopsis"),
        "episodes": anime.get("episodes"),
        "score": anime.get("score"),
        "year": anime.get("year"),
        "age_rating": anime.get("rating"),
        "studio": studios[0].get("name") if studios else None,
        "genres": [genre["name"].lower() for genre in genres if genre.get("name")],
    }


def adapt_kitsu(anime):
    """Convert one Kitsu anime into KANIME's standard format."""

    attributes = anime.get("attributes") or {}

    titles = attributes.get("titles") or {}

    poster = attributes.get("posterImage") or {}
    cover = attributes.get("coverImage") or {}

    rating = attributes.get("averageRating")

    score = None

    if rating is not None:
        try:
            score = float(rating) / 10
        except (TypeError, ValueError):
            pass

    start_date = attributes.get("startDate")

    year = None

    if start_date:
        try:
            year = int(start_date[:4])
        except (TypeError, ValueError):
            pass

    return {
        "source": "kitsu",
        "outside_id": str(anime.get("id", "")),
        "title": (titles.get("en") or attributes.get("canonicalTitle") or "Unknown"),
        "poster": poster.get("large") or poster.get("original"),
        "cover": cover.get("large") or cover.get("original"),
        "synopsis": (attributes.get("synopsis") or attributes.get("description")),
        "episodes": attributes.get("episodeCount"),
        "score": score,
        "year": year,
        "age_rating": attributes.get("ageRating"),
        "studio": None,
        "genres": [],
    }
