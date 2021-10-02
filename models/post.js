const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    text: { type: String, minLength: 1, required: true },
    date: { type: Date, default: Date.now },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("Post", PostSchema);