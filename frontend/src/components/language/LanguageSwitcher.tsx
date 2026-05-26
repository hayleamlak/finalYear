import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const OPTIONS = [
  { value: "en", labelKey: "language.english" },
  { value: "am", labelKey: "language.amharic" },
  { value: "om", labelKey: "language.oromo" },
] as const;

export function LanguageSwitcher() {
  const { colors } = useTheme();
  const { locale, setLocale, t } = useLanguage();
  const styles = createStyles(colors);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{t("language.label")}</Text>
      <View style={styles.group}>
        {OPTIONS.map((option) => {
          const active = option.value === locale;

          return (
            <Pressable
              key={option.value}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => setLocale(option.value)}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{t(option.labelKey)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: {
  surface: string;
  surfaceAlt: string;
  text: string;
  textSubtle: string;
  border: string;
  accent: string;
}) =>
  StyleSheet.create({
    row: {
      marginTop: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    label: {
      color: colors.textSubtle,
      fontWeight: "700",
      fontSize: 12,
      letterSpacing: 0.3,
      textTransform: "uppercase",
    },
    group: {
      flexDirection: "row",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: "hidden",
    },
    option: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      backgroundColor: colors.surface,
    },
    optionActive: {
      backgroundColor: colors.surfaceAlt,
    },
    optionText: {
      color: colors.textSubtle,
      fontWeight: "800",
      fontSize: 12,
    },
    optionTextActive: {
      color: colors.accent,
    },
  });
