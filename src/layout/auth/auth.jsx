import { Link, Outlet } from "react-router-dom";
import "./auth.css";

import iconFB from "../../assets/img/icon-facebook-48.svg";
import iconGL from "../../assets/img/icon-google.svg";

const Auth = () => {
    return (
        <section className="auth">
            <div className="auth-wrap wrap">
                <h1 className="auth-w1-lead">
                    Survey Pro
                    <span className="auth-w1-circ" aria-hidden></span>
                </h1>
                <Outlet />
                <div className="auth-w4">
                    <div className="auth-w4-line">
                        {/* OR CONTINUE WITH */}
                        Or continue with
                    </div>
                    <div className="auth-w4-list">
                        <Link className="auth-w4-link" to="">
                            <img className="auth-w4-icon" src={iconFB} alt="" />
                        </Link>
                        <Link className="auth-w4-link" to="">
                            <img className="auth-w4-icon" src={iconGL} alt="" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Auth;