export type FarmerProductStatus = "ACTIVE" | "INACTIVE" | "DORMANT" | "PAUSED";
export type FarmerOrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CONFIRMED" | "CANCELLED";
export type FarmerPaymentStatus = "PAID" | "UNPAID" | "FAILED";

export type FarmerProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string | null;
  language: string;
  status: FarmerProductStatus;
  latitude: number | null;
  longitude: number | null;
  locationUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FarmerProduct = {
  id: string;
  product_name: string;
  farmer_id: string;
  price: number;
  stock: number;
  image: string;
  product_detail: string | null;
  status: FarmerProductStatus;
  createdAt: string;
  updatedAt: string;
};

export type FarmerOrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  status: FarmerOrderStatus;
  product: {
    id: string;
    product_name: string;
    image: string;
  };
  order: {
    id: string;
    status: FarmerOrderStatus;
    createdAt: string;
    updatedAt: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    };
    address: {
      id: string;
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2: string | null;
      city: string;
      region: string;
      country: string;
    };
    payment: {
      id: string;
      amount: number;
      method: string;
      status: FarmerPaymentStatus;
      provider: string | null;
      transactionRef: string | null;
      paidAt: string | null;
      createdAt: string;
    } | null;
  };
};

export type FarmerReview = {
  id: string;
  user_id: string;
  order_id: string;
  type: "PRODUCT" | "FARMER";
  rating: number;
  comment: string | null;
  product_id: string | null;
  farmer_id: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
  };
  product: {
    id: string;
    product_name: string;
  } | null;
};

export type FarmerDashboardResponse = {
  success: boolean;
  data: {
    farmer: FarmerProfile;
    products: FarmerProduct[];
    orderItems: FarmerOrderItem[];
    reviews: FarmerReview[];
    summary: {
      totalProducts: number;
      activeProducts: number;
      pendingOrders: number;
      completedOrders: number;
      paidOrders: number;
      totalEarnings: number;
      lowStockProducts: number;
      outOfStockProducts: number;
      averageRating: number;
      reviewCount: number;
    };
    earnings: {
      today: number;
      week: number;
      month: number;
      total: number;
      paidAmount: number;
      pendingAmount: number;
    };
  };
};

export type FarmerProductUpdatePayload = Partial<{
  product_name: string;
  price: number;
  stock: number;
  image: string;
  product_detail: string | null;
  status: "ACTIVE" | "INACTIVE" | "PAUSED";
}>;
