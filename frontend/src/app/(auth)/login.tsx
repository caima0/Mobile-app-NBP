import { useState } from "react";
import { useRouter } from "expo-router";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ThemeColors, useTheme } from "@/context/themeContext";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>NBP</Text>
      </View>

      <TextInput
        value={username}
        onChangeText={setUsername}
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={styles.button}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/register")}
        style={styles.linkCon}
        activeOpacity={0.7}
      >
        <Text style={styles.linkText}>
          Don't have an account?{" "}
          <Text style={styles.linkHighlight}>Register</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      backgroundColor: theme.background,
    },

    header: {
      alignItems: "center",
      marginBottom: 40,
    },

    title: {
      color: theme.text,
      fontSize: 32,
      fontWeight: "700",
    },

    input: {
      backgroundColor: theme.card,
      color: theme.text,
      padding: 15,
      borderRadius: 14,
      marginBottom: 14,
      fontSize: 15,
      borderWidth: 1,
      borderColor: "#33373B",
    },

    button: {
      backgroundColor: theme.primary,
      paddingVertical: 15,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },

    buttonText: {
      color: theme.background,
      fontSize: 16,
      fontWeight: "700",
    },

    linkCon: {
      marginTop: 22,
      alignItems: "center",
    },

    linkText: {
      color: theme.text,
      fontSize: 14,
    },

    linkHighlight: {
      color: theme.primary,
      fontWeight: "700",
    },
  });
