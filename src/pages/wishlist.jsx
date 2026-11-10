import { useEffect, useState } from "react";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const saved =
      JSON.parse(localStorage.getItem("halieWishlist")) || [];

    setWishlist(saved);
  }, []);

  const removeFromWishlist = (name) => {
    const updated = wishlist.filter((item) => item.name !== name);

    localStorage.setItem(
      "halieWishlist",
      JSON.stringify(updated)
    );

    setWishlist(updated);
  };

  return (
    <section className="wishlist-page">

      <div className="wishlist-header">
        <p className="shop-label">YOUR FAVORITES</p>

        <h1>My Wishlist ❤️</h1>

        <p>
          Your favorite HALIÉ pieces, all in one place.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="empty-wishlist">
          <h2>Your wishlist is empty 🤍</h2>

          <p>
            Tap the heart on any outfit you love to save it here.
          </p>
        </div>
      ) : (
        <div className="wishlist-grid">

          {wishlist.map((item) => (
            <div
              className="wishlist-card"
              key={item.name}
            >

              <img
                src={item.image}
                alt={item.name}
              />

              <div className="wishlist-info">

                <h3>{item.name}</h3>

                <p>{item.price}</p>

                <button
                  onClick={() =>
                    removeFromWishlist(item.name)
                  }
                >
                  🗑️ Remove
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </section>
  );
}

export default Wishlist;