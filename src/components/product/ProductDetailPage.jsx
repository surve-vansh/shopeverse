import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../../context/AppContext";
import { useCart } from "../../context/AppContext";
import { useUI   } from "../../context/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const catMap = {
  "men's clothing":  "Men",
  "women's clothing":"Women",
  "jewelery":        "Jewelry",
  "electronics":     "Electronics",
};

const getStars = (r) => {
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
};

// Generate deterministic fake reviews from a product's data
// (in a real app these would come from an API)
const REVIEWER_NAMES = [
  "Arjun S.", "Priya M.", "Rahul K.", "Sneha P.", "Vikram D.",
  "Ananya R.", "Karan J.", "Meera T.", "Deepak B.", "Riya C.",
];
const REVIEW_BODIES = [
  "Absolutely love this product! The quality is outstanding and it arrived in perfect condition. Would definitely buy again.",
  "Great value for money. Exactly as described in the listing. Fast delivery too — came within 3 days.",
  "Very satisfied with my purchase. The material feels premium and the finish is excellent.",
  "Good product overall. Fits well and looks exactly like the photos. Highly recommend.",
  "Exceeded my expectations honestly. Packaged really well and the quality speaks for itself.",
  "Decent quality but the colour is slightly different from the photo. Still happy with it.",
  "This is my second purchase from ShopVerse and both times I've been impressed.",
  "Perfect gift! The recipient absolutely loved it. Will order more for family and friends.",
  "The product is exactly what I needed. Sturdy, well-made and looks great.",
  "Shipping was fast and the product was well-packaged. Exactly as described.",
];

function generateReviews(product) {
  // Use product ID as a seed so reviews are consistent
  const seed = product.id;
  const count = 3 + (seed % 4); // 3-6 reviews
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    name:   REVIEWER_NAMES[(seed + i * 3) % REVIEWER_NAMES.length],
    rating: Math.max(3, Math.min(5, Math.round(product.rating?.rate || 4) - (i === 2 ? 1 : 0))),
    date:   new Date(Date.now() - (i + 1) * 8 * 24 * 60 * 60 * 1000)
              .toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
    body:   REVIEW_BODIES[(seed + i * 7) % REVIEW_BODIES.length],
    verified: i < 3,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components — all defined at MODULE SCOPE (never inside render)
// ─────────────────────────────────────────────────────────────────────────────

// Star rating display
function StarRow({ rating, count, size = "1rem" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
      <span style={{ color: "var(--gold)", fontSize: size, letterSpacing: "0.05em" }}>
        {getStars(rating)}
      </span>
      <span style={{ fontSize: "0.8rem", color: "var(--mid)" }}>
        {rating.toFixed(1)} ({count} reviews)
      </span>
    </div>
  );
}

// Rating breakdown bar
function RatingBar({ star, pct }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem" }}>
      <span style={{ color: "var(--mid)", width: 14, textAlign: "right" }}>{star}</span>
      <span style={{ color: "var(--gold)", fontSize: "0.7rem" }}>★</span>
      <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 50, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "var(--gold)", borderRadius: 50, transition: "width 0.6s ease" }} />
      </div>
      <span style={{ color: "var(--mid)", width: 28, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

// Single review card
function ReviewCard({ review }) {
  return (
    <div style={{
      padding: "1.25rem 0",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* Avatar circle */}
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--gold), var(--rust))",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0,
          }}>
            {review.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--ink)" }}>
              {review.name}
              {review.verified && (
                <span style={{
                  marginLeft: "0.5rem", fontSize: "0.65rem", fontWeight: 600,
                  background: "var(--green-light, #f0fdf4)", color: "#16a34a",
                  padding: "0.1rem 0.4rem", borderRadius: 50,
                }}>
                  ✓ Verified
                </span>
              )}
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--mid)" }}>{review.date}</div>
          </div>
        </div>
        <span style={{ color: "var(--gold)", fontSize: "0.85rem" }}>
          {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
        </span>
      </div>
      <p style={{ fontSize: "0.875rem", color: "var(--mid)", lineHeight: 1.6, margin: 0 }}>
        {review.body}
      </p>
    </div>
  );
}

