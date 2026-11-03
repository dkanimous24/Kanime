from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from unittest.mock import patch
from django.core.cache import caches, cache
from django.core.cache.backends.locmem import LocMemCache


class loginTestCase(TestCase):
    def setUp(self):
        self.client = APIClient(HTTP_HOST="localhost")

        self.throttle_patch = patch(
            "kanime_project.throttle.LoginThrottle.allow_request",
            return_value=True,
        )

        self.throttle_patch.start()
        self.addCleanup(self.throttle_patch.stop)

    def test_invalid_login_returns_401(self):
        """
        Test that an invalid login attempt returns a 401 Unauthorized response.
        """
        response = self.client.post(
            "/accounts/login/",
            {
                "username": "nonexistent_test_user",
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 401)

        self.assertEqual(response.data["error"]["code"], "invalid_credentials")


class SignupSecurityTests(TestCase):

    def setUp(self):
        self.client = APIClient(HTTP_HOST="localhost")

        self.throttle_patch = patch(
            "kanime_project.throttle.SignupThrottle.allow_request",
            return_value=True,
        )

        self.throttle_patch.start()
        self.addCleanup(self.throttle_patch.stop)

    def test_missing_username_returns_400(self):
        """
        Test that a signup attempt with a missing username returns a 400 Bad Request response.
        """
        response = self.client.post(
            "/accounts/signup/",
            {
                "username": "",
                "email": "test@example.com",
                "password": "ValidPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_missing_email_returns_400(self):
        """
        Test that a signup attempt with a missing email returns a 400 Bad Request response.
        """

        response = self.client.post(
            "/accounts/signup/",
            {
                "username": "",
                "email": "test@example.com",
                "password": "ValidPassword123!",
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_missing_password_returns_400(self):
        response = self.client.post(
            "/accounts/signup/",
            {
                "username": "testuser",
                "email": "test@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_duplicate_email_case_insensitive(self):
        # Create the first account
        from django.contrib.auth import get_user_model

        User = get_user_model()

        User.objects.create_user(
            username="firstuser",
            email="test@example.com",
            password="StrongPassword123!",
        )

        # Attempt signup with the same email in uppercase
        response = self.client.post(
            "/accounts/signup/",
            {
                "username": "seconduser",
                "email": "TEST@EXAMPLE.COM",
                "password": "StrongPassword123!",
            },
            format="json",
        )

        # Confirm the request was rejected
        self.assertEqual(response.status_code, 400)

        # Confirm the standardized error response
        self.assertIn("error", response.data)
        self.assertIn("email", response.data["error"]["fields"])

        # Confirm no second account was created
        self.assertEqual(User.objects.count(), 1)


class CSRFSecurityTests(TestCase):

    def setUp(self):
        User = get_user_model()

        self.user = User.objects.create_user(
            username="csrf_test_user",
            email="csrf@example.com",
            password="StrongPassword123!",
        )

        self.client = APIClient(
            enforce_csrf_checks=True,
            HTTP_HOST="localhost",
        )

        self.client.force_login(self.user)

    def test_logout_without_csrf_returns_403(self):
        response = self.client.post("/accounts/logout/")

        self.assertEqual(response.status_code, 403)

    def test_logout_with_valid_csrf_returns_204(self):
        # Request a CSRF token
        csrf_response = self.client.get("/accounts/csrf/")

        self.assertEqual(csrf_response.status_code, 200)

        # Retrieve the token returned by Django
        csrf_token = csrf_response.data["csrf"]

        # Send the token with the logout request
        response = self.client.post(
            "/accounts/logout/",
            HTTP_X_CSRFTOKEN=csrf_token,
        )

        # Confirm logout succeeded
        self.assertEqual(response.status_code, 204)


class LoginRateLimitTests(TestCase):

    def setUp(self):
        self.client = APIClient(HTTP_HOST="localhost")

        # Give this test a fresh, isolated throttle cache
        self.test_cache = LocMemCache(
            "login_throttle_test",
            {},
        )

        self.cache_patch = patch(
            "kanime_project.throttle.LoginThrottle.cache",
            self.test_cache,
        )

        self.cache_patch.start()
        self.addCleanup(self.cache_patch.stop)

    def test_sixth_login_request_returns_429(self):
        for attempt in range(1, 7):
            response = self.client.post(
                "/accounts/login/",
                {
                    "username": "nonexistent_throttle_user",
                    "password": "WrongPassword123!",
                },
                format="json",
            )

            if attempt <= 5:
                self.assertEqual(response.status_code, 401)
            else:
                self.assertEqual(response.status_code, 429)
                self.assertEqual(
                    response.data["error"]["code"],
                    "throttled",
                )


class SignupRateLimitTests(TestCase):

    def setUp(self):
        self.client = APIClient(HTTP_HOST="localhost")

        # Create a separate cache just for this test
        self.test_cache = LocMemCache(
            "signup_throttle_test",
            {},
        )

        self.cache_patch = patch(
            "kanime_project.throttle.SignupThrottle.cache",
            self.test_cache,
        )

        self.cache_patch.start()
        self.addCleanup(self.cache_patch.stop)

    def test_fourth_signup_request_returns_429(self):
        for attempt in range(1, 5):
            response = self.client.post(
                "/accounts/signup/",
                {
                    "username": "",
                    "email": "",
                    "password": "",
                },
                format="json",
            )

            if attempt <= 3:
                self.assertEqual(response.status_code, 400)

            else:
                self.assertEqual(response.status_code, 429)

                self.assertEqual(
                    response.data["error"]["code"],
                    "throttled",
                )
