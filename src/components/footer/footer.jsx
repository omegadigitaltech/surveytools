import { Link } from "react-router-dom";
import iconFb from "../../assets/img/icon-fb.svg";
import iconLk from "../../assets/img/icon-lk.svg";
import iconX from "../../assets/img/icon-x.svg";
import iconIg from "../../assets/img/icon-ig.svg";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-wrap wrap">
        <div className="footer-w1">
          <Link className="footer-w1-logo">
            SurveyTools{" "}
            <span className="watermark subscript text-[.5rem] font-semibold text-white/70">
              BETA
            </span>
          </Link>
          <ul className="footer-w1-list">
            {/* <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                About Us
                            </Link>
                        </li> */}
            {/* <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                Privacy Policy
                            </Link>
                        </li> */}
            <li className="footer-w1-item">
              <a
                href="mailto:help.surveytools@gmail.com"
                className="footer-w1-link"
              >
                Help & Support
              </a>
            </li>
            <li className="footer-w1-item">
              <a
                href="mailto:help.surveytools@gmail.com"
                className="footer-w1-link"
              >
                Feedback
              </a>
            </li>
            {/* <li className="footer-w1-item">
                            <Link className="footer-w1-link">
                                Terms of Service
                            </Link>
                        </li> */}
          </ul>
        </div>
        <div className="footer-w2 flex">
          <div className="footer-w2-copy">SurveyTools &copy; 2025</div>
          <div className="footer-w2-list">
            <a
              href=" https://www.linkedin.com/company/surveyproapp/"
              className="footer-w2-link"
            >
              <img className="footer-w2-icon" src={iconLk} alt="" />
            </a>
            <a
              href=" https://x.com/SurveyTools_App?s=09"
              className="footer-w2-link"
            >
              <img className="footer-w2-icon tw-x" src={iconX} alt="" />
            </a>
            <a href="" className="footer-w2-link">
              <img className="footer-w2-icon" src={iconFb} alt="" />
            </a>
            <a
              href="https://www.instagram.com/surveytools_?igsh=c2trNGRtMTZ6MjU1"
              className="footer-w2-link"
            >
              <img className="footer-w2-icon icon-ig" src={iconIg} alt="" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
