const mongoose = require("mongoose");
const { Schema } = mongoose;

const FieldSchema = new Schema({
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ["text", "textarea", "number", "date", "select", "checkbox", "radio"],
    required: true,
  },
  required: { type: Boolean, default: false },
  options: [{ type: String }],
});

const ShareSchema = new Schema({
  type: { type: String, enum: ["public", "private"], default: "public" },
  emails: [{ type: String }], // allowed emails
  userIds: [{ type: Schema.Types.ObjectId, ref: "User" }], // allowed users
});

const FormSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  fields: [FieldSchema],
  shares: { type: ShareSchema, default: { type: "public" } },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});



const Form = mongoose.model("Form", FormSchema);

module.exports = {
  Form
}; 