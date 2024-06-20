import { Form, Link } from "react-router-dom";
import "./signin.css";

const SignIn = () => {
    return (
        <div className="auth-w3">
            <h2 className="auth-w3-lead">
                Sign in
            </h2>
            <p className="auth-w3-link">
                Don't have an account?&nbsp;
                <Link className="" to="/signup">
                    Sign up
                </Link>
            </p>
            <Form className="auth-w3-form">
                <div className="auth-w3-field">
                    <label className="auth-w3-label" htmlFor="usermail">
                        Username
                    </label>
                    <input className="auth-w3-input" type="text" name="" id="usermail" />
                </div>
                <div className="auth-w3-field">
                    <label className="auth-w3-label" htmlFor="password">
                        Password
                    </label>
                    <input className="auth-w3-input" type="text" name="" id="password" />
                </div>
                <div className="auth-w3-third">
                    <label className="auth-w3-block" htmlFor="">
                        <input className="auth-w3-check" type="checkbox" name="checkbox" />
                        Remember me
                    </label>
                    <Link className="auth-w3-reset">
                        Forgot password?
                    </Link>
                </div>
                <button className="auth-w3-btn">
                    {/* Sign in */}
                    Let's sign you in
                </button>
            </Form>
        </div>
    )
}

export default SignIn;