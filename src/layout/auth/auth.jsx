import { Outlet } from "react-router-dom";
import "./auth.css";

const Auth = () => {
    return (
        <section className="auth">
            <div className="wrap">
                <h1 className="auth-lead">
                    Survey
                    <span className="auth-span">
                        pro
                    </span>
                </h1>
                <Outlet />
            </div>
        </section>
    )
}

export default Auth;