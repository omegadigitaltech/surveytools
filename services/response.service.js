
const { Form } = require("../model/form.js");
const { Response } = require("../model/response.js");

class ResponseService {
  // Submit response
 async submitResponse(formId, email, answers) {
  // 1. Load form
  const form = await Form.findById(formId);

  if (!form) {
    throw new Error("Form not found");
  }

  // -----------------------------
  // NEW: FLATTEN SECTION FIELDS
  // -----------------------------
  const allFields = form.sections
    .flatMap((sec) => sec.fields || []);

  // Create map for quick lookup
  const fieldMap = {};
  allFields.forEach((field) => {
    fieldMap[field._id.toString()] = field;
  });

  // ----------------------------------------
  // 2. CHECK: All answers must map to fields
  // ----------------------------------------
  answers.forEach((ans) => {
    if (!fieldMap[ans.fieldId]) {
      throw new Error(`Invalid fieldId sent: ${ans.fieldId}`);
    }
  });

  // ----------------------------------------
  // 3. CHECK REQUIRED FIELDS
  // ----------------------------------------
  allFields.forEach((field) => {
    if (field.required) {
      const answered = answers.find(
        (ans) => ans.fieldId.toString() === field._id.toString()
      );

      if (!answered || answered.value === "" || answered.value == null) {
        throw new Error(`Field "${field.questionText}" is required`);
      }
    }
  });

  // ----------------------------------------
  // 4. TYPE VALIDATION (works same)
  // ----------------------------------------
  for (let ans of answers) {
    const field = fieldMap[ans.fieldId];

    switch (field.type) {
      case "number":
        if (isNaN(ans.value)) {
          throw new Error(`Field "${field.questionText}" must be a number`);
        }
        break;

      case "multiple-choice":
      case "select":
      case "radio":
        if (!field.options?.includes(ans.value)) {
          throw new Error(
            `Invalid option for "${field.questionText}". Expected one of: ${field.options.join(", ")}`
          );
        }
        break;

      case "likert":
        const allowed = field.likert?.scale?.map((s) => s.value) || [];
        if (!allowed.includes(ans.value)) {
          throw new Error(
            `Invalid Likert value for "${field.questionText}". Allowed: ${allowed.join(", ")}`
          );
        }
        break;

      case "checkbox":
        if (!Array.isArray(ans.value)) {
          throw new Error(`Field "${field.questionText}" (checkbox) requires an array`);
        }
        break;

      case "text":
      case "textarea":
        if (typeof ans.value !== "string") {
          throw new Error(`Field "${field.questionText}" must be text`);
        }
        break;
    }
  }

  // ----------------------------------------
  // 5. Save response (unchanged)
  // ----------------------------------------
  return await Response.create({
    formId,
    email,
    answers,
    submittedAt: new Date(),
  });
}

  // Get all responses for a form
  async getResponses(formId) {
    return await Response.find({ formId }).lean();
  }

  // Get a single response by ID
  async getResponseById(id) {
    return await Response.findById(id).lean();
  }
}

const responseService = new ResponseService();
module.exports = { responseService };
