import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import {
  describeOtpError,
  errorIncludes,
  isOtpStale,
  logoutSession,
  requestEmailOtp,
  verifyEmailOtp,
} from "../../utils/kycApi";
import { OTP_REGEX, getPostAuthRoute } from "../../utils/kycFlow";
import otp from "../../assets/img/otp.png";
import "./verify.css";

// Values mirror the backend (src/kyc/email-otp.*, config/kyc-config.js)
const CODE_LENGTH = 6;
const OTP_LIFETIME = 600; // seconds; codes expire after 10 minutes
const RESEND_COOLDOWN = 60; // a new request invalidates the previous code
const RATE_LIMIT_WINDOW = 900; // 15-minute per-IP window on both steps

const formatTime = (s) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const emptyDigits = () => Array(CODE_LENGTH).fill("");

const Verify = () => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const {
    requiresEmailVerification,
    userType,
    userEmail,
    authToken,
    setRequiresEmailVerification,
    logout,
  } = useAuthStore();

  // Locked to the account email: the backend overwrites the account email
  // with whatever address is verified, so it must never be user-editable.
  const email = (userEmail || "").trim();

  const [step, setStep] = useState("email"); // "email" | "code"
  const [digits, setDigits] = useState(emptyDigits);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);
  const [lockedIn, setLockedIn] = useState(0); // verify rate-limit lockout

  // One ticking clock drives expiry, resend cooldown and lockout
  useEffect(() => {
    if (expiresIn <= 0 && resendIn <= 0 && lockedIn <= 0) return;
    const timer = setTimeout(() => {
      setExpiresIn((s) => Math.max(s - 1, 0));
      setResendIn((s) => Math.max(s - 1, 0));
      setLockedIn((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [expiresIn, resendIn, lockedIn]);

  if (!requiresEmailVerification && !verifying) {
    return <Navigate to="/dashboard" replace />;
  }

  const focusFirst = () => setTimeout(() => inputRefs.current[0]?.focus(), 0);

  const sendCode = async () => {
    setSending(true);
    setError("");
    try {
      await requestEmailOtp(email);
      setStep("code");
      setDigits(emptyDigits());
      setExpiresIn(OTP_LIFETIME);
      setResendIn(RESEND_COOLDOWN);
      toast.success(`Code sent to ${email}`);
      focusFirst();
    } catch (err) {
      if (err.status === 429) setResendIn(RATE_LIMIT_WINDOW);
      setError(describeOtpError(err));
    } finally {
      setSending(false);
    }
  };

  const handleSendSubmit = (e) => {
    e.preventDefault();
    sendCode();
  };

  const finish = async () => {
    setRequiresEmailVerification(false);
    navigate(
      await getPostAuthRoute({ userType, requiresEmailVerification: false }),
      { replace: true },
    );
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = digits.join("");
    if (!OTP_REGEX.test(code)) {
      setError(`Enter the ${CODE_LENGTH}-digit code.`);
      return;
    }

    setVerifying(true);
    setError("");
    try {
      await verifyEmailOtp(email, code);
      toast.success("Email verified successfully.");
      await finish();
    } catch (err) {
      if (isOtpStale(err)) {
        // Let the user request a fresh code straight away
        setExpiresIn(0);
        setResendIn(0);
      } else if (err.status === 429) {
        setLockedIn(RATE_LIMIT_WINDOW);
      } else if (errorIncludes(err, "invalid otp")) {
        setDigits(emptyDigits());
        focusFirst();
      }
      setError(describeOtpError(err));
      setVerifying(false);
    }
  };

  const handleDigitChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, "");
    // A paste or autofill can deliver the whole code into one box
    if (value.length > 1) {
      const next = value.slice(0, CODE_LENGTH).split("");
      setDigits([...next, ...Array(CODE_LENGTH - next.length).fill("")]);
      inputRefs.current[Math.min(next.length, CODE_LENGTH - 1)]?.focus();
      return;
    }
    setDigits((prev) => prev.map((d, i) => (i === index ? value : d)));
    if (value && index < CODE_LENGTH - 1) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSwitchAccount = () => {
    const token = authToken;
    logout();
    logoutSession(token);
    navigate("/signin", { replace: true });
  };

  const expired = step === "code" && expiresIn <= 0;
  const verifyDisabled = verifying || lockedIn > 0 || expired;

  return (
    <section className="verify">
      <div className="verify_inner form-coll flex wrap">
        <h2>Verify Email Address</h2>
        <div className="verify_info_inner">
          <div className="verify_info flex">
            <div className="v_info">
              {step === "email" ? (
                <>
                  <h3>Confirm your email address</h3>
                  <p>We&apos;ll email you a {CODE_LENGTH}-digit code to confirm it&apos;s you.</p>
                </>
              ) : (
                <>
                  <h3>Fill in the boxes below with the code</h3>
                  <p>Check the inbox (and spam folder) for {email}</p>
                  <p>
                    {expiresIn > 0
                      ? `The code expires in ${formatTime(expiresIn)}.`
                      : "The code has expired. Request a new one."}
                  </p>
                </>
              )}
            </div>
            <img src={otp} alt="OTP Illustration" />
          </div>

          <div className="verify_codes">
            {step === "email" ? (
              <form onSubmit={handleSendSubmit} noValidate>
                <div className="flex input_codes">
                  <input
                    className="verify-email"
                    type="email"
                    value={email}
                    readOnly
                    aria-readonly="true"
                    aria-label="Account email"
                  />
                </div>
                {!email && (
                  <p className="verify-error" role="alert">
                    We couldn&apos;t find the email on your account. Please sign in again.
                  </p>
                )}
                {error && <p className="verify-error" role="alert">{error}</p>}
                <div className="flex verify-sec">
                  <button
                    className="verify-enter"
                    disabled={!email || sending || resendIn > 0}
                  >
                    {sending
                      ? "Sending..."
                      : resendIn > 0
                        ? `Try again in ${formatTime(resendIn)}`
                        : "Send code"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerify} noValidate>
                <div className="flex input_codes">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      autoComplete={index === 0 ? "one-time-code" : "off"}
                      value={digit}
                      onChange={(e) => handleDigitChange(e, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      ref={(el) => (inputRefs.current[index] = el)}
                      aria-label={`Digit ${index + 1}`}
                      aria-invalid={Boolean(error)}
                      disabled={verifying}
                    />
                  ))}
                </div>
                {error && <p className="verify-error" role="alert">{error}</p>}
                <div className="flex verify-sec">
                  <p>
                    Didn’t receive the code?{" "}
                    <span className="verify-count">
                      {resendIn > 0 ? (
                        `Resend in ${formatTime(resendIn)}`
                      ) : (
                        <button
                          type="button"
                          onClick={sendCode}
                          disabled={sending}
                        >
                          {sending ? "Sending..." : "Resend"}
                        </button>
                      )}
                    </span>
                  </p>
                  <button className="verify-enter" disabled={verifyDisabled}>
                    {verifying
                      ? "Verifying..."
                      : lockedIn > 0
                        ? `Try again in ${formatTime(lockedIn)}`
                        : "Verify"}
                  </button>
                </div>
              </form>
            )}
            <p className="verify-switch">
              Wrong account?{" "}
              <button type="button" onClick={handleSwitchAccount}>
                Sign in with another
              </button>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verify;
