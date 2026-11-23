import { useState } from "react";
import { useRouter } from "expo-router";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { Colors } from "@/const/Colors";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const styles = createStyles(theme);

  {
    /*handleLogin placeholder for now */
  }

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      return;
    }
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

      <Pressable
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/register")}
        style={styles.linkCon}
      >
        <Text style={styles.linkText}>
          Don't have an account?{" "}
          <Text style={styles.linkHighlight}>Register</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const createStyles = (theme: typeof Colors.light) =>
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

    buttonPressed: {
      opacity: 0.85,
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
