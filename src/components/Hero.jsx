import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import homeSlides from "../data/homeSlides";
import { supabase } from "../supabaseClient";

function Hero() {
  const [slides, setSlides] = useState(homeSlides);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let stillHere = true;

    async function loadOutfits() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, image_url, image_urls")
        .eq("active", true)
        .order("created_at", { ascending: false });

      if (!stillHere) return;

      if (error) {
        console.error("Could not load banner outfits:", error.message);
        return;
      }

      const outfitSlides = (data || [])
        .map((outfit) => ({
          id: outfit.id,
          title: outfit.name,
          subtitle: outfit.description || "Discover your next favorite look.",
          image: outfit.image_urls?.length
            ? outfit.image_urls[0]
            : outfit.image_url,
        }))
        .filter((slide) => slide.image);

      if (outfitSlides.length > 0) {
        setSlides(outfitSlides);
        setCurrentSlide(0);
      }
    }

    loadOutfits();

    return () => {
      stillHere = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;

    const timer = setInterval(() => {
      setCurrentSlide((previous) => (previous + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide] || slides[0];

  if (!slide) return null;

  return (
    <section className="hero-slider">
      <img
        key={slide.id}
        src={slide.image}
        alt={slide.title}
        className="hero-slide-image"
      />

      <div className="hero-overlay">
        <h1 className="hero-title">{slide.title}</h1>
        <p className="hero-subtitle">{slide.subtitle}</p>

        <div className="hero-buttons">
          <button onClick={() => navigate("/shop")}>SHOP NOW</button>
          <button onClick={() => navigate("/tryon")}>TRY ON WITH AI</button>
        </div>
      </div>

      <div className="hero-dots">
        {slides.map((item, index) => (
          <span
            key={item.id}
            className={index === currentSlide ? "active" : ""}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>
    </section>
  );
}

export default Hero;