const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  isVerified: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    default: "active",
  },
});

module.exports = mongoose.model("User", userSchema);

