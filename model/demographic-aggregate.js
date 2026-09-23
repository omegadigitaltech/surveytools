const mongoose = require('mongoose');

const demographicAggregateSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  layer: { type: String, enum: ['layer3', 'layer4', 'layer5'], required: true },
  field: { type: String, required: true },
  value: { type: String, required: true },
  count: { type: Number, default: 0 },
});

demographicAggregateSchema.index({ surveyId: 1, layer: 1, field: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('DemographicAggregate', demographicAggregateSchema);
