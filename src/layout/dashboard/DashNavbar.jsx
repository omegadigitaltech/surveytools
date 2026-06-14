import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import iconUser from "../../assets/img/icon-user.svg";
import iconLogOut from "../../assets/img/icon-logout.svg";
import useOutsideClick from "../../hooks/useOutsideClick";
import "./navbar.css";
import useDashboardStore from "../../store/useDashboardStore";
import DailySpinModal from "../../components/DailySpinModal/DailySpinModal";

const Sidebar = () => {
  const { userName, showLogoutConfirmation, isAuthenticated } = useAuthStore();
  const { menuOpen, setMenuOpen, setSpinOpen } = useDashboardStore();
  const sidebar = useRef(null);
  const navigate = useNavigate();
  const [showSpinModal, setShowSpinModal] = useState(false);
  if (!isAuthenticated) return null;

  // Setup clickOutside function for sidebar
  useOutsideClick(sidebar, () => setMenuOpen(false));

  return (
    <>
      {menuOpen && <div className="overlay fixed inset-0 block md:hidden"></div>}

      {/* <aside ref={sidebar} className={`sidebar-container  ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 duration-300 ease-in-out`}> */}
      <aside
        ref={sidebar}
        className={`
    sidebar-container
    fixed
    top-[3.5rem]
    left-0
    h-[calc(100vh-3.5rem)]
    w-64
    bg-white
    border-r
    overflow-y-auto
    z-600
    transform
    ${menuOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    transition-transform
    duration-300
    ease-in-out
  `}
      >
        {/* Logo */}
        <NavLink className="header-w1-logo" to="/">
          <img
            src="/Blue-logo-1.svg"
            alt="Blue Logo"
            className="md:w-30 h-10 md:h-auto"
          />
        </NavLink>

        {/* Navigation */}
        <nav className="sidebar-nav mt-12">
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
          {/* <NavLink to="/settings" className="sidebar-link">
            <span>
              <img src="/Settings-Minimalistic.svg" alt="Settings" />
            </span>
            <span>Settings</span>
          </NavLink> */}
          <NavLink to="/rewards" className="sidebar-link">
            <span>
              <img src="/rewards.svg" alt="Rewards" />
            </span>
            <span>Rewards</span>
          </NavLink>
          <a
            href="https://chat.whatsapp.com/DZDnDKI87qJAVrJZHqRjQN?mode=wwt"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-link"
          >
            <span>
              <img src="/Help.svg" alt="Help" />
            </span>
            <span>Help & Support</span>
          </a>

          <button className="dailyspin-btn" onClick={() =>  setShowSpinModal(true)}>
            <img src="/spinmenu.svg" alt="spin" />
            <span>Daily Spin</span>
          </button>
          {/* <NavLink to="/responses" className="sidebar-link">
            <span>
              <img
                src="/Checklist-Minimalistic.svg"
                alt="Checklist-Minimalistic"
              />
            </span>
            <span>Responses</span>
          </NavLink> 

          <NavLink to="/help" className="sidebar-link">
            <span>
              <img src="/Help.svg" alt="Help" />
            </span>
            <span>Help & Support</span>
          </NavLink>
           <NavLink to="/create-form" className="sidebar-link">
            <button className="text-sm text-red-600 hover:underline">
            Create a Form
          </button>
          </NavLink>
          <NavLink to="/create-questionnaire" className="sidebar-link sidebar-createques">
           <button className="crt-quest text-white px-4 py-2 rounded-lg text-sm shadow hover:bg-blue-700">
            Create a Survey
          </button>
          </NavLink> */}
        </nav>
        {/* Bottom user section */}
        <div className="sidebar-footer">
          <button className="sidebar-user" onClick={() => navigate("#")}>
            <img src={iconUser} alt="User" />
            <span>{userName}</span>
          </button>

          <button className="sidebar-logout" onClick={showLogoutConfirmation}>
            <img src={iconLogOut} alt="Logout" />
            Logout
          </button>
        </div>
      </aside>
      {showSpinModal && <DailySpinModal onClose={() => setShowSpinModal(false)} />}
    </>
  );
};

export default Sidebar;
