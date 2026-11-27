import { useState } from "react";
import { useRouter } from "expo-router";
import { z } from "zod";
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ThemeColors, useTheme } from "@/context/themeContext";

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleRegister = () => {
    const result = registerSchema.safeParse({
      username,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register to continue using the app</Text>
      </View>

      <TextInput
        value={username}
        onChangeText={(t) => {
          setUsername(t);
          setError(null);
        }}
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
      />

      <TextInput
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(null);
        }}
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        secureTextEntry
      />

      <TextInput
        value={confirmPassword}
        onChangeText={(t) => {
          setConfirmPassword(t);
          setError(null);
        }}
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        secureTextEntry
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        onPress={handleRegister}
        style={styles.button}
        activeOpacity={0.85}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/login")}
        style={styles.linkCon}
        activeOpacity={0.7}
      >
        <Text style={styles.linkText}>
          Already have an account?{" "}
          <Text style={styles.linkHighlight}>Sign in</Text>
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
      marginBottom: 50,
    },

    title: {
      color: theme.text,
      fontSize: 32,
      fontWeight: "700",
      marginBottom: 8,
    },

    subtitle: {
      color: theme.text,
      opacity: 0.6,
      fontSize: 14,
    },

    input: {
      backgroundColor: theme.card,
      color: theme.text,
      padding: 15,
      borderRadius: 14,
      marginBottom: 14,
      fontSize: 15,
      borderWidth: 1,
      borderColor: theme.text + "20",
    },

    placeholderText: {
      opacity: 0.5,
    },

    errorText: {
      color: "#ff6b6b",
      marginBottom: 14,
      fontSize: 13,
      paddingLeft: 4,
    },

    button: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
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
