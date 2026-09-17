import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { captureRef } from "react-native-view-shot";

import { getDetail } from "@/src/api/client";
import { ShareCard } from "@/src/components/ShareCard";
import { findSaved, useSavedItems } from "@/src/hooks/useLibrary";
import { colors, radius, spacing } from "@/src/theme";
import type { MediaItem, MediaType } from "@/src/types/media";

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { type, id } = useLocalSearchParams<{ type: MediaType; id: string }>();
  const { items: savedItems } = useSavedItems();
  const cardRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const cardWidth = Math.min(width - spacing.lg * 2, 340);

  const share = async () => {
    if (!item || !cardRef.current) return;
    setBusy(true);
    setMessage(null);
    try {
      if (Platform.OS === "web") {
        setMessage("O compartilhamento da imagem funciona no app móvel (Android/iOS).");
        return;
      }
      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        setMessage("Compartilhamento não disponível neste dispositivo.");
        return;
      }
      await Sharing.shareAsync(uri, {
        mimeType: "image/png",
        dialogTitle: `Compartilhar ${item.title}`,
        UTI: "public.png",
      });
    } catch (e) {
      setMessage("Não foi possível gerar a imagem. Tente novamente.");
      console.warn("share failed", e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compartilhar card</Text>
        <TouchableOpacity
          testID="share-close"
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {query.isLoading || !item ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brandPrimary} size="large" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View ref={cardRef} collapsable={false} testID="share-card">
            <ShareCard
              item={item}
              userRating={saved?.user_rating}
              review={saved?.review}
              width={cardWidth}
            />
          </View>

          <Text style={styles.hint}>
            Sua imagem inclui o poster, o título e a sua nota. Perfeita para
            WhatsApp, Instagram e Stories.
          </Text>

          {message ? (
            <Text style={styles.message} testID="share-message">
              {message}
            </Text>
          ) : null}

          <TouchableOpacity
            testID="share-button"
            style={[styles.shareBtn, { width: cardWidth }, busy && { opacity: 0.7 }]}
            onPress={share}
            disabled={busy}
            activeOpacity={0.9}
          >
            {busy ? (
              <ActivityIndicator color={colors.onBrandPrimary} />
            ) : (
              <Text style={styles.shareBtnText}>Compartilhar imagem</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: { color: colors.onSurface, fontSize: 20, fontWeight: "700" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  closeIcon: { color: colors.onSurface, fontSize: 15, fontWeight: "700" },
  content: {
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  hint: {
    color: colors.muted,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  message: {
    color: colors.warning,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  shareBtn: {
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xl,
  },
  shareBtnText: { color: colors.onBrandPrimary, fontSize: 15, fontWeight: "700" },
});
