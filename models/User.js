const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  status: { type: String, default: "created" },
  profilePic: { type: String },
  bio: { type: String },
  availableBooks: [{ type: Schema.Types.ObjectId, ref: "Book" }],
  wantedBooks: [{ type: Schema.Types.ObjectId, ref: "Book" }],
  friendRequests: [{ type: Schema.Types.ObjectId, ref: "FriendRequest" }],
})

const User = mongoose.model("User", UserSchema)
module.exports = User
