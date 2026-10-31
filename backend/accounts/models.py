from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower


# Create your models here.
class User(AbstractUser):
    class Meta:
        constraints = [
            models.UniqueConstraint(
                Lower("email"),
                condition=~Q(email=""),
                name="unique_user_email_case_insensitive",
            )
        ]
