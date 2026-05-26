import { useAuth, useSSO, useSignIn, useUser } from "@clerk/clerk-expo";
import { makeRedirectUri } from "expo-auth-session";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { RolePicker } from "@/components/auth/RolePicker";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { AppRole, dashboardForRole, getRoleFromUser } from "@/lib/role";

export default function SignInScreen() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole>("buyer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const googleRedirectUrl = makeRedirectUri({ scheme: "fypfrontend", path: "sign-in" });

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    const logToken = async () => {
      try {
        const token = await getToken();
        console.log("🔥 Clerk token:", token);

        if (!token) {
          console.warn("[DEBUG] Clerk returned no token yet.");
          return;
        }

        fetch("http://localhost:4000/api/v1/auth/debug-token", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((r) => r.json())
          .then((d) => console.log("[DEBUG] backend response:", d))
          .catch((err) => console.warn("[DEBUG] backend fetch error:", err));
      } catch (err) {
        console.warn("[DEBUG] getToken failed:", err);
      }
    };

    void logToken();
  }, [getToken, isSignedIn]);

  const onSignInPress = async () => {
    if (!isLoaded || isSubmitting) {
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        const existingRole = getRoleFromUser(user);

        if (user && existingRole !== selectedRole) {
          setErrorMessage(`This account is registered as ${existingRole}. Please choose ${existingRole} to continue.`);
          return;
        }

        if (user) {
          await user.update({
            unsafeMetadata: {
              ...(user.unsafeMetadata ?? {}),
              role: selectedRole,
            },
          });
        }

        router.replace(dashboardForRole(selectedRole));
        return;
      }

      setErrorMessage(t("auth.signInIncomplete"));
    } catch (error: any) {
      setErrorMessage(error?.errors?.[0]?.longMessage ?? error?.message ?? t("auth.signInFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGooglePress = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const { createdSessionId, setActive: setActiveFromSSO } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: googleRedirectUrl,
        unsafeMetadata: {
          role: selectedRole,
        },
      });

      if (createdSessionId && setActiveFromSSO) {
        await setActiveFromSSO({ session: createdSessionId });

        if (user) {
          await user.update({
            unsafeMetadata: {
              ...(user.unsafeMetadata ?? {}),
              role: selectedRole,
            },
          });
        }

        router.replace(dashboardForRole(selectedRole));
        return;
      }

      setErrorMessage(t("auth.googleFailed"));
    } catch (error: any) {
      setErrorMessage(error?.errors?.[0]?.longMessage ?? error?.message ?? t("auth.googleFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      <View style={styles.heroCard}>
        <Text style={styles.kicker}>{t("auth.signInTitle")}</Text>
        <Text style={styles.heroTitle}>{t("auth.signInTitle")}</Text>
        <Text style={styles.heroText}>{t("auth.signInHint")}</Text>

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
          title={t("auth.continue")}
          loading={isSubmitting}
          disabled={!isLoaded}
          onPress={() => void onSignInPress()}
          backgroundColor={colors.primary}
          textColor={colors.primaryText}
          spinnerColor={colors.primaryText}
          style={styles.button}
        />

        <LoadingButton
          title={t("auth.continueWithGoogle")}
          loading={isSubmitting}
          disabled={!isLoaded}
          onPress={() => void onGooglePress()}
          backgroundColor={colors.surface}
          textColor={colors.text}
          spinnerColor={colors.text}
          style={styles.secondaryButton}
        />

        <Pressable onPress={() => router.push("/sign-up" as never)}>
          <Text style={styles.link}>{t("auth.createAccount")}</Text>
        </Pressable>
      </View>
    </View>
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
    container: {
      flex: 1,
      justifyContent: "center",
      padding: 24,
      paddingBottom: 110,
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
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 18,
      marginTop: 14,
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
    button: {
      marginTop: 4,
    },
    secondaryButton: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    error: {
      color: "#b91c1c",
      marginBottom: 10,
      backgroundColor: colors.dangerSoft,
      padding: 8,
      borderRadius: 8,
    },
    link: {
      marginTop: 16,
      color: colors.text,
      textAlign: "center",
      fontWeight: "600",
    },
  });
