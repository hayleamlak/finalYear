import { Redirect, usePathname, useRouter } from "expo-router";
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
import { useAuth, useUser } from "@clerk/clerk-expo";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { LoadingButton } from "@/components/ui/LoadingButton";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/lib/api";
import { env } from "@/lib/env";
import { getRoleFromUser } from "@/lib/role";

type PaymentMethod = "cash" | "card";

const DELIVERY_FEE = 150;
const SERVICE_FEE = 40;

const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
  }).format(value);

export default function CheckoutScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { t, locale } = useLanguage();
  const { getToken, isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
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
      Alert.alert(t("cart.emptyTitle"), t("cart.emptyText"));
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      Alert.alert(t("checkout.missingDetailsTitle"), t("checkout.missingDetailsMessage"));
      return;
    }

    if (isPaying) {
      return;
    }

    if (paymentMethod === "cash") {
      Alert.alert(
        t("checkout.orderPlacedTitle"),
        `${t("checkout.orderPlacedMessagePrefix")}, ${fullName.trim()}!\n${t("checkout.totalLabel")}: ${formatPrice(total, locale)}\n${t("checkout.paymentLabel")}: ${t("checkout.cashOnDelivery")}`,
        [
          {
            text: t("common.ok"),
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
        throw new Error(t("checkout.signInBeforeCheckout"));
      }

      const appReturnUrl = Linking.createURL("/payment/chapa-return");
      const returnUrl = `${env.apiUrl}/api/v1/orders/chapa/return`;

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
          returnUrl,
          appReturnUrl,
        }),
      });

      const sessionResult = await WebBrowser.openAuthSessionAsync(initResponse.data.checkout_url, appReturnUrl);

      if (sessionResult.type === "cancel" || sessionResult.type === "dismiss") {
        showToast({
          title: t("checkout.paymentCancelledTitle"),
          message: t("checkout.paymentCancelledMessage"),
          variant: "info",
        });
        return;
      }

      const txRefFromReturn =
        sessionResult.type === "success" ? new URL(sessionResult.url).searchParams.get("tx_ref") : null;

      const txRef = txRefFromReturn || initResponse.data.tx_ref;
      if (!txRef) {
        throw new Error(t("checkout.missingTxRef"));
      }

      router.replace({
        pathname: "/payment/chapa-return",
        params: { tx_ref: txRef },
      });
    } catch (error) {
      showToast({
        title: t("checkout.paymentFailedTitle"),
        message: error instanceof Error ? error.message : t("checkout.paymentFailedMessage"),
        variant: "error",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const styles = createStyles(colors);

  if (isUserLoaded && isSignedIn && getRoleFromUser(user) === "farmer") {
    return <Redirect href="/farmer-dashboard" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </Pressable>
          <Text style={styles.title}>{t("checkout.title")}</Text>
        </View>

        {items.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{t("checkout.cartEmptyTitle")}</Text>
            <Text style={styles.helperText}>{t("checkout.cartEmptyMessage")}</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.push("/products") }>
              <Text style={styles.primaryButtonText}>{t("cart.browseProducts")}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t("checkout.deliveryDetails")}</Text>

              <TextInput
                style={styles.input}
                placeholder={t("checkout.fullName")}
                placeholderTextColor={colors.textSubtle}
                value={fullName}
                onChangeText={setFullName}
              />
              <TextInput
                style={styles.input}
                placeholder={t("checkout.phoneNumber")}
                placeholderTextColor={colors.textSubtle}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />
              <TextInput
                style={styles.input}
                placeholder={t("checkout.address")}
                placeholderTextColor={colors.textSubtle}
                value={address}
                onChangeText={setAddress}
              />
              <TextInput
                style={styles.input}
                placeholder={t("checkout.city")}
                placeholderTextColor={colors.textSubtle}
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder={t("checkout.deliveryNote")}
                placeholderTextColor={colors.textSubtle}
                multiline
                value={note}
                onChangeText={setNote}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t("checkout.paymentMethod")}</Text>
              <View style={styles.paymentRow}>
                <Pressable
                  style={[styles.paymentPill, paymentMethod === "cash" && styles.paymentPillActive]}
                  onPress={() => setPaymentMethod("cash")}
                >
                  <Text style={[styles.paymentPillText, paymentMethod === "cash" && styles.paymentPillTextActive]}>
                    {t("checkout.cashOnDelivery")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.paymentPill, paymentMethod === "card" && styles.paymentPillActive]}
                  onPress={() => setPaymentMethod("card")}
                >
                  <Text style={[styles.paymentPillText, paymentMethod === "card" && styles.paymentPillTextActive]}>
                    {t("checkout.chapa")}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>{t("checkout.orderSummary")}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("checkout.itemsLabel")} ({itemCount})</Text>
                <Text style={styles.summaryValue}>{formatPrice(subtotal, locale)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("checkout.deliveryFee")}</Text>
                <Text style={styles.summaryValue}>{formatPrice(DELIVERY_FEE, locale)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t("checkout.serviceFee")}</Text>
                <Text style={styles.summaryValue}>{formatPrice(SERVICE_FEE, locale)}</Text>
              </View>
              <View style={styles.separator} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>{t("checkout.totalLabel")}</Text>
                <Text style={styles.totalValue}>{formatPrice(total, locale)}</Text>
              </View>

              <LoadingButton
                title={t("checkout.placeOrder")}
                loading={isPaying}
                onPress={() => void onPlaceOrder()}
                backgroundColor={colors.primary}
                textColor={colors.primaryText}
                spinnerColor={colors.primaryText}
                style={styles.primaryButton}
              />
              <Pressable style={styles.secondaryButton} onPress={() => router.push("/cart") }>
                <Text style={styles.secondaryButtonText}>{t("checkout.backToCart")}</Text>
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
