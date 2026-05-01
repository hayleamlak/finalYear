import { useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { getRoleFromUser } from "@/lib/role";

type BottomNavBarProps = {
  currentPath: string;
};

type FarmerTab = "overview" | "products" | "orders" | "earnings" | "profile";

function normalizePath(path: string) {
  if (path.startsWith("/product/")) {
    return "/products";
  }

  if (path === "/buyer-dashboard") {
    return "/buyer-dashboard";
  }

  if (path === "/farmer-dashboard") {
    return "/farmer-dashboard";
  }

  if (path === "/sign-up" || path === "/sign-in" || path === "/profile") {
    return "/account";
  }

  return path;
}

export function BottomNavBar({ currentPath }: BottomNavBarProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ tab?: FarmerTab }>();
  const { user } = useUser();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const { itemCount } = useCart();
  const role = getRoleFromUser(user);
  const activePath = normalizePath(currentPath);

  const styles = createStyles(colors);
  const isFarmer = role === "farmer";
  const activeFarmerTab = activePath === "/farmer-dashboard" ? params.tab ?? "overview" : "overview";
  const goToFarmerTab = (tab: FarmerTab) => {
    if (activePath === "/farmer-dashboard") {
      router.setParams({ tab });
      return;
    }

    router.replace("/farmer-dashboard");
  };

  if (isFarmer) {
    return (
      <View style={styles.wrapper}>
        <View style={styles.inner}>
          <Pressable style={styles.item} onPress={() => goToFarmerTab("overview")}>
            <MaterialCommunityIcons
              name="view-dashboard-outline"
              size={20}
              color={activeFarmerTab === "overview" ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, activeFarmerTab === "overview" && styles.labelActive]}>Farm</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => goToFarmerTab("products")}>
            <MaterialCommunityIcons
              name="package-variant-closed"
              size={20}
              color={activeFarmerTab === "products" ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, activeFarmerTab === "products" && styles.labelActive]}>Products</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => goToFarmerTab("orders")}>
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={20}
              color={activeFarmerTab === "orders" ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, activeFarmerTab === "orders" && styles.labelActive]}>Orders</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => goToFarmerTab("earnings")}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={20}
              color={activeFarmerTab === "earnings" ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, activeFarmerTab === "earnings" && styles.labelActive]}>Earnings</Text>
          </Pressable>
          <Pressable style={styles.item} onPress={() => goToFarmerTab("profile")}>
            <MaterialCommunityIcons
              name="account-circle-outline"
              size={20}
              color={activeFarmerTab === "profile" ? colors.accent : colors.textSubtle}
            />
            <Text style={[styles.label, activeFarmerTab === "profile" && styles.labelActive]}>Profile</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.inner}>
        <Pressable style={styles.item} onPress={() => router.push("/buyer-dashboard") }>
          <MaterialCommunityIcons
            name="view-dashboard-outline"
            size={20}
            color={activePath === "/buyer-dashboard" ? colors.accent : colors.textSubtle}
          />
          <Text style={[styles.label, activePath === "/buyer-dashboard" && styles.labelActive]}>Buyer</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push("/products") }>
          <MaterialCommunityIcons
            name="storefront-outline"
            size={20}
            color={activePath === "/products" ? colors.accent : colors.textSubtle}
          />
          <Text style={[styles.label, activePath === "/products" && styles.labelActive]}>{t("nav.products")}</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push("/cart") }>
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="cart-outline"
              size={20}
              color={activePath === "/cart" ? colors.accent : colors.textSubtle}
            />
            {itemCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{itemCount > 99 ? "99+" : itemCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.label, activePath === "/cart" && styles.labelActive]}>{t("nav.cart")}</Text>
        </Pressable>

        <Pressable style={styles.item} onPress={() => router.push("/account") }>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={20}
            color={activePath === "/account" ? colors.accent : colors.textSubtle}
          />
          <Text style={[styles.label, activePath === "/account" && styles.labelActive]}>{t("nav.account")}</Text>
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
    iconWrap: {
      position: "relative",
      width: 22,
      height: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    cartBadge: {
      position: "absolute",
      top: -8,
      right: -12,
      minWidth: 18,
      height: 18,
      borderRadius: 999,
      backgroundColor: "#dc2626",
      borderWidth: 1,
      borderColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 4,
    },
    cartBadgeText: {
      color: "#ffffff",
      fontSize: 10,
      fontWeight: "800",
      lineHeight: 12,
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
