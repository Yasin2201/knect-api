const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendRequestSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: "User" },
    recipient: { type: Schema.Types.ObjectId, ref: "User" },
    friends: { type: Boolean, default: false }
});

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);