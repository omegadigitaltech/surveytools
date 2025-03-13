import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import iconBell from "../../assets/img/icon-bell.svg";
import iconUser from "../../assets/img/icon-user.svg";
import iconLogOut from "../../assets/img/icon-logout.svg";
import useAuthStore from "../../store/useAuthStore";
import "./navbar.css";

const Navbar = () => {
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { userName, showLogoutConfirmation, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  return (
    <header className={`header${isAuthenticated ? " header-logged" : ""}`}>
      <div className="header-wrap wrap">
        <div className="header-w1">
          <button
            className={`header-w1-menu ${menuOpen ? "menu-open" : ""}`}
            onClick={toggleMenu}
          >
            <div className="header-w1-line" aria-hidden></div>
            <div className="header-w1-line" aria-hidden></div>
            <div className="header-w1-line" aria-hidden></div>
          </button>

          <NavLink className="header-w1-logo" to="/">
            SURVEYPRO
            <div className="header-w1-circ" aria-hidden></div>
          </NavLink>
        </div>
        <div className="header-w2">
          <ul className="header-w2-list">
            <li className="header-w2-item hide">
              <NavLink className="header-w2-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="header-w2-item hide">
              <NavLink className="header-w2-link" to="/">
                About Us
              </NavLink>
            </li>
            {isAuthenticated && (
              <>
                <li className="header-w2-item show header-w2-hide">
                  <NavLink className="header-w2-link" to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>
                <li className="header-w2-item show header-w2-hide">
                  <NavLink className="header-w2-link" to="/postsurvey">
                    Post Survey
                  </NavLink>
                </li>
              </>
            )}
            {!isAuthenticated && (
              <>
                <li className="header-w2-item hide">
                  <NavLink className="header-w2-link" to="/signin">
                    Log In
                  </NavLink>
                </li>
                <li className="header-w2-item hide header-w2-main">
                  <NavLink className="header-w2-link" to="/signup">
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
        {isAuthenticated && (
          <div className="header-w3 show">
            <button className="header-w3-bell" onClick={() => navigate('/notifications')}>
              <img className="header-w3-icon" src={iconBell} alt="bell" />
            </button>
            <button className="header-w3-chip" onClick={() => navigate('/profile')}>
              <div className="header-w3-user">
                <img className="header-w3-icon" src={iconUser} alt="user" />
              </div>
              <span className="username">{userName}</span>
            </button>
            <button className="header-w3-link" onClick={showLogoutConfirmation}>
              <img className="header-w3-icon" src={iconLogOut} alt="logout" />
            </button>
          </div>
        )}
      </div>
      {/* Menu */}
      {menuOpen && (
        <div className="menu">
          <ul className="menu-list">
          <li>
              <NavLink to="/profile" className="menu-item menu-username flex" onClick={closeMenu}>
              <img className="header-w3-icon" src={iconUser} alt="user" />
              {userName}
              </NavLink>
            </li>
            <li>
              <NavLink to="/dashboard" className="menu-item" onClick={closeMenu}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/postsurvey" className="menu-item" onClick={closeMenu}>
                Post a Survey
              </NavLink>
            </li>
            {/* LATER, API NOT READY */}
            {/* <li>
              <NavLink to="/withdraw" className="menu-item" onClick={closeMenu}>
                Withdrawal
              </NavLink>
            </li> */}
            {/* <li>
              <NavLink to="/settings" className="menu-item" onClick={closeMenu}>
                Settings
              </NavLink>
            </li> */}
            <li>
              <NavLink to="" className="menu-item" onClick={() => { closeMenu }}>
                Contact Us
              </NavLink>
            </li>
            <li>
              <button className="menu-item" onClick={showLogoutConfirmation}>
                Log Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar;
