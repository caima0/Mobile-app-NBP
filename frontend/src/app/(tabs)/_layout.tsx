import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/themeContext";

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: colors.faint,

        tabBarStyle: {
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          height: 64,
          borderRadius: 32,
          marginHorizontal: 32,
          backgroundColor: colors.card,
          borderTopWidth: 0,

          paddingTop: 8,
          paddingBottom: 8,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? "card" : "card-outline"}
              size={26}
              color={focused ? colors.primary : colors.faint}
            />
          ),
        }}
      />
    </Tabs>
  );
}
