const paymentSchema = new mongoose.Schema(
    {
      userId: String,
      referenceNumber: String,
      amount: Number,
      surveyId: String,
      datePaid: Date,
      email: String,
    },
    { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);