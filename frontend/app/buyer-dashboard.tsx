import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, usePathname, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/lib/api";
import { getRoleFromUser } from "@/lib/role";
import { ProductListResponse, ProductSummary } from "@/types/product";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(value);

export default function BuyerDashboardScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const { addItem, getQuantityForProduct, itemCount } = useCart();
  const { colors } = useTheme();
  const { t, locale } = useLanguage();
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const styles = createStyles(colors);
  const role = getRoleFromUser(user);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setErrorMessage(null);
        setIsLoading(true);

        const response = await apiFetch<ProductListResponse>("/api/v1/products?page=1&limit=50");
        setProducts(response.data.items);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  if (role !== "buyer") {
    return <Redirect href="/farmer-dashboard" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.container}
        removeClippedSubviews={false}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>Buyer Marketplace</Text>
                <Text style={styles.subtitle}>farmer uploads will appear here for you to browse and purchase from.</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoText}>Products: {products.length}</Text>
              <Pressable style={styles.cartPill} onPress={() => router.push("/cart") }>
                <Text style={styles.cartPillText}>{t("nav.cart")}: {itemCount}</Text>
              </Pressable>
            </View>

            {isLoading ? (
              <View style={styles.centerCard}>
                <ActivityIndicator color={colors.accent} />
                <Text style={styles.helperText}>Loading products...</Text>
              </View>
            ) : null}

            {!isLoading && errorMessage ? (
              <View style={styles.centerCard}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {!isLoading && !errorMessage && products.length === 0 ? (
              <View style={styles.centerCard}>
                <Text style={styles.helperText}>No products yet. Farmer uploads will appear here.</Text>
              </View>
            ) : null}
          </View>
        }
        renderItem={({ item }) => {
          const qtyInCart = getQuantityForProduct(item.id);

          return (
            <View style={styles.productCard}>
              <Image source={{ uri: item.image }} style={styles.productImage} />
              <View style={styles.productBody}>
                <Text style={styles.productName} numberOfLines={1}>{item.product_name}</Text>
                <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
                <Text style={styles.productMeta}>Stock: {item.stock}</Text>

                <View style={styles.actionRow}>
                  <Pressable
                    style={styles.secondaryAction}
                    onPress={() => router.push({ pathname: "/product/[productId]", params: { productId: item.id } })}
                  >
                    <Text style={styles.secondaryActionText}>View</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryAction}
                    onPress={() => addItem(item, 1)}
                    disabled={item.stock <= 0}
                  >
                    <Text style={styles.primaryActionText}>{item.stock <= 0 ? "Sold out" : "Add to cart"}</Text>
                  </Pressable>
                </View>

                {qtyInCart > 0 ? <Text style={styles.inCartText}>In cart: {qtyInCart}</Text> : null}
              </View>
            </View>
          );
        }}
      />
      <BottomNavBar currentPath={pathname} />
    </SafeAreaView>
  );
}

const createStyles = (colors: {
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 20,
      paddingBottom: 110,
      gap: 12,
    },
    headerWrap: {
      gap: 12,
    },
    headerRow: {
      marginBottom: 4,
      gap: 12,
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: "900",
    },
    subtitle: {
      color: colors.textMuted,
      marginTop: 4,
      lineHeight: 20,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    infoText: {
      color: colors.textMuted,
      fontWeight: "700",
    },
    cartPill: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      backgroundColor: colors.surface,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    cartPillText: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 12,
    },
    centerCard: {
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      alignItems: "center",
      gap: 8,
    },
    helperText: {
      color: colors.textMuted,
      textAlign: "center",
    },
    errorText: {
      color: "#b91c1c",
      textAlign: "center",
    },
    productCard: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      overflow: "hidden",
    },
    productImage: {
      height: 170,
      width: "100%",
      backgroundColor: colors.surfaceAlt,
    },
    productBody: {
      padding: 12,
      gap: 4,
    },
    productName: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 16,
    },
    productPrice: {
      color: colors.accent,
      fontWeight: "800",
    },
    productMeta: {
      color: colors.textMuted,
      fontSize: 12,
    },
    actionRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: 8,
      minHeight: 40,
      alignItems: "stretch",
    },
    primaryAction: {
      flex: 1,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      minHeight: 40,
    },
    primaryActionText: {
      color: "#ffffff",
      fontWeight: "800",
      fontSize: 12,
    },
    secondaryAction: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 10,
      minHeight: 40,
    },
    secondaryActionText: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 12,
    },
    inCartText: {
      color: colors.textMuted,
      fontSize: 12,
      marginTop: 4,
      textTransform: "uppercase",
    },
  });
