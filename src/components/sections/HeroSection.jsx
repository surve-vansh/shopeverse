export default function HeroSection({ onSection }) {
  return (
    <section id="hero" className="sv-hero">
      <div className="sv-hero-content">
        <p className="sv-hero-eyebrow">✦ New Collection 2025</p>
        <h1 className="sv-hero-title">
          Dress to<br />
          <em>Impress</em><br />
          the World
        </h1>
        <p className="sv-hero-desc">
          Curated fashion for every soul — from timeless classics to contemporary edge.
          Discover your style with ShopVerse.
        </p>
        <div className="sv-hero-btns">
          <button className="sv-btn sv-btn-gold" style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }} onClick={() => onSection("products")}>
            Shop With Us →
          </button>
          <button className="sv-btn sv-btn-outline" onClick={() => onSection("about")}>Our Story</button>
        </div>
        <div className="sv-stats">
          {[["12K+", "Products"], ["98%", "Satisfied"], ["50+", "Brands"], ["4.9★", "Rating"]].map(([n, l]) => (
            <div key={l} className="sv-stat">
              <div className="sv-stat-num">{n}</div>
              <div className="sv-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="sv-hero-img">
        <div className="sv-hero-fashion">FASHION</div>
        <div className="sv-hero-circle">
          <div className="sv-hero-emoji">👗</div>
        </div>
        <div style={{ position: "absolute", bottom: "2rem", left: "2rem", color: "rgba(250,247,242,0.4)", fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
          Scroll to explore ↓
        </div>
      </div>
    </section>
  );
}
