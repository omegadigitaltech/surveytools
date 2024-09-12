import "./verify.css";
import otp from "../../assets/img/otp.png";

const Verify = () => {
  return (
    <section className="verify">
      <div className="verify_inner flex wrap">
        <h2>Verify Email</h2>
        <div className="verify_info_inner">
          <div className="verify_info flex">
            <div className="v_info">
              <h3>Fill in the box below with the code</h3>
              <p>
                Kindly check thge verification code sent to your email
                adegoke******@email.com
              </p>
            </div>
            <img src={otp} alt="" />
          </div>
          <div className="verify_codes">{/* I will be back */}</div>
        </div>
        <p>
          Didn't receive the code? Resend (<span>20s</span>){" "}
        </p>
        <button className="verify-enter">Verify</button>
      </div>
    </section>
  );
};

export default Verify;
