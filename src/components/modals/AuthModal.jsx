import { useApp } from "../../context/AppContext";
import { useState } from "react";
function AuthModal({ onClose }) {
  const { login } = useApp();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");

  const handleAuth = () => {
    setErr("");
    if (!form.email || !form.password) { setErr("Please fill all required fields."); return; }
    if (mode === "signup") {
      if (!form.name) { setErr("Name is required."); return; }
      if (form.password !== form.confirm) { setErr("Passwords don't match."); return; }
      if (form.password.length < 6) { setErr("Password must be at least 6 characters."); return; }
    }
    login({ name: form.name || form.email.split("@")[0], email: form.email, joined: new Date().toLocaleDateString("en-IN") });
    onClose();
  };

  return (
    <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sv-modal">
        <button className="sv-modal-close" onClick={onClose}>✕</button>
        <h2 className="sv-modal-title">{mode === "login" ? "Welcome back" : "Join ShopVerse"}</h2>
        <p className="sv-modal-sub">{mode === "login" ? "Sign in to your account" : "Create your free account today"}</p>

        <div className="sv-input-group">
          <label className="sv-input-label">Email *</label>
          <input className="sv-input" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        {mode === "signup" && (
          <div className="sv-input-group">
            <label className="sv-input-label">Full Name *</label>
            <input className="sv-input" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
        )}
        <div className="sv-input-group">
          <label className="sv-input-label">Password *</label>
          <input className="sv-input" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
        {mode === "signup" && (
          <div className="sv-input-group">
            <label className="sv-input-label">Confirm Password *</label>
            <input className="sv-input" type="password" placeholder="••••••••" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
          </div>
        )}
        {err && <p style={{ color: "var(--rust)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>⚠ {err}</p>}
        <button className="sv-btn sv-btn-primary" style={{ width: "100%", padding: "0.85rem", fontSize: "0.95rem" }} onClick={handleAuth}>
          {mode === "login" ? "Sign In →" : "Create Account →"}
        </button>

        {mode === "login" && (
          <>
            <div className="sv-divider"><span>or continue with</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {["🔵 Google", "🍎 Apple"].map((p) => (
                <button key={p} className="sv-btn sv-btn-outline" style={{ padding: "0.6rem" }} onClick={() => {
                  login({ name: p.includes("Google") ? "Google User" : "Apple User", email: p.includes("Google") ? "user@gmail.com" : "user@icloud.com", joined: new Date().toLocaleDateString("en-IN") });
                  onClose();
                }}>{p}</button>
              ))}
            </div>
          </>
        )}

        <div className="sv-auth-switch">
          {mode === "login" ? <>New here? <span onClick={() => setMode("signup")}>Create account</span></> : <>Already have an account? <span onClick={() => setMode("login")}>Sign in</span></>}
        </div>
      </div>
    </div>
  );
}
export default AuthModal;