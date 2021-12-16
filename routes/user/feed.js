const express = require("express")
const router = express.Router()
const User = require("../../models/User")
const Book = require("../../models/Book")
const verifyToken = require("../../middlewares/verifyToken")
const MongoClient = require("mongodb").MongoClient
const dbConfig = require("../../db/connection")

const mongoClient = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ah3vy.mongodb.net`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)

const photosUrl = "http://192.168.1.65:3000/user/profile/photo/"
const filesUrl = "http://192.168.1.65:3000/user/books/files/"

// this route should return a list of books that the user is interested in (base on his genres)
router.get("/", verifyToken, async (req, res) => {
  const user = await User.findById(req.userId)
  const books = await Book.find({
    owner: { $ne: null },
    $or: [{ genre: { $in: user.genres } }, { tags: { $in: user.tags } }],
  }).lean()

  await mongoClient.connect()
  const db = mongoClient.db(dbConfig.dbName)
  const images = db.collection("images.files")
  const booksWithUrlOfImages = await Promise.all(
    books.map(async (book) => {
      const photosUrl = await Promise.all(
        book.photos.map(async (photo) => {
          const image = await images.findOne({ _id: photo })
          return filesUrl + image.filename
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
        ownerPhoto: photosUrl + ownerPhoto.filename,
      }
    })
  )

  res.status(200).json(response)
})

module.exports = router
