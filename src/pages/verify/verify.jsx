import { Form } from "react-router-dom";
import "./verify.css";
import otp from "../../assets/img/otp.png";
import { useRef } from "react";

const Verify = () => {
  const inputRefs = useRef([]);

  const handleInputChange = (e, index) => {
    const value = e.target.value;

    // Only allow single digit and move to the next input
    if (value.length > 1) {
      e.target.value = value.slice(0, 1);
    }

    // Automatically focus the next input if a number is entered
    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace and move to the previous input
    if (e.key === 'Backspace' && !e.target.value && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <section className="verify">
      <div className="verify_inner flex wrap">
        <h2>Verify Email</h2>
        <div className="verify_info_inner">
          <div className="verify_info flex">
            <div className="v_info">
              <h3>Fill in the box below with the code</h3>
              <p>
                Kindly check the verification code sent to your email
                adegoke******@email.com
              </p>
            </div>
            <img src={otp} alt="OTP Illustration" />
          </div>
          <div className="verify_codes">
            <Form>
              <div className="flex input_codes">
                {[...Array(4)].map((_, index) => (
                  <input
                    key={index}
                    type="number"
                    className=""
                    onChange={(e) => handleInputChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    max="9" // Max digit is 9
                    min="0" // Min digit is 0
                    inputMode="numeric" // Ensures numeric keyboard on mobile devices
                  />
                ))}
              </div>
            </Form>
          </div>
        </div>
        <p>
          Didn't receive the code? Resend (<span className="verify-count">20s</span>)
        </p>
        <button className="verify-enter">Verify</button>
      </div>
    </section>
  );
};

export default Verify;
