import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, usePathname, useRouter } from "expo-router";
import { Image, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";

import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { getRoleFromUser } from "@/lib/role";

export default function AccountScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale } = useLanguage();
  const { colors, mode } = useTheme();
  const { isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { signOut } = useClerk();
  const styles = createStyles(colors);

  const displayName = user?.fullName || user?.firstName || user?.username || "User";
  const email = user?.primaryEmailAddress?.emailAddress;

  if (isUserLoaded && isSignedIn && getRoleFromUser(user) === "farmer") {
    return <Redirect href="/farmer-dashboard" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{t("account.title")}</Text>
            <Text style={styles.subtitle}>{t("account.subtitle")}</Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              {isSignedIn && user?.imageUrl ? (
                <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
              ) : (
                <MaterialCommunityIcons name="account-outline" size={26} color={colors.accent} />
              )}
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.userName}>{isSignedIn ? displayName : t("account.guest")}</Text>
              {isSignedIn && email ? (
                <Text style={styles.userEmail}>{`${t("account.signedInAs")}: ${email}`}</Text>
              ) : null}
            </View>
          </View>

          {isSignedIn ? (
            <Pressable style={styles.actionButton} onPress={() => router.push("/profile") }>
              <MaterialCommunityIcons name="account-edit-outline" size={18} color={colors.primaryText} />
              <Text style={styles.actionButtonText}>{t("account.editProfile")}</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.primaryButton} onPress={() => router.push("/sign-in") }>
              <Text style={styles.primaryButtonText}>{t("account.signIn")}</Text>
            </Pressable>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("account.orders")}</Text>
          <Pressable style={styles.menuRow} onPress={() => router.push("/orders") }>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="package-variant-closed" size={18} color={colors.text} />
              <Text style={styles.menuText}>{t("account.orders")}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.textSubtle} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t("account.settings")}</Text>
          <View style={styles.settingsRow}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="translate" size={18} color={colors.text} />
              <Text style={styles.menuText}>{t("account.language")}</Text>
            </View>
            <LanguageSwitcher />
          </View>
          <Text style={styles.helper}>{t("common.current")}: {locale.toUpperCase()}</Text>
          <View style={styles.menuRowNoBorder}>
            <View style={styles.menuLeft}>
              <MaterialCommunityIcons name="theme-light-dark" size={18} color={colors.text} />
              <Text style={styles.menuText}>{t("account.appearance")}</Text>
            </View>
            <ThemeToggleButton />
          </View>
          <Text style={styles.helper}>{mode === "dark" ? t("account.darkMode") : t("account.lightMode")}</Text>
        </View>

        {isSignedIn ? (
          <Pressable
            style={styles.logoutButton}
            onPress={async () => {
              await signOut();
              router.replace("/sign-in");
            }}
          >
            <MaterialCommunityIcons name="logout" size={16} color={colors.primaryText} />
            <Text style={styles.logoutButtonText}>{t("account.signOut")}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <BottomNavBar currentPath={pathname} />
    </SafeAreaView>
  );
}

const createStyles = (colors: {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
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
      marginBottom: 6,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "900",
    },
    subtitle: {
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 20,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 8,
    },
    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 14,
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 2,
    },
    userRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.border,
    },
    avatarImage: {
      width: "100%",
      height: "100%",
      borderRadius: 999,
    },
    userMeta: {
      flex: 1,
    },
    userName: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 16,
    },
    userEmail: {
      color: colors.textSubtle,
      marginTop: 2,
      fontSize: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 16,
    },
    menuRow: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    menuRowNoBorder: {
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    menuLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    menuText: {
      color: colors.text,
      fontWeight: "700",
    },
    helper: {
      color: colors.textSubtle,
      fontSize: 12,
    },
    primaryButton: {
      marginTop: 10,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: "center",
      paddingVertical: 12,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    actionButton: {
      backgroundColor: colors.primary,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      paddingVertical: 12,
    },
    actionButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    logoutButton: {
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
      backgroundColor: "#b42318",
    },
    logoutButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    secondaryButton: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
      paddingVertical: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
  });
