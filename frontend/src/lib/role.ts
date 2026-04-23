export type AppRole = "farmer" | "buyer";

type UserLike = {
  publicMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
};

export function normalizeRole(role: unknown): AppRole {
  if (typeof role !== "string") {
    return "buyer";
  }

  const normalized = role.toLowerCase();
  if (normalized === "farmer" || normalized === "seller") {
    return "farmer";
  }

  return "buyer";
}

export function getRoleFromUser(user: UserLike | null | undefined): AppRole {
  if (!user) {
    return "buyer";
  }

  const unsafeRole = user.unsafeMetadata?.role;
  if (unsafeRole) {
    return normalizeRole(unsafeRole);
  }

  const publicRole = user.publicMetadata?.role;
  return normalizeRole(publicRole);
}

export function dashboardForRole(role: AppRole): "/farmer-dashboard" | "/buyer-dashboard" {
  return role === "farmer" ? "/farmer-dashboard" : "/buyer-dashboard";
}

export function toBackendRole(role: AppRole): "SELLER" | "BUYER" {
  return role === "farmer" ? "SELLER" : "BUYER";
}
