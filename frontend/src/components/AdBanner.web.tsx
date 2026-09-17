import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

interface Props {
  spaced?: boolean;
  testID?: string;
}

/** Versão web: o AdMob só existe em builds nativos, então mostramos um placeholder. */
export default function AdBanner({ spaced = true, testID = "ad-banner" }: Props) {
  return (
    <View
      style={[styles.fallback, spaced && styles.spaced]}
      testID={testID}
      accessibilityLabel="Espaço reservado para anúncio"
    >
      <Text style={styles.fallbackTag}>Anúncio</Text>
      <Text style={styles.fallbackText}>
        Os anúncios aparecem no app instalado (build nativo)
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  spaced: { marginVertical: spacing.lg },
  fallback: {
    marginHorizontal: spacing.lg,
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  fallbackTag: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  fallbackText: { color: colors.muted, fontSize: 11, marginTop: 2, textAlign: "center" },
});
