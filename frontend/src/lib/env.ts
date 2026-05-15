const rawApiUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const env = {
  clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "",
  apiUrl: rawApiUrl.replace(/\/+$/g, ""),
};
