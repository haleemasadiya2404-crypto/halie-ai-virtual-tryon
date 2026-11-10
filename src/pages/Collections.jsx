import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import { supabase } from "../supabaseClient";

const suggestedCollections = [
  "Traditional",
  "Party Dress",
  "Gown",
  "Kurti",
  "Lehenga",
  "Saree",
  "Anarkali",
  "Salwar Suit",
  "Casual Wear",
  "Festive Wear",
];

function formatCollection(value) {
  const name = String(value || "").trim();
  const key = name.toLowerCase().replace(/[\s_-]/g, "");

  if (key === "partywear" || key === "partydress") return "Party Dress";

  return name.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Collections() {
  const [products, setProducts] = useState([]);
  const [activeCollection, setActiveCollection] = useState("All Outfits");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stillHere = true;

    async function loadProducts() {
      const { data, error: loadError } = await supabase
        .from("products")
        .select(
          "id, name, price, sale_price, is_sold_out, image_url, image_urls, category, categories"
        )
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!stillHere) return;

      if (loadError) {
        setError("Outfits could not be loaded. Please refresh the page.");
        console.error("Could not load collection outfits:", loadError.message);
      } else {
        setProducts(
          (data || []).map((product) => ({
            ...product,
            image: product.image_urls?.length
              ? product.image_urls[0]
              : product.image_url,
            collections: [
              ...new Set(
                (product.categories?.length
                  ? product.categories
                  : [product.category]
                )
                  .filter(Boolean)
                  .map(formatCollection)
              ),
            ],
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

  const collections = [
    "All Outfits",
    ...new Set([
      ...suggestedCollections,
      ...products.flatMap((product) => product.collections),
    ]),
  ];

  const shownProducts =
    activeCollection === "All Outfits"
      ? products
      : products.filter((product) =>
          product.collections.includes(activeCollection)
        );

  return (
    <section className="collections-page">
      <div className="collections-header">
        <p>HALIÉ COLLECTION</p>
        <h1>Our Collections</h1>
        <p>Discover elegant outfits designed for every special moment.</p>
      </div>

      <div className="collection-category">
        <h2>✨ Choose a Collection</h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            margin: "20px 0",
          }}
        >
          {collections.map((collection) => (
            <button
              key={collection}
              type="button"
              onClick={() => setActiveCollection(collection)}
              style={{
                padding: "10px 18px",
                borderRadius: "24px",
                border: "1px solid #b99043",
                background:
                  activeCollection === collection ? "#b99043" : "white",
                color: activeCollection === collection ? "white" : "#5e4938",
                cursor: "pointer",
              }}
            >
              {collection}
            </button>
          ))}
        </div>

        {loading && <p>Loading outfits...</p>}
        {error && <p role="status">{error}</p>}

        {!loading && !error && shownProducts.length === 0 && (
          <p>No outfits in this collection yet.</p>
        )}

        {!loading && !error && shownProducts.length > 0 && (
          <div className="cards">
            {shownProducts.map((product) => (
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
          </div>
        )}
      </div>
    </section>
  );
}

export default Collections;