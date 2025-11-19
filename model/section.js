const mongoose = require('mongoose');
const { Schema } = mongoose;

const sectionSchema = new Schema({
  surveyId: { type: Schema.Types.ObjectId, ref: 'Survey', required: true },
  title: { type: String, required: true },
  description: { type: String },
  order: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Section', sectionSchema);