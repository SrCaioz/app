import type {
  MediaItem,
  MediaType,
  RecommendResponse,
  SearchResponse,
  TrendingResponse,
} from "@/src/types/media";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

async function get<T>(path: string): Promise<T> {
  if (!BASE) throw new Error("EXPO_PUBLIC_BACKEND_URL não configurado");
  const res = await fetch(`${BASE}/api${path}`);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

const SEARCH_PATH: Record<MediaType, string> = {
  movie: "/search/movies",
  series: "/search/series",
  manga: "/search/manga",
  book: "/search/books",
};

const DETAIL_PATH: Record<MediaType, string> = {
  movie: "/detail/movie",
  series: "/detail/series",
  manga: "/detail/manga",
  book: "/detail/book",
};

export async function searchMedia(
  type: MediaType,
  query: string,
  page = 1,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ q: query, page: String(page) });
  return get<SearchResponse>(`${SEARCH_PATH[type]}?${params.toString()}`);
}

export async function getDetail(
  type: MediaType,
  externalId: string,
): Promise<MediaItem> {
  return get<MediaItem>(`${DETAIL_PATH[type]}/${externalId}`);
}

export async function getTrending(): Promise<TrendingResponse> {
  return get<TrendingResponse>("/trending");
}

export interface RecommendSeed {
  type: MediaType;
  genres: string[];
  rating?: number | null;
}

export async function getRecommendations(
  seeds: RecommendSeed[],
  excludeIds: string[],
): Promise<RecommendResponse> {
  if (!BASE) throw new Error("EXPO_PUBLIC_BACKEND_URL não configurado");
  const res = await fetch(`${BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ seeds, exclude_ids: excludeIds }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as RecommendResponse;
}
