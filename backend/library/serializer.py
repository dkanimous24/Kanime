from rest_framework import serializers
from .models import WatchlistEntry


class AnimeInputSerializer(serializers.Serializer):
    source = serializers.CharField(max_length=50)
    outside_id = serializers.CharField(max_length=50)
    title = serializers.CharField(max_length=255)
    poster_url = serializers.URLField(required=False, allow_blank=True)
    episode = serializers.IntegerField(
        required=False, min_value=0, max_value=1000000, allow_null=True
    )

    def validate_poster_url(self, value):
        if value and not value.lower().startswith("https://"):
            raise serializers.ValidationError("poster must be https")

        return value


class watchListEntrySerializer(serializers.ModelSerializer):
    source = serializers.CharField(source="anime.source", read_only=True)
    outside_id = serializers.CharField(source="anime.outside_id", read_only=True)
    poster_url = serializers.URLField(source="anime.poster_url", read_only=True)
    title = serializers.CharField(source="anime.title", read_only=True)
    episode = serializers.IntegerField(source="anime.episode", read_only=True)

    class Meta:
        model = WatchlistEntry
        fields = ["source", "outside_id", "title", "poster_url", "episode"]
        read_only_fields = fields
