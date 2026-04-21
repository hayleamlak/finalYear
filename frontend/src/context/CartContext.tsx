import * as SecureStore from "expo-secure-store";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { CartItem, ProductSummary } from "@/types/product";

type CartContextValue = {
  isReady: boolean;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: ProductSummary, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getQuantityForProduct: (productId: string) => number;
};

const CART_STORAGE_KEY = "fyp_mobile_cart_v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function clampQuantity(quantity: number, maxStock: number) {
  if (maxStock <= 0) {
    return 0;
  }

  return Math.min(Math.max(quantity, 1), maxStock);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const serialized = await SecureStore.getItemAsync(CART_STORAGE_KEY);

        if (!serialized) {
          setIsReady(true);
          return;
        }

        const parsed = JSON.parse(serialized) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      } catch {
        setItems([]);
      } finally {
        setIsReady(true);
      }
    };

    void hydrate();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    void SecureStore.setItemAsync(CART_STORAGE_KEY, JSON.stringify(items));
  }, [isReady, items]);

  const value = useMemo<CartContextValue>(() => {
    const addItem = (product: ProductSummary, quantity = 1) => {
      if (quantity <= 0 || product.stock <= 0) {
        return;
      }

      setItems((current) => {
        const existing = current.find((item) => item.product.id === product.id);
        if (!existing) {
          const nextQuantity = clampQuantity(quantity, product.stock);
          return [...current, { product, quantity: nextQuantity }];
        }

        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: clampQuantity(item.quantity + quantity, item.product.stock) }
            : item,
        );
      });
    };

    const removeItem = (productId: string) => {
      setItems((current) => current.filter((item) => item.product.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
      setItems((current) => {
        if (quantity <= 0) {
          return current.filter((item) => item.product.id !== productId);
        }

        return current.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: clampQuantity(quantity, item.product.stock) }
            : item,
        );
      });
    };

    const clearCart = () => {
      setItems([]);
    };

    const getQuantityForProduct = (productId: string) =>
      items.find((item) => item.product.id === productId)?.quantity ?? 0;

    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.product.price * item.quantity, 0);

    return {
      isReady,
      items,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getQuantityForProduct,
    };
  }, [isReady, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
