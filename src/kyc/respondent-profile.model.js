'use strict';

const mongoose = require('mongoose');

const respondentProfileSchema = new mongoose.Schema({
  userId:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  dateOfBirth:      { type: Date, required: true },
  gender:           { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'], required: true },
  stateOfResidence: { type: String, required: true },
  lgaOfResidence:   { type: String, required: true },
  isStudent:        { type: Boolean, required: true },
}, { timestamps: true });

module.exports = mongoose.model('RespondentProfile', respondentProfileSchema);
