const mongoose = require("mongoose")
const Schema = mongoose.Schema

const SwapRequestSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookRequested: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  bookOffered: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  status: { type: String, default: "pending" },
})

const SwapRequest = mongoose.model("SwapRequest", SwapRequestSchema)

module.exports = SwapRequest
