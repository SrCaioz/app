import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getRecommendations, type RecommendSeed } from "@/src/api/client";
import AdBanner from "@/src/components/AdBanner";
import { EmptyState } from "@/src/components/EmptyState";
import { MediaCard } from "@/src/components/MediaCard";
import { useSavedItems } from "@/src/hooks/useLibrary";
import { colors, radius, spacing } from "@/src/theme";
import type { MediaItem, RecommendResponse } from "@/src/types/media";

const CARD_WIDTH = 132;

const SECTIONS: { key: keyof Omit<RecommendResponse, "based_on">; title: string }[] = [
  { key: "movies", title: "Filmes para você" },
  { key: "series", title: "Séries para você" },
  { key: "manga", title: "Mangás para você" },
  { key: "books", title: "Livros para você" },
];

export default function ParaVoceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { items: savedItems, loading } = useSavedItems();

  // Sementes: favoritos primeiro; se não houver, usa itens bem avaliados pelo usuário / biblioteca.
  const seeds = useMemo<RecommendSeed[]>(() => {
    const favorites = savedItems.filter((x) => x.in_favorites);
    const base =
      favorites.length > 0
        ? favorites
        : savedItems.filter((x) => (x.user_rating ?? 0) >= 7 || x.in_library);
    return base
      .filter((x) => (x.genres ?? []).length > 0)
      .map((x) => ({
        type: x.type,
        genres: x.genres ?? [],
        rating: x.user_rating ?? x.rating ?? null,
      }));
  }, [savedItems]);

  const excludeIds = useMemo(() => savedItems.map((x) => x.id), [savedItems]);
  const seedKey = useMemo(
    () => JSON.stringify(seeds.map((s) => [s.type, s.genres, s.rating])),
    [seeds],
  );

  const recQuery = useQuery<RecommendResponse>({
    queryKey: ["recommend", seedKey],
    queryFn: () => getRecommendations(seeds, excludeIds),
    enabled: seeds.length > 0,
    staleTime: 10 * 60 * 1000,
  });

  const openDetail = (item: MediaItem) => {
    router.push(`/details/${item.type}/${item.external_id}`);
  };

  const hasFavorites = savedItems.some((x) => x.in_favorites);
  const data = recQuery.data;
  const totalSuggestions = data
    ? data.movies.length + data.series.length + data.manga.length + data.books.length
    : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Para você</Text>
        <Text style={styles.subtitle}>
          {hasFavorites
            ? "Sugestões baseadas nos seus favoritos"
            : "Sugestões baseadas na sua biblioteca"}
        </Text>
      </View>

      {loading ? null : seeds.length === 0 ? (
        <EmptyState
          testID="foryou-empty"
          icon="✦"
          title="Ainda não temos sugestões"
          subtitle="Favorite alguns títulos e voltaremos com recomendações parecidas com o que você ama."
          actionLabel="Explorar títulos"
          onAction={() => router.push("/(tabs)/explorar")}
        />
      ) : recQuery.isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator color={colors.brandPrimary} size="large" />
          <Text style={styles.loadingText}>Analisando seus gostos...</Text>
        </View>
      ) : recQuery.error ? (
        <EmptyState
          testID="foryou-error"
          icon="!"
          title="Não foi possível carregar"
          subtitle="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={() => recQuery.refetch()}
        />
      ) : totalSuggestions === 0 ? (
        <EmptyState
          testID="foryou-none"
          icon="✦"
          title="Nada novo por enquanto"
          subtitle="Você já salvou tudo que encontramos parecido. Favorite mais títulos para ampliar as sugestões."
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={recQuery.isRefetching}
              onRefresh={() => recQuery.refetch()}
              tintColor={colors.brandPrimary}
            />
          }
        >
          {data && data.based_on.genres.length > 0 ? (
            <View style={styles.basedOn} testID="foryou-based-on">
              <Text style={styles.basedOnLabel}>Baseado em</Text>
              <View style={styles.genreRow}>
                {data.based_on.genres.slice(0, 6).map((g) => (
                  <View key={g} style={styles.genreChip}>
                    <Text style={styles.genreChipText}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {SECTIONS.map((section, index) => {
            const list = data?.[section.key] ?? [];
            if (list.length === 0) return null;
            return (
              <View key={section.key} testID={`foryou-section-${section.key}`}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <FlatList
                  data={list}
                  horizontal
                  keyExtractor={(item) => item.id}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.hList}
                  renderItem={({ item }) => (
                    <MediaCard item={item} width={CARD_WIDTH} onPress={openDetail} />
                  )}
                />
                {index === 0 ? <AdBanner /> : null}
              </View>
            );
          })}
        </ScrollView>
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
  centerFill: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md },
  loadingText: { color: colors.muted, fontSize: 13 },
  content: { paddingBottom: spacing.xxl },
  basedOn: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  basedOnLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
  genreRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  genreChip: {
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
  },
  genreChipText: { color: colors.onBrandTertiary, fontSize: 12, fontWeight: "600" },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  hList: { paddingHorizontal: spacing.lg, gap: spacing.md },
});
