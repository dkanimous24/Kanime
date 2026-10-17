from django.urls import path
from . import views

urlpatterns = [
    path("signup/", views.signup, name="signup"),
    path("login/", views.login_view, name="login"),
    path("csrf/", views.get_csrf_token, name="csrf_token"),
    path("logout/", views.logout_view, name="logout"),
    path("me/", views.me_view, name="me"),
]
