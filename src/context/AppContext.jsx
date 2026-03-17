import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Two separate contexts so consumers only re-render when their slice changes
// ─────────────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const CartContext = createContext(null);
const UIContext   = createContext(null);

export const useAuth = () => useContext(AuthContext);
export const useCart = () => useContext(CartContext);
export const useUI   = () => useContext(UIContext);

// Legacy single hook — works for components that need everything
export const useApp = () => ({
  ...useContext(AuthContext),
  ...useContext(CartContext),
  ...useContext(UIContext),
});

// ── ThemeSync ─────────────────────────────────────────────────────────────────
export function ThemeSync() {
  const { dark } = useUI();
  useEffect(() => {
    dark ? document.body.classList.add("dark") : document.body.classList.remove("dark");
  }, [dark]);
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const CART_KEY   = (uid) => `sv_cart_${uid}`;
const FAVS_KEY   = (uid) => `sv_favs_${uid}`;
const ORDERS_KEY = (uid) => `sv_orders_${uid}`;  // per-user order history

const safeJSON = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

// ─────────────────────────────────────────────────────────────────────────────
const fallbackProducts = [
  { id: 1, title: "Slim Fit Premium Shirt", price: 29.99, category: "men's clothing",  image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg", rating: { rate: 4.1, count: 259 } },
  { id: 2, title: "Casual Denim Jacket",    price: 55.99, category: "men's clothing",  image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg",                    rating: { rate: 4.7, count: 130 } },
  { id: 3, title: "Elegant Summer Dress",   price: 39.99, category: "women's clothing",image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_.jpg",                    rating: { rate: 3.6, count: 146 } },
  { id: 4, title: "Gold Chain Necklace",    price: 695,   category: "jewelery",         image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_FMwebp_QL65_.jpg",       rating: { rate: 4.6, count: 400 } },
];

// ─────────────────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {

  // ── Auth state ──────────────────────────────────────────────────────────────
  const [user, setUser] = useState(() => safeJSON("sv_user", null));

  // ── Cart — keyed per user so different accounts never share a cart ──────────
  const [cart, setCart] = useState(() => {
    const savedUser = safeJSON("sv_user", null);
    if (savedUser) return safeJSON(CART_KEY(savedUser.phone || savedUser.name), []);
    return [];   // guests have no cart state on load
  });

  // ── Favorites — also per user ───────────────────────────────────────────────
  const [favorites, setFavorites] = useState(() => {
    const savedUser = safeJSON("sv_user", null);
    if (savedUser) return safeJSON(FAVS_KEY(savedUser.phone || savedUser.name), []);
    return [];
  });

  // ── Order history — per user, persisted ────────────────────────────────────
  const [orders, setOrders] = useState(() => {
    const savedUser = safeJSON("sv_user", null);
    if (savedUser) return safeJSON(ORDERS_KEY(savedUser.phone || savedUser.name), []);
    return [];
  });

  // ── Products / UI ───────────────────────────────────────────────────────────
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [dark,         setDark]         = useState(() => localStorage.getItem("sv_theme") === "dark");
  const notifTimerRef = useRef(null);  // Fix: clear previous timer before setting new one

  // ── Persist cart to per-user key whenever it changes ───────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem(CART_KEY(user.phone || user.name), JSON.stringify(cart));
    }
    // Never persist cart for non-logged-in users — security best practice
  }, [cart, user]);

  // ── Persist favorites ───────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem(FAVS_KEY(user.phone || user.name), JSON.stringify(favorites));
    }
  }, [favorites, user]);

  // ── Persist order history ───────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      localStorage.setItem(ORDERS_KEY(user.phone || user.name), JSON.stringify(orders));
    }
  }, [orders, user]);

  // ── Fetch products ──────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        setProducts(data);
      } catch {
        setProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Toast notification ──────────────────────────────────────────────────────
  // Fix: always clear the previous timer so rapid calls don't cause flicker
  const showNotif = useCallback((msg, type = "success") => {
    clearTimeout(notifTimerRef.current);
    setNotification({ msg, type });
    notifTimerRef.current = setTimeout(() => setNotification(null), 2800);
  }, []);

  // ── AUTH ────────────────────────────────────────────────────────────────────
  const login = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem("sv_user", JSON.stringify(userData));
    // Load this user's saved cart, favorites and orders
    const savedCart = safeJSON(CART_KEY(userData.phone || userData.name), []);
    setCart(savedCart);
    const savedFavs = safeJSON(FAVS_KEY(userData.phone || userData.name), []);
    setFavorites(savedFavs);
    const savedOrders = safeJSON(ORDERS_KEY(userData.phone || userData.name), []);
    setOrders(savedOrders);
    showNotif(`Welcome back, ${userData.name}! 👋`);
  }, [showNotif]);

  const logout = useCallback(() => {
    if (user) {
      localStorage.setItem(CART_KEY(user.phone || user.name), JSON.stringify(cart));
    }
    setUser(null);
    setCart([]);
    setFavorites([]);
    setOrders([]);
    localStorage.removeItem("sv_user");
    showNotif("Logged out successfully", "info");
  }, [user, cart, showNotif]);

  // ── CART ────────────────────────────────────────────────────────────────────
  // Guard: all cart mutations check for login
  // qty param lets callers add multiple units in a single call (no loop needed)
  const addToCart = useCallback((product, qty = 1) => {
    if (!user) {
      showNotif("Please login to add items to cart 🔐", "warn");
      return false;
    }
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty }];
    });
    showNotif(`"${product.title.slice(0, 28)}…" added to cart!`);
    return true;
  }, [user, showNotif]);

  const removeFromCart = useCallback((id) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, [removeFromCart]);

  // ✅ Clear cart completely (called after successful order)
  const clearCart = useCallback(() => {
    setCart([]);
    if (user) {
      localStorage.setItem(CART_KEY(user.phone || user.name), JSON.stringify([]));
    }
  }, [user]);

  // ✅ Place order — handles loading state, validation, cart clear, order save
  const placeOrder = useCallback(async (cartSnapshot, total) => {
    if (!user) {
      showNotif("Please login to place an order 🔐", "warn");
      return { success: false, reason: "not_logged_in" };
    }
    if (cart.length === 0) {
      showNotif("Your cart is empty!", "warn");
      return { success: false, reason: "empty_cart" };
    }
    setOrderLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    const orderId = "SV" + Date.now().toString().slice(-8).toUpperCase();

    // Build order record and prepend to history (newest first)
    const newOrder = {
      orderId,
      placedAt:  new Date().toISOString(),
      items:     cartSnapshot || cart,        // snapshot passed from CheckoutPage
      total:     total ?? cart.reduce((s, i) => s + i.price * i.qty, 0),
      status:    "confirmed",
    };
    setOrders((prev) => [newOrder, ...prev]);

    clearCart();
    setOrderLoading(false);
    showNotif("Order placed successfully! 🎉");
    return { success: true, orderId };
  }, [user, cart, clearCart, showNotif]);

  // ── FAVORITES ───────────────────────────────────────────────────────────────
  const toggleFav = useCallback((product) => {
    if (!user) { showNotif("Please login to save favourites 🔐", "warn"); return; }
    setFavorites((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) { showNotif("Removed from wishlist", "info"); return prev.filter((i) => i.id !== product.id); }
      showNotif("Added to wishlist ♥");
      return [...prev, product];
    });
  }, [user, showNotif]);

  // ── THEME ───────────────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("sv_theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isLoggedIn = !!user;

  // ── Provide values split by concern ─────────────────────────────────────────
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, logout }}>
      <CartContext.Provider value={{ cart, cartTotal, cartCount, orders, orderLoading, addToCart, removeFromCart, updateQty, clearCart, placeOrder }}>
        <UIContext.Provider value={{ products, loading, notification, favorites, dark, toggleTheme, toggleFav, showNotif }}>
          {children}
        </UIContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
  );
}
