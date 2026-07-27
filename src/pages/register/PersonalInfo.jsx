import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

export default function PersonalInformation() {
  const [gender, setGender] = useState("");

  const step = 1;
  const totalSteps = 6;
  const percentComplete = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="w-full">
        {/* Top bar: logo + progress */}
        <div>
          <p className="text-sky-600 text-xs font-semibold tracking-wide">
            STEP {step} OF {totalSteps}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            {percentComplete}% Complete
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
          <CheckCircle2 className="w-4 h-4" strokeWidth={2} />
          Progress Saved
        </div>
        <div className="flex items-start justify-between mb-2">
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
      </div>
      <div className="bg-white rounded-t-2xl px-10 pt-8 pb-6">
        {/* Card */}
        <div className="bg-white rounded-b-2xl shadow-sm px-10 pb-8 pt-8 border-t border-slate-100">
          <button
            type="button"
            className="flex items-center gap-1 text-slate-900 mb-1"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            <h1 className="text-3xl font-semibold">Personal Information</h1>
          </button>
          <p className="text-sm text-slate-500 mb-8">
            Tell us a little about yourself.
          </p>

          <form className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              <Field label="First Name" required>
                <input type="text" placeholder="First name" className="input" />
              </Field>
              <Field label="Last Name" required>
                <input type="text" placeholder="Last name" className="input" />
              </Field>

              <Field label="Gender" required>
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
              <Field label="Date Of Birth" required>
                <input type="text" placeholder="mm/dd/yyyy" className="input" />
              </Field>

              <Field label="Institution">
                <input
                  type="text"
                  placeholder="Enter your institution name"
                  className="input"
                />
              </Field>
              <Field label="Phone Number">
                <input
                  type="tel"
                  placeholder="Enter your phone number"
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

              <Field label="Email">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="input"
                />
              </Field>
            </div>
          </form>
        </div>

        {/* Footer action bar */}
        <div className="flex justify-end mt-4">
          <button
            type="button"
            className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 transition-colors text-white font-medium px-6 py-2.5 rounded-lg"
          >
            Continue
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, required, full }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-sm font-medium text-slate-900 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function RadioOption({ name, value, label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer select-none">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 accent-sky-600 cursor-pointer"
      />
      {label}
    </label>
  );
}

/*
  Tailwind input style used across the form.
  Add this to your global stylesheet (e.g. index.css) under @layer components:

  .input {
    @apply w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-900
           placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500
           focus:border-transparent transition-shadow;
  }
*/
