
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

function Login() {
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  const [message, setMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
        setIsForgotPassword(false);
        setIsSignup(false);
        setMessage("Enter your new password below.");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const name = String(formData.get("name") || "").trim();

    try {
      // CREATE ACCOUNT
      if (isSignup) {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });

        if (result.error) {
          setMessage(result.error.message);
        } else if (!result.data.session) {
          setMessage(
            "Account created! Check your email to confirm it, then sign in."
          );
        } else {
          setMessage("Account created successfully!");
        }
      }

      // SIGN IN
      else {
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) {
          setMessage(result.error.message);
        } else {
          setMessage("You're signed in!");
        }
      }
    } catch {
      setMessage("Could not connect. Check your internet and try again.");
    } finally {
      setLoading(false);
    }
  }

  // SEND PASSWORD RESET EMAIL
  async function handleForgotPassword(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Password reset email sent! Check your inbox and open the reset link."
        );
      }
    } catch {
      setMessage("Could not send the reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // SAVE NEW PASSWORD
  async function handleNewPassword(event) {
    event.preventDefault();
    setMessage("");

    if (newPassword.length < 8) {
      setMessage("Your new password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage(error.message);
      } else {
        setIsRecovery(false);
        setNewPassword("");
        setIsSignup(false);
        setMessage(
          "Password updated successfully! You can now sign in with your new password."
        );

        await supabase.auth.signOut();
      }
    } catch {
      setMessage("Could not update your password. Please try again.");
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

  const buttonStyle = {
    width: "100%",
    marginTop: "24px",
    padding: "13px",
    border: "none",
    borderRadius: "24px",
    background: "#b99043",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
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
          {isRecovery
            ? "Create a new password"
            : isForgotPassword
              ? "Reset your password"
              : isSignup
                ? "Create your HALIÉ account"
                : "Welcome back"}
        </h1>

        <p style={{ textAlign: "center", color: "#756b62" }}>
          {isRecovery
            ? "Choose a new password for your account."
            : isForgotPassword
              ? "Enter your email to receive a password reset link."
              : isSignup
                ? "Join HALIÉ to continue shopping."
                : "Sign in to your account."}
        </p>

        {/* NEW PASSWORD FORM */}
        {isRecovery ? (
          <form onSubmit={handleNewPassword}>
            <label style={{ display: "block", marginTop: "20px" }}>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
                minLength="8"
                required
                style={inputStyle}
              />
            </label>

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        ) : isForgotPassword ? (
          /* FORGOT PASSWORD FORM */
          <form onSubmit={handleForgotPassword}>
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

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        ) : (
          /* SIGN IN AND SIGNUP FORM */
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

            {!isSignup && (
              <p style={{ textAlign: "right", marginBottom: 0 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(true);
                    setMessage("");
                  }}
                  style={{
                    border: "none",
                    background: "none",
                    color: "#94702f",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: "14px",
                  }}
                >
                  Forgot password?
                </button>
              </p>
            )}

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading
                ? "Please wait..."
                : isSignup
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>
        )}

        {message && (
          <p
            role="status"
            style={{
              textAlign: "center",
              color: "#756b62",
              overflowWrap: "anywhere",
            }}
          >
            {message}
          </p>
        )}

        {!isRecovery && (
          <p style={{ textAlign: "center", marginTop: "22px" }}>
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setMessage("");
                }}
                style={{
                  border: "none",
                  background: "none",
                  color: "#94702f",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "inherit",
                }}
              >
                Back to sign in
              </button>
            ) : (
              <>
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
              </>
            )}
          </p>
        )}
      </section>
    </main>
  );
}

export default Login;
