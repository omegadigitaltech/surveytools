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
      <Hero />
      <Features />
      <Utilities />
      <TestimonialSection />
      {/* <Pricing /> */}
      <CTA />
    </>
  );
};

export default Home;
