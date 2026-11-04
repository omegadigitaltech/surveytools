import { Navigate, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import useAuthStore from "../../store/useAuthStore";
import {
  errorIncludes,
  logoutSession,
  requestPhoneOtp,
  verifyPhoneOtp,
} from "../../utils/kycApi";
import {
  E164_REGEX,
  OTP_REGEX,
  getPostAuthRoute,
  normalizePhone,
} from "../../utils/kycFlow";
import otp from "../../assets/img/otp.png";
import "./verify.css";

const CODE_LENGTH = 6;
const OTP_LIFETIME = 600; // seconds; the backend expires codes after 10 minutes
const RESEND_COOLDOWN = 60; // a new request invalidates the previous code

const formatTime = (s) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const Verify = () => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const {
    requiresPhoneVerification,
    userType,
    authToken,
    setRequiresPhoneVerification,
    logout,
  } = useAuthStore();

  const [step, setStep] = useState("phone"); // "phone" | "code"
  const [phoneInput, setPhoneInput] = useState("");
  const [phone, setPhone] = useState(""); // normalised E.164 the code was sent to
  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [resendIn, setResendIn] = useState(0);

  // One ticking clock drives both the expiry and the resend cooldown
  useEffect(() => {
    if (expiresIn <= 0 && resendIn <= 0) return;
    const timer = setTimeout(() => {
      setExpiresIn((s) => Math.max(s - 1, 0));
      setResendIn((s) => Math.max(s - 1, 0));
    }, 1000);
    return () => clearTimeout(timer);
  }, [expiresIn, resendIn]);

  if (!requiresPhoneVerification && !verifying) {
    return <Navigate to="/dashboard" replace />;
  }

  const sendCode = async (target) => {
    setSending(true);
    setError("");
    try {
      await requestPhoneOtp(target);
      setPhone(target);
      setStep("code");
      setDigits(Array(CODE_LENGTH).fill(""));
      setExpiresIn(OTP_LIFETIME);
      setResendIn(RESEND_COOLDOWN);
      toast.success(`Code sent to ${target}`);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    const target = normalizePhone(phoneInput.trim());
    if (!E164_REGEX.test(target)) {
      setError("Enter a valid phone number, e.g. +2348012345678.");
      return;
    }
    sendCode(target);
  };

  const finish = async () => {
    setRequiresPhoneVerification(false);
    navigate(
      await getPostAuthRoute({ userType, requiresPhoneVerification: false }),
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
      await verifyPhoneOtp(phone, code);
      toast.success("Phone verified successfully.");
      await finish();
    } catch (err) {
      if (errorIncludes(err, "already used")) {
        // The phone is already confirmed: nothing left to do here
        await finish();
        return;
      }
      if (errorIncludes(err, "expired") || errorIncludes(err, "no active otp")) {
        setExpiresIn(0);
        setResendIn(0);
        setError("This code has expired. Request a new one.");
      } else if (errorIncludes(err, "invalid otp")) {
        setError("Incorrect code. Please try again.");
      } else {
        setError(err.message);
      }
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

  return (
    <section className="verify">
      <div className="verify_inner form-coll flex wrap">
        <h2>Verify Phone Number</h2>
        <div className="verify_info_inner">
          <div className="verify_info flex">
            <div className="v_info">
              {step === "phone" ? (
                <>
                  <h3>Enter your phone number</h3>
                  <p>We&apos;ll text you a {CODE_LENGTH}-digit code to confirm it&apos;s you.</p>
                  <p>Nigerian numbers can start with 0, e.g. 08012345678.</p>
                </>
              ) : (
                <>
                  <h3>Fill in the boxes below with the code</h3>
                  <p>Check the SMS sent to {phone}</p>
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
            {step === "phone" ? (
              <form onSubmit={handlePhoneSubmit} noValidate>
                <div className="flex input_codes">
                  <input
                    className="verify-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="+2348012345678"
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    aria-label="Phone number"
                    aria-invalid={Boolean(error)}
                    disabled={sending}
                  />
                </div>
                {error && <p className="verify-error" role="alert">{error}</p>}
                <div className="flex verify-sec">
                  <button className="verify-enter" disabled={sending}>
                    {sending ? "Sending..." : "Send Code"}
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
                        `Resend in ${resendIn}s`
                      ) : (
                        <button
                          type="button"
                          onClick={() => sendCode(phone)}
                          disabled={sending}
                        >
                          {sending ? "Sending..." : "Resend"}
                        </button>
                      )}
                    </span>
                    {" · "}
                    <button
                      type="button"
                      className="verify-count"
                      onClick={() => {
                        setStep("phone");
                        setError("");
                      }}
                    >
                      Change number
                    </button>
                  </p>
                  <button className="verify-enter" disabled={verifying}>
                    {verifying ? "Verifying..." : "Verify"}
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
