import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const styles = createStyles(colors);

  const activeOption = OPTIONS.find((option) => option.value === locale) ?? OPTIONS[0];

  return (
    <View style={styles.wrapper}>
      <Pressable style={styles.trigger} onPress={() => setIsOpen((current) => !current)}>
        <Text style={styles.label}>{t("language.label")}</Text>
        <View style={styles.triggerRow}>
          <Text style={styles.triggerText}>{t(activeOption.labelKey)}</Text>
          <MaterialCommunityIcons
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={18}
            color={colors.textSubtle}
          />
        </View>
      </Pressable>

      {isOpen ? (
        <View style={styles.menu}>
          {OPTIONS.map((option) => {
            const active = option.value === locale;

            return (
              <Pressable
                key={option.value}
                style={[styles.option, active && styles.optionActive]}
                onPress={() => {
                  setLocale(option.value);
                  setIsOpen(false);
                }}
              >
                <Text style={[styles.optionText, active && styles.optionTextActive]}>{t(option.labelKey)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
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
    wrapper: {
      position: "relative",
      minWidth: 180,
      alignSelf: "flex-end",
    },
    trigger: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minWidth: 180,
    },
    label: {
      color: colors.textSubtle,
      fontWeight: "700",
      fontSize: 12,
      letterSpacing: 0.3,
      textTransform: "uppercase",
      marginBottom: 4,
    },
    triggerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    triggerText: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 14,
      flexShrink: 1,
    },
    menu: {
      marginTop: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      overflow: "hidden",
      elevation: 6,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
    },
    option: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.surface,
    },
    optionActive: {
      backgroundColor: colors.surfaceAlt,
    },
    optionText: {
      color: colors.textSubtle,
      fontWeight: "800",
      fontSize: 13,
    },
    optionTextActive: {
      color: colors.accent,
    },
  });
