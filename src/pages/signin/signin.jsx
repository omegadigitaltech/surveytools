import { Form, Link, useNavigate, useActionData } from "react-router-dom";
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
  // Get message from action function
  const actionData = useActionData();
  const navigate = useNavigate();

  // Password toggle
  const [showPassword, setShowPassword] = useState(false);
  const handleToggle = () => setShowPassword(!showPassword);
  const iconPass = showPassword ? iconShow : iconHide;

  return (
    <div className="auth-w5 flex">
      <div className="form-col">

  {/* Message display for success or error */}
  {actionData && (
            <div
              className={`auth-message ${
                actionData.status === "success" ? "auth-success" : "auth-error"
              }`}
            >
              {actionData.message}
            </div>
          )}

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
              required
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
              required

              />
              <img
                className="signin-icon pw-toggle"
                src={iconPass}
                alt="Toggle Password Visibility"
                onClick={handleToggle}
              />
            </div>
          </div>
          <div className="auth-w5-third">
            <label className="auth-w5-block" htmlFor="remember">
              <input className="auth-w5-check" type="checkbox" name="checkbox" />
              Remember me
            </label>
            <Link className="auth-w5-reset">Forgot password?</Link>
          </div>

        

          <button className="auth-w5-btn">Sign in</button>
        </Form>

        <div className="auth-w3">
          <div className="auth-w3-line">Or login with</div>
          <div className="auth-w3-list">
            <Link className="auth-w3-link" to="">
              <img className="auth-w3-icon" src={iconFB} alt="Facebook Login" />
            </Link>
            <Link className="auth-w3-link" to="">
              <img className="auth-w3-icon" src={iconGL} alt="Google Login" />
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
        <img src={features} alt="Sign in Features" />
      </div>
    </div>
  );
};

export default SignIn;
