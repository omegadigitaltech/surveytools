'use strict';

const mongoose = require('mongoose');

const encryptedFieldSchema = new mongoose.Schema({
  encryptedData: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
}, { _id: false });

const respondentProfileSchema = new mongoose.Schema({
  userId:           { type: String, ref: 'User', required: true, unique: true, index: true },
  phoneNumber:      { type: String, required: true },
  dateOfBirth:      { type: Date, required: true },
  gender:           { type: String, enum: ['male', 'female', 'non-binary', 'prefer-not-to-say'], required: true },
  stateOfOrigin:    { type: String },
  stateOfResidence: { type: String, required: true },
  lgaOfResidence:   { type: String, required: true },
  isStudent:        { type: Boolean, required: true },
  // Layer 1 - Student conditional fields
  academicLevel:    { type: String },
  levelOfStudy:     { type: String },
  institution:      { type: String },
  faculty:          { type: String },
  department:       { type: String },
  
  // Layer 2
  surveysCompleted: { type: Number, default: 0 },
  layer2EligibleAt: { type: Date, default: null },
  layer2Completed:  { type: Boolean, default: false },
  // Non-student conditional Layer 2
  professionalOccupation: { type: String },
  employmentSector: { type: String },
  graduateStatus:   { type: String },
  // Student conditional Layer 2
  studentEmail:     { type: String },
  matriculationNumber: { type: String },

  // Legacy Layer 2 (from placeholder PR)
  educationLevel:   { type: String },
  employmentStatus: { type: String },
  incomeRange:      { type: String },
  maritalStatus:    { type: String },

  layer3: { type: encryptedFieldSchema, default: null },
  layer4: { type: encryptedFieldSchema, default: null },
  layer5: { type: encryptedFieldSchema, default: null },
}, { timestamps: true });

module.exports = mongoose.model('RespondentProfile', respondentProfileSchema);
