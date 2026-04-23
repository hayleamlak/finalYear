import { apiFetch } from "@/lib/api";
import { ProfileResponse, UpdateProfilePayload } from "@/types/profile";

export async function fetchMyProfile(token: string): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/api/v1/auth/profile", {
    method: "GET",
    token,
  });
}

export async function updateMyProfile(token: string, payload: UpdateProfilePayload): Promise<ProfileResponse> {
  return apiFetch<ProfileResponse>("/api/v1/auth/profile", {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}
