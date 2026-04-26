import { usePathname, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "@clerk/clerk-expo";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/lib/api";

type PaymentMethod = "cash" | "card";

const DELIVERY_FEE = 150;
const SERVICE_FEE = 40;

const formatPrice = (value: number) => new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(value);

export default function CheckoutScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const { items, itemCount, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [isPaying, setIsPaying] = useState(false);

  const total = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }

    return subtotal + DELIVERY_FEE + SERVICE_FEE;
  }, [items.length, subtotal]);

  const onPlaceOrder = async () => {
    if (items.length === 0) {
      Alert.alert("Cart is empty", "Add products before checkout.");
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      Alert.alert("Missing details", "Please fill in your name, phone, address, and city.");
      return;
    }

    if (isPaying) {
      return;
    }

    if (paymentMethod === "cash") {
      Alert.alert(
        "Order placed",
        `Thanks, ${fullName.trim()}!\nTotal: ${formatPrice(total)}\nPayment: Cash on delivery`,
        [
          {
            text: "OK",
            onPress: () => {
              clearCart();
              router.push("/products");
            },
          },
        ],
      );
      return;
    }

    try {
      setIsPaying(true);

      const token = await getToken();
      if (!token) {
        throw new Error("Please sign in before checkout.");
      }

      const appReturnUrl = Linking.createURL("/payment/chapa-return");

      const initResponse = await apiFetch<{
        success: boolean;
        data: { checkout_url: string; tx_ref: string; payment_id: string };
      }>("/api/v1/orders/chapa/initialize", {
        method: "POST",
        token,
        body: JSON.stringify({
          items: items.map((item) => ({
            product_id: item.product.id,
            quantity: item.quantity,
          })),
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine1: address.trim(),
          city: city.trim(),
          note: note.trim() || undefined,
          returnUrl: appReturnUrl,
          appReturnUrl,
        }),
      });

      const sessionResult = await WebBrowser.openAuthSessionAsync(initResponse.data.checkout_url, appReturnUrl);

      if (sessionResult.type === "cancel" || sessionResult.type === "dismiss") {
        showToast({
          title: "Payment cancelled",
          message: "You cancelled Chapa checkout.",
          variant: "info",
        });
        return;
      }

      const txRefFromReturn =
        sessionResult.type === "success" ? new URL(sessionResult.url).searchParams.get("tx_ref") : null;

      const txRef = txRefFromReturn || initResponse.data.tx_ref;
      if (!txRef) {
        throw new Error("Missing transaction reference from Chapa.");
      }

      router.replace({
        pathname: "/payment/chapa-return",
        params: { tx_ref: txRef },
      });
    } catch (error) {
      showToast({
        title: "Payment failed",
        message: error instanceof Error ? error.message : "Unable to complete Chapa payment.",
        variant: "error",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Checkout</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Your cart is empty</Text>
            <Text style={styles.helperText}>Add products to continue with checkout.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/products") }>
              <Text style={styles.primaryButtonText}>Browse products</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Delivery details</Text>

              <TextInput
                style={styles.input}
                placeholder="Full name"
                placeholderTextColor={colors.textSubtle}
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder="Phone number"
                placeholderTextColor={colors.textSubtle}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder="Address"
                placeholderTextColor={colors.textSubtle}
                value={address}
                onChangeText={setAddress}
              />
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={colors.textSubtle}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Optional delivery note"
                placeholderTextColor={colors.textSubtle}
                multiline
                value={note}
                onChangeText={setNote}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Payment method</Text>
              <View style={styles.paymentRow}>
                <Pressable
                  style={[styles.paymentPill, paymentMethod === "cash" && styles.paymentPillActive]}
                  onPress={() => setPaymentMethod("cash")}
                >
                  <Text style={[styles.paymentPillText, paymentMethod === "cash" && styles.paymentPillTextActive]}>
                    Cash on delivery
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.paymentPill, paymentMethod === "card" && styles.paymentPillActive]}
                  onPress={() => setPaymentMethod("card")}
                >
                  <Text style={[styles.paymentPillText, paymentMethod === "card" && styles.paymentPillTextActive]}>
                    Chapa
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Order summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items ({itemCount})</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery fee</Text>
                <Text style={styles.summaryValue}>{formatPrice(DELIVERY_FEE)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Service fee</Text>
                <Text style={styles.summaryValue}>{formatPrice(SERVICE_FEE)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(total)}</Text>
              </View>

              <Pressable style={styles.primaryButton} onPress={onPlaceOrder} disabled={isPaying}>
                <Text style={styles.primaryButtonText}>{isPaying ? "Opening Chapa..." : "Place order"}</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => router.push("/cart") }>
                <Text style={styles.secondaryButtonText}>Back to cart</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
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
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 20,
      paddingBottom: 120,
      gap: 14,
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
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "900",
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 10,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
      marginBottom: 2,
    },
    helperText: {
      color: colors.textMuted,
      marginBottom: 10,
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      color: colors.text,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    noteInput: {
      minHeight: 86,
      textAlignVertical: "top",
    },
    paymentRow: {
      flexDirection: "row",
      gap: 10,
    },
    paymentPill: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 11,
      alignItems: "center",
    },
    paymentPillActive: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    paymentPillText: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 13,
    },
    paymentPillTextActive: {
      color: colors.accent,
    },
    summaryRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    summaryLabel: {
      color: colors.textSubtle,
      fontWeight: "600",
    },
    summaryValue: {
      color: colors.text,
      fontWeight: "700",
    },
    separator: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    totalLabel: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "900",
    },
    totalValue: {
      color: colors.text,
      fontSize: 17,
      fontWeight: "900",
    },
    primaryButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      alignItems: "center",
      paddingVertical: 13,
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
