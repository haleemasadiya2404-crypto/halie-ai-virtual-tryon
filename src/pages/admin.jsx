
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import localProducts from "../data/products";

const collections = [
  "Traditional",
  "Party Dress",
  "Gown",
  "Kurti",
  "Lehenga",
  "Saree",
  "Anarkali",
  "Salwar Suit",
  "Casual Wear",
  "Festive Wear",
];

const orderStatuses = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

const fieldStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  padding: "10px",
  marginTop: "6px",
  border: "1px solid #d8cbbb",
  borderRadius: "8px",
  fontSize: "16px",
};

const emptyForm = {
  name: "",
  price: "",
  salePrice: "",
  categories: [],
  description: "",
  sizes: "S, M, L, XL",
  colors: "",
  isSoldOut: false,
};

function splitList(value) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function imageList(product) {
  if (product.image_urls?.length) return product.image_urls;
  return [product.image_url || product.image].filter(Boolean);
}

async function uploadOneImage(image, name) {
  let file = image;

  if (typeof image === "string") {
    const response = await fetch(image);

    if (!response.ok) {
      throw new Error(`Could not load photo for ${name}.`);
    }

    const blob = await response.blob();

    file = new File([blob], `${name.replace(/[^a-z0-9]/gi, "-")}.jpg`, {
      type: blob.type || "image/jpeg",
    });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const path = `${crypto.randomUUID()}-${safeName}`;

  const { error } = await supabase.storage
    .from("outfit-images")
    .upload(path, file);

  if (error) throw error;

  return supabase.storage
    .from("outfit-images")
    .getPublicUrl(path).data.publicUrl;
}

async function uploadPhotos(files) {
  return Promise.all(files.map((file) => uploadOneImage(file, file.name)));
}

function formatPrice(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function Admin() {
  const [status, setStatus] = useState("checking");

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [message, setMessage] = useState("");

  // CHECK ADMIN ACCESS
  useEffect(() => {
    let stillHere = true;

    async function checkAdmin() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!stillHere) return;

      if (userError) {
        setStatus("error");
        return;
      }

      if (!user) {
        setStatus("signed-out");
        return;
      }

      const { data, error } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!stillHere) return;

      if (error) {
        console.error("Admin check failed:", error.message);
        setStatus("error");
      } else {
        setStatus(data ? "allowed" : "denied");
      }
    }

    checkAdmin().catch((error) => {
      console.error("Admin check failed:", error);

      if (stillHere) {
        setStatus("error");
      }
    });

    return () => {
      stillHere = false;
    };
  }, []);

  // LOAD PRODUCTS AND ORDERS AFTER ADMIN ACCESS IS CONFIRMED
  useEffect(() => {
    if (status === "allowed") {
      loadProducts();
      loadOrders();
    }
  }, [status]);

  // LOAD PRODUCTS
  async function loadProducts() {
    setLoadingProducts(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        "id, name, price, sale_price, is_sold_out, image_url, image_urls, category, categories, description, sizes, colors, active"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load products:", error.message);
      setMessage(`Could not load outfits: ${error.message}`);
    } else {
      setProducts(data || []);
    }

    setLoadingProducts(false);
  }

  // LOAD ORDERS
  async function loadOrders() {
    setLoadingOrders(true);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Could not load orders:", error.message);
      setMessage(`Could not load orders: ${error.message}`);
    } else {
      setOrders(data || []);
    }

    setLoadingOrders(false);
  }

  // UPDATE ORDER STATUS
  async function updateOrderStatus(orderId, newStatus) {
    if (!orderStatuses.includes(newStatus)) return;

    setUpdatingOrder(orderId);
    setMessage("");

    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Could not update order:", error.message);
      setMessage(`Could not update order: ${error.message}`);
    } else {
      setOrders((current) =>
        current.map((order) =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setMessage("Order status updated successfully!");
    }

    setUpdatingOrder(null);
  }

  // IMPORT EXISTING SAMPLE OUTFITS
  async function importSampleOutfits() {
    setSaving(true);
    setMessage("");

    try {
      const { data: saved, error: readError } = await supabase
        .from("products")
        .select("name");

      if (readError) throw readError;

      const knownNames = new Set(
        (saved || []).map((item) => item.name.trim().toLowerCase())
      );

      const missing = localProducts.filter(
        (item) => !knownNames.has(item.name.trim().toLowerCase())
      );

      if (missing.length === 0) {
        setMessage("All sample outfits are already in your outfit list.");
        return;
      }

      let imported = 0;

      for (const item of missing) {
        const sourceImages = imageList(item);

        const urls = await Promise.all(
          sourceImages.map((image) => uploadOneImage(image, item.name))
        );

        const price = Number(
          String(item.price || "").replace(/[^0-9.]/g, "")
        );

        const categoriesForItem = item.categories?.length
          ? item.categories
          : [item.category].filter(Boolean);

        const { error } = await supabase.from("products").insert({
          name: item.name,
          price,
          sale_price: null,
          is_sold_out: false,
          image_url: urls[0],
          image_urls: urls,
          try_on_image_url: urls[0],
          category: categoriesForItem[0] || "Traditional",
          categories: categoriesForItem,
          description: item.description || "",
          sizes: item.sizes || [],
          colors: item.colors || [],
          active: true,
        });

        if (error) throw error;

        imported += 1;
      }

      setMessage(
        `${imported} existing sample outfit(s) imported successfully.`
      );

      await loadProducts();
    } catch (error) {
      console.error("Could not import sample outfits:", error);
      setMessage(error.message || "Could not import the sample outfits.");
      await loadProducts();
    } finally {
      setSaving(false);
    }
  }

  // FORM INPUT CHANGES
  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  // SELECT COLLECTIONS
  function toggleCategory(category) {
    setForm((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  }

  // EDIT PRODUCT
  function startEditing(product) {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      price: product.price ?? "",
      salePrice: product.sale_price ?? "",
      categories:
        product.categories?.length > 0
          ? product.categories
          : [product.category].filter(Boolean),
      description: product.description || "",
      sizes: Array.isArray(product.sizes)
        ? product.sizes.join(", ")
        : "",
      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : "",
      isSoldOut: Boolean(product.is_sold_out),
    });

    setImageFiles([]);
    setMessage("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // CANCEL EDIT
  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setImageFiles([]);
    setMessage("");
  }

  // ADD OR UPDATE PRODUCT
  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!form.categories.length) {
      setMessage("Please choose at least one collection.");
      return;
    }

    const price = Number(form.price);

    const salePrice =
      form.salePrice === "" ? null : Number(form.salePrice);

    if (!Number.isFinite(price) || price < 0) {
      setMessage("Enter a valid outfit price.");
      return;
    }

    if (
      salePrice !== null &&
      (!Number.isFinite(salePrice) ||
        salePrice < 0 ||
        salePrice >= price)
    ) {
      setMessage("Sale price must be less than the regular price.");
      return;
    }

    if (!editingId && imageFiles.length === 0) {
      setMessage("Please choose at least one outfit photo.");
      return;
    }

    setSaving(true);

    try {
      const uploadedUrls = imageFiles.length
        ? await uploadPhotos(imageFiles)
        : [];

      const values = {
        name: form.name.trim(),
        price,
        sale_price: salePrice,
        is_sold_out: form.isSoldOut,
        category: form.categories[0],
        categories: form.categories,
        description: form.description.trim(),
        sizes: splitList(form.sizes),
        colors: splitList(form.colors),
      };

      if (editingId) {
        const current = products.find(
          (product) => product.id === editingId
        );

        const currentImages = imageList(current || {});
        const allImages = [...currentImages, ...uploadedUrls];

        const updateValues = {
          ...values,
          ...(uploadedUrls.length
            ? {
                image_urls: allImages,
                image_url: allImages[0],
              }
            : {}),
        };

        const { error } = await supabase
          .from("products")
          .update(updateValues)
          .eq("id", editingId);

        if (error) throw error;

        setMessage("Outfit updated successfully!");
      } else {
        const { error } = await supabase.from("products").insert({
          ...values,
          image_url: uploadedUrls[0],
          image_urls: uploadedUrls,
          try_on_image_url: uploadedUrls[0],
          active: true,
        });

        if (error) throw error;

        setMessage("Outfit added successfully!");
        event.target.reset();
      }

      setEditingId(null);
      setForm(emptyForm);
      setImageFiles([]);

      await loadProducts();
    } catch (error) {
      console.error("Could not save outfit:", error);

      setMessage(
        error.message || "Could not save the outfit. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE PRODUCT
  async function deleteOutfit(product) {
    const confirmed = window.confirm(
      `Permanently delete “${product.name}” from the website?`
    );

    if (!confirmed) return;

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      console.error("Could not delete outfit:", error.message);
      setMessage(`Could not delete outfit: ${error.message}`);
    } else {
      setProducts((current) =>
        current.filter((item) => item.id !== product.id)
      );

      if (editingId === product.id) {
        cancelEditing();
      }

      setMessage("Outfit deleted from the website.");
    }

    setSaving(false);
  }

  // ACCESS CONTROL
  if (status === "checking") {
    return <p>Checking admin access...</p>;
  }

  if (status === "signed-out") {
    return <Navigate to="/login" replace />;
  }

  if (status === "denied") {
    return (
      <main className="admin-page">
        <h1>Access denied</h1>
        <p>
          This account does not have permission to open the admin page.
        </p>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="admin-page">
        <h1>Could not check admin access</h1>
        <p>Please check your connection and try again.</p>
      </main>
    );
  }

  // ADMIN DASHBOARD
  return (
    <main
      className="admin-page"
      style={{
        maxWidth: 850,
        margin: "40px auto",
        padding: 24,
      }}
    >
      <h1>Admin Dashboard</h1>
      <p>Manage your HALIÉ outfits and customer orders from here.</p>

      {/* ADD OR EDIT OUTFIT */}
      <section
        style={{
          textAlign: "left",
          background: "#fffdf9",
          padding: 24,
          borderRadius: 14,
          marginBottom: 32,
        }}
      >
        <h2>{editingId ? "Edit outfit" : "Add a new outfit"}</h2>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 16 }}>
            Outfit name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            Regular price in rupees
            <input
              name="price"
              type="number"
              min="0"
              step="1"
              value={form.price}
              onChange={handleChange}
              required
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            Sale price in rupees (optional)
            <input
              name="salePrice"
              type="number"
              min="0"
              step="1"
              value={form.salePrice}
              onChange={handleChange}
              placeholder="Leave empty if there is no sale"
              style={fieldStyle}
            />
          </label>

          <fieldset
            style={{
              border: "1px solid #d8cbbb",
              borderRadius: 8,
              padding: 12,
              margin: "0 0 16px",
            }}
          >
            <legend>Collections — choose all that apply</legend>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 10,
              }}
            >
              {collections.map((category) => (
                <label key={category}>
                  <input
                    type="checkbox"
                    checked={form.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />{" "}
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          <label style={{ display: "block", marginBottom: 16 }}>
            Description
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            Sizes, separated by commas
            <input
              name="sizes"
              value={form.sizes}
              onChange={handleChange}
              placeholder="S, M, L, XL"
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            Colors, separated by commas
            <input
              name="colors"
              value={form.colors}
              onChange={handleChange}
              placeholder="Sage Green, Ivory"
              style={fieldStyle}
            />
          </label>

          <label style={{ display: "block", marginBottom: 16 }}>
            Outfit photos (select several)
            <input
              type="file"
              accept="image/*"
              multiple
              required={!editingId}
              onChange={(event) =>
                setImageFiles(Array.from(event.target.files || []))
              }
              style={fieldStyle}
            />
          </label>

          <label
            style={{
              display: "flex",
              gap: 10,
              alignItems: "center",
              marginBottom: 18,
            }}
          >
            <input
              name="isSoldOut"
              type="checkbox"
              checked={form.isSoldOut}
              onChange={handleChange}
            />
            Mark as sold out
          </label>

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 20px",
              border: 0,
              borderRadius: 8,
              background: "#b99043",
              color: "white",
            }}
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Save outfit changes"
                : "Add outfit"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEditing}
              disabled={saving}
              style={{
                marginLeft: 10,
                padding: "12px 20px",
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
      </section>

      {/* IMPORT SAMPLE OUTFITS */}
      <section style={{ textAlign: "left", marginBottom: 30 }}>
        <h2>Existing sample outfits</h2>

        <p>
          Import the three outfits currently built into the website so you
          can edit or delete them here.
        </p>

        <button
          type="button"
          onClick={importSampleOutfits}
          disabled={saving}
          style={{ padding: "10px 16px" }}
        >
          {saving ? "Working..." : "Import existing sample outfits"}
        </button>
      </section>

      {message && (
        <p role="status" style={{ margin: "16px 0", color: "#76551d" }}>
          {message}
        </p>
      )}

      {/* EXISTING PRODUCTS */}
      <section style={{ textAlign: "left", marginBottom: 40 }}>
        <h2>Your outfits</h2>

        <button
          type="button"
          onClick={loadProducts}
          disabled={loadingProducts}
          style={{ marginBottom: 16, padding: "8px 14px" }}
        >
          {loadingProducts ? "Refreshing..." : "Refresh outfits"}
        </button>

        {products.map((product) => {
          const image =
            product.image_urls?.[0] || product.image_url || "";

          const cats = product.categories?.length
            ? product.categories
            : [product.category];

          return (
            <article
              key={product.id}
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 16,
                alignItems: "center",
                background: "#fffdf9",
                border: "1px solid #e6d9c8",
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
              }}
            >
              {image && (
                <img
                  src={image}
                  alt={product.name}
                  style={{
                    width: 80,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              )}

              <div style={{ flex: 1, minWidth: 150 }}>
                <strong>{product.name}</strong>

                <p style={{ margin: "6px 0" }}>
                  {formatPrice(product.price)}
                  {product.sale_price != null
                    ? ` · Sale ${formatPrice(product.sale_price)}`
                    : ""}
                </p>

                <p style={{ margin: "6px 0" }}>
                  Collections: {cats.filter(Boolean).join(", ")}
                </p>

                {product.is_sold_out && (
                  <strong style={{ color: "#a33" }}>Sold out</strong>
                )}
              </div>

              <button
                type="button"
                onClick={() => startEditing(product)}
                disabled={saving}
                style={{ padding: "10px 14px" }}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => deleteOutfit(product)}
                disabled={saving}
                style={{
                  padding: "10px 14px",
                  color: "#a33",
                }}
              >
                Delete
              </button>
            </article>
          );
        })}

        {!loadingProducts && products.length === 0 && (
          <p>No outfits found yet.</p>
        )}
      </section>

      {/* CUSTOMER ORDERS */}
      <section
        style={{
          textAlign: "left",
          background: "#fffdf9",
          border: "1px solid #e6d9c8",
          borderRadius: 14,
          padding: 20,
          marginBottom: 30,
        }}
      >
        <h2>Customer Orders</h2>

        <p>View customer purchases and manage their order status.</p>

        <button
          type="button"
          onClick={loadOrders}
          disabled={loadingOrders}
          style={{
            padding: "9px 16px",
            marginBottom: 18,
          }}
        >
          {loadingOrders ? "Refreshing..." : "Refresh orders"}
        </button>

        {loadingOrders && orders.length === 0 && (
          <p>Loading customer orders...</p>
        )}

        {!loadingOrders && orders.length === 0 && (
          <p>No customer orders found yet.</p>
        )}

        {orders.map((order) => {
          const items = Array.isArray(order.items)
            ? order.items
            : [];

          return (
            <article
              key={order.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e6d9c8",
                borderRadius: 12,
                padding: 16,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 10,
                }}
              >
                <div>
                  <strong>Order #{String(order.id).slice(0, 8)}</strong>
                  <p style={{ margin: "6px 0", color: "#666" }}>
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <strong style={{ color: "#9b742e" }}>
                  {formatPrice(order.total)}
                </strong>
              </div>

              <hr
                style={{
                  border: 0,
                  borderTop: "1px solid #eee2d4",
                  margin: "14px 0",
                }}
              />

              <h3>Customer Details</h3>

              <p>
                <strong>Name:</strong> {order.customer_name || "Not provided"}
              </p>

              <p>
                <strong>Phone:</strong> {order.phone || "Not provided"}
              </p>

              <p>
                <strong>Address:</strong>{" "}
                {[
                  order.address,
                  order.city,
                  order.state,
                  order.pincode,
                ]
                  .filter(Boolean)
                  .join(", ") || "Not provided"}
              </p>

              <hr
                style={{
                  border: 0,
                  borderTop: "1px solid #eee2d4",
                  margin: "14px 0",
                }}
              />

              <h3>Purchased Items</h3>

              {items.length === 0 && (
                <p>Item details are not available for this order.</p>
              )}

              {items.map((item, index) => {
                const itemName =
                  item.name || item.title || item.product_name || "Outfit";

                const itemImage =
                  item.image ||
                  item.image_url ||
                  item.imageUrl ||
                  "";

                const quantity = Number(item.quantity || 1);
                const price = Number(item.price || 0);

                const size = item.selectedSize || item.size;
                const color = item.selectedColor || item.color;

                return (
                  <div
                    key={item.id || `${order.id}-${index}`}
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 0",
                      borderBottom: "1px solid #f0e8df",
                    }}
                  >
                    {itemImage && (
                      <img
                        src={itemImage}
                        alt={itemName}
                        style={{
                          width: 65,
                          height: 75,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}

                    <div style={{ flex: 1, minWidth: 140 }}>
                      <strong>{itemName}</strong>

                      <p style={{ margin: "5px 0" }}>
                        {formatPrice(price)} × {quantity}
                      </p>

                      {size && <p style={{ margin: "4px 0" }}>Size: {size}</p>}

                      {color && <p style={{ margin: "4px 0" }}>Color: {color}</p>}
                    </div>

                    <strong>
                      {formatPrice(price * quantity)}
                    </strong>
                  </div>
                );
              })}

              <div style={{ marginTop: 14 }}>
                <p>
                  <strong>Subtotal:</strong>{" "}
                  {formatPrice(order.subtotal)}
                </p>

                <p>
                  <strong>Delivery:</strong>{" "}
                  {formatPrice(order.delivery)}
                </p>

                <p style={{ fontSize: 18 }}>
                  <strong>Total:</strong>{" "}
                  {formatPrice(order.total)}
                </p>
              </div>

              <hr
                style={{
                  border: 0,
                  borderTop: "1px solid #eee2d4",
                  margin: "14px 0",
                }}
              />

              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Update Order Status
              </label>

              <select
                value={order.status || "pending"}
                disabled={updatingOrder === order.id}
                onChange={(event) =>
                  updateOrderStatus(order.id, event.target.value)
                }
                style={{
                  ...fieldStyle,
                  maxWidth: 300,
                  marginTop: 0,
                  textTransform: "capitalize",
                }}
              >
                {orderStatuses.map((orderStatus) => (
                  <option key={orderStatus} value={orderStatus}>
                    {orderStatus.charAt(0).toUpperCase() +
                      orderStatus.slice(1)}
                  </option>
                ))}
              </select>

              {updatingOrder === order.id && (
                <p>Updating order status...</p>
              )}
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Admin;
