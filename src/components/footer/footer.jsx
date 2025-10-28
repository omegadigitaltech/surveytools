import { Link } from "react-router-dom";
import iconFb from "../../assets/img/icon-fb.svg";
import iconLk from "../../assets/img/icon-lk.svg";
import iconX from "../../assets/img/icon-x.svg";
import iconIg from "../../assets/img/icon-ig.svg";
import "./footer.css";

const Footer = () => {
  return (
    <footer className="footer text-white">
      <div className=" px-4 md:p-[5%]">
        <div className="flex flex-col items-start md:flex-row">
          <div className="">
            <div className="footer-w1 flex flex-col items-start">
              <Link className="my-4 md:mb-8">
                <img
                  src="/White-logo.png"
                  className="w-[8rem] md:w-[10rem]"
                  alt="White logo"
                />
              </Link>
              <p className="text-white mb-4 md:w-[50%]">
                Making it simple to design surveys, reach the right audience,
                and collect results you can trust
              </p>
              <div className="socials flex items-end ">
                <h3 className="mr-4">Follow Us</h3>
                <div className="flex items-center gap-2 md:gap-4">
                  <a
                    href=" https://www.linkedin.com/company/surveyproapp/"
                    className=""
                  >
                    <img className="footer-w2-icon" src={iconLk} alt="" />
                  </a>
                  <a
                    href=" https://x.com/SurveyTools_App?s=09"
                    className=""
                  >
                    <img className="footer-w2-icon tw-x" src={iconX} alt="" />
                  </a>
                  <a href="" className="">
                    <img className="footer-w2-icon" src={iconFb} alt="" />
                  </a>
                  <a
                    href="https://www.instagram.com/surveytools_?igsh=c2trNGRtMTZ6MjU1"
                    className=""
                  >
                    <img
                      className="footer-w2-icon icon-ig"
                      src={iconIg}
                      alt=""
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">PRODUCTS</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">SUPPORT</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    Community
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    System Status
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-white/90 hover:text-white transition-colors"
                  >
                    Professional
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-w2 flex">
          <div className="footer-w2-copy"><span className="text-xl mr-2">&copy;</span> 2025 SurveyTools. All Rights Reserved</div>
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
