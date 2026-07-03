import React from "react";
import { NavLink } from "react-router-dom";

const Hero = () => {
  return (
    <section className="home hero bg-white flexx flex-col md:flex-row overflow-hidden pt-[1rem] md:pt-0">
      <div className="content opacity-0 animate-[slideInLeft_0.8s_ease-out_forwards] flex flex-col items-center md:max-w-[40%] p-[5%] md:p-[2%] lg:p-auto md:ml-[2%] lg:ml-[8%] md:mt-[0%]">
        <div className="hero-box">
          <h1 className="text-3xl/10 md:text-4xl/10 lg:text-4xl/14 font-[600] ">
            Create Smart Surveys <br /> Simply for Everyone
          </h1>
          <p className="md:max-w-[90%] my-4">
            Whether you’re a student, a busy professional, or a corporation, our
            platform makes it simple to design surveys, reach the right
            audience, and collect results you can trust
          </p>
          <div>
            <div className="flex gap-2">
              <div className="flex items-center">
                <div className="relative z-[1] w-10 h-10 md:w-13 md:h-13 rounded-full border-2 border-white shadow-md overflow-hidden">
                  <img
                    src="/ava1.png"
                    alt="avatar-1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-[2] -ml-5 w-10 h-10 md:w-13 md:h-13 rounded-full border-2 border-white shadow-md overflow-hidden">
                  <img
                    src="/ava3.png"
                    alt="avatar-2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-[3] -ml-5 w-10 h-10 md:w-13 md:h-13 rounded-full border-2 border-white shadow-md overflow-hidden">
                  <img
                    src="/ava2.png"
                    alt="avatar-3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-[4] -ml-5 w-10 h-10 md:w-13 md:h-13 rounded-full border-2 border-white shadow-md overflow-hidden">
                  <img
                    src="/ava4.png"
                    alt="avatar-4"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="">1k+ satisfied researchers</div>
            </div>
          </div>
          <div className="hero-btns flex gap-4 lg:gap-8 mt-4 relative z-50">
            <NavLink
              className="button-filled px-5 py-3 lg:px-7 lg:py-2 rounded-md"
              to="/signup"
            >
              Get Started
            </NavLink>
            <NavLink className="px-5 py-3 lg:px-7 lg:py-2 rounded-md border-[1px] border-[var(--btns)]">
              How it Works
            </NavLink>
          </div>
        </div>
      </div>
      <div className="illustration relative mr-[8%] opacity-0 animate-[slideInRight_0.8s_ease-out_forwards]">
        <div className="mt-[-10%]">
          <img
            src="/handsome-man.png"
            alt="handsome-man"
            className="hero-img"
          />
          <img
            src="/blue-text-box.svg"
            className="absolute top-[15%] right-[-10%]"
            alt="blue-text-box"
          />
          <img
            src="/green-text-box.svg"
            className="absolute top-[40%] md:top-[40%] lg:top-[50%] left-0 md:-left-[5%]"
            alt="green-text-box"
          />
          <img
            src="/red-text-box.svg"
            className="absolute bottom-[15%] right-[-10%]"
            alt="red-text-box"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
