import mongoose from "mongoose";
const { Schema } = mongoose;

const AnswerSchema = new Schema({
  fieldId: { type: Schema.Types.ObjectId, required: true },
  value: Schema.Types.Mixed, // flexible (string, number, array, etc.)
});

export const ResponseSchema = new Schema({
  formId: { type: Schema.Types.ObjectId, ref: "Form", required: true },
  answers: [AnswerSchema],
  email:{
    type:String,
    required:true,
  },
  submittedAt: { type: Date, default: Date.now },
});

export const Response = mongoose.model("Response", ResponseSchema);

 