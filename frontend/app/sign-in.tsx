import { SignIn } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function SignInScreen() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <SignIn routing="path" path="/sign-in" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
