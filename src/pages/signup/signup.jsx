import React, { useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import action from "./action";
import "./signup.css";
import "../utils.css";
import features from "../../assets/img/illustration-signup.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";

const USER_TYPES = [
  { value: "respondent", label: "Take surveys", hint: "Earn rewards answering surveys" },
  { value: "researcher", label: "Run research", hint: "Create and publish surveys" },
];

// Latest birth date that is 18 today, for the date picker's max
const maxDob = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().slice(0, 10);
})();

const SignUp = () => {
  const navigate = useNavigate();
  const setSignupEmail = useAuthStore((state) => state.setSignupEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [userType, setUserType] = useState("respondent");

  const handleToggle = () => {
    setShowPassword((prevState) => !prevState);
  };
  const iconPass = showPassword ? iconShow : iconHide;
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
    const formData = new FormData(e.target);  
    const response = await action({ formData });
    
    if (response?.status === "success") {
      setSignupEmail(response.signupEmail);
      navigate("/signin");
    } else {
      setLoading(false);
    }
  }
    catch {
    setLoading(false);
  }
    };

  return (
    <div className="auth-w4 flex">
      <div className="form-col">
        <h1 className="auth-w5-heading">Create An Account</h1>
        <p className="text-gray-600 mb-4 auth-w5-subtitle">Start taking surveys, earn rewards and learn through research.</p>

        <Form className="auth-w4-form" method="post" action="/signup" onSubmit={handleSubmit}>
          <div className="auth-w4-grid">
            {/* Account type - decides the KYC flow after sign in */}
            <div className="auth-w4-field auth-w4-full">
              <span className="auth-w4-label">I want to</span>
              <input type="hidden" name="userType" value={userType} />
              <div className="grid grid-cols-2 gap-3">
                {USER_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    aria-pressed={userType === type.value}
                    onClick={() => setUserType(type.value)}
                    className={`text-left px-4 py-2 rounded-lg border text-sm transition-colors ${
                      userType === type.value
                        ? "border-sky-600 bg-sky-50 text-sky-700"
                        : "border-slate-200 text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <span className="block font-medium">{type.label}</span>
                    <span className="block text-xs text-slate-500">{type.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Name fields - side by side */}
            <div className="auth-w4-field">
              <label className="auth-w4-label" htmlFor="firstname">
                Name
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="firstname"
                id="firstname"
                placeholder="First name"
                required
              />
            </div>
            <div className="auth-w4-field">
              <label className="auth-w4-label" htmlFor="lastname">
                Last Name
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="lastname"
                id="lastname"
                placeholder="Last name"
                required
              />
            </div>

            {/* Email - full width */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="email">
                Email
              </label>
              <input
                className="auth-w4-input"
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email address"
                required
              />
            </div>

            {/* Date of birth - full width */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="dateOfBirth">
                Date of Birth
              </label>
              <input
                className="auth-w4-input"
                type="date"
                name="dateOfBirth"
                id="dateOfBirth"
                max={maxDob}
                required
              />
            </div>

            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="password">
                Password
              </label>
              <div className="auth-w4-wrap">
                <input
                 className="auth-w4-input"
                 type={showPassword ? "text" : "password"}
                 name="password"
                 id="password"
                 placeholder="At least 8 characters"
                 minLength={8}
                  required
                 />
                <img
                  className="signin-icon"
                  src={iconPass}
                  onClick={handleToggle}
                  alt="Toggle Password Visibility"
                />
              </div>
            </div>

            {/* Confirm Password - full width */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="confirm">
                Confirm Password
              </label>
              <div className="auth-w4-wrap">
                <input
                  className="auth-w4-input "
                  type={showPassword ? "text" : "password"}
                  name="confirm"
                  id="confirm"
                  placeholder="Confirm password"
                  required
                />
                <img
                  className="signin-icon"
                  src={iconPass}
                  onClick={handleToggle}
                  alt="Toggle Password Visibility"
                />
              </div>
            </div>
          </div>

          {/* Terms & Conditions checkbox */}
          <label className="auth-w4-block agree-terms" htmlFor="terms">
            <input className="check" type="checkbox" id="terms" required />
            Agree to{" "} 
            <Link to="">
              terms & condition
            </Link>
          </label>

          {/* Submit button */}
          <button className="auth-w4-btn" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Create an Account"}
          </button>
        </Form>

        {/* Sign in link */}
        <div className="auth-w4- text-center">
          Have an account already?&nbsp;
          <Link className="auth-w4-" to="/signin">
            Login
          </Link>
        </div>
      </div>

      <div className="absolute top-0 right-0 h-screen w-[50%] flex justify-center items-center signup-col signup-image">
        <img src={features} alt="" />
      </div>
    </div>
  );
};

export default SignUp;