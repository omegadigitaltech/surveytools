import { TypeAnimation } from "react-type-animation";
import Hero from "./Hero";
import "./home.css";
import Features from "./Features";
import Utilities from "./Utilities";
import TestimonialSection from "./Testimonials";
import Pricing from "./Pricing";
import CTA from "./CTA";

const Home = () => {
  return (
    <>
      <Hero />
      <Utilities />
      <Features />
      <TestimonialSection />
      <Pricing />
      <CTA />
    </>
  );
};

export default Home;
