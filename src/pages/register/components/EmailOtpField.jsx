import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { requestEmailOtp, verifyEmailOtp } from "../../../utils/kycApi";
import { OTP_REGEX, isEduNgEmail } from "../../../utils/kycFlow";
import { Field } from "./fields";

// Institutional (.edu.ng) email with inline OTP verification
export default function EmailOtpField({ label, email, onEmailChange, verified, onVerified, error }) {
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");

  const describe = (err) =>
    err.status === 429 ? "Too many attempts. Please wait 15 minutes." : err.message;

  const handleEmailChange = (value) => {
    onEmailChange(value);
    // A different address needs its own code
    onVerified(false);
    setSent(false);
    setCode("");
    setMessage("");
  };

  const sendCode = async () => {
    if (!isEduNgEmail(email.trim())) {
      setMessage("Only .edu.ng institutional emails are accepted here.");
      return;
    }
    setSending(true);
    setMessage("");
    try {
      await requestEmailOtp(email.trim());
      setSent(true);
      setMessage("We sent a 6-digit code to your institutional email.");
    } catch (err) {
      setMessage(describe(err));
    } finally {
      setSending(false);
    }
  };

  const verify = async () => {
    if (!OTP_REGEX.test(code)) {
      setMessage("Enter the 6-digit code.");
      return;
    }
    setVerifying(true);
    setMessage("");
    try {
      await verifyEmailOtp(email.trim(), code);
      onVerified(true);
    } catch (err) {
      setMessage(
        /no active otp|expired/i.test(err.message)
          ? "This code has expired. Send a new one."
          : describe(err),
      );
    } finally {
      setVerifying(false);
    }
  };

  const buttonClass =
    "shrink-0 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-sm font-medium px-4 rounded-lg";

  return (
    <Field label={label} required full error={error} htmlFor="studentEmail">
      <div className="flex gap-2">
        <input
          id="studentEmail"
          type="email"
          className="input"
          placeholder="you@student.school.edu.ng"
          value={email}
          onChange={(e) => handleEmailChange(e.target.value)}
          disabled={verified}
        />
        {verified ? (
          <span className="flex items-center gap-1 text-emerald-600 text-sm font-medium shrink-0">
            <CheckCircle2 className="w-4 h-4" strokeWidth={2} /> Verified
          </span>
        ) : (
          <button type="button" className={buttonClass} onClick={sendCode} disabled={sending}>
            {sending ? "Sending..." : sent ? "Resend" : "Send code"}
          </button>
        )}
      </div>

      {sent && !verified && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            className="input"
            placeholder="6-digit code"
            aria-label="Email verification code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          <button type="button" className={buttonClass} onClick={verify} disabled={verifying}>
            {verifying ? "Verifying..." : "Verify"}
          </button>
        </div>
      )}
      {message && !verified && <p className="text-xs text-slate-500 mt-1">{message}</p>}
    </Field>
  );
}
