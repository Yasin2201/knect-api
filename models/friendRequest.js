const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequestSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: "User" },
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: Number, required: true }
});

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);