import { Form } from "../model/form";


class FormService {
    // Create a new form
    async createForm(data, userId) {
      return await Form.create({ ...data, createdBy: userId });
    }
  
    // Get all forms (could filter by user)
    async getForms(userId) {
      return await Form.find({ createdBy: userId }).lean();
    }
  
    // Get a single form by ID
    async getFormById(formId) {
      return await Form.findById(formId).lean();
    }
  
    // Update a form
    async updateForm(formId, data) {
      return await Form.findByIdAndUpdate(formId, data, { new: true });
    }
  
    // Delete a form
    async deleteForm(formId) {
      return await Form.findByIdAndDelete(formId);
    }
  
    // Check if a user/email can access a form
    async canAccessForm(form, user) {
      if (form.shares.type === "public") return true;
  
      const emailAllowed = form.shares.emails?.includes(user.email);
      const userAllowed = form.shares.userIds?.some(
        (id) => id.toString() === user._id.toString()
      );
  
      return emailAllowed || userAllowed;
    }
  }
  
  export const formService = new FormService();
  