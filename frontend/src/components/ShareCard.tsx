import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";
import { CATEGORY_LABEL_SINGULAR, type MediaItem } from "@/src/types/media";

interface Props {
  item: MediaItem;
  userRating?: number | null;
  review?: string;
  width: number;
}

/** Card visual (poster + título + nota) pensado para ser capturado como imagem. */
export function ShareCard({ item, userRating, review, width }: Props) {
  const height = Math.round(width * 1.5);
  const posterW = Math.round(width * 0.52);
  const posterH = Math.round(posterW * 1.5);
  const rating =
    typeof item.rating === "number" && item.rating > 0
      ? item.rating.toFixed(1)
      : null;

  return (
    <View style={[styles.card, { width, height }]} collapsable={false}>
      {item.backdrop_url || item.cover_url ? (
        <Image
          source={{ uri: item.backdrop_url ?? item.cover_url ?? "" }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          blurRadius={18}
        />
      ) : null}
      <LinearGradient
        colors={["rgba(9,9,14,0.55)", "rgba(9,9,14,0.85)", "rgba(9,9,14,0.98)"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.inner}>
        <View style={styles.brandRow}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>Universal Tracker</Text>
        </View>

        <View style={[styles.posterWrap, { width: posterW, height: posterH }]}>
          {item.cover_url ? (
            <Image
              source={{ uri: item.cover_url }}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.posterFallback]}>
              <Text style={styles.posterFallbackText} numberOfLines={3}>
                {item.title}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.typePill}>
          <Text style={styles.typePillText}>
            {CATEGORY_LABEL_SINGULAR[item.type]}
            {item.year ? ` · ${item.year}` : ""}
          </Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        <View style={styles.ratingsRow}>
          {userRating ? (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingBig}>{userRating}</Text>
              <Text style={styles.ratingSmall}>/10 minha nota</Text>
            </View>
          ) : null}
          {rating ? (
            <View style={[styles.ratingBox, styles.ratingBoxMuted]}>
              <Text style={[styles.ratingBig, styles.ratingBigMuted]}>★ {rating}</Text>
              <Text style={styles.ratingSmall}>média</Text>
            </View>
          ) : null}
        </View>

        {review ? (
          <Text style={styles.review} numberOfLines={3}>
            “{review}”
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.surface,
  },
  inner: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.lg,
  },
  brandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brandPrimary,
  },
  brandText: {
    color: colors.onSurfaceSecondary,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  posterWrap: {
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginBottom: spacing.lg,
  },
  posterFallback: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  posterFallbackText: { color: colors.muted, textAlign: "center", fontSize: 13 },
  typePill: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  typePillText: { color: colors.onBrandPrimary, fontSize: 11, fontWeight: "700" },
  title: {
    color: colors.onSurface,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 26,
  },
  ratingsRow: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  ratingBox: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: "rgba(157,78,221,0.22)",
    borderWidth: 1,
    borderColor: colors.brandPrimary,
  },
  ratingBoxMuted: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  ratingBig: { color: colors.onSurface, fontSize: 22, fontWeight: "800" },
  ratingBigMuted: { color: colors.warning },
  ratingSmall: { color: colors.muted, fontSize: 10, marginTop: 2 },
  review: {
    color: colors.onSurfaceSecondary,
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
    marginTop: spacing.lg,
  },
});
