const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, default: "created" },
  profilePic: { type: Schema.Types.ObjectId, default: null },
  bio: { type: String, default: "" },
  genres: [{ type: String }],
  tags: [{ type: String }],
  availableBooks: [{ type: Schema.Types.ObjectId, ref: "Book", default: [] }],
  wantedBooks: [{ type: Schema.Types.ObjectId, ref: "Book", default: [] }],
  friendRequests: [
    { type: Schema.Types.ObjectId, ref: "FriendRequest", default: [] },
  ],
  friends: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  swapRequests: [
    { type: Schema.Types.ObjectId, ref: "SwapRequest", default: [] },
  ],
  swapNotifications: [
    { type: Schema.Types.ObjectId, ref: "SwapRequest", default: [] },
  ],
  swaps: [{ type: Schema.Types.ObjectId, ref: "Swap", default: [] }],
  contacts: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  phoneNumber: { type: String, required: true },
})

const User = mongoose.model("User", UserSchema)
module.exports = User
