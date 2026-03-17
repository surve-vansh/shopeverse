import { useState } from "react";
import { useAuth } from "../../context/AppContext";
import { useCart } from "../../context/AppContext";
import { useUI   } from "../../context/AppContext";

const getStars = (r) => {
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
};

const catMap = {
  "men's clothing":  "Men",
  "women's clothing":"Women",
  "jewelery":        "Jewelry",
  "electronics":     "Electronics",
};

export default function ProductCard({ product, openAuth, searchQuery, onViewProduct }) {
  const { isLoggedIn }           = useAuth();
  const { addToCart }            = useCart();
  const { toggleFav, favorites } = useUI();
  const isFav  = favorites.some((f) => f.id === product.id);
  const [adding, setAdding] = useState(false);

  // Highlight matching text in title when a search is active
  const renderTitle = () => {
    if (!searchQuery) return product.title;
    const idx = product.title.toLowerCase().indexOf(searchQuery.toLowerCase());
    if (idx === -1) return product.title;
    return (
      <>
        {product.title.slice(0, idx)}
        <mark style={{ background: "rgba(201,168,76,0.35)", color: "inherit", borderRadius: 2, padding: "0 1px" }}>
          {product.title.slice(idx, idx + searchQuery.length)}
        </mark>
        {product.title.slice(idx + searchQuery.length)}
      </>
    );
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      // addToCart already shows a "please login" toast from context
      // but also open the auth modal via prop
      addToCart(product); // will show notif
      openAuth?.();
      return;
    }
    setAdding(true);
    addToCart(product);
    // Brief visual feedback on the button
    setTimeout(() => setAdding(false), 600);
  };

  const handleFav = () => {
    if (!isLoggedIn) { openAuth?.(); return; }
    toggleFav(product);
  };

  return (
    <div className="sv-card">
      {/* Clicking image or title opens detail page */}
      <div
        className="sv-card-img-wrap"
        style={{ cursor: "pointer" }}
        onClick={() => onViewProduct?.(product)}
      >
        <img src={product.image} alt={product.title} className="sv-card-img" loading="lazy" />
        <button
          className={`sv-card-fav${isFav ? " active" : ""}`}
          onClick={handleFav}
          title={isLoggedIn ? (isFav ? "Remove from wishlist" : "Add to wishlist") : "Login to save"}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
        {!isLoggedIn && (
          <div className="sv-card-login-hint">🔐 Login to cart</div>
        )}
      </div>
      <div className="sv-card-body">
        <div
          className="sv-card-cat"
          style={{ cursor: "pointer" }}
          onClick={() => onViewProduct?.(product)}
        >
          {catMap[product.category] || product.category}
        </div>
        <div
          className="sv-card-title"
          style={{ cursor: "pointer" }}
          onClick={() => onViewProduct?.(product)}
        >
          {renderTitle()}
        </div>
        <div className="sv-card-rating">
          <span className="sv-stars">{getStars(product.rating?.rate || 4)}</span>
          <span className="sv-rating-count">({product.rating?.count || 0})</span>
        </div>
        <div className="sv-card-footer">
          <span className="sv-price">${product.price.toFixed(2)}</span>
          <button
            className={`sv-add-btn${adding ? " sv-add-btn--added" : ""}${!isLoggedIn ? " sv-add-btn--locked" : ""}`}
            onClick={handleAddToCart}
            disabled={adding}
            title={!isLoggedIn ? "Login required" : "Add to cart"}
          >
            {adding ? "✓ Added" : !isLoggedIn ? "🔐 Login" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
