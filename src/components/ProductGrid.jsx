import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "../supabaseClient";

function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stillHere = true;

    async function loadProducts() {
      const { data, error: loadError } = await supabase
        .from("products")
        .select(
          "id, name, price, sale_price, is_sold_out, image_url, image_urls"
        )
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!stillHere) return;

      if (loadError) {
        setError("Outfits could not be loaded. Please refresh the page.");
        console.error("Could not load outfits:", loadError.message);
      } else {
        const loadedProducts = (data || []).map((product) => ({
          ...product,
          image: product.image_urls?.length
            ? product.image_urls[0]
            : product.image_url,
        }));

        setProducts(loadedProducts);
      }

      setLoading(false);
    }

    loadProducts();

    return () => {
      stillHere = false;
    };
  }, []);

  if (loading) {
    return <p>Loading outfits...</p>;
  }

  if (error) {
    return <p role="status">{error}</p>;
  }

  if (products.length === 0) {
    return <p>No outfits found yet.</p>;
  }

  return (
    <div className="cards">
      {products.map((product) => (
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
  );
}

export default ProductGrid;