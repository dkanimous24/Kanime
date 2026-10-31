from django.test import SimpleTestCase
from unittest.mock import Mock
from django.core.cache import cache

from catalog.cache_service import make_cache_key, get_or_fetch
from catalog.clients.jikan import JikanError


class CacheServiceTest(SimpleTestCase):
    def setUp(self):
        """
        Run before every test.

        Clear the cache so tests don't interfere
        with one another.
        """
        cache.clear()

        self.key = make_cache_key("trending")

        self.anime_data = [
            {"title": "Naruto"},
            {"title": "Bleach"},
            {"title": "One Piece"},
        ]

    def test_cache_miss_fetches_and_saves_data(self):
        fake_api = Mock(return_value=self.anime_data)

        result = get_or_fetch(self.key, "trending", fake_api)
        self.assertEqual(result["data"], self.anime_data)
        self.assertFalse(result["stale"])

        fake_api.assert_called_once()

        self.assertEqual(cache.get(f"{self.key}:fresh"), self.anime_data)

        self.assertEqual(
            cache.get(f"{self.key}:stale"),
            self.anime_data,
        )

    def test_cache_hit_does_not_fetch_again(self):
        fake_api = Mock(return_value=self.anime_data)

        # first request: fetch and save

        get_or_fetch(
            self.key,
            "trending",
            fake_api,
        )

        # Second request: use the cache
        result = get_or_fetch(
            self.key,
            "trending",
            fake_api,
        )

        self.assertEqual(result["data"], self.anime_data)
        self.assertFalse(result["stale"])

        # The fake API should only have been called once
        self.assertEqual(fake_api.call_count, 1)

    def test_stale_cache_used_when_jikan_fails(self):

        # First, save some anime data
        working_api = Mock(return_value=self.anime_data)

        get_or_fetch(
            self.key,
            "trending",
            working_api,
        )

        # Simulate the fresh copy expiring
        cache.delete(f"{self.key}:fresh")

        # Confirm fresh data is gone
        self.assertIsNone(cache.get(f"{self.key}:fresh"))

        self.assertEqual(cache.get(f"{self.key}:stale"), self.anime_data)

        # Simulate Jikan failing

        failing_api = Mock(side_effect=JikanError("jikan is unavailable"))

        result = get_or_fetch(
            self.key,
            "trending",
            failing_api,
        )

        self.assertEqual(result["data"], self.anime_data)
        self.assertTrue(result["stale"])

        failing_api.assert_called_once()

        # TEST 4: Complete failure

    def test_error_when_no_cache_and_jikan_fails(self):
        failing_api = Mock(side_effect=JikanError("jikan is unavailable"))

        # no cache data exists
        with self.assertRaises(JikanError):
            get_or_fetch(
                self.key,
                "trending",
                failing_api,
            )

        failing_api.assert_called_once()
