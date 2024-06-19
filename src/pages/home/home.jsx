import { Link } from "react-router-dom";
import "./home.css";

const Home = () => {
    return (
        <section className="home">
            <div className="home-inner wrap">
                <h1 className="home-title">
                    <span className="home-text home-text-1">
                        Paid Surveys: Earn Money Online, Work From Home.
                    </span>
                    <span className="home-text home-text-2">
                        Earn Rewards For completing academic research questionnaires.
                    </span>
                    <span className="home-text home-text-3">
                        Fill questionnaires anonymously with 100% data privacy.   
                    </span>
                </h1>
                <Link className="home-link" to="">
                    Get Started
                </Link>
            </div>
        </section>
    );
}

export default Home;