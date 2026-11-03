from django.test import TestCase

# Create your tests here.
from unittest.mock import patch
from django.core.cache.backends.locmem import LocMemCache
from rest_framework.test import APIClient


class CatalogRateLimitTests(TestCase):

    def setUp(self):
        self.client = APIClient(HTTP_HOST="localhost")

        self.test_cache = LocMemCache(
            "catalog_throttle_test",
            {},
        )

        self.cache_patch = patch(
            "kanime_project.throttle.CatalogSearchThrottle.cache",
            self.test_cache,
        )

        self.cache_patch.start()
        self.addCleanup(self.cache_patch.stop)

    def test_thirty_first_search_returns_429(self):
        with patch(
            "catalog.views.search_anime",
            return_value=[],
        ):
            for attempt in range(1, 32):
                response = self.client.get(
                    "/api/catalog/search/",
                    {"q": "naruto"},
                )

                if attempt <= 30:
                    self.assertEqual(
                        response.status_code,
                        200,
                    )
                else:
                    self.assertEqual(
                        response.status_code,
                        429,
                    )
                    self.assertEqual(
                        response.data["error"]["code"],
                        "throttled",
                    )
