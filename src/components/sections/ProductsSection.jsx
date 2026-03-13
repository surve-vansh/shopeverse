import { useEffect, useState } from "react";
import ProductCard from "../product/ProductCard";
import { useApp } from "../../context/AppContext";

const catMap = {
  all: "All",
  "men's clothing": "Men",
  "women's clothing": "Women",
  jewelery: "Jewelry",
  electronics: "Electronics",
};

function ProductsSection({ filterCat }) {

  const { products, loading } = useApp();

  const [active, setActive] = useState("all");
  const [visible, setVisible] = useState(8);

  useEffect(() => {
    if (filterCat) {
      const mapped = {
        men: "men's clothing",
        women: "women's clothing",
        electronics: "electronics",
      };

      setActive(mapped[filterCat] || "all");
    }
  }, [filterCat]);

  const categories = [
    "all",
    "men's clothing",
    "women's clothing",
    "jewelery",
    "electronics",
  ];

  const filtered =
    active === "all"
      ? products
      : products.filter((p) => p.category === active);

  const shown = filtered.slice(0, visible);

  return (
    <section id="products" style={{ padding: "5rem 2rem", background: "white" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        <div className="sv-section-header">
          <p className="sv-section-eyebrow">✦ Our Collection</p>

          <h2 className="sv-section-title">
            Explore <em>Products</em>
          </h2>

          <p style={{ color: "var(--mid)", fontSize: "0.9rem", marginTop: "0.75rem" }}>
            {filtered.length} products available
          </p>
        </div>

        <div className="sv-filter-bar">
          {categories.map((c) => (
            <button
              key={c}
              className={`sv-filter-btn ${active === c ? "active" : ""}`}
              onClick={() => {
                setActive(c);
                setVisible(8);
              }}
            >
              {catMap[c] || c}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            Loading products...
          </div>
        ) : (
          <>
            <div className="sv-grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {visible < filtered.length && (
              <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
                <button
                  className="sv-btn sv-btn-outline"
                  onClick={() => setVisible((v) => v + 8)}
                >
                  Load More Products
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </section>
  );
}

export default ProductsSection;