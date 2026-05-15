import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useTheme } from "@/context/ThemeContext";

type BottomNavBarProps = {
  currentPath: string;
};

function normalizePath(path: string) {
  if (path.startsWith("/product/")) {
    return "/products";
  }

  if (path === "/sign-up") {
    return "/sign-in";
  }

  return path;
}

export function BottomNavBar({ currentPath }: BottomNavBarProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const activePath = normalizePath(currentPath);

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
        <Pressable style={styles.item} onPress={() => router.push("/cart") }>
          <MaterialCommunityIcons
            name="cart-outline"
            size={20}
            color={activePath === "/cart" ? colors.accent : colors.textSubtle}
          />
          <Text style={[styles.label, activePath === "/cart" && styles.labelActive]}>Cart</Text>
        </Pressable>
        <Pressable style={styles.item} onPress={() => router.push("/sign-in") }>
          <MaterialCommunityIcons
            name="account-circle-outline"
            size={20}
            color={activePath === "/sign-in" ? colors.accent : colors.textSubtle}
          />
          <Text style={[styles.label, activePath === "/sign-in" && styles.labelActive]}>Account</Text>
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