import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getTrending, searchMedia } from "@/src/api/client";
import { CategoryChips } from "@/src/components/CategoryChips";
import { EmptyState } from "@/src/components/EmptyState";
import { MediaCard } from "@/src/components/MediaCard";
import { useSavedItems } from "@/src/hooks/useLibrary";
import { colors, radius, spacing } from "@/src/theme";
import type { MediaItem, MediaType, TrendingResponse } from "@/src/types/media";

const CATEGORY_OPTIONS: { key: MediaType; label: string }[] = [
  { key: "movie", label: "Filmes" },
  { key: "series", label: "Séries" },
  { key: "manga", label: "Mangás" },
  { key: "book", label: "Livros" },
];

export default function ExplorarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { items: savedItems } = useSavedItems();

  const [category, setCategory] = useState<MediaType>("movie");
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");

  const cardWidth = useMemo(() => (width - spacing.lg * 2 - spacing.md) / 2, [width]);

  const trendingQuery = useQuery<TrendingResponse>({
    queryKey: ["trending"],
    queryFn: getTrending,
    staleTime: 5 * 60 * 1000,
  });

  const searchQuery = useQuery({
    queryKey: ["search", category, query],
    queryFn: () => searchMedia(category, query),
    enabled: query.trim().length > 0,
  });

  const submit = () => {
    Keyboard.dismiss();
    setQuery(inputValue.trim());
  };

  const clear = () => {
    setInputValue("");
    setQuery("");
  };

  const displayedItems: MediaItem[] = useMemo(() => {
    if (query.trim().length > 0) {
      return searchQuery.data?.results ?? [];
    }
    if (!trendingQuery.data) return [];
    switch (category) {
      case "movie":
        return trendingQuery.data.movies;
      case "series":
        return trendingQuery.data.series;
      case "manga":
        return trendingQuery.data.manga;
      case "book":
        return trendingQuery.data.books;
    }
  }, [query, category, searchQuery.data, trendingQuery.data]);

  const isLoading =
    (query.trim().length > 0 && searchQuery.isFetching) ||
    (query.trim().length === 0 && trendingQuery.isFetching && !trendingQuery.data);

  const error = query.trim().length > 0 ? searchQuery.error : trendingQuery.error;

  const openDetail = (item: MediaItem) => {
    router.push(`/details/${item.type}/${item.external_id}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar</Text>
        <Text style={styles.subtitle}>
          Descubra filmes, séries, mangás e livros
        </Text>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            testID="search-input"
            style={styles.searchInput}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Buscar por título..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            onSubmitEditing={submit}
            autoCorrect={false}
          />
          {inputValue.length > 0 && (
            <TouchableOpacity
              onPress={clear}
              hitSlop={10}
              testID="search-clear"
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <CategoryChips<MediaType>
        options={CATEGORY_OPTIONS}
        value={category}
        onChange={setCategory}
        testIDPrefix="explore-chip"
      />

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.brandPrimary} size="large" />
        </View>
      ) : error ? (
        <EmptyState
          testID="explore-error"
          icon="!"
          title="Não foi possível carregar"
          subtitle={
            category === "book"
              ? "A API do Google Books precisa ser habilitada no seu projeto Google Cloud. Tente novamente em instantes."
              : "Verifique sua conexão e tente novamente."
          }
          actionLabel="Tentar novamente"
          onAction={() => {
            if (query.trim().length > 0) searchQuery.refetch();
            else trendingQuery.refetch();
          }}
        />
      ) : displayedItems.length === 0 ? (
        <EmptyState
          testID="explore-empty"
          icon="⌕"
          title={
            query.trim().length > 0
              ? "Nenhum resultado encontrado"
              : "Comece uma busca"
          }
          subtitle={
            query.trim().length > 0
              ? "Tente outro termo ou categoria."
              : "Digite um título ou explore os destaques."
          }
        />
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => {
            const saved = savedItems.find((s) => s.id === item.id);
            return (
              <MediaCard
                item={item}
                width={cardWidth}
                onPress={openDetail}
                savedBadge={
                  saved
                    ? {
                        library: saved.in_library,
                        favorite: saved.in_favorites,
                        watchlist: saved.in_watchlist,
                      }
                    : undefined
                }
              />
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    color: colors.onSurface,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 46,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    color: colors.muted,
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.onSurface,
    fontSize: 15,
    padding: 0,
  },
  clearIcon: {
    color: colors.muted,
    fontSize: 16,
    marginLeft: spacing.sm,
    paddingHorizontal: 4,
  },
  centerFill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  gridContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  gridRow: {
    justifyContent: "space-between",
  },
});
