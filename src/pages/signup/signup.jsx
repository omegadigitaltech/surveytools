import { Form, Link } from "react-router-dom";
import "./signup.css";

const SignUp = () => {
    return (
        <div className="auth-w2">
            <h2 className="auth-w2-lead">
                Sign Up
            </h2>
            <p className="auth-w2-link">
                Already have an account?&nbsp;
                <Link className="" to="/signin">
                    Sign in
                </Link>                
            </p>
            <Form className="auth-w2-form">
                <div className="auth-w2-grid">
                    <div className="auth-w2-field">
                        <label className="auth-w2-label" htmlFor="">
                            First name
                        </label>
                        <input className="auth-w2-input" type="text" name="" id="" />
                    </div>
                    <div className="auth-w2-field">
                        <label className="auth-w2-label" htmlFor="">
                            Last name
                        </label>
                        <input className="auth-w2-input" type="text" name="" id="" />
                    </div>
                    <div className="auth-w2-field auth-w2-full">
                        <label className="auth-w2-label" htmlFor="">
                            Email
                        </label>
                        <input className="auth-w2-input" type="text" name="" id="" />
                    </div>
                    <div className="auth-w2-field auth-w2-full">
                        <label className="auth-w2-label" htmlFor="">
                            Password
                        </label>
                        <input className="auth-w2-input" type="text" name="" id="" />
                    </div>
                </div>
                <label className="auth-w2-block" htmlFor="">
                    <input className="auth-w2-check" type="text" />
                    agree to <Link className="auth-w2-uline" to="">terms & condition</Link>
                </label>
                <button className="auth-w2-btn">
                    {/* Sign up */}
                    Let's sign you up
                </button>
            </Form>
        </div>
    )
}

export default SignUp;