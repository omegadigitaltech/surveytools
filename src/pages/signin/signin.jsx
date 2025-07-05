import { Form, Link, useNavigate, useActionData } from "react-router-dom";
import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/useAuthStore";
import action from "./action";
import "./signin.css";
import "../utils.css";
import iconFB from "../../assets/img/img-fb.png";
import iconGL from "../../assets/img/img-gl.png";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";
import features from "../../assets/img/illustration-signin.svg";

const SignIn = () => {
  const navigate = useNavigate();
  const setAuthData = useAuthStore((state) => state.setAuthData);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = () => setShowPassword(!showPassword);
  const iconPass = showPassword ? iconShow : iconHide;

  // Stop loading spinner when actionData updates
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    // Create FormData from the event target (the form element)
    const formData = new FormData(e.target);

    // Run the login action
    const response = await action({ formData });

    // Check if login was successful and set auth data in Zustand store
    if (response?.status === "success") {
      setAuthData(response.token, response.userEmail, response.userName, response.userInst);
      setTimeout(() => {
        if (response.userVerified) {
          navigate("/dashboard");
        } else {
          navigate("/verify");
        }
      }, 1500);
    } else {
      setLoading(false);
    }
  };


  return (
    <div className="auth-w5 flex">
      <div className="form-col">
    
        <Form className="auth-w5-form" method="post" action="/signin" onSubmit={handleSubmit} >
          <div className="auth-w5-field">
            <label className="auth-w5-label" htmlFor="email">Email</label>
            <input className="auth-w5-input" type="text" name="email" id="email" required />
          </div>
          <div className="auth-w5-field">
            <label className="auth-w5-label" htmlFor="password">Password</label>
            <div className="auth-w5-wrap">
              <input className="auth-w5-input" type={showPassword ? "text" : "password"} name="password" id="password" required />
              <img className="signin-icon pw-toggle" src={iconPass} alt="Toggle Password Visibility" onClick={handleToggle} />
            </div>
          </div>
          <div className="auth-w5-third">
            {/* <label className="auth-w5-block" htmlFor="remember">
              <input className="auth-w5-check" type="checkbox" name="checkbox" /> Remember me
            </label> */}
            <Link to='/forgotpassword' className="auth-w5-reset">Forgot password?</Link>
          </div>

          {/* Show spinner if loading, otherwise show Sign In button */}
          <button className="auth-w5-btn" type="submit" disabled={loading}>
            {loading ? "Loading..." : "Sign in"}
          </button>
        </Form>
           {/*GOOGLE LATER */}
        {/* <div className="auth-w3">
          <div className="auth-w3-line">Or login with</div>
          <div className="google-div">
            <button className=" signin-google">
              <img className="auth-w3-icon" src={iconGL} alt="Google Login" />
              Continue with Google
            </button>
          </div>
        </div> */}
        <div className="auth-w5- no-acct">
          Don't have an account?&nbsp;
          <Link className="auth-w5-" to="/signup">Sign up</Link>
        </div>
      </div>
      <div className="signin-col signin-image">
        <img src={features} alt="Sign in Features" />
      </div>
    </div>
  );
};

export default SignIn;
