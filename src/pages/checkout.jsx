
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

function Checkout() {
  const navigate = useNavigate();

  const [cart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("halieCart")) || [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const getPrice = (price) =>
    Number(String(price || 0).replace(/[₹,]/g, ""));

  const subtotal = cart.reduce(
    (total, item) =>
      total + getPrice(item.price) * (item.quantity || 1),
    0
  );

  const delivery = subtotal >= 2000 ? 0 : 99;
  const total = subtotal + delivery;

  const validateField = (name, value) => {
    let error = "";

    if (name === "name") {
      if (!value.trim()) error = "Full name is required.";
      else if (!/^[A-Za-z ]+$/.test(value))
        error = "Name should contain letters only.";
    }

    if (name === "phone") {
      if (!value.trim()) error = "Phone number is required.";
      else if (!/^[6-9]\d{9}$/.test(value))
        error = "Enter a valid 10-digit phone number.";
    }

    if (name === "address") {
      if (!value.trim()) error = "Delivery address is required.";
      else if (value.trim().length < 10)
        error = "Please enter a complete address.";
    }

    if (name === "city") {
      if (!value.trim()) error = "City is required.";
      else if (!/^[A-Za-z ]+$/.test(value))
        error = "City should contain letters only.";
    }

    if (name === "state") {
      if (!value.trim()) error = "State is required.";
      else if (!/^[A-Za-z ]+$/.test(value))
        error = "State should contain letters only.";
    }

    if (name === "pincode") {
      if (!value.trim()) error = "Pincode is required.";
      else if (!/^\d{6}$/.test(value))
        error = "Pincode must be exactly 6 digits.";
    }

    return error;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: validateField(name, value),
    }));

    setSubmitError("");
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    if (saving) return;

    if (cart.length === 0) {
      alert("Your cart is empty.");
      navigate("/shop");
      return;
    }

    const newErrors = {};

    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    if (
      !Number.isFinite(subtotal) ||
      !Number.isFinite(total) ||
      subtotal < 0
    ) {
      setSubmitError("Your cart contains an invalid price.");
      return;
    }

    setSaving(true);
    setSubmitError("");

    try {
      const order = {
        customer_name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        items: cart,
        subtotal,
        delivery,
        total,
        status: "pending",
      };

      const { error } = await supabase
        .from("orders")
        .insert([order]);

      if (error) throw error;

      // Keep a local copy for the confirmation page.
      localStorage.setItem(
        "halieOrder",
        JSON.stringify({
          customer: formData,
          items: cart,
          subtotal,
          delivery,
          total,
          date: new Date().toISOString(),
        })
      );

      // Clear cart only after Supabase confirms success.
      localStorage.removeItem("halieCart");

      navigate("/order-confirmed");
    } catch (error) {
      console.error("Order submission error:", error);

      setSubmitError(
        error.message ||
          "Unable to place your order. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="checkout-page">
      <div className="checkout-header">
        <p>HALIÉ CHECKOUT</p>
        <h1>Complete Your Order 🛍️</h1>
      </div>

      <div className="checkout-container">
        <div className="checkout-form-box">
          <h2>Delivery Details</h2>

          <p className="checkout-subtitle">
            Please enter your details carefully.
          </p>

          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? "input-error" : ""}
              />
              {errors.name && (
                <p className="error-message">⚠️ {errors.name}</p>
              )}
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                maxLength="10"
                onChange={handleChange}
                className={errors.phone ? "input-error" : ""}
              />
              {errors.phone && (
                <p className="error-message">⚠️ {errors.phone}</p>
              )}
            </div>

            <div className="form-group">
              <label>Delivery Address</label>
              <textarea
                name="address"
                placeholder="House / Flat No, Street, Area"
                value={formData.address}
                onChange={handleChange}
                className={errors.address ? "input-error" : ""}
              />
              {errors.address && (
                <p className="error-message">⚠️ {errors.address}</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={handleChange}
                  className={errors.city ? "input-error" : ""}
                />
                {errors.city && (
                  <p className="error-message">⚠️ {errors.city}</p>
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
                  className={errors.state ? "input-error" : ""}
                />
                {errors.state && (
                  <p className="error-message">⚠️ {errors.state}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="Enter 6-digit pincode"
                value={formData.pincode}
                maxLength="6"
                onChange={handleChange}
                className={errors.pincode ? "input-error" : ""}
              />
              {errors.pincode && (
                <p className="error-message">⚠️ {errors.pincode}</p>
              )}
            </div>

            {submitError && (
              <p className="error-message">{submitError}</p>
            )}

            <button
              type="submit"
              className="place-order-btn"
              disabled={saving}
            >
              {saving ? "Saving Order..." : "Place Order ✨"}
            </button>
          </form>
        </div>

        <div className="checkout-summary">
          <h2>Order Summary</h2>

          {cart.map((item) => (
            <div className="checkout-item" key={item.id}>
              <img src={item.image} alt={item.name} />

              <div>
                <h3>{item.name}</h3>
                <p>Qty: {item.quantity || 1}</p>
                <p>
                  ₹
                  {(
                    getPrice(item.price) * (item.quantity || 1)
                  ).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}

          <hr />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>

          <div className="summary-row">
            <span>Delivery</span>
            <span>{delivery === 0 ? "FREE" : `₹${delivery}`}</span>
          </div>

          <div className="summary-total">
            <span>Total</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Checkout;
