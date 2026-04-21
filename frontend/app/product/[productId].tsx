import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { apiFetch } from "@/lib/api";
import { ProductDetailsResponse } from "@/types/product";

const formatPrice = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock < 10) {
    return "Limited stock";
  }

  return "Available now";
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back</Text>
        </Pressable>

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
                <FieldRow label="Origin" value={product.description?.origion ?? "Not specified"} />
                <FieldRow label="Flavor notes" value={product.description?.flavorNotes ?? "Not specified"} />
                <FieldRow label="Roast level" value={product.description?.roastLevel ?? "Not specified"} />
                <FieldRow label="Processing method" value={product.description?.processingMethod ?? "Not specified"} />
                <FieldRow label="Processed" value={product.description?.processed ?? "Not specified"} />
                <FieldRow label="Grind type" value={product.description?.grindType ?? "Not specified"} />
                <FieldRow label="Grind sizes" value={product.description?.grindSizes ?? "Not specified"} />
                <FieldRow label="Sustainable" value={product.description?.isSustainable ?? "Not specified"} />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Farmer</Text>
              <View style={styles.infoCard}>
                <FieldRow label="Name" value={farmerName} />
                <FieldRow label="Email" value={product.farmer.email} />
                <FieldRow label="Farmer ID" value={product.farmer.id} />
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable style={[styles.primaryButton, !isSignedIn && styles.primaryButtonWide]} onPress={() => router.push(isSignedIn ? "/" : "/sign-in") }>
                <Text style={styles.primaryButtonText}>{isSignedIn ? "Add to cart soon" : "Sign in to continue"}</Text>
              </Pressable>
              {!isSignedIn ? null : (
                <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
                  <Text style={styles.secondaryButtonText}>Keep browsing</Text>
                </Pressable>
              )}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#07111f",
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  backButton: {
    alignSelf: "flex-start",
    backgroundColor: "#132033",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
    marginBottom: 16,
  },
  backButtonText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
  loadingState: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#cbd5e1",
    marginTop: 10,
  },
  errorCard: {
    backgroundColor: "#0f1b2d",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  errorTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
  },
  errorText: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: "#f59e0b",
    borderRadius: 14,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#111827",
    fontWeight: "800",
  },
  heroImage: {
    width: "100%",
    height: 320,
    borderRadius: 28,
    backgroundColor: "#142235",
  },
  card: {
    backgroundColor: "#0f1b2d",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
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
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: "#94a3b8",
    marginTop: 6,
  },
  pricePill: {
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pricePillText: {
    color: "#fbbf24",
    fontWeight: "800",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  metaPill: {
    backgroundColor: "#132033",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginTop: 16,
    backgroundColor: "#0f1b2d",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  sectionText: {
    color: "#cbd5e1",
    lineHeight: 22,
  },
  infoCard: {
    backgroundColor: "#132033",
    borderRadius: 18,
    padding: 14,
  },
  fieldRow: {
    marginBottom: 12,
  },
  fieldLabel: {
    color: "#94a3b8",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  fieldValue: {
    color: "#f8fafc",
    fontSize: 15,
    lineHeight: 20,
  },
  actionRow: {
    marginTop: 18,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonWide: {
    width: "100%",
  },
  primaryButtonText: {
    color: "#111827",
    fontWeight: "900",
  },
  secondaryButton: {
    backgroundColor: "#132033",
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  secondaryButtonText: {
    color: "#f8fafc",
    fontWeight: "800",
  },
});