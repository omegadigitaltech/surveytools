import { Form, Link } from "react-router-dom";
import "./signup.css";

import "../utils.css";
import features from "../../assets/img/illustration-signup.svg";


const SignUp = () => {
    return (
        <div className="auth-w4">
            <Form className="auth-w4-form">
                <div className="auth-w4-grid">
                    <div className="auth-w4-field">
                        <label className="auth-w4-label" htmlFor="">
                            First name
                        </label>
                        <input className="auth-w4-input" type="text" name="" id="" />
                    </div>
                    <div className="auth-w4-field">
                        <label className="auth-w4-label" htmlFor="">
                            Last name
                        </label>
                        <input className="auth-w4-input" type="text" name="" id="" />
                    </div>
                    <div className="auth-w4-field auth-w4-full">
                        <label className="auth-w4-label" htmlFor="">
                            Email
                        </label>
                        <input className="auth-w4-input" type="text" name="" id="" />
                    </div>
                    <div className="auth-w4-field auth-w4-full">
                        <label className="auth-w4-label" htmlFor="">
                            Password
                        </label>
                        <input className="auth-w4-input" type="text" name="" id="" />
                    </div>
                </div>
                <label className="auth-w4-block" htmlFor="">
                    <input className="auth-w4-check" type="text" />
                    agree to <Link className="" to="">terms & condition</Link>
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
    )
}

export default SignUp;