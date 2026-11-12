'use strict';

const mongoose = require('mongoose');

const Platform = Object.freeze({
  TYPEFORM:     'typeform',
  TALLY:        'tally',
  CSV_IMPORT:   'csv_import',
  GOOGLE_FORMS: 'google_forms',
});

const Status = Object.freeze({
  ACTIVE:  'active',
  PAUSED:  'paused',
  ERROR:   'error',
});

const NormalizedQuestionSchema = new mongoose.Schema({
  ref:      { type: String, required: true },
  label:    { type: String, required: true },
  type:     { type: String, required: true },
  required: { type: Boolean, default: false },
  options:  [{ type: String }],
}, { _id: false });

const ExternalFormSchema = new mongoose.Schema(
  {
    researcherId:            { type: String, required: true, index: true },
    platform:                { type: String, enum: Object.values(Platform), required: true },
    platformFormId:          { type: String, required: true },
    originalUrl:             { type: String, required: true },
    title:                   { type: String, default: '' },
    description:             { type: String, default: '' },
    questions:               { type: [NormalizedQuestionSchema], default: [] },
    snapshotResponseCount:   { type: Number, default: 0 },
    postImportResponseCount: { type: Number, default: 0 },
    lastPolledAt:            { type: Date, default: null },
    respondentIdFieldRef:    { type: String, default: null },
    status:                  { type: String, enum: Object.values(Status), default: Status.ACTIVE },
  },
  { timestamps: true }
);

ExternalFormSchema.index({ researcherId: 1, platform: 1 });
ExternalFormSchema.index({ researcherId: 1, platformFormId: 1, platform: 1 }, { unique: true });

const ExternalForm = mongoose.model('ExternalForm', ExternalFormSchema);

module.exports = { ExternalForm, Platform, Status };
