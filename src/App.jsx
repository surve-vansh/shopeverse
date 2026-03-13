import { useState } from "react";
import { AppProvider, ThemeSync } from "./context/AppContext";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import HeroSection from "./components/sections/HeroSection";
import ProductsSection from "./components/sections/ProductsSection";
import AboutSection from "./components/sections/AboutSection";
import ContactSection from "./components/sections/ContactSection";

import AuthModal from "./components/modals/AuthModal";
import CartPanel from "./components/modals/CartPanel";
import ProfileModal from "./components/modals/ProfileModal";

import Notification from "./components/ui/Notification";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [filterCat, setFilterCat] = useState(null);

  const scrollToSection = (id, cat) => {
    if (cat) setFilterCat(cat);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AppProvider>
      <ThemeSync />
      <Navbar
        onSection={scrollToSection}
        openAuth={() => setShowAuth(true)}
        openCart={() => setShowCart(true)}
        openProfile={() => setShowProfile(true)}
      />

      <main>
        <HeroSection onSection={scrollToSection} />
        <ProductsSection filterCat={filterCat} />
        <AboutSection />
        <ContactSection />
      </main>

      <Footer onSection={scrollToSection} />

      <Notification />

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showCart && <CartPanel onClose={() => setShowCart(false)} />}
      {showProfile && (
        <ProfileModal
          onClose={() => setShowProfile(false)}
          openAuth={() => {
            setShowProfile(false);
            setShowAuth(true);
          }}
        />
      )}

    </AppProvider>
  );
}