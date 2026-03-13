import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
function Footer({ onSection }) {
  return (
    <footer className="sv-footer">
      <div className="sv-footer-inner">
        <div className="sv-footer-top">
          <div className="sv-footer-brand">
            <div className="sv-footer-logo">Shop<span>Verse</span></div>
            <p className="sv-footer-desc">Your one-stop destination for fashion, electronics & more. Style meets substance.</p>
            <div className="sv-footer-social">
              {["𝕏", "📘", "📸", "▶"].map((icon, i) => (
                <div key={i} className="sv-social-btn">{icon}</div>
              ))}
            </div>
          </div>
          {[
            { title: "Shop", links: ["Men's Fashion", "Women's Fashion", "Kids", "Electronics", "Jewelry", "New Arrivals"] },
            { title: "Company", links: ["About Us", "Careers", "Press", "Blog", "Partners", "Sustainability"] },
            { title: "Support", links: ["Help Center", "Track Order", "Returns", "Size Guide", "Gift Cards", "Contact Us"] },
          ].map((col) => (
            <div key={col.title} className="sv-footer-col">
              <h4>{col.title}</h4>
              <ul className="sv-footer-links">
                {col.links.map((l) => <li key={l} onClick={() => onSection("products")}>{l}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="sv-footer-bottom">
          <p>© 2025 ShopVerse. All rights reserved.</p>
          <div className="sv-footer-payments">
            {["VISA", "MC", "UPI", "PayTM", "EMI"].map((p) => (
              <div key={p} className="sv-payment-tag">{p}</div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;