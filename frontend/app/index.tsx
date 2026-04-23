import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

import { dashboardForRole, getRoleFromUser } from "@/lib/role";
import { useTheme } from "@/context/ThemeContext";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { colors } = useTheme();

  if (!isLoaded || !isUserLoaded) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const role = getRoleFromUser(user);
  return <Redirect href={dashboardForRole(role)} />;
}
