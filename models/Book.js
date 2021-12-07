const mongoose = require("mongoose")
const Schema = mongoose.Schema

const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  genre: { type: String, required: true },
  tags: [{ type: String, required: true }],
  description: { type: String, required: true },
  photos: [{ type: String, required: true }],
})

Book = mongoose.model("Book", BookSchema)
module.exports = Book
