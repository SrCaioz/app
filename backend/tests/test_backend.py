"""Backend regression + new-feature tests for Universal Tracker.

Covers:
- Root/health
- Trending (regression)
- Series detail regression (must include extra.number_of_episodes)
- POST /api/recommend new endpoint with seeds and exclude_ids
- POST /api/recommend with empty seeds (should not error)
"""
import os
import pytest
import requests

BASE_URL = os.environ.get(
    "EXPO_PUBLIC_BACKEND_URL",
    "https://omni-media-4.preview.emergentagent.com",
).rstrip("/")


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- Health / root ----------

def test_root(api):
    r = api.get(f"{BASE_URL}/api/", timeout=20)
    assert r.status_code == 200, r.text
    assert r.json().get("message") == "Universal Tracker API"


# ---------- Trending regression ----------

def test_trending_returns_all_categories(api):
    r = api.get(f"{BASE_URL}/api/trending", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    for key in ("movies", "series", "manga", "books"):
        assert key in data, f"missing {key} in trending response"
    # Movies + series should not be empty (TMDB)
    assert len(data["movies"]) > 0, "no trending movies"
    assert len(data["series"]) > 0, "no trending series"
    # sanity: first movie has expected shape
    first = data["movies"][0]
    assert first["type"] == "movie"
    assert first["id"].startswith("movie_")
    assert "title" in first


# ---------- Series detail regression ----------

def test_detail_series_1399_has_number_of_episodes(api):
    r = api.get(f"{BASE_URL}/api/detail/series/1399", timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["type"] == "series"
    assert data["id"] == "series_1399"
    assert data["title"], "series title empty"
    extra = data.get("extra") or {}
    assert "number_of_episodes" in extra, "extra.number_of_episodes missing"
    assert isinstance(extra["number_of_episodes"], int)
    assert extra["number_of_episodes"] > 0
    assert "number_of_seasons" in extra


# ---------- Recommend endpoint ----------

def test_recommend_with_seeds(api):
    body = {
        "seeds": [
            {"type": "movie", "genres": ["Ação", "Ficção científica"], "rating": 8.4},
            {"type": "manga", "genres": ["Action", "Fantasy"], "rating": 8.7},
        ],
        "exclude_ids": ["movie_27205"],
    }
    r = api.post(f"{BASE_URL}/api/recommend", json=body, timeout=45)
    assert r.status_code == 200, r.text
    data = r.json()

    # response structure
    for key in ("movies", "series", "manga", "books", "based_on"):
        assert key in data, f"missing {key}"
    assert "genres" in data["based_on"]
    assert isinstance(data["based_on"]["genres"], list)
    assert len(data["based_on"]["genres"]) > 0, "based_on.genres should not be empty"

    # movies/series should be non-empty (TMDB)
    assert len(data["movies"]) > 0, "movies recommendations empty"
    assert len(data["series"]) > 0, "series recommendations empty"
    # manga usually non-empty (AniList)
    assert len(data["manga"]) > 0, "manga recommendations empty"

    # exclude_id not present
    all_ids = [x["id"] for x in data["movies"] + data["series"] + data["manga"] + data["books"]]
    assert "movie_27205" not in all_ids, "excluded id should not appear"

    # ordering: rating desc within movies
    ratings = [x.get("rating") or 0 for x in data["movies"]]
    assert ratings == sorted(ratings, reverse=True), "movies not sorted by rating desc"
    ratings_s = [x.get("rating") or 0 for x in data["series"]]
    assert ratings_s == sorted(ratings_s, reverse=True), "series not sorted by rating desc"


def test_recommend_with_empty_seeds(api):
    body = {"seeds": [], "exclude_ids": []}
    r = api.post(f"{BASE_URL}/api/recommend", json=body, timeout=20)
    assert r.status_code == 200, r.text
    data = r.json()
    for key in ("movies", "series", "manga", "books"):
        assert data[key] == [], f"{key} should be empty with no seeds, got {data[key]}"
    assert data["based_on"]["count"] == 0
    assert data["based_on"]["genres"] == []
