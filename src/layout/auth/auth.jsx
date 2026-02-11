import { Link, Outlet } from "react-router-dom";
import { NavLink, useNavigate } from "react-router-dom";
import "./auth.css";

const Auth = () => {
  return (
    <section className="auth">
      <div className="auth-wrap wrap">
        <nav className="">
        <NavLink className="header-w1-logo " to="/">
          <img
            src="/Blue-logo-1.svg"
            alt="Blue Logo"
            className="md:w-[10rem] h-[2.5rem] md:h-auto"
          />
        </NavLink>

        </nav>
        <Outlet />
      </div>
    </section>
  );
};

export default Auth;
