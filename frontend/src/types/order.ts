export type OrderItemSummary = {
  id: string;
  quantity: number;
  price: number;
  status: string;
  product: {
    id: string;
    product_name: string;
    image: string;
  };
};

export type OrderSummary = {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItemSummary[];
  payment: {
    id: string;
    amount: number;
    status: string;
    method: string;
    paidAt: string | null;
  } | null;
  address: {
    id: string;
    fullName: string;
    city: string;
    country: string;
  };
};

export type MyOrdersResponse = {
  success: boolean;
  data: {
    items: OrderSummary[];
    total: number;
  };
};
