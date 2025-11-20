const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ResponseSchema } = require("./response.js");

//
// ---------------------------
// FIELD SCHEMA (Question types)
// ---------------------------
//
const FieldSchema = new Schema({
  questionText: { type: String, required: true },

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
      "multiple-choice",
      "likert"           // NEW: Likert Scale
    ],
    required: true
  },

  required: { type: Boolean, default: false },

  // For select, checkbox, radio, multiple-choice
  options: [{ type: String }],

  //
  // Likert Scale Structure
  //
  likert: {
    statement: { type: String }, // optional extra description for item
    scale: [
      {
        value: Number,     // 1–5 or 1–7 etc
        label: String      // Strongly Agree, Agree, Neutral...
      }
    ]
  }
});


//
// ---------------------------
// SECTION SCHEMA
// ---------------------------
//
const SectionSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String }, // optional
  fields: [FieldSchema]          // fields inside this section
});


//
// ---------------------------
// SHARING SCHEMA
// ---------------------------
//
const ShareSchema = new Schema({
  type: { type: String, enum: ["public", "private"], default: "public" },
  emails: [{ type: String }],
  userIds: [{ type: Schema.Types.ObjectId, ref: "User" }]
});


//
// ---------------------------
// MAIN FORM SCHEMA
// ---------------------------
//
const FormSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },

  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },

  backgroundColor: { type: String },
  fontFamily: { type: String },

  config: {
    time: { type: String },
    point: { type: String },
    totalRequiredParticipants: { type: String },
    preferredParticipants: { type: String },
    totalParticipants: { type: String }
  },

  //
  // NEW: Replace fields[] with sections[]
  //
  sections: [SectionSchema],

  shareLink: { type: String, default: "" },
  htmlEmbedCode: { type: String, default: "" },

  shares: { type: ShareSchema, default: { type: "public" } },

  responses: { type: [ResponseSchema], default: [] }
});

module.exports = mongoose.model("Form", FormSchema);
