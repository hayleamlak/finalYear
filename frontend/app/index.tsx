import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

import { dashboardForRole, getRoleFromUser } from "@/lib/role";
import { useTheme } from "@/context/ThemeContext";

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { colors } = useTheme();

  if (!isLoaded || !isUserLoaded) {
    return (
      <View style={styles.splashRoot}>
        <View style={styles.topDecor} />
        <View style={styles.bottomDecor} />
        <View style={styles.centerBlock}>
          <View style={styles.logoRing}>
            <View style={styles.logoInnerRing} />
            <MaterialCommunityIcons name="coffee-outline" size={42} color="#6b8d4c" />
          </View>
          <Text style={styles.title}>GREEN COFFEE</Text>
          <Text style={styles.title}>ECOMMERCE</Text>
          <Text style={styles.tagline}>Purely Sourced, Roasted for You</Text>
        </View>

        <View style={styles.loadingSection}>
          <MaterialCommunityIcons name="coffee" size={18} color="#7a8d61" />
          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.footerText}>© 2024 Green Coffee Ecommerce</Text>
          <Text style={styles.footerSubtext}>Verifying Products...</Text>
        </View>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const role = getRoleFromUser(user);
  return <Redirect href={dashboardForRole(role)} />;
}

const styles = StyleSheet.create({
  splashRoot: {
    flex: 1,
    backgroundColor: "#f5efd9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  topDecor: {
    position: "absolute",
    top: -120,
    right: -90,
    width: 260,
    height: 260,
    borderRadius: 260,
    borderWidth: 1,
    borderColor: "rgba(142, 164, 116, 0.12)",
    opacity: 0.9,
  },
  bottomDecor: {
    position: "absolute",
    left: -120,
    bottom: -100,
    width: 260,
    height: 260,
    borderRadius: 260,
    borderWidth: 1,
    borderColor: "rgba(142, 164, 116, 0.12)",
    opacity: 0.9,
  },
  centerBlock: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: -20,
  },
  logoRing: {
    width: 92,
    height: 92,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#78905a",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.28)",
  },
  logoInnerRing: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(120, 144, 90, 0.75)",
  },
  title: {
    color: "#163021",
    fontSize: 28,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  tagline: {
    marginTop: 4,
    color: "#40543b",
    fontSize: 16,
    textAlign: "center",
  },
  loadingSection: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 56,
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#91a27a",
    backgroundColor: "rgba(255,255,255,0.55)",
    padding: 2,
    overflow: "hidden",
  },
  progressFill: {
    width: "72%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#8aa36b",
  },
  footerText: {
    color: "#7d8571",
    fontSize: 13,
    textAlign: "center",
  },
  footerSubtext: {
    color: "#7d8571",
    fontSize: 12,
    textAlign: "center",
  },
});
