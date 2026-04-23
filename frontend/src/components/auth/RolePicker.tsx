import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppRole } from "@/lib/role";

type RolePickerProps = {
  value: AppRole;
  onChange: (role: AppRole) => void;
  colors: {
    text: string;
    textSubtle: string;
    border: string;
    surface: string;
    surfaceAlt: string;
    accent: string;
  };
};

export function RolePicker({ value, onChange, colors }: RolePickerProps) {
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Select role</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.option, value === "buyer" && styles.optionActive]}
          onPress={() => onChange("buyer")}
        >
          <Text style={[styles.optionText, value === "buyer" && styles.optionTextActive]}>Buyer</Text>
        </Pressable>
        <Pressable
          style={[styles.option, value === "farmer" && styles.optionActive]}
          onPress={() => onChange("farmer")}
        >
          <Text style={[styles.optionText, value === "farmer" && styles.optionTextActive]}>Farmer</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: {
  text: string;
  textSubtle: string;
  border: string;
  surface: string;
  surfaceAlt: string;
  accent: string;
}) =>
  StyleSheet.create({
    wrapper: {
      marginBottom: 12,
    },
    label: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: "700",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    row: {
      flexDirection: "row",
      gap: 8,
    },
    option: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingVertical: 10,
      borderRadius: 10,
      alignItems: "center",
    },
    optionActive: {
      backgroundColor: colors.surfaceAlt,
      borderColor: colors.accent,
    },
    optionText: {
      color: colors.textSubtle,
      fontWeight: "700",
    },
    optionTextActive: {
      color: colors.accent,
      fontWeight: "800",
    },
  });
