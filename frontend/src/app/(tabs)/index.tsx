import React from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ThemeColors, useTheme } from "@/context/themeContext";
import RateCard, { Rate } from "@/components/rateCard";

const RATES: Rate[] = [
  { currency: "bat (Tajlandia)", code: "THB", mid: 0.1202 },
  { currency: "dolar amerykański", code: "USD", mid: 3.65 },
  { currency: "euro", code: "EUR", mid: 4.25 },
  { currency: "funt szterling", code: "GBP", mid: 4.89 },
  { currency: "frank szwajcarski", code: "CHF", mid: 4.61 },
];

export default function HomeScreen() {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.container, { backgroundColor: colors.subBackground }]}
    >
      <View style={styles.header}>
        <Pressable onPress={() => {}}>
          <Ionicons
            style={styles.icon}
            name="person"
            size={20}
            color={colors.text}
          />
        </Pressable>
        <Text style={styles.balance}>$0</Text>
      </View>

      <Text style={styles.sectionTitle}>Market prices</Text>

      <FlatList
        data={RATES}
        keyExtractor={(item) => item.code}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <RateCard rate={item} onPress={() => {}} />}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1 },

    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    icon: {
      padding: 8,
      borderRadius: 16,
      backgroundColor: theme.faint,
    },
    balance: {
      fontSize: 16,
      fontWeight: "500",
      paddingVertical: 6,
      paddingHorizontal: 15,
      borderRadius: 12,
      color: theme.text,
      backgroundColor: theme.faint,
    },

    sectionTitle: {
      fontSize: 20,
      fontWeight: "600",
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 12,
      color: theme.text,
    },

    list: {
      paddingHorizontal: 20,
      paddingBottom: 120,
    },
  });
