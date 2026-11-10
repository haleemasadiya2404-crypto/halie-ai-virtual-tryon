
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";

function ProductDetails() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    let stillHere = true;

    async function loadProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, price, sale_price, is_sold_out, image_url, image_urls, try_on_image_url, category, categories, description, sizes, colors"
        )
        .eq("id", id)
        .eq("active", true)
        .maybeSingle();

      if (!stillHere) return;

      if (!error && data) {
        setProduct({
          ...data,
          images: data.image_urls?.length
            ? data.image_urls
            : [data.image_url].filter(Boolean),
        });
      }

      setLoading(false);
    }

    loadProduct();

    return () => {
      stillHere = false;
    };
  }, [id]);

  function saveToCart() {
    if (product.is_sold_out) return;

    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color first.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("halieCart") || "[]");

    cart.push({
      ...product,
      price: product.sale_price ?? product.price,
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    });

    localStorage.setItem("halieCart", JSON.stringify(cart));
    alert("Added to cart 🛒");
  }

  function buyNow() {
    if (product.is_sold_out) return;

    if (!selectedSize || !selectedColor) {
      alert("Please select a size and color first.");
      return;
    }

    localStorage.setItem(
      "halieBuyNow",
      JSON.stringify({
        ...product,
        price: product.sale_price ?? product.price,
        size: selectedSize,
        color: selectedColor,
      })
    );

    navigate("/checkout");
  }

  function tryOnProduct() {
    const images = product.images?.length
      ? product.images
      : [product.image_url].filter(Boolean);

    const outfit = {
      ...product,
      image: images[selectedImage] || images[0],
      tryOnImage:
        product.try_on_image_url ||
        images[selectedImage] ||
        images[0],
      garmentIsWorn: !product.try_on_image_url,
      categories: product.categories?.length
        ? product.categories
        : [product.category].filter(Boolean),
    };

    navigate("/tryon", { state: { outfit } });
  }

  if (loading) {
    return (
      <section className="product-details">
        <p>Loading outfit...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="product-details">
        <h1>Outfit not found</h1>
        <button onClick={() => navigate("/shop")}>Back to Shop</button>
      </section>
    );
  }

  const images = product.images?.length
    ? product.images
    : [product.image_url].filter(Boolean);

  const sizes = product.sizes?.length
    ? product.sizes
    : ["S", "M", "L", "XL"];

  const colors = product.colors?.length
    ? product.colors
    : ["Red", "Gold", "Black"];

  return (
    <section className="product-details">
      <div>
        <div className="product-image">
          <img src={images[selectedImage]} alt={product.name} />
        </div>

        {images.length > 1 && (
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginTop: 12,
            }}
          >
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setSelectedImage(index)}
                aria-label={`Show photo ${index + 1}`}
                style={{
                  padding: 0,
                  border:
                    selectedImage === index
                      ? "3px solid #b99043"
                      : "1px solid #ccc",
                  borderRadius: 8,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <img
                  src={image}
                  alt={`${product.name} photo ${index + 1}`}
                  width="70"
                  height="80"
                  style={{ display: "block", objectFit: "cover" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-info">
        <h1>{product.name}</h1>

        <h2>
          {product.sale_price != null ? (
            <>
              <del style={{ opacity: 0.65, marginRight: 10 }}>
                ₹{product.price}
              </del>
              ₹{product.sale_price}
            </>
          ) : (
            `₹${product.price}`
          )}
        </h2>

        {product.is_sold_out && (
          <p>
            <strong>Sold out</strong>
          </p>
        )}

        <p>
          {product.description ||
            "A beautiful HALIÉ outfit for special occasions."}
        </p>

        <h3>Select Size</h3>
        <div className="sizes">
          {sizes.map((size) => (
            <button
              key={size}
              className={selectedSize === size ? "selected" : ""}
              onClick={() => setSelectedSize(size)}
            >
              {size}
            </button>
          ))}
        </div>

        <h3>Select Color</h3>
        <div className="colors">
          {colors.map((color) => (
            <button
              key={color}
              className={selectedColor === color ? "selected" : ""}
              onClick={() => setSelectedColor(color)}
            >
              {color}
            </button>
          ))}
        </div>

        <div className="product-buttons">
          <button className="try-btn" onClick={tryOnProduct}>
            🤖 Try On with AI
          </button>

          <button
            className="shop-btn"
            onClick={saveToCart}
            disabled={product.is_sold_out}
          >
            {product.is_sold_out ? "Sold out" : "🛒 Add to Cart"}
          </button>

          <button
            className="buy-now-btn"
            onClick={buyNow}
            disabled={product.is_sold_out}
          >
            ⚡ Buy Now
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductDetails;
