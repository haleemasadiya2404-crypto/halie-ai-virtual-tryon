import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { supabase } from "../supabaseClient";

function formatCategory(value) {
  const name = String(value || "").trim();
  const key = name.toLowerCase().replace(/[\s_-]/g, "");

  if (key === "partywear" || key === "partydress") return "Party Dress";

  return name.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Shop() {
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get("search") || "").toLowerCase();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stillHere = true;

    async function loadProducts() {
      const { data, error: loadError } = await supabase
        .from("products")
        .select(
          "id, name, price, sale_price, is_sold_out, image_url, image_urls, category, categories, description"
        )
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!stillHere) return;

      if (loadError) {
        setError(loadError.message);
      } else {
        setProducts(
          (data || []).map((item) => ({
            ...item,
            image: item.image_urls?.[0] || item.image_url,
            images: item.image_urls?.length
              ? item.image_urls
              : [item.image_url].filter(Boolean),
          }))
        );
      }

      setLoading(false);
    }

    loadProducts();

    return () => {
      stillHere = false;
    };
  }, []);

  const categories = useMemo(() => {
    const savedCategories = products.flatMap((item) =>
      item.categories?.length ? item.categories : [item.category]
    );

    return [
      "All",
      ...new Set(
        savedCategories.filter(Boolean).map(formatCategory)
      ),
    ];
  }, [products]);

  const filteredProducts = products.filter((product) => {
    const productCategories = (
      product.categories?.length ? product.categories : [product.category]
    )
      .filter(Boolean)
      .map(formatCategory);

    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery) ||
      productCategories.join(" ").toLowerCase().includes(searchQuery) ||
      (product.description || "").toLowerCase().includes(searchQuery);

    const matchesCategory =
      activeCategory === "All" || productCategories.includes(activeCategory);

    return matchesSearch && matchesCategory;
  });

  return (
    <section className="shop-page">
      <div className="shop-header">
        <p className="shop-label">HALIÉ COLLECTION</p>
        <h1>Our Collection</h1>
        <p className="shop-description">
          Discover elegant fashion designed to help you wear confidence every day.
        </p>
        {searchQuery && (
          <p>
            Search results for: <strong>"{searchQuery}"</strong>
          </p>
        )}
      </div>

      <div className="shop-controls">
        {categories.map((category) => (
          <button
            key={category}
            className={activeCategory === category ? "active" : ""}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <p>Loading outfits...</p>}
      {error && <p role="alert">Could not load outfits: {error}</p>}

      <div className="cards">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            image={product.image}
            name={product.name}
            price={product.price}
            salePrice={product.sale_price}
            isSoldOut={product.is_sold_out}
          />
        ))}

        {!loading && filteredProducts.length === 0 && (
          <p className="no-products">No outfits found. Try another search.</p>
        )}
      </div>
    </section>
  );
}

export default Shop;