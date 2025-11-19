
import { Form } from "../model/form.js";
import { Response } from "../model/response.js";

class ResponseService {
  // Submit response
  async submitResponse(formId, email, answers) {
    // 1. Load form
    const form = await Form.findById(formId);

    if (!form) {
      throw new Error("Form not found");
    }

    // Convert ids for easier matching
    const fieldMap = {};
    form.fields.forEach((field) => {
      fieldMap[field._id.toString()] = field;
    });

    // -----------------------------
    // 2. CHECK: All answers must map to valid fields in this form
    // -----------------------------
    answers.forEach((ans) => {
      if (!fieldMap[ans.fieldId]) {
        throw new Error(`Invalid fieldId sent: ${ans.fieldId}`);
      }
    });

    // -----------------------------
    // 3. CHECK: Required fields must be answered
    // -----------------------------
    form.fields.forEach((field) => {
      if (field.required) {
        const answered = answers.find(
          (ans) => ans.fieldId.toString() === field._id.toString()
        );

        if (!answered || answered.value === "" || answered.value == null) {
          throw new Error(`Field "${field.questionText}" is required`);
        }
      }
    });

    // -----------------------------
    // 4. (Optional) TYPE VALIDATION
    // -----------------------------
    for (let ans of answers) {
      const field = fieldMap[ans.fieldId];

      switch (field.type) {
        case "number":
          if (isNaN(ans.value)) {
            throw new Error(`Field "${field.questionText}" must be a number`);
          }
          break;

        case "multiple-choice":
          if (!field.options.includes(ans.value)) {
            throw new Error(
              `Invalid option for "${
                field.questionText
              }". Expected one of: ${field.options.join(", ")}`
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

    // -----------------------------
    // 5. Save the response
    // -----------------------------
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

export const responseService = new ResponseService();
