
// preferredparticpants
// frontend layer for dept check// checkSurveyPublished
// test for correct sturture and avoidance of server error or stopage

// midle ware that checks that the participants as submited the survey, and also that checks the max_participation
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the schema for survey answers
const answerSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  fullname: { type: String, required: [true, "Username is required"] },
  response: { type: String, required: [true, "Response field is required"] }
});

// Define the schema for survey options
const optionSchema = new Schema({
  text: { type: String,  required: [true, "Option text is required"]} 
});

// Define the schema for survey questions
const questionSchema = new Schema({
  questionText: { type: String, required: [true, "Question Text is required"] },
  questionType: { type: String, required: [true, "Question Type is required"], enum: {
    values: ['multiple_choice', 'five_point', 'fill_in'],
    message: 'Question type must be either "multiple_choice", "five_point", or "fill_in"'
  }},
  required: { type: Boolean, default: false },
  options: {
    type:[optionSchema], // Only for multiple_choice questions
    validate: {
      validator: function(options) {
        if (this.questionType === 'multiple_choice') {
          return options && options.length > 0;
        }
        return true;
      },
      message: 'Options are required for multiple_choice questions'
    }
  },
  answers: [answerSchema], // Reference answer documents
  analytics: {
    totalResponses: { type: Number, default: 0 },
    distribution: { type: Map, of: Number }, // Flexible key-value pairs for different types of questions
    averageRating: {
      type: Number,
      default: 0
    },
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
      ref: 'User',
      required: [true, "User ID is required"]
    },
    title: {
     type: String,
     required: [true, "Title field is required"]
    },
    no_of_participants: {
     type: Number,
     default: 0
    },
    gender: {
     type: String,
     required: [true, "Gender is required"]
    },
    preferred_participants: {
     type: Array,
     required: [true, "Preferred participants is required"]
    },
    amount_to_be_paid: {
     type: Number,
    },
    point_per_user: {
      type:Number,
    },
    description: { type: String, required: [true, "Description Field is required"]},
    submittedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Track users who submitted the survey
    questions: [questionSchema],// reference question documents
    published: { type: Boolean, default: false },
    link: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Create an index on questions.questionId
surveySchema.index({ 'questions.questionId': 1 });

const Survey = mongoose.model('Survey', surveySchema);


module.exports = {Survey};
