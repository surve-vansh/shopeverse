import { useState, useEffect } from "react";
import { useAuth } from "../../context/AppContext";
import { useCart } from "../../context/AppContext";
import { useUI   } from "../../context/AppContext";

export default function Navbar({ onSection, openAuth, openCart, openProfile }) {
  const { user, isLoggedIn }        = useAuth();
  const { cartCount }               = useCart();
  const { favorites, dark, toggleTheme } = useUI();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const cats = ["Men", "Women", "Kids", "Electronics"];

  return (
    <nav className="sv-nav" style={scrolled ? { boxShadow: "0 4px 24px rgba(0,0,0,0.07)" } : {}}>
      <div className="sv-logo" onClick={() => onSection("hero")}>Shop<span>Verse</span></div>

      <ul className="sv-nav-links">
        {[["Home","hero"],["About","about"],["Contact","contact"]].map(([label, sec]) => (
          <li key={sec} className="sv-nav-link" onClick={() => onSection(sec)}>{label}</li>
        ))}
        <li className="sv-nav-link sv-dropdown">
          Products ▾
          <div className="sv-dropdown-menu">
            {cats.map((c) => (
              <div key={c} className="sv-dropdown-item" onClick={() => onSection("products", c.toLowerCase())}>{c}</div>
            ))}
          </div>
        </li>
      </ul>

      <div className="sv-nav-actions">
        <button className="sv-theme-btn" onClick={toggleTheme} title={dark ? "Switch to Light" : "Switch to Dark"} aria-label="Toggle theme">
          <div className="sv-theme-knob">{dark ? "🌙" : "☀️"}</div>
        </button>

        {/* Cart: shows badge only when logged in */}
        <button
          className="sv-icon-btn"
          onClick={openCart}
          title={isLoggedIn ? "Cart" : "Login to view cart"}
          style={{ position: "relative" }}
        >
          🛒
          {isLoggedIn && cartCount > 0 && <span className="sv-badge">{cartCount}</span>}
          {!isLoggedIn && <span className="sv-badge" style={{ background: "var(--mid)", fontSize: "0.5rem" }}>🔐</span>}
        </button>

        {/* Wishlist */}
        <button className="sv-icon-btn" title={isLoggedIn ? "Wishlist" : "Login to save"} onClick={isLoggedIn ? openProfile : openAuth}>
          ♥
          {isLoggedIn && favorites.length > 0 && <span className="sv-badge">{favorites.length}</span>}
        </button>

        {/* Profile / Sign In */}
        {user ? (
          <button className="sv-icon-btn" onClick={openProfile} title="Profile">
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg,#c9a84c,#c1440e)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </button>
        ) : (
          <button className="sv-btn sv-btn-primary" onClick={openAuth}>Sign In</button>
        )}
      </div>
    </nav>
  );
}
