import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ToastVariant = "success" | "error" | "info";

type ToastPayload = {
  title: string;
  message?: string;
  variant?: ToastVariant;
  durationMs?: number;
};

type ToastState = {
  visible: boolean;
  title: string;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (payload: ToastPayload) => void;
  hideToast: () => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const variantStyleMap: Record<ToastVariant, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "#10b981",
    border: "#34d399",
    icon: "check-circle",
  },
  error: {
    bg: "#dc2626",
    border: "#f87171",
    icon: "close-circle",
  },
  info: {
    bg: "#2563eb",
    border: "#60a5fa",
    icon: "information",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    title: "",
    message: "",
    variant: "success",
  });
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setToast((current) => ({ ...current, visible: false }));
  }, []);

  const showToast = useCallback(
    ({ title, message = "", variant = "success", durationMs = 2200 }: ToastPayload) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setToast({
        visible: true,
        title,
        message,
        variant,
      });

      timeoutRef.current = setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, durationMs);
    },
    [],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
      hideToast,
    }),
    [hideToast, showToast],
  );

  const currentVariantStyle = variantStyleMap[toast.variant];

  return (
    <ToastContext.Provider value={value}>
      <View style={styles.container}>
        {children}
        {toast.visible ? (
          <Pressable
            style={[
              styles.toast,
              {
                backgroundColor: currentVariantStyle.bg,
                borderColor: currentVariantStyle.border,
              },
            ]}
            onPress={hideToast}
          >
            <MaterialCommunityIcons name={currentVariantStyle.icon as never} size={20} color="#ffffff" />
            <View style={styles.toastTextWrap}>
              <Text style={styles.toastTitle}>{toast.title}</Text>
              {toast.message ? <Text style={styles.toastMessage}>{toast.message}</Text> : null}
            </View>
          </Pressable>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toast: {
    position: "absolute",
    top: 52,
    left: 16,
    right: 16,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  toastTextWrap: {
    flex: 1,
    gap: 2,
  },
  toastTitle: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 14,
  },
  toastMessage: {
    color: "#ffffff",
    fontSize: 12,
    lineHeight: 16,
  },
});
