import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import ProgressTracker from "./components/ProgressTracker";
import Card from "./components/Card";
import { OptionCard, TextField } from "./components/fields";
import useKycStore from "../../store/useKycStore";
import { NON_ACADEMIC } from "./kycOptions";
import { LAYER1_STEPS, isStudent, validateAcademic, validatePersonal } from "./layer1";

const ACADEMIC_STATUS_OPTIONS = [
  "Undergraduate",
  "Graduate",
  "MSc/MBA",
  "PhD Candidate",
  NON_ACADEMIC,
];

export default function AcaAndProf() {
  const navigate = useNavigate();
  const { layer1, updateLayer1 } = useKycStore();
  const [errors, setErrors] = useState({});

  // The draft is in memory only; after a refresh, start again at step 1
  if (Object.keys(validatePersonal(layer1)).length) {
    return <Navigate to="/register/personalinfo" replace />;
  }

  const setField = (name, value) => {
    updateLayer1({ [name]: value });
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleContinue = () => {
    const found = validateAcademic(layer1);
    setErrors(found);
    if (Object.keys(found).length === 0) navigate("/register/review");
  };

  const fieldProps = { form: layer1, setField, errors, required: true };

  return (
    <div className="flex flex-col items-stretch justify-center ">
      <div className="personal-info lg:w-[80%] inline-flex min-h-scr flex-col items-stretch justify-center">
        <ProgressTracker step={2} totalSteps={LAYER1_STEPS} showSaved={false} />

        <Card
          title={"Academic & Professional Profile"}
          description={"Help us understand your background."}
          onBack={() => navigate("/register/personalinfo")}
          onContinue={handleContinue}
        >
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Academic Status <span className="text-red-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ACADEMIC_STATUS_OPTIONS.map((option) => (
                  <OptionCard
                    key={option}
                    label={option}
                    selected={layer1.academicStatus === option}
                    onClick={() => setField("academicStatus", option)}
                    full={option === NON_ACADEMIC}
                  />
                ))}
              </div>
              {errors.academicStatus && (
                <p className="text-xs text-red-500 mt-1" role="alert">
                  {errors.academicStatus}
                </p>
              )}
            </div>

            {/* Academic fields: required by Layer 1 for students */}
            {layer1.academicStatus && isStudent(layer1) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    label="Institution"
                    name="institution"
                    placeholder="Search Institution"
                    full
                    {...fieldProps}
                  />

                  <TextField label="Faculty/College" name="faculty" {...fieldProps} />

                  <TextField label="Department" name="department" {...fieldProps} />

                  <TextField
                    label="Level of Study"
                    name="levelOfStudy"
                    placeholder="e.g. 300 Level, Final Year"
                    full
                    {...fieldProps}
                  />
                </div>
              )}

            {/* Work details belong to Layer 2, collected once it unlocks */}
            {layer1.academicStatus === NON_ACADEMIC && (
              <p className="text-sm text-slate-500">
                We&apos;ll ask about your work once you unlock your extended profile.
              </p>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
}
