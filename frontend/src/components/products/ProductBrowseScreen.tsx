import { useAuth, useUser } from "@clerk/clerk-expo";
import { Redirect, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
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

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { getRoleFromUser } from "@/lib/role";
import { ProductListResponse, ProductSummary } from "@/types/product";

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

export function ProductBrowseScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors } = useTheme();
  const { t, locale } = useLanguage();
  const { showToast } = useToast();
  const { isSignedIn } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { itemCount, addItem } = useCart();
  const [items, setItems] = useState<ProductSummary[]>([]);
  const [visibleItemIds, setVisibleItemIds] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 });
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: { item: ProductSummary }[] }) => {
      setVisibleItemIds(viewableItems.map((entry) => entry.item.id));
    }
  );

  const subtitle = useMemo(() => {
    if (isSignedIn) {
      return t("browse.subtitleSignedIn");
    }

    return t("browse.subtitleSignedOut");
  }, [isSignedIn, t]);

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
      setErrorMessage(error instanceof Error ? error.message : t("browse.loadFailed"));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void loadProducts("");
  }, []);

  useEffect(() => {
    // Keep above-the-fold images visible after returning from other tabs.
    setVisibleItemIds(items.slice(0, 6).map((item) => item.id));
  }, [items]);

  const onSubmitSearch = () => {
    void loadProducts(search);
  };

  const styles = createStyles(colors);

  if (isUserLoaded && isSignedIn && getRoleFromUser(user) === "farmer") {
    return <Redirect href="/farmer-dashboard" />;
  }

  if (isUserLoaded && !isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        removeClippedSubviews={false}
        viewabilityConfig={viewabilityConfig.current}
        onViewableItemsChanged={onViewableItemsChanged.current}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => void loadProducts(search, true)} tintColor="#f59e0b" />}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <View style={styles.heroTopRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{t("browse.market")}</Text>
                </View>
              </View>
              <Text style={styles.title}>{t("browse.title")}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>

              <View style={styles.searchRow}>
                <TextInput
                  style={styles.searchInput}
                  placeholder={t("browse.searchPlaceholder")}
                  placeholderTextColor={colors.textSubtle}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                  onSubmitEditing={onSubmitSearch}
                />
                <Pressable style={styles.searchButton} onPress={onSubmitSearch}>
                  <Text style={styles.searchButtonText}>{t("browse.search")}</Text>
                </Pressable>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{items.length}</Text>
                  <Text style={styles.statLabel}>{t("browse.visibleProducts")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{isSignedIn ? "On" : "Off"}</Text>
                  <Text style={styles.statLabel}>{t("browse.sessionStatus")}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionHeader}>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{t("browse.featuredProducts")}</Text>
                <Pressable style={styles.cartShortcut} onPress={() => router.push("/cart") }>
                  <Text style={styles.cartShortcutText}>{t("nav.cart")} ({itemCount})</Text>
                </Pressable>
              </View>
              <Text style={styles.sectionCaption}>{t("browse.sectionCaption")}</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState title={t("browse.loading")} subtitle={t("browse.sectionCaption")} cards={3} />
          ) : errorMessage ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{t("browse.couldNotLoad")}</Text>
              <Text style={styles.emptyText}>{errorMessage}</Text>
              <Pressable style={styles.retryButton} onPress={() => void loadProducts(search)}>
                <Text style={styles.retryButtonText}>{t("common.tryAgain")}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{t("browse.noProductsFound")}</Text>
              <Text style={styles.emptyText}>{t("browse.noProductsHint")}</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Pressable onPress={() => router.push({ pathname: "/product/[productId]", params: { productId: item.id } })}>
              {visibleItemIds.includes(item.id) ? (
                <Image source={{ uri: item.image }} style={styles.cardImage} />
              ) : (
                <View style={styles.cardImagePlaceholder}>
                  <ActivityIndicator color="#f59e0b" />
                  <Text style={styles.cardImagePlaceholderText}>{t("common.loadingImage")}</Text>
                </View>
              )}
            </Pressable>
            <View style={styles.cardBody}>
              <Pressable onPress={() => router.push({ pathname: "/product/[productId]", params: { productId: item.id } })}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.product_name}
                  </Text>
                  <Text style={styles.cardPrice}>{formatPrice(item.price, locale)}</Text>
                </View>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.product_detail ?? t("browse.freshProduct")}
                </Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardMeta}>{t(`browse.stock.${getStockLabel(item.stock)}` as any)}</Text>
                  <Text style={styles.cardMeta}>{item.stock} kg</Text>
                </View>
              </Pressable>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.viewButton}
                  onPress={() => router.push({ pathname: "/product/[productId]", params: { productId: item.id } })}
                >
                  <Text style={styles.viewButtonText}>{t("buyer.view")}</Text>
                </Pressable>
                <Pressable
                  style={[styles.cartButton, item.stock <= 0 && styles.cartButtonDisabled]}
                  onPress={() => {
                    addItem(item, 1);
                    showToast({
                      title: t("product.addedToCart"),
                      message: `${item.product_name} ${t("browse.inCartMessage")}`,
                      variant: "success",
                    });
                  }}
                  disabled={item.stock <= 0}
                >
                  <Text style={styles.cartButtonText}>
                    {item.stock <= 0
                      ? t("common.outOfStock")
                      : t("buyer.addToCart")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            {!isSignedIn ? (
              <View style={styles.footerActions}>
                <Pressable style={styles.primaryFooterButton} onPress={() => router.push("/sign-in") }>
                  <Text style={styles.primaryFooterButtonText}>{t("common.signIn")}</Text>
                </Pressable>
                <Pressable style={styles.secondaryFooterButton} onPress={() => router.push("/sign-in") }>
                  <Text style={styles.secondaryFooterButtonText}>{t("common.createAccount")}</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        }
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
    content: {
      padding: 20,
      paddingBottom: 110,
    },
    hero: {
      backgroundColor: colors.surface,
      borderRadius: 28,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 18,
    },
    heroTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 10,
      marginBottom: 14,
    },
    badge: {
      alignSelf: "flex-start",
      backgroundColor: colors.accentSoft,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    badgeText: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    title: {
      color: colors.text,
      fontSize: 30,
      lineHeight: 36,
      fontWeight: "800",
      marginBottom: 10,
    },
    subtitle: {
      color: colors.textMuted,
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
      backgroundColor: colors.surfaceAlt,
      color: colors.text,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    searchButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    statsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 18,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statNumber: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "800",
    },
    statLabel: {
      color: colors.textSubtle,
      marginTop: 4,
      fontSize: 12,
    },
    sectionHeader: {
      marginBottom: 12,
    },
    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: 12,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: "800",
    },
    cartShortcut: {
      backgroundColor: colors.surfaceAlt,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    cartShortcutText: {
      color: colors.text,
      fontWeight: "700",
      fontSize: 12,
    },
    sectionCaption: {
      color: colors.textSubtle,
      marginTop: 4,
    },
    loadingState: {
      paddingVertical: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: colors.textMuted,
      marginTop: 10,
    },
    emptyState: {
      paddingVertical: 28,
      paddingHorizontal: 20,
      backgroundColor: colors.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 14,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    emptyText: {
      color: colors.textMuted,
      marginTop: 8,
      lineHeight: 20,
    },
    retryButton: {
      marginTop: 14,
      alignSelf: "flex-start",
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    card: {
      backgroundColor: colors.surface,
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
      backgroundColor: colors.surfaceAlt,
    },
    cardImagePlaceholder: {
      width: "100%",
      height: 200,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
    },
    cardImagePlaceholderText: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: "600",
    },
    cardBody: {
      padding: 16,
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 12,
      minHeight: 42,
      alignItems: "stretch",
    },
    viewButton: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
    },
    viewButtonText: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 12,
    },
    cartButton: {
      flex: 1,
      backgroundColor: colors.primary,
      borderRadius: 12,
      minHeight: 42,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 10,
    },
    cartButtonDisabled: {
      opacity: 0.6,
    },
    cartButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
      fontSize: 12,
    },
    cardTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 12,
      alignItems: "flex-start",
    },
    cardTitle: {
      flex: 1,
      color: colors.text,
      fontSize: 18,
      fontWeight: "800",
    },
    cardPrice: {
      color: colors.accent,
      fontSize: 16,
      fontWeight: "800",
    },
    cardDescription: {
      color: colors.textMuted,
      marginTop: 8,
      lineHeight: 20,
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 14,
    },
    cardMeta: {
      color: colors.textSubtle,
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
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryFooterButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    secondaryFooterButton: {
      flex: 1,
      backgroundColor: colors.surfaceAlt,
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryFooterButtonText: {
      color: colors.text,
      fontWeight: "800",
    },
  });
