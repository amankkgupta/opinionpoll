const mongoose = require("mongoose");
const voteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  debateId: { type: mongoose.Schema.Types.ObjectId, ref: "Debate" },
  voteIdx: { type: Number },
});

module.exports = mongoose.model("Votes", voteSchema);
