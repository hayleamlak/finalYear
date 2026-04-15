import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";

import { env } from "@/lib/env";

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
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}
