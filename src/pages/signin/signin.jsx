import "../utils.css";
import "./signin.css";

import { Link, Form } from "react-router-dom";

import iconFB from "../../assets/img/img-fb.png";
import iconGL from "../../assets/img/img-gl.png";
import iconMail from "../../assets/img/icon-mail.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";
import features from "../../assets/img/illustration-signin.svg";

const SignIn = () => {
    const iconPass = true ? iconShow : iconHide;
    return (
        <div className="signin">
            <div className="signin-col signin-place">
                <h2 className="signin-lead">Sign In!</h2>
                <div className="signin-link">Don't have an account?&nbsp;
                    <Link to="/signup">Sign up</Link>
                </div>
                <Form className="signin-form">
                    <div className="signin-field">
                        <label className="signin-label" htmlFor="">
                            Email
                        </label>
                        <div className="signin-fwrap">
                            <input className="signin-input" type="text" name="" id="" />
                            <img className="signin-icon" src={iconMail} alt="" />
                        </div>
                    </div>
                    <div className="signin-field">
                        <label className="signin-label" htmlFor="">
                            Password
                        </label>
                        <div className="signin-fwrap">
                            <input className="signin-input" type="text" name="" id="" />
                            <img className="signin-icon" src={iconPass} alt="" />
                        </div>
                        <Link className="signin-reset" to="#">
                            Forgot password?
                        </Link>
                    </div>
                    <button className="signin-enter">Sign in</button>
                </Form>
                <div className="signin-hline">or</div>
                <div className="signin-other">
                    <Link className="signin-olink flex" to="#">
                        <img className="signin-oicon" src={iconGL} alt="" />
                        Sign in with Google
                    </Link>
                    <Link className="signin-olink flex" to="#">
                        <img className="signin-oicon" src={iconFB} alt="" />
                        Sign in with Google
                    </Link>
                </div>
            </div>
            <div className="signin-col signin-image">
                <img src={features} alt="" />
            </div>
        </div>
    )
}

export default SignIn;