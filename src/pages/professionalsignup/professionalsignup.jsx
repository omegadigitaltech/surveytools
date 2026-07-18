// import useAuthStore from "../../store/useAuthStore";
// import action from "./action";
import { Form, Link, useActionData, useNavigate, } from "react-router-dom";
import React, { useState, useEffect } from "react";
import action from "./action";
// import "./profsignup.css";
// import "../utils.css";
import features from "../../assets/img/illustration-signup.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";


const ProfessionalSignUp = () =>{
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
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
      setTimeout(() => {
        setLoading(false);
          navigate("/verify");
      }, 1500);
    } else {
      setLoading(false);
    }
  }
    catch (err) {
    console.error("Unexpected error:", err);
    setLoading(false);
  }
    };

    return(
        <section className="profsignup">
<div className="auth-w4 flex">
      <div className="form-col">
        <h1 className="auth-w5-heading">Create An Account</h1>
        <p className="text-gray-600 mb-4 auth-w5-subtitle">Sign up as a professional, share your expertise, run surveys and gain insights for your career.</p>

        <Form className="auth-w4-form" method="post" action="/signup" onSubmit={handleSubmit}>
          <div className="auth-w4-grid">
            {/* Name fields - side by side */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="firstname">
                Name
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="name"
                id="name"
                placeholder="Name"
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

            {/* Institution - full width */}
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="institution">
                Job Title
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="job-title"
                id="job-title"
                placeholder="What you do"
                required
              />
            </div>
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="industry">
                Industry
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="industry"
                id="industry"
                placeholder="Area of expertise"
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
                 placeholder="Create a password"
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
        </section>
    )
}
export default ProfessionalSignUp;