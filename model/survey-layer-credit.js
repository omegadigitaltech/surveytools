const mongoose = require('mongoose');

const surveyLayerCreditSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  userId: { type: String, required: true },
  layer: { type: String, enum: ['layer3', 'layer4', 'layer5'], required: true },
});

surveyLayerCreditSchema.index({ surveyId: 1, userId: 1, layer: 1 }, { unique: true });

module.exports = mongoose.model('SurveyLayerCredit', surveyLayerCreditSchema);
