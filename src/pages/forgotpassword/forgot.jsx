import { useState } from "react";
import { toast } from "react-toastify";
import { Form, useNavigate } from "react-router-dom";
import config from "../../config/config";
import "./forgot.css";

const ForgotPw = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/forget-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || json.message || "Error");
      toast.success("Check email for reset link.");
      // optional: redirect or clear form
      // setTimeout(() => navigate("/signin"), 1500);
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="forgot-section flex">
      <div className="forgot">
        <h2>Password Reset</h2>
        <Form onSubmit={handleSubmit} className="auth-w5-form">
          <div className="auth-w5-field">
            <label className="auth-w5-label forgot-label" htmlFor="email">
              Email:
            </label>
            <input
              className="auth-w5-input forgot-input"
              id="email"
              type="email"
              placeholder="email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="forgot-btn auth-w5-btn"
          >
            {loading ? "Sending..." : "Reset Password"}
          </button>
        </Form>
      </div>
    </section>
  );
};
export default ForgotPw;
