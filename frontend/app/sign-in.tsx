import { useAuth, useSSO, useSignIn, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { RolePicker } from "@/components/auth/RolePicker";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { useTheme } from "@/context/ThemeContext";
import { AppRole, dashboardForRole, getRoleFromUser } from "@/lib/role";

export default function SignInScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole>("buyer");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setErrorMessage("Sign-in requires additional steps that are not implemented on this screen.");
    } catch (error: any) {
      setErrorMessage(error?.errors?.[0]?.longMessage ?? error?.message ?? "Unable to sign in.");
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
        redirectUrl: Linking.createURL("/"),
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

      setErrorMessage("Google sign-in could not be completed.");
    } catch (error: any) {
      setErrorMessage(error?.errors?.[0]?.longMessage ?? error?.message ?? "Unable to sign in with Google.");
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
      <ThemeToggleButton />
      <Text style={styles.title}>Sign in</Text>
      <RolePicker value={selectedRole} onChange={setSelectedRole} colors={colors} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.textSubtle}
        autoCapitalize="none"
        keyboardType="email-address"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={colors.textSubtle}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable style={styles.button} onPress={onSignInPress} disabled={isSubmitting || !isLoaded}>
        {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Continue</Text>}
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={onGooglePress} disabled={isSubmitting || !isLoaded}>
        <Text style={styles.secondaryButtonText}>Continue with Google</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/sign-up")}>
        <Text style={styles.link}>Create an account</Text>
      </Pressable>

      <BottomNavBar currentPath={pathname} />
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
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      marginBottom: 12,
      backgroundColor: colors.surface,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: "center",
      paddingVertical: 14,
      marginTop: 4,
    },
    buttonText: {
      color: colors.primaryText,
      fontWeight: "700",
      fontSize: 16,
    },
    secondaryButton: {
      marginTop: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      paddingVertical: 14,
      backgroundColor: colors.surface,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 16,
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
