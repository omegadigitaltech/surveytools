const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new mongoose.Schema(
    {
      userId: String,
      referenceNumber: String,
      amount: Number,
      surveyId: String,
      datePaid: Date,
      email: String,
      status: String, // pending, paid, failed
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
