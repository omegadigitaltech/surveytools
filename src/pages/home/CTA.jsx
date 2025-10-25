import React from "react";
import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="CTA bg-[#087E46] text-white flex justify-center items-center h-[40vh]">
      <div className="flex flex-col items-center">
        <h1 className="text-5xl font-[500]">Ready To Create Your First Survey</h1>
        <p className="py-2">Join thousands making better desicions through better surverys</p>
        <Link className="button-filled px-5 py-3 lg:px-10 lg:py-4 mt-[5%] rounded-md">Get Started</Link>
      </div>
    </section>
  );
};

export default CTA;
