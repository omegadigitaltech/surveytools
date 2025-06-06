const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Define the redemption history model
const RedemptionHistorySchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["airtime", "data"],
    },
    network: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    pointsRedeemed: {
      type: Number,
      required: true,
    },
    valueReceived: {
      type: Number, // Amount in naira or data size in MB/GB
      required: true,
    },
    planName: {
      type: String, // For data plans
    },
    planId: {
      type: String, // For data plans
    },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
    errorMessage: {
      type: mongoose.Schema.Types.Mixed,
    },
    transactionReference: {
      type: String,
    }
  },
  { timestamps: true }
);

const RedemptionHistory = mongoose.model("RedemptionHistory", RedemptionHistorySchema);

module.exports = {
  RedemptionHistory
}; 