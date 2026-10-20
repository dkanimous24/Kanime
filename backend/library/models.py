from django.db import models
from django.conf import settings


# Create your models here.
class AnimeSnapshot(models.Model):
    source = models.CharField(max_length=50)
    outside_id = models.CharField(max_length=50)
    title = models.CharField(max_length=255)
    poster_url = models.URLField(blank=True)
    episode = models.IntegerField(blank=True, null=True)
    last_refreshed = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["source", "outside_id"], name="unique_anime_source_outside_id"
            )
        ]

    def __str__(self):
        return self.title


class WatchlistEntry(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="watchlist_entry",
    )
    anime = models.ForeignKey(
        AnimeSnapshot, on_delete=models.PROTECT, related_name="watchlist_entry"
    )
    date_added = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "anime"], name="unique_user_watchlist_anime"
            )
        ]

    def __str__(self):
        return f"{self.user.username}:{self.anime.title}"
