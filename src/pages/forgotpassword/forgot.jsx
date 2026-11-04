import { useState } from "react";
import { toast } from "react-toastify";
import { Form, useNavigate } from "react-router-dom";
import { requestPasswordReset } from "../../utils/kycApi";
import "./forgot.css";

const ForgotPw = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      // The backend answers 200 whether or not the account exists
      toast.success("If that email has an account, a 6-digit code is on its way.");
      navigate("/reset-password", { state: { email: email.trim() } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="forgot-section  flex">
      <div className="forgot form-col">
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
            {loading ? "Sending..." : "Send Reset Code"}
          </button>
        </Form>
      </div>
    </section>
  );
};
export default ForgotPw;
