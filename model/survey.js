const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the options for multiple choice questions
const OptionSchema = new Schema({
  text: { type: String, required: true },
});

// Define the Question Schema
const QuestionSchema = new Schema({
  questionText: { type: String, required: true },
  questionType: { 
    type: String, 
    required: true, 
    enum: ['multiple_choice', 'five_point', 'fill_in'] 
  },
  options: [OptionSchema], // Only used for multiple choice questions
  answer: String, // Used for fill in questions
  createdAt: { type: Date, default: Date.now },
});

const SurveySchema = new Schema(
  {
   user_id:{
    type: mongoose.Schema.Types.ObjectId,
    required: true
   },
   title: {
    type: String,
    required: true
   },
   description: {
    type: String,
   },
   participants: {
    type: Number,
    default: 0
   },
   point: {
    type: String,
   },
   duration:{
    type: Number,
   },
   preferred_participants: {
    type: Array,
   },
   max_participant: {
    type: Number,
   },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  }
);

module.exports = mongoose.model("Survey", SurveySchema);
