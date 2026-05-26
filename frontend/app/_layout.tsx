import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as SecureStore from "expo-secure-store";

import { CartProvider } from "@/context/CartContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { env } from "@/lib/env";

WebBrowser.maybeCompleteAuthSession();

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={env.clerkPublishableKey} tokenCache={tokenCache}>
      <LanguageProvider>
        <ThemeProvider>
          <ToastProvider>
            <CartProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "fade",
                  animationDuration: 220,
                  contentStyle: { backgroundColor: "#f8fafc" },
                }}
              />
            </CartProvider>
          </ToastProvider>
        </ThemeProvider>
      </LanguageProvider>
    </ClerkProvider>
  );
}
