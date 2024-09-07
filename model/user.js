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
    sex: {
      type: String,
      enum: {
        values: ['male', 'female', 'other'],
        message: 'Invalid sex type'
      }
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
    pic_url: {
      type: String
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
