const mongoose = require("mongoose");

/**
 * Counter collection used for sequential identifiers.
 */
const counterSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  versionKey: false
});

module.exports = mongoose.model("Counter", counterSchema);
