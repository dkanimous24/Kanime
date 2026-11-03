from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import IntegrityError, transaction
from .serializer import SignupSerializer, LoginSerializer
from kanime_project.throttle import LoginThrottle, SignupThrottle
from kanime_project.exceptions import InvalidLoginCredentials
import logging

security_logger = logging.getLogger("kanime.security")


# Create your views here.
@api_view(["POST"])
@throttle_classes([SignupThrottle])
def signup(request):
    serializer = SignupSerializer(data=request.data)

    serializer.is_valid(raise_exception=True)

    try:
        with transaction.atomic():
            serializer.save()

    except IntegrityError as error:

        database_error = error.__cause__

        constraint_name = getattr(
            getattr(database_error, "diag", None), "constraint_name", None
        )

        if constraint_name == "unique_user_email_case_insensitive":

            raise ValidationError(
                {"email": ["An account with this email already exists."]}
            )

    return Response(
        {"message": "account created successfully"},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@throttle_classes([LoginThrottle])
def login_view(request):

    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)

    if user is None:
        security_logger.warning("Failed login attempt")
        raise InvalidLoginCredentials()

    login(request, user)

    return Response(
        {
            "message": "logged in succesfully",
            "user": {"id": user.id, "email": user.email, "username": user.username},
        },
        status=status.HTTP_200_OK,
    )


@ensure_csrf_cookie
@api_view(["GET"])
def get_csrf_token(request):
    return Response({"csrf": get_token(request)}, status=status.HTTP_200_OK)


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me_view(request):
    user = request.user
    return Response(
        {
            "message": "here is the acount in formation",
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        },
        status=status.HTTP_200_OK,
    )
