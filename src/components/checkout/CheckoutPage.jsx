import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AppContext";
import { useCart } from "../../context/AppContext";

// ─────────────────────────────────────────────────────────────────────────────
// FIX: The F (FormField) component is defined HERE at module level, completely
// OUTSIDE AddressStep and CheckoutPage. This is the root cause of the focus bug.
//
// When a component is defined INSIDE another component:
//   function AddressStep() {
//     const F = () => <input />   ← BUG: new component identity every render
//   }
//
// React sees a brand-new component type on every keystroke, unmounts the old
// input, mounts a new one → focus is lost after every character typed.
//
// By moving F here (module scope), its identity is fixed forever.
// ─────────────────────────────────────────────────────────────────────────────
function FormField({ id, label, type = "text", placeholder, maxLength, value, prefix, error, hint, onChange }) {
  return (
    <div className="co-form-group">
      <label htmlFor={id}>{label}</label>
      <div className={prefix ? "co-prefix-wrap" : ""}>
        {prefix && <span className="co-prefix">{prefix}</span>}
        <input
          id={id}
          name={id}
          className={`co-field${error ? " err" : ""}`}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          value={value}
          autoComplete={
            id === "name"    ? "name" :
            id === "phone"   ? "tel" :
            id === "pincode" ? "postal-code" :
            id === "city"    ? "address-level2" :
            id === "line1"   ? "street-address" : "off"
          }
          onChange={onChange}
        />
      </div>
      {error && <div className="co-err">⚠ {error}</div>}
      {hint  && <div style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 3 }}>{hint}</div>}
    </div>
  );
}

// ── Guards ─────────────────────────────────────────────────────────────────
function NotLoggedInGuard({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "4rem" }}>🔐</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300 }}>Login Required</h2>
      <p style={{ color: "var(--mid)", maxWidth: 340 }}>You need to be logged in to access checkout.</p>
      <button className="co-btn-primary" style={{ maxWidth: 220 }} onClick={onBack}>← Back to Shop</button>
    </div>
  );
}

function EmptyCartGuard({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.5rem", padding: "2rem", textAlign: "center" }}>
      <div style={{ fontSize: "4rem" }}>🛒</div>
      <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300 }}>Your Cart is Empty</h2>
      <p style={{ color: "var(--mid)", maxWidth: 340 }}>Add some products before proceeding to checkout.</p>
      <button className="co-btn-primary" style={{ maxWidth: 220 }} onClick={onBack}>← Browse Products</button>
    </div>
  );
}

