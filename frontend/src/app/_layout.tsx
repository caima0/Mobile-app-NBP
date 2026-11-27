import { ThemeProvider } from "@/context/themeContext";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootNavigator() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />

        <Stack.Screen name="(tabs)" />
      </Stack>

      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
