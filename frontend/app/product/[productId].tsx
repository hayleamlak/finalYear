import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { ProductDetailsResponse } from "@/types/product";

const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
  }).format(value);

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return "out";
  }

  if (stock < 10) {
    return "limited";
  }

  return "available";
}

function FieldRow({
  label,
  value,
  fieldRowStyle,
  fieldLabelStyle,
  fieldValueStyle,
}: {
  label: string;
  value: string;
  fieldRowStyle: object;
  fieldLabelStyle: object;
  fieldValueStyle: object;
}) {
  return (
    <View style={fieldRowStyle}>
      <Text style={fieldLabelStyle}>{label}</Text>
          <Text style={fieldValueStyle} numberOfLines={4}>
            {value}
          </Text>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();
  const { t, locale } = useLanguage();
  const { showToast } = useToast();
  const { addItem } = useCart();
  const { productId } = useLocalSearchParams<{ productId?: string | string[] }>();
  const resolvedProductId = useMemo(() => (Array.isArray(productId) ? productId[0] : productId), [productId]);
  const [product, setProduct] = useState<ProductDetailsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedProductId) {
      setIsLoading(false);
      setErrorMessage(t("product.missingId"));
      return;
    }

    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await apiFetch<ProductDetailsResponse>(`/api/v1/products/${resolvedProductId}`);
        setProduct(response.data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : t("product.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [resolvedProductId]);

  const farmerName = product ? `${product.farmer.first_name} ${product.farmer.last_name}` : "";
  const description = product?.product_detail ?? product?.description?.flavorNotes ?? t("product.noDescription");
  const onAddToCart = () => {
    if (!product) {
      return;
    }

    if (product.stock <= 0) {
      showToast({
        title: t("common.outOfStock"),
        message: t("product.unavailable"),
        variant: "error",
      });
      return;
    }

    addItem({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      stock: product.stock,
      image: product.image,
      product_detail: product.product_detail,
      farmer_id: product.farmer_id,
      createdAt: product.createdAt,
    });

    showToast({
      title: t("product.addedToCart"),
      message: `${product.product_name} ${t("product.addedToCartMessage")}`,
      variant: "success",
    });
  };

  const onBuyNow = () => {
    if (!product) {
      return;
    }

    if (product.stock <= 0) {
      Alert.alert(t("common.outOfStock"), t("product.unavailable"));
      return;
    }

    addItem({
      id: product.id,
      product_name: product.product_name,
      price: product.price,
      stock: product.stock,
      image: product.image,
      product_detail: product.product_detail,
      farmer_id: product.farmer_id,
      createdAt: product.createdAt,
    });

    router.push("/checkout");
  };

  const onShareProduct = async () => {
    if (!product) {
      return;
    }

    try {
      await Share.share({
        message: `${product.product_name} - ${formatPrice(product.price, locale)}\n${description}`,
      });
    } catch {
      Alert.alert(t("product.shareFailedTitle"), t("product.shareFailedMessage"));
    }
  };

  const styles = createStyles(colors);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingState}>
          <LoadingState title={t("product.loading")} subtitle={t("product.about")} cards={1} compact />
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{t("common.back")}</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <LoadingState title={t("product.loading")} subtitle={t("product.about")} cards={1} compact />
        ) : errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>{t("product.couldNotLoad")}</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>{t("product.goBack")}</Text>
            </Pressable>
          </View>
        ) : product ? (
          <>
            <Image source={{ uri: product.image }} style={styles.heroImage} />

            <View style={styles.card}>
              <View style={styles.titleRow}>
                <View style={styles.titleColumn}>
                  <Text style={styles.title}>{product.product_name}</Text>
                  <Text style={styles.subtitle}>{farmerName}</Text>
                </View>
                <View style={styles.pricePill}>
                  <Text style={styles.pricePillText}>{formatPrice(product.price, locale)}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{t(`product.stock.${getStockLabel(product.stock)}` as any)}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{product.stock} kg</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{product.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("product.about")}</Text>
              <Text style={styles.sectionText}>{description}</Text>
            </View>

            {product.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("product.details")}</Text>
              <View style={styles.infoCard}>
                <FieldRow
                  label={t("product.origin")}
                  value={product.description?.origion ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.flavorNotes")}
                  value={product.description?.flavorNotes ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.roastLevel")}
                  value={product.description?.roastLevel ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.processingMethod")}
                  value={product.description?.processingMethod ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.processed")}
                  value={product.description?.processed ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.grindType")}
                  value={product.description?.grindType ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.grindSizes")}
                  value={product.description?.grindSizes ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.sustainable")}
                  value={product.description?.isSustainable ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
              </View>
            </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("product.farmer")}</Text>
              <View style={styles.infoCard}>
                <FieldRow
                  label={t("product.name")}
                  value={farmerName}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.email")}
                  value={product.farmer.email}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label={t("product.farmerId")}
                  value={product.farmer.id}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
              </View>
            </View>

            <View style={styles.actionRow}>
              <View style={styles.inlineActionsRow}>
                <Pressable
                  style={[styles.primaryButton, styles.inlineActionButton, product.stock <= 0 && styles.primaryButtonDisabled]}
                  onPress={onAddToCart}
                  disabled={product.stock <= 0}
                >
                  <Text style={styles.primaryButtonText}>
                    {product.stock <= 0 ? t("common.outOfStock") : t("product.addToCart")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.secondaryButton, styles.inlineActionButton, product.stock <= 0 && styles.primaryButtonDisabled]}
                  onPress={onBuyNow}
                  disabled={product.stock <= 0}
                >
                  <Text style={styles.secondaryButtonText}>{t("product.buyNow")}</Text>
                </Pressable>
              </View>

              <View style={styles.inlineActionsRow}>
                <Pressable style={[styles.secondaryButton, styles.inlineActionButton]} onPress={() => router.push("/cart") }>
                  <Text style={styles.secondaryButtonText}>{t("product.viewCart")}</Text>
                </Pressable>
                <Pressable style={[styles.secondaryButton, styles.inlineActionButton]} onPress={() => void onShareProduct()}>
                  <Text style={styles.secondaryButtonText}>{t("product.shareProduct")}</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : null}
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
}) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  loadingState: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textMuted,
    marginTop: 10,
  },
  errorCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "800",
  },
  errorText: {
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: colors.primary,
    borderRadius: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: colors.primaryText,
    fontWeight: "800",
  },
  heroImage: {
    width: "100%",
    height: 320,
    borderRadius: 28,
    backgroundColor: "#142235",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  titleColumn: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: colors.textSubtle,
    marginTop: 6,
    fontSize: 14,
  },
  pricePill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
      alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pricePillText: {
    color: colors.primaryText,
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  metaPill: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  sectionText: {
    color: colors.textMuted,
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    padding: 14,
    gap: 10,
  },
  fieldRow: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  fieldLabel: {
    color: colors.textSubtle,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  fieldValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  actionRow: {
    marginTop: 18,
    gap: 12,
  },
  inlineActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  inlineActionButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
      shadowColor: colors.primary,
      shadowOpacity: 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    alignItems: "center",
  },
  primaryButtonWide: {
    width: "100%",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: colors.primaryText,
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "800",
  },
});