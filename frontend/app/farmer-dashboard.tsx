import { useAuth, useClerk, useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { LanguageSwitcher } from "@/components/language/LanguageSwitcher";
import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { useLanguage } from "@/context/LanguageContext";
import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/lib/api";
import {
  deleteFarmerProduct,
  fetchFarmerDashboard,
  updateFarmerOrderItemStatus,
  updateFarmerProduct,
} from "@/lib/farmer";
import { getRoleFromUser, toBackendRole } from "@/lib/role";
import { FarmerDashboardResponse, FarmerOrderItem, FarmerOrderStatus, FarmerProduct } from "@/types/farmer";
import { ProductSummary } from "@/types/product";

type FarmerTab = "analytics" | "products" | "orders" | "add" | "account";
type ProductFormMode = "create" | "edit";
type ProductFormErrors = Partial<Record<"name" | "price" | "stock" | "image" | "detail", string>>;

type CreateProductResponse = {
  success: boolean;
  data: ProductSummary;
};

const MAX_IMAGE_BYTES = 7 * 1024 * 1024;

const formatPrice = (value: number, locale: string) =>
  new Intl.NumberFormat(locale === "am" ? "am-ET" : locale === "om" ? "om-ET" : "en-ET", {
    style: "currency",
    currency: "ETB",
  }).format(value);

const orderActions: Array<{ label: string; status: FarmerOrderStatus; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { label: "Packed", status: "SHIPPED", icon: "package-variant-closed" },
  { label: "Delivered", status: "DELIVERED", icon: "truck-check-outline" },
];

export default function FarmerDashboardScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ tab?: string }>();
  const { isSignedIn, getToken, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { colors } = useTheme();
  const { t, locale } = useLanguage();
  const styles = createStyles(colors);

  const [activeTab, setActiveTab] = useState<FarmerTab>("analytics");
  const [dashboard, setDashboard] = useState<FarmerDashboardResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedOrderItem, setSelectedOrderItem] = useState<FarmerOrderItem | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [detail, setDetail] = useState("");
  const [createFormErrors, setCreateFormErrors] = useState<ProductFormErrors>({});

  const [editingProduct, setEditingProduct] = useState<FarmerProduct | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editDetail, setEditDetail] = useState("");
  const [editFormErrors, setEditFormErrors] = useState<ProductFormErrors>({});

  const role = getRoleFromUser(user);

  const products = dashboard?.products ?? [];
  const orderItems = dashboard?.orderItems ?? [];
  const reviews = dashboard?.reviews ?? [];

  const computed = useMemo(() => {
    const totalStock = products.reduce((sum, item) => sum + item.stock, 0);
    const totalInventoryValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);
    const latestProducts = products.slice(0, 5);
    const lowStockProducts = products.filter((item) => item.stock <= 5).slice(0, 5);
    const stockSnapshot = [...products].sort((left, right) => right.stock - left.stock).slice(0, 5);
    const latestOrders = orderItems.slice(0, 5);
    const transactions = orderItems
      .filter((item) => item.order.payment)
      .slice(0, 6);

    return {
      totalStock,
      totalInventoryValue,
      latestProducts,
      lowStockProducts,
      stockSnapshot,
      latestOrders,
      transactions,
    };
  }, [orderItems, products]);

  const loadDashboard = async () => {
    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setErrorMessage(null);
      setIsLoading(true);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const response = await fetchFarmerDashboard(token);
      setDashboard(response.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : t("farmer.loading"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, [isSignedIn]);

  useEffect(() => {
    if (params.tab === "overview" || params.tab === "analytics") {
      setActiveTab("analytics");
      return;
    }

    if (params.tab === "products") {
      setActiveTab("products");
      return;
    }

    if (params.tab === "orders") {
      setActiveTab("orders");
      return;
    }

    if (params.tab === "earnings") {
      setActiveTab("analytics");
      return;
    }

    if (params.tab === "add") {
      setActiveTab("add");
      return;
    }

    if (params.tab === "profile" || params.tab === "account") {
      setActiveTab("account");
    }
  }, [params.tab]);

  const resetCreateForm = () => {
    setName("");
    setPrice("");
    setStock("");
    setImage("");
    setDetail("");
    setCreateFormErrors({});
  };

  const startEditing = (product: FarmerProduct) => {
    setEditingProduct(product);
    setEditName(product.product_name);
    setEditPrice(String(product.price));
    setEditStock(String(product.stock));
    setEditImage(product.image);
    setEditDetail(product.product_detail ?? "");
    setEditFormErrors({});
    setActiveTab("add");
  };

  const clearEditing = () => {
    setEditingProduct(null);
    setEditName("");
    setEditPrice("");
    setEditStock("");
    setEditImage("");
    setEditDetail("");
    setEditFormErrors({});
  };

  const estimateBase64Bytes = (value: string) => Math.ceil((value.length * 3) / 4);

  const validateProductForm = ({
    formName,
    formPrice,
    formStock,
    formImage,
    formDetail,
  }: {
    formName: string;
    formPrice: string;
    formStock: string;
    formImage: string;
    formDetail: string;
  }) => {
    const nextErrors: ProductFormErrors = {};
    const trimmedName = formName.trim();
    const trimmedDetail = formDetail.trim();
    const numericPrice = Number(formPrice);
    const numericStock = Number(formStock);

    if (trimmedName.length < 2) {
      nextErrors.name = "Product name must be at least 2 characters.";
    } else if (trimmedName.length > 80) {
      nextErrors.name = "Product name must be 80 characters or fewer.";
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      nextErrors.price = "Enter a price greater than 0.";
    }

    if (!Number.isFinite(numericStock) || numericStock < 0 || !Number.isInteger(numericStock)) {
      nextErrors.stock = "Enter a whole kg amount of 0 or more.";
    }

    if (!formImage.trim()) {
      nextErrors.image = "Choose a product image from your phone.";
    }

    if (trimmedDetail.length < 10) {
      nextErrors.detail = "Description must be at least 10 characters.";
    } else if (trimmedDetail.length > 500) {
      nextErrors.detail = "Description must be 500 characters or fewer.";
    }

    return {
      errors: nextErrors,
      isValid: Object.keys(nextErrors).length === 0,
      numericPrice,
      numericStock,
      trimmedName,
      trimmedDetail,
    };
  };

  const pickProductImage = async (mode: ProductFormMode) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Photo access needed", "Please allow photo library access to choose a product image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.45,
      base64: true,
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.base64) {
      const message = "Could not read that image. Please choose another photo.";
      if (mode === "create") {
        setCreateFormErrors((current) => ({ ...current, image: message }));
      } else {
        setEditFormErrors((current) => ({ ...current, image: message }));
      }
      return;
    }

    if (estimateBase64Bytes(asset.base64) > MAX_IMAGE_BYTES) {
      const message = "Image is too large. Choose a smaller photo or crop it tighter.";
      if (mode === "create") {
        setCreateFormErrors((current) => ({ ...current, image: message }));
      } else {
        setEditFormErrors((current) => ({ ...current, image: message }));
      }
      return;
    }

    const imageData = `data:image/jpeg;base64,${asset.base64}`;

    if (mode === "create") {
      setImage(imageData);
      setCreateFormErrors((current) => ({ ...current, image: undefined }));
    } else {
      setEditImage(imageData);
      setEditFormErrors((current) => ({ ...current, image: undefined }));
    }
  };

  const onCreateProduct = async () => {
    if (!user || isSubmitting) {
      return;
    }

    const validation = validateProductForm({
      formName: name,
      formPrice: price,
      formStock: stock,
      formImage: image,
      formDetail: detail,
    });
    setCreateFormErrors(validation.errors);

    if (!validation.isValid) {
      setErrorMessage("Please fix the highlighted product fields.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await apiFetch<CreateProductResponse>("/api/v1/products", {
        method: "POST",
        token,
        body: JSON.stringify({
          product_name: name.trim(),
          farmer_id: user.id,
          price: validation.numericPrice,
          stock: validation.numericStock,
          image: image.trim(),
          product_detail: validation.trimmedDetail,
          role: toBackendRole(role),
        }),
      });

      resetCreateForm();
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveProduct = async () => {
    if (!editingProduct || isSubmitting) {
      return;
    }

    const validation = validateProductForm({
      formName: editName,
      formPrice: editPrice,
      formStock: editStock,
      formImage: editImage,
      formDetail: editDetail,
    });
    setEditFormErrors(validation.errors);

    if (!validation.isValid) {
      setErrorMessage("Please fix the highlighted product fields.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await updateFarmerProduct(token, editingProduct.id, {
        product_name: validation.trimmedName,
        price: validation.numericPrice,
        stock: validation.numericStock,
        image: editImage.trim(),
        product_detail: validation.trimmedDetail,
      });

      clearEditing();
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onToggleAvailability = async (product: FarmerProduct) => {
    try {
      setBusyId(product.id);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await updateFarmerProduct(token, product.id, {
        status: product.status === "ACTIVE" ? "PAUSED" : "ACTIVE",
      });
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update product availability.");
    } finally {
      setBusyId(null);
    }
  };

  const onDeleteProduct = (product: FarmerProduct) => {
    Alert.alert("Remove product", `Mark ${product.product_name} as unavailable?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            setBusyId(product.id);
            const token = await getToken();
            if (!token) {
              throw new Error("Missing auth token");
            }

            await deleteFarmerProduct(token, product.id);
            await loadDashboard();
          } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : "Unable to remove product.");
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const onUpdateOrderStatus = async (item: FarmerOrderItem, status: FarmerOrderStatus) => {
    try {
      setBusyId(item.id);
      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      await updateFarmerOrderItemStatus(token, item.id, status);
      await loadDashboard();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to update order status.");
    } finally {
      setBusyId(null);
    }
  };

  if (!isLoaded || !isUserLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerScreen}>
          <LoadingState title={t("farmer.loadingData")} subtitle={t("farmer.subtitle")} cards={1} compact />
        </View>
      </SafeAreaView>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  if (role !== "farmer") {
    return <Redirect href="/buyer-dashboard" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.avatarImage} />
            ) : (
              <MaterialCommunityIcons name="sprout-outline" size={28} color={colors.accent} />
            )}
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>{t("farmer.title")}</Text>
            <Text style={styles.subtitle}>{t("farmer.subtitle")}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => void loadDashboard()}>
            <MaterialCommunityIcons name="refresh" size={18} color={colors.text} />
          </Pressable>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {isLoading ? (
          <View style={styles.card}>
            <LoadingState title={t("farmer.loading")} subtitle={t("farmer.loadingData")} cards={2} compact />
          </View>
        ) : null}

        {!isLoading && dashboard ? (
          <>
            {activeTab === "analytics" ? (
              <>
                <View style={styles.statsGrid}>
                  <StatCard icon="package-variant-closed" label={t("farmer.products")} value={String(dashboard.summary.totalProducts)} />
                  <StatCard icon="clipboard-list-outline" label={t("farmer.pendingOrders")} value={String(dashboard.summary.pendingOrders)} />
                  <StatCard icon="cash-multiple" label={t("farmer.earnings")} value={formatPrice(dashboard.summary.totalEarnings, locale)} />
                  <StatCard icon="star-outline" label={t("farmer.rating")} value={dashboard.summary.averageRating.toFixed(1)} />
                </View>

                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.cardTitle}>Stock Snapshot</Text>
                    <Text style={styles.badgeText}>{computed.stockSnapshot.length}</Text>
                  </View>
                  {computed.stockSnapshot.length === 0 ? (
                    <Text style={styles.helperText}>Add products to see your stock chart.</Text>
                  ) : (
                    <View style={styles.stockChart}>
                      {computed.stockSnapshot.map((product) => {
                        const maxStock = Math.max(...computed.stockSnapshot.map((item) => item.stock), 1);
                        const barWidth = `${Math.max((product.stock / maxStock) * 100, product.stock > 0 ? 12 : 4)}%` as `${number}%`;

                        return (
                          <View key={product.id} style={styles.stockChartRow}>
                            <View style={styles.stockChartHeader}>
                              <Text style={styles.stockChartLabel} numberOfLines={1}>
                                {product.product_name}
                              </Text>
                              <Text style={styles.stockChartValue}>{product.stock} kg</Text>
                            </View>
                            <View style={styles.stockChartTrack}>
                              <View
                                style={[
                                  styles.stockChartFill,
                                  { width: barWidth, backgroundColor: product.stock <= 5 ? "#f59e0b" : colors.accent },
                                ]}
                              />
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>

                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.cardTitle}>Inventory Alerts</Text>
                    <Text style={styles.badgeText}>{dashboard.summary.lowStockProducts + dashboard.summary.outOfStockProducts}</Text>
                  </View>
                  {computed.lowStockProducts.length === 0 ? (
                    <Text style={styles.helperText}>No low-stock products right now.</Text>
                  ) : (
                    computed.lowStockProducts.map((product) => (
                      <View key={product.id} style={styles.alertProductRow}>
                        <View style={styles.productLeft}>
                          <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#b45309" />
                          <Text style={styles.productTitle}>{product.product_name}</Text>
                        </View>
                        <Text style={styles.warningText}>{product.stock === 0 ? "Out" : `${product.stock} kg left`}</Text>
                      </View>
                    ))
                  )}
                </View>
              </>
            ) : null}

            {activeTab === "products" ? (
              <>
                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.cardTitle}>{t("farmer.productManagement")}</Text>
                    <Pressable onPress={() => setActiveTab("add") }>
                      <Text style={styles.linkText}>{t("farmer.addProduct")}</Text>
                    </Pressable>
                  </View>
                  {products.length === 0 ? (
                    <Text style={styles.helperText}>No products yet.</Text>
                  ) : (
                    products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        busy={busyId === product.id}
                        onEdit={() => startEditing(product)}
                        onToggle={() => void onToggleAvailability(product)}
                        onDelete={() => onDeleteProduct(product)}
                      />
                    ))
                  )}
                </View>
              </>
            ) : null}

            {activeTab === "orders" ? (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{t("farmer.incomingOrders")}</Text>
                {orderItems.length === 0 ? (
                  <Text style={styles.helperText}>No incoming orders yet.</Text>
                ) : (
                  orderItems.map((item) => (
                    <OrderCard key={item.id} item={item} onPress={() => setSelectedOrderItem(item)}>
                      <View style={styles.orderActions}>
                        {orderActions.map((action) => (
                          <Pressable
                            key={action.status}
                            style={styles.smallButton}
                            disabled={busyId === item.id}
                            onPress={() => void onUpdateOrderStatus(item, action.status)}
                          >
                            <MaterialCommunityIcons name={action.icon} size={15} color={colors.text} />
                            <Text style={styles.smallButtonText}>{action.label}</Text>
                          </Pressable>
                        ))}
                      </View>
                    </OrderCard>
                  ))
                )}
              </View>
            ) : null}

            {activeTab === "add" ? (
              <View style={styles.card}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.cardTitle}>{editingProduct ? t("farmer.editProduct") : t("farmer.addProduct")}</Text>
                  <Pressable onPress={() => setActiveTab("products")}>
                    <Text style={styles.linkText}>{t("farmer.productManagement")}</Text>
                  </Pressable>
                </View>
                <ProductImagePicker
                  imageUri={editingProduct ? editImage : image}
                  error={editingProduct ? editFormErrors.image : createFormErrors.image}
                  onPress={() => void pickProductImage(editingProduct ? "edit" : "create")}
                />
                <TextInput
                  style={[styles.input, (editingProduct ? editFormErrors.name : createFormErrors.name) && styles.inputError]}
                  placeholder={t("farmer.productName")}
                  placeholderTextColor={colors.textMuted}
                  value={editingProduct ? editName : name}
                  onChangeText={editingProduct ? setEditName : setName}
                />
                <FieldError message={editingProduct ? editFormErrors.name : createFormErrors.name} />
                <View style={styles.twoColumn}>
                  <View style={styles.flexInput}>
                    <TextInput
                      style={[styles.input, (editingProduct ? editFormErrors.price : createFormErrors.price) && styles.inputError]}
                      placeholder={t("farmer.price")}
                      placeholderTextColor={colors.textMuted}
                      value={editingProduct ? editPrice : price}
                      onChangeText={editingProduct ? setEditPrice : setPrice}
                      keyboardType="decimal-pad"
                    />
                    <FieldError message={editingProduct ? editFormErrors.price : createFormErrors.price} />
                  </View>
                  <View style={styles.flexInput}>
                    <TextInput
                      style={[styles.input, (editingProduct ? editFormErrors.stock : createFormErrors.stock) && styles.inputError]}
                      placeholder={`${t("farmer.stock")}`}
                      placeholderTextColor={colors.textMuted}
                      value={editingProduct ? editStock : stock}
                      onChangeText={editingProduct ? setEditStock : setStock}
                      keyboardType="number-pad"
                    />
                    <FieldError message={editingProduct ? editFormErrors.stock : createFormErrors.stock} />
                  </View>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    styles.multilineInput,
                    (editingProduct ? editFormErrors.detail : createFormErrors.detail) && styles.inputError,
                  ]}
                  placeholder={t("farmer.description")}
                  placeholderTextColor={colors.textMuted}
                  value={editingProduct ? editDetail : detail}
                  onChangeText={editingProduct ? setEditDetail : setDetail}
                  multiline
                />
                <FieldError message={editingProduct ? editFormErrors.detail : createFormErrors.detail} />
                <View style={styles.actionRow}>
                  {editingProduct ? (
                    <Pressable style={styles.secondaryButton} onPress={clearEditing}>
                      <Text style={styles.secondaryButtonText}>Cancel</Text>
                    </Pressable>
                  ) : null}
                  <Pressable
                    style={styles.primaryButton}
                    disabled={isSubmitting}
                    onPress={() => void (editingProduct ? onSaveProduct() : onCreateProduct())}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color={colors.primaryText} />
                    ) : (
                      <Text style={styles.primaryButtonText}>{editingProduct ? t("farmer.saveProduct") : t("farmer.createProduct")}</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : null}

            {activeTab === "account" ? (
              <>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{t("farmer.farmerProfile")}</Text>
                  <InfoRow label={t("farmer.farmName")} value={dashboard.farmer ? `${dashboard.farmer.first_name} ${dashboard.farmer.last_name}`.trim() : ""} />
                  <InfoRow label={t("farmer.ownerEmail")} value={dashboard.farmer?.email ?? ""} />
                  <InfoRow label={t("farmer.phone")} value={t("farmer.addInProfileSettings")} />
                  <InfoRow label={t("farmer.location")} value={dashboard.farmer?.address ?? t("farmer.noLocationYet")} />
                  <InfoRow label={t("farmer.status")} value={dashboard.farmer?.status ?? ""} />
                  <InfoRow
                    label={t("farmer.coordinates")}
                    value={
                      dashboard.farmer?.latitude && dashboard.farmer?.longitude
                        ? `${dashboard.farmer.latitude.toFixed(4)}, ${dashboard.farmer.longitude.toFixed(4)}`
                        : t("farmer.notSet")
                    }
                  />
                  <Pressable style={styles.primaryButton} onPress={() => router.push("/profile")}>
                    <Text style={styles.primaryButtonText}>{t("farmer.editProfile")}</Text>
                  </Pressable>
                </View>

                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.cardTitle}>{t("farmer.settings")}</Text>
                    <MaterialCommunityIcons name="tune-variant" size={18} color={colors.accent} />
                  </View>
                  <View style={styles.settingsRow}>
                    <View style={styles.menuLeft}>
                      <MaterialCommunityIcons name="translate" size={18} color={colors.text} />
                      <Text style={styles.menuText}>{t("farmer.language")}</Text>
                    </View>
                    <LanguageSwitcher />
                  </View>
                  <View style={styles.menuRowNoBorder}>
                    <View style={styles.menuLeft}>
                      <MaterialCommunityIcons name="theme-light-dark" size={18} color={colors.text} />
                      <Text style={styles.menuText}>{t("farmer.appearance")}</Text>
                    </View>
                    <ThemeToggleButton />
                  </View>
                  <Pressable
                    style={styles.logoutButton}
                    onPress={async () => {
                      await signOut();
                      router.replace("/sign-in");
                    }}
                  >
                    <MaterialCommunityIcons name="logout" size={16} color={colors.primaryText} />
                    <Text style={styles.logoutButtonText}>{t("farmer.logout")}</Text>
                  </Pressable>
                </View>

                <View style={styles.card}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.cardTitle}>{t("farmer.reviewsAndRatings")}</Text>
                    <Text style={styles.badgeText}>{dashboard.summary.averageRating.toFixed(1)} / 5</Text>
                  </View>
                  {reviews.length === 0 ? (
                    <Text style={styles.helperText}>{t("farmer.noReviewsYet")}</Text>
                  ) : (
                    reviews.map((review) => (
                      <View key={review.id} style={styles.reviewRow}>
                        <View style={styles.sectionHeader}>
                          <Text style={styles.productTitle}>
                            {review.user.first_name} {review.user.last_name}
                          </Text>
                          <Text style={styles.ratingText}>{"★".repeat(review.rating)}</Text>
                        </View>
                        <Text style={styles.productMeta}>{review.product?.product_name ?? "Farm review"}</Text>
                        {review.comment ? <Text style={styles.reviewText}>{review.comment}</Text> : null}
                      </View>
                    ))
                  )}
                </View>
              </>
            ) : null}
          </>
        ) : null}
      </ScrollView>
      <BottomNavBar
        currentPath={pathname}
        accountActive={activeTab === "account"}
        onAccountPress={() => setActiveTab("account")}
      />

      <OrderDetailModal
        orderItem={selectedOrderItem}
        onClose={() => setSelectedOrderItem(null)}
      />
    </SafeAreaView>
  );

  function StatCard({
    icon,
    label,
    value,
  }: {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    label: string;
    value: string;
  }) {
    return (
      <View style={styles.statCard}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.accent} />
        <Text style={styles.statNumber} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );
  }

  function ProductImagePicker({
    imageUri,
    error,
    onPress,
  }: {
    imageUri: string;
    error?: string;
    onPress: () => void;
  }) {
    return (
      <View style={styles.imagePickerBlock}>
        <Pressable style={[styles.imagePicker, error && styles.inputError]} onPress={onPress}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.imagePickerEmpty}>
              <MaterialCommunityIcons name="image-plus" size={28} color={colors.accent} />
              <Text style={styles.imagePickerText}>Choose product image</Text>
            </View>
          )}
          <View style={styles.imagePickerAction}>
            <MaterialCommunityIcons name="folder-image" size={16} color={colors.primaryText} />
            <Text style={styles.imagePickerActionText}>{imageUri ? "Replace image" : "Browse storage"}</Text>
          </View>
        </Pressable>
        <FieldError message={error} />
      </View>
    );
  }

  function FieldError({ message }: { message?: string }) {
    return message ? <Text style={styles.fieldErrorText}>{message}</Text> : null;
  }

  function ProductCard({
    product,
    busy,
    onEdit,
    onToggle,
    onDelete,
  }: {
    product: FarmerProduct;
    busy: boolean;
    onEdit: () => void;
    onToggle: () => void;
    onDelete: () => void;
  }) {
    return (
      <Pressable style={({ pressed }: { pressed?: boolean }) => [styles.productRow, pressed ? styles.cardPressed : null]} onPress={() => router.push(`/product/${product.id}`)}>
        <View style={styles.productTapArea}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          <View style={styles.productDetails}>
            <Text style={styles.productTitle}>{product.product_name}</Text>
            <Text style={styles.productMeta}>
              {formatPrice(product.price, locale)} | {t("farmer.stock")}: {product.stock} | {product.status}
            </Text>
            {product.product_detail ? <Text style={styles.productMeta} numberOfLines={2}>{product.product_detail}</Text> : null}
          </View>
        </View>
        <View style={styles.productButtons}>
          <Pressable style={styles.iconButtonSmall} onPress={onEdit}>
            <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.text} />
          </Pressable>
          <Pressable style={styles.iconButtonSmall} disabled={busy} onPress={onToggle}>
            <MaterialCommunityIcons
              name={product.status === "ACTIVE" ? "pause-circle-outline" : "play-circle-outline"}
              size={16}
              color={colors.text}
            />
          </Pressable>
          <Pressable style={styles.iconButtonSmall} disabled={busy} onPress={onDelete}>
            <MaterialCommunityIcons name="delete-outline" size={16} color="#b91c1c" />
          </Pressable>
        </View>
      </Pressable>
    );
  }

  function OrderCard({
    item,
    compact,
    children,
    onPress,
  }: {
    item: FarmerOrderItem;
    compact?: boolean;
    children?: React.ReactNode;
    onPress?: () => void;
  }) {
    const buyerName = `${item.order.user.first_name} ${item.order.user.last_name}`.trim();
    const total = item.price * item.quantity;

    const Wrapper = onPress ? Pressable : View;

    return (
      <Wrapper style={({ pressed }: { pressed?: boolean }) => [styles.orderCard, onPress && pressed ? styles.cardPressed : null]} onPress={onPress}>
        <View style={styles.sectionHeader}>
          <Text style={styles.productTitle}>{item.product.product_name}</Text>
          <Text style={styles.statusBadge}>{item.status}</Text>
        </View>
        <Text style={styles.productMeta}>Buyer: {buyerName || item.order.user.email}</Text>
        <Text style={styles.productMeta}>{t("farmer.qty")}: {item.quantity} | {t("farmer.total")}: {formatPrice(total, locale)}</Text>
        {!compact ? (
          <>
            <Text style={styles.productMeta}>
              Delivery: {item.order.address.addressLine1}, {item.order.address.city}
            </Text>
            <Text style={styles.productMeta}>
              Payment: {item.order.payment?.provider ?? "N/A"} | {item.order.payment?.status ?? "N/A"}
            </Text>
          </>
        ) : null}
        {children}
      </Wrapper>
    );
  }

  function OrderDetailModal({
    orderItem,
    onClose,
  }: {
    orderItem: FarmerOrderItem | null;
    onClose: () => void;
  }) {
    if (!orderItem) {
      return null;
    }

    const buyerName = `${orderItem.order.user.first_name} ${orderItem.order.user.last_name}`.trim();
    const total = orderItem.price * orderItem.quantity;

    return (
      <Modal visible transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{orderItem.product.product_name}</Text>
                <Text style={styles.modalSubtitle}>Order #{orderItem.order.id.slice(-8).toUpperCase()}</Text>
              </View>
              <Pressable style={styles.modalCloseButton} onPress={onClose}>
                <MaterialCommunityIcons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Customer</Text>
              <InfoRow label="Name" value={buyerName || orderItem.order.user.email} />
              <InfoRow label="Email" value={orderItem.order.user.email} />
              <InfoRow label="Phone" value={orderItem.order.address.phone} />
              <InfoRow label="Delivery" value={`${orderItem.order.address.addressLine1}, ${orderItem.order.address.city}`} />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Order Info</Text>
              <InfoRow label="Item" value={orderItem.product.product_name} />
              <InfoRow label="Quantity" value={String(orderItem.quantity)} />
              <InfoRow label={t("farmer.price")} value={formatPrice(orderItem.price, locale)} />
              <InfoRow label={t("farmer.total")} value={formatPrice(total, locale)} />
              <InfoRow label="Delivery status" value={orderItem.order.status} />
              <InfoRow label="Item status" value={orderItem.status} />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Payment</Text>
              <InfoRow label="Method" value={orderItem.order.payment?.method ?? "N/A"} />
              <InfoRow label="Payment status" value={orderItem.order.payment?.status ?? "N/A"} />
              <InfoRow label="Provider" value={orderItem.order.payment?.provider ?? "N/A"} />
              <InfoRow label="Transaction ref" value={orderItem.order.payment?.transactionRef ?? "N/A"} />
            </View>

            <Pressable style={styles.primaryButton} onPress={onClose}>
              <Text style={styles.primaryButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  function InfoRow({ label, value }: { label: string; value: string }) {
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    );
  }
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
      padding: 20,
      paddingBottom: 112,
      gap: 12,
    },
    centerScreen: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    headerText: {
      flex: 1,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: "900",
    },
    subtitle: {
      color: colors.textMuted,
      marginTop: 3,
      lineHeight: 19,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    stockChart: {
      gap: 14,
    },
    stockChartRow: {
      gap: 8,
    },
    stockChartHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    stockChartLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: "700",
    },
    stockChartValue: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
    },
    stockChartTrack: {
      width: "100%",
      height: 12,
      borderRadius: 999,
      backgroundColor: colors.surfaceAlt,
      overflow: "hidden",
    },
    stockChartFill: {
      height: "100%",
      borderRadius: 999,
    },
    statCard: {
      width: "48%",
      minHeight: 104,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      gap: 5,
      justifyContent: "center",
    },
    statNumber: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 17,
    },
    statLabel: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: "800",
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 10,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 16,
    },
    badgeText: {
      color: colors.accent,
      backgroundColor: colors.accentSoft,
      overflow: "hidden",
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      fontWeight: "900",
      fontSize: 12,
    },
    linkText: {
      color: colors.accent,
      fontWeight: "900",
      fontSize: 12,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.surfaceAlt,
      color: colors.text,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    inputError: {
      borderColor: "#b91c1c",
    },
    fieldErrorText: {
      color: "#b91c1c",
      fontSize: 12,
      fontWeight: "700",
      marginTop: -5,
    },
    imagePickerBlock: {
      gap: 8,
    },
    imagePicker: {
      minHeight: 184,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      overflow: "hidden",
      justifyContent: "center",
    },
    imagePreview: {
      width: "100%",
      height: 184,
      backgroundColor: colors.surface,
    },
    imagePickerEmpty: {
      minHeight: 184,
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    imagePickerText: {
      color: colors.text,
      fontWeight: "900",
    },
    imagePickerAction: {
      position: "absolute",
      right: 10,
      bottom: 10,
      minHeight: 36,
      borderRadius: 10,
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    imagePickerActionText: {
      color: colors.primaryText,
      fontWeight: "900",
      fontSize: 12,
    },
    multilineInput: {
      minHeight: 84,
      textAlignVertical: "top",
    },
    twoColumn: {
      flexDirection: "row",
      gap: 10,
    },
    flexInput: {
      flex: 1,
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
    },
    primaryButton: {
      flex: 1,
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 42,
      paddingHorizontal: 12,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontWeight: "900",
    },
    secondaryButton: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 42,
      paddingHorizontal: 12,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "800",
    },
    iconButton: {
      width: 42,
      height: 42,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    iconButtonSmall: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    centerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    helperText: {
      color: colors.textSubtle,
      lineHeight: 19,
    },
    errorText: {
      color: "#b91c1c",
      backgroundColor: colors.dangerSoft,
      borderRadius: 10,
      padding: 10,
    },
    productRow: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      padding: 10,
      gap: 10,
    },
    productTapArea: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    productImage: {
      width: 58,
      height: 58,
      borderRadius: 10,
      backgroundColor: colors.surface,
    },
    productDetails: {
      flex: 1,
      gap: 3,
    },
    productTitle: {
      color: colors.text,
      fontWeight: "800",
    },
    menuLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    settingsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    menuRowNoBorder: {
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 8,
    },
    menuText: {
      color: colors.text,
      fontWeight: "700",
    },
    logoutButton: {
      marginTop: 4,
      borderRadius: 12,
      backgroundColor: "#dc2626",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 44,
      paddingHorizontal: 14,
      flexDirection: "row",
      gap: 8,
    },
    logoutButtonText: {
      color: colors.primaryText,
      fontWeight: "900",
    },
    productMeta: {
      color: colors.textSubtle,
      fontSize: 12,
      lineHeight: 17,
    },
    productButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: 8,
    },
    productLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
    },
    alertProductRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      padding: 10,
      gap: 8,
    },
    warningText: {
      color: "#b45309",
      fontWeight: "900",
      fontSize: 12,
    },
    orderCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      padding: 12,
      gap: 5,
    },
    cardPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.995 }],
    },
    statusBadge: {
      color: colors.accent,
      backgroundColor: colors.accentSoft,
      overflow: "hidden",
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
      fontWeight: "900",
      fontSize: 11,
    },
    orderActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingTop: 6,
    },
    smallButton: {
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    smallButtonText: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 12,
    },
    transactionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      padding: 10,
      gap: 8,
    },
    infoRow: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      paddingVertical: 9,
      gap: 3,
    },
    infoLabel: {
      color: colors.textSubtle,
      fontWeight: "800",
      fontSize: 12,
    },
    infoValue: {
      color: colors.text,
      fontWeight: "800",
      lineHeight: 19,
    },
    reviewRow: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceAlt,
      padding: 12,
      gap: 5,
    },
    ratingText: {
      color: colors.accent,
      fontWeight: "900",
    },
    reviewText: {
      color: colors.text,
      lineHeight: 19,
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(15, 23, 42, 0.55)",
      justifyContent: "center",
      padding: 16,
    },
    modalCard: {
      borderRadius: 24,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 14,
      maxHeight: "88%",
    },
    modalHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: "900",
    },
    modalSubtitle: {
      color: colors.textSubtle,
      marginTop: 2,
      fontSize: 12,
      fontWeight: "700",
    },
    modalCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    modalSection: {
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      gap: 8,
    },
    modalSectionTitle: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 14,
      marginBottom: 2,
    },
  });
