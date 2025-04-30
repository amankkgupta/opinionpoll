const mongoose = require("mongoose");
const CommentSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  debateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Debate",
    required: true,
  },
  comment: { type: String, required: true },
  removed:{type: Boolean, default: false},
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  createdOn: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);
