from django.shortcuts import render, get_object_or_404
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import WatchlistEntry, AnimeSnapshot
from .serializers import watchListEntrySerializer, AnimeInputSerializer
from rest_framework import status
from rest_framework.exceptions import ValidationError
from django.db import transaction


# Create your views here.
class watchlistView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = (
            WatchlistEntry.objects.filter(user=request.user)
            .select_related("anime")
            .order_by("date_added")
        )

        serializer = watchListEntrySerializer(entries, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = AnimeInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        anime_data = serializer.validated_data

        with transaction.atomic():
            anime, anime_created = AnimeSnapshot.objects.get_or_create(
                source=anime_data["source"],
                outside_id=anime_data["outside_id"],
                defaults={
                    "title": anime_data["title"],
                    "poster_url": anime_data.get("poster_url", ""),
                    "episode": anime_data.get("episode"),
                },
            )

            entry, entry_created = WatchlistEntry.objects.get_or_create(
                user=request.user, anime=anime
            )

        response_serializer = watchListEntrySerializer(entry)

        response_status = (
            status.HTTP_201_CREATED if entry_created else status.HTTP_200_OK
        )

        return Response(response_serializer.data, status=response_status)


class watchlistDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, source, outside_id):
        entry = get_object_or_404(
            WatchlistEntry,
            user=request.user,
            anime__source=source,
            anime__outside_id=outside_id,
        )
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
