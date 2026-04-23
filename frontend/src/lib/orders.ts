import { apiFetch } from "@/lib/api";
import { MyOrdersResponse } from "@/types/order";

export async function fetchMyOrders(token: string): Promise<MyOrdersResponse> {
  return apiFetch<MyOrdersResponse>("/api/v1/orders/my", {
    method: "GET",
    token,
  });
}
