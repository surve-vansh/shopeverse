import { useApp } from "../../context/AppContext";
function AboutSection() {
  const values = [
    { icon: "🌱", label: "Sustainable", desc: "Eco-conscious materials and ethical sourcing" },
    { icon: "✦", label: "Quality First", desc: "Every piece passes our rigorous quality check" },
    { icon: "🚀", label: "Fast Delivery", desc: "Same-day dispatch across 50+ cities" },
    { icon: "🔄", label: "Easy Returns", desc: "30-day hassle-free return policy" },
  ];
  const stats = [["12K+", "Products"], ["2M+", "Customers"], ["98%", "Satisfaction"], ["50+", "Brands"]];

  return (
    <section id="about" className="sv-about-wrap">
      <div className="sv-about-inner">
        <div className="sv-about-left">
          <p className="sv-section-eyebrow">✦ Our Story</p>
          <h2 className="sv-about-title">Fashion That <em>Speaks</em> to Your Soul</h2>
          <p className="sv-about-desc">
            Founded in 2019, ShopVerse was born from a simple belief: everyone deserves to feel extraordinary in what they wear. 
            We partner with artisans and designers worldwide to bring you collections that blend heritage craftsmanship with contemporary vision.
          </p>
          <p className="sv-about-desc" style={{ marginTop: "-0.5rem" }}>
            From handwoven textiles to cutting-edge electronics, we curate only what truly matters — quality, sustainability, and style that endures.
          </p>
          <div className="sv-values">
            {values.map((v) => (
              <div key={v.label} className="sv-value">
                <div className="sv-value-icon">{v.icon}</div>
                <div className="sv-value-label">{v.label}</div>
                <div className="sv-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="sv-about-right">
          {stats.map(([n, l]) => (
            <div key={l} className="sv-about-stat-card">
              <div className="sv-about-stat-num">{n}</div>
              <div className="sv-about-stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default AboutSection;