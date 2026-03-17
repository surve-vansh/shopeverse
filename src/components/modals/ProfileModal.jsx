import { useState } from "react";
import { useAuth } from "../../context/AppContext";
import { useCart } from "../../context/AppContext";
import { useUI   } from "../../context/AppContext";

// ── Status pill colours ───────────────────────────────────────────────────
const STATUS = {
  confirmed: { bg: "#fff3ec", color: "#e85d04", label: "Confirmed" },
  shipped:   { bg: "#eff6ff", color: "#2563eb", label: "Shipped"   },
  delivered: { bg: "#f0fdf4", color: "#16a34a", label: "Delivered" },
  cancelled: { bg: "#fef2f2", color: "#dc2626", label: "Cancelled" },
};

function StatusPill({ status }) {
  const s = STATUS[status] || STATUS.confirmed;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: "0.68rem", fontWeight: 700,
      padding: "0.2rem 0.6rem", borderRadius: 50,
      letterSpacing: "0.04em", textTransform: "uppercase",
    }}>
      {s.label}
    </span>
  );
}

// ── Single order card ─────────────────────────────────────────────────────
function OrderCard({ order }) {
  const [open, setOpen] = useState(false);
  const date = new Date(order.placedAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const itemCount = order.items?.reduce((s, i) => s + (i.qty || 1), 0) || 0;

  return (
    <div style={{
      border: "1.5px solid var(--border)", borderRadius: 12,
      overflow: "hidden", marginBottom: "0.875rem",
      transition: "border-color 0.2s",
    }}>
      {/* ── Header row (always visible) ─────────────────────────────── */}
      <div
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0.875rem 1rem", cursor: "pointer",
          background: open ? "var(--card-img-bg)" : "var(--card-bg)",
          transition: "background 0.2s",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>
            #{order.orderId}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--mid)" }}>
            {date} · {itemCount} item{itemCount !== 1 ? "s" : ""}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "'Cormorant Garamond',serif", color: "#e85d04" }}>
              ${order.total?.toFixed(2) ?? "—"}
            </div>
            <StatusPill status={order.status} />
          </div>
          {/* Chevron */}
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="var(--mid)" strokeWidth="2.5" strokeLinecap="round"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.25s", flexShrink: 0 }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* ── Expanded: item list ──────────────────────────────────────── */}
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "0.75rem 1rem", background: "var(--card-bg)" }}>
          {order.items?.length ? order.items.map((item, idx) => (
            <div
              key={item.id ?? idx}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.5rem 0",
                borderBottom: idx < order.items.length - 1 ? "1px solid var(--border)" : "none",
              }}
            >
              <img
                src={item.image}
                alt={item.title}
                style={{ width: 40, height: 40, objectFit: "contain", borderRadius: 6, background: "var(--card-img-bg)", padding: 2, flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: "0.78rem", fontWeight: 500, color: "var(--ink)",
                  display: "-webkit-box", WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {item.title}
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--mid)", marginTop: 2 }}>
                  Qty: {item.qty || 1}
                </div>
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--ink)", flexShrink: 0 }}>
                ${(item.price * (item.qty || 1)).toFixed(2)}
              </div>
            </div>
          )) : (
            <p style={{ fontSize: "0.8rem", color: "var(--mid)", textAlign: "center", padding: "0.5rem" }}>
              No item details available.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main ProfileModal ─────────────────────────────────────────────────────
export default function ProfileModal({ onClose, openAuth }) {
  const { user, logout }  = useAuth();
  const { orders }        = useCart();
  const { favorites }     = useUI();
  const [activeTab, setActiveTab] = useState("profile");

  // Not logged in — show sign-in prompt
  if (!user) {
    return (
      <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="sv-modal">
          <button className="sv-modal-close" onClick={onClose}>✕</button>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
            <h2 className="sv-modal-title">Not signed in</h2>
            <p style={{ color: "var(--mid)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Sign in with your mobile number to view your profile.
            </p>
            <button className="sv-btn sv-btn-primary" style={{ padding: "0.8rem 2rem" }}
              onClick={() => { onClose(); openAuth(); }}>
              Sign In with OTP
            </button>
          </div>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "SV";

  const tabs = [
    { key: "profile",  label: "👤 Profile" },
    { key: "orders",   label: `📦 Orders${orders.length > 0 ? ` (${orders.length})` : ""}` },
    { key: "wishlist", label: "❤ Wishlist" },
  ];

  return (
    <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sv-profile-modal">
        <button className="sv-modal-close" onClick={onClose}>✕</button>

        {/* ── Avatar + name ─────────────────────────────────────────── */}
        <div className="sv-profile-header">
          <div className="sv-avatar">{initials}</div>
          <div>
            <div className="sv-profile-name">{user.name}</div>
            <div className="sv-profile-email">{user.phone ? `📱 +91 ${user.phone}` : user.email}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--gold)", marginTop: "0.25rem", fontWeight: 600 }}>✦ Premium Member</div>
          </div>
        </div>

        {/* ── Tab switcher ──────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem", background: "var(--cream)", borderRadius: 10, padding: "0.25rem" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                flex: 1, padding: "0.5rem 0.25rem", border: "none", borderRadius: 8,
                cursor: "pointer", fontSize: "0.75rem", fontWeight: 600,
                fontFamily: "'DM Sans',sans-serif",
                background: activeTab === tab.key ? "var(--ink)" : "transparent",
                color: activeTab === tab.key ? "var(--cream)" : "var(--mid)",
                transition: "all 0.2s", whiteSpace: "nowrap",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Profile tab ───────────────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="sv-profile-section">
            {[
              ["Name",         user.name],
              ["Phone",        user.phone ? `+91 ${user.phone}` : "—"],
              ["Member Since", user.joined || "Recently"],
              ["Total Orders", orders.length],
              ["Status",       "Active ✓"],
            ].map(([l, v]) => (
              <div key={l} className="sv-profile-field">
                <span className="sv-profile-field-label">{l}</span>
                <span className="sv-profile-field-val">{v}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Orders tab ────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div style={{ maxHeight: 380, overflowY: "auto", paddingRight: 2 }}>
            {orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem 1rem" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📦</div>
                <p style={{ fontWeight: 600, color: "var(--ink)", marginBottom: "0.35rem" }}>No orders yet</p>
                <p style={{ color: "var(--mid)", fontSize: "0.85rem" }}>
                  Your order history will appear here after your first purchase.
                </p>
              </div>
            ) : (
              <>
                <p style={{ fontSize: "0.75rem", color: "var(--mid)", marginBottom: "0.875rem" }}>
                  {orders.length} order{orders.length !== 1 ? "s" : ""} · tap an order to see items
                </p>
                {orders.map((order) => (
                  <OrderCard key={order.orderId} order={order} />
                ))}
              </>
            )}
          </div>
        )}

        {/* ── Wishlist tab ───────────────────────────────────────────── */}
        {activeTab === "wishlist" && (
          favorites.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🤍</div>
              <p style={{ color: "var(--mid)", fontSize: "0.9rem" }}>No items in your wishlist.</p>
            </div>
          ) : (
            <div className="sv-wishlist-mini">
              {favorites.slice(0, 6).map((f) => (
                <div key={f.id} className="sv-wishlist-item">
                  <img src={f.image} alt={f.title} style={{ width: 40, height: 40, objectFit: "contain" }} />
                  <div>
                    <div className="sv-wishlist-item-title">{f.title}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--gold)", fontWeight: 600, marginTop: 2 }}>
                      ${f.price?.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── Sign out ───────────────────────────────────────────────── */}
        <button
          className="sv-btn"
          style={{
            width: "100%", padding: "0.8rem", marginTop: "1rem",
            background: "#fff0f0", color: "var(--rust)", fontWeight: 600,
            border: "1.5px solid #fecaca", borderRadius: 10,
          }}
          onClick={() => { logout(); onClose(); }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
