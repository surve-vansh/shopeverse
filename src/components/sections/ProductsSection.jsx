import { useState, useEffect, useRef } from "react";
import { useUI } from "../../context/AppContext";
import ProductCard from "../product/ProductCard";

const catMap = {
  "all":             "All",
  "men's clothing":  "Men",
  "women's clothing":"Women",
  "jewelery":        "Jewelry",
  "electronics":     "Electronics",
};

export default function ProductsSection({ filterCat, openAuth, onViewProduct }) {
  const { products, loading } = useUI();

  const [active,  setActive]  = useState("all");
  const [visible, setVisible] = useState(8);
  const [query,   setQuery]   = useState("");    // raw search input
  const [search,  setSearch]  = useState("");    // debounced value used for filtering
  const [focused, setFocused] = useState(false);
  const inputRef    = useRef(null);
  const debounceRef = useRef(null);

  // Fix Bug 5: clear debounce timer when component unmounts
  // Without this, if the user navigates away mid-debounce, React tries
  // to call setSearch on an unmounted component → warning/memory leak
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  // Sync filterCat prop (from navbar dropdown) → active tab
  useEffect(() => {
    if (filterCat) {
      const mapped = { men: "men's clothing", women: "women's clothing", electronics: "electronics" };
      setActive(mapped[filterCat] || "all");
      // Clear search when navigating by category
      setQuery("");
      setSearch("");
    }
  }, [filterCat]);

  // Debounce search: wait 300 ms after user stops typing before filtering
  // This prevents filtering on every single keystroke
  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val.trim().toLowerCase());
      setVisible(8); // reset pagination on new search
    }, 300);
  };

  const clearSearch = () => {
    setQuery("");
    setSearch("");
    setVisible(8);
    inputRef.current?.focus();
  };

  const handleCatChange = (cat) => {
    setActive(cat);
    setVisible(8);
    // Don't clear search — allow search + category to combine
  };

  // ── Filter logic ──────────────────────────────────────────────────────────
  // Step 1: filter by category
  const byCategory = active === "all"
    ? products
    : products.filter((p) => p.category === active);

  // Step 2: filter by search query (title OR category name)
  const filtered = search
    ? byCategory.filter((p) =>
        p.title.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search)
      )
    : byCategory;

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <section id="products" style={{ padding: "5rem 2rem", background: "var(--card-bg)" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>

        {/* Section heading */}
        <div className="sv-section-header">
          <p className="sv-section-eyebrow">✦ Our Collection</p>
          <h2 className="sv-section-title">Explore <em>Products</em></h2>
        </div>

        {/* ── Search bar ──────────────────────────────────────────────────── */}
        <div className="sv-search-wrap">
          {/* Search icon */}
          <svg className="sv-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <input
            ref={inputRef}
            className={`sv-search-input${focused ? " focused" : ""}`}
            type="text"
            placeholder="Search products by name or category…"
            value={query}
            onChange={handleQueryChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            aria-label="Search products"
          />

          {/* Clear button — only visible when there's a query */}
          {query && (
            <button className="sv-search-clear" onClick={clearSearch} aria-label="Clear search">
              ✕
            </button>
          )}

          {/* Live result count badge */}
          {search && (
            <div className="sv-search-count">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ── Category filter tabs ─────────────────────────────────────────── */}
        <div className="sv-filter-bar">
          {Object.keys(catMap).map((c) => (
            <button
              key={c}
              className={`sv-filter-btn${active === c ? " active" : ""}`}
              onClick={() => handleCatChange(c)}
            >
              {catMap[c]}
            </button>
          ))}
        </div>

        {/* ── Results summary line ─────────────────────────────────────────── */}
        <p style={{ color: "var(--mid)", fontSize: "0.82rem", textAlign: "center", marginBottom: "2rem", minHeight: "1.2rem" }}>
          {search
            ? <>Showing <strong style={{ color: "var(--ink)" }}>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""} for "<strong style={{ color: "var(--gold)" }}>{search}</strong>" {active !== "all" ? `in ${catMap[active]}` : ""}</>
            : <>{filtered.length} product{filtered.length !== 1 ? "s" : ""} available{active !== "all" ? ` in ${catMap[active]}` : ""}</>
          }
        </p>

        {/* ── Products grid ────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "var(--mid)" }}>
            Loading products…
          </div>
        ) : filtered.length === 0 ? (
          // Empty state when search finds nothing
          <div className="sv-search-empty">
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.5rem", fontWeight: 400, marginBottom: "0.5rem", color: "var(--ink)" }}>
              No results found
            </h3>
            <p style={{ color: "var(--mid)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              No products match "<strong>{search}</strong>"
              {active !== "all" ? ` in ${catMap[active]}` : ""}.
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              {search && (
                <button className="sv-btn sv-btn-gold" style={{ padding: "0.6rem 1.5rem" }} onClick={clearSearch}>
                  Clear Search
                </button>
              )}
              {active !== "all" && (
                <button className="sv-btn sv-btn-outline" style={{ padding: "0.6rem 1.5rem" }} onClick={() => setActive("all")}>
                  Search All Categories
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="sv-grid">
              {shown.map((p) => (
                <ProductCard key={p.id} product={p} openAuth={openAuth} searchQuery={search} onViewProduct={onViewProduct} />
              ))}
            </div>
            {hasMore && (
              <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
                <button
                  className="sv-btn sv-btn-outline"
                  style={{ padding: "0.75rem 2.5rem" }}
                  onClick={() => setVisible((v) => v + 8)}
                >
                  Load More Products ({filtered.length - visible} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
