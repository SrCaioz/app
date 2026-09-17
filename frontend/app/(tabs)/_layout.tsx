import { Tabs } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { colors } from "@/src/theme";

function TabIcon({ label, active }: { label: string; active: boolean }) {
  return (
    <View style={styles.iconWrap}>
      <Text
        style={[
          styles.icon,
          { color: active ? colors.brandPrimary : colors.muted },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
        tabBarItemStyle: { alignSelf: "center" },
      }}
    >
      <Tabs.Screen
        name="explorar"
        options={{
          title: "Explorar",
          tabBarIcon: ({ focused }) => <TabIcon label="⌕" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="para-voce"
        options={{
          title: "Para você",
          tabBarIcon: ({ focused }) => <TabIcon label="✦" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="biblioteca"
        options={{
          title: "Biblioteca",
          tabBarIcon: ({ focused }) => <TabIcon label="▤" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="favoritos"
        options={{
          title: "Favoritos",
          tabBarIcon: ({ focused }) => <TabIcon label="★" active={focused} />,
        }}
      />
      <Tabs.Screen
        name="quero-consumir"
        options={{
          title: "Quero",
          tabBarIcon: ({ focused }) => <TabIcon label="◔" active={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 20,
    fontWeight: "700",
  },
});
