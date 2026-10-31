from django.test import SimpleTestCase
from .adapters import adapt_jikan, adapt_kitsu


class TestAnimeAdapter(SimpleTestCase):

    # TEST 1: Jikan should return the correct information
    def test_jikan_adapter(self):

        fake_jikan_anime = {
            "mal_id": 20,
            "title": "Naruto",
            "title_english": "Naruto",
            "episodes": 220,
            "score": 7.9,
            "genres": [{"name": "Action"}, {"name": "Adventure"}],
            "studios": [{"name": "Pierrot"}],
        }

        result = adapt_jikan(fake_jikan_anime)

        self.assertEqual(result["source"], "jikan")
        self.assertEqual(result["outside_id"], "20")
        self.assertEqual(result["title"], "Naruto")
        self.assertEqual(result["episodes"], 220)
        self.assertEqual(result["score"], 7.9)
        self.assertEqual(result["studio"], "Pierrot")
        self.assertEqual(result["genres"], ["action", "adventure"])

        # TEST 2: Kitsu should return the correct information

    def test_kitsu_adapter(self):

        fake_kitsu_anime = {
            "id": "1",
            "attributes": {
                "canonicalTitle": "Naruto",
                "episodeCount": 220,
                "averageRating": "79.0",
                "startDate": "2002-10-03",
            },
        }

        result = adapt_kitsu(fake_kitsu_anime)

        self.assertEqual(result["source"], "kitsu")
        self.assertEqual(result["outside_id"], "1")
        self.assertEqual(result["title"], "Naruto")
        self.assertEqual(result["episodes"], 220)
        self.assertEqual(result["score"], 7.9)
        self.assertEqual(result["year"], 2002)

        # TEST 3: Missing optional information should not crash Jikan

    def test_jikan_missing_optional_fields(self):

        fake_jikan_anime = {"mal_id": 20, "title": "Naruto"}

        result = adapt_jikan(fake_jikan_anime)

        self.assertEqual(result["title"], "Naruto")
        self.assertIsNone(result["poster"])
        self.assertIsNone(result["score"])
        self.assertIsNone(result["studio"])
        self.assertEqual(result["genres"], [])

    # TEST 4: Missing optional information should not crash Kitsu
    def test_kitsu_missing_optional_fields(self):

        fake_kitsu_anime = {"id": "1", "attributes": {"canonicalTitle": "Naruto"}}

        result = adapt_kitsu(fake_kitsu_anime)

        self.assertEqual(result["title"], "Naruto")
        self.assertIsNone(result["poster"])
        self.assertIsNone(result["score"])
        self.assertIsNone(result["year"])
        self.assertEqual(result["genres"], [])

    # TEST 5: Both adapters must return the same field names
    def test_adapters_have_same_structure(self):

        fake_jikan_anime = {"mal_id": 20, "title": "Naruto"}

        fake_kitsu_anime = {"id": "1", "attributes": {"canonicalTitle": "Naruto"}}

        jikan_result = adapt_jikan(fake_jikan_anime)
        kitsu_result = adapt_kitsu(fake_kitsu_anime)

        expected_fields = {
            "source",
            "outside_id",
            "title",
            "poster",
            "cover",
            "synopsis",
            "episodes",
            "score",
            "year",
            "age_rating",
            "studio",
            "genres",
        }

        self.assertEqual(set(jikan_result.keys()), expected_fields)
        self.assertEqual(set(kitsu_result.keys()), expected_fields)

    # TEST 6: Invalid Kitsu ratings should not crash the adapter
    def test_kitsu_invalid_rating(self):

        fake_kitsu_anime = {
            "id": "1",
            "attributes": {"canonicalTitle": "Naruto", "averageRating": "not-a-number"},
        }

        result = adapt_kitsu(fake_kitsu_anime)

        self.assertIsNone(result["score"])
