import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Checkout() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});

  // Load cart
  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("halieCart")) || [];

    setCart(savedCart);
  }, []);

  // Convert price to number
  const getPrice = (price) => {
    return Number(
      String(price).replace(/[₹,]/g, "")
    );
  };

  // Calculate subtotal
  const subtotal = cart.reduce(
    (total, item) =>
      total +
      getPrice(item.price) *
        (item.quantity || 1),
    0
  );

  // Delivery
  const delivery = subtotal >= 2000 ? 0 : 99;

  // Final total
  const total = subtotal + delivery;

  const validateField = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value.trim()) {
        error = "Full name is required.";
      } else if (!/^[A-Za-z ]+$/.test(value)) {
        error = "Name should contain letters only.";
      }
    }

    if (name === "phone") {
      if (!value.trim()) {
        error = "Phone number is required.";
      } else if (!/^[6-9]\d{9}$/.test(value)) {
        error = "Enter a valid 10-digit phone number.";
      }
    }

    if (name === "address") {
      if (!value.trim()) {
        error = "Delivery address is required.";
      } else if (value.trim().length < 10) {
        error = "Please enter a complete address.";
      }
    }

    if (name === "city") {
      if (!value.trim()) {
        error = "City is required.";
      } else if (!/^[A-Za-z ]+$/.test(value)) {
        error = "City should contain letters only.";
      }
    }

    if (name === "state") {
      if (!value.trim()) {
        error = "State is required.";
      } else if (!/^[A-Za-z ]+$/.test(value)) {
        error = "State should contain letters only.";
      }
    }

    if (name === "pincode") {
      if (!value.trim()) {
        error = "Pincode is required.";
      } else if (!/^\d{6}$/.test(value)) {
        error = "Pincode must be exactly 6 digits.";
      }
    }

    return error;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    const error = validateField(name, value);

    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();

    // Don't allow empty orders
    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/shop");
      return;
    }

    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(
        field,
        formData[field]
      );

      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Save complete order
    const order = {
      customer: formData,
      items: cart,
      subtotal,
      delivery,
      total,
      date: new Date().toISOString(),
    };

    localStorage.setItem(
      "halieOrder",
      JSON.stringify(order)
    );

    // Clear cart
    localStorage.removeItem("halieCart");

    // Go to confirmation
    navigate("/order-confirmed");
  };

  return (
    <section className="checkout-page">

      <div className="checkout-header">
        <p>HALIÉ CHECKOUT</p>

        <h1>Complete Your Order 🛍️</h1>
      </div>

      <div className="checkout-container">

        {/* DELIVERY FORM */}

        <div className="checkout-form-box">

          <h2>Delivery Details</h2>

          <p className="checkout-subtitle">
            Please enter your details carefully.
          </p>

          <form onSubmit={handlePlaceOrder}>

            {/* NAME */}

            <div className="form-group">
              <label>Full Name</label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={
                  errors.name
                    ? "input-error"
                    : ""
                }
              />

              {errors.name && (
                <p className="error-message">
                  ⚠️ {errors.name}
                </p>
              )}
            </div>

            {/* PHONE */}

            <div className="form-group">
              <label>Phone Number</label>

              <input
                type="tel"
                name="phone"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                maxLength="10"
                onChange={handleChange}
                className={
                  errors.phone
                    ? "input-error"
                    : ""
                }
              />

              {errors.phone && (
                <p className="error-message">
                  ⚠️ {errors.phone}
                </p>
              )}
            </div>

            {/* ADDRESS */}

            <div className="form-group">
              <label>Delivery Address</label>

              <textarea
                name="address"
                placeholder="House / Flat No, Street, Area"
                value={formData.address}
                onChange={handleChange}
                className={
                  errors.address
                    ? "input-error"
                    : ""
                }
              />

              {errors.address && (
                <p className="error-message">
                  ⚠️ {errors.address}
                </p>
              )}
            </div>

            {/* CITY + STATE */}

            <div className="form-row">

              <div className="form-group">
                <label>City</label>

                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  className={
                    errors.city
                      ? "input-error"
                      : ""
                  }
                />

                {errors.city && (
                  <p className="error-message">
                    ⚠️ {errors.city}
                  </p>
                )}
              </div>

              <div className="form-group">
                <label>State</label>

                <input
                  type="text"
                  name="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={handleChange}
                  className={
                    errors.state
                      ? "input-error"
                      : ""
                  }
                />

                {errors.state && (
                  <p className="error-message">
                    ⚠️ {errors.state}
                  </p>
                )}
              </div>

            </div>

            {/* PINCODE */}

            <div className="form-group">
              <label>Pincode</label>

              <input
                type="text"
                name="pincode"
                placeholder="Enter 6-digit pincode"
                value={formData.pincode}
                maxLength="6"
                onChange={handleChange}
                className={
                  errors.pincode
                    ? "input-error"
                    : ""
                }
              />

              {errors.pincode && (
                <p className="error-message">
                  ⚠️ {errors.pincode}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="place-order-btn"
            >
              Place Order ✨
            </button>

          </form>

        </div>

        {/* ORDER SUMMARY */}

        <div className="checkout-summary">

          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div
              className="checkout-item"
              key={item.id}
            >

              <img
                src={item.image}
                alt={item.name}
              />

              <div>
                <h3>{item.name}</h3>

                <p>
                  Qty: {item.quantity || 1}
                </p>

                <p>
                  ₹
                  {(
                    getPrice(item.price) *
                    (item.quantity || 1)
                  ).toLocaleString("en-IN")}
                </p>
              </div>

            </div>
          ))}

          <hr />

          <div className="summary-row">
            <span>Subtotal</span>

            <span>
              ₹{subtotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>

            <span>
              {delivery === 0
                ? "FREE"
                : `₹${delivery}`}
            </span>
          </div>

          <div className="summary-total">
            <span>Total</span>

            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

      </div>

    </section>
  );
}

export default Checkout;