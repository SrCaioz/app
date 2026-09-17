import { Image } from "expo-image";
import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { MediaItem, MediaType } from "@/src/types/media";
import { CATEGORY_LABEL_SINGULAR } from "@/src/types/media";
import { colors, radius, spacing } from "@/src/theme";

interface Props {
  item: MediaItem;
  onPress: (item: MediaItem) => void;
  width: number;
  savedBadge?: { library?: boolean; favorite?: boolean; watchlist?: boolean };
}

const TYPE_BADGE_COLOR: Record<MediaType, string> = {
  movie: "#9D4EDD",
  series: "#7B2CBF",
  manga: "#F59E0B",
  book: "#10B981",
};

export function MediaCard({ item, onPress, width, savedBadge }: Props) {
  const posterHeight = useMemo(() => Math.round(width * 1.5), [width]);
  const rating =
    typeof item.rating === "number" ? item.rating.toFixed(1) : null;

  return (
    <TouchableOpacity
      testID={`media-card-${item.id}`}
      style={[styles.card, { width }]}
      onPress={() => onPress(item)}
      activeOpacity={0.85}
    >
      <View style={[styles.posterWrap, { height: posterHeight }]}>
        {item.cover_url ? (
          <Image
            source={{ uri: item.cover_url }}
            style={styles.poster}
            contentFit="cover"
            transition={180}
          />
        ) : (
          <View style={[styles.poster, styles.posterFallback]}>
            <Text style={styles.fallbackText} numberOfLines={2}>
              {item.title}
            </Text>
          </View>
        )}
        <View
          style={[
            styles.typeBadge,
            { backgroundColor: TYPE_BADGE_COLOR[item.type] },
          ]}
        >
          <Text style={styles.typeBadgeText}>
            {CATEGORY_LABEL_SINGULAR[item.type]}
          </Text>
        </View>
        {savedBadge && (savedBadge.library || savedBadge.favorite || savedBadge.watchlist) && (
          <View style={styles.savedRow} pointerEvents="none">
            {savedBadge.favorite && (
              <View style={[styles.savedDot, { backgroundColor: colors.warning }]}>
                <Text style={styles.savedDotIcon}>★</Text>
              </View>
            )}
            {savedBadge.watchlist && (
              <View style={[styles.savedDot, { backgroundColor: colors.info }]}>
                <Text style={styles.savedDotIcon}>◔</Text>
              </View>
            )}
            {savedBadge.library && (
              <View style={[styles.savedDot, { backgroundColor: colors.brandPrimary }]}>
                <Text style={styles.savedDotIcon}>✓</Text>
              </View>
            )}
          </View>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {item.title}
      </Text>
      <View style={styles.metaRow}>
        {item.year ? <Text style={styles.metaText}>{item.year}</Text> : null}
        {rating ? (
          <>
            {item.year ? <Text style={styles.metaDot}>·</Text> : null}
            <Text style={styles.metaText}>★ {rating}</Text>
          </>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  posterWrap: {
    width: "100%",
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
    position: "relative",
  },
  poster: {
    width: "100%",
    height: "100%",
  },
  posterFallback: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  fallbackText: {
    color: colors.muted,
    textAlign: "center",
    fontSize: 13,
  },
  typeBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  typeBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  savedRow: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: "row",
    gap: 4,
  },
  savedDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  savedDotIcon: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  title: {
    marginTop: spacing.sm,
    color: colors.onSurface,
    fontSize: 14,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  metaText: {
    color: colors.muted,
    fontSize: 12,
  },
  metaDot: {
    color: colors.muted,
    fontSize: 12,
    marginHorizontal: 4,
  },
});
