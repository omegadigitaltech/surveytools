'use strict';

const mongoose = require('mongoose');

const researcherProfileSchema = new mongoose.Schema({
  userId:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  researcherType: { type: String, enum: ['student', 'professional', 'corporate'], required: true },
  // student fields
  academicStatus: String, institution: String, studentEmail: String, faculty: String, department: String, level: String, matriculationNumber: String, researchTopic: String,
  // professional fields
  title: String, profession: String, areaOfSpecialisation: String, employer: String, workEmail: String, stateOfPractice: String, researchPurpose: String, licenseNo: String,
  // corporate fields
  orgName: String, orgType: String, industry: String, rcNumber: String, orgEmail: String, orgPhone: String, contactName: String, contactRole: String, stateOfOperation: String, billingAddress: String, expectedMonthlySurveys: String,
  // resolved tier — set by BE-04
  tier: { type: String, enum: ['Standard', 'Premium', 'Institutional'], default: null },
}, { timestamps: true });

module.exports = mongoose.model('ResearcherProfile', researcherProfileSchema);
