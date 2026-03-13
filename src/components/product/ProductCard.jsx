import { useApp } from "../../context/AppContext";

const catMap = {
  "men's clothing": "Men",
  "women's clothing": "Women",
  jewelery: "Jewelry",
  electronics: "Electronics",
};

const getStars = (r) => {
  const full = Math.floor(r);
  const half = r - full >= 0.5 ? 1 : 0;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(5 - full - half);
};

function ProductCard({ product }) {
  const { addToCart, toggleFav, favorites } = useApp();

  const isFav = favorites.some((f) => f.id === product.id);
  const isNew = product.id % 5 === 0;

  return (
    <div className="sv-card">
      <div className="sv-card-img-wrap">
        {isNew && <span className="sv-card-badge">New</span>}

        <img src={product.image} alt={product.title} className="sv-card-img" />

        <button
          className={`sv-card-fav ${isFav ? "active" : ""}`}
          onClick={() => toggleFav(product)}
        >
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>

      <div className="sv-card-body">
        <div className="sv-card-cat">
          {catMap[product.category] || product.category}
        </div>

        <div className="sv-card-title ">{product.title}</div>

        <div className="sv-card-rating">
          <span className="sv-stars">
            {getStars(product.rating?.rate || 4)}
          </span>
          <span className="sv-rating-count">
            ({product.rating?.count || 0})
          </span>
        </div>

        <div className="sv-card-footer">
          <span className="sv-price">${product.price.toFixed(2)}</span>

          <button
            className="sv-add-btn bg-red-700"
            onClick={() => addToCart(product)}
          >
            + Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;