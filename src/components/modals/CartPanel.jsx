import { useApp } from "../../context/AppContext";
import { useState } from "react";
function CartPanel({ onClose }) {
  const { cart, removeFromCart, updateQty, cartTotal, user } = useApp();

  return (
    <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sv-cart-panel">
        <div className="sv-cart-header">
          <h2 className="sv-cart-title">Your Cart ({cart.length})</h2>
          <button className="sv-modal-close" style={{ position: "static" }} onClick={onClose}>✕</button>
        </div>
        <div className="sv-cart-items">
          {cart.length === 0 ? (
            <div className="sv-cart-empty">
              <div className="sv-cart-empty-icon">🛒</div>
              <p>Your cart is empty.<br />Start adding some items!</p>
            </div>
          ) : cart.map((item) => (
            <div key={item.id} className="sv-cart-item">
              <img src={item.image} alt={item.title} className="sv-cart-item-img" />
              <div className="sv-cart-item-info">
                <div className="sv-cart-item-title">{item.title}</div>
                <div className="sv-cart-item-price">${(item.price * item.qty).toFixed(2)}</div>
                <div className="sv-qty-ctrl">
                  <button className="sv-qty-btn" onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span className="sv-qty-val">{item.qty}</span>
                  <button className="sv-qty-btn" onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
              </div>
              <button className="sv-cart-remove" onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))}
        </div>
        <div className="sv-cart-footer">
          <div className="sv-cart-total-row">
            <span className="sv-cart-total-label">Total</span>
            <span className="sv-cart-total-val">${cartTotal.toFixed(2)}</span>
          </div>
          <button className="sv-btn sv-btn-gold" style={{ width: "100%", padding: "0.9rem", fontSize: "0.95rem" }}
            onClick={() => alert(user ? "Proceeding to checkout… (demo)" : "Please sign in to checkout!")}>
            {user ? "Proceed to Checkout →" : "Sign In to Checkout →"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default CartPanel;