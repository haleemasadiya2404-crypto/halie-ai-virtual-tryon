import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const suggestedCategories = [
  "Traditional", "Party Dress", "Gown", "Kurti", "Lehenga", "Saree",
  "Anarkali", "Salwar Suit", "Casual Wear", "Festive Wear",
];

function normalizeCategory(value) {
  const normalized = String(value || "").trim().toLowerCase().replace(/[\s_-]/g, "");
  if (normalized === "partywear" || normalized === "partydress") return "Party Dress";
  return String(value || "").trim().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function OutfitSelector({ selected, setSelected }) {
  const [outfits, setOutfits] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let stillHere = true;
    async function loadOutfits() {
      const { data, error: loadError } = await supabase
        .from("products")
        .select("id, name, image_url, image_urls, try_on_image_url, category, categories, description")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (!stillHere) return;
      if (loadError) {
        console.error("Could not load Try-On outfits:", loadError.message);
        setError("Some saved outfits could not be loaded.");
      } else {
        setOutfits((data || []).map((item) => {
          const images = item.image_urls?.length ? item.image_urls : [item.image_url].filter(Boolean);
          const categories = (item.categories?.length ? item.categories : [item.category])
            .filter(Boolean).map(normalizeCategory);
          return {
  ...item,
  categories,
  image: images[0],
  images,
  tryOnImage: item.try_on_image_url || images[0],
  garmentIsWorn: !item.try_on_image_url,
};
        }));
      }
      setLoading(false);
    }
    loadOutfits();
    return () => { stillHere = false; };
  }, []);

  const categories = [...new Set([...suggestedCategories, ...outfits.flatMap((item) => item.categories)])];
  const categoryOutfits = outfits.filter((item) => item.categories.includes(activeCategory));

  function chooseCategory(category) {
    setActiveCategory(category);
    if (!selected?.categories?.includes(category)) setSelected(null);
  }

  return (
    <div className="outfit-selector">
      <h2>👗 Choose a Collection</h2>
      {loading && <p>Loading outfits...</p>}
      {error && <p role="status">{error}</p>}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}>
        {categories.map((category) => (
          <button key={category} type="button" onClick={() => chooseCategory(category)} style={{ padding: "10px 16px", borderRadius: 20, border: "1px solid #b99043", background: activeCategory === category ? "#b99043" : "white", color: activeCategory === category ? "white" : "#5e4938", cursor: "pointer" }}>
            {category}
          </button>
        ))}
      </div>
      {!activeCategory && !loading && <p>Choose a collection above to see its outfits.</p>}
      {activeCategory && categoryOutfits.length === 0 && <p>No outfits have been added to this collection yet.</p>}
      {activeCategory && categoryOutfits.length > 0 && (
        <>
          <button type="button" onClick={() => setActiveCategory("")} style={{ marginBottom: 12, cursor: "pointer" }}>← Back to collections</button>
          <div className="outfit-options">
            {categoryOutfits.map((outfit) => (
              <button type="button" key={outfit.id} className={`outfit-option ${selected?.id === outfit.id ? "selected" : ""}`} onClick={() => setSelected(outfit)} style={{ cursor: "pointer" }}>
                <img src={outfit.image} alt={outfit.name} />
                <h4>{outfit.name}</h4>
                {selected?.id === outfit.id && <span>✓ Selected</span>}
              </button>
            ))}
          </div>
        </>
      )}
      {selected && <p className="outfit-message">{selected.name} selected for AI Try-On.</p>}
    </div>
  );
}

export default OutfitSelector;
