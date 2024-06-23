const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for survey answers
const answerSchema = new Schema({
  // userId: { type: String, required: true },
  username: { type: String, required: true },
  response: { type: Schema.Types.Mixed, required: true }
});

// Define the schema for survey options
const optionSchema = new Schema({
  // id: { type: String,  required: true},
  text: { type: String,  required: true} 
});

// Define the schema for survey questions
const questionSchema = new Schema({
  // questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  questionType: { type: String, required: true },
  options: [{type: Schema.Types.ObjectId, ref: 'Option'}], // Only for multiple_choice questions
  answers: [{type: Schema.Types.ObjectId, ref: 'Answer'}], // Reference answer documents
  analytics: {
    totalResponses: { type: Number, default: 0 },
    distribution: { type: Map, of: Number }, // Flexible key-value pairs for different types of questions
    averageRating: Number,
    responseRate: String,
    mostCommonResponse: Schema.Types.Mixed, // Flexible to handle different types of responses
    sentimentAnalysis: {
      positive: Number,
      neutral: Number,
      negative: Number
    }
  }
});

// Define the schema for the survey
const surveySchema = new Schema({
    user_id:{
     type: mongoose.Schema.Types.ObjectId,
     required: true
    },
    title: {
     type: String,
     required: true
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
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [{type: Schema.Types.ObjectId, ref: 'Question'}],// reference question documents
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});


// Create the model
const Option = mongoose.model('Option', optionSchema);
const Answer = mongoose.model('Answer', answerSchema);
const Question = mongoose.model('Question', questionSchema);
const Survey = mongoose.model('Survey', surveySchema);


module.exports = {Survey, Question, Answer, Option};
