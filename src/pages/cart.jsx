
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();

  const [cart, setCart] = useState(() => {
    try {
      const savedCart =
        JSON.parse(localStorage.getItem("halieCart")) || [];

      return savedCart.map((item) => ({
        ...item,
        quantity: item.quantity || 1,
      }));
    } catch {
      return [];
    }
  });

  // Save cart to localStorage
  const saveCart = (updatedCart) => {
    localStorage.setItem("halieCart", JSON.stringify(updatedCart));
    setCart(updatedCart);
  };

  // Increase quantity
  const increaseQuantity = (id) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    saveCart(updatedCart);
  };

  // Decrease quantity
  const decreaseQuantity = (id) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  };

  // Remove product completely
  const removeFromCart = (id) => {
    const updatedCart = cart.filter((item) => item.id !== id);
    saveCart(updatedCart);
  };

  // Convert ₹1499 into number
  const getPrice = (price) => {
    return Number(String(price).replace(/[₹,]/g, ""));
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) =>
      total + getPrice(item.price) * item.quantity,
    0
  );

  // Delivery
  const delivery = subtotal >= 2000 ? 0 : 99;

  // Final total
  const total = subtotal + delivery;

  return (
    <section className="cart-page">
      <div className="cart-header">
        <p>HALIÉ SHOPPING BAG</p>
        <h1>Your Cart 🛒</h1>
      </div>

      {cart.length === 0 ? (
        <div className="empty-cart">
          <h2>Your cart is empty</h2>
          <p>Add an outfit from our collection.</p>

          <button
            className="checkout-btn"
            onClick={() => navigate("/shop")}
          >
            Continue Shopping →
          </button>
        </div>
      ) : (
        <div className="cart-layout">
          {/* CART ITEMS */}
          <div className="cart-items">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />

                <div className="cart-item-info">
                  <h2>{item.name}</h2>
                  <p>{item.price}</p>

                  {/* QUANTITY */}
                  <div className="quantity-control">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                    >
                      −
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() => increaseQuantity(item.id)}
                    >
                      +
                    </button>
                  </div>

                  {/* ITEM TOTAL */}
                  <p className="item-total">
                    ₹
                    {(
                      getPrice(item.price) * item.quantity
                    ).toLocaleString("en-IN")}
                  </p>

                  <button
                    className="remove-cart-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ORDER SUMMARY */}
          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Delivery</span>
              <span>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>

            <hr />

            <div className="summary-total">
              <span>Total</span>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <button
              className="checkout-btn"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Cart;
