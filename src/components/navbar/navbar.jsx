
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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
    // Add padding when navbar mounts
    document.body.classList.add("has-navbar");
    const handleScroll = () => closeMenu();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      // Remove padding when navbar unmounts
      document.body.classList.remove("has-navbar");
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
            <img src="/Blue-logo-1.svg" alt="Blue Logo" className="md:w-[6rem] h-[2.2rem] md:h-auto" />
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
                Pricing
              </NavLink>
            </li>
            <li className="header-w2-item hide">
              <NavLink className="header-w2-link" to="/">
                Services
              </NavLink>
            </li>
            <li className="header-w2-item hide">
              <NavLink className="header-w2-link" to="/">
                Blog
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="header-w2 header-auth">
          <ul className="header-w2-list">
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
                <li className="header-w2-item show header-w2-hide">
                  <NavLink className="header-w2-link" to="/create-form">
                    Create Form
                  </NavLink>
                </li>
              </>
            )}
            {!isAuthenticated && (
              <>
                <li className="header-w2-item hide">
                  <NavLink className="header-w2-link button text-white px-10 py-4 rounded-md" to="/signup">
                    Get Started
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
        {isAuthenticated && (
          <div className="header-w3 show">
            <button
              className="header-w3-bell"
              onClick={() => navigate("/notifications")}
            >
              <img className="header-w3-icon" src={iconBell} alt="bell" />
            </button>
            <button
              className="header-w3-chip"
              onClick={() => navigate("#")}
            >
              <div className="header-w3-user">
                <img className="header-w3-icon" src={iconUser} alt="user" />
              </div>
              {/* <span className="username">{userName}</span> */}
            </button>
            <button className="header-w3-link" onClick={showLogoutConfirmation}>
              <img className="header-w3-icon" src={iconLogOut} alt="logout" />
            </button>
          </div>
        )}
      </div>
      {/* Menu */}
      {menuOpen && (
        
           <nav className="mobile-sidednav sidebar-nav mt-12">
           <NavLink to="/dashboard" className="sidebar-link">
             <span>
               <img src="/dashboard.svg" alt="Widget 2" />
             </span>
             <span>Dashboard</span>
           </NavLink>
           <NavLink to="/postsurvey" className="sidebar-link ">
             <span>
               <img src="/survey.svg" alt="Chat-Square" />
             </span>
             <span className="text-black-600">Create a survey</span>
           </NavLink>
           <NavLink to="/analytics" className="sidebar-link">
             <span>
               <img src="/Chat-Square-2.svg" alt="Chat-Square" />
             </span>
             <span>Analytics</span>
           </NavLink>
           <NavLink to="/my-forms" className="sidebar-link">
             <span>
               <img src="/Folder-With-Files.svg" alt="Folder-With-FIles" />
             </span>
             <span>My Forms</span>
           </NavLink>
           <NavLink to="/create-form" className="sidebar-link">
             <span>
               <img src="/form.svg" alt="Chat-Square" />
             </span>
             <span>Create a form</span>
           </NavLink>
           {/* <NavLink to="#" className="sidebar-link">
             <span>
               <img src="/Settings-Minimalistic.svg" alt="Settings" />
             </span>
             <span>Settings</span>
           </NavLink> */}
           <div className="sidebar-footer">
          <button className="sidebar-logout pl-3" onClick={showLogoutConfirmation}>
            <img src={iconLogOut} alt="Logout" />
            Logout
          </button>
        </div>
         </nav>


        
        // <div className="menu">
        //   <ul className="menu-list">
        //     <li>
        //       <NavLink
        //         to="/profile"
        //         className="menu-item menu-username flex"
        //         onClick={closeMenu}
        //       >
        //         <img className="header-w3-icon" src={iconUser} alt="user" />
        //         {userName}
        //       </NavLink>
        //     </li>
        //     <li>
        //       <NavLink
        //         to="/dashboard"
        //         className="menu-item"
        //         onClick={closeMenu}
        //       >
        //         Dashboard
        //       </NavLink>
        //     </li>
        //     <li>
        //       <NavLink
        //         to="/postsurvey"
        //         className="menu-item"
        //         onClick={closeMenu}
        //       >
        //         Post a Survey
        //       </NavLink>
        //     </li>
        //     <li>
        //       <NavLink
        //         to="/create-form"
        //         className="menu-item"
        //         onClick={closeMenu}
        //       >
        //         Create Form
        //       </NavLink>
        //     </li>
        //     {/* LATER, API NOT READY */}
        //     {/* <li>
        //       <NavLink to="/withdraw" className="menu-item" onClick={closeMenu}>
        //         Withdrawal
        //       </NavLink>
        //     </li> */}
        //     {/* <li>
        //       <NavLink to="/settings" className="menu-item" onClick={closeMenu}>
        //         Settings
        //       </NavLink>
        //     </li> */}
        //     {/* <li>
        //       <NavLink
        //         to=""
        //         className="menu-item"
        //         onClick={() => {
        //           closeMenu;
        //         }}
        //       >
        //         Contact Us
        //       </NavLink>
        //     </li> */}
        //     <li>
        //       <button className="menu-item" onClick={showLogoutConfirmation}>
        //         Log Out
        //       </button>
        //     </li>
        //   </ul>
        // </div>
      )}
    </header>
  );
};

export default Navbar;
