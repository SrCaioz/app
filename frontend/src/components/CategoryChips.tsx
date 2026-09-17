import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

export interface ChipOption<T extends string> {
  key: T;
  label: string;
}

interface Props<T extends string> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testIDPrefix?: string;
}

export function CategoryChips<T extends string>({
  options,
  value,
  onChange,
  testIDPrefix = "chip",
}: Props<T>) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <TouchableOpacity
              key={opt.key}
              testID={`${testIDPrefix}-${opt.key}`}
              onPress={() => onChange(opt.key)}
              activeOpacity={0.85}
              style={[
                styles.chip,
                active ? styles.chipActive : styles.chipInactive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active ? styles.chipTextActive : styles.chipTextInactive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 56,
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: "center",
  },
  chip: {
    flexShrink: 0,
    height: 36,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    justifyContent: "center",
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: colors.brandPrimary,
    borderColor: colors.brandPrimary,
  },
  chipInactive: {
    backgroundColor: colors.surfaceSecondary,
    borderColor: colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  chipTextActive: {
    color: colors.onBrandPrimary,
  },
  chipTextInactive: {
    color: colors.onSurfaceSecondary,
  },
});
