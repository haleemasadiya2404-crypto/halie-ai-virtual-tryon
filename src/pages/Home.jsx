import Hero from "../components/hero.jsx";
import ProductGrid from "../components/productgrid.jsx";
import Footer from "../components/footer.jsx";
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