'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './Auth';
import { useRouter } from 'next/navigation';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  offerPrice?: number;
  image?: string; // single image path
  currency: {
    symbol: string;
    code: string;
  };
  quantity: number;
}

export interface ProductForCartInput {
  _id: string;
  name: string | undefined;
  price: number;
  offerPrice?: number;
  image?: string;
  currency: { symbol: string; code: string };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductForCartInput, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getTotalPriceInCurrency: (currencyCode: string) => number;
  // Coupon functionality
  appliedCoupon: any | null;
  couponDiscount: number;
  setCouponDiscount: (coupon: any, discount: number) => void;
  removeCoupon: () => void;
  getFinalTotal: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponDiscount, setCouponDiscountAmount] = useState<number>(0);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Load cart and coupon from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }

    // Load applied coupon
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
      try {
        const { coupon, discount } = JSON.parse(savedCoupon);
        setAppliedCoupon(coupon);
        setCouponDiscountAmount(discount);
      } catch (error) {
        console.error('Error loading coupon from localStorage:', error);
        localStorage.removeItem('appliedCoupon');
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: ProductForCartInput, quantity: number) => {
    // Check if user is authenticated before adding to cart
    if (!isAuthenticated) {
      // Store the product temporarily and redirect to login
      localStorage.setItem('pendingCartItem', JSON.stringify({ product, quantity }));
      router.push('/login');
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item._id === product._id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(item =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        const newItem: CartItem = {
          _id: product._id,
          name: product.name || '',
          price: product.price,
          offerPrice: product.offerPrice,
          image: product.image,
          currency: product.currency,
          quantity
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item._id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    removeCoupon(); // Also clear any applied coupon
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      const price = item.offerPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getTotalPriceInCurrency = (currencyCode: string) => {
    // For now, return the total in the first item's currency
    // In a real app, you'd implement currency conversion
    return getTotalPrice();
  };

  // Coupon functions
  const setCouponDiscount = (coupon: any, discount: number) => {
    setAppliedCoupon(coupon);
    setCouponDiscountAmount(discount);
    // Save to localStorage
    localStorage.setItem('appliedCoupon', JSON.stringify({ coupon, discount }));
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscountAmount(0);
    localStorage.removeItem('appliedCoupon');
  };

  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    return Math.max(0, subtotal - couponDiscount);
  };

  // Check for pending cart items after login
  useEffect(() => {
    if (isAuthenticated) {
      const pendingItem = localStorage.getItem('pendingCartItem');
      if (pendingItem) {
        try {
          const { product, quantity } = JSON.parse(pendingItem);
          addToCart(product, quantity);
          localStorage.removeItem('pendingCartItem');
        } catch (error) {
          console.error('Error processing pending cart item:', error);
          localStorage.removeItem('pendingCartItem');
        }
      }
    }
  }, [isAuthenticated]);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getTotalPriceInCurrency,
    // Coupon values
    appliedCoupon,
    couponDiscount,
    setCouponDiscount,
    removeCoupon,
    getFinalTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
