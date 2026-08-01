import React, { useState } from "react";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import ProgressTracker from "./components/ProgressTracker";
import Card from "./components/Card";


export default function AcaAndProf() {
  const [gender, setGender] = useState("");
  const step = 2;
  const totalSteps = 6;

  return (
    <div className= "flex flex-col items-stretch justify-center ">
    <div className="personal-info inline-flex min-h-screen flex-col items-stretch justify-center">
      <ProgressTracker step={step} totalSteps={totalSteps} />
      <Card title={"Academic & Professional Profile"} description={"Help us understand your background."}>
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
      </Card>
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

