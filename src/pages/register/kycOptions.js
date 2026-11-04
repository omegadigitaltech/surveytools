// kycOptions.js
// UI labels -> API values for the KYC forms. Layer 2 values are strict enums
// in the KYC guide (section 10.1); Layers 3-5 are free strings in the guide
// ("e.g. ..."), so their values follow the guide's snake_case examples.

// [label, value] pairs keep the label the user sees separate from what is sent
const options = (pairs) => pairs.map(([label, value]) => ({ label, value }));

export const labelFor = (list, value) =>
  list.find((o) => o.value === value)?.label ?? value;

// Post-unlock flow: Layer 2 -> health (3) -> household (4) -> culture (5)
export const ENRICHMENT_STEPS = 4;

/* ---------------------------------- Layer 1 ---------------------------------- */

export const NON_ACADEMIC = "Non-academic Professional";

/* ---------------------------------- Layer 2 ---------------------------------- */

export const EDUCATION_LEVELS = options([
  ["No formal education", "no_formal"],
  ["Primary", "primary"],
  ["Secondary", "secondary"],
  ["Diploma (OND / HND)", "diploma"],
  ["Undergraduate degree", "undergraduate"],
  ["Postgraduate degree", "postgraduate"],
]);

export const EMPLOYMENT_STATUSES = options([
  ["Employed", "employed"],
  ["Self-employed", "self_employed"],
  ["Unemployed", "unemployed"],
  ["Student", "student"],
  ["Retired", "retired"],
]);

// Shared by Layer 2 (personal income) and Layer 4 (household income)
export const INCOME_RANGES = options([
  ["Below ₦50,000", "below_50k"],
  ["₦50,000 - ₦150,000", "50k_150k"],
  ["₦150,000 - ₦300,000", "150k_300k"],
  ["₦300,000 - ₦500,000", "300k_500k"],
  ["Above ₦500,000", "above_500k"],
]);

export const MARITAL_STATUSES = options([
  ["Single", "single"],
  ["Married", "married"],
  ["Divorced", "divorced"],
  ["Widowed", "widowed"],
  ["Prefer not to say", "prefer_not_to_say"],
]);

export const GRADUATE_STATUSES = options([
  ["Employed in my field", "Employed in field"],
  ["Underemployed", "Underemployed"],
  ["Seeking work", "Graduate seeking work"],
]);

/* ---------------------------------- Layer 3 ---------------------------------- */

// `multiple` groups are sent as arrays; the rest as a single string or null
export const HEALTH_GROUPS = [
  {
    key: "chronicHealthConditions",
    label: "Chronic Conditions",
    multiple: true,
    options: options([
      ["Diabetes", "Diabetes"],
      ["Hypertension", "Hypertension"],
      ["Asthma", "Asthma"],
      ["Sickle Cell", "Sickle Cell"],
      ["Other", "Other"],
      ["None", "none"],
    ]),
  },
  {
    key: "disabilityStatus",
    label: "Disability Status",
    options: options([
      ["Physical", "mobility_impairment"],
      ["Visual", "visual_impairment"],
      ["Cognitive", "cognitive_impairment"],
      ["Hearing", "hearing_impairment"],
      ["Prefer not to say", "prefer_not_to_say"],
      ["None", "none"],
    ]),
  },
  {
    key: "dietaryPattern",
    label: "Dietary Pattern",
    options: options([
      ["Omnivore", "omnivore"],
      ["Vegan", "vegan"],
      ["Vegetarian", "vegetarian"],
      ["Religious Restrictions", "religious_restrictions"],
      ["Other", "other"],
    ]),
  },
  {
    key: "exerciseFrequency",
    label: "Exercise Frequency",
    options: options([
      ["Sedentary", "sedentary"],
      ["Light", "light"],
      ["Moderate", "moderate"],
      ["Vigorous", "vigorous"],
    ]),
  },
  {
    key: "menstrualHealthStatus",
    label: "Menstrual Health Status",
    options: options([
      ["Active", "active"],
      ["Menopausal", "menopausal"],
      ["N/A", null],
    ]),
  },
  {
    key: "pregnancyStatus",
    label: "Parental/Pregnancy Status",
    options: options([
      ["Pregnant", "pregnant"],
      ["Parent", "parent"],
      ["N/A", null],
    ]),
  },
  {
    key: "smokingStatus",
    label: "Smoking Status",
    options: options([
      ["Active(Occasional/Daily)", "active"],
      ["Former", "former"],
      ["N/A", "never"],
    ]),
  },
  {
    key: "alcoholConsumption",
    label: "Alcohol Consumption",
    options: options([
      ["Frequent", "frequent"],
      ["Moderate", "moderate"],
      ["Occasional", "occasional"],
      ["N/A", "never"],
    ]),
  },
];

/* ---------------------------------- Layer 4 ---------------------------------- */

export const HOUSING_TYPES = options([
  ["Hostel", "hostel"],
  ["Rental", "rented_apartment"],
  ["Family home", "family_house"],
  ["Owned Property", "owned_home"],
]);

export const TRANSPORT_MODES = options([
  ["Walking", "walking"],
  ["Public Transport", "public_bus"],
  ["Personal Car", "private_car"],
  ["Motorcycle", "okada"],
  ["Other", "other"],
]);

export const INTERNET_QUALITY = options([
  ["Poor", "poor"],
  ["Fair", "fair"],
  ["Good", "good"],
  ["Excellent", "excellent"],
]);

export const DEVICES = options([
  ["Smartphone", "smartphone"],
  ["Laptop", "laptop"],
  ["Tablet", "tablet"],
  ["Desktop", "desktop"],
  ["Other", "other"],
]);

/* ---------------------------------- Layer 5 ---------------------------------- */

export const RELIGIONS = options([
  ["Christianity", "Christianity"],
  ["Islam", "Islam"],
  ["Traditional", "Traditional"],
  ["Other", "Other"],
  ["Prefer not to say", "prefer_not_to_say"],
]);

export const ETHNICITIES = options([
  ["Yoruba", "Yoruba"],
  ["Igbo", "Igbo"],
  ["Hausa", "Hausa"],
  ["Other", "Other"],
  ["Prefer not to say", "prefer_not_to_say"],
]);

export const LANGUAGES = ["English", "Yoruba", "Igbo", "Hausa", "Pidgin"];

/* -------------------------------- Researcher -------------------------------- */

export const RESEARCHER_TYPES = options([
  ["Student", "student"],
  ["Professional", "professional"],
  ["Corporate / Organisation", "corporate"],
]);

export const RESEARCHER_ACADEMIC_STATUSES = [
  "Undergraduate",
  "Postgraduate (Masters)",
  "PhD Candidate",
];

export const TITLES = ["Dr.", "Prof.", "Mr.", "Mrs.", "Ms."];

export const ORG_TYPES = ["Private Company", "NGO", "Government Agency", "Academic Institution", "Other"];

export const MONTHLY_SURVEY_VOLUMES = ["1-5", "5-10", "10-20", "20-50", "50+"];

export const TIER_LABELS = {
  standard: "Standard",
  premium: "Premium",
  institutional: "Institutional",
};
