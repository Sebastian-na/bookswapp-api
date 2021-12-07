const mongoose = require("mongoose")
const Schema = mongoose.Schema

const FriendRequestSchema = new Schema({
  requester: { type: Schema.Types.ObjectId, ref: "User", required: true },
  receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
})

FriendRequest = mongoose.model("FriendRequest", FriendRequestSchema)

module.exports = FriendRequest
