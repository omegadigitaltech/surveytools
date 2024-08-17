import { Form, Link, useNavigate } from "react-router-dom";
import "./signin.css";

const SignIn = () => {
    const navigate = useNavigate();
    return (
        <div className="auth-w5">
            <Form className="auth-w5-form">
                <div className="auth-w5-field">
                    <label className="auth-w5-label" htmlFor="usermail">
                        Username
                    </label>
                    <input className="auth-w5-input" type="text" name="" id="usermail" />
                </div>
                <div className="auth-w5-field">
                    <label className="auth-w5-label" htmlFor="password">
                        Password
                    </label>
                    <input className="auth-w5-input" type="text" name="" id="password" />
                </div>
                <div className="auth-w5-third">
                    <label className="auth-w5-block" htmlFor="">
                        <input className="auth-w5-check" type="checkbox" name="checkbox" />
                        Remember me
                    </label>
                    <Link className="auth-w5-reset">
                        Forgot password?
                    </Link>
                </div>
                <button className="auth-w5-btn" onClick={() => navigate('/dashboard')}>
                    Sign in
                </button>
            </Form>
            <div className="auth-w5-">
                Don't have an account?&nbsp;
                <Link className="auth-w5-" to="/signup">
                    Sign up
                </Link>
            </div>
        </div>
    )
}

export default SignIn;