import { useAuth } from "../../context/AppContext";
import { useCart } from "../../context/AppContext";

export default function CartPanel({ onClose, onCheckout }) {
  const { isLoggedIn }                            = useAuth();
  const { cart, removeFromCart, updateQty, cartTotal } = useCart();

  // Safety: if somehow opened while not logged in, show locked state
  if (!isLoggedIn) {
    return (
      <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="sv-cart-panel">
          <div className="sv-cart-header">
            <h2 className="sv-cart-title">Cart</h2>
            <button className="sv-modal-close" style={{ position: "static" }} onClick={onClose}>✕</button>
          </div>
          <div className="sv-cart-items" style={{ justifyContent: "center", alignItems: "center", display: "flex" }}>
            <div className="sv-cart-empty" style={{ padding: "4rem 2rem" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔐</div>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--ink)" }}>Login Required</p>
              <p style={{ color: "var(--mid)", fontSize: "0.875rem" }}>
                Please login to view and manage your cart.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const discount = cartTotal * 0.1;
  const gst      = (cartTotal - discount) * 0.18;
  const grand    = cartTotal - discount + gst;

  return (
    <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sv-cart-panel">
        <div className="sv-cart-header">
          <h2 className="sv-cart-title">
            Your Cart
            {cart.length > 0 && (
              <span style={{ fontSize: "0.875rem", fontWeight: 400, color: "var(--mid)", marginLeft: "0.5rem" }}>
                ({cart.length} item{cart.length !== 1 ? "s" : ""})
              </span>
            )}
          </h2>
          <button className="sv-modal-close" style={{ position: "static" }} onClick={onClose}>✕</button>
        </div>

        {/* ── Items list ─────────────────────────────────────────────── */}
        <div className="sv-cart-items">
          {cart.length === 0 ? (
            <div className="sv-cart-empty">
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🛒</div>
              <p style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--ink)" }}>Your cart is empty</p>
              <p style={{ color: "var(--mid)", fontSize: "0.875rem" }}>
                Browse products and add items to get started!
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="sv-cart-item">
                <img src={item.image} alt={item.title} className="sv-cart-item-img" />
                <div className="sv-cart-item-info">
                  <div className="sv-cart-item-title">{item.title}</div>
                  <div className="sv-cart-item-price">
                    ${(item.price * item.qty).toFixed(2)}
                    {item.qty > 1 && (
                      <span style={{ fontSize: "0.7rem", color: "var(--mid)", marginLeft: "0.4rem" }}>
                        (${item.price.toFixed(2)} each)
                      </span>
                    )}
                  </div>
                  <div className="sv-qty-ctrl">
                    <button className="sv-qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                    <span className="sv-qty-val">{item.qty}</span>
                    <button className="sv-qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                  </div>
                </div>
                <button className="sv-cart-remove" onClick={() => removeFromCart(item.id)} title="Remove">✕</button>
              </div>
            ))
          )}
        </div>

        {/* ── Footer with totals ─────────────────────────────────────── */}
        <div className="sv-cart-footer">
          {cart.length > 0 && (
            <div style={{ marginBottom: "0.75rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--mid)" }}>
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#16a34a", fontWeight: 600 }}>
                <span>Discount (10%)</span><span>− ${discount.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--mid)" }}>
                <span>GST (18%)</span><span>${gst.toFixed(2)}</span>
              </div>
              <div style={{ height: 1, background: "var(--border)", margin: "0.25rem 0" }} />
            </div>
          )}
          <div className="sv-cart-total-row">
            <span className="sv-cart-total-label">Total</span>
            <span className="sv-cart-total-val">${cart.length > 0 ? grand.toFixed(2) : "0.00"}</span>
          </div>
          <button
            className="sv-btn sv-btn-gold"
            style={{ width: "100%", padding: "0.9rem", fontSize: "0.95rem", opacity: cart.length === 0 ? 0.5 : 1, cursor: cart.length === 0 ? "not-allowed" : "pointer" }}
            onClick={() => cart.length > 0 && onCheckout?.()}
            disabled={cart.length === 0}
          >
            {cart.length === 0 ? "Cart is Empty" : "Proceed to Checkout →"}
          </button>
        </div>
      </div>
    </div>
  );
}
