import Constants from "expo-constants";
import { Platform, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing } from "@/src/theme";

const expoGo = Constants.appOwnership === "expo";
let Ads: any = null;
let initialized = false;

if (!expoGo && Platform.OS !== "web") {
  try {
    Ads = require("react-native-google-mobile-ads");
  } catch {
    Ads = null;
  }
}

const productionUnitId =
  Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_BANNER_ID
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_BANNER_ID;

interface Props {
  /** Espaço vertical acima/abaixo do anúncio */
  spaced?: boolean;
  testID?: string;
}

export default function AdBanner({ spaced = true, testID = "ad-banner" }: Props) {
  if (expoGo || !Ads) {
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

  const { BannerAd, BannerAdSize, TestIds, default: mobileAds } = Ads;
  if (!initialized) {
    initialized = true;
    mobileAds()
      .initialize()
      .catch(() => {});
  }
  const unitId = __DEV__ ? TestIds.BANNER : productionUnitId;
  if (!unitId) return null;

  return (
    <View style={[styles.container, spaced && styles.spaced]} testID={testID}>
      <BannerAd
        unitId={unitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        onAdFailedToLoad={(error: unknown) =>
          console.warn("AdMob banner falhou", error)
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", minHeight: 50 },
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
