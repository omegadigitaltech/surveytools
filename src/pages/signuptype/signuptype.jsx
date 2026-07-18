import React, { useState } from "react";
import { useNavigate, } from "react-router-dom";
import { ArrowLeft, GraduationCap, Briefcase } from "lucide-react";
import backaro from "../../assets/img/backaro.svg";

const accountTypes = [
    {
      id: "student",
      title: "Students",
      description:
        "Take surveys, earn rewards, participate in research, and sharpen your research skills.",
      icon: GraduationCap,
      route: "/signup",
    },
    {
      id: "professional",
      title: "Professionals",
      description:
        "Create surveys, collect responses, analyze data, and manage research projects.",
      icon: Briefcase,
      route: "/professional-signup",
    },
  ];

const SignUpType = () => {
        const navigate = useNavigate();      
return(
    <div className="signuptype">
 <div className="min-h-screen ">
      <div className="mx-auto max-w-7xl px-1 py-5 sm:py-5 sm:px-6">
        {/* Header */}
        <div className="signuptype-head flex items-start gap-5 sm mb-4">
            <button
          onClick={() => navigate(-1)}
          className="  text-black transition hover:text-[#2793CD]"
        >
          <img src={backaro} className="w-4 h-4 sm:w-6 sm:h-6 mt-2" alt="" />
        </button> 
        <div>
              <h1 className="text-xl sm:text-3xl font-semibold">Join SurveyTools Today</h1>
        <p className="ml-0 mb-0 text-l text-gray-600">
          Get started by choosing how you would like to sign up
        </p>
        </div>
        </div>
        

        {/* Cards */}
        <div className="grid gap-8 md:grid-cols-2">
          {accountTypes.map((account) => {
            const Icon = account.icon;

            return (
              <div
                key={account.id}
                className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-8 flex h-13 w-13 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gray-100">
                  <Icon
                    size={30} 
                    className="text-[#2793CD]"
                    strokeWidth={2}
                  />
                </div>

                <h2 className="mb-4 text-2xl font-semibold">
                  {account.title}
                </h2>

                <p className="mb-14 text-l leading-5 text-gray-500">
                  {account.description}
                </p>

                <button
               onClick={() => navigate(account.route)}
                  className="w-full rounded-xl border border-[#2793CD] py-3 text-l font-medium text-[#2793CD] transition hover:bg-[#2793CD] hover:text-white"
                >
                  Sign Up
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </div>
)
}

export default SignUpType;