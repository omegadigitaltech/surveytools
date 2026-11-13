import { Link } from "react-router-dom";
import "./compactfooter.css";

const HELP_URL = "https://chat.whatsapp.com/DZDnDKI87qJAVrJZHqRjQN?mode=wwt";

const CompactFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="compact-footer">
      <span className="compact-footer-copy">
        &copy; {currentYear} SurveyTools. All Rights Reserved.
      </span>
      <nav className="compact-footer-links">
        <Link to="/help">Help &amp; Support</Link>
        <a href={HELP_URL} target="_blank" rel="noreferrer">
          Community
        </a>
        <a href="mailto:help.surveytools@gmail.com">Contact Us</a>
      </nav>
    </footer>
  );
};

export default CompactFooter;
