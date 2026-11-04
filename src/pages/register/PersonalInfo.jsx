import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProgressTracker from "./components/ProgressTracker";
import Card from "./components/Card";
import { Field, TextField } from "./components/fields";
import RadioOption from "./RadioOption";
import useKycStore from "../../store/useKycStore";
import { LAYER1_STEPS, validatePersonal } from "./layer1";

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "prefer-not-to-say", label: "Prefer not to say" },
];

// Layer 1 accepts respondents from 16 (registration itself requires 18)
const maxDob = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 16);
  return d.toISOString().slice(0, 10);
})();

export default function PersonalInformation() {
  const navigate = useNavigate();
  const { layer1, updateLayer1 } = useKycStore();
  const [errors, setErrors] = useState({});

  const setField = (name, value) => {
    updateLayer1({ [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleContinue = () => {
    const found = validatePersonal(layer1);
    setErrors(found);
    if (Object.keys(found).length === 0) navigate("/register/academicprofile");
  };

  const fieldProps = { form: layer1, setField, errors, required: true };

  return (
    <div className= "flex flex-col items-stretch justify-center mt-3">
    <div className="personal-info w-[100%] inline-flex min-h-screen flex-col items-stretch justify-center">
      <ProgressTracker step={1} totalSteps={LAYER1_STEPS} showSaved={false} />
      <Card
        title={"Personal Information"}
        description={"Tell us a little about yourself"}
        onBack={() => navigate("/dashboard")}
        onContinue={handleContinue}
      >
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 ">
            <Field label="Gender" required error={errors.gender}>
              <div className="flex items-center  flex-wrap gap-6 pt-2" role="radiogroup">
                {GENDERS.map((g) => (
                  <RadioOption
                    key={g.value}
                    name="gender"
                    value={g.value}
                    label={g.label}
                    checked={layer1.gender === g.value}
                    onChange={() => setField("gender", g.value)}
                  />
                ))}
              </div>
            </Field>
            <TextField
              label="Date Of Birth"
              name="dateOfBirth"
              type="date"
              max={maxDob}
              {...fieldProps}
            />

            <TextField
              label="State Of Origin"
              name="stateOfOrigin"
              placeholder="Enter your state of origin"
              {...fieldProps}
            />
            <TextField
              label="State Of Residence"
              name="stateOfResidence"
              placeholder="Enter the state you currently reside"
              {...fieldProps}
            />
            <TextField
              label="LGA Of Residence"
              name="lgaOfResidence"
              placeholder="Enter your local government area"
              {...fieldProps}
            />
          </div>
        </form>
      </Card>
    </div>

    </div>
  );
}
