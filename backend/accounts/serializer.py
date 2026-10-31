from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, trim_whitespace=False, max_length=128
    )

    email = serializers.EmailField(required=True, allow_blank=False, max_length=254)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password"]
        read_only_fields = ["id"]

    def validate_email(self, value):
        value = value.strip().lower()

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("an account already exist with this name")
        return value

    def validate(self, attrs):
        user = User(username=attrs["username"], email=attrs["email"])

        validate_password(attrs["password"], user=user)

        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(
        required=True, allow_blank=False, max_length=150, trim_whitespace=False
    )

    password = serializers.CharField(
        required=True,
        allow_blank=False,
        max_length=128,
        trim_whitespace=False,
        write_only=True,
    )
