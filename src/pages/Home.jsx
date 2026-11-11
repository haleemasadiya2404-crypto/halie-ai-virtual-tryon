
import Hero from "../components/Hero.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Footer from "../components/Footer.jsx";

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
