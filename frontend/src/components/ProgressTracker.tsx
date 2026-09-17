import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";
import type { MediaItem, SavedItem } from "@/src/types/media";
import { progressMeta, progressPercent } from "@/src/utils/progress";
import { updateSaved } from "@/src/hooks/useLibrary";

interface Props {
  item: MediaItem;
  saved?: SavedItem;
}

export function ProgressTracker({ item, saved }: Props) {
  const meta = progressMeta(item);
  const progress = saved?.progress ?? 0;
  const [draft, setDraft] = useState(String(progress));

  useEffect(() => {
    setDraft(String(progress));
  }, [progress]);

  if (!meta) return null;

  const total = meta.total;
  const pct = progressPercent(progress, total);
  const done = total != null && progress >= total;

  const commit = async (value: number) => {
    let next = Math.max(0, Math.round(value));
    if (total != null) next = Math.min(total, next);
    await updateSaved(item, {
      progress: next,
      status: total != null && next >= total ? "concluido" : next > 0 ? "consumindo" : undefined,
    });
  };

  const submitDraft = () => {
    const n = parseInt(draft.replace(/\D/g, ""), 10);
    if (Number.isNaN(n)) {
      setDraft(String(progress));
      return;
    }
    commit(n);
  };

  return (
    <View style={styles.wrap} testID="progress-tracker">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Progresso</Text>
        <Text style={styles.summary} testID="progress-summary">
          {progress}
          {total != null ? ` / ${total}` : ""} {meta.unitPlural}
        </Text>
      </View>

      {total != null ? (
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.round(pct * 100)}%` }]} />
        </View>
      ) : null}

      <View style={styles.controls}>
        <TouchableOpacity
          testID="progress-minus"
          style={[styles.stepBtn, progress <= 0 && styles.stepBtnDisabled]}
          onPress={() => commit(progress - 1)}
          disabled={progress <= 0}
          activeOpacity={0.8}
        >
          <Text style={styles.stepText}>−</Text>
        </TouchableOpacity>

        <TextInput
          testID="progress-input"
          style={styles.input}
          value={draft}
          onChangeText={setDraft}
          onBlur={submitDraft}
          onSubmitEditing={submitDraft}
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
        />

        <TouchableOpacity
          testID="progress-plus"
          style={[styles.stepBtn, done && styles.stepBtnDisabled]}
          onPress={() => commit(progress + 1)}
          disabled={done}
          activeOpacity={0.8}
        >
          <Text style={styles.stepText}>+</Text>
        </TouchableOpacity>

        {total != null ? (
          <TouchableOpacity
            testID="progress-complete"
            style={[styles.completeBtn, done && styles.completeBtnDone]}
            onPress={() => commit(done ? 0 : total)}
            activeOpacity={0.85}
          >
            <Text style={[styles.completeText, done && styles.completeTextDone]}>
              {done ? "✓ Concluído" : "Concluir"}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.hint}>
        Toque em + a cada {meta.unit} ou digite onde parou.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xl,
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
  summary: { color: colors.brandPrimary, fontSize: 13, fontWeight: "600" },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  barFill: {
    height: "100%",
    backgroundColor: colors.brandPrimary,
    borderRadius: 3,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  stepBtnDisabled: { opacity: 0.4 },
  stepText: { color: colors.onSurface, fontSize: 22, fontWeight: "600", lineHeight: 26 },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.onSurface,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    paddingVertical: 0,
  },
  completeBtn: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  completeBtnDone: {
    backgroundColor: colors.surfaceTertiary,
    borderWidth: 1,
    borderColor: colors.success,
  },
  completeText: { color: colors.onBrandPrimary, fontSize: 13, fontWeight: "700" },
  completeTextDone: { color: colors.success },
  hint: { color: colors.muted, fontSize: 12, marginTop: spacing.md },
});
