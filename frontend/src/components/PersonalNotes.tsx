import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { updateSaved } from "@/src/hooks/useLibrary";
import { colors, radius, spacing } from "@/src/theme";
import type { MediaItem, SavedItem } from "@/src/types/media";

interface Props {
  item: MediaItem;
  saved?: SavedItem;
}

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const MAX_REVIEW = 280;

export function PersonalNotes({ item, saved }: Props) {
  const rating = saved?.user_rating ?? null;
  const savedReview = saved?.review ?? "";
  const [review, setReview] = useState(savedReview);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setReview(savedReview);
  }, [savedReview]);

  const dirty = review.trim() !== savedReview.trim();

  const setRating = async (value: number) => {
    await updateSaved(item, { user_rating: rating === value ? null : value });
  };

  const saveReview = async () => {
    await updateSaved(item, { review: review.trim() });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  };

  return (
    <View style={styles.wrap} testID="personal-notes">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Sua avaliação</Text>
        {rating ? (
          <Text style={styles.ratingLabel} testID="user-rating-label">
            {rating}/10
          </Text>
        ) : (
          <Text style={styles.ratingHint}>Toque para avaliar</Text>
        )}
      </View>

      <View style={styles.scoreRow}>
        {SCORES.map((s) => {
          const active = rating != null && s <= rating;
          const exact = rating === s;
          return (
            <TouchableOpacity
              key={s}
              testID={`user-rating-${s}`}
              onPress={() => setRating(s)}
              style={[
                styles.scoreBtn,
                active && styles.scoreBtnActive,
                exact && styles.scoreBtnExact,
              ]}
              activeOpacity={0.8}
              hitSlop={4}
            >
              <Text style={[styles.scoreText, active && styles.scoreTextActive]}>
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.subTitle}>Resenha curta</Text>
      <TextInput
        testID="review-input"
        style={styles.reviewInput}
        value={review}
        onChangeText={(t) => setReview(t.slice(0, MAX_REVIEW))}
        placeholder="O que você achou? Escreva em poucas palavras..."
        placeholderTextColor={colors.muted}
        multiline
        textAlignVertical="top"
        maxLength={MAX_REVIEW}
      />
      <View style={styles.footerRow}>
        <Text style={styles.counter}>
          {review.length}/{MAX_REVIEW}
        </Text>
        <TouchableOpacity
          testID="review-save"
          style={[styles.saveBtn, !dirty && styles.saveBtnDisabled]}
          onPress={saveReview}
          disabled={!dirty}
          activeOpacity={0.85}
        >
          <Text style={styles.saveText}>
            {justSaved ? "✓ Salvo" : "Salvar resenha"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  title: { color: colors.onSurface, fontSize: 16, fontWeight: "700" },
  ratingLabel: { color: colors.warning, fontSize: 14, fontWeight: "700" },
  ratingHint: { color: colors.muted, fontSize: 12 },
  scoreRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  scoreBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreBtnActive: {
    backgroundColor: colors.brandTertiary,
    borderColor: colors.brandSecondary,
  },
  scoreBtnExact: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  scoreText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  scoreTextActive: { color: colors.onBrandPrimary },
  subTitle: {
    color: colors.onSurfaceSecondary,
    fontSize: 13,
    fontWeight: "600",
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  reviewInput: {
    minHeight: 92,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.onSurface,
    fontSize: 14,
    lineHeight: 20,
    padding: spacing.md,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  counter: { color: colors.muted, fontSize: 11 },
  saveBtn: {
    height: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.45 },
  saveText: { color: colors.onBrandPrimary, fontSize: 13, fontWeight: "700" },
});
