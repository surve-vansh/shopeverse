import { useState, useCallback } from "react";
import { AppProvider, ThemeSync, useAuth, useUI } from "./context/AppContext";
import Navbar           from "./components/layout/Navbar";
import Footer           from "./components/layout/Footer";
import HeroSection      from "./components/sections/HeroSection";
import ProductsSection  from "./components/sections/ProductsSection";
import AboutSection     from "./components/sections/AboutSection";
import ContactSection   from "./components/sections/ContactSection";
import AuthModal        from "./components/modals/AuthModal";
import CartPanel        from "./components/modals/CartPanel";
import ProfileModal     from "./components/modals/ProfileModal";
import Notification     from "./components/ui/Notification";
import CheckoutPage     from "./components/checkout/CheckoutPage";
import ProductDetailPage from "./components/product/ProductDetailPage";

// Inner component so hooks can access context
function AppShell() {
  const { isLoggedIn } = useAuth();
  const { showNotif }  = useUI();

  const [showAuth,      setShowAuth]      = useState(false);
  const [showCart,      setShowCart]      = useState(false);
  const [showProfile,   setShowProfile]   = useState(false);
  const [showCheckout,  setShowCheckout]  = useState(false);
  const [filterCat,     setFilterCat]     = useState(null);
  const [authCallback,  setAuthCallback]  = useState(null);
  const [activeProduct, setActiveProduct] = useState(null); // product detail view

  const scrollToSection = useCallback((id, cat) => {
    if (cat) setFilterCat(cat);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  // ── Open product detail page ──────────────────────────────────────────────
  const handleViewProduct = useCallback((product) => {
    setActiveProduct(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // ── Go back from product detail ───────────────────────────────────────────
  const handleBackFromDetail = useCallback(() => {
    setActiveProduct(null);
    // Small delay so scroll happens after re-render
    setTimeout(() => {
      const el = document.getElementById("products");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 50);
  }, []);

  // ── Guard: require login before opening cart ──────────────────────────────
  const handleOpenCart = useCallback(() => {
    if (!isLoggedIn) {
      showNotif("Please login to view your cart 🔐", "warn");
      setAuthCallback(() => () => setShowCart(true));
      setShowAuth(true);
      return;
    }
    setShowCart(true);
  }, [isLoggedIn, showNotif]);

  // ── Guard: require login before checkout ──────────────────────────────────
  const handleOpenCheckout = useCallback(() => {
    if (!isLoggedIn) {
      showNotif("Please login to proceed to checkout 🔐", "warn");
      setAuthCallback(() => () => setShowCheckout(true));
      setShowAuth(true);
      return;
    }
    setShowCart(false);
    setShowCheckout(true);
  }, [isLoggedIn, showNotif]);

  // ── After successful login: run any pending callback ──────────────────────
  const handleAuthSuccess = useCallback(() => {
    setShowAuth(false);
    if (authCallback) {
      authCallback();
      setAuthCallback(null);
    }
  }, [authCallback]);

  // ── Checkout page ─────────────────────────────────────────────────────────
  if (showCheckout) {
    return (
      <>
        <ThemeSync />
        <CheckoutPage onBack={() => setShowCheckout(false)} />
        <Notification />
      </>
    );
  }

  // ── Product detail page ───────────────────────────────────────────────────
  if (activeProduct) {
    return (
      <>
        <ThemeSync />
        <Navbar
          onSection={(id, cat) => { setActiveProduct(null); setTimeout(() => scrollToSection(id, cat), 50); }}
          openAuth={() => setShowAuth(true)}
          openCart={handleOpenCart}
          openProfile={() => setShowProfile(true)}
        />
        <ProductDetailPage
          product={activeProduct}
          onBack={handleBackFromDetail}
          openAuth={() => setShowAuth(true)}
          onViewProduct={handleViewProduct}
        />
        <Footer onSection={scrollToSection} />
        <Notification />
        {showAuth && (
          <AuthModal
            onClose={() => { setShowAuth(false); setAuthCallback(null); }}
            onSuccess={handleAuthSuccess}
          />
        )}
        {showCart && (
          <CartPanel onClose={() => setShowCart(false)} onCheckout={handleOpenCheckout} />
        )}
        {showProfile && (
          <ProfileModal
            onClose={() => setShowProfile(false)}
            openAuth={() => { setShowProfile(false); setShowAuth(true); }}
          />
        )}
      </>
    );
  }

  // ── Main homepage ─────────────────────────────────────────────────────────
  return (
    <>
      <ThemeSync />
      <Navbar
        onSection={scrollToSection}
        openAuth={() => setShowAuth(true)}
        openCart={handleOpenCart}
        openProfile={() => setShowProfile(true)}
      />
      <main>
        <HeroSection   onSection={scrollToSection} />
        <ProductsSection
          filterCat={filterCat}
          openAuth={() => setShowAuth(true)}
          onViewProduct={handleViewProduct}
        />
        <AboutSection />
        <ContactSection />
      </main>
      <Footer onSection={scrollToSection} />
      <Notification />

      {showAuth && (
        <AuthModal
          onClose={() => { setShowAuth(false); setAuthCallback(null); }}
          onSuccess={handleAuthSuccess}
        />
      )}
      {showCart && (
        <CartPanel onClose={() => setShowCart(false)} onCheckout={handleOpenCheckout} />
      )}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          openAuth={() => { setShowProfile(false); setShowAuth(true); }}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
