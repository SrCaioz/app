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

import { CategoryChips } from "@/src/components/CategoryChips";
import { EmptyState } from "@/src/components/EmptyState";
import { MediaCard } from "@/src/components/MediaCard";
import { useSavedItems } from "@/src/hooks/useLibrary";
import { colors, spacing } from "@/src/theme";
import type { MediaItem, MediaType } from "@/src/types/media";

type Filter = "all" | MediaType;

const FILTER_OPTIONS: { key: Filter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "movie", label: "Filmes" },
  { key: "series", label: "Séries" },
  { key: "manga", label: "Mangás" },
  { key: "book", label: "Livros" },
];

export default function FavoritosScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { items } = useSavedItems();
  const [filter, setFilter] = useState<Filter>("all");

  const cardWidth = useMemo(
    () => (width - spacing.lg * 2 - spacing.md) / 2,
    [width],
  );

  const filtered = useMemo(() => {
    let list = items.filter((x) => x.in_favorites);
    if (filter !== "all") list = list.filter((x) => x.type === filter);
    return list.sort((a, b) =>
      (b.saved_at ?? "").localeCompare(a.saved_at ?? ""),
    );
  }, [items, filter]);

  const openDetail = (item: MediaItem) => {
    router.push(`/details/${item.type}/${item.external_id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        <Text style={styles.subtitle}>
          {filtered.length} {filtered.length === 1 ? "item" : "itens"}
        </Text>
      </View>

      <CategoryChips<Filter>
        options={FILTER_OPTIONS}
        value={filter}
        onChange={setFilter}
        testIDPrefix="favorites-filter"
      />

      {filtered.length === 0 ? (
        <EmptyState
          testID="favorites-empty"
          icon="★"
          title="Nenhum favorito ainda"
          subtitle="Marque como favorito os títulos que você mais amou."
          actionLabel="Explorar títulos"
          onAction={() => router.push("/(tabs)/explorar")}
        />
      ) : (
        <FlatList
          data={filtered}
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
            />
          )}
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
