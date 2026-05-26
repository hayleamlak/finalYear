import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

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
  const isFarmer = isUserLoaded && getRoleFromUser(user) === "farmer";
  const activePath = normalizePath(currentPath, !!isSignedIn);
  const accountHref = isSignedIn && isFarmer ? "/farmer-dashboard?tab=profile" : isSignedIn ? "/account" : "/sign-in";
  const isAccountActive = accountActive ?? (activePath === "/account" || activePath === "/sign-in" || (isFarmer && activePath === "/farmer-dashboard"));
  const isProductsTabActive = isFarmer && activePath === "/farmer-dashboard" && params.tab === "products";

  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <View style={styles.inner}>
        <Pressable style={styles.item} onPress={() => router.push("/products") }>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={20}
            color={activePath === "/products" ? colors.accent : colors.textSubtle}
          />
          <Text style={[styles.label, activePath === "/products" && styles.labelActive]}>Products</Text>
        </Pressable>
        {isFarmer ? (
          <Pressable style={styles.item} onPress={() => router.push("/farmer-dashboard?tab=products") }>
            <MaterialCommunityIcons
              name="plus-circle-outline"
              size={20}
              color={isProductsTabActive ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, isProductsTabActive && styles.labelActive]}>Add Product</Text>
          </Pressable>
        ) : (
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
          <Text style={[styles.label, isAccountActive && styles.labelActive]}>Account</Text>
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
    },
    inner: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      minHeight: 58,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 6,
    },
    item: {
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 12,
      alignItems: "center",
      gap: 4,
    },
    label: {
      color: colors.textSubtle,
      fontWeight: "700",
      fontSize: 13,
    },
    labelActive: {
      color: colors.accent,
      backgroundColor: colors.accentSoft,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
      overflow: "hidden",
    },
  });