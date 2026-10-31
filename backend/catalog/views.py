from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

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
    except JikanError:
        return Response(
            {"error": "jikan is currently unavailable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["GET"])
def top_view(request):
    """
    Return top-rated anime.
    """

    try:
        results = get_top_anime()
        return Response(results, status=status.HTTP_200_OK)
    except JikanError:
        return Response(
            {"error": "jikan is currently unavailable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["GET"])
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

    except JikanError:
        return Response(
            {"error": "Anime service temporarily unavailable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )


@api_view(["GET"])
def anime_details_view(request, source, outside_id):
    """
    Return details for one anime.
    """

    try:
        result = get_anime_details(source, outside_id)

        return Response(result, status=status.HTTP_200_OK)

    except (JikanNotFound, KitsuNotFound):
        return Response({"error": "Anime not found"}, status=status.HTTP_404_NOT_FOUND)

    except ValueError as error:
        return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)

    except (JikanError, KitsuError):
        return Response(
            {"error": "Anime service temporarily unavailable"},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
