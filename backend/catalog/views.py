from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import throttle_classes
from kanime_project.throttle import CatalogSearchThrottle
from rest_framework.exceptions import NotFound, ValidationError
from kanime_project.exceptions import AnimeServiceUnavailable

from catalog.services import (
    get_anime_details,
    get_top_anime,
    search_anime,
    get_trending_anime,
)

from .clients.jikan import JikanError, JikanNotFound
from .clients.kitsu import KitsuNotFound, KitsuError
from .serializer import SearchQuerySerializer

# Create your views here.


@api_view(["GET"])
def trending_view(request):
    """
    Return trending anime.
    """

    try:
        results = get_trending_anime()
        return Response(results, status=status.HTTP_200_OK)
    except (JikanError, KitsuError):
        raise AnimeServiceUnavailable()


@api_view(["GET"])
def top_view(request):
    """
    Return top-rated anime.
    """

    try:
        results = get_top_anime()
        return Response(results, status=status.HTTP_200_OK)
    except (JikanError, KitsuError):
        raise AnimeServiceUnavailable()


@api_view(["GET"])
@throttle_classes([CatalogSearchThrottle])
def search_view(request):
    """
    Search anime by title.


    """
    serializer = SearchQuerySerializer(data=request.query_params)

    serializer.is_valid(raise_exception=True)
    query = serializer.validated_data["q"]
    try:
        result = search_anime(query)

        return Response(result, status=status.HTTP_200_OK)

    except (JikanError, KitsuError):
        raise AnimeServiceUnavailable()


@api_view(["GET"])
def anime_details_view(request, source, outside_id):
    """
    Return details for one anime.
    """

    try:
        result = get_anime_details(source, outside_id)

        return Response(result, status=status.HTTP_200_OK)

    except (JikanNotFound, KitsuNotFound):
        raise NotFound("Anime not found.")

    except ValueError:
        raise ValidationError({"outside_id": ["Invalid anime source or identifier."]})

    except (JikanError, KitsuError):
        raise AnimeServiceUnavailable()
