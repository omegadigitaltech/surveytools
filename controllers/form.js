// const formService = require("../services/form.service.js");
const User = require("../model/user.js");
const Form = require("../model/form.js");
const FormService = require ("../services/form.service.js")
const formService = new FormService();

class FormController {
  async createForm(req, res) {
    console.log("got heere ")
    try {
      const user = await User.findOne({ id: req.userId });
      console.log(req.userId);
      if (!user) {
        return res.status(404).json({
          status: "failure",
          code: 404,
          msg: "User Not Found"
        });
      }
      const similarformExists = await Form.findOne({
        title: req.body.title,
        createdBy: user._id
      });
      if (similarformExists) {
        return res.status(400).json({
          status: "failure",
          msg: "Each section must have a title"
        });
      }

      // Fields validation
      if (section.fields && Array.isArray(section.fields)) {
        for (const field of section.fields) {
          if (!field.questionText || !field.type) {
            return res.status(400).json({
              status: "failure",
              msg: "Each field must include questionText and type"
            });
          }

          // Likert validation
          if (field.type === "likert") {
            if (!field.likert || !Array.isArray(field.likert.scale)) {
              return res.status(400).json({
                status: "failure",
                msg: "Likert fields must contain likert.scale array"
              });
            }
          }
        }
      }
    }

    // Create form through service
    const form = await formService.createForm(req.body, user._id);

    res.status(201).json({
      status: "success",
      msg: "Form created successfully",
      form
    });

  } catch (err) {
    console.error("CREATE FORM ERROR:", err);
    res.status(500).json({ status: "error", msg: err.message });
  }
}


  async getForms(req, res) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) {
        return res.status(404).json({
          status: "failure",
          code: 404,
          msg: "User Not Found"
        });
      }

      const forms = await formService.getForms(user._id);
      res.json(forms);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getFormById(req, res) {
    try {
    

      const form = await formService.getFormById(req.params.id);
      if (!form) return res.status(404).json({ error: "Form not found" });
      res.json(form);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateForm(req, res) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) {
        return res.status(404).json({
          status: "failure",
          code: 404,
          msg: "User Not Found"
        });
      }

      const form = await formService.updateForm(req.params.id, req.body);
      if (!form) return res.status(404).json({ error: "Form not found" });
      res.json(form);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteForm(req, res) {
    try {
      const user = await User.findOne({ id: req.userId });
      if (!user) {
        return res.status(404).json({
          status: "failure",
          code: 404,
          msg: "User Not Found"
        });
      }

      const form = await formService.deleteForm(req.params.id);
      if (!form) return res.status(404).json({ error: "Form not found" });
      res.json({ message: "Form deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = { formController: new FormController() };
