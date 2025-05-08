import { Form, useActionData, useNavigation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import useAuthStore from "../../store/useAuthStore";
import { toast } from "react-toastify";
import otp from "../../assets/img/otp.png";
import "./verify.css";

const Verify = () => {
  const inputRefs = useRef([]);
  const { signupEmail } = useAuthStore();
  const actionData = useActionData();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasDisplayedError, setHasDisplayedError] = useState(false); // Track if error toast has been shown
  const [countdown, setCountdown] = useState(0); // Countdown state
  const [canResend, setCanResend] = useState(false); // State to enable/disable resend action

  const handleInputChange = (e, index) => {
    const value = e.target.value;
    if (value.length > 1) {
      e.target.value = value.slice(0, 1);
    }
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = (e) => {
    const otpCode = inputRefs.current.map((input) => input.value).join("");
    console.log("OTP Code being sent:", otpCode);
    if (otpCode.length === 4) {
      // Add hidden input field to capture OTP
      const otpField = document.createElement("input");
      otpField.setAttribute("type", "hidden");
      otpField.setAttribute("name", "code");
      otpField.setAttribute("value", otpCode);
      e.target.appendChild(otpField);
      setIsVerifying(true);
      setHasDisplayedError(false); // Reset error display for new submission
      // Start the countdown
      setCountdown(40); // Start at 40 seconds
      setCanResend(false); // Disable the resend button during countdown
    } else {
      e.preventDefault();  // Block submission if OTP isn't valid
      setIsVerifying(false);
      toast.error("Please enter a 4-digit code.");
    }
  };

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true); // Enable resend action when countdown ends
    }
  }, [countdown]);

  const handleResend = () => {
    // Reset countdown and disable resend button
    setCountdown(40);
    setCanResend(false);

    // Add your logic here to handle resend action (e.g., API call)
    toast.info("Verification code resent.");
  };

  useEffect(() => {
    if (actionData?.status === "error" && !hasDisplayedError) {
      toast.error(actionData.message);
      setIsVerifying(false); // Reset verifying state after error
      setHasDisplayedError(true); // Mark error as displayed
    }
  }, [actionData, hasDisplayedError]);

  // Reset error display state whenever verification starts
  useEffect(() => {
    if (isVerifying) {
      setHasDisplayedError(false);
    }
  }, [isVerifying]);

  return (
    <section className="verify">
      <div className="verify_inner flex wrap">
        <h2>Verify Email</h2>
        <div className="verify_info_inner">
          <div className="verify_info flex">
            <div className="v_info">
              <h3>Fill in the box below with the code</h3>
              <p>Check the verification code sent to {signupEmail}</p>
              <p>Can't find the mail? Please check the spam folder.</p>
            </div>
            <img src={otp} alt="OTP Illustration" />
          </div>
          <div className="verify_codes">
            <Form method="post" onSubmit={handleVerify} action="/verify">
              <div className="flex input_codes">
                {[...Array(4)].map((_, index) => (
                  <input
                    key={index}
                    type="number"
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    max="9"
                    min="0"
                    inputMode="numeric"
                  />
                ))}
              </div>
              <div className="flex verify-sec">
                <p>Didn’t receive the code? Resend (<span className="verify-count">
                  {canResend ? (
                    <button onClick={handleResend} disabled={!canResend}>
                      Resend
                    </button>
                  ) : (
                    `${countdown}s`
                  )}
                </span>)</p>
                <button className="verify-enter" disabled={isVerifying}>
                  {isVerifying ? "Verifying..." : "Verify"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Verify;
