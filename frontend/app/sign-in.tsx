import { useAuth, useSSO, useSignIn } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { Redirect } from "expo-router";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export default function SignInScreen() {
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { startSSOFlow } = useSSO();
  const router = useRouter();
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
        router.replace("/");
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

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign in</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={identifier}
        onChangeText={setIdentifier}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
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
    marginBottom: 10,
  },
  link: {
    marginTop: 16,
    color: "#0f172a",
    textAlign: "center",
    fontWeight: "600",
  },
});
