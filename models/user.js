const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    profilePicUrl: { type: String },
    friends: [{ type: Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model('User', UserSchema);