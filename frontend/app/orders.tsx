import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { fetchMyOrders } from "@/lib/orders";
import { getRoleFromUser } from "@/lib/role";
import { OrderSummary } from "@/types/order";

const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
  }).format(value);

export default function OrdersScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { isSignedIn, getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { t, locale } = useLanguage();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const hasLoadedRef = useRef(false);
  const styles = createStyles(colors);

  useEffect(() => {
    if (hasLoadedRef.current && refreshTick === 0) {
      return;
    }

    hasLoadedRef.current = true;

    const loadOrders = async () => {
      if (!isSignedIn) {
        setIsLoading(false);
        setOrders([]);
        return;
      }

      try {
        setErrorMessage(null);
        setIsLoading(true);

        const token = await getToken();
        if (!token) {
          throw new Error("Missing auth token");
        }

        const response = await fetchMyOrders(token);
        setOrders(response.data.items);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load orders.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadOrders();
  }, [isSignedIn, refreshTick]);

  if (isUserLoaded && isSignedIn && getRoleFromUser(user) === "farmer") {
    return <Redirect href="/farmer-dashboard" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
            <Text style={styles.backButtonText}>{t("cart.back")}</Text>
          </Pressable>
          <Text style={styles.title}>{t("orders.title")}</Text>
        </View>

        {!isSignedIn ? (
          <View style={styles.card}>
            <MaterialCommunityIcons name="account-lock-outline" size={24} color={colors.accent} />
            <Text style={styles.emptyText}>{t("orders.signInPrompt")}</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/sign-in") }>
              <Text style={styles.primaryButtonText}>{t("account.signIn")}</Text>
            </Pressable>
          </View>
        ) : isLoading ? (
          <View style={styles.card}>
            <LoadingState title={t("orders.loading")} subtitle={t("orders.empty")} cards={1} compact />
          </View>
        ) : errorMessage ? (
          <View style={styles.card}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable style={styles.secondaryButton} onPress={() => setRefreshTick((value) => value + 1)}>
              <Text style={styles.secondaryButtonText}>{t("common.retry")}</Text>
            </Pressable>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.card}>
            <MaterialCommunityIcons name="package-variant" size={24} color={colors.accent} />
            <Text style={styles.emptyText}>{t("orders.empty")}</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const total = item.items.reduce((sum, row) => sum + row.price * row.quantity, 0);
              const city = item.address?.city ?? "-";

              return (
                <View style={styles.orderCard}>
                  <View style={styles.orderTop}>
                    <Text style={styles.orderId}>#{item.id.slice(-8).toUpperCase()}</Text>
                    <Text style={styles.orderStatus}>{item.status}</Text>
                  </View>
                  <Text style={styles.orderMeta}>{new Date(item.createdAt).toLocaleString()}</Text>
                  <Text style={styles.orderMeta}>{t("orders.items")}: {item.items.length} | {t("orders.city")}: {city}</Text>
                  <Text style={styles.orderTotal}>{formatPrice(total, locale)}</Text>
                </View>
              );
            }}
          />
        )}
      </View>
      <BottomNavBar currentPath={pathname} />
    </SafeAreaView>
  );
}

const createStyles = (colors: {
  background: string;
  surface: string;
  text: string;
  textSubtle: string;
  border: string;
  accent: string;
  surfaceAlt: string;
  primary: string;
  primaryText: string;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      padding: 20,
      paddingBottom: 90,
    },
    listContent: {
      gap: 10,
      paddingTop: 12,
      paddingBottom: 12,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    backButton: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    backButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "900",
    },
    card: {
      marginTop: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
      gap: 8,
      alignItems: "center",
    },
    orderCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 4,
    },
    orderTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    orderId: {
      color: colors.text,
      fontWeight: "800",
    },
    orderStatus: {
      color: colors.accent,
      fontWeight: "800",
      fontSize: 12,
    },
    orderMeta: {
      color: colors.textSubtle,
      fontSize: 12,
    },
    orderTotal: {
      color: colors.text,
      fontWeight: "900",
      marginTop: 4,
    },
    emptyText: {
      color: colors.textSubtle,
      textAlign: "center",
    },
    errorText: {
      color: "#b91c1c",
      textAlign: "center",
    },
    primaryButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    secondaryButton: {
      marginTop: 8,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: colors.surfaceAlt,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
  });
