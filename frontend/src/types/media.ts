export type MediaType = "movie" | "series" | "manga" | "book";

export interface MediaItem {
  id: string;
  external_id: string;
  type: MediaType;
  title: string;
  cover_url: string | null;
  backdrop_url?: string | null;
  description: string;
  rating?: number | null;
  release_date?: string | null;
  year?: string | null;
  genres?: string[];
  extra?: Record<string, any>;
}

export interface SearchResponse {
  results: MediaItem[];
  page: number;
  total_pages: number;
}

export interface TrendingResponse {
  movies: MediaItem[];
  series: MediaItem[];
  manga: MediaItem[];
  books: MediaItem[];
}

export type ListKind = "library" | "favorites" | "watchlist";

export type ItemStatus = "quero_consumir" | "consumindo" | "concluido";

export interface SavedItem extends MediaItem {
  saved_at: string;
  status?: ItemStatus;
  in_library: boolean;
  in_favorites: boolean;
  in_watchlist: boolean;
}

export const CATEGORY_LABELS: Record<MediaType, string> = {
  movie: "Filmes",
  series: "Séries",
  manga: "Mangás",
  book: "Livros",
};

export const CATEGORY_LABEL_SINGULAR: Record<MediaType, string> = {
  movie: "Filme",
  series: "Série",
  manga: "Mangá",
  book: "Livro",
};

export const STATUS_LABEL: Record<ItemStatus, string> = {
  quero_consumir: "Quero consumir",
  consumindo: "Consumindo",
  concluido: "Concluído",
};
