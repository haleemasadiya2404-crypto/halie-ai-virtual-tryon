import { supabase } from "../supabaseClient";
import { useState } from "react";

function Login() {
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
  event.preventDefault();
  setMessage("");
  setLoading(true);

  const formData = new FormData(event.currentTarget);
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  try {
    const result = isSignup
      ? await supabase.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      setMessage(result.error.message);
    } else if (isSignup && !result.data.session) {
      setMessage("Account created! Check your email to confirm it, then sign in.");
    } else {
      setMessage("You’re signed in!");
    }
  } catch {
    setMessage("Could not connect. Check your internet and try again.");
  } finally {
    setLoading(false);
  }
}
  const inputStyle = {
    width: "100%",
    padding: "12px",
    marginTop: "6px",
    border: "1px solid #d8d1c5",
    borderRadius: "8px",
    boxSizing: "border-box",
    fontSize: "16px",
  };

  return (
    <main style={{ maxWidth: "440px", margin: "60px auto", padding: "24px" }}>
      <section
        style={{
          padding: "32px",
          border: "1px solid #eee5d8",
          borderRadius: "16px",
          background: "#fffdf9",
          boxShadow: "0 8px 24px #0000000d",
        }}
      >
        <h1 style={{ textAlign: "center", color: "#382d25" }}>
          {isSignup ? "Create your HALIÉ account" : "Welcome back"}
        </h1>

        <p style={{ textAlign: "center", color: "#756b62" }}>
          {isSignup ? "Join HALIÉ to continue shopping." : "Sign in to your account."}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <label style={{ display: "block", marginTop: "20px" }}>
              Your name
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                style={inputStyle}
              />
            </label>
          )}

          <label style={{ display: "block", marginTop: "20px" }}>
            Email
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              style={inputStyle}
            />
          </label>

          <label style={{ display: "block", marginTop: "20px" }}>
            Password
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength="8"
              required
              style={inputStyle}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              marginTop: "24px",
              padding: "13px",
              border: "none",
              borderRadius: "24px",
              background: "#b99043",
              color: "white",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
          {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}  
          </button>
        </form>

        {message && (
          <p role="status" style={{ textAlign: "center", color: "#756b62" }}>
            {message}
          </p>
        )}

        <p style={{ textAlign: "center", marginTop: "22px" }}>
          {isSignup ? "Already have an account?" : "New to HALIÉ?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setMessage("");
            }}
            style={{
              border: "none",
              background: "none",
              color: "#94702f",
              cursor: "pointer",
              fontSize: "inherit",
              textDecoration: "underline",
            }}
          >
            {isSignup ? "Sign in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}

export default Login;