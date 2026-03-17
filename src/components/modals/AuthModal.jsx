import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AppContext";
import React, { useCallback } from "react";

// ── OTP input: 6 individual boxes ─────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const update = (index, char) => {
    const nd = [...digits];
    nd[index] = char;
    onChange(nd.join("").slice(0, 6));
    if (char && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const nd = [...digits];
      if (nd[index]) { nd[index] = ""; onChange(nd.join("")); }
      else if (index > 0) { nd[index - 1] = ""; onChange(nd.join("")); inputs.current[index - 1]?.focus(); }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", margin: "1.5rem 0" }}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text" inputMode="numeric" maxLength={1}
          value={digit} disabled={disabled}
          onChange={(e) => update(i, e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          style={{
            width: 44, height: 52, textAlign: "center", fontSize: "1.25rem",
            fontWeight: 700, fontFamily: "'DM Sans',sans-serif",
            border: `2px solid ${digit ? "var(--gold)" : "var(--border)"}`,
            borderRadius: 10, background: "var(--input-bg)", color: "var(--ink)",
            outline: "none", transition: "border-color 0.2s",
            cursor: disabled ? "not-allowed" : "text", opacity: disabled ? 0.6 : 1,
          }}
        />
      ))}
    </div>
  );
}

// ── Countdown timer for resend ─────────────────────────────────────────
function Countdown({ seconds, onExpire }) {
  const [rem, setRem] = useState(seconds);
  useEffect(() => { setRem(seconds); }, [seconds]);
  useEffect(() => {
    if (rem <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRem((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rem]);
  if (rem <= 0) return null;
  return (
    <span style={{ color: "var(--gold)", fontWeight: 600 }}>
      {Math.floor(rem / 60) > 0 ? `${Math.floor(rem / 60)}:` : ""}
      {String(rem % 60).padStart(2, "0")}
    </span>
  );
}

// ── Main AuthModal ─────────────────────────────────────────────────────
export default function AuthModal({ onClose, onSuccess }) {
  const { login } = useAuth();

  const [step,       setStep]      = useState("phone");  // phone | otp | name
  const [phone,      setPhone]     = useState("");
  const [otp,        setOtp]       = useState("");
  const [name,       setName]      = useState("");
  const [loading,    setLoading]   = useState(false);
  const [error,      setError]     = useState("");
  const [canResend,  setCanResend] = useState(false);
  const [resendKey,  setResendKey] = useState(0);
  const phoneRef = useRef(null);

  // Fix Bug 6: cleanup the focus timer on unmount
  useEffect(() => {
    const t = setTimeout(() => phoneRef.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Fix Bug 3: wrap handleVerify in useCallback so it has a stable identity
  // and can safely be listed as a dependency in the auto-submit useEffect
  const handleVerify = useCallback(() => {
    if (otp.length < 6) { setError("Please enter all 6 digits."); return; }
    setError(""); setLoading(true);
    setTimeout(() => {
      if (otp === "123456") {
        setStep("name");
        setLoading(false);
      } else {
        setError("Incorrect OTP. Hint: use 123456");
        setOtp("");
        setLoading(false);
      }
    }, 700);
  }, [otp]);

  // Fix Bug 3: include all used values in dependency array — no stale closure
  useEffect(() => {
    if (otp.length === 6 && step === "otp" && !loading) {
      handleVerify();
    }
  }, [otp, step, loading, handleVerify]);

  const handleSendOTP = () => {
    setError("");
    if (phone.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setStep("otp");
      setOtp("");
      setCanResend(false);
      setLoading(false);
      setError("[DEV] Use OTP: 123456");
    }, 800);
  };

  const handleFinish = () => {
    const userData = {
      name: name.trim() || `User_${phone.slice(-4)}`,
      phone,
      joined: new Date().toLocaleDateString("en-IN"),
    };
    login(userData);
    onSuccess?.();   // ← triggers any pending callback (open cart, checkout, etc.)
  };

  const handleResend = () => {
    setOtp("");
    setCanResend(false);
    setResendKey((k) => k + 1);
    setError("[DEV] New OTP: 123456");
  };

  return (
    <div className="sv-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sv-modal" style={{ maxWidth: 400 }}>
        <button className="sv-modal-close" onClick={onClose}>✕</button>

        {/* ── Step 1: Phone ─────────────────────────────────────── */}
        {step === "phone" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📱</div>
              <h2 className="sv-modal-title">Welcome to ShopVerse</h2>
              <p className="sv-modal-sub">Enter your mobile number to continue</p>
            </div>
            <div className="sv-input-group">
              <label className="sv-input-label">Mobile Number</label>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <div style={{ padding: "0.85rem 0.75rem", border: "1.5px solid var(--border)", borderRadius: 10, background: "var(--input-bg)", color: "var(--mid)", fontSize: "0.9rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                  🇮🇳 +91
                </div>
                <input
                  ref={phoneRef}
                  className="sv-input" type="tel" placeholder="98765 43210"
                  value={phone} maxLength={10}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "")); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                  style={{ flex: 1 }}
                />
              </div>
            </div>
            {error && <p style={{ color: "var(--rust)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>⚠ {error}</p>}
            <button
              className="sv-btn sv-btn-primary"
              style={{ width: "100%", padding: "0.9rem" }}
              onClick={handleSendOTP}
              disabled={loading || phone.length < 10}
            >
              {loading ? "Sending OTP…" : "Get OTP →"}
            </button>
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--mid)", marginTop: "1.25rem", lineHeight: 1.6 }}>
              By continuing, you agree to our{" "}
              <span style={{ color: "var(--gold)", cursor: "pointer" }}>Terms</span> &amp;{" "}
              <span style={{ color: "var(--gold)", cursor: "pointer" }}>Privacy Policy</span>
            </p>
          </>
        )}

        {/* ── Step 2: OTP ───────────────────────────────────────── */}
        {step === "otp" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>🔐</div>
              <h2 className="sv-modal-title">Verify OTP</h2>
              <p className="sv-modal-sub">
                Sent to <strong style={{ color: "var(--ink)" }}>+91 {phone}</strong>
                <button
                  onClick={() => { setStep("phone"); setError(""); setOtp(""); }}
                  style={{ background: "none", border: "none", color: "var(--gold)", cursor: "pointer", fontSize: "0.8rem", marginLeft: "0.5rem", fontFamily: "'DM Sans',sans-serif" }}
                >
                  Change
                </button>
              </p>
            </div>
            <OTPInput value={otp} onChange={setOtp} disabled={loading} />
            {error && (
              <p style={{ color: error.startsWith("[DEV]") ? "var(--sage)" : "var(--rust)", fontSize: "0.82rem", marginBottom: "0.75rem", textAlign: "center" }}>
                {error.startsWith("[DEV]") ? "🛠 " : "⚠ "}{error}
              </p>
            )}
            <button
              className="sv-btn sv-btn-primary"
              style={{ width: "100%", padding: "0.9rem" }}
              onClick={handleVerify}
              disabled={loading || otp.length < 6}
            >
              {loading ? "Verifying…" : "Verify & Continue →"}
            </button>
            <div style={{ textAlign: "center", marginTop: "1.25rem", fontSize: "0.85rem", color: "var(--mid)" }}>
              {canResend ? (
                <span
                  style={{ color: "var(--gold)", cursor: "pointer", fontWeight: 600 }}
                  onClick={handleResend}
                >
                  Resend OTP
                </span>
              ) : (
                <>Resend in <Countdown key={resendKey} seconds={30} onExpire={() => setCanResend(true)} /></>
              )}
            </div>
          </>
        )}

        {/* ── Step 3: Name ──────────────────────────────────────── */}
        {step === "name" && (
          <>
            <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👋</div>
              <h2 className="sv-modal-title">One last thing!</h2>
              <p className="sv-modal-sub">What should we call you?</p>
            </div>
            <div className="sv-input-group">
              <label className="sv-input-label">Your Name (optional)</label>
              <input
                className="sv-input"
                placeholder="e.g. Arjun Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFinish()}
                autoFocus
              />
            </div>
            <button
              className="sv-btn sv-btn-primary"
              style={{ width: "100%", padding: "0.9rem" }}
              onClick={handleFinish}
            >
              Start Shopping →
            </button>
            <button
              className="sv-btn"
              style={{ width: "100%", padding: "0.6rem", marginTop: "0.5rem", color: "var(--mid)", background: "none" }}
              onClick={handleFinish}
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
