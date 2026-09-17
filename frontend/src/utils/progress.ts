import type { MediaItem } from "@/src/types/media";

export interface ProgressMeta {
  /** Rótulo da unidade (singular/plural) */
  unit: string;
  unitPlural: string;
  total: number | null;
}

/** Filmes não têm contador; séries = episódios, mangás = capítulos, livros = páginas. */
export function progressMeta(item: MediaItem): ProgressMeta | null {
  switch (item.type) {
    case "series":
      return {
        unit: "episódio",
        unitPlural: "episódios",
        total: numberOrNull(item.extra?.number_of_episodes),
      };
    case "manga":
      return {
        unit: "capítulo",
        unitPlural: "capítulos",
        total: numberOrNull(item.extra?.chapters),
      };
    case "book":
      return {
        unit: "página",
        unitPlural: "páginas",
        total: numberOrNull(item.extra?.pageCount),
      };
    default:
      return null;
  }
}

function numberOrNull(v: unknown): number | null {
  return typeof v === "number" && v > 0 ? v : null;
}

export function progressPercent(progress: number, total: number | null): number {
  if (!total || total <= 0) return 0;
  return Math.min(1, Math.max(0, progress / total));
}
