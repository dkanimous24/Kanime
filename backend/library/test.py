from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from library.models import AnimeSnapshot, WatchlistEntry


class WatchlistOwnershipTests(TestCase):

    def setUp(self):
        User = get_user_model()

        self.user_a = User.objects.create_user(
            username="user_a",
            password="StrongPassword123!",
        )

        self.user_b = User.objects.create_user(
            username="user_b",
            password="StrongPassword123!",
        )

        self.anime = AnimeSnapshot.objects.create(
            source="jikan",
            outside_id="20",
            title="Naruto",
        )

        WatchlistEntry.objects.create(
            user=self.user_a,
            anime=self.anime,
        )

        self.client = APIClient(HTTP_HOST="localhost")

    def test_user_cannot_delete_another_users_anime(self):
        # Authenticate as User B
        self.client.force_login(self.user_b)

        # Attempt to delete User A's anime
        response = self.client.delete("/api/watchlist/jikan/20/")

        # User B should not be able to delete it
        self.assertIn(response.status_code, [403, 404])

        # User A's watchlist entry must still exist
        self.assertTrue(
            WatchlistEntry.objects.filter(
                user=self.user_a,
                anime=self.anime,
            ).exists()
        )

    def test_user_can_delete_own_anime(self):
        # Authenticate as User A
        self.client.force_login(self.user_a)

        # Delete User A's anime
        response = self.client.delete("/api/watchlist/jikan/20/")

        # Confirm successful deletion
        self.assertEqual(response.status_code, 204)

        # Confirm the entry no longer exists
        self.assertFalse(
            WatchlistEntry.objects.filter(
                user=self.user_a,
                anime=self.anime,
            ).exists()
        )

    def test_unauthenticated_user_cannot_view_watchlist(self):
        # Don't log in
        response = self.client.get("/api/watchlist/")

        # Confirm access is denied
        self.assertIn(response.status_code, [401, 403])

    def test_unauthenticated_user_cannot_add_anime(self):
        response = self.client.post(
            "/api/watchlist/",
            {
                "source": "jikan",
                "outside_id": "21",
                "title": "One Piece",
            },
            format="json",
        )

        # The request must be rejected
        self.assertIn(response.status_code, [401, 403])

        # No watchlist entry should be created
        self.assertFalse(
            WatchlistEntry.objects.filter(
                anime__source="jikan",
                anime__outside_id="21",
            ).exists()
        )
