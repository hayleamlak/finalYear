import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@clerk/clerk-expo";
import { Redirect, usePathname, useRouter } from "expo-router";
import { FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
  }).format(value);

export default function CartScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { t, locale, getCountLabel } = useLanguage();
  const { isLoaded, isSignedIn } = useAuth();
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const styles = createStyles(colors);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <LoadingState title={t("cart.title")} subtitle={t("cart.emptyText")} cards={1} compact />
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={18} color={colors.text} />
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </Pressable>
          <View style={styles.titleWrap}>
            <MaterialCommunityIcons name="cart-outline" size={22} color={colors.text} />
            <Text style={styles.title}>{t("cart.title")}</Text>
          </View>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{getCountLabel(itemCount)}</Text>
          </View>
        </View>
        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t("cart.emptyTitle")}</Text>
            <Text style={styles.emptyText}>{t("cart.emptyText")}</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/products") }>
              <MaterialCommunityIcons name="storefront-outline" size={18} color={colors.primaryText} />
              <Text style={styles.primaryButtonText}>{t("cart.browseProducts")}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FlatList
              data={items}
              keyExtractor={(item) => item.product.id}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.cartItem}>
                  <Image source={{ uri: item.product.image }} style={styles.image} />

                  <View style={styles.itemBody}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {item.product.product_name}
                    </Text>
                    <Text style={styles.productPrice}>{formatPrice(item.product.price, locale)}</Text>
                    <Text style={styles.productMeta}>{t("common.stock")}: {item.product.stock}</Text>

                    <View style={styles.controlsRow}>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <MaterialCommunityIcons name="minus" size={18} color={colors.text} />
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <MaterialCommunityIcons name="plus" size={18} color={colors.text} />
                      </Pressable>

                      <Pressable style={styles.removeButton} onPress={() => removeItem(item.product.id)}>
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color="#fca5a5" />
                        <Text style={styles.removeButtonText}>{t("common.remove")}</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            />

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("common.subtotal")}</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal, locale)}</Text>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => router.push("/checkout") }>
                <MaterialCommunityIcons name="credit-card-outline" size={18} color={colors.primaryText} />
                <Text style={styles.primaryButtonText}>{t("cart.checkout")}</Text>
              </Pressable>

              <Pressable style={styles.secondaryButton} onPress={() => router.push("/products") }>
                <MaterialCommunityIcons name="shopping-outline" size={18} color={colors.text} />
                <Text style={styles.secondaryButtonText}>{t("common.continueShopping")}</Text>
              </Pressable>

              <Pressable style={styles.ghostButton} onPress={clearCart}>
                <MaterialCommunityIcons name="cart-remove" size={18} color={colors.textSubtle} />
                <Text style={styles.ghostButtonText}>{t("cart.clearCart")}</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
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
  textSubtle: string;
  border: string;
  primary: string;
  primaryText: string;
  accent: string;
  accentSoft: string;
  dangerSoft: string;
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
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countPill: {
    backgroundColor: colors.accentSoft,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  countPillText: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 12,
  },
  emptyCard: {
    marginTop: 24,
    backgroundColor: colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 8,
    marginBottom: 14,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  image: {
    width: 96,
    height: 96,
    backgroundColor: colors.surfaceAlt,
  },
  itemBody: {
    flex: 1,
    padding: 12,
  },
  productName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  productPrice: {
    color: colors.accent,
    marginTop: 4,
    fontWeight: "800",
  },
  productMeta: {
    color: colors.textSubtle,
    marginTop: 4,
    fontSize: 12,
  },
  controlsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  qtyButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: {
    color: colors.text,
    fontWeight: "900",
  },
  qtyValue: {
    color: colors.text,
    minWidth: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  removeButton: {
    marginLeft: "auto",
    backgroundColor: colors.dangerSoft,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  removeButtonText: {
    color: "#fca5a5",
    fontWeight: "700",
    fontSize: 12,
  },
  summaryCard: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  summaryLabel: {
    color: colors.textSubtle,
    fontSize: 14,
    fontWeight: "600",
  },
  summaryValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "800",
  },
  ghostButton: {
    alignItems: "center",
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  ghostButtonText: {
    color: colors.textSubtle,
    fontWeight: "700",
  },
});
