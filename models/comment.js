const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: "Post" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    username: { type: String, required: true },
    text: { type: String, minLength: 1, required: true },
    date: { type: Date, default: Date.now },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Comment", CommentSchema);