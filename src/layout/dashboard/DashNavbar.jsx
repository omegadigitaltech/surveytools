import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import iconUser from "../../assets/img/icon-user.svg";
import iconLogOut from "../../assets/img/icon-logout.svg";
import "./navbar.css";

const Sidebar = () => {
  const { userName, showLogoutConfirmation, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <aside className="sidebar-container">
      {/* Logo */}
      <NavLink className="header-w1-logo" to="/">
        <img
          src="/Blue-logo-1.svg"
          alt="Blue Logo"
          className="md:w-[10rem] h-[2.5rem] md:h-auto"
        />
      </NavLink>

      {/* Navigation */}
      <nav className="sidebar-nav mt-12">
        <NavLink to="/dashboard" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/my-forms" className="sidebar-link">
          My Forms
        </NavLink>

        <NavLink to="/analytics" className="sidebar-link">
          Analytics
        </NavLink>

        <NavLink to="/responses" className="sidebar-link">
          Responses
        </NavLink>

        <NavLink to="/help" className="sidebar-link">
          Help & Support
        </NavLink>

        <NavLink to="/settings" className="sidebar-link">
          Settings
        </NavLink>
      </nav>

      {/* Bottom user section */}
      <div className="sidebar-footer">
        <button className="sidebar-user" onClick={() => navigate("/profile")}>
          <img src={iconUser} alt="User" />
          <span>{userName}</span>
        </button>

        <button className="sidebar-logout" onClick={showLogoutConfirmation}>
          <img src={iconLogOut} alt="Logout" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
