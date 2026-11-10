
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function OrderConfirmed() {
  const navigate = useNavigate();

  const [order] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("halieOrder")) || null;
    } catch {
      return null;
    }
  });

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);

  const formattedDate = deliveryDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="order-confirmed-page">
      <div className="order-confirmed-box">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>

        <p>
          Thank you for shopping with <strong>HALIÉ</strong> 💕
        </p>

        <p className="order-success-message">
          Your order has been placed successfully.
        </p>

        <div className="delivery-info">
          <h2>📦 Estimated Delivery</h2>
          <div className="delivery-date">{formattedDate}</div>
          <p>Your HALIÉ order is expected to arrive by this date.</p>
        </div>

        <div className="delivery-address">
          <h2>📍 Delivering To</h2>

          {order?.customer ? (
            <>
              <strong>{order.customer.name}</strong>
              <p>{order.customer.address}</p>
              <p>
                {order.customer.city}, {order.customer.state} -{" "}
                {order.customer.pincode}
              </p>
              <p>📞 {order.customer.phone}</p>
            </>
          ) : (
            <p>Delivery details unavailable.</p>
          )}
        </div>

        {order && (
          <div className="confirmed-order-summary">
            <h2>🛍️ Order Summary</h2>

            {order.items?.map((item) => {
              const price = Number(
                String(item.price).replace(/[₹,]/g, "")
              );
              const quantity = item.quantity || 1;

              return (
                <div className="confirmed-order-item" key={item.id}>
                  <img src={item.image} alt={item.name} />
                  <div>
                    <h3>{item.name}</h3>
                    <p>Quantity: {quantity}</p>
                    <p>
                      ₹{(price * quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="confirmed-total">
              <p>
                Subtotal: ₹
                {Number(order.subtotal || 0).toLocaleString("en-IN")}
              </p>

              <p>
                Delivery:{" "}
                {order.delivery === 0 ? "FREE" : `₹${order.delivery}`}
              </p>

              <h3>
                Total: ₹
                {Number(order.total || 0).toLocaleString("en-IN")}
              </h3>
            </div>
          </div>
        )}

        <div className="order-tracking">
          <h2>🚚 Where is my order?</h2>

          <div className="tracking-step active">
            <span>✓</span>
            <div>
              <strong>Order Confirmed</strong>
              <p>Your order has been received.</p>
            </div>
          </div>

          <div className="tracking-step">
            <span>2</span>
            <div>
              <strong>Packed</strong>
              <p>Waiting to be packed.</p>
            </div>
          </div>

          <div className="tracking-step">
            <span>3</span>
            <div>
              <strong>Shipped</strong>
              <p>Your order will be shipped soon.</p>
            </div>
          </div>

          <div className="tracking-step">
            <span>4</span>
            <div>
              <strong>Out for Delivery</strong>
              <p>Your order will be on its way to you.</p>
            </div>
          </div>

          <div className="tracking-step">
            <span>5</span>
            <div>
              <strong>Delivered</strong>
              <p>Enjoy your HALIÉ outfit! ✨</p>
            </div>
          </div>
        </div>

        <button
          className="continue-shopping-btn"
          onClick={() => navigate("/shop")}
        >
          Continue Shopping 🛍️
        </button>
      </div>
    </section>
  );
}

export default OrderConfirmed;
