import { useState } from "react";
import { toast } from "react-toastify";
import { useLocation, Form, Link, useNavigate } from "react-router-dom";
import { requestPasswordReset, resetPassword } from "../../utils/kycApi";
import { OTP_REGEX } from "../../utils/kycFlow";
import "./resetpw.css";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";

const ResetPw = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = () => setShowPassword(!showPassword);
  const iconPass = showPassword ? iconShow : iconHide;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!OTP_REGEX.test(code)) {
      toast.error("Enter the 6-digit code from your email.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword({ email: email.trim(), code, newPassword, confirmPassword });
      toast.success("Password reset! Please sign in.");
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      toast.error("Enter your email first.");
      return;
    }
    setResending(true);
    try {
      await requestPasswordReset(email.trim());
      toast.success("A new code has been sent if the account exists.");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <section className="reset-section flex">
      <div className="forgot form-col">
        <h2>Reset Password</h2>
        <Form onSubmit={handleSubmit} className="auth-form">
          <div className="reset-auth-field">
            <label className="auth-w5-label forgot-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className="auth-w5-input forgot-input"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="reset-auth-field">
            <label className="auth-w5-label forgot-label" htmlFor="code">
              Reset Code
            </label>
            <input
              type="text"
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
              maxLength={6}
              className="auth-w5-input forgot-input"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              disabled={loading}
            />
          </div>
          <div className="reset-auth-field">
            <label className="auth-w5-label forgot-label" htmlFor="newPassword">New Password</label>
            <div className="auth-w5-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="auth-w5-input forgot-input"
                required
                minLength={8}
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
            <label className="auth-w5-label forgot-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="auth-w5-wrap">
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                required
                className="auth-w5-input forgot-input"
                minLength={8}
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
          <p className="text-sm text-center mt-3">
            Didn’t get a code?{" "}
            <button
              type="button"
              className="text-sky-600 font-medium"
              onClick={handleResend}
              disabled={resending || loading}
            >
              {resending ? "Sending..." : "Resend code"}
            </button>
            {" · "}
            <Link to="/signin" className="text-sky-600 font-medium">
              Back to sign in
            </Link>
          </p>
        </Form>
      </div>
    </section>
  );
};
export default ResetPw;
