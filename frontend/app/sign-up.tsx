import { useAuth, useSignUp, useSSO } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignUpScreen() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
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
        router.replace("/");
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
        router.replace("/");
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>

      {!isVerifying ? (
        <>
          <TextInput
            style={styles.input}
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={emailAddress}
            onChangeText={setEmailAddress}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 4,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 16,
  },
  helper: {
    color: "#334155",
    marginBottom: 8,
  },
  secondaryButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#b91c1c",
    marginTop: 10,
  },
  link: {
    marginTop: 16,
    color: "#0f172a",
    textAlign: "center",
    fontWeight: "600",
  },
});
