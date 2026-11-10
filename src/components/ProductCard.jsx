import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProductCard({ id, image, name, price, salePrice, isSoldOut }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(() => {
    const saved = JSON.parse(localStorage.getItem("halieWishlist") || "[]");
    return saved.some((item) => item.id === id);
  });

  function toggleWishlist(event) {
    event.stopPropagation();
    const saved = JSON.parse(localStorage.getItem("halieWishlist") || "[]");
    const updated = liked
      ? saved.filter((item) => item.id !== id)
      : [...saved, { id, name, price: salePrice ?? price, image }];
    localStorage.setItem("halieWishlist", JSON.stringify(updated));
    setLiked(!liked);
  }

  function addToCart(event) {
    event.stopPropagation();
    if (isSoldOut) return;
    const cart = JSON.parse(localStorage.getItem("halieCart") || "[]");
    const existing = cart.find((item) => item.id === id);
    const updated = existing
      ? cart.map((item) => item.id === id ? { ...item, quantity: (item.quantity || 1) + 1 } : item)
      : [...cart, { id, name, price: salePrice ?? price, image, quantity: 1 }];
    localStorage.setItem("halieCart", JSON.stringify(updated));
    alert("Added to cart 🛒");
  }

  return (
    <div className="product-card">
      <div className="product-image-container" onClick={() => navigate(`/product/${id}`)} style={{ position: "relative", cursor: "pointer" }}>
        <img src={image} alt={name} />
        {isSoldOut && <span style={{ position: "absolute", left: 10, top: 10, background: "#5e4938", color: "white", padding: "6px 10px", borderRadius: 16 }}>Sold out</span>}
        <button className="heart-button" onClick={toggleWishlist}>{liked ? "❤️" : "🤍"}</button>
      </div>
      <div className="product-info">
        <h3 onClick={() => navigate(`/product/${id}`)} style={{ cursor: "pointer" }}>{name}</h3>
        <p className="product-price">
          {salePrice != null ? <><del style={{ marginRight: 8, opacity: 0.65 }}>₹{price}</del><strong>₹{salePrice}</strong></> : `₹${price}`}
        </p>
        <div className="product-actions">
          <button className="tryon-btn" onClick={() => navigate("/tryon")}>🤖 Try On</button>
          <button className="cart-btn" onClick={addToCart} disabled={isSoldOut}>
            {isSoldOut ? "Sold out" : "🛒 Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
