import { Link } from "react-router-dom";
import iconFb from "../../assets/img/icon-fb.svg";
import iconLk from "../../assets/img/icon-lk.svg";
import "./footer.css";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-wrap wrap">
                <div className="footer-w1">
                    <Link className="footer-w1-logo">
                        Survey Pro
                    </Link>
                    <ul className="footer-w1-list">
                        <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                About Us
                            </Link>
                        </li>
                        <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                Privacy Policy
                            </Link>
                        </li>
                        <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                Help & Support
                            </Link>
                        </li>
                        <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                Feedback
                            </Link>
                        </li>
                        <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                Terms of Service
                            </Link>
                        </li>
                    </ul>
                </div>
                <div className="footer-w2 flex">
                    <div className="footer-w2-copy">
                        SurveyPro &copy; 2024
                    </div>
                    <div className="footer-w2-list">
                        <Link className="footer-w2-link">
                            <img className="footer-w2-icon" src={iconFb} alt="" />
                        </Link>
                        <Link className="footer-w2-link">
                            <img className="footer-w2-icon" src={iconLk} alt="" />
                        </Link>
                        <Link className="footer-w2-link">
                            <img className="footer-w2-icon" src={iconFb} alt="" />
                        </Link>
                        <Link className="footer-w2-link">
                            <img className="footer-w2-icon" src={iconLk} alt="" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer;