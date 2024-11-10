import { Form, useActionData, useNavigation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import otp from "../../assets/img/otp.png";
import "./verify.css";

const Verify = () => {
  const inputRefs = useRef([]);
  const actionData = useActionData();
  const navigation = useNavigation();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasDisplayedError, setHasDisplayedError] = useState(false); // Track if error toast has been shown

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
    } else {
      e.preventDefault();  // Block submission if OTP isn't valid
      setIsVerifying(false);
      toast.error("Please enter a 4-digit code.");
    }
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
              <p>Check the verification code sent to your email adegoke******@email.com</p>
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
                <p>Didn’t receive the code? Resend (<span className="verify-count">20s</span>)</p>
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
