import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { getStorageData, STORAGE_KEYS } from '../lib/storage';

export function useCartCount() {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = async () => {
      if (user?.username) {
        try {
          const res = await apiService.getCart();
          if (res.data) {
            setCartCount(res.data.reduce((sum, item) => sum + (item.quantity || 1), 0));
          }
        } catch (e) {
          console.error("Failed to load cart count", e);
        }
      } else {
        const cart = getStorageData(STORAGE_KEYS.CART, undefined, []);
        setCartCount(cart.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
      }
    };

    updateCartCount();

    window.addEventListener('storage', updateCartCount);
    window.addEventListener('cart-updated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cart-updated', updateCartCount);
    };
  }, [user]);

  return { cartCount };
}
