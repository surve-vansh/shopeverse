import { useApp } from "../../context/AppContext";
import { useState } from "react";
function ProfileModal({ onClose, openAuth }) {
  const { user, logout, favorites } = useApp();

  if (!user) {
    return (
      <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="sv-modal">
          <button className="sv-modal-close" onClick={onClose}>✕</button>
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>👤</div>
            <h2 className="sv-modal-title">Not signed in</h2>
            <p style={{ color: "var(--mid)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>Sign in to view your profile, orders and wishlist.</p>
            <button className="sv-btn sv-btn-primary" style={{ padding: "0.8rem 2rem" }} onClick={() => { onClose(); openAuth(); }}>Sign In</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sv-profile-modal">
        <button className="sv-modal-close" onClick={onClose}>✕</button>
        <div className="sv-profile-header">
          <div className="sv-avatar">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="sv-profile-name">{user.name}</div>
            <div className="sv-profile-email">{user.email}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--gold)", marginTop: "0.25rem", fontWeight: 600 }}>✦ Premium Member</div>
          </div>
        </div>

        <div className="sv-profile-section">
          <div className="sv-profile-section-title">Account Details</div>
          {[["Name", user.name], ["Email", user.email], ["Member Since", user.joined || "Today"], ["Status", "Active ✓"]].map(([l, v]) => (
            <div key={l} className="sv-profile-field">
              <span className="sv-profile-field-label">{l}</span>
              <span className="sv-profile-field-val">{v}</span>
            </div>
          ))}
        </div>

        {favorites.length > 0 && (
          <div className="sv-profile-section">
            <div className="sv-profile-section-title">Wishlist ({favorites.length})</div>
            <div className="sv-wishlist-mini">
              {favorites.slice(0, 4).map((f) => (
                <div key={f.id} className="sv-wishlist-item">
                  <img src={f.image} alt={f.title} />
                  <div className="sv-wishlist-item-title">{f.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="sv-btn" style={{ width: "100%", padding: "0.8rem", background: "#fff0f0", color: "var(--rust)", fontWeight: 600, marginTop: "0.5rem" }} onClick={() => { logout(); onClose(); }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
export default ProfileModal;