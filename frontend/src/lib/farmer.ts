import { apiFetch } from "@/lib/api";
import {
  FarmerDashboardResponse,
  FarmerOrderStatus,
  FarmerProduct,
  FarmerProductUpdatePayload,
} from "@/types/farmer";

type FarmerProductResponse = {
  success: boolean;
  data: FarmerProduct;
};

export async function fetchFarmerDashboard(token: string): Promise<FarmerDashboardResponse> {
  return apiFetch<FarmerDashboardResponse>("/api/v1/farmer/dashboard", {
    method: "GET",
    token,
  });
}

export async function updateFarmerProduct(
  token: string,
  productId: string,
  payload: FarmerProductUpdatePayload,
): Promise<FarmerProductResponse> {
  return apiFetch<FarmerProductResponse>(`/api/v1/farmer/products/${productId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteFarmerProduct(token: string, productId: string): Promise<FarmerProductResponse> {
  return apiFetch<FarmerProductResponse>(`/api/v1/farmer/products/${productId}`, {
    method: "DELETE",
    token,
  });
}

export async function updateFarmerOrderItemStatus(
  token: string,
  orderItemId: string,
  status: FarmerOrderStatus,
): Promise<{ success: boolean }> {
  return apiFetch<{ success: boolean }>(`/api/v1/farmer/order-items/${orderItemId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}