// Related product card (smaller than the main ProductCard)
function RelatedCard({ product, onClick }) {
  const { isLoggedIn } = useAuth();
  const { addToCart }  = useCart();
  const { toggleFav, favorites } = useUI();
  const isFav = favorites.some((f) => f.id === product.id);

  return (
    <div
      className="sv-card"
      style={{ cursor: "pointer" }}
      onClick={() => onClick(product)}
    >
      <div className="sv-card-img-wrap" style={{ height: 180 }}>
        <img src={product.image} alt={product.title} className="sv-card-img" loading="lazy" />
        <button
          className={`sv-card-fav${isFav ? " active" : ""}`}
          onClick={(e) => { e.stopPropagation(); if (isLoggedIn) toggleFav(product); }}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>
      <div className="sv-card-body" style={{ padding: "1rem" }}>
        <div className="sv-card-cat">{catMap[product.category] || product.category}</div>
        <div className="sv-card-title" style={{ fontSize: "0.95rem" }}>{product.title}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.75rem" }}>
          <span className="sv-price" style={{ fontSize: "1.1rem" }}>${product.price.toFixed(2)}</span>
          <button
            className="sv-add-btn"
            style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
            onClick={(e) => {
              e.stopPropagation();
              if (isLoggedIn) addToCart(product);
            }}
          >
            + Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main ProductDetailPage
// ─────────────────────────────────────────────────────────────────────────────
export default function ProductDetailPage({ product, onBack, openAuth, onViewProduct }) {
  const { isLoggedIn }           = useAuth();
  const { addToCart, cart }      = useCart();
  const { toggleFav, favorites, products } = useUI();

  const isFav     = favorites.some((f) => f.id === product.id);
  const inCart    = cart.find((i) => i.id === product.id);
  const [qty,     setQty]     = useState(1);
  const [adding,  setAdding]  = useState(false);
  const [added,   setAdded]   = useState(false);
  const [activeTab, setActiveTab] = useState("description"); // description | reviews
  const [imgZoomed, setImgZoomed] = useState(false);

  // Scroll to top whenever product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAdded(false);
    setQty(1);
    setActiveTab("description");
  }, [product.id]);

  // Related products: same category, exclude current
  const related = useMemo(() => {
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [products, product.id, product.category]);

  // Reviews (deterministic fake data)
  const reviews = useMemo(() => generateReviews(product), [product.id]);

  // Rating breakdown percentages
  const breakdown = useMemo(() => {
    const base = product.rating?.rate || 4;
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      pct: Math.max(0, Math.round(
        star === Math.round(base)     ? 55 :
        star === Math.round(base) - 1 ? 25 :
        star === Math.round(base) + 1 ? 12 :
        star > base                   ? 5  : 3
      )),
    }));
  }, [product.id]);

  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) { openAuth?.(); return; }
    setAdding(true);
    // Fix: single call with qty param — no loop, no multiple toasts
    addToCart(product, qty);
    setTimeout(() => { setAdding(false); setAdded(true); }, 600);
  }, [isLoggedIn, addToCart, product, qty, openAuth]);

  const handleFav = useCallback(() => {
    if (!isLoggedIn) { openAuth?.(); return; }
    toggleFav(product);
  }, [isLoggedIn, toggleFav, product, openAuth]);

  const discount = Math.round(product.price * 0.1);
  const original = (product.price + discount).toFixed(2);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", paddingTop: "var(--nav-h)" }}>

      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "1.25rem 2rem 0",
        display: "flex", alignItems: "center", gap: "0.5rem",
        fontSize: "0.78rem", color: "var(--mid)",
      }}>
        <span style={{ cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={(e) => e.target.style.color = "var(--gold)"}
          onMouseLeave={(e) => e.target.style.color = "var(--mid)"}
          onClick={onBack}
        >
          Home
        </span>
        <span>›</span>
        <span style={{ cursor: "pointer", transition: "color 0.2s" }}
          onMouseEnter={(e) => e.target.style.color = "var(--gold)"}
          onMouseLeave={(e) => e.target.style.color = "var(--mid)"}
          onClick={onBack}
        >
          {catMap[product.category] || product.category}
        </span>
        <span>›</span>
        <span style={{ color: "var(--ink)", fontWeight: 500 }}>
          {product.title.slice(0, 40)}{product.title.length > 40 ? "…" : ""}
        </span>
      </div>

      {/* ── Main product area ────────────────────────────────────────── */}
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "2rem",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "3rem", alignItems: "start",
      }}
        className="pd-main-grid"
      >

        {/* ── LEFT: Product image ───────────────────────────────────── */}
        <div style={{ position: "sticky", top: "calc(var(--nav-h) + 1.5rem)" }}>
          {/* Main image */}
          <div
            style={{
              background: "var(--card-bg)",
              borderRadius: 20, border: "1px solid var(--border)",
              padding: "2.5rem", display: "flex", alignItems: "center",
              justifyContent: "center", height: 420, cursor: "zoom-in",
              overflow: "hidden", position: "relative",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
            onClick={() => setImgZoomed(true)}
          >
            <img
              src={product.image}
              alt={product.title}
              style={{
                maxHeight: "100%", maxWidth: "100%", objectFit: "contain",
                transition: "transform 0.4s",
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.08)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            />
            {/* Zoom hint */}
            <div style={{
              position: "absolute", bottom: "0.75rem", right: "0.75rem",
              background: "rgba(15,13,10,0.5)", color: "white",
              fontSize: "0.65rem", padding: "0.2rem 0.5rem", borderRadius: 50,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              🔍 Click to zoom
            </div>
          </div>

          {/* Thumbnail strip (same image for demo — real app would have multiple) */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            {[product.image, product.image, product.image].map((img, i) => (
              <div key={i} style={{
                width: 72, height: 72, borderRadius: 10,
                border: `2px solid ${i === 0 ? "var(--gold)" : "var(--border)"}`,
                background: "var(--card-bg)", padding: "0.35rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
                transition: "border-color 0.2s",
              }}>
                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Product info ───────────────────────────────────── */}
        <div>
          {/* Category + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <span style={{
              fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "var(--gold)",
            }}>
              {catMap[product.category] || product.category}
            </span>
            <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 50 }}>
              In Stock
            </span>
            <span style={{ background: "var(--orange-light, #fff3ec)", color: "#e85d04", fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 50 }}>
              10% OFF
            </span>
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
            fontWeight: 400, color: "var(--ink)", lineHeight: 1.2,
            marginBottom: "1rem",
          }}>
            {product.title}
          </h1>

          {/* Rating */}
          <div style={{ marginBottom: "1.25rem" }}>
            <StarRow rating={product.rating?.rate || 4} count={product.rating?.count || 0} />
          </div>

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "2.2rem", fontWeight: 700, color: "var(--ink)",
            }}>
              ${product.price.toFixed(2)}
            </span>
            <span style={{ fontSize: "1rem", color: "var(--mid)", textDecoration: "line-through" }}>
              ${original}
            </span>
            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#16a34a" }}>
              Save ${discount.toFixed(2)}
            </span>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "var(--border)", marginBottom: "1.5rem" }} />

          {/* Quantity selector */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--mid)", letterSpacing: "0.05em", display: "block", marginBottom: "0.5rem" }}>
              QUANTITY
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                display: "flex", alignItems: "center",
                border: "1.5px solid var(--border)", borderRadius: 10, overflow: "hidden",
              }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: 38, height: 38, border: "none", background: "none",
                    cursor: "pointer", fontSize: "1.1rem", color: "var(--ink)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "var(--border)"}
                  onMouseLeave={(e) => e.target.style.background = "none"}
                >−</button>
                <span style={{
                  width: 40, textAlign: "center", fontSize: "0.95rem",
                  fontWeight: 700, color: "var(--ink)",
                }}>{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(10, q + 1))}
                  style={{
                    width: 38, height: 38, border: "none", background: "none",
                    cursor: "pointer", fontSize: "1.1rem", color: "var(--ink)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.target.style.background = "var(--border)"}
                  onMouseLeave={(e) => e.target.style.background = "none"}
                >+</button>
              </div>
              {inCart && (
                <span style={{ fontSize: "0.78rem", color: "var(--mid)" }}>
                  ({inCart.qty} already in cart)
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <button
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                flex: 1, padding: "0.9rem 1.5rem",
                background: added ? "#16a34a" : adding ? "var(--mid)" : "var(--ink)",
                color: "white", border: "none", borderRadius: 12,
                fontSize: "0.95rem", fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                cursor: adding ? "not-allowed" : "pointer",
                transition: "all 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              }}
              onMouseEnter={(e) => { if (!adding && !added) e.currentTarget.style.background = "var(--gold)"; }}
              onMouseLeave={(e) => { if (!adding && !added) e.currentTarget.style.background = "var(--ink)"; }}
            >
              {adding ? "Adding…" : added ? "✓ Added to Cart" : !isLoggedIn ? "🔐 Login to Add" : `Add ${qty > 1 ? `${qty} items` : "to Cart"}`}
            </button>

            {/* Wishlist button */}
            <button
              onClick={handleFav}
              style={{
                width: 50, height: 50, border: `1.5px solid ${isFav ? "var(--rust)" : "var(--border)"}`,
                borderRadius: 12, background: isFav ? "#fff0f0" : "var(--card-bg)",
                cursor: "pointer", fontSize: "1.25rem",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", flexShrink: 0,
              }}
              title={isFav ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isFav ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Trust badges */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem", marginBottom: "1.5rem",
          }}>
            {[
              { icon: "🚚", label: "Free Delivery",    sub: "On orders above ₹499" },
              { icon: "🔄", label: "Easy Returns",     sub: "30-day return window" },
              { icon: "✅", label: "Authentic Product", sub: "100% genuine guarantee" },
              { icon: "🔒", label: "Secure Payment",   sub: "SSL encrypted checkout" },
            ].map((b) => (
              <div key={b.label} style={{
                display: "flex", alignItems: "center", gap: "0.6rem",
                background: "var(--card-bg)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "0.75rem",
              }}>
                <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--ink)" }}>{b.label}</div>
                  <div style={{ fontSize: "0.65rem", color: "var(--mid)" }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Product meta */}
          <div style={{ fontSize: "0.78rem", color: "var(--mid)", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span><strong style={{ color: "var(--ink)" }}>SKU:</strong> SV{product.id.toString().padStart(6, "0")}</span>
            <span><strong style={{ color: "var(--ink)" }}>Category:</strong> {catMap[product.category] || product.category}</span>
            <span><strong style={{ color: "var(--ink)" }}>Availability:</strong> <span style={{ color: "#16a34a" }}>In Stock</span></span>
          </div>
        </div>
      </div>

      {/* ── Description + Reviews tabs ───────────────────────────────── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 3rem" }}>
        <div style={{
          background: "var(--card-bg)", borderRadius: 20,
          border: "1px solid var(--border)",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          overflow: "hidden",
        }}>
          {/* Tab bar */}
          <div style={{
            display: "flex", borderBottom: "1px solid var(--border)",
            padding: "0 2rem",
          }}>
            {[
              { key: "description", label: "Description" },
              { key: "reviews",     label: `Reviews (${reviews.length})` },
              { key: "shipping",    label: "Shipping & Returns" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: "1rem 1.5rem", border: "none", background: "none",
                  cursor: "pointer", fontSize: "0.875rem", fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  color: activeTab === tab.key ? "var(--ink)" : "var(--mid)",
                  borderBottom: activeTab === tab.key ? "2px solid var(--gold)" : "2px solid transparent",
                  marginBottom: -1, transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "2rem" }}>

            {/* Description tab */}
            {activeTab === "description" && (
              <div style={{ animation: "fadeIn 0.25s ease" }}>
                <h3 style={{
                  fontFamily: "'Cormorant Garamond', serif", fontSize: "1.4rem",
                  fontWeight: 400, color: "var(--ink)", marginBottom: "1rem",
                }}>
                  About this product
                </h3>
                <p style={{
                  color: "var(--mid)", lineHeight: 1.8, fontSize: "0.95rem",
                  marginBottom: "1.5rem", maxWidth: 760,
                }}>
                  {product.description ||
                    `Experience premium quality with the ${product.title}. 
                     Crafted with attention to detail and designed to meet the highest standards, 
                     this product combines functionality with elegant aesthetics. 
                     Perfect for everyday use, it delivers exceptional performance and lasting durability. 
                     Whether you're treating yourself or looking for the ideal gift, 
                     this is a purchase you'll be completely satisfied with.`
                  }
                </p>
                {/* Feature list */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.75rem" }}>
                  {[
                    "✦ Premium quality materials",
                    "✦ Rigorously quality-tested",
                    "✦ Elegant packaging included",
                    "✦ Suitable for gifting",
                    "✦ 30-day return guarantee",
                    "✦ Authentic ShopVerse product",
                  ].map((feat) => (
                    <div key={feat} style={{
                      padding: "0.6rem 0.875rem",
                      background: "var(--card-img-bg)",
                      borderRadius: 8, fontSize: "0.82rem",
                      color: "var(--ink)", fontWeight: 500,
                    }}>
                      {feat}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === "reviews" && (
              <div style={{ animation: "fadeIn 0.25s ease" }}>
                <div style={{
                  display: "grid", gridTemplateColumns: "220px 1fr",
                  gap: "3rem", alignItems: "start",
                }}
                  className="pd-reviews-grid"
                >
                  {/* Rating summary */}
                  <div>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                      <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: "4rem", fontWeight: 300, color: "var(--ink)", lineHeight: 1,
                      }}>
                        {(product.rating?.rate || 4).toFixed(1)}
                      </div>
                      <div style={{ color: "var(--gold)", fontSize: "1.2rem", margin: "0.25rem 0" }}>
                        {getStars(product.rating?.rate || 4)}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--mid)" }}>
                        Based on {product.rating?.count || 0} reviews
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      {breakdown.map((b) => <RatingBar key={b.star} star={b.star} pct={b.pct} />)}
                    </div>
                  </div>

                  {/* Review list */}
                  <div>
                    {reviews.map((r) => <ReviewCard key={r.id} review={r} />)}
                    <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
                      <button className="sv-btn sv-btn-outline" style={{ padding: "0.6rem 1.5rem" }}>
                        Load More Reviews
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shipping tab */}
            {activeTab === "shipping" && (
              <div style={{ animation: "fadeIn 0.25s ease", maxWidth: 640 }}>
                {[
                  {
                    icon: "🚚", title: "Free Standard Delivery",
                    body: "Free shipping on all orders above ₹499. Standard delivery takes 3–5 business days. Orders are dispatched same-day if placed before 2 PM IST.",
                  },
                  {
                    icon: "⚡", title: "Express Delivery",
                    body: "Express delivery available at ₹99. Delivered within 1–2 business days. Available in 50+ cities across India.",
                  },
                  {
                    icon: "🔄", title: "Easy 30-Day Returns",
                    body: "Not satisfied? Return within 30 days for a full refund. Items must be unused, in original packaging. Initiate returns from your order history.",
                  },
                  {
                    icon: "🛡️", title: "Buyer Protection",
                    body: "Every purchase is protected by ShopVerse Buyer Protection. If your item doesn't arrive or doesn't match the description, we'll make it right.",
                  },
                ].map((item) => (
                  <div key={item.title} style={{
                    display: "flex", gap: "1rem",
                    padding: "1.25rem 0", borderBottom: "1px solid var(--border)",
                  }}>
                    <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem", fontSize: "0.9rem" }}>
                        {item.title}
                      </div>
                      <p style={{ color: "var(--mid)", fontSize: "0.85rem", lineHeight: 1.6, margin: 0 }}>
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Related products ────────────────────────────────────────── */}
      {related.length > 0 && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem 4rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <p className="sv-section-eyebrow">✦ You May Also Like</p>
            <h2 className="sv-section-title" style={{ fontSize: "1.6rem" }}>
              Related <em>Products</em>
            </h2>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}>
            {related.map((p) => (
              <RelatedCard
                key={p.id}
                product={p}
                onClick={onViewProduct}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Image zoom overlay ───────────────────────────────────────── */}
      {imgZoomed && (
        <div
          onClick={() => setImgZoomed(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 3000,
            background: "rgba(15,13,10,0.85)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out", animation: "fadeIn 0.2s ease",
          }}
        >
          <img
            src={product.image}
            alt={product.title}
            style={{
              maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain",
              borderRadius: 12, boxShadow: "0 20px 80px rgba(0,0,0,0.5)",
              animation: "popIn 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
          <button
            onClick={() => setImgZoomed(false)}
            style={{
              position: "absolute", top: "1.5rem", right: "1.5rem",
              background: "rgba(255,255,255,0.15)", border: "none",
              color: "white", width: 40, height: 40, borderRadius: "50%",
              cursor: "pointer", fontSize: "1.1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
