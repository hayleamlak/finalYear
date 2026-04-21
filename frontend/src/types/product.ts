export type ProductSummary = {
  id: string;
  product_name: string;
  price: number;
  stock: number;
  image: string;
  product_detail: string | null;
  farmer_id: string;
  createdAt: string;
};

export type ProductListResponse = {
  success: boolean;
  data: {
    items: ProductSummary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export type ProductDetails = {
  id: string;
  product_name: string;
  farmer_id: string;
  price: number;
  stock: number;
  image: string;
  product_detail: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  farmer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  description: {
    id: string;
    product_id: string;
    origion: string;
    flavorNotes: string | null;
    roastLevel: string | null;
    processingMethod: string | null;
    processed: string | null;
    grindType: string | null;
    grindSizes: string | null;
    isSustainable: string;
    createdAt: string;
    updatedAt: string;
  } | null;
};

export type ProductDetailsResponse = {
  success: boolean;
  data: ProductDetails;
};