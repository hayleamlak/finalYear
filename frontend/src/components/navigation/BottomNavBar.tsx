import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/context/ThemeContext";
import { getRoleFromUser } from "@/lib/role";

type BottomNavBarProps = {
  currentPath: string;
  accountActive?: boolean;
  onAccountPress?: () => void;
};

function normalizePath(path: string, isSignedIn: boolean) {
  if (path.startsWith("/product/")) {
    return "/products";
  }

  if (path === "/sign-up") {
    return "/sign-in";
  }

  // Normalize account routes based on auth state
  if (isSignedIn && path === "/sign-in") {
    return "/account";
  }

  if (!isSignedIn && path === "/account") {
    return "/sign-in";
  }

  return path;
}

export function BottomNavBar({ currentPath, accountActive, onAccountPress }: BottomNavBarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const params = useLocalSearchParams<{ tab?: string }>();
  const insets = useSafeAreaInsets();
  const isFarmer = isUserLoaded && getRoleFromUser(user) === "farmer";
  const activePath = normalizePath(currentPath, !!isSignedIn);
  const isFarmerDashboard = isFarmer && activePath === "/farmer-dashboard";
  const farmerTab = params.tab ?? "analytics";
  const accountHref = isSignedIn && isFarmer ? "/farmer-dashboard?tab=account" : isSignedIn ? "/account" : "/sign-in";
  const isAccountActive = accountActive ?? (activePath === "/account" || activePath === "/sign-in" || (isFarmer && farmerTab === "account"));

  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.inner, { marginBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
        {isFarmer ? (
          <>
            <Pressable style={styles.item} onPress={() => router.push("/farmer-dashboard?tab=analytics") }>
              <MaterialCommunityIcons
                name="chart-line"
                size={20}
                color={farmerTab === "analytics" ? colors.accent : colors.textSubtle}
              />
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.label, farmerTab === "analytics" && styles.labelActive]}>Analytics</Text>
            </Pressable>
            <Pressable style={styles.item} onPress={() => router.push("/farmer-dashboard?tab=products") }>
              <MaterialCommunityIcons
                name="package-variant-closed"
                size={20}
                color={farmerTab === "products" ? colors.accent : colors.textSubtle}
              />
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.label, farmerTab === "products" && styles.labelActive]}>My Product</Text>
            </Pressable>
            <Pressable style={styles.item} onPress={() => router.push("/farmer-dashboard?tab=orders") }>
              <MaterialCommunityIcons
                name="clipboard-list-outline"
                size={20}
                color={farmerTab === "orders" ? colors.accent : colors.textSubtle}
              />
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.label, farmerTab === "orders" && styles.labelActive]}>Order</Text>
            </Pressable>
            <Pressable style={styles.item} onPress={() => router.push("/farmer-dashboard?tab=add") }>
              <MaterialCommunityIcons
                name="plus-circle-outline"
                size={20}
                color={farmerTab === "add" ? colors.accent : colors.textSubtle}
              />
              <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.label, farmerTab === "add" && styles.labelActive]}>Add Product</Text>
            </Pressable>
          </>
        ) : (
          <Pressable style={styles.item} onPress={() => router.push("/products") }>
            <MaterialCommunityIcons
              name="storefront-outline"
              size={20}
              color={activePath === "/products" ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, activePath === "/products" && styles.labelActive]}>Products</Text>
          </Pressable>
        )}
        {isFarmer ? null : (
          <Pressable style={styles.item} onPress={() => router.push("/cart") }>
            <MaterialCommunityIcons
              name="cart-outline"
              size={20}
              color={activePath === "/cart" ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, activePath === "/cart" && styles.labelActive]}>Cart</Text>
          </Pressable>
        )}
        <Pressable style={styles.item} onPress={() => {
          if (onAccountPress) {
            onAccountPress();
            return;
          }

          router.push(accountHref);
        } }>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={20}
            color={isAccountActive ? colors.accent : colors.textSubtle}
          />
          <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.label, isAccountActive && styles.labelActive]}>Account</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: {
  background: string;
  surface: string;
  textSubtle: string;
  text: string;
  border: string;
  accentSoft: string;
  accent: string;
}) =>
  StyleSheet.create({
    wrapper: {
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 16,
      paddingBottom: 12,
      paddingTop: 6,
      backgroundColor: "transparent",
      zIndex: 9999,
      elevation: 24,
      pointerEvents: "box-none",
    },
    inner: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      minHeight: 64,
      paddingVertical: 6,
      paddingHorizontal: 4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    item: {
      flex: 1,
      minWidth: 0,
      paddingVertical: 8,
      paddingHorizontal: 4,
      borderRadius: 12,
      alignItems: "center",
      gap: 4,
    },
    label: {
      color: colors.textSubtle,
      fontWeight: "700",
      fontSize: 10,
      textAlign: "center",
      flexShrink: 1,
      width: "100%",
    },
    labelActive: {
      color: colors.accent,
      backgroundColor: colors.accentSoft,
      paddingHorizontal: 6,
      paddingVertical: 3,
      borderRadius: 10,
      overflow: "hidden",
    },
  });