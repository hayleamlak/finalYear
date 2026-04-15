import { SignUp } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { View, StyleSheet } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

export default function SignUpScreen() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return (
    <View style={styles.container}>
      <SignUp routing="path" path="/sign-up" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
});
