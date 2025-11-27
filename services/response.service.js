const Form = require("../model/form.js");

const { Response } = require("../model/response.js");

class ResponseService {
  // Submit response
  async submitResponse(formId, email, answers) {
    // Load form
    const form = await Form.findById(formId);
    if (!form) throw new Error("Form not found");

    // Flatten all fields inside sections
    const allFields = (form.sections || []).flatMap((sec) => sec.fields || []);

    // Build fieldMap for quick lookups
    const fieldMap = {};
    allFields.forEach((field) => {
      fieldMap[field._id.toString()] = field;
    });

    console.log("Flattened fields:", allFields);

    // ----------------------------------------
    // 1. Check all answers map to valid fieldIds
    // ----------------------------------------
    answers.forEach((ans) => {
      const field = fieldMap[ans.fieldId];
      if (!field) {
        throw new Error(`Invalid fieldId sent: ${ans.fieldId}`);
      }
    });

    // ----------------------------------------
    // 2. Validate required fields
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
    // 3. Type validation
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
              `Invalid option for "${
                field.questionText
              }". Allowed: ${field.options.join(", ")}`
            );
          }
          break;

        case "likert":
          const allowedValues = field.likert?.scale?.map((s) => s.value) || [];
          if (!allowedValues.includes(ans.value)) {
            throw new Error(
              `Invalid Likert value for "${
                field.questionText
              }". Allowed: ${allowedValues.join(", ")}`
            );
          }
          break;

        case "checkbox":
          if (!Array.isArray(ans.value)) {
            throw new Error(
              `Field "${field.questionText}" (checkbox) requires an array`
            );
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
    // 4. Save Response
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