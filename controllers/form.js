import { formService } from "../services/form.service.js";
import User from "../model/user.js";
import { Form } from "../model/form.js";

class FormController {
  async createForm(req, res) {
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
          code: 400,
          msg: "Form with this title already exists",
          form: similarformExists
        });
      }
      const form = await formService.createForm(req.body, user._id);

      res.status(201).json(form);
    } catch (err) {
      res.status(400).json({ error: err.message });
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

export const formController = new FormController();
