import { useAuth, useUser } from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ThemeToggleButton } from "@/components/theme/ThemeToggleButton";
import { useTheme } from "@/context/ThemeContext";
import { apiFetch } from "@/lib/api";
import { getRoleFromUser, toBackendRole } from "@/lib/role";
import { ProductListResponse, ProductSummary } from "@/types/product";

type CreateProductResponse = {
  success: boolean;
  data: ProductSummary;
};

export default function FarmerDashboardScreen() {
  const router = useRouter();
  const { isSignedIn, getToken, isLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState("");
  const [detail, setDetail] = useState("");

  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const role = getRoleFromUser(user);

  const stats = useMemo(() => {
    const totalStock = products.reduce((sum, item) => sum + item.stock, 0);
    const totalValue = products.reduce((sum, item) => sum + item.price * item.stock, 0);

    return {
      totalProducts: products.length,
      totalStock,
      totalValue,
    };
  }, [products]);

  useEffect(() => {
    const loadMyProducts = async () => {
      if (!isSignedIn || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setErrorMessage(null);
        setIsLoading(true);
        const response = await apiFetch<ProductListResponse>("/api/v1/products?page=1&limit=50");
        setProducts(response.data.items.filter((item) => item.farmer_id === user.id));
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unable to load products.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadMyProducts();
  }, [isSignedIn, user]);

  const onCreateProduct = async () => {
    if (!user || isSubmitting) {
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);

    if (!name.trim() || !image.trim() || !Number.isFinite(numericPrice) || !Number.isFinite(numericStock)) {
      setErrorMessage("Please fill all required fields with valid values.");
      return;
    }

    try {
      setErrorMessage(null);
      setIsSubmitting(true);

      const token = await getToken();
      if (!token) {
        throw new Error("Missing auth token");
      }

      const response = await apiFetch<CreateProductResponse>("/api/v1/products", {
        method: "POST",
        token,
        body: JSON.stringify({
          product_name: name.trim(),
          farmer_id: user.id,
          price: numericPrice,
          stock: Math.max(0, Math.floor(numericStock)),
          image: image.trim(),
          product_detail: detail.trim() || undefined,
          role: toBackendRole(role),
        }),
      });

      setProducts((current) => [response.data, ...current]);
      setName("");
      setPrice("");
      setStock("");
      setImage("");
      setDetail("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to create product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || !isUserLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerRow}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.helperText}>Loading...</Text>
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
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Farmer Dashboard</Text>
            <Text style={styles.subtitle}>Manage your products and track your inventory.</Text>
          </View>
          <ThemeToggleButton />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalStock}</Text>
            <Text style={styles.statLabel}>Stock Units</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalValue.toFixed(0)} ETB</Text>
            <Text style={styles.statLabel}>Inventory Value</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Product</Text>
          <TextInput
            style={styles.input}
            placeholder="Product name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            placeholderTextColor={colors.textMuted}
            value={price}
            onChangeText={setPrice}
            keyboardType="decimal-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Stock"
            placeholderTextColor={colors.textMuted}
            value={stock}
            onChangeText={setStock}
            keyboardType="number-pad"
          />
          <TextInput
            style={styles.input}
            placeholder="Image URL"
            placeholderTextColor={colors.textMuted}
            value={image}
            onChangeText={setImage}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Product detail"
            placeholderTextColor={colors.textMuted}
            value={detail}
            onChangeText={setDetail}
            multiline
          />

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Pressable style={styles.primaryButton} disabled={isSubmitting} onPress={() => void onCreateProduct()}>
            {isSubmitting ? <ActivityIndicator color={colors.primaryText} /> : <Text style={styles.primaryButtonText}>Create Product</Text>}
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>My Products</Text>
          {isLoading ? (
            <View style={styles.centerRow}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.helperText}>Loading...</Text>
            </View>
          ) : products.length === 0 ? (
            <Text style={styles.helperText}>No products yet.</Text>
          ) : (
            products.map((item) => (
              <View key={item.id} style={styles.productRow}>
                <View style={styles.productLeft}>
                  <MaterialCommunityIcons name="leaf" size={18} color={colors.accent} />
                  <View>
                    <Text style={styles.productTitle}>{item.product_name}</Text>
                    <Text style={styles.productMeta}>Stock: {item.stock}</Text>
                  </View>
                </View>
                <Text style={styles.productPrice}>{item.price} ETB</Text>
              </View>
            ))
          )}
        </View>

        <Pressable style={styles.secondaryButton} onPress={() => router.push("/account") }>
          <Text style={styles.secondaryButtonText}>Open Account Settings</Text>
        </Pressable>
      </ScrollView>
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
  dangerSoft: string;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: 20,
      gap: 12,
    },
    headerRow: {
      marginBottom: 8,
      gap: 10,
    },
    title: {
      color: colors.text,
      fontSize: 30,
      fontWeight: "900",
    },
    subtitle: {
      color: colors.textMuted,
      marginTop: 4,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 12,
      gap: 4,
    },
    statNumber: {
      color: colors.text,
      fontWeight: "900",
      fontSize: 16,
    },
    statLabel: {
      color: colors.textSubtle,
      fontSize: 12,
      fontWeight: "700",
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 14,
      gap: 10,
    },
    cardTitle: {
      color: colors.text,
      fontWeight: "800",
      fontSize: 16,
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
    multilineInput: {
      minHeight: 84,
      textAlignVertical: "top",
    },
    errorText: {
      color: "#b91c1c",
      backgroundColor: colors.dangerSoft,
      borderRadius: 8,
      padding: 8,
    },
    primaryButton: {
      borderRadius: 10,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 42,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
    centerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    helperText: {
      color: colors.textSubtle,
    },
    productRow: {
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
    productLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flex: 1,
    },
    productTitle: {
      color: colors.text,
      fontWeight: "700",
    },
    productMeta: {
      color: colors.textSubtle,
      fontSize: 12,
    },
    productPrice: {
      color: colors.accent,
      fontWeight: "800",
    },
    secondaryButton: {
      marginBottom: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: "center",
      paddingVertical: 10,
    },
    secondaryButtonText: {
      color: colors.text,
      fontWeight: "700",
    },
  });
