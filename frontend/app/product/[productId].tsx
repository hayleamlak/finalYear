import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useTheme } from "@/context/ThemeContext";
import { ProductDetailsResponse } from "@/types/product";

const formatPrice = (value: number) => new Intl.NumberFormat("en-ET", { style: "currency", currency: "ETB" }).format(value);

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock < 10) {
    return "Limited stock";
  }

  return "Available now";
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
      <Text style={fieldValueStyle}>{value}</Text>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { addItem, getQuantityForProduct } = useCart();
  const { productId } = useLocalSearchParams<{ productId?: string | string[] }>();
  const resolvedProductId = useMemo(() => (Array.isArray(productId) ? productId[0] : productId), [productId]);
  const [product, setProduct] = useState<ProductDetailsResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!resolvedProductId) {
      setIsLoading(false);
      setErrorMessage("Missing product id.");
      return;
    }

    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const response = await apiFetch<ProductDetailsResponse>(`/api/v1/products/${resolvedProductId}`);
        setProduct(response.data);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load this product.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [resolvedProductId]);

  const farmerName = product ? `${product.farmer.first_name} ${product.farmer.last_name}` : "";
  const description = product?.product_detail ?? product?.description?.flavorNotes ?? "No description was provided for this product yet.";
  const quantityInCart = product ? getQuantityForProduct(product.id) : 0;

  const onAddToCart = () => {
    if (!product) {
      return;
    }

    if (product.stock <= 0) {
      Alert.alert("Out of stock", "This product is currently unavailable.");
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

    Alert.alert("Added to cart", `${product.product_name} was added to your cart.`);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
          <ThemeToggleButton />
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color="#f59e0b" />
            <Text style={styles.loadingText}>Loading product details...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Could not load product</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Pressable style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>Go back</Text>
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
                  <Text style={styles.pricePillText}>{formatPrice(product.price)}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{getStockLabel(product.stock)}</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{product.stock} in stock</Text>
                </View>
                <View style={styles.metaPill}>
                  <Text style={styles.metaPillText}>{product.status}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About this product</Text>
              <Text style={styles.sectionText}>{description}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Coffee details</Text>
              <View style={styles.infoCard}>
                <FieldRow
                  label="Origin"
                  value={product.description?.origion ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Flavor notes"
                  value={product.description?.flavorNotes ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Roast level"
                  value={product.description?.roastLevel ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Processing method"
                  value={product.description?.processingMethod ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Processed"
                  value={product.description?.processed ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Grind type"
                  value={product.description?.grindType ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Grind sizes"
                  value={product.description?.grindSizes ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Sustainable"
                  value={product.description?.isSustainable ?? "N/A"}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer</Text>
              <View style={styles.infoCard}>
                <FieldRow
                  label="Name"
                  value={farmerName}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Email"
                  value={product.farmer.email}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
                <FieldRow
                  label="Farmer ID"
                  value={product.farmer.id}
                  fieldRowStyle={styles.fieldRow}
                  fieldLabelStyle={styles.fieldLabel}
                  fieldValueStyle={styles.fieldValue}
                />
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.primaryButton, product.stock <= 0 && styles.primaryButtonDisabled]}
                onPress={onAddToCart}
                disabled={product.stock <= 0}
              >
                <Text style={styles.primaryButtonText}>
                  {product.stock <= 0 ? "Out of stock" : `Add to cart${quantityInCart > 0 ? ` (${quantityInCart})` : ""}`}
                </Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => router.push("/cart") }>
                <Text style={styles.secondaryButtonText}>View cart</Text>
              </Pressable>
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
  },
  pricePill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
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
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: colors.textSubtle,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldValue: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 18,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    paddingVertical: 16,
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