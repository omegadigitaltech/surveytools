import React from "react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section
      className="CTA text-white flex justify-center items-center md:h-[60vh] text-center py-8 px-2  items-center relative overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(0, 131, 3, 0.9) 50%, rgba(0, 150, 184, 0.9)), url('/rewards-bg.jpg')",
      }}
    >
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-4xl font-[500] mb-4">
          Ready To Create Your First Survey
        </h1>
        <p className="py-2 text-[1.1rem]">
          Join thousands making better desicions through better surverys
        </p>
        <Link
          className="button-filled px-5 py-3 lg:px-10 lg:py-4 mt-[1rem] md:mt-[5%] rounded-md"
          to="/signup"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
};

export default CTA;
