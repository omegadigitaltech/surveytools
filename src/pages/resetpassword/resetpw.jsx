import { useState } from "react";
import { toast } from "react-toastify";
import { useParams, useLocation, Form, useNavigate } from "react-router-dom";
import config from "../../config/config";
import "./resetpw.css";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";

const ResetPw = () => {
  const { token: paramToken } = useParams();
  const { search } = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const queryToken = new URLSearchParams(search).get("token");

  // URL‐param if present, else the query param
  const token = paramToken || queryToken;

  const handleToggle = () => setShowPassword(!showPassword);
  const iconPass = showPassword ? iconShow : iconHide;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${config.API_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword, confirmPassword, token }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.msg || json.message || "Error");
      toast.success("Password reset! Please sign in.");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="reset-section flex">
      <div className="forgot">
        <h2>Reset Password</h2>
        <Form onSubmit={handleSubmit} className="auth-form">
          <div className="reset-auth-field">
            <label className="auth-w5-label forgot-label">New Password</label>
            <div className="auth-w5-wrap">
              <input
                type={showPassword ? "text" : "password"}
                // name="newPassword"
                id="newPassword"
                className="auth-w5-input forgot-input"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
              <img
                className="signin-icon pw-toggle"
                src={iconPass}
                alt="Toggle Password Visibility"
                onClick={handleToggle}
              />
            </div>
          </div>
          <div className="auth-field">
            <label className="auth-w5-label forgot-label">
              Confirm Password
            </label>
            <div className="auth-w5-wrap">
              <input
                type={showPassword ? "text" : "password"}
                // confirmPassword="password"
                id="confirmPassword"
                required
                className="auth-w5-input forgot-input"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
              <img
                className="signin-icon pw-toggle"
                src={iconPass}
                alt="Toggle Password Visibility"
                onClick={handleToggle}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="reset-btn auth-w5-btn"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </Form>
      </div>
    </section>
  );
};
export default ResetPw;
