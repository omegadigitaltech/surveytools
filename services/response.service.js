

const Form = require("../model/form.js");
const { Response } = require("../model/response.js");


class ResponseService {
  // Submit response
  async submitResponse(formId, answers) {
    const form = await Form.findById(formId);
    if (!form) throw new Error("Form not found");

    // Validate required fields
    form.fields.forEach((field) => {
      if (field.required) {
        const answered = answers.find(
          (ans) => ans.fieldId.toString() === field._id.toString()
        );
        if (!answered || !answered.value) {
          throw new Error(`Field "${field.label}" is required`);
        }
      }
    });

    return await Response.create({ formId, answers });
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

module.exports = new ResponseService();



