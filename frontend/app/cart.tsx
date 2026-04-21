import { usePathname, useRouter } from "expo-router";
import { FlatList, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";

const formatPrice = (value: number) => new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(value);

export default function CartScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>My cart</Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{itemCount} items</Text>
          </View>
        </View>
        <View style={styles.toggleRow}>
          <ThemeToggleButton />
        </View>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>Browse products and tap Add to cart.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/products") }>
              <Text style={styles.primaryButtonText}>Browse products</Text>
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
                    <Text style={styles.productPrice}>{formatPrice(item.product.price)}</Text>
                    <Text style={styles.productMeta}>Stock: {item.product.stock}</Text>

                    <View style={styles.controlsRow}>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </Pressable>
                      <Text style={styles.qtyValue}>{item.quantity}</Text>
                      <Pressable
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </Pressable>

                      <Pressable style={styles.removeButton} onPress={() => removeItem(item.product.id)}>
                        <Text style={styles.removeButtonText}>Remove</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              )}
            />

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>

              <Pressable style={styles.primaryButton} onPress={() => router.push("/products") }>
                <Text style={styles.primaryButtonText}>Continue shopping</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={clearCart}>
                <Text style={styles.secondaryButtonText}>Clear cart</Text>
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
  },
  backButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  toggleRow: {
    marginTop: 10,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
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
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "800",
  },
});
