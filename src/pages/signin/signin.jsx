import { Form, Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";

import "./signin.css";
import "../utils.css";
import iconFB from "../../assets/img/img-fb.png";
import iconGL from "../../assets/img/img-gl.png";
import iconMail from "../../assets/img/icon-mail.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";
import features from "../../assets/img/illustration-signin.svg";

const SignIn = () => {
  // Temporary till authentication
  const navigate = useNavigate();
  // Password toggle
  const [showPassword, setShowPassword] = useState(false);
  const handleToggle = () => {
    setShowPassword((prevState) => !prevState);
  };
  const iconPass = showPassword ? iconShow : iconHide;

  return (
    <div className="auth-w5 flex">
      <div className="form-col">
        <Form className="auth-w5-form" method="post" action="/signin">
          <div className="auth-w5-field">
            <label className="auth-w5-label" htmlFor="email">
              Email
            </label>
            <input
              className="auth-w5-input"
              type="text"
              name="email"
              id="email"
            />
          </div>
          <div className="auth-w5-field">
            <label className="auth-w5-label" htmlFor="password">
              Password
            </label>
            <div className="auth-w5-wrap">
              <input
                className="auth-w5-input"
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
              />
              <img
                className="signin-icon pw-toggle"
                src={iconPass}
                alt=""
                onClick={handleToggle}
              />
            </div>
          </div>
          <div className="auth-w5-third">
            <label className="auth-w5-block" htmlFor="">
              <input
                className="auth-w5-check"
                type="checkbox"
                name="checkbox"
              />
              Remember me
            </label>
            <Link className="auth-w5-reset">Forgot password?</Link>
          </div>
          {/* REMOVE ONCLICK NAVIGATION */}
          <button
            className="auth-w5-btn"
            // onClick={() => navigate("/dashboard")}
          >
            Sign in
          </button>
        </Form>
        <div className="auth-w3">
          <div className="auth-w3-line">Or login with</div>
          <div className="auth-w3-list">
            <Link className="auth-w3-link" to="">
              <img className="auth-w3-icon" src={iconFB} alt="" />
            </Link>
            <Link className="auth-w3-link" to="">
              <img className="auth-w3-icon" src={iconGL} alt="" />
            </Link>
          </div>
        </div>
        <div className="auth-w5-">
          Don't have an account?&nbsp;
          <Link className="auth-w5-" to="/signup">
            Sign up
          </Link>
        </div>
      </div>
      <div className="signin-col signin-image">
        <img src={features} alt="" />
      </div>
    </div>
  );
};

export default SignIn;
