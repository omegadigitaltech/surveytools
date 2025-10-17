import React from 'react'
import { Link } from "react-router-dom";


const Hero = () => {
  return (
   <section className="home hero bg-white flex flex-col md:flex-row overflow-hidden">
      <div className="content flex flex-col items-center md:max-w-[40%] p-[5%] md:p-[2%] lg:p-auto md:ml-[2%] lg:ml-[8%] md:mt-[8%]">
        <div>
          <h1 className="text-3xl/10 md:text-4xl/10 lg:text-5xl/14 font-[500] ">
            Create Smart Surveys <br /> Simply for Everyone
          </h1>
          <p className="md:max-w-[90%] my-4">
            Whether you’re a student, a busy professional, or a corporation, our
            platform makes it simple to design surveys, reach the right
            audience, and collect results you can trust
          </p>
          <div>
            <div className="flex gap-2">
              <img src="/users-avatars.png" alt="" className="" />
              <div className="">1k+ satisfied users</div>
            </div>
          </div>
          <div className="flex gap-4 lg:gap-8 mt-4">
            <Link className="button-filled px-5 py-3 lg:px-10 lg:py-4 rounded-md">Get Started</Link>
            <Link className="px-5 py-3 lg:px-10 lg:py-4 rounded-md border-[1px]">How it Works</Link>
          </div>
        </div>
      </div>
      <div className="illustration relative mr-[8%]">
        <div className="mt-[-10%]">
          <img src="/handsome-man.png" alt="handsome-man" className="" />
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
  )
}

export default Hero