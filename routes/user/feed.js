const express = require("express")
const router = express.Router()
const User = require("../../models/User")
const Book = require("../../models/Book")
const verifyToken = require("../../middlewares/verifyToken")
const { mongoClient } = require("../../db/connection")
const { FILES_URL } = require("../../constants/index")

// this route should return a list of books that the user is interested in (base on his genres)
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId)
  const books = await Book.find({
    owner: { $ne: null },
    $or: [{ genre: { $in: user.genres } }, { tags: { $in: user.tags } }],
  }).lean()

  await mongoClient.connect()
  const images = mongoClient.db().collection("images.files")
  const booksWithUrlOfImages = await Promise.all(
    books.map(async (book) => {
      const photosUrl = await Promise.all(
        book.photos.map(async (photo) => {
          const image = await images.findOne({ _id: photo })
          return FILES_URL + image.filename
        })
      )
      return { ...book, photos: photosUrl }
    })
  )

  //search books wanted by every book owner
  const response = await Promise.all(
    booksWithUrlOfImages.map(async (book) => {
      const owner = await User.findById(book.owner)
      const wantedBooks = await Promise.all(
        owner.wantedBooks.map(async (bookId) => {
          return await Book.findById(bookId)
        })
      )
      const ownerPhoto = await images.findOne({ _id: owner.profilePic })

      return {
        ...book,
        wantedBooks: wantedBooks,
        ownerName: owner.name,
        ownerPhoto: FILES_URL + ownerPhoto.filename,
      }
    })
  )

  res.status(200).json(response)
})

router.get("/post", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId)
  const book = await Book.findById(req.query.id).lean()

  await mongoClient.connect()
  const images = mongoClient.db().collection("images.files")
  const bookWithUrlOfImages = await Promise.all(
    book.photos.map(async (photo) => {
      const image = await images.findOne({ _id: photo })
      return FILES_URL + image.filename
    })
  )

  const owner = await User.findById(book.owner)
  const ownerPhoto = await images.findOne({ _id: owner.profilePic })

  //get wanted books by owner
  const wantedBooks = await Promise.all(
    owner.wantedBooks.map(async (bookId) => {
      return await Book.findById(bookId)
    })
  )

  const response = {
    ...book,
    wantedBooks,
    photos: bookWithUrlOfImages,
    ownerName: owner.name,
    ownerPhoto: FILES_URL + ownerPhoto.filename,
  }

  res.status(200).json(response)
})

module.exports = router
