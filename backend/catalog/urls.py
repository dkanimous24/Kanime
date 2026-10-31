from django.urls import path
from .views import trending_view, top_view, search_view, anime_details_view

urlpatterns = [
    path("trending/", trending_view, name="catalog-trending"),
    path("top/", top_view, name="catalog-top"),
    path("search/", search_view, name="catalog-search"),
    path(
        "anime/<str:source>/<str:outside_id>/",
        anime_details_view,
        name="catalog-anime-details",
    ),
]
