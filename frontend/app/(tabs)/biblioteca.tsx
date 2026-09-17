import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AdBanner from "@/src/components/AdBanner";
import { CategoryChips } from "@/src/components/CategoryChips";
import { EmptyState } from "@/src/components/EmptyState";
import { MediaCard } from "@/src/components/MediaCard";
import { useSavedItems } from "@/src/hooks/useLibrary";
import { colors, spacing } from "@/src/theme";
import type { MediaItem, MediaType, SavedItem } from "@/src/types/media";
import { progressMeta } from "@/src/utils/progress";

type Filter = "all" | MediaType;
type SortKey = "recent" | "rating" | "title";

const FILTER_OPTIONS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "movie", label: "Filmes" },
  { key: "series", label: "Séries" },
  { key: "manga", label: "Mangás" },
  { key: "book", label: "Livros" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "recent", label: "Recentes" },
  { key: "rating", label: "Avaliação" },
  { key: "title", label: "Título" },
];

export default function BibliotecaScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { items } = useSavedItems();

  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("recent");

  const cardWidth = useMemo(
    () => (width - spacing.lg * 2 - spacing.md) / 2,
    [width],
  );

  const libraryItems = useMemo<SavedItem[]>(() => {
    let list = items.filter((x) => x.in_library);
    if (filter !== "all") list = list.filter((x) => x.type === filter);
    switch (sort) {
      case "rating":
        list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "title":
        list = [...list].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recent":
      default:
        list = [...list].sort((a, b) =>
          (b.saved_at ?? "").localeCompare(a.saved_at ?? ""),
        );
    }
    return list;
  }, [items, filter, sort]);

  const openDetail = (item: MediaItem) => {
    router.push(`/details/${item.type}/${item.external_id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Biblioteca</Text>
        <Text style={styles.subtitle}>
          {libraryItems.length} {libraryItems.length === 1 ? "item" : "itens"}
        </Text>
      </View>

      <CategoryChips<Filter>
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
        testIDPrefix="library-filter"
      />
      <CategoryChips<SortKey>
        options={SORT_OPTIONS}
        value={sort}
        onChange={setSort}
        testIDPrefix="library-sort"
      />

      {libraryItems.length === 0 ? (
        <EmptyState
          testID="library-empty"
          icon="▤"
          title="Sua biblioteca está vazia"
          subtitle="Adicione títulos que você já assistiu ou está consumindo."
          actionLabel="Explorar títulos"
          onAction={() => router.push("/(tabs)/explorar")}
        />
      ) : (
        <FlatList
          data={libraryItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <MediaCard
              item={item}
              width={cardWidth}
              onPress={openDetail}
              savedBadge={{
                library: item.in_library,
                favorite: item.in_favorites,
                watchlist: item.in_watchlist,
              }}
              progress={
                item.progress
                  ? { value: item.progress, total: progressMeta(item)?.total ?? null }
                  : undefined
              }
              userRating={item.user_rating}
            />
          )}
          ListFooterComponent={<AdBanner />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: { color: colors.onSurface, fontSize: 28, fontWeight: "700" },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 2 },
  gridContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  gridRow: { justifyContent: "space-between" },
});
