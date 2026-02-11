import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import iconUser from "../../assets/img/icon-user.svg";
import iconLogOut from "../../assets/img/icon-logout.svg";
import "./navbar.css";

const Sidebar = () => {
  const { userName, showLogoutConfirmation, isAuthenticated } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  return (
    <>
    
     <aside className="sidebar-container fixed md:static">
      {/* Logo */}
      <NavLink className="header-w1-logo" to="/">
        <img
          src="/Blue-logo-1.svg"
          alt="Blue Logo"
          className="md:w-40 h-10 md:h-auto"
        />
      </NavLink>

      {/* Navigation */}
      <nav className="sidebar-nav mt-12">
        <NavLink to="/dashboard" className="sidebar-link">
          <span><img src="/Widget-2.svg" alt="Widget 2" /></span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/my-forms" className="sidebar-link">
          <span><img src="/Folder-With-Files.svg" alt="Folder-With-FIles" /></span>
          <span>My Forms</span>
        </NavLink>

        <NavLink to="/analytics" className="sidebar-link">
          <span><img src="/Chat-Square-2.svg" alt="Chat-Square" /></span>
          <span>Analytics</span>
        </NavLink>

        <NavLink to="/responses" className="sidebar-link">
          <span><img src="/Checklist-Minimalistic.svg" alt="Checklist-Minimalistic" /></span>
          <span>Responses</span>
        </NavLink>

        <NavLink to="/help" className="sidebar-link">
          <span><img src="/Help.svg" alt="Help" /></span>
          <span>Help & Support</span>
        </NavLink>

        <NavLink to="/settings" className="sidebar-link">
          <span><img src="/Settings-Minimalistic.svg" alt="Settings" /></span>
          <span>Settings</span>
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
    </>
   
  );
};

export default Sidebar;
