import { Form, Link } from "react-router-dom";
import "./signin.css";

const SignIn = () => {
    return (
        <div className="auth-w2">
            <h2 className="auth-w2-lead">
                Sign in
            </h2>
            <p className="auth-w2-link">
                Don't have an account?&nbsp;
                <Link className="" to="/signup">
                    Sign up
                </Link>
            </p>
            <Form className="auth-w2-form">
                <div className="auth-w2-field">
                    <label className="auth-w2-label" htmlFor="usermail">
                        Username
                    </label>
                    <input className="auth-w2-input" type="text" name="" id="usermail" />
                </div>
                <div className="auth-w2-field">
                    <label className="auth-w2-label" htmlFor="password">
                        Password
                    </label>
                    <input className="auth-w2-input" type="text" name="" id="password" />
                </div>
                <div className="auth-w2-third">
                    <label className="auth-w2-block" htmlFor="">
                        <input className="auth-w2-check" type="checkbox" name="checkbox" />
                        Remember me
                    </label>
                    <Link className="auth-w2-reset">
                        Forgot password?
                    </Link>
                </div>
                <button className="auth-w2-btn">
                    {/* Sign in */}
                    Let's sign you in
                </button>
            </Form>
        </div>
    )
}

export default SignIn;