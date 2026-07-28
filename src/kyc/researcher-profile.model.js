'use strict';

const mongoose = require('mongoose');

const researcherProfileSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  researcherType: { type: String, enum: ['student', 'professional', 'corporate'], required: true },
  // student fields
  institution: String, faculty: String, department: String, matricNumber: String,
  // professional + corporate
  jobTitle: String, organization: String, companyName: String, rcNumber: String, industry: String,
  // resolved tier — set by BE-04
  tier: { type: String, enum: ['Standard', 'Premium', 'Institutional'], default: null },
}, { timestamps: true });

module.exports = mongoose.model('ResearcherProfile', researcherProfileSchema);
