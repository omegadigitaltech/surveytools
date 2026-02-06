// models/TelecomCatalog.js
const mongoose = require ("mongoose");
const { Schema } = mongoose;

const DataPlanSchema = new Schema({
  planId: String,          // your internal ID e.g. MTN_1GB
  name: String,            // 1GB Daily
  size: String,            // 1GB
  price: Number,
  itemCode: String,        // Flutterwave item_code
});

const NetworkSchema = new Schema({
  network: {
    type: String,
    enum: ["MTN", "AIRTEL", "GLO", "9MOBILE"],
    unique: true,
  },

  flutterwave: {
    airtime: {
      type: String,        // AIRTIME-MTN
    },

    data: {
      billerCode: String,
      plans: [DataPlanSchema],
    },
  },

  updatedAt: Date,
});

module.exports =  mongoose.model("TelecomCatalog", NetworkSchema);
