from rest_framework import serializers


class SearchQuerySerializer(serializers.Serializer):
    q = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=100,
        trim_whitespace=True,
    )
