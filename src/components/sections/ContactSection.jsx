import { useState } from "react";
import { useAuth } from "../../context/AppContext";
import { useUI } from "../../context/AppContext";

export default function ContactSection() {
  const { showNotif } = useUI();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) { showNotif("Please fill all required fields", "info"); return; }
    showNotif("Message sent! We'll get back to you soon 🎉");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <section id="contact" style={{ background: "var(--cream)" }}>
      <div className="sv-contact-wrap">
        <div className="sv-section-header">
          <p className="sv-section-eyebrow">✦ Get In Touch</p>
          <h2 className="sv-section-title">We'd Love to <em>Hear</em> From You</h2>
        </div>
        <div className="sv-contact-grid">
          <div className="sv-contact-info">
            <h3>Let's connect</h3>
            <p style={{ color: "var(--mid)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Have a question, feedback, or just want to say hello? Our team is here for you.
            </p>
            {[
              { icon: "📍", label: "Address", val: "42 Fashion Boulevard, Mumbai 400001" },
              { icon: "📧", label: "Email",   val: "hello@shopverse.in" },
              { icon: "📞", label: "Phone",   val: "+91 98765 43210" },
              { icon: "🕐", label: "Hours",   val: "Mon–Sat, 9AM – 8PM IST" },
            ].map((item) => (
              <div key={item.label} className="sv-contact-item">
                <div className="sv-contact-icon">{item.icon}</div>
                <div>
                  <div className="sv-contact-detail-label">{item.label}</div>
                  <div className="sv-contact-detail-val">{item.val}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="sv-form">
              <div className="sv-form-row">
                <input className="sv-input" placeholder="Your Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input className="sv-input" placeholder="Email Address *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <input className="sv-input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
              <textarea className="sv-input sv-textarea" placeholder="Your message *" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <button className="sv-btn sv-btn-primary" style={{ padding: "0.85rem", fontSize: "0.95rem" }} onClick={handleSubmit}>
                Send Message →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
