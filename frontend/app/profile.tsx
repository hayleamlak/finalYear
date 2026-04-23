import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { fetchMyProfile, updateMyProfile } from "@/lib/profile";
import { BackendLanguage } from "@/types/profile";

const LANGUAGE_OPTIONS: Array<{ label: string; value: BackendLanguage }> = [
  { label: "English", value: "ENGLISH" },
  { label: "Amharic", value: "AMHARIC" },
  { label: "Afan Oromo", value: "AFAN_OROMO" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const { t } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [profileLanguage, setProfileLanguage] = useState<BackendLanguage>("ENGLISH");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const styles = createStyles(colors);

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const userId = user?.id || "-";

  const saveDisabled = useMemo(() => {
    return isSaving || firstName.trim().length === 0 || lastName.trim().length === 0;
  }, [firstName, isSaving, lastName]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!isSignedIn) {
        return;
      }

      try {
        setErrorMessage(null);
        setIsLoading(true);
        const token = await getToken();

        if (!token) {
          throw new Error("Missing auth token");
        }

        const response = await fetchMyProfile(token);
        const profile = response.data.profile;

        setFirstName(profile.first_name || user?.firstName || "");
        setLastName(profile.last_name || user?.lastName || "");
        setAddress(profile.address || "");
        setEmail(profile.email || userEmail);
        setProfileLanguage(profile.language || "ENGLISH");
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load profile.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, [getToken, isSignedIn, user?.firstName, user?.lastName, userEmail]);

  const onSave = async () => {
    try {
      setErrorMessage(null);
      setIsSaving(true);

      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await updateMyProfile(token, {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address: address.trim() ? address.trim() : null,
        language: profileLanguage,
        email: email || userEmail,
      });

      if (user) {
        await user.update({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        });
      }

      Alert.alert("Saved", "Profile updated successfully.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
            <Text style={styles.backButtonText}>{t("cart.back")}</Text>
          </Pressable>
          <Text style={styles.title}>{t("profile.title")}</Text>
        </View>

        {!isSignedIn ? (
          <View style={styles.card}>
            <MaterialCommunityIcons name="account-lock-outline" size={24} color={colors.accent} />
            <Text style={styles.emptyText}>Sign in to view your profile.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/sign-in") }>
              <Text style={styles.primaryButtonText}>{t("account.signIn")}</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.card}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.emptyText}>Loading profile...</Text>
          </View>
        ) : (
          <View style={styles.card}>
            <MaterialCommunityIcons name="account-box-outline" size={24} color={colors.accent} />
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            <View style={styles.row}>
              <Text style={styles.label}>First name</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={colors.textSubtle}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Last name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={colors.textSubtle}
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="Address"
                placeholderTextColor={colors.textSubtle}
                multiline
              />
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{email || userEmail || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Preferred language</Text>
              <View style={styles.languageRow}>
                {LANGUAGE_OPTIONS.map((option) => {
                  const active = option.value === profileLanguage;

                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.languagePill, active && styles.languagePillActive]}
                      onPress={() => setProfileLanguage(option.value)}
                    >
                      <Text style={[styles.languagePillText, active && styles.languagePillTextActive]}>{option.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>User ID</Text>
              <Text style={styles.value} numberOfLines={1}>{userId}</Text>
            </View>

            <Pressable style={[styles.primaryButton, saveDisabled && styles.primaryButtonDisabled]} disabled={saveDisabled} onPress={() => void onSave()}>
              {isSaving ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.primaryButtonText}>Save changes</Text>}
            </Pressable>
          </View>
        )}
      </ScrollView>
      <BottomNavBar currentPath={pathname} />
    </SafeAreaView>
  );
}

const createStyles = (colors: {
  background: string;
  surface: string;
  text: string;
  textSubtle: string;
  border: string;
  accent: string;
  surfaceAlt: string;
  primary: string;
  primaryText: string;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 20,
      paddingBottom: 110,
      gap: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    backButton: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    backButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "900",
    },
    card: {
      marginTop: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 8,
    },
    row: {
      paddingTop: 6,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 4,
    },
    input: {
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.surfaceAlt,
    },
    multilineInput: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    label: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
    },
    value: {
      color: colors.text,
      fontWeight: "700",
    },
    errorText: {
      color: "#b91c1c",
      textAlign: "left",
      marginBottom: 8,
    },
    emptyText: {
      color: colors.textSubtle,
      textAlign: "center",
    },
    languageRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginTop: 6,
    },
    languagePill: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.surfaceAlt,
    },
    languagePillActive: {
      borderColor: colors.accent,
      backgroundColor: colors.surface,
    },
    languagePillText: {
      color: colors.textSubtle,
      fontWeight: "700",
      fontSize: 12,
    },
    languagePillTextActive: {
      color: colors.accent,
    },
    primaryButton: {
      marginTop: 10,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      paddingVertical: 10,
    },
    primaryButtonDisabled: {
      opacity: 0.55,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
  });
