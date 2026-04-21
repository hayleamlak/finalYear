import { useAuth } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { apiFetch } from "@/lib/api";
import { ProductListResponse, ProductSummary } from "@/types/product";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

function getStockLabel(stock: number) {
  if (stock <= 0) {
    return "Out of stock";
  }

  if (stock < 10) {
    return "Limited stock";
  }

  return "Available now";
}

export function ProductBrowseScreen() {
  const router = useRouter();
  const { isSignedIn, signOut } = useAuth();
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subtitle = useMemo(() => {
    if (isSignedIn) {
      return "Browse fresh products, compare prices, and keep moving toward checkout.";
    }

    return "Explore products first. Sign in when you want to save a cart or place an order.";
  }, [isSignedIn]);

  const loadProducts = async (query: string, refreshing = false) => {
    try {
      if (refreshing) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      setErrorMessage(null);

      const params = new URLSearchParams({ page: "1", limit: "12" });
      if (query.trim().length > 0) {
        params.set("search", query.trim());
      }

      const response = await apiFetch<ProductListResponse>(`/api/v1/products?${params.toString()}`);
      setItems(response.data.items);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to load products.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadProducts("");
  }, []);

  const onSubmitSearch = () => {
    void loadProducts(search);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadProducts(search, true)} tintColor="#f59e0b" />}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Market</Text>
              </View>
              <Text style={styles.title}>Fresh coffee, ready to browse</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search products"
                  placeholderTextColor="#94a3b8"
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                  onSubmitEditing={onSubmitSearch}
                />
                <Pressable style={styles.searchButton} onPress={onSubmitSearch}>
                  <Text style={styles.searchButtonText}>Search</Text>
                </Pressable>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{items.length}</Text>
                  <Text style={styles.statLabel}>Visible products</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{isSignedIn ? "On" : "Off"}</Text>
                  <Text style={styles.statLabel}>Session status</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured products</Text>
              <Text style={styles.sectionCaption}>Tap a card to open the product details route.</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingState}>
              <ActivityIndicator color="#f59e0b" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : errorMessage ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Could not load products</Text>
              <Text style={styles.emptyText}>{errorMessage}</Text>
              <Pressable style={styles.retryButton} onPress={() => void loadProducts(search)}>
                <Text style={styles.retryButtonText}>Try again</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try a different search term or refresh the list.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: "/product/[productId]", params: { productId: item.id } })}
          >
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.product_name}
                </Text>
                <Text style={styles.cardPrice}>{formatPrice(item.price)}</Text>
              </View>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {item.product_detail ?? "Fresh product from a local farmer."}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.cardMeta}>{getStockLabel(item.stock)}</Text>
                <Text style={styles.cardMeta}>{item.stock} in stock</Text>
              </View>
            </View>
          </Pressable>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {isSignedIn ? (
              <Pressable style={styles.signOutButton} onPress={() => void signOut()}>
                <Text style={styles.signOutButtonText}>Sign out</Text>
              </Pressable>
            ) : (
              <View style={styles.footerActions}>
                <Pressable style={styles.primaryFooterButton} onPress={() => router.push("/sign-in") }>
                  <Text style={styles.primaryFooterButtonText}>Sign in</Text>
                </Pressable>
                <Pressable style={styles.secondaryFooterButton} onPress={() => router.push("/sign-up") }>
                  <Text style={styles.secondaryFooterButtonText}>Create account</Text>
                </Pressable>
              </View>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#07111f",
  },
  content: {
    padding: 20,
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: "#0f1b2d",
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.18)",
    marginBottom: 18,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
  },
  badgeText: {
    color: "#fbbf24",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    marginBottom: 10,
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
  },
  searchRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#152238",
    color: "#f8fafc",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
  },
  searchButton: {
    backgroundColor: "#f59e0b",
    borderRadius: 16,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  searchButtonText: {
    color: "#111827",
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#132033",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.1)",
  },
  statNumber: {
    color: "#f8fafc",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "800",
  },
  sectionCaption: {
    color: "#94a3b8",
    marginTop: 4,
  },
  loadingState: {
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#cbd5e1",
    marginTop: 10,
  },
  emptyState: {
    paddingVertical: 28,
    paddingHorizontal: 20,
    backgroundColor: "#0f1b2d",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.12)",
    marginBottom: 14,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#cbd5e1",
    marginTop: 8,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#f59e0b",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: "#111827",
    fontWeight: "800",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: 200,
    backgroundColor: "#e2e8f0",
  },
  cardBody: {
    padding: 16,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  cardTitle: {
    flex: 1,
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  cardPrice: {
    color: "#7c2d12",
    fontSize: 16,
    fontWeight: "800",
  },
  cardDescription: {
    color: "#475569",
    marginTop: 8,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  cardMeta: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
  },
  footer: {
    paddingTop: 10,
    paddingBottom: 24,
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryFooterButton: {
    flex: 1,
    backgroundColor: "#f59e0b",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryFooterButtonText: {
    color: "#111827",
    fontWeight: "800",
  },
  secondaryFooterButton: {
    flex: 1,
    backgroundColor: "#132033",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  secondaryFooterButtonText: {
    color: "#f8fafc",
    fontWeight: "800",
  },
  signOutButton: {
    backgroundColor: "#132033",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.16)",
  },
  signOutButtonText: {
    color: "#f8fafc",
    fontWeight: "800",
  },
});