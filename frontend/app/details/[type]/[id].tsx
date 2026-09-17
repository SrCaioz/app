import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getDetail } from "@/src/api/client";
import { findSaved, toggleList, useSavedItems } from "@/src/hooks/useLibrary";
import { colors, radius, spacing } from "@/src/theme";
import {
  CATEGORY_LABEL_SINGULAR,
  type MediaItem,
  type MediaType,
} from "@/src/types/media";

export default function DetailsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { type, id } = useLocalSearchParams<{ type: MediaType; id: string }>();
  const { items: savedItems } = useSavedItems();

  const query = useQuery<MediaItem>({
    queryKey: ["detail", type, id],
    queryFn: () => getDetail(type as MediaType, id as string),
    enabled: !!type && !!id,
  });

  const item = query.data;
  const saved = useMemo(
    () => (item ? findSaved(savedItems, item.id) : undefined),
    [item, savedItems],
  );

  const heroHeight = Math.round(width * 0.75);

  if (query.isLoading || !item) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.brandPrimary} size="large" />
      </View>
    );
  }

  const inLibrary = saved?.in_library ?? false;
  const inFavorites = saved?.in_favorites ?? false;
  const inWatchlist = saved?.in_watchlist ?? false;

  const doToggle = async (
    list: "library" | "favorites" | "watchlist",
  ) => {
    await toggleList(item, list);
  };

  const rating =
    typeof item.rating === "number" && item.rating > 0
      ? item.rating.toFixed(1)
      : null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.heroWrap, { height: heroHeight }]}>
          {item.backdrop_url || item.cover_url ? (
            <Image
              source={{ uri: item.backdrop_url ?? item.cover_url ?? "" }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.heroImage, { backgroundColor: colors.surfaceSecondary }]} />
          )}
          <LinearGradient
            colors={["transparent", "rgba(9,9,14,0.4)", "rgba(9,9,14,1)"]}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <TouchableOpacity
            testID="details-close"
            onPress={() => router.back()}
            style={[styles.closeBtn, { top: insets.top + spacing.md }]}
            hitSlop={12}
          >
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.heroBottom}>
            <View style={styles.typePill}>
              <Text style={styles.typePillText}>
                {CATEGORY_LABEL_SINGULAR[item.type]}
              </Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={3}>
              {item.title}
            </Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.metaRow}>
            {item.year ? (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>{item.year}</Text>
              </View>
            ) : null}
            {rating ? (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText}>★ {rating}</Text>
              </View>
            ) : null}
            {(item.genres ?? []).slice(0, 3).map((g) => (
              <View key={g} style={styles.metaChip}>
                <Text style={styles.metaChipText}>{g}</Text>
              </View>
            ))}
          </View>

          {item.extra?.authors ? (
            <Text style={styles.metaSecondary}>
              {(item.extra.authors as string[]).join(", ")}
            </Text>
          ) : null}
          {item.extra?.runtime ? (
            <Text style={styles.metaSecondary}>{item.extra.runtime} min</Text>
          ) : null}
          {item.extra?.number_of_seasons ? (
            <Text style={styles.metaSecondary}>
              {item.extra.number_of_seasons} temporada
              {item.extra.number_of_seasons > 1 ? "s" : ""}
              {item.extra.number_of_episodes
                ? ` · ${item.extra.number_of_episodes} eps`
                : ""}
            </Text>
          ) : null}
          {item.extra?.chapters ? (
            <Text style={styles.metaSecondary}>
              {item.extra.chapters} capítulos
              {item.extra.volumes ? ` · ${item.extra.volumes} volumes` : ""}
            </Text>
          ) : null}

          <Text style={styles.sectionTitle}>Sinopse</Text>
          <Text style={styles.description}>
            {item.description || "Sem descrição disponível."}
          </Text>
        </View>
      </ScrollView>

      <View
        style={[
          styles.stickyBar,
          { paddingBottom: Math.max(spacing.md, insets.bottom) },
        ]}
      >
        <LinearGradient
          colors={["rgba(9,9,14,0)", "rgba(9,9,14,0.9)", "rgba(9,9,14,1)"]}
          locations={[0, 0.5, 1]}
          style={styles.stickyGradient}
          pointerEvents="none"
        />
        <View style={styles.stickyContent}>
          <TouchableOpacity
            testID="btn-toggle-library"
            style={[
              styles.primaryBtn,
              inLibrary ? styles.primaryBtnActive : styles.primaryBtnIdle,
            ]}
            onPress={() => doToggle("library")}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.primaryBtnText,
                inLibrary && styles.primaryBtnTextActive,
              ]}
            >
              {inLibrary ? "✓ Na Biblioteca" : "Adicionar à Biblioteca"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="btn-toggle-favorites"
            style={[
              styles.iconBtn,
              inFavorites && { borderColor: colors.warning },
            ]}
            onPress={() => doToggle("favorites")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.iconBtnText,
                inFavorites && { color: colors.warning },
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="btn-toggle-watchlist"
            style={[
              styles.iconBtn,
              inWatchlist && { borderColor: colors.info },
            ]}
            onPress={() => doToggle("watchlist")}
            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.iconBtnText,
                inWatchlist && { color: colors.info },
              ]}
            >
              ◔
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { alignItems: "center", justifyContent: "center" },
  heroWrap: {
    width: "100%",
    backgroundColor: colors.surfaceSecondary,
    justifyContent: "flex-end",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  closeBtn: {
    position: "absolute",
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  heroBottom: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  typePill: {
    alignSelf: "flex-start",
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  typePillText: {
    color: colors.onBrandPrimary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heroTitle: {
    color: colors.onSurface,
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 32,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaChip: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaChipText: {
    color: colors.onSurfaceSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  metaSecondary: {
    color: colors.muted,
    fontSize: 13,
    marginBottom: 2,
  },
  sectionTitle: {
    color: colors.onSurface,
    fontSize: 16,
    fontWeight: "700",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.onSurfaceSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  stickyBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  stickyGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  stickyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  primaryBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primaryBtnIdle: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  primaryBtnActive: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.brandPrimary,
  },
  primaryBtnText: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  primaryBtnTextActive: { color: colors.brandPrimary },
  iconBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnText: {
    color: colors.onSurfaceSecondary,
    fontSize: 22,
  },
});
