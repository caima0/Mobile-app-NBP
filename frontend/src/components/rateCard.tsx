import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemeColors, useTheme } from "@/context/themeContext";

export type Rate = {
  currency: string;
  code: string;
  mid: number;
};

type Props = {
  rate: Rate;
  onPress?: (rate: Rate) => void;
};

export default function RateCard({ rate, onPress }: Props) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(rate)}
      style={styles.card}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.mid}>{rate.code}</Text>
        <Text style={styles.currency} numberOfLines={1}>
          {rate.currency}
        </Text>
      </View>

      <Text style={styles.mid}>{rate.mid.toFixed(4)}</Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
    card: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 16,
      borderRadius: 16,
      backgroundColor: theme.card,
    },
    left: {
      flex: 1,
      marginRight: 12,
    },
    currency: {
      fontSize: 12,
      marginTop: 2,
      color: theme.faint,
    },
    mid: {
      fontSize: 17,
      fontWeight: "600",
      color: theme.text,
    },
  });
