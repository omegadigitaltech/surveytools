import { Link, Outlet, useLocation } from "react-router-dom";
import "./auth.css";

import iconFB from "../../assets/img/icon-facebook-48.svg";
import iconGL from "../../assets/img/icon-google.svg";
import { useEffect, useState } from "react";

const Auth = () => {
    let subTitle;
    let location = useLocation();

    if (location.pathname = "/signup") {
        subTitle = "Sign up";
    } else {
        subTitle = "Sign in";
    }

    console.log(location)
    return (
        <section className="auth">
            <div className="auth-wrap wrap">
                <h1 className="auth-w1-lead">
                    Survey Pro
                    <span className="auth-w1-circ" aria-hidden></span>
                </h1>
                <div className="auth-w2-lead">
                    {subTitle}
                </div>
                <div className="auth-w3">
                    <div className="auth-w3-list">
                        <Link className="auth-w3-link" to="">
                            <img className="auth-w3-icon" src={iconFB} alt="" />
                        </Link>
                        <Link className="auth-w3-link" to="">
                            <img className="auth-w3-icon" src={iconGL} alt="" />
                        </Link>
                    </div>
                    <div className="auth-w3-line">
                        Or continue with
                    </div>
                </div>
                <Outlet />
            </div>
        </section>
    )
}

export default Auth;