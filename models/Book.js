const mongoose = require("mongoose")
const Schema = mongoose.Schema

const BookSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true, es_indexed: true },
  author: { type: String, required: true, es_indexed: true },
  genre: { type: String, required: true, es_indexed: true },
  tags: [{ type: String, required: true }, { es_indexed: true }],
  description: { type: String, required: true, es_indexed: true },
  photos: [{ type: Schema.Types.ObjectId, required: true }],
})

BookSchema.index({
  title: "text",
  owner: "text",
  author: "text",
  genre: "text",
  tags: "text",
  description: "text",
})

const Book = mongoose.model("Book", BookSchema)
module.exports = Book
