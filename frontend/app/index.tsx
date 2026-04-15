import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { Text, View, Pressable, StyleSheet } from "react-native";

export default function HomeScreen() {
  const { signOut, isSignedIn } = useAuth();

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expo frontend is ready</Text>
      <Text style={styles.subtitle}>Clerk auth is wired. Next step: connect your backend API.</Text>
      <Pressable style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#0f172a",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: "#cbd5e1",
    textAlign: "center",
    maxWidth: 320,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: {
    color: "#111827",
    fontWeight: "700",
  },
});
