import { Link } from "react-router-dom";
import iconFb from "../../assets/img/icon-fb.svg";
import iconLk from "../../assets/img/icon-lk.svg";
import iconX from "../../assets/img/icon-x.svg";
import iconIg from "../../assets/img/icon-ig.svg";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer text-white">
      <div className="md:p-[5%]">
      <div className="flex">
        <div className="">
          <div className="footer-w1 flex flex-col items-start">
            <Link className="footer-w1-logo">
              <img
                src="/White-logo.png"
                className="w-[10rem]"
                alt="White logo"
              />
            </Link>
            <p className="text-white w-[50%]">
              Making it simple to design surveys, reach the right audience, and
              collect results you can trust
            </p>
            <div className="socials">
              <h3>Follow Us</h3>
            </div>
          </div>
        </div>
        <div className="flex">
          <div>
            <h3 className="text-lg font-semibold mb-4">PRODUCTS</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Sign Up
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">SUPPORT</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  System Status
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Services
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/90 hover:text-white transition-colors"
                >
                  Professional
                </a>
              </li>
            </ul>
          </div>
        </div>
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
      {/* <ul className="footer-w1-list">
            <li className="footer-w1-item">
              <Link className="footer-w1-link">About Us</Link>
            </li>
            <li className="footer-w1-item">
              <Link className="footer-w1-link">Privacy Policy</Link>
            </li>
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
            <li className="footer-w1-item">
              <Link className="footer-w1-link">Terms of Service</Link>
            </li>
          </ul> */}
    </footer>
  );
};

export default Footer;
