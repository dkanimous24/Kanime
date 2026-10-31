from unittest.mock import Mock, patch

from django.test import SimpleTestCase

from catalog.clients.jikan import jikan_get, JikanNotFound

import threading
import time

from concurrent.futures import ThreadPoolExecutor


class JikanClientTests(SimpleTestCase):

    def test_successful_request(self):

        fake_response = Mock()

        fake_response.status_code = 200

        fake_response.json.return_value = {"data": [{"mal_id": 20, "title": "Naruto"}]}

        with patch("catalog.clients.jikan.requests.get", return_value=fake_response):

            result = jikan_get("top/anime", {"limit": 1})

        self.assertEqual(result["data"][0]["title"], "Naruto")

    def test_jikan_not_found(self):
        fake_response = Mock()
        fake_response.status_code = 404
        fake_response.ok = False

        with patch("catalog.clients.jikan.requests.get", return_value=fake_response):
            with self.assertRaises(JikanNotFound):
                jikan_get("anime/9999999999999999999999")

    def test_duplicate_requests_share_one_call(self):
        # Both workers should start together

        starting_barrier = threading.Barrier(2)

        # Our pretend Jikan response
        fake_data = {"data": [{"mal_id": 20, "title": "Naruto"}]}

        # Pretend to fetch anime from Jikan
        def fetch_fake(path, params):
            time.sleep(0.5)
            return fake_data

        # Each worker will execute this function
        def request_anime():
            starting_barrier.wait()
            return jikan_get("top/anime", {"limit": 2})

        # Replace the real Jikan fetching function
        with patch(
            "catalog.clients.jikan._fetch_from_jikan", side_effect=fetch_fake
        ) as mock_data:

            # create 2 walkers
            with ThreadPoolExecutor(max_workers=2) as executer:
                worker_1 = executer.submit(request_anime)
                worker_2 = executer.submit(request_anime)

                result1 = worker_1.result()
                result2 = worker_2.result()

            # Both callers must receive the same result
            self.assertEqual(result1, result2)

            # Only ONE upstream request should happen
            self.assertEqual(mock_data.call_count, 1)
