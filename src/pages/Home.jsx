import Hero from "../components/hero";
import ProductGrid from "../components/ProductGrid";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      {/* Large moving outfit banner */}
      <Hero />

      {/* HALIÉ outfits directly below the banner */}
      <section className="home-products">
        <div className="home-products-title">
          <p>HALIÉ COLLECTION</p>
          <h2>Shop Our Outfits</h2>
          <span>Discover your next favorite look.</span>
        </div>

        <ProductGrid />
      </section>

      <Footer />
    </>
  );
}

export default Home;