const express = require("express")
const router = express.Router()
const User = require("../../models/User")
const Book = require("../../models/Book")
const verifyToken = require("../../middlewares/verifyToken")

// this route should return a list of books that the user is interested in (base on his genres)
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId)
  const books = await Book.find({
    owner: { $ne: null },
    $or: [{ genre: { $in: user.genres } }, { tags: { $in: user.tags } }],
  })
  res.status(200).json(books)
})

module.exports = router
