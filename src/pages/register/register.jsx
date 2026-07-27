import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, GraduationCap, Briefcase, ChevronLeft } from "lucide-react";
import RadioOption from "./RadioOption";
import backaro from "../../assets/img/backaro.svg";
import "./register.css";


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
  const [gender, setGender] = useState("");
  return (
    <div className="register min-h-screen w-full flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-10">
        
        {/* Header */}
        <button
          type="button"
          className="flex items-center gap-1 text-slate-900 mb-1"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6 hidden md:block" strokeWidth={2} />
          <h1 className="text-3xl font-semibold">Create An Account</h1>
        </button>
        <p className="text-sm text-slate-500 mb-8">
          Sign up as a student, start taking surveys, earn rewards and learn
          through research.
        </p>

        {/* Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
            <Field label="First Name">
              <input type="text" placeholder="First name" className="input" />
            </Field>
            <Field label="Last Name">
              <input type="text" placeholder="Last name" className="input" />
            </Field>

            <Field label="Date Of Birth">
              <input type="text" placeholder="mm/dd/yyyy" className="input" />
            </Field>
            <div />

            <Field label="Gender">
              <div className="flex items-center gap-6 pt-2">
                <RadioOption
                  name="gender"
                  value="male"
                  label="Male"
                  checked={gender === "male"}
                  onChange={() => setGender("male")}
                />
                <RadioOption
                  name="gender"
                  value="female"
                  label="Female"
                  checked={gender === "female"}
                  onChange={() => setGender("female")}
                />
                <RadioOption
                  name="gender"
                  value="prefer-not-to-say"
                  label="Prefer not to say"
                  checked={gender === "prefer-not-to-say"}
                  onChange={() => setGender("prefer-not-to-say")}
                />
              </div>
            </Field>
            <Field label="Institution">
              <input
                type="text"
                placeholder="Enter your institution name"
                className="input"
              />
            </Field>

            <Field label="State Of Origin">
              <input
                type="text"
                placeholder="Enter your  state of birth"
                className="input"
              />
            </Field>
            <Field label="State Of Residence">
              <input
                type="text"
                placeholder="Enter the state you currently reside"
                className="input"
              />
            </Field>

            <Field label="Email" full>
              <input
                type="email"
                placeholder="Enter your email address"
                className="input"
              />
            </Field>

            <Field label="Phone Number" full>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="input"
              />
            </Field>

            <Field label="Password" full>
              <input
                type="password"
                placeholder="Create a password"
                className="input"
              />
            </Field>

            <Field label="Confirm Password" full>
              <input
                type="password"
                placeholder="Create a password"
                className="input"
              />
            </Field>
          </div>

          <button
            type="submit"
            className="w-full bg-sky-600 hover:bg-sky-700 transition-colors text-white font-medium py-3 rounded-lg mt-2"
          >
            Create an Account
          </button>

          <p className="text-center text-sm text-red-600">
            Have an account already?{" "}
            <a href="#" className="font-medium hover:underline">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};
function Field({ label, children, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-slate-900 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}



// <div className="signuptype">
//   <div className="min-h-screen ">
//     <div className="mx-auto max-w-7xl px-1 py-5 sm:py-5 sm:px-6">
//       {/* Header */}
//       <div className="signuptype-head flex items-start gap-5 sm mb-4">
//         <button
//           onClick={() => navigate(-1)}
//           className="  text-black transition hover:text-[#2793CD]"
//         >
//           <img
//             src={backaro}
//             className="w-4 h-4 sm:w-6 sm:h-6 mt-2"
//             alt=""
//           />
//         </button>
//         <div>
//           <h1 className="text-xl sm:text-3xl font-semibold">
//             Join SurveyTools Today
//           </h1>
//           <p className="ml-0 mb-0 text-l text-gray-600">
//             Get started by choosing how you would like to sign up
//           </p>
//         </div>
//       </div>

//       {/* Cards */}
//       <div className="grid gap-8 md:grid-cols-2">
//         {accountTypes.map((account) => {
//           const Icon = account.icon;

//           return (
//             <div
//               key={account.id}
//               className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
//             >
//               <div className="mb-8 flex h-13 w-13 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gray-100">
//                 <Icon
//                   size={30}
//                   className="text-[#2793CD]"
//                   strokeWidth={2}
//                 />
//               </div>

//               <h2 className="mb-4 text-2xl font-semibold">
//                 {account.title}
//               </h2>

//               <p className="mb-14 text-l leading-5 text-gray-500">
//                 {account.description}
//               </p>

//               <button
//                 onClick={() => navigate(account.route)}
//                 className="w-full rounded-xl border border-[#2793CD] py-3 text-l font-medium text-[#2793CD] transition hover:bg-[#2793CD] hover:text-white"
//               >
//                 Sign Up
//               </button>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   </div>
// </div>

export default SignUpType;
