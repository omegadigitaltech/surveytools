const mongoose = require("mongoose");
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  fieldId: { type: Schema.Types.ObjectId, required: true },
  value: Schema.Types.Mixed,
});

const ResponseSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: "Form", required: true },
  answers: [AnswerSchema],
  submittedAt: { type: Date, default: Date.now },
});

const Response = mongoose.model("Response", ResponseSchema);

module.exports = { ResponseSchema, Response };

 