import { Link, Outlet } from "react-router-dom";
import "./auth.css";

const Auth = () => {
  return (
    <section className="auth">
      <div className="auth-wrap wrap">
        <h1 className="auth-w1-lead">
          <span className="survey">Survey</span>
          <span className="tools">Tools</span>{" "}
          <span className="watermark subscript text-[.6rem] font-medium text-black/90">
            BETA
          </span>
        </h1>
        <Outlet />
      </div>
    </section>
  );
};

export default Auth;
