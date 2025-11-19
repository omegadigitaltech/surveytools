import mongoose from "mongoose";
const { Schema } = mongoose;
import { ResponseSchema } from "./response.js";

// --- Helper Schemas ---

// 1. Revised FieldSchema to handle 'Multiple Choice' structure
const FieldSchema = new Schema({
  // Represents the 'Input Question' text
  questionText: { type: String, required: true },
  // Represents the 'Question Type' dropdown value
  type: {
    type: String,
    enum: [
      "text",
      "textarea",
      "number",
      "date",
      "select",
      "checkbox",
      "radio",
      "multiple-choice" // Added 'multiple-choice' type for clarity
    ],
    required: true
  },
  // Corresponds to 'Required: Turned ON/OFF'
  required: { type: Boolean, default: false },
  // Represents the answer options (e.g., 'a. Doe', 'b. Another Option')
  // Made optional overall, but must be present for 'multiple-choice', 'select', etc.
  options: [{ type: String }]
});

// 2. ShareSchema (No change needed)
const ShareSchema = new Schema({
  type: { type: String, enum: ["public", "private"], default: "public" },
  emails: [{ type: String }], // allowed emails
  userIds: [{ type: Schema.Types.ObjectId, ref: "User" }] // allowed users
});

// --- Main Form Schema ---

// 3. FormSchema (Minor property name clarification for styles)
export const FormSchema = new Schema({
  // Form Details
  title: { type: String, required: true }, // Corresponds to 'Untitled Form' placeholder
  description: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },

  // Styling Details (from 'Tool Box' in the image)
  backgroundColor: {
    // Corresponds to the selected circle under 'Background Color'
    type: String,
    required: false // E.g., a hex code like '#ff69b4' or a name
  },
  fontFamily: {
    // Corresponds to the value selected in the 'Font Family' dropdown (e.g., 'Roboto')
    type: String,
    required: false
  },
  config: {
    time: {
      type: String,
      required: false
    },
    point: {
      type: String,
      required: false
    },
    totalRequiredParticipants: {
      type: String,
      required: false
    },
    preferredParticipants: {
      type: String,
      required: false
    },
    totalParticipants: {
      type: String,
      required: false
    }
  },
  // Content Details
  fields: [FieldSchema], // An array of the questions/inputs on the form
  shareLink: { type: String, default: "" },
  htmlEmbedCode: { type: String, default: "" },
  // Sharing Details
  shares: { type: ShareSchema, default: { type: "public" } },
  responses: { type: [ResponseSchema], default: [] }
});

export const Form = mongoose.model("Form", FormSchema);