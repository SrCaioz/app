from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

TMDB_API_KEY = os.environ.get("TMDB_API_KEY", "")
GOOGLE_BOOKS_API_KEY = os.environ.get("GOOGLE_BOOKS_API_KEY", "")
ANILIST_GRAPHQL_URL = os.environ.get("ANILIST_GRAPHQL_URL", "https://graphql.anilist.co")

TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_IMG_BASE = "https://image.tmdb.org/t/p"


# App
app = FastAPI(title="Universal Tracker API")
api_router = APIRouter(prefix="/api")


# ------------------ Helpers ------------------

def tmdb_poster(path: Optional[str], size: str = "w500") -> Optional[str]:
    if not path:
        return None
    return f"{TMDB_IMG_BASE}/{size}{path}"


def normalize_tmdb_movie(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": f"movie_{item.get('id')}",
        "external_id": str(item.get("id")),
        "type": "movie",
        "title": item.get("title") or item.get("original_title") or "",
        "cover_url": tmdb_poster(item.get("poster_path")),
        "backdrop_url": tmdb_poster(item.get("backdrop_path"), size="w780"),
        "description": item.get("overview") or "",
        "rating": item.get("vote_average"),
        "release_date": item.get("release_date"),
        "year": (item.get("release_date") or "")[:4] or None,
        "genres": [],
        "extra": {"popularity": item.get("popularity")},
    }


def normalize_tmdb_series(item: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": f"series_{item.get('id')}",
        "external_id": str(item.get("id")),
        "type": "series",
        "title": item.get("name") or item.get("original_name") or "",
        "cover_url": tmdb_poster(item.get("poster_path")),
        "backdrop_url": tmdb_poster(item.get("backdrop_path"), size="w780"),
        "description": item.get("overview") or "",
        "rating": item.get("vote_average"),
        "release_date": item.get("first_air_date"),
        "year": (item.get("first_air_date") or "")[:4] or None,
        "genres": [],
        "extra": {"popularity": item.get("popularity")},
    }


def normalize_anilist_manga(item: Dict[str, Any]) -> Dict[str, Any]:
    title = item.get("title") or {}
    cover = item.get("coverImage") or {}
    start = item.get("startDate") or {}
    year = start.get("year")
    description = item.get("description") or ""
    # strip simple html tags
    for tag in ("<br>", "<br/>", "<br />", "<i>", "</i>", "<b>", "</b>"):
        description = description.replace(tag, "")
    return {
        "id": f"manga_{item.get('id')}",
        "external_id": str(item.get("id")),
        "type": "manga",
        "title": title.get("romaji") or title.get("english") or title.get("native") or "",
        "cover_url": cover.get("large") or cover.get("medium"),
        "backdrop_url": item.get("bannerImage") or cover.get("large"),
        "description": description,
        "rating": (item.get("averageScore") or 0) / 10 if item.get("averageScore") else None,
        "release_date": f"{year}" if year else None,
        "year": str(year) if year else None,
        "genres": item.get("genres") or [],
        "extra": {
            "status": item.get("status"),
            "chapters": item.get("chapters"),
            "volumes": item.get("volumes"),
        },
    }


def normalize_google_book(item: Dict[str, Any]) -> Dict[str, Any]:
    info = item.get("volumeInfo") or {}
    images = info.get("imageLinks") or {}
    cover = images.get("thumbnail") or images.get("smallThumbnail")
    if cover and cover.startswith("http://"):
        cover = "https://" + cover[len("http://"):]
    published = info.get("publishedDate") or ""
    return {
        "id": f"book_{item.get('id')}",
        "external_id": str(item.get("id")),
        "type": "book",
        "title": info.get("title") or "",
        "cover_url": cover,
        "backdrop_url": cover,
        "description": info.get("description") or "",
        "rating": info.get("averageRating"),
        "release_date": published,
        "year": (published or "")[:4] or None,
        "genres": info.get("categories") or [],
        "extra": {
            "authors": info.get("authors") or [],
            "pageCount": info.get("pageCount"),
            "publisher": info.get("publisher"),
        },
    }


# ------------------ Routes ------------------

@api_router.get("/")
async def root():
    return {"message": "Universal Tracker API"}


@api_router.get("/search/movies")
async def search_movies(q: str = Query(..., min_length=1), page: int = 1):
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{TMDB_BASE}/search/movie",
            params={"api_key": TMDB_API_KEY, "query": q, "page": page, "language": "pt-BR", "include_adult": "false"},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"TMDB error: {r.text}")
    data = r.json()
    return {
        "results": [normalize_tmdb_movie(x) for x in data.get("results", [])],
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 1),
    }


@api_router.get("/search/series")
async def search_series(q: str = Query(..., min_length=1), page: int = 1):
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{TMDB_BASE}/search/tv",
            params={"api_key": TMDB_API_KEY, "query": q, "page": page, "language": "pt-BR", "include_adult": "false"},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"TMDB error: {r.text}")
    data = r.json()
    return {
        "results": [normalize_tmdb_series(x) for x in data.get("results", [])],
        "page": data.get("page", 1),
        "total_pages": data.get("total_pages", 1),
    }


ANILIST_SEARCH_QUERY = """
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { currentPage lastPage hasNextPage }
    media(search: $search, type: MANGA, sort: SEARCH_MATCH) {
      id
      title { romaji english native }
      coverImage { large medium }
      bannerImage
      description(asHtml: false)
      averageScore
      startDate { year }
      status
      chapters
      volumes
      genres
    }
  }
}
"""


