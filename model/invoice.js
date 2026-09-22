const mongoose = require('mongoose');
const { Schema } = mongoose;

const lineItemSchema = new Schema({
  description: String,
  quantity: Number,
  unitPrice: Number,
  total: Number
}, { _id: false });

const invoiceSchema = new Schema({
  orgUserId: { type: String, required: true },
  surveyIds: [{ type: Schema.Types.ObjectId, ref: 'Survey' }],
  rcNumber: String,
  billingAddress: String,
  poReference: String,
  lineItems: [lineItemSchema],
  amount: { type: Number, required: true },
  issuedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Paid', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