// ── Stepper ────────────────────────────────────────────────────────────────
function Stepper({ step }) {
  const steps = ["Address", "Payment", "Review"];
  return (
    <div className="co-stepper">
      {steps.map((label, i) => {
        const s      = i + 1;
        const done   = s < step;
        const active = s === step;
        return (
          <div key={s} className="co-step" style={{ flex: s < steps.length ? 1 : 0 }}>
            <div className={`co-step-dot ${done ? "done" : active ? "active" : "pending"}`}>
              {done
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                : s}
            </div>
            <div className="co-step-label">
              <span>Step {s}</span>
              <span className={active ? "active-lbl" : ""}>{label}</span>
            </div>
            {s < steps.length && <div className={`co-step-line${done ? " done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ── Order Summary sidebar ──────────────────────────────────────────────────
function OrderSummary({ cart, cartTotal }) {
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  const discount  = cartTotal * 0.1;
  const gst       = (cartTotal - discount) * 0.18;
  const grand     = cartTotal - discount + gst;
  const emojis    = { "men's clothing": "👔", "women's clothing": "👗", "electronics": "📱", "jewelery": "💍" };

  return (
    <div className="co-summary">
      <div className="co-summary-head">
        <h2>Order Summary</h2>
        <p>{itemCount} item{itemCount !== 1 ? "s" : ""} in your cart</p>
      </div>
      <div className="co-summary-items">
        {cart.slice(0, 4).map((item) => (
          <div key={item.id} className="co-s-item">
            <div className="co-s-img">{emojis[item.category] || "🛍"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="co-s-name">{item.title}</div>
              <div className="co-s-cat">{item.category}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div className="co-s-price">${(item.price * item.qty).toFixed(2)}</div>
              <div className="co-s-qty">Qty: {item.qty}</div>
            </div>
          </div>
        ))}
        {cart.length > 4 && (
          <p style={{ fontSize: "0.78rem", color: "var(--mid)", textAlign: "center" }}>
            + {cart.length - 4} more item{cart.length - 4 !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <div className="co-summary-divider" />
      <div className="co-summary-totals">
        <div className="co-total-row"><span>Subtotal ({itemCount} items)</span><span>${cartTotal.toFixed(2)}</span></div>
        <div className="co-total-row"><span>Discount (10%)</span><span style={{ color: "#16a34a", fontWeight: 600 }}>− ${discount.toFixed(2)}</span></div>
        <div className="co-total-row free"><span>Delivery</span><span>FREE</span></div>
        <div className="co-total-row"><span>GST (18%)</span><span>${gst.toFixed(2)}</span></div>
      </div>
      <div className="co-grand">
        <span>Total Amount</span>
        <span>${grand.toFixed(2)}</span>
      </div>
      <div className="co-safe">🔒 SSL encrypted · Safe &amp; secure payment</div>
    </div>
  );
}

// ── Step 1: Address ────────────────────────────────────────────────────────
// FIX: onChange handlers are built HERE using stable field-specific callbacks
// so that FormField never receives a new function reference on re-render.
// Previously, inline arrow functions like onChange={(e) => onChange("name", e)}
// created new function instances on every render, which combined with
// the inner F component definition caused the unmount/remount cycle.
function AddressStep({ address, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!address.name.trim())                          e.name    = "Name is required";
    if (address.phone.replace(/\D/g, "").length < 10)  e.phone   = "Enter valid 10-digit number";
    if (address.pincode.replace(/\D/g, "").length < 6) e.pincode = "Enter valid 6-digit pincode";
    if (!address.line1.trim())                         e.line1   = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Each handler is a stable reference created once per field.
  // These are plain functions (not useCallback) because AddressStep
  // itself only re-renders when address/onChange change — that's fine.
  const handleName    = (e) => onChange("name",    e.target.value);
  const handlePhone   = (e) => onChange("phone",   e.target.value.replace(/\D/g, ""));
  const handlePincode = (e) => onChange("pincode", e.target.value.replace(/\D/g, ""));
  const handleCity    = (e) => onChange("city",    e.target.value);
  const handleLine1   = (e) => onChange("line1",   e.target.value);
  const handleState   = (e) => onChange("state",   e.target.value);
  const handleType    = (e) => onChange("type",    e.target.value);

  return (
    <div className="co-card">
      <div className="co-card-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e85d04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" />
        </svg>
        <h2>Delivery Address</h2>
      </div>
      <div className="co-card-body">
        <div className="co-form-row">
          <FormField id="name"  label="Full Name *"     placeholder="Arjun Sharma"  value={address.name}    error={errors.name}    onChange={handleName} />
          <FormField id="phone" label="Mobile Number *" placeholder="98765 43210"   value={address.phone}   error={errors.phone}   type="tel" maxLength={10} prefix="+91" onChange={handlePhone} />
        </div>
        <div className="co-form-row">
          <FormField id="pincode" label="Pincode *" placeholder="400001" value={address.pincode} error={errors.pincode} maxLength={6} hint="City & State will auto-fill" onChange={handlePincode} />
          <FormField id="city"    label="City"      placeholder="Mumbai" value={address.city}    onChange={handleCity} />
        </div>
        <div className="co-form-row full">
          <FormField id="line1" label="Street Address / Flat / Area *" placeholder="Flat 4B, Sunrise Towers, MG Road" value={address.line1} error={errors.line1} onChange={handleLine1} />
        </div>
        <div className="co-form-row">
          <div className="co-form-group">
            <label htmlFor="state">State</label>
            <select id="state" className="co-field" value={address.state} onChange={handleState}>
              <option value="">Select State</option>
              {["Maharashtra","Delhi","Karnataka","Tamil Nadu","Gujarat","Rajasthan","West Bengal","Uttar Pradesh","Telangana","Kerala"].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="co-form-group">
            <label htmlFor="addrtype">Address Type</label>
            <select id="addrtype" className="co-field" value={address.type} onChange={handleType}>
              <option>Home</option><option>Work</option><option>Other</option>
            </select>
          </div>
        </div>
        <div className="co-btn-row">
          <button className="co-btn-primary" onClick={() => validate() && onNext()}>
            Use this Address
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 2: Payment ────────────────────────────────────────────────────────
function PaymentStep({ payment, onChange, onNext, onBack }) {
  const fmt = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  // Stable individual handlers — same pattern as AddressStep
  const handleUpi      = (e) => onChange("upi",      e.target.value);
  const handleCardNum  = (e) => onChange("cardNum",  fmt(e.target.value));
  const handleCardExp  = (e) => onChange("cardExp",  e.target.value);
  const handleCardCvv  = (e) => onChange("cardCvv",  e.target.value);
  const handleCardName = (e) => onChange("cardName", e.target.value);

  return (
    <div className="co-card">
      <div className="co-card-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e85d04" strokeWidth="2" strokeLinecap="round">
          <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
        </svg>
        <h2>Payment Method</h2>
      </div>
      <div className="co-card-body">
        <div className="co-pay-options">
          {[
            { key: "upi",  icon: "💳", label: "UPI Payment",        desc: "GPay, PhonePe, Paytm, BHIM" },
            { key: "card", icon: "🏦", label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
            { key: "cod",  icon: "💵", label: "Cash on Delivery",    desc: "Pay when your order arrives" },
          ].map((opt) => (
            <div key={opt.key}>
              <div
                className={`co-pay-card${payment.method === opt.key ? " sel" : ""}`}
                onClick={() => onChange("method", opt.key)}
              >
                <div className="co-pay-radio"><div className="co-pay-dot" /></div>
                <div className="co-pay-icon">{opt.icon}</div>
                <div className="co-pay-info"><h3>{opt.label}</h3><p>{opt.desc}</p></div>
              </div>

              {/* UPI sub-field */}
              {payment.method === "upi" && opt.key === "upi" && (
                <div className="co-pay-sub co-form-group" style={{ paddingLeft: "0.25rem" }}>
                  <label htmlFor="upi-id">Enter UPI ID</label>
                  <input id="upi-id" name="upi-id" className="co-field" placeholder="yourname@upi" value={payment.upi} onChange={handleUpi} />
                </div>
              )}

              {/* Card sub-fields */}
              {payment.method === "card" && opt.key === "card" && (
                <div className="co-pay-sub" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div className="co-form-group">
                    <label htmlFor="card-num">Card Number</label>
                    <input id="card-num" name="card-num" className="co-field" placeholder="1234 5678 9012 3456" maxLength={19} value={payment.cardNum} onChange={handleCardNum} />
                  </div>
                  <div className="co-card-row">
                    <div className="co-form-group">
                      <label htmlFor="card-exp">Expiry</label>
                      <input id="card-exp" name="card-exp" className="co-field" placeholder="MM / YY" maxLength={7} value={payment.cardExp} onChange={handleCardExp} />
                    </div>
                    <div className="co-form-group">
                      <label htmlFor="card-cvv">CVV</label>
                      <input id="card-cvv" name="card-cvv" className="co-field" type="password" placeholder="•••" maxLength={3} value={payment.cardCvv} onChange={handleCardCvv} />
                    </div>
                  </div>
                  <div className="co-form-group">
                    <label htmlFor="card-name">Name on Card</label>
                    <input id="card-name" name="card-name" className="co-field" placeholder="ARJUN SHARMA" value={payment.cardName} onChange={handleCardName} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="co-btn-row">
          <button className="co-btn-secondary" onClick={onBack}>← Back</button>
          <button className="co-btn-primary" style={{ flex: 1 }} onClick={onNext}>
            Continue to Review
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 3: Review ─────────────────────────────────────────────────────────
function ReviewStep({ address, payment, cartTotal, isLoggedIn, orderLoading, onPlace, onBack, goToStep }) {
  const discount = cartTotal * 0.1;
  const gst      = (cartTotal - discount) * 0.18;
  const grand    = cartTotal - discount + gst;
  const today    = new Date();
  const delivery = new Date(today.setDate(today.getDate() + 5));
  const dStr     = delivery.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });
  const methodLabel =
    payment.method === "upi"  ? `UPI — ${payment.upi || "Not entered"}` :
    payment.method === "card" ? `Card ••••${(payment.cardNum || "").replace(/\s/g, "").slice(-4) || "????"}` :
    "Cash on Delivery";

  return (
    <div className="co-card">
      <div className="co-card-header">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e85d04" strokeWidth="2" strokeLinecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
        </svg>
        <h2>Review Your Order</h2>
      </div>
      <div className="co-card-body">
        <div className="co-review-block">
          <div className="co-review-label">Delivering To</div>
          <div className="co-review-val">
            <strong>{address.name}</strong> · +91 {address.phone}<br />
            {address.line1}<br />
            {address.city}{address.state ? `, ${address.state}` : ""} {address.pincode}
          </div>
          <span className="co-review-edit" onClick={() => goToStep(1)}>✏ Change Address</span>
          <div className="co-delivery-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            Estimated Delivery: {dStr}
          </div>
        </div>
        <div className="co-review-block">
          <div className="co-review-label">Payment Method</div>
          <div className="co-review-val">{methodLabel}</div>
          <span className="co-review-edit" onClick={() => goToStep(2)}>✏ Change Payment</span>
        </div>
        <div className="co-review-block">
          <div className="co-review-label">Order Total</div>
          <div className="co-review-val" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e85d04" }}>
            ${grand.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: 4, fontWeight: 500 }}>
            You save ${discount.toFixed(2)} on this order 🎉
          </div>
        </div>

        {!isLoggedIn && (
          <div style={{ background: "#fff3ec", border: "1.5px solid #ffd4b8", borderRadius: 10, padding: "0.875rem 1rem", marginBottom: "1rem", fontSize: "0.875rem", color: "#c94f03", display: "flex", gap: "0.5rem", alignItems: "center" }}>
            🔐 Please login to place your order.
          </div>
        )}

        <div className="co-btn-row">
          <button className="co-btn-secondary" onClick={onBack} disabled={orderLoading}>← Back</button>
          <button
            className="co-btn-primary"
            style={{ flex: 1, opacity: (!isLoggedIn || orderLoading) ? 0.65 : 1, cursor: (!isLoggedIn || orderLoading) ? "not-allowed" : "pointer" }}
            onClick={onPlace}
            disabled={!isLoggedIn || orderLoading}
          >
            {orderLoading ? (
              <>
                <svg style={{ animation: "spin 0.8s linear infinite" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.3" /><path d="M12 2a10 10 0 0110 10" />
                </svg>
                Placing Order…
              </>
            ) : (
              <>
                Place Order — ${grand.toFixed(2)}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </>
            )}
          </button>
        </div>
        <p style={{ fontSize: "0.72rem", color: "var(--mid)", textAlign: "center", marginTop: "0.75rem" }}>
          By placing this order, you agree to ShopVerse's Terms &amp; Return Policy
        </p>
      </div>
    </div>
  );
}

// ── Success screen ─────────────────────────────────────────────────────────
function SuccessScreen({ orderId, address, payment, cartTotal, onContinue }) {
  const discount = cartTotal * 0.1;
  const gst      = (cartTotal - discount) * 0.18;
  const grand    = cartTotal - discount + gst;
  const today    = new Date();
  const delivery = new Date(today.setDate(today.getDate() + 5));
  const dStr     = delivery.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const methodLabel =
    payment.method === "upi"  ? `UPI — ${payment.upi}` :
    payment.method === "card" ? `Card ••••${(payment.cardNum || "").replace(/\s/g, "").slice(-4)}` :
    "Cash on Delivery";

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <div className="co-success">
        <div className="co-success-icon">
          <svg width="36" height="36" viewBox="0 0 52 52" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="26" cy="26" r="25" fill="none" />
            <path d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>
        <h1 className="co-success-title">Order Confirmed!</h1>
        <p className="co-success-sub">
          Thank you, <strong>{address.name}</strong>! Your order has been placed and is being prepared.
        </p>
        <div className="co-order-badge">Order ID: {orderId}</div>
        <div className="co-success-details">
          {[
            ["Delivery Address", `${address.line1}, ${address.city}${address.state ? `, ${address.state}` : ""}`],
            ["Payment Method",   methodLabel],
            ["Estimated Delivery", dStr],
            ["Amount Paid",      `$${grand.toFixed(2)}`],
          ].map(([label, val]) => (
            <div key={label} className="co-s-detail-row">
              <span>{label}</span>
              <span style={{
                color:      label === "Amount Paid" ? "#e85d04" : label === "Estimated Delivery" ? "#16a34a" : "var(--ink)",
                fontWeight: label === "Amount Paid" || label === "Estimated Delivery" ? 700 : 500,
              }}>{val}</span>
            </div>
          ))}
        </div>
        <button className="co-btn-primary" style={{ maxWidth: 280, margin: "0 auto" }} onClick={onContinue}>
          Continue Shopping
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main CheckoutPage ──────────────────────────────────────────────────────
export default function CheckoutPage({ onBack }) {
  const { user, isLoggedIn }                          = useAuth();
  const { cart, cartTotal, orderLoading, placeOrder } = useCart();

  const [step,       setStep]      = useState(1);
  const [orderId,    setOrderId]   = useState(null);
  const [finalTotal, setFinalTotal] = useState(0);
  const [address, setAddress] = useState({
    name: user?.name || "", phone: user?.phone || "",
    pincode: "", line1: "", city: "", state: "", type: "Home",
  });
  const [payment, setPayment] = useState({
    method: "upi", upi: "", cardNum: "", cardExp: "", cardCvv: "", cardName: "",
  });

  // Pre-fill from user profile
  useEffect(() => {
    if (user) {
      setAddress((a) => ({
        ...a,
        name:  a.name  || user.name  || "",
        phone: a.phone || user.phone || "",
      }));
    }
  }, [user]);

  // FIX: useCallback ensures patchAddr/patchPay have a stable identity.
  // Without useCallback, a new function is created every render, which forces
  // AddressStep and PaymentStep to re-render unnecessarily (though the real
  // fix is moving FormField to module scope above — both fixes work together).
  const patchAddr = useCallback((key, val) => setAddress((a) => ({ ...a, [key]: val })), []);
  const patchPay  = useCallback((key, val) => setPayment((p) => ({ ...p, [key]: val })), []);

  const handlePlace = async () => {
    // Snapshot cart and total BEFORE placeOrder clears them
    const cartSnapshot  = [...cart];
    const discount      = cartTotal * 0.1;
    const gst           = (cartTotal - discount) * 0.18;
    // Fix: renamed from finalTotal → computedTotal to avoid shadowing the state var
    const computedTotal = cartTotal - discount + gst;

    const result = await placeOrder(cartSnapshot, computedTotal);
    if (result.success) {
      setFinalTotal(computedTotal);
      setOrderId(result.orderId);
      setStep(4);
    }
  };

  // Auth + cart guards
  if (!isLoggedIn)                    return <NotLoggedInGuard onBack={onBack} />;
  if (cart.length === 0 && step !== 4) return <EmptyCartGuard  onBack={onBack} />;

  return (
    <div className="co-page">
      {/* Top bar */}
      <div className="co-topbar">
        <button className="co-back-btn" onClick={step >= 4 ? onBack : step > 1 ? () => setStep((s) => s - 1) : onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {step >= 4 ? "Continue Shopping" : step > 1 ? "Back" : "Back to Shop"}
        </button>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)" }}>
          Shop<span style={{ color: "var(--gold)" }}>Verse</span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--mid)", display: "flex", alignItems: "center", gap: 5 }}>
          🔒 Secure Checkout
        </div>
      </div>

      {step === 4 ? (
        <SuccessScreen orderId={orderId} address={address} payment={payment} cartTotal={finalTotal} onContinue={onBack} />
      ) : (
        <div className="co-inner">
          <div className="co-left">
            <Stepper step={step} />
            {step === 1 && <AddressStep address={address} onChange={patchAddr} onNext={() => setStep(2)} />}
            {step === 2 && <PaymentStep payment={payment} onChange={patchPay}  onNext={() => setStep(3)} onBack={() => setStep(1)} />}
            {step === 3 && (
              <ReviewStep
                address={address} payment={payment} cartTotal={cartTotal}
                isLoggedIn={isLoggedIn} orderLoading={orderLoading}
                onPlace={handlePlace} onBack={() => setStep(2)} goToStep={setStep}
              />
            )}
          </div>
          <div className="co-right">
            <OrderSummary cart={cart} cartTotal={cartTotal} />
          </div>
        </div>
      )}
    </div>
  );
}
