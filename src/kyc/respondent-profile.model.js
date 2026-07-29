'use strict';

const mongoose = require('mongoose');

const respondentProfileSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  dateOfBirth:      { type: Date, required: true },
  gender:           { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'], required: true },
  stateOfResidence: { type: String, required: true },
  lgaOfResidence:   { type: String, required: true },
  isStudent:        { type: Boolean, required: true },

  // Layer 2 additive fields
  surveysCompleted: { type: Number, default: 0 },
  layer2EligibleAt: { type: Date, default: null },
  layer2Completed:  { type: Boolean, default: false },
  educationLevel:   { type: String, enum: ['no_formal', 'primary', 'secondary', 'diploma', 'undergraduate', 'postgraduate'] },
  employmentStatus: { type: String, enum: ['employed', 'self_employed', 'unemployed', 'student', 'retired'] },
  incomeRange:      { type: String, enum: ['below_50k', '50k_150k', '150k_300k', '300k_500k', 'above_500k'] },
  maritalStatus:    { type: String, enum: ['single', 'married', 'divorced', 'widowed', 'prefer_not_to_say'] },
}, { timestamps: true });

module.exports = mongoose.model('RespondentProfile', respondentProfileSchema);
