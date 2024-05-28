const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const UserSchema = new Schema(
  {
    id: {
      type: String,
    },
    type: {
      type: String,
    },
    fullname: {
      type: String,
      required: [true, "Please provide Fullname"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please Provide valid email'
    ],
      unique: true,
    },
    department: {
      type: String,
    },
    password: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false
    },
    code: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
