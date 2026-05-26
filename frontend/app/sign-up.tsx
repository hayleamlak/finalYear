import { useAuth, useSignUp } from "@clerk/clerk-expo";
import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from "react-native";

import { RolePicker } from "@/components/auth/RolePicker";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { AppRole, dashboardForRole } from "@/lib/role";

export default function SignUpScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [selectedRole, setSelectedRole] = useState<AppRole>("buyer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  const onCreateAccount = async () => {
    if (!isLoaded || isSubmitting) {
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const result = await signUp.create({
        emailAddress: identifier.trim(),
        password,
        unsafeMetadata: {
          role: selectedRole,
        },
      });

      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.replace(dashboardForRole(selectedRole));
        return;
      }

      setErrorMessage(t("auth.signUpIncomplete"));
    } catch (error: any) {
      setErrorMessage(error?.errors?.[0]?.longMessage ?? error?.message ?? t("auth.signInFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.decorTop} />
        <View style={styles.decorBottom} />

        <View style={styles.heroCard}>
          <Text style={styles.kicker}>{t("auth.createAccount")}</Text>
          <Text style={styles.heroTitle}>{t("auth.createAccount")}</Text>
          <Text style={styles.heroText}>{t("auth.signUpHint")}</Text>

          <RolePicker value={selectedRole} onChange={setSelectedRole} colors={colors} />

          <TextInput
            style={styles.input}
            placeholder={t("auth.email")}
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            keyboardType="email-address"
            value={identifier}
            onChangeText={setIdentifier}
          />
          <TextInput
            style={styles.input}
            placeholder={t("auth.password")}
            placeholderTextColor={colors.textSubtle}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <LoadingButton
            title={t("auth.createAccount")}
            loading={isSubmitting}
            disabled={!isLoaded}
            onPress={() => void onCreateAccount()}
            backgroundColor={colors.primary}
            textColor={colors.primaryText}
            spinnerColor={colors.primaryText}
            style={styles.primaryButton}
          />

          <Pressable onPress={() => router.replace("/sign-in") }>
            <Text style={styles.link}>{t("auth.signInTitle")}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: {
  background: string;
  text: string;
  textSubtle: string;
  border: string;
  primary: string;
  primaryText: string;
  surface: string;
  dangerSoft: string;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: colors.background,
      overflow: "hidden",
    },
    decorTop: {
      position: "absolute",
      top: -90,
      right: -70,
      width: 210,
      height: 210,
      borderRadius: 999,
      backgroundColor: colors.primary,
      opacity: 0.08,
    },
    decorBottom: {
      position: "absolute",
      left: -90,
      bottom: -110,
      width: 240,
      height: 240,
      borderRadius: 999,
      backgroundColor: colors.surface,
      opacity: 0.95,
    },
    heroCard: {
      backgroundColor: colors.surface,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 20,
      shadowColor: "#000",
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 14 },
      elevation: 4,
    },
    kicker: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      marginBottom: 6,
    },
    heroTitle: {
      fontSize: 30,
      fontWeight: "900",
      color: colors.text,
      lineHeight: 34,
    },
    heroText: {
      color: colors.textSubtle,
      marginTop: 10,
      marginBottom: 18,
      lineHeight: 22,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 12,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    error: {
      color: "#b91c1c",
      marginBottom: 10,
      backgroundColor: colors.dangerSoft,
      padding: 8,
      borderRadius: 8,
    },
    primaryButton: {
      marginTop: 4,
    },
    link: {
      marginTop: 16,
      color: colors.text,
      textAlign: "center",
      fontWeight: "600",
      textDecorationLine: "underline",
    },
  });