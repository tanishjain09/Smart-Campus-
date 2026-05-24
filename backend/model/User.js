const mongoose = require("mongoose");
const { DEPARTMENTS } = require("../constants/issueConstants");

/**
 * Application user schema for students, staff, and admins.
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 80
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"]
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ["student", "staff", "admin"],
    default: "student"
  },

  department: {
    type: String,
    enum: DEPARTMENTS,
    default: "administration"
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.password;
      return ret;
    }
  }
});

module.exports = mongoose.model("User", userSchema);
