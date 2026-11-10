import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Collections from "./pages/Collections";
import TryOn from "./pages/TryOn";
import Contact from "./pages/Contact";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/checkout";
import OrderConfirmed from "./pages/OrderConfirmed";
import Login from "./pages/login";
import ProductDetails from "./pages/ProductDetails";
import Admin from "./pages/admin";
import "./App.css";

function App() {
  return (
    <div className="container">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/tryon" element={<TryOn />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route
  path="/order-confirmed"
  element={<OrderConfirmed />}
/>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route
  path="/product/:id"
  element={<ProductDetails />}
/>
      </Routes>
    </div>
  );
}

export default App;