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
    age: {
      type: Number,
    },
    gender: {
      type: String,
      required: [true, "Please provide gender"],
    },
    department: {
      type: String,
      required: [true, "Please provide department"]
    },
    faculty: {
      type: String,
      required: [true, "Please provide faculty"]
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
    instituition: {
      type: String,
      required: [true, "Please provide an instituition"]
    },
    bio: {
      type: String
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
    },
    pointBalance: {
      type: Number,
      default: 0
    },
    admin: {
      type: Boolean,
      default: false
    },
    pic_url: {
      type: String
    },
    // Password reset fields
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    notification_settings: {
      email: {
        type: [String],
        enum: {
          values: ['comment', 'new_surveys', 'others'],
          message: 'Invalid email type'
        }
      },
      push_notification: {
        type: [String],
        enum: {
          values: ['all', 'email', 'no'],
          message: 'Invalid push notification type'
        }
      }
    } // set permission from users
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
