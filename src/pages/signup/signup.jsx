import React, { useState, useEffect } from "react";
import { Form, Link, useActionData } from "react-router-dom";
import { useSelector } from "react-redux";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

import "./signup.css";
import "../utils.css";

import features from "../../assets/img/illustration-signup.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";

const SignUp = () => {
  const actionData = useActionData();
  const [showPassword, setShowPassword] = useState(false);
  const handleToggle = () => {
    setShowPassword((prevState) => !prevState);
  };
  const iconPass = showPassword ? iconShow : iconHide;
  
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    setLoading(true);
  }
  useEffect(() => {
    if (actionData) {
      setLoading(false);
    }
  }, [actionData]);

  return (
    <div className="auth-w4 flex">
      <div className="signup-col signup-image">
        <img src={features} alt="" />
      </div>
      <div className="form-col">
        <Form className="auth-w4-form" method="post" action="/signup" onSubmit={handleSubmit}>
          <div className="auth-w4-grid">
            <div className="auth-w4-field">
              <label className="auth-w4-label" htmlFor="firstname">
                First name
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="firstname"
                id="firstname"
                required
              />
            </div>
            <div className="auth-w4-field">
              <label className="auth-w4-label" htmlFor="lastname">
                Last name
              </label>
              <input
                className="auth-w4-input"
                type="text"
                name="lastname"
                id="lastname"
                required
              />
            </div>
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="email">
                Email
              </label>
              <input
                className="auth-w4-input"
                type="email"
                name="email"
                id="email"
                required
              />
            </div>
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="password">
                Password
              </label>
              <div className="auth-w4-wrap">
                <input
                  className="auth-w4-input pw-toggle"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                />
                <img
                  className="signin-icon"
                  src={iconPass}
                  onClick={handleToggle}
                  alt=""
                />
              </div>
            </div>
            <div className="auth-w4-field auth-w4-full">
              <label className="auth-w4-label" htmlFor="confirm">
                Confirm Password
              </label>
              <div className="auth-w4-wrap">
                <input
                  className="auth-w4-input pw-toggle"
                  type={showPassword ? "text" : "password"}
                  name="confirm"
                  id="confirm"
                />
                <img
                  className="signin-icon"
                  src={iconPass}
                  onClick={handleToggle}
                  alt=""
                />
              </div>
            </div>
          </div>
          <label className="auth-w4-block" htmlFor="">
            <input className="check" type="checkbox" />
            Agree to{" "}
            <Link className="" to="">
              terms & condition
            </Link>
          </label>
          <button className="auth-w4-btn" disabled={loading}>
            {/* {isLoading ? <AiOutlineLoading3Quarters size={24} /> : "Sign up"} */}
            {loading ? "Loading..." : "Sign up"}
          </button>
        </Form>
        <div className="auth-w4-">
          Already have an account?&nbsp;
          <Link className="auth-w4-" to="/signin">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
