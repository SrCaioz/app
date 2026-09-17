import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

export function EmptyState({
  icon = "✦",
  title,
  subtitle,
  actionLabel,
  onAction,
  testID,
}: Props) {
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          activeOpacity={0.85}
          testID={testID ? `${testID}-action` : undefined}
        >
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    fontSize: 30,
    color: colors.brandPrimary,
  },
  title: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    textAlign: "center",
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.sm,
    backgroundColor: colors.brandPrimary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  buttonText: {
    color: colors.onBrandPrimary,
    fontSize: 14,
    fontWeight: "600",
  },
});
