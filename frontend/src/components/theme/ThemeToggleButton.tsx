import { Pressable, StyleSheet, Text } from "react-native";

import { useTheme } from "@/context/ThemeContext";

export function ThemeToggleButton() {
  const { mode, colors, toggleMode } = useTheme();

  return (
    <Pressable
      style={[
        styles.button,
        {
          backgroundColor: colors.surfaceAlt,
          borderColor: colors.border,
        },
      ]}
      onPress={toggleMode}
    >
      <Text style={[styles.text, { color: colors.text }]}>{mode === "dark" ? "Dark" : "Light"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
