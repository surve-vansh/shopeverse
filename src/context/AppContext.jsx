import { createContext, useContext, useEffect, useState } from "react";

const AppContext = createContext(null);

export const useApp = () => useContext(AppContext); 
export function ThemeSync() {
  const { dark } = useApp();
  useEffect(() => {
    dark ? document.body.classList.add("dark")
         : document.body.classList.remove("dark");
  }, [dark]);
  return null;
}
export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem("sv_theme") === "dark");


  useEffect(() => {
    fetchProducts();
    const saved = localStorage.getItem("sv_user");
    if (saved) setUser(JSON.parse(saved));
    const savedCart = localStorage.getItem("sv_cart");
    if (savedCart) setCart(JSON.parse(savedCart));
    const savedFavs = localStorage.getItem("sv_favs");
    if (savedFavs) setFavorites(JSON.parse(savedFavs));
  }, []);

  useEffect(() => {
    if (cart.length) localStorage.setItem("sv_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (favorites.length) localStorage.setItem("sv_favs", JSON.stringify(favorites));
  }, [favorites]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("https://fakestoreapi.com/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 2800);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    showNotif(`"${product.title.slice(0, 28)}…" added to cart!`);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.id !== id));
  const updateQty = (id, qty) => {
    if (qty < 1) return removeFromCart(id);
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, qty } : i));
  };

  const toggleFav = (product) => {
    setFavorites((prev) => {
      const exists = prev.find((i) => i.id === product.id);
      if (exists) { showNotif("Removed from wishlist", "info"); return prev.filter((i) => i.id !== product.id); }
      showNotif("Added to wishlist ♥", "success");
      return [...prev, product];
    });
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("sv_user", JSON.stringify(userData));
    showNotif(`Welcome back, ${userData.name}! 👋`);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sv_user");
    showNotif("Logged out successfully", "info");
  };

  const toggleTheme = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("sv_theme", next ? "dark" : "light");
      return next;
    });
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <AppContext.Provider value={{ user, cart, favorites,dark , toggleTheme, products, loading, notification, cartTotal, cartCount, addToCart, removeFromCart, updateQty, toggleFav, login, logout, showNotif }}>
      {children}
    </AppContext.Provider>
  );

}
