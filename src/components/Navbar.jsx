import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import logo from "../assets/logo/halie-logo.png";

function Navbar() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Sign out error:", error.message);
      return;
    }

    navigate("/login");
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (query) {
      navigate(`/shop?search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="logo-section">
        <img src={logo} alt="HALIÉ Logo" className="logo" />

        <div>
          <h1>HALIÉ</h1>
          <p className="tagline">Wear Confidence. Try Before You Buy.</p>
        </div>
      </div>

      <div className="nav-right">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/collections">Collections</Link></li>
          <li><Link to="/tryon">AI Try-On</Link></li>
          <li><Link to="/contact">Contact</Link></li>
        </ul>

        <div className="nav-icons">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search outfits..."
              className="search-box"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <button type="submit" className="search-btn">
              🔎
            </button>
          </form>

          <Link to="/wishlist">
            <button className="icon-btn" type="button">❤️</button>
          </Link>

          <Link to="/cart">
            <button className="icon-btn" type="button">🛒</button>
          </Link>

          {user ? (
            <button
              className="login-btn"
              type="button"
              onClick={handleLogout}
            >
              Sign out
            </button>
          ) : (
            <Link to="/login">
              <button className="login-btn" type="button">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;