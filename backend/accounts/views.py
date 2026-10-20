from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .serializer import SignupSerializer


# Create your views here.
@api_view(["POST"])
def signup(request):
    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response(
            {"message": "account created succefully"}, status=status.HTTP_201_CREATED
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response(
            {"details": "invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

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
