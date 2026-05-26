import { useAuth } from "@clerk/clerk-expo";
import { useLocalSearchParams, usePathname, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";

import { BottomNavBar } from "@/components/navigation/BottomNavBar";
import { LoadingState } from "@/components/ui/LoadingState";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/context/ToastContext";
import { apiFetch } from "@/lib/api";

type VerifyState = "loading" | "success" | "failed";

export default function ChapaReturnScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const { tx_ref } = useLocalSearchParams<{ tx_ref?: string }>();
  const { getToken } = useAuth();
  const { clearCart } = useCart();
  const { showToast } = useToast();
  const { colors } = useTheme();
  const { t } = useLanguage();
  const [state, setState] = useState<VerifyState>("loading");
  const [message, setMessage] = useState(t("payment.verifying"));
  const handledTxRef = useRef<string | null>(null);
  const didAutoNavigate = useRef(false);
  const autoNavTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!tx_ref || Array.isArray(tx_ref)) {
        if (!cancelled) {
          setState("failed");
          setMessage(t("payment.missingReference"));
        }
        return;
      }

      if (handledTxRef.current === tx_ref) {
        return;
      }
      handledTxRef.current = tx_ref;

      try {
        const token = await getToken();
        if (!token) {
          throw new Error(t("payment.signInRequired"));
        }

        await apiFetch<{ success: boolean }>("/api/v1/orders/chapa/verify", {
          method: "POST",
          token,
          body: JSON.stringify({ tx_ref }),
        });

        if (!cancelled) {
          clearCart();
          setState("success");
          setMessage(t("payment.successMessage"));
          showToast({
            title: t("payment.successTitle"),
            message: t("payment.successToast"),
            variant: "success",
          });

          if (!didAutoNavigate.current) {
            didAutoNavigate.current = true;
            autoNavTimer.current = setTimeout(() => {
              router.replace("/products");
            }, 1200);
          }
        }
      } catch (error) {
        if (!cancelled) {
          setState("failed");
          setMessage(error instanceof Error ? error.message : t("payment.verifyFailed"));
          showToast({
            title: t("payment.verifyFailedTitle"),
            message: error instanceof Error ? error.message : t("payment.verifyFailed"),
            variant: "error",
          });
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      if (autoNavTimer.current) {
        clearTimeout(autoNavTimer.current);
      }
    };
  }, [clearCart, getToken, router, showToast, tx_ref]);

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {state === "loading" ? (
          <LoadingState title={t("payment.processing")} subtitle={message} cards={1} compact />
        ) : (
          <>
            <Text style={styles.title}>{state === "success" ? t("payment.complete") : t("payment.failed")}</Text>
            <Text style={styles.message}>{message}</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.replace("/products")}>
              <Text style={styles.primaryButtonText}>{state === "success" ? t("common.continueShopping") : t("common.backToProducts")}</Text>
            </Pressable>
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
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryText: string;
}) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
      gap: 14,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: "800",
      textAlign: "center",
    },
    message: {
      color: colors.textMuted,
      textAlign: "center",
      lineHeight: 22,
    },
    primaryButton: {
      marginTop: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    primaryButtonText: {
      color: colors.primaryText,
      fontWeight: "800",
    },
  });
