import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
function Navbar({ onSection, openAuth, openCart, openProfile }) {
  const { user, cartCount, favorites , dark , toggleTheme } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const cats = ["Men", "Women", "Kids", "Electronics"];

  return (
    <nav className="sv-nav flex items-center justify-between  fixed top-0 left-0 right-0 " style={scrolled ? { boxShadow: "0 4px 24px rgba(0,0,0,0.07)" } : {}}>
      <div className="sv-logo" onClick={() => onSection("hero")}>Shop<span>Verse</span></div>

      <ul className="sv-nav-links flex " >
        {[["Home", "hero"], ["About", "about"], ["Contact", "contact"]].map(([label, sec]) => (
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
        <button className="sv-theme-btn cursor-pointer" onClick={toggleTheme}>
          <div className="sv-theme-knob">
            {dark ? "🌙" : "☀️"}
            
          </div>
        </button>
        <button className="sv-icon-btn" onClick={openCart} title="Cart">
          🛒
          {cartCount > 0 && <span className="sv-badge">{cartCount}</span>}
        </button>
        <button className="sv-icon-btn" title="Wishlist" onClick={openProfile}>
          ♥
          {favorites.length > 0 && <span className="sv-badge">{favorites.length}</span>}
        </button>
        {user ? (
          <button className="sv-icon-btn" onClick={openProfile} title="Profile">
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #c1440e)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>
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

export default Navbar;