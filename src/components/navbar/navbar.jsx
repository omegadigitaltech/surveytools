import { NavLink, useNavigate } from "react-router-dom";

import iconBell from "../../assets/img/icon-bell.svg";
import iconUser from "../../assets/img/icon-user.svg";
import iconLogOut from "../../assets/img/icon-logout.svg";

import "./navbar.css";

const Navbar = () => {
    const login = true;

const navigate = useNavigate();

    return ( 
        <header className={`header${login ? " header-logged" : ""}`}>
            <div className="header-wrap wrap">
                <div className="header-w1">
                    <button className="header-w1-menu">
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
                        <li className="header-w2-item show">
                            <NavLink className="header-w2-link" to="">
                                Contact Us
                            </NavLink>
                        </li>
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
                        <li className="header-w2-item show header-w2-null">
                            <NavLink className="header-w2-link" to="/">
                                Log Out
                            </NavLink>
                        </li>
                    </ul>
                </div>
                <div className="header-w3 show">
                    <button className="header-w3-bell">
                        <img className="header-w3-icon" src={iconBell} alt="bell" />
                    </button>
                    <button className="header-w3-chip" onClick={() => navigate('/profile')} >
                        <div className="header-w3-user">
                            <img className="header-w3-icon" src={iconUser} alt="user" />
                        </div>
                        Omega Tech
                    </button>
                    <NavLink className="header-w3-link" to="/">
                        <img className="header-w3-icon" src={iconLogOut} alt="logout" />
                    </NavLink>
                </div>
                <div className="header-w4 hide">
                    <NavLink className="header-w4-link header-w4-side" to="/signup">
                        Sign up
                    </NavLink>
                </div>
            </div>
        </header>
    )
}

export default Navbar;