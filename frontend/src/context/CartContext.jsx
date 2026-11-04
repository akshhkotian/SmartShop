import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, showToast, trackActivity } = useAuth();
  
  const [cart, setCart] = useState({
    items: [],
    subtotal: 0.0,
    discount: 0.0,
    shipping: 0.0,
    total: 0.0,
    item_count: 0
  });
  
  const [wishlist, setWishlist] = useState([]);
  const [loadingCart, setLoadingCart] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setCart({ items: [], subtotal: 0, discount: 0, shipping: 0, total: 0, item_count: 0 });
      return;
    }
    try {
      setLoadingCart(true);
      const res = await api.get('/cart');
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    } finally {
      setLoadingCart(false);
    }
  };

  const fetchWishlist = async () => {
    if (!user) {
      setWishlist([]);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      setWishlist(res.data.items || []);
    } catch (err) {
      console.error('Failed to fetch wishlist:', err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [user]);

  const addToCart = async (productId, quantity = 1, productObj = null) => {
    if (!user) {
      showToast('Please log in to add items to your shopping cart.', 'info');
      return false;
    }
    try {
      const res = await api.post('/cart/add', { product_id: productId, quantity });
      showToast(res.data.message || 'Added to cart!');
      await fetchCart();
      if (productObj) {
        trackActivity('cart_add', { product_id: productId, category_id: productObj.category_id });
      }
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add item to cart.';
      showToast(msg, 'error');
      return false;
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!user) return;
    try {
      await api.put('/cart/update', { product_id: productId, quantity });
      await fetchCart();
    } catch (err) {
      showToast('Failed to update quantity.', 'error');
    }
  };

  const removeFromCart = async (productId) => {
    if (!user) return;
    try {
      await api.delete(`/cart/remove/${productId}`);
      showToast('Item removed from cart.');
      await fetchCart();
    } catch (err) {
      showToast('Failed to remove item.', 'error');
    }
  };

  const clearCart = async () => {
    if (!user) return;
    try {
      await api.post('/cart/clear');
      await fetchCart();
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const toggleWishlist = async (productId, productObj = null) => {
    if (!user) {
      showToast('Please log in to save items to your wishlist.', 'info');
      return;
    }
    try {
      const res = await api.post('/wishlist/toggle', { product_id: productId });
      showToast(res.data.message);
      await fetchWishlist();
      if (productObj && res.data.in_wishlist) {
        trackActivity('wishlist_add', { product_id: productId, category_id: productObj.category_id });
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Wishlist update failed.';
      showToast(msg, 'error');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => Number(item.product_id) === Number(productId));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loadingCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        refreshCart: fetchCart,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
