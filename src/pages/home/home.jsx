import { TypeAnimation } from "react-type-animation";
import Hero from "./Hero";
import "./home.css";
import Features from "./Features";
import Utilities from "./Utilities";
import TestimonialSection from "./Testimonials";
import Pricing from "../pricing/pricing"
import CTA from "./CTA";
// import ContestModal from "../../components/ContestModal";

const Home = () => {
  return (
    <>
      {/* HERO */}
      <Hero />
      {/* FEATURES */}
      <Features />
      {/* Utilities */}
      <Utilities />
      {/* Testimonials */}
      <TestimonialSection />
      {/* Pricing */}
      <Pricing />
      {/* CTA */}
      <CTA />
    </>

    // <section className="home">
    //   {/* <ContestModal /> */}
    //   <div className="home-inner wrap">
    //     <h1 className="home-title">
    //       <TypeAnimation
    //         sequence={[
    //           "Paid Surveys: Earn Money Online, Work From Home.",
    //           2000,
    //           "Earn Rewards, completing academic research questionnaires.",
    //           2000,
    //           "Fill questionnaires anonymously with 100% data privacy.",
    //           4000,
    //           "", // Reset to empty string for infinite loop
    //         ]}
    //         speed={40}
    //         deletionSpeed={80}
    //         repeat={Infinity}
    //         wrapper="span"
    //         className="typing-container "
    //         cursor={true}
    //         style={{
    //           display: "inline-block",
    //           whiteSpace: "pre-line",
    //           lineHeight: "1.6",
    //         }}
    //       />
    //       {/* <span className="home-text home-text-1">
    //                     Paid Surveys: Earn Money Online, Work From Home.
    //                 </span>
    //                 <span className="home-text home-text-2">
    //                     Earn Rewards For completing academic research questionnaires.
    //                 </span>
    //                 <span className="home-text home-text-3">
    //                     Fill questionnaires anonymously with 100% data privacy.
    //                 </span> */}
    //     </h1>
    //     <Link className="home-link" to="/signup">
    //       Get Started
    //     </Link>
    //   </div>
    // </section>
  );
};

export default Home;
