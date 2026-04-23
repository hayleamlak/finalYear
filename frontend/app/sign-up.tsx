import { useAuth, useSignUp, useSSO, useUser } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { usePathname, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { RolePicker } from "@/components/auth/RolePicker";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { useTheme } from "@/context/ThemeContext";
import { AppRole, dashboardForRole } from "@/lib/role";

export default function SignUpScreen() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<AppRole>("buyer");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onSignUpPress = async () => {
    if (!isLoaded || isSubmitting) {
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
        unsafeMetadata: {
          role: selectedRole,
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setIsVerifying(true);
    } catch (error: any) {
      setErrorMessage(error?.errors?.[0]?.longMessage ?? error?.message ?? "Unable to create account.");
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

  const onVerifyPress = async () => {
    if (!isLoaded || isSubmitting) {
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const result = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace(dashboardForRole(selectedRole));
        return;
      }

      setErrorMessage("Verification requires additional steps that are not implemented on this screen.");
    } catch (error: any) {
      setErrorMessage(error?.errors?.[0]?.longMessage ?? error?.message ?? "Unable to verify code.");
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
      <Text style={styles.title}>Create account</Text>

      {!isVerifying ? (
        <>
          <RolePicker value={selectedRole} onChange={setSelectedRole} colors={colors} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSubtle}
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSubtle}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Text style={styles.helper}>Use at least 6 characters.</Text>
          <Pressable style={styles.button} onPress={onSignUpPress} disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Create account</Text>}
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={onGooglePress} disabled={isSubmitting || !isLoaded}>
            <Text style={styles.secondaryButtonText}>Continue with Google</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.helper}>Enter the verification code sent to your email.</Text>
          <TextInput
            style={styles.input}
            placeholder="Verification code"
            placeholderTextColor={colors.textSubtle}
            keyboardType="number-pad"
            value={code}
            onChangeText={setCode}
          />
          <Pressable style={styles.button} onPress={onVerifyPress} disabled={isSubmitting || !isLoaded}>
            {isSubmitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Verify code</Text>}
          </Pressable>
        </>
      )}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      <Pressable onPress={() => router.push("/sign-in")}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </Pressable>

      <BottomNavBar currentPath={pathname} />
    </View>
  );
}

const createStyles = (colors: {
  background: string;
  text: string;
  textMuted: string;
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
    helper: {
      color: colors.textMuted,
      marginBottom: 8,
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
      marginTop: 10,
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
