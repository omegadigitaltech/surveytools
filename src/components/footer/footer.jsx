import { Link } from "react-router-dom";
import iconFb from "../../assets/img/icon-fb.svg";
import iconLk from "../../assets/img/icon-lk.svg";
import iconX from "../../assets/img/icon-x.svg";
import iconIg from "../../assets/img/icon-ig.svg";
import "./footer.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand column */}
        <div className="footer-brand">
          <Link to="/">
            <img
              src="/wht-logo.svg"
              className="footer-logo"
              alt="SurveyTools logo"
            />
          </Link>
          <p className="footer-tagline">
            Making it simple to design surveys, reach the right audience, and
            collect results you can trust.
          </p>
          <div className="footer-socials">
            <span className="footer-socials-label">Follow Us</span>
            <div className="footer-socials-icons">
              <a
                href="https://www.linkedin.com/company/surveyproapp/"
                target="_blank"
                rel="noreferrer"
              >
                <img src={iconLk} alt="LinkedIn" />
              </a>
              <a
                href="https://x.com/SurveyTools_App?s=09"
                target="_blank"
                rel="noreferrer"
              >
                <img src={iconX} alt="X (Twitter)" className="tw-x" />
              </a>
              <a href="#">
                <img src={iconFb} alt="Facebook" />
              </a>
              <a
                href="https://www.instagram.com/surveytools_?igsh=c2trNGRtMTZ6MjU1"
                target="_blank"
                rel="noreferrer"
              >
                <img src={iconIg} alt="Instagram" className="icon-ig" />
              </a>
            </div>
          </div>
        </div>

        {/* Nav columns */}
        <div className="footer-nav">
          <div className="footer-nav-col">
            <h3 className="footer-nav-heading">Products</h3>
            <ul className="footer-nav-list">
              <li>
                <Link to="/postsurvey">Create Surveys</Link>
              </li>
              <li>
                <Link to="create-form">Create Form</Link>
              </li>
              <li>
                <Link to="/dashboard">Fill Surveys</Link>
              </li>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
            </ul>
          </div>

          <div className="footer-nav-col">
            <h3 className="footer-nav-heading">Support</h3>
            <ul className="footer-nav-list">
              <li>
                <Link
                  to="https://chat.whatsapp.com/DZDnDKI87qJAVrJZHqRjQN?mode=wwt"
                  target="blank"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="https://chat.whatsapp.com/DZDnDKI87qJAVrJZHqRjQN?mode=wwt"
                  target="blank"
                >
                  Community
                </Link>
              </li>
              <li>
                <Link to="#">Services</Link>
              </li>
              <li>
                <a href="mailto:help.surveytools@gmail.com">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* <div className="footer-nav-col">
            <h3 className="footer-nav-heading">Legal</h3>
            <ul className="footer-nav-list">
              <li><Link to="#">Privacy Policy</Link></li>
              <li><Link to="#">Terms of Service</Link></li>
            </ul>
          </div> */}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <span>&copy; {currentYear} SurveyTools. All Rights Reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
