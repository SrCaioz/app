import { useCallback, useEffect, useState } from "react";
import { DeviceEventEmitter } from "react-native";

import type {
  ItemStatus,
  ListKind,
  MediaItem,
  SavedItem,
} from "@/src/types/media";
import { storage } from "@/src/utils/storage";

const STORAGE_KEY = "ut_saved_items_v1";
const CHANGE_EVENT = "ut:saved-items:changed";

async function readAll(): Promise<SavedItem[]> {
  const raw = await storage.getItem<string>(STORAGE_KEY, "[]");
  try {
    const parsed = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed as SavedItem[];
  } catch {
    return [];
  }
}

async function writeAll(items: SavedItem[]): Promise<void> {
  await storage.setItem(STORAGE_KEY, JSON.stringify(items));
  DeviceEventEmitter.emit(CHANGE_EVENT);
}

function ensureSaved(item: MediaItem, existing?: SavedItem): SavedItem {
  return {
    ...item,
    ...(existing ?? {}),
    // always keep freshest content from source when saving
    title: item.title || existing?.title || "",
    cover_url: item.cover_url ?? existing?.cover_url ?? null,
    backdrop_url: item.backdrop_url ?? existing?.backdrop_url ?? null,
    description: item.description || existing?.description || "",
    rating: item.rating ?? existing?.rating ?? null,
    year: item.year ?? existing?.year ?? null,
    genres: item.genres ?? existing?.genres ?? [],
    saved_at: existing?.saved_at ?? new Date().toISOString(),
    in_library: existing?.in_library ?? false,
    in_favorites: existing?.in_favorites ?? false,
    in_watchlist: existing?.in_watchlist ?? false,
    status: existing?.status,
    progress: existing?.progress ?? 0,
    user_rating: existing?.user_rating ?? null,
    review: existing?.review ?? "",
  };
}

function anyList(item: SavedItem): boolean {
  return item.in_library || item.in_favorites || item.in_watchlist;
}

/**
 * Atualiza campos pessoais (progresso, nota, resenha). Se o item ainda não
 * estiver em nenhuma lista, ele entra automaticamente na Biblioteca.
 */
export async function updateSaved(
  item: MediaItem,
  patch: Partial<Pick<SavedItem, "progress" | "user_rating" | "review" | "status">>,
): Promise<SavedItem[]> {
  const all = await readAll();
  const idx = all.findIndex((x) => x.id === item.id);
  const existing = idx >= 0 ? all[idx] : undefined;
  const merged: SavedItem = { ...ensureSaved(item, existing), ...patch };
  if (!anyList(merged)) merged.in_library = true;
  let updated: SavedItem[];
  if (idx >= 0) {
    updated = [...all];
    updated[idx] = merged;
  } else {
    updated = [merged, ...all];
  }
  await writeAll(updated);
  return updated;
}

export async function toggleList(
  item: MediaItem,
  list: ListKind,
): Promise<SavedItem[]> {
  const all = await readAll();
  const idx = all.findIndex((x) => x.id === item.id);
  const existing = idx >= 0 ? all[idx] : undefined;
  const merged = ensureSaved(item, existing);
  const flag =
    list === "library"
      ? "in_library"
      : list === "favorites"
      ? "in_favorites"
      : "in_watchlist";
  const next: SavedItem = { ...merged, [flag]: !merged[flag] } as SavedItem;

  let updated: SavedItem[];
  if (idx >= 0) {
    if (anyList(next)) {
      updated = [...all];
      updated[idx] = next;
    } else {
      updated = all.filter((_, i) => i !== idx);
    }
  } else if (anyList(next)) {
    updated = [next, ...all];
  } else {
    updated = all;
  }
  await writeAll(updated);
  return updated;
}

export async function setStatus(
  item: MediaItem,
  status: ItemStatus | undefined,
): Promise<SavedItem[]> {
  const all = await readAll();
  const idx = all.findIndex((x) => x.id === item.id);
  const existing = idx >= 0 ? all[idx] : undefined;
  const merged: SavedItem = { ...ensureSaved(item, existing), status };
  // Setting a status auto-adds to library
  merged.in_library = true;
  let updated: SavedItem[];
  if (idx >= 0) {
    updated = [...all];
    updated[idx] = merged;
  } else {
    updated = [merged, ...all];
  }
  await writeAll(updated);
  return updated;
}

export async function removeItem(itemId: string): Promise<SavedItem[]> {
  const all = await readAll();
  const updated = all.filter((x) => x.id !== itemId);
  await writeAll(updated);
  return updated;
}

export function useSavedItems() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const all = await readAll();
    setItems(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const sub = DeviceEventEmitter.addListener(CHANGE_EVENT, () => {
      refresh();
    });
    return () => sub.remove();
  }, [refresh]);

  return { items, loading, refresh };
}

export function findSaved(
  items: SavedItem[],
  id: string,
): SavedItem | undefined {
  return items.find((x) => x.id === id);
}
