import "./signin.css";
import { Link, Form } from "react-router-dom";

import iconMail from "../../assets/img/icon-mail.svg";
import iconHide from "../../assets/img/icon-eye-hide.svg";
import iconShow from "../../assets/img/icon-eye-show.svg";

const SignIn = () => {
    return (
        <div className="signin">
            <div className="signin-col">
                <Form className="signin-form">
                    <div className="signin-field">
                        <label className="signin-label" htmlFor="">
                            Email
                        </label>
                        <input className="signin-input" type="text" name="" id="" />
                        <img className="signin-icon" src="" alt="" />
                    </div>
                    <div className="signin-field">
                        <label className="signin-label" htmlFor="">
                            Password
                        </label>
                        <input className="signin-input" type="text" name="" id="" />
                        <img className="signin-icon" src="" alt="" />
                        <Link className="signin-reset" to="#">
                            Forgot password?
                        </Link>
                    </div>
                    <button className="signin-enter">Sign in</button>
                </Form>
                <div className="signin-hline">or</div>
                <div className="signin-other">
                    <Link className="signin-olink" to="#">
                        <img className="signin-oicon" src="" alt="" />
                        Sign in with Google
                    </Link>
                    <Link className="signin-olink" to="#">
                        <img className="signin-oicon" src="" alt="" />
                        Sign in with Google
                    </Link>
                </div>
            </div>
            <div className="signin-col">
                <img src="" alt="" />
            </div>
        </div>
    )
}

export default SignIn;