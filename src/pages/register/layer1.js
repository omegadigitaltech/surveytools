// Layer 1 (core demographics) validation and payload, shared by the three
// onboarding screens: personal info -> academic profile -> review.
import { ageFrom, toIsoDate } from "../../utils/kycFlow";
import { NON_ACADEMIC } from "./kycOptions";

export const LAYER1_STEPS = 3;

const PERSONAL_REQUIRED = {
  gender: "Select your gender.",
  dateOfBirth: "Enter your date of birth.",
  stateOfOrigin: "Enter your state of origin.",
  stateOfResidence: "Enter your state of residence.",
  lgaOfResidence: "Enter your local government area.",
};

// All five student fields are required by the backend when isStudent is true
const STUDENT_REQUIRED = {
  institution: "Enter your institution.",
  faculty: "Enter your faculty or college.",
  department: "Enter your department.",
  levelOfStudy: "Enter your level of study.",
};

const missing = (draft, required) =>
  Object.fromEntries(
    Object.entries(required).filter(([key]) => !String(draft[key]).trim()),
  );

export const isStudent = (draft) => draft.academicStatus !== NON_ACADEMIC;

export const validatePersonal = (draft) => {
  const errors = missing(draft, PERSONAL_REQUIRED);
  if (!errors.dateOfBirth && ageFrom(draft.dateOfBirth) < 16) {
    errors.dateOfBirth = "You must be at least 16 years old.";
  }
  return errors;
};

export const validateAcademic = (draft) => {
  if (!draft.academicStatus) return { academicStatus: "Select your academic status." };
  return isStudent(draft) ? missing(draft, STUDENT_REQUIRED) : {};
};

export const buildLayer1Payload = (draft) => {
  const trim = (key) => draft[key].trim();
  const payload = {
    dateOfBirth: toIsoDate(draft.dateOfBirth),
    gender: draft.gender,
    stateOfOrigin: trim("stateOfOrigin"),
    stateOfResidence: trim("stateOfResidence"),
    lgaOfResidence: trim("lgaOfResidence"),
    isStudent: isStudent(draft),
  };
  if (payload.isStudent) {
    Object.assign(payload, {
      academicLevel: draft.academicStatus,
      levelOfStudy: trim("levelOfStudy"),
      institution: trim("institution"),
      faculty: trim("faculty"),
      department: trim("department"),
    });
  }
  return payload;
};
