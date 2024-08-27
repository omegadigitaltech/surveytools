import { Form, Link, useActionData } from "react-router-dom";
import React, { useState } from 'react';

import "./signup.css";

import "../utils.css";
import features from "../../assets/img/illustration-signup.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";

const SignUp = () => {
    const data = useActionData();
 // Password toggle
 const [showPassword, setShowPassword] = useState(false);
 const handleToggle = () => {
     setShowPassword(prevState => !prevState);
 };
 const iconPass = showPassword ? iconShow : iconHide;

    return (
        <div className="auth-w4 flex">
             <div className="signup-col signup-image">
                <img src={features} alt="" />
            </div>
           <div className="form-col">

            <Form className="auth-w4-form" method="post" action="/signup">
                <div className="auth-w4-grid">
                    <div className="auth-w4-field">
                        <label className="auth-w4-label" htmlFor="">
                            First name
                        </label>
                        <input className="auth-w4-input" type="text" name="firstname" id="" required />
                    </div>
                    <div className="auth-w4-field">
                        <label className="auth-w4-label" htmlFor="">
                            Last name
                        </label>
                        <input className="auth-w4-input" type="text" name="lastname" id="" required />
                    </div>
                    <div className="auth-w4-field auth-w4-full">
                        <label className="auth-w4-label" htmlFor="">
                            Email
                        </label>
                        <input className="auth-w4-input" type="email" name="email" id="" required/>
                    </div>
                    <div className="auth-w4-field auth-w4-full">
                        <label className="auth-w4-label" htmlFor="">
                            Password
                        </label>
                    <div className="auth-w4-wrap">
                        <input className="auth-w4-input pw-toggle" type={showPassword ? "text" : "password"} name="password" id="" required />
                    <img className="signin-icon"src={iconPass}  onClick={handleToggle} alt="" />
                   </div>
                    </div>
                    <div className="auth-w4-field auth-w4-full">
                        <label className="auth-w4-label" htmlFor="">
                           Confirm Password
                        </label>
                    <div className="auth-w4-wrap">
                        <input className="auth-w4-input pw-toggle" type={showPassword ? "text" : "password"} name="password" id="" />
                    <img className="signin-icon" src={iconPass}  onClick={handleToggle} alt="" />
                  </div>
                   </div>
                </div>
                <label className="auth-w4-block" htmlFor="">
                    <input className="auth-w4-check" type="checkbox" />
                    Agree to <Link className="" to="">terms & condition</Link>
                </label>
                <button className="auth-w4-btn">
                    Sign up
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
    )
}

export default SignUp;