const express = require("express")
const multer = require("multer")
const verifyToken = require("../../../middlewares/verifyToken")
const upload = require("../../../middlewares/upload")
const User = require("../../../models/User")
const Book = require("../../../models/Book")

const router = express.Router()

router.post("/addAvailable", verifyToken, upload.array("image"), async (req, res) => {
  const { title, author, genre, tags, description } = req.body

  const photos = req.files.map(file => file.id)

  const book = new Book({
    title,
    author,
    genre,
    tags,
    description,
    photos,
  })

  try {
    const bookSaved = await book.save()
    const user = await User.findByIdAndUpdate(req.userId, {
      $push: { availableBooks: bookSaved._id },
    })
    res.status(200).json({ message: "Book added" })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.post("/addWanted", verifyToken, upload.array("image"), async (req, res) => {
  const { title, author, genre, tags, description, photos } = req.body

  const photos = req.files.map(file => file.id)

  const book = new Book({
    title,
    author,
    genre,
    tags,
    description,
    photos,
  })

  try {
    const bookSaved = await book.save()
    const user = await User.findByIdAndUpdate(req.userId, {
      $push: { wantedBooks: bookSaved._id },
    })
    res.status(200).json({ message: "Book added" })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.get("/available", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const books = await Book.find({ _id: { $in: user.availableBooks } })
    res.status(200).json({ books })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.get("/wanted", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    const books = await Book.find({ _id: { $in: user.wantedBooks } })
    res.status(200).json({ books })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.get("/book/:id", verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
    res.status(200).json({ book })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.delete("/deleteAvailable/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, {
      $pull: { availableBooks: req.params.id },
    })
    res.status(200).json({ message: "Book deleted" })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

router.delete("/deleteWanted/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.userId, {
      $pull: { wantedBooks: req.params.id },
    })
    res.status(200).json({ message: "Book deleted" })
  } catch (err) {
    res.status(500).json({ message: err })
  }
})

module.exports = router
