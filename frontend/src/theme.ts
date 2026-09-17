// Design tokens for Universal Tracker — dark theme with violet accent.
// Values mirror /app/design_guidelines.json (color block).

import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const dark = {
  // Surfaces
  surface: "#09090E",
  onSurface: "#F8F8F8",
  surfaceSecondary: "#16161D",
  onSurfaceSecondary: "#EAEAEA",
  surfaceTertiary: "#21212B",
  onSurfaceTertiary: "#D4D4D4",
  surfaceInverse: "#FFFFFF",
  onSurfaceInverse: "#000000",
  muted: "#888893",

  // Brand
  brand: "#8B5CF6",
  onBrand: "#FFFFFF",
  brandPrimary: "#9D4EDD",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#7B2CBF",
  onBrandSecondary: "#FFFFFF",
  brandTertiary: "#3C096C",
  onBrandTertiary: "#E0B1CB",

  // Status
  success: "#10B981",
  onSuccess: "#FFFFFF",
  warning: "#F59E0B",
  onWarning: "#000000",
  error: "#EF4444",
  onError: "#FFFFFF",
  info: "#3B82F6",
  onInfo: "#FFFFFF",

  // Lines
  border: "#2E2E38",
  borderStrong: "#4A4A57",
  divider: "#2A2A35",
};

export type ThemeColors = typeof dark;

export const defaultScheme = "dark" satisfies ColorScheme;

export const themes: { light?: ThemeColors; dark: ThemeColors } = { dark };

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

// Force dark until we ship a light theme.
setColorScheme?.(themes.light ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme = system && themes[system] ? system : defaultScheme;
  return { scheme, colors: (themes as any)[scheme] ?? themes.dark };
}

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

export const colors = themes.dark;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};