@api_router.get("/search/manga")
async def search_manga(q: str = Query(..., min_length=1), page: int = 1):
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            ANILIST_GRAPHQL_URL,
            json={
                "query": ANILIST_SEARCH_QUERY,
                "variables": {"search": q, "page": page, "perPage": 20},
            },
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"AniList error: {r.text}")
    data = r.json()
    page_data = (data.get("data") or {}).get("Page") or {}
    media = page_data.get("media") or []
    info = page_data.get("pageInfo") or {}
    return {
        "results": [normalize_anilist_manga(x) for x in media],
        "page": info.get("currentPage", 1),
        "total_pages": info.get("lastPage", 1),
    }


@api_router.get("/search/books")
async def search_books(q: str = Query(..., min_length=1), page: int = 1):
    start_index = (page - 1) * 20
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            "https://www.googleapis.com/books/v1/volumes",
            params={
                "q": q,
                "startIndex": start_index,
                "maxResults": 20,
                "key": GOOGLE_BOOKS_API_KEY,
                "printType": "books",
            },
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=f"Google Books error: {r.text}")
    data = r.json()
    items = data.get("items") or []
    total = data.get("totalItems") or 0
    return {
        "results": [normalize_google_book(x) for x in items],
        "page": page,
        "total_pages": max(1, (total + 19) // 20) if total else 1,
    }


@api_router.get("/search/all")
async def search_all(q: str = Query(..., min_length=1)):
    """Search across all providers in parallel, returning trimmed results per category."""
    import asyncio

    async def safe(coro):
        try:
            return await coro
        except Exception as e:
            logger.warning("search_all sub-call failed: %s", e)
            return {"results": []}

    movies, series, manga, books = await asyncio.gather(
        safe(search_movies(q=q, page=1)),
        safe(search_series(q=q, page=1)),
        safe(search_manga(q=q, page=1)),
        safe(search_books(q=q, page=1)),
    )
    return {
        "movies": movies.get("results", [])[:10],
        "series": series.get("results", [])[:10],
        "manga": manga.get("results", [])[:10],
        "books": books.get("results", [])[:10],
    }


# Detail endpoints (used by the details screen)
@api_router.get("/detail/movie/{external_id}")
async def detail_movie(external_id: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{TMDB_BASE}/movie/{external_id}",
            params={"api_key": TMDB_API_KEY, "language": "pt-BR"},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=r.text)
    data = r.json()
    base = normalize_tmdb_movie(data)
    base["genres"] = [g.get("name") for g in (data.get("genres") or [])]
    base["extra"]["runtime"] = data.get("runtime")
    base["extra"]["tagline"] = data.get("tagline")
    return base


@api_router.get("/detail/series/{external_id}")
async def detail_series(external_id: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"{TMDB_BASE}/tv/{external_id}",
            params={"api_key": TMDB_API_KEY, "language": "pt-BR"},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=r.text)
    data = r.json()
    base = normalize_tmdb_series(data)
    base["genres"] = [g.get("name") for g in (data.get("genres") or [])]
    base["extra"]["number_of_seasons"] = data.get("number_of_seasons")
    base["extra"]["number_of_episodes"] = data.get("number_of_episodes")
    base["extra"]["tagline"] = data.get("tagline")
    return base


@api_router.get("/detail/manga/{external_id}")
async def detail_manga(external_id: str):
    query = """
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        id
        title { romaji english native }
        coverImage { large medium }
        bannerImage
        description(asHtml: false)
        averageScore
        startDate { year }
        status
        chapters
        volumes
        genres
      }
    }
    """
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.post(
            ANILIST_GRAPHQL_URL,
            json={"query": query, "variables": {"id": int(external_id)}},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=r.text)
    data = r.json()
    media = ((data.get("data") or {}).get("Media")) or {}
    return normalize_anilist_manga(media)


@api_router.get("/detail/book/{external_id}")
async def detail_book(external_id: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(
            f"https://www.googleapis.com/books/v1/volumes/{external_id}",
            params={"key": GOOGLE_BOOKS_API_KEY},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=502, detail=r.text)
    data = r.json()
    return normalize_google_book(data)


# Trending / popular endpoints for the discover screen initial view
@api_router.get("/trending")
async def trending():
    """Return a mixed selection of trending items across all categories for the Explore initial state."""
    import asyncio

    async def tmdb_trending(kind: str):
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                f"{TMDB_BASE}/trending/{kind}/week",
                params={"api_key": TMDB_API_KEY, "language": "pt-BR"},
            )
        if r.status_code != 200:
            return []
        return r.json().get("results", [])

    async def anilist_trending():
        q = """
        query {
          Page(page: 1, perPage: 20) {
            media(type: MANGA, sort: TRENDING_DESC) {
              id
              title { romaji english native }
              coverImage { large medium }
              bannerImage
              description(asHtml: false)
              averageScore
              startDate { year }
              status
              chapters
              volumes
              genres
            }
          }
        }
        """
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.post(ANILIST_GRAPHQL_URL, json={"query": q})
        if r.status_code != 200:
            return []
        return ((r.json().get("data") or {}).get("Page") or {}).get("media") or []

    async def books_trending():
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(
                "https://www.googleapis.com/books/v1/volumes",
                params={
                    "q": "subject:fiction",
                    "orderBy": "newest",
                    "maxResults": 20,
                    "key": GOOGLE_BOOKS_API_KEY,
                    "printType": "books",
                },
            )
        if r.status_code != 200:
            return []
        return r.json().get("items") or []

    movies_raw, series_raw, manga_raw, books_raw = await asyncio.gather(
        tmdb_trending("movie"),
        tmdb_trending("tv"),
        anilist_trending(),
        books_trending(),
    )
    return {
        "movies": [normalize_tmdb_movie(x) for x in movies_raw],
        "series": [normalize_tmdb_series(x) for x in series_raw],
        "manga": [normalize_anilist_manga(x) for x in manga_raw],
        "books": [normalize_google_book(x) for x in books_raw],
    }


# Include the router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)
