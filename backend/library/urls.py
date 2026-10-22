from django.urls import path
from .views import watchlistView, watchlistDetailView

urlpatterns = [
    path("watchlist/", watchlistView.as_view(), name="watchlist"),
    path(
        "watchlist/<str:source>/<str:outside_id>/",
        watchlistDetailView.as_view(),
        name="watchlist_detail",
    ),
]
